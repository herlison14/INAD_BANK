import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Contract, AppNotification, Task, TaskStatus, User, UserRole, AuditLog, ViewName, VIEWS, AppFilters } from '../types';
import { useDebounce } from '../hooks/useDebounce';

export interface ImportSyncResult {
  inserted: number;
  duplicates: number;
  tasksGenerated: number;
  notificationsGenerated: number;
}

interface AppContextType {
  // Data
  allContracts: Contract[];
  notifications: AppNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  users: User[];
  auditLogs: AuditLog[];
  importHashes: string[];
  
  // Status
  syncStatus: 'online' | 'syncing' | 'offline';
  isSyncing: boolean;
  lastGeralUpdate: string | null;
  lastCartoesUpdate: string | null;
  lastPrejuizoUpdate: string | null;
  lastUpdateTimestamp: string | null;
  
  // Auth
  isAuthenticated: boolean;
  loggedUser: User | null;
  login: (user: User) => void;
  logout: () => void;
  
  // Navigation & Filters
  activeView: ViewName;
  setActiveView: (view: ViewName) => void;
  filters: AppFilters;
  setFilters: React.Dispatch<React.SetStateAction<AppFilters>>;
  globalSearch: string;
  setGlobalSearch: (s: string) => void;
  
  // Derived Data
  filteredContracts: Contract[];
  baseVisibleContracts: Contract[];
  
  // AI
  aiAnalysis: string | null;
  setAiAnalysis: React.Dispatch<React.SetStateAction<string | null>>;
  
