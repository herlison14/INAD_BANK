
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Contract, AppNotification, Task, TaskStatus, User, UserRole, AuditLog, AutomationRule, AutomationLog, ActionType } from '../types';

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
  upsertDatabase: (newContracts: Contract[], fileSignature: string, origin?: 'Geral' | 'Cartoes') => { success: boolean };
  importContracts: (newContracts: Contract[]) => ImportSyncResult;
  executarVarreduraCredito: () => number;
  clearDatabase: () => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  triggerManualSync: () => void;
  automationRules: AutomationRule[];
  automationLogs: AutomationLog[];
  toggleAutomationRule: (ruleId: string) => void;
  createAutomationRule: (rule: AutomationRule) => void;
  deleteAutomationRule: (ruleId: string) => void;
  addAutomationLog: (log: Omit<AutomationLog, 'id'>) => void;
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
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>(() => {
    const saved = localStorage.getItem('sicoob_automation_rules');
    return saved ? JSON.parse(saved) : [];
  });
  const [automationLogs, setAutomationLogs] = useState<AutomationLog[]>(() => {
    const saved = localStorage.getItem('sicoob_automation_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const isSyncing = syncStatus === 'syncing';

  const lastUpdateTimestamp = useMemo(() => {
    if (allContracts.length === 0) return null;
    return lastGeralUpdate || lastCartoesUpdate;
  }, [lastGeralUpdate, lastCartoesUpdate, allContracts.length]);

  useEffect(() => {
    localStorage.setItem(DB_KEY, JSON.stringify(allContracts));
  }, [allContracts]);

  useEffect(() => {
    localStorage.setItem('sicoob_automation_rules', JSON.stringify(automationRules));
  }, [automationRules]);

  useEffect(() => {
    localStorage.setItem('sicoob_automation_logs', JSON.stringify(automationLogs));
  }, [automationLogs]);

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
    localStorage.removeItem(DB_KEY);
    localStorage.setItem(APP_INITIALIZED_KEY, 'true');
    addAuditLog('SISTEMA', 'HARD RESET', 'Protocolo de limpeza total executado. Dashboard zerado.');
  }, [addAuditLog]);

  const upsertDatabase = useCallback((newContracts: Contract[], fileSignature: string, origin: 'Geral' | 'Cartoes' = 'Geral') => {
    setSyncStatus('syncing');
    const now = new Date().toLocaleString('pt-BR');

    setAllContracts(prev => {
      const otherContracts = prev.filter(c => c.originSheet !== origin);
      return [...otherContracts, ...newContracts];
    });

    setImportHashes(prev => [...prev, fileSignature]);
    setSyncStatus('online');
    setAiAnalysis(null);

    if (origin === 'Cartoes') setLastCartoesUpdate(now);
    else setLastGeralUpdate(now);

    addAuditLog('SISTEMA', 'IMPORTAÇÃO', `Carga de ${newContracts.length} registros via canal ${origin} concluída.`);
    
    return { success: true };
  }, [addAuditLog]);

  const updateTaskStatus = useCallback((id: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  }, []);

  const toggleAutomationRule = useCallback((ruleId: string) => {
    setAutomationRules(prev => prev.map(r => r.id === ruleId ? { ...r, active: !r.active } : r));
  }, []);

  const createAutomationRule = useCallback((rule: AutomationRule) => {
    setAutomationRules(prev => [rule, ...prev]);
  }, []);

  const deleteAutomationRule = useCallback((ruleId: string) => {
    setAutomationRules(prev => prev.filter(r => r.id !== ruleId));
  }, []);

  const addAutomationLog = useCallback((log: Omit<AutomationLog, 'id'>) => {
    const newLog: AutomationLog = { ...log, id: `alog-${Date.now()}` };
    setAutomationLogs(prev => [newLog, ...prev].slice(0, 1000));
  }, []);

  const executarVarreduraCredito = useCallback(() => {
    if (allContracts.length === 0 || automationRules.length === 0) return 0;

    let actionsCount = 0;
    const activeRules = automationRules.filter(r => r.active);
    
    const newTasks: Task[] = [];
    const newNotifications: AppNotification[] = [];
    const newLogs: Omit<AutomationLog, 'id'>[] = [];

    allContracts.forEach(contract => {
      activeRules.forEach(rule => {
        // Check conditions
        const match = rule.conditions.every(cond => {
          const val = contract[cond.field];
          if (val === undefined) return false;

          switch (cond.operator) {
            case '>': return Number(val) > Number(cond.value);
            case '<': return Number(val) < Number(cond.value);
            case '==': return String(val) === String(cond.value);
            case '!=': return String(val) !== String(cond.value);
            case '>=': return Number(val) >= Number(cond.value);
            case 'contains': return String(val).toLowerCase().includes(String(cond.value).toLowerCase());
            case 'not_contains': return !String(val).toLowerCase().includes(String(cond.value).toLowerCase());
            default: return false;
          }
        });

        if (match) {
          rule.actions.forEach(action => {
            const message = action.template
              .replace('[ClientName]', contract.clientName)
              .replace('[ID]', contract.id)
              .replace('[SaldoDevedor]', contract.saldoDevedor.toLocaleString('pt-BR'))
              .replace('[DiasAtraso]', contract.daysOverdue.toString())
              .replace('[Produto]', contract.product)
              .replace('[Gerente]', contract.gerente);

            if (action.type === ActionType.CREATE_TASK) {
              newTasks.push({
                id: `AUTO-${rule.id}-${contract.id}-${Date.now()}`,
                contractId: contract.id,
                contractClient: contract.clientName,
                managerEmail: contract.managerEmail,
                description: message,
                status: TaskStatus.Pendente,
                priority: (contract.daysOverdue > 60 ? 1 : 2) as 1 | 2,
                creationDate: new Date().toLocaleString('pt-BR'),
                aiScore: 85
              });
            } else if (action.type === ActionType.CREATE_NOTIFICATION) {
              newNotifications.push({
                id: `ANOT-${rule.id}-${contract.id}-${Date.now()}`,
                managerEmail: contract.managerEmail,
                type: 'SISTEMA',
                message: message,
                timestamp: new Date().toLocaleString('pt-BR'),
                read: false
              });
            }

            newLogs.push({
              timestamp: new Date().toISOString(),
              ruleId: rule.id,
              ruleName: rule.name,
              contractId: contract.id,
              contractClient: contract.clientName,
              actionType: action.type,
              description: `Executado para ${contract.clientName}: ${message}`
            });
            
            actionsCount++;
          });
        }
      });
    });

    if (newTasks.length > 0) {
      setTasks(prev => {
        const ids = new Set(prev.map(t => t.id));
        const filtered = newTasks.filter(t => !ids.has(t.id));
        return [...filtered, ...prev].slice(0, 1000);
      });
    }

    if (newNotifications.length > 0) {
      setNotifications(prev => {
        const ids = new Set(prev.map(n => n.id));
        const filtered = newNotifications.filter(n => !ids.has(n.id));
        return [...filtered, ...prev].slice(0, 500);
      });
    }

    if (newLogs.length > 0) {
      newLogs.forEach(log => addAutomationLog(log));
    }

    return actionsCount;
  }, [allContracts, automationRules, addAutomationLog, setNotifications, setTasks]);

  const importContracts = useCallback((newContracts: Contract[]): ImportSyncResult => {
    setSyncStatus('syncing');
    
    let inserted = 0;
    let duplicates = 0;
    
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
      return [...prev, ...filtered];
    });

    const tasksGenerated = executarVarreduraCredito();
    const notificationsGenerated = 0;

    setSyncStatus('online');
    addAuditLog('SISTEMA', 'IMPORTAÇÃO', `Carga de ${inserted} novos registros concluída.`);
    
    return { inserted, duplicates, tasksGenerated, notificationsGenerated };
  }, [addAuditLog, executarVarreduraCredito]);

  const value = useMemo(() => ({
    allContracts, notifications, setNotifications, tasks, setTasks, users, auditLogs, importHashes, syncStatus, isSyncing,
    lastGeralUpdate, lastCartoesUpdate, lastUpdateTimestamp, aiAnalysis, setAiAnalysis, setUsers, addAuditLog, 
    upsertDatabase, importContracts, executarVarreduraCredito, clearDatabase, updateTaskStatus, triggerManualSync,
    automationRules, automationLogs, toggleAutomationRule, createAutomationRule, deleteAutomationRule, addAutomationLog
  }), [allContracts, notifications, tasks, users, auditLogs, importHashes, syncStatus, isSyncing, lastGeralUpdate, lastCartoesUpdate, lastUpdateTimestamp, aiAnalysis, upsertDatabase, importContracts, executarVarreduraCredito, clearDatabase, updateTaskStatus, addAuditLog, triggerManualSync, automationRules, automationLogs, toggleAutomationRule, createAutomationRule, deleteAutomationRule, addAutomationLog]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
