
"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Contract, AppNotification, Task, TaskStatus, User, UserRole, AuditLog } from '../types';

export interface ImportSyncResult {
  inserted: number;
  duplicates: number;
  tasksGenerated: number;
  notificationsGenerated: number;
}

interface AppContextType {
  allContracts: Contract[];
  notifications: AppNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  users: User[];
  auditLogs: AuditLog[];
  importHashes: string[];
  syncStatus: 'online' | 'syncing' | 'offline';
  isSyncing: boolean;
  lastGeralUpdate: string | null;
  lastCartoesUpdate: string | null;
  lastUpdateTimestamp: string | null;
  aiAnalysis: string | null;
  setAiAnalysis: React.Dispatch<React.SetStateAction<string | null>>;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  addAuditLog: (userEmail: string, action: string, details: string) => void;
  upsertDatabase: (newContracts: Contract[], fileSignature: string, origin?: 'Geral' | 'Cartoes') => ImportSyncResult;
  importContracts: (newContracts: Contract[]) => ImportSyncResult;
  executarVarreduraCredito: (contractsToScan?: Contract[]) => number;
  clearDatabase: () => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  triggerManualSync: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DB_KEY = 'sicoob_db_recovery_v6';
const APP_INITIALIZED_KEY = 'sicoob_app_initialized';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allContracts, setAllContracts] = useState<Contract[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedContracts = localStorage.getItem(DB_KEY);
      if (savedContracts) {
        try {
          const parsed = JSON.parse(savedContracts);
          if (Array.isArray(parsed)) setAllContracts(parsed);
        } catch (e) {
          console.error("Error parsing contracts", e);
        }
      }

      const savedUsers = localStorage.getItem('sicoob_db_users_v6');
      const defaultAdmin: User = { 
        id: 'admin-master', 
        role: UserRole.Admin, 
        name: 'ADMINISTRADOR MASTER', 
        email: 'admin@admin', 
        pa: 'GLOBAL', 
        password: '123' 
      };
      if (!savedUsers) {
        setUsers([defaultAdmin]);
      } else {
        try {
          setUsers(JSON.parse(savedUsers));
        } catch (e) {
          setUsers([defaultAdmin]);
        }
      }
    }
  }, []);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [importHashes, setImportHashes] = useState<string[]>([]);
  const [lastGeralUpdate, setLastGeralUpdate] = useState<string | null>(null);
  const [lastCartoesUpdate, setLastCartoesUpdate] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [syncStatus, setSyncStatus] = useState<'online' | 'syncing' | 'offline'>('online');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  const isSyncing = syncStatus === 'syncing';

  const lastUpdateTimestamp = useMemo(() => {
    if (allContracts.length === 0) return null;
    return lastGeralUpdate || lastCartoesUpdate;
  }, [lastGeralUpdate, lastCartoesUpdate, allContracts.length]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DB_KEY, JSON.stringify(allContracts));
    }
  }, [allContracts]);

  const addAuditLog = useCallback((userEmail: string, action: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      userEmail,
      action,
      details,
      timestamp: new Date().toLocaleString('pt-BR')
    };
    setAuditLogs(prev => [newLog, ...prev].slice(0, 500)); 
  }, []);

  const triggerManualSync = useCallback(() => {
    addAuditLog('SISTEMA', 'SYNC MANUAL', 'Sincronização forçada pelo usuário.');
    setSyncStatus('syncing');
    setTimeout(() => setSyncStatus('online'), 1000);
  }, [addAuditLog]);

  const clearDatabase = useCallback(() => {
    setAllContracts([]);
    setTasks([]);
    setNotifications([]);
    setImportHashes([]);
    setLastGeralUpdate(null);
    setLastCartoesUpdate(null);
    setAiAnalysis(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(DB_KEY);
      localStorage.setItem(APP_INITIALIZED_KEY, 'true');
    }
    addAuditLog('SISTEMA', 'HARD RESET', 'Protocolo de limpeza total executado. Dashboard zerado.');
  }, [addAuditLog]);

  const executarVarreduraCredito = useCallback((contractsToScan?: Contract[]) => {
    const targetContracts = contractsToScan || allContracts;
    
    const contratosCriticos = targetContracts
      .filter(c => c.saldoDevedor > 0 && c.daysOverdue > 0)
      .sort((a, b) => {
        const scoreA = a.saldoDevedor * a.daysOverdue;
        const scoreB = b.saldoDevedor * b.daysOverdue;
        return scoreB - scoreA;
      });

    const novasTarefasIA = contratosCriticos.slice(0, 10).map(contrato => ({
      id: `AUTO-${contrato.id}-${Date.now()}`,
      contractId: contrato.id,
      contractClient: contrato.clientName,
      managerEmail: contrato.managerEmail,
      description: `[VARREDURA AUTOMÁTICA] Risco Crítico Identificado: R$ ${contrato.saldoDevedor.toLocaleString('pt-BR')} em atraso há ${contrato.daysOverdue} dias. Ação imediata requerida para recuperação de ativos no PA ${contrato.pa}.`,
      status: TaskStatus.Pendente,
      priority: (contrato.daysOverdue > 60 ? 1 : 2) as 1 | 2,
      creationDate: new Date().toLocaleString('pt-BR'),
      aiScore: 99
    }));

    setTasks(prev => {
      const idsExistentes = new Set(prev.map(t => t.id));
      const unicas = novasTarefasIA.filter(t => !idsExistentes.has(t.id));
      return [...unicas, ...prev];
    });

    return novasTarefasIA.length;
  }, [allContracts]);

  const importContracts = useCallback((newContracts: Contract[]): ImportSyncResult => {
    setSyncStatus('syncing');
    
    let inserted = 0;
    let duplicates = 0;
    let finalContracts: Contract[] = [];
    
    setAllContracts(prev => {
      const existingIds = new Set(prev.map(c => c.id));
      const filtered = newContracts.filter(c => {
        if (existingIds.has(c.id)) {
          duplicates++;
          return false;
        }
        inserted++;
        return true;
      });
      finalContracts = [...prev, ...filtered];
      return finalContracts;
    });

    const tasksGenerated = executarVarreduraCredito(newContracts); // Scan the new ones
    const notificationsGenerated = 0;

    setSyncStatus('online');
    addAuditLog('SISTEMA', 'IMPORTAÇÃO', `Carga de ${inserted} novos registros concluída.`);
    
    return { inserted, duplicates, tasksGenerated, notificationsGenerated };
  }, [addAuditLog, executarVarreduraCredito]);

  const upsertDatabase = useCallback((newContracts: Contract[], fileSignature: string, origin: 'Geral' | 'Cartoes' = 'Geral'): ImportSyncResult => {
    setSyncStatus('syncing');
    const now = new Date().toLocaleString('pt-BR');
    let finalContracts: Contract[] = [];

    setAllContracts(prev => {
      const otherContracts = prev.filter(c => c.originSheet !== origin);
      finalContracts = [...otherContracts, ...newContracts];
      return finalContracts;
    });

    setImportHashes(prev => [...prev, fileSignature]);
    setSyncStatus('online');
    setAiAnalysis(null);

    if (origin === 'Cartoes') setLastCartoesUpdate(now);
    else setLastGeralUpdate(now);

    addAuditLog('SISTEMA', 'IMPORTAÇÃO', `Carga de ${newContracts.length} registros via canal ${origin} concluída.`);
    
    // Dispara varredura usando os novos contratos para evitar estado obsoleto
    const tasksGenerated = executarVarreduraCredito(newContracts);
    
    return { 
      inserted: newContracts.length, 
      duplicates: 0, 
      tasksGenerated, 
      notificationsGenerated: 0 
    };
  }, [addAuditLog, executarVarreduraCredito]);

  const updateTaskStatus = useCallback((id: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  }, []);

  const value = useMemo(() => ({
    allContracts, notifications, setNotifications, tasks, setTasks, users, auditLogs, importHashes, syncStatus, isSyncing,
    lastGeralUpdate, lastCartoesUpdate, lastUpdateTimestamp, aiAnalysis, setAiAnalysis, setUsers, addAuditLog, 
    upsertDatabase, importContracts, executarVarreduraCredito, clearDatabase, updateTaskStatus, triggerManualSync
  }), [allContracts, notifications, tasks, users, auditLogs, importHashes, syncStatus, isSyncing, lastGeralUpdate, lastCartoesUpdate, lastUpdateTimestamp, aiAnalysis, upsertDatabase, importContracts, executarVarreduraCredito, clearDatabase, updateTaskStatus, addAuditLog, triggerManualSync]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
