
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Contract, AppNotification, Task, TaskStatus, User, UserRole, AuditLog } from '../types';

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
  lastGeralUpdate: string | null;
  lastCartoesUpdate: string | null;
  lastUpdateTimestamp: string | null;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  addAuditLog: (userEmail: string, action: string, details: string) => void;
  upsertDatabase: (newContracts: Contract[], fileSignature: string, origin?: 'Geral' | 'Cartoes') => { success: boolean };
  clearDatabase: () => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  triggerManualSync: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DB_KEY = 'sicoob_db_recovery_v6';
const APP_INITIALIZED_KEY = 'sicoob_app_initialized';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allContracts, setAllContracts] = useState<Contract[]>(() => {
    const saved = localStorage.getItem(DB_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        return [];
      }
    }
    return []; 
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('sicoob_db_users_v6');
    const defaultAdmin: User = { 
      id: 'admin-master', 
      role: UserRole.Admin, 
      name: 'ADMINISTRADOR MASTER', 
      email: 'admin@admin', 
      pa: 'GLOBAL', 
      password: '123' 
    };
    if (!saved) return [defaultAdmin];
    return JSON.parse(saved);
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [importHashes, setImportHashes] = useState<string[]>([]);
  const [lastGeralUpdate, setLastGeralUpdate] = useState<string | null>(null);
  const [lastCartoesUpdate, setLastCartoesUpdate] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [syncStatus, setSyncStatus] = useState<'online' | 'syncing' | 'offline'>('online');

  const lastUpdateTimestamp = useMemo(() => {
    if (allContracts.length === 0) return null;
    return lastGeralUpdate || lastCartoesUpdate;
  }, [lastGeralUpdate, lastCartoesUpdate, allContracts.length]);

  useEffect(() => {
    localStorage.setItem(DB_KEY, JSON.stringify(allContracts));
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
    localStorage.removeItem(DB_KEY);
    localStorage.setItem(APP_INITIALIZED_KEY, 'true');
    addAuditLog('SISTEMA', 'HARD RESET', 'Protocolo de limpeza total executado. Dashboard zerado.');
  }, [addAuditLog]);

  const upsertDatabase = useCallback((newContracts: Contract[], fileSignature: string, origin: 'Geral' | 'Cartoes' = 'Geral') => {
    setSyncStatus('syncing');
    const now = new Date().toLocaleString('pt-BR');
    const isoNow = new Date().toISOString();

    setAllContracts(prev => {
      // Mantém contratos da outra planilha e substitui apenas os da planilha atual
      const otherContracts = prev.filter(c => c.originSheet !== origin);
      return [...otherContracts, ...newContracts];
    });

    setImportHashes(prev => [...prev, fileSignature]);
    setSyncStatus('online');

    if (origin === 'Cartoes') setLastCartoesUpdate(now);
    else setLastGeralUpdate(now);

    addAuditLog('SISTEMA', 'IMPORTAÇÃO', `Carga de ${newContracts.length} registros via canal ${origin} concluída.`);
    
    return { success: true };
  }, [addAuditLog]);

  const updateTaskStatus = useCallback((id: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  }, []);

  const value = useMemo(() => ({
    allContracts, notifications, setNotifications, tasks, setTasks, users, auditLogs, importHashes, syncStatus, 
    lastGeralUpdate, lastCartoesUpdate, lastUpdateTimestamp, setUsers, addAuditLog, 
    upsertDatabase, clearDatabase, updateTaskStatus, triggerManualSync
  }), [allContracts, notifications, tasks, users, auditLogs, importHashes, syncStatus, lastGeralUpdate, lastCartoesUpdate, lastUpdateTimestamp, upsertDatabase, clearDatabase, updateTaskStatus, addAuditLog, triggerManualSync]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