  // Actions
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  addAuditLog: (userEmail: string, action: string, details: string) => void;
  upsertDatabase: (newContracts: Contract[], fileSignature: string, origin?: 'Geral' | 'Cartoes' | 'Prejuizo') => ImportSyncResult;
  importContracts: (newContracts: Contract[]) => ImportSyncResult;
  executarVarreduraCredito: (contractsToScan?: Contract[]) => number;
  clearDatabase: () => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  addNegotiationToTask: (contractId: string, proposal: { value: string; details: string }) => void;
  triggerManualSync: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DB_KEY = 'sicoob_db_recovery_v6';
const APP_INITIALIZED_KEY = 'sicoob_app_initialized';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allContracts, setAllContracts] = useState<Contract[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loggedUser, setLoggedUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<ViewName>(VIEWS.INICIO);
  const [filters, setFilters] = useState<AppFilters>({ pa: 'Todas', gerente: 'Todos', produto: 'Todos' });
  const [globalSearch, setGlobalSearch] = useState('');
  const debouncedSearch = useDebounce(globalSearch, 300);

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
      
      const savedAuth = sessionStorage.getItem('sicoob_auth');
      if (savedAuth) {
        try {
          const user = JSON.parse(savedAuth);
          setLoggedUser(user);
          setIsAuthenticated(true);
        } catch (e) {}
      }
    }
  }, []);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [importHashes, setImportHashes] = useState<string[]>([]);
  const [lastGeralUpdate, setLastGeralUpdate] = useState<string | null>(null);
  const [lastCartoesUpdate, setLastCartoesUpdate] = useState<string | null>(null);
  const [lastPrejuizoUpdate, setLastPrejuizoUpdate] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [syncStatus, setSyncStatus] = useState<'online' | 'syncing' | 'offline'>('online');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  const isSyncing = syncStatus === 'syncing';

  // 1. NORMALIZAÇÃO E SANEAMENTO
  const safeContracts = useMemo(() => {
    return (allContracts ?? []).map(c => ({
      ...c,
      clientName: (c?.clientName ?? "NÃO IDENTIFICADO").toUpperCase(),
      pa: String(c?.pa ?? "0000").trim().toUpperCase().padStart(4, '0'),
      gerente: (c?.gerente ?? "SEM GERENTE").trim().toUpperCase(),
      product: (c?.product ?? "OUTROS").trim().toUpperCase(),
      cpfCnpj: String(c?.cpfCnpj ?? ""),
      saldoDevedor: Number(c?.saldoDevedor ?? 0),
      daysOverdue: Number(c?.daysOverdue ?? 0)
    }));
  }, [allContracts]);

  // 2. FILTRO POR PERFIL (Segurança de Hierarquia)
  const baseVisibleContracts = useMemo(() => {
    if (!loggedUser) return [];
    if (loggedUser.role === UserRole.Admin || loggedUser.role === UserRole.Coordenador) return safeContracts;
    
    const userPa = String(loggedUser?.pa ?? "").trim().toUpperCase().padStart(4, '0');
    const userName = (loggedUser?.name ?? "").trim().toUpperCase();
    
    return safeContracts.filter(c => c.pa === userPa && c.gerente === userName);
  }, [safeContracts, loggedUser]);

  // 3. FILTRO GLOBAL (Busca + Filtros de Barra)
  const filteredContracts = useMemo(() => {
    const s = debouncedSearch.toLowerCase();
    const fPa = filters.pa !== 'Todas' ? filters.pa.trim().toUpperCase().padStart(4, '0') : 'Todas';

    return baseVisibleContracts.filter(c => {
      const matchSearch = !s || c.clientName.toLowerCase().includes(s) || c.id.toLowerCase().includes(s) || c.cpfCnpj.includes(s);
      const matchPa = fPa === 'Todas' || c.pa === fPa;
      const matchGerente = filters.gerente === 'Todos' || c.gerente === filters.gerente.toUpperCase();
      const matchProd = filters.produto === 'Todos' || c.product === filters.produto.toUpperCase();

      return matchSearch && matchPa && matchGerente && matchProd;
    });
  }, [baseVisibleContracts, filters, debouncedSearch]);

  const lastUpdateTimestamp = useMemo(() => {
    if (allContracts.length === 0) return null;
    return lastGeralUpdate || lastCartoesUpdate || lastPrejuizoUpdate;
  }, [lastGeralUpdate, lastCartoesUpdate, lastPrejuizoUpdate, allContracts.length]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DB_KEY, JSON.stringify(allContracts));
    }
  }, [allContracts]);

  const login = useCallback((user: User) => {
    setLoggedUser(user);
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('sicoob_auth', JSON.stringify(user));
    }
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setLoggedUser(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('sicoob_auth');
    }
  }, []);

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
    setLastPrejuizoUpdate(null);
    setAiAnalysis(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(DB_KEY);
      localStorage.setItem(APP_INITIALIZED_KEY, 'true');
    }
    addAuditLog('SISTEMA', 'HARD RESET', 'Protocolo de limpeza total executado. Dashboard zerado.');
  }, [addAuditLog]);

  const syncUsersFromContracts = useCallback((contracts: Contract[]) => {
    setUsers(prev => {
      const existingEmails = new Set(prev.map(u => u.email.toLowerCase()));
      const newUsers: User[] = [];
      
      contracts.forEach(c => {
        const email = c.managerEmail.toLowerCase();
        const managerName = c.gerente.trim().toUpperCase();
        const managerPa = c.pa.trim().toUpperCase().padStart(4, '0');
        
        if (!existingEmails.has(email) && managerName !== 'NÃO ATRIBUÍDO') {
          newUsers.push({
            id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: managerName,
            email: email,
            role: UserRole.Gerente,
            pa: managerPa,
            password: '123',
            isAutoRegistered: true
          });
          existingEmails.add(email);
        }
      });
      
      if (newUsers.length === 0) return prev;
      const updated = [...prev, ...newUsers];
      if (typeof window !== 'undefined') {
        localStorage.setItem('sicoob_db_users_v6', JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const executarVarreduraCredito = useCallback((contractsToScan?: Contract[]) => {
    const targetContracts = contractsToScan || allContracts;
    
    const contratosCriticos = targetContracts
      .filter(c => c.saldoDevedor > 0) 
      .sort((a, b) => {
        const scoreA = a.saldoDevedor * (a.daysOverdue || 1);
        const scoreB = b.saldoDevedor * (b.daysOverdue || 1);
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

    const tasksGenerated = executarVarreduraCredito(newContracts); 
    const notificationsGenerated = 0;

    syncUsersFromContracts(newContracts);

    setSyncStatus('online');
    addAuditLog('SISTEMA', 'IMPORTAÇÃO', `Carga de ${inserted} novos registros concluída.`);
    
    return { inserted, duplicates, tasksGenerated, notificationsGenerated };
  }, [addAuditLog, executarVarreduraCredito, syncUsersFromContracts]);

  const upsertDatabase = useCallback((newContracts: Contract[], fileSignature: string, origin: 'Geral' | 'Cartoes' | 'Prejuizo' = 'Geral'): ImportSyncResult => {
    setSyncStatus('syncing');
    const now = new Date().toLocaleString('pt-BR');

    setAllContracts(prev => {
      const otherContracts = prev.filter(c => c.originSheet !== origin);
      const updated = [...otherContracts, ...newContracts];
      if (typeof window !== 'undefined') {
        localStorage.setItem(DB_KEY, JSON.stringify(updated));
      }
      return updated;
    });

    setImportHashes(prev => [...prev, fileSignature]);
    setSyncStatus('online');
    setAiAnalysis(null);

    if (origin === 'Cartoes') setLastCartoesUpdate(now);
    else if (origin === 'Prejuizo') setLastPrejuizoUpdate(now);
    else setLastGeralUpdate(now);

    addAuditLog('SISTEMA', 'IMPORTAÇÃO', `Carga de ${newContracts.length} registros via canal ${origin} concluída.`);
    
    const tasksGenerated = executarVarreduraCredito(newContracts);
    syncUsersFromContracts(newContracts);

    return { 
      inserted: newContracts.length, 
      duplicates: 0, 
      tasksGenerated, 
      notificationsGenerated: 0 
    };
  }, [addAuditLog, executarVarreduraCredito, syncUsersFromContracts]);

  const updateTaskStatus = useCallback((id: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    addAuditLog('SISTEMA', 'TAREFA ATUALIZADA', `Tarefa ${id} atualizada.`);
  }, [addAuditLog]);

  const addNegotiationToTask = useCallback((contractId: string, proposal: { value: string; details: string }) => {
    const now = new Date().toLocaleString('pt-BR');
    setTasks(prev => {
      const taskIndex = prev.findIndex(t => t.contractId === contractId);
      if (taskIndex === -1) {
        const contract = allContracts.find(c => c.id === contractId);
        if (!contract) return prev;
        
        const newTask: Task = {
          id: `NEG-${contractId}-${Date.now()}`,
          contractId,
          contractClient: contract.clientName,
          managerEmail: contract.managerEmail,
          description: `Negociação iniciada via Calculadora.`,
          status: TaskStatus.EmAndamento,
          priority: 2,
          creationDate: now,
          negotiationHistory: [{ date: now, value: proposal.value, details: proposal.details }]
        };
        return [newTask, ...prev];
      }
      
      const updatedTasks = [...prev];
      const task = updatedTasks[taskIndex];
      const history = task.negotiationHistory || [];
      updatedTasks[taskIndex] = {
        ...task,
        negotiationHistory: [{ date: now, value: proposal.value, details: proposal.details }, ...history]
      };
      return updatedTasks;
    });
    addAuditLog('SISTEMA', 'NEGOCIAÇÃO', `Proposta de ${proposal.value} registrada para o contrato ${contractId}.`);
  }, [allContracts, addAuditLog]);

  const value = useMemo(() => ({
    allContracts, notifications, setNotifications, tasks, setTasks, users, auditLogs, importHashes, syncStatus, isSyncing,
    lastGeralUpdate, lastCartoesUpdate, lastPrejuizoUpdate, lastUpdateTimestamp, aiAnalysis, setAiAnalysis, setUsers, addAuditLog, 
    upsertDatabase, importContracts, executarVarreduraCredito, clearDatabase, updateTaskStatus, updateTask, addNegotiationToTask, triggerManualSync,
    isAuthenticated, loggedUser, login, logout, activeView, setActiveView, filters, setFilters, globalSearch, setGlobalSearch,
    filteredContracts, baseVisibleContracts
  }), [allContracts, notifications, tasks, users, auditLogs, importHashes, syncStatus, isSyncing, lastGeralUpdate, lastCartoesUpdate, lastPrejuizoUpdate, lastUpdateTimestamp, aiAnalysis, upsertDatabase, importContracts, executarVarreduraCredito, clearDatabase, updateTaskStatus, updateTask, addNegotiationToTask, addAuditLog, triggerManualSync, isAuthenticated, loggedUser, login, logout, activeView, filters, globalSearch, filteredContracts, baseVisibleContracts]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
