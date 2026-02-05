
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Contract, AppNotification, Task, TaskStatus, User, UserRole } from '../types';
import { mockContracts } from '../constants';

interface ImportSummary {
  updated: number;
  inserted: number;
}

interface AppContextType {
  allContracts: Contract[];
  notifications: AppNotification[];
  tasks: Task[];
  users: User[];
  importHashes: string[];
  syncStatus: 'online' | 'syncing' | 'offline';
  lastSync: string;
  setAllContracts: React.Dispatch<React.SetStateAction<Contract[]>>;
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  triggerManualSync: () => void;
  markNotificationRead: (id: string) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  upsertDatabase: (newContracts: Contract[], fileSignature: string) => { success: boolean, summary?: ImportSummary };
  syncManagersFromData: (managers: { name: string, pa: string }[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Simulação de Camada de Persistência (Banco de Dados Local)
  const [allContracts, setAllContracts] = useState<Contract[]>(() => {
    const saved = localStorage.getItem('sicoob_db_recovery_v2');
    return saved ? JSON.parse(saved) : mockContracts;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('sicoob_db_users_v2');
    const initialUsers = [
      { id: 'admin-1', role: UserRole.Admin, name: 'ADMINISTRADOR MASTER', email: 'admin@admin', pa: 'GLOBAL', password: '123' },
      { id: 'manager-1', role: UserRole.Gerente, name: 'ROBERTO LIMA', email: 'roberto@sicoob', pa: 'PA CENTRO', password: '123' },
      { id: 'manager-2', role: UserRole.Gerente, name: 'FERNANDA SOUZA', email: 'fernanda@sicoob', pa: 'PA NORTE', password: '123' }
    ];
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [importHashes, setImportHashes] = useState<string[]>(() => {
    const saved = localStorage.getItem('sicoob_db_audit_hashes_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [syncStatus, setSyncStatus] = useState<'online' | 'syncing' | 'offline'>('online');
  const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString());

  // Auto-Commit para LocalStorage (Simulando persistência em banco Hostinger)
  useEffect(() => {
    localStorage.setItem('sicoob_db_recovery_v2', JSON.stringify(allContracts));
  }, [allContracts]);

  useEffect(() => {
    localStorage.setItem('sicoob_db_users_v2', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('sicoob_db_audit_hashes_v2', JSON.stringify(importHashes));
  }, [importHashes]);

  // MOTOR DE IMPORTAÇÃO MASTER (UPSERT LOGIC)
  // Se o contrato existe (ID + PA + Gerente), atualiza o saldo. Senão, insere.
  const upsertDatabase = useCallback((newContracts: Contract[], fileSignature: string) => {
    // 1. Bloqueio de Planilha Repetida (Assinatura Digital)
    if (importHashes.includes(fileSignature)) {
      console.warn("[SEGURANÇA] Bloqueio de importação duplicada: Arquivo já processado.");
      return { success: false };
    }

    setSyncStatus('syncing');
    let updatedCount = 0;
    let insertedCount = 0;

    // Criamos um Map para busca ultra-rápida O(1)
    const contractsMap = new Map(allContracts.map(c => [c.id, c]));

    newContracts.forEach(newC => {
      if (contractsMap.has(newC.id)) {
        // UPDATE: Atualiza saldo e metadados mantendo o histórico
        const existing = contractsMap.get(newC.id)!;
        contractsMap.set(newC.id, {
          ...existing,
          saldoDevedor: newC.saldoDevedor,
          daysOverdue: newC.daysOverdue,
          dueDate: newC.dueDate,
          pa: newC.pa,
          gerente: newC.gerente,
          // Mantém campos que não vem na planilha mas podem existir no sistema
          valorProvisionado: newC.saldoDevedor * 0.15 
        });
        updatedCount++;
      } else {
        // INSERT: Novo registro físico no banco
        contractsMap.set(newC.id, newC);
        insertedCount++;
      }
    });

    const result = Array.from(contractsMap.values());

    // Delay para simular persistência em banco remoto
    setTimeout(() => {
      setAllContracts(result);
      setImportHashes(prev => [...prev, fileSignature]);
      setSyncStatus('online');
      setLastSync(new Date().toLocaleTimeString());
      console.log(`[UPSERT] Concluído: ${updatedCount} atualizados, ${insertedCount} novos.`);
    }, 800);

    return { 
      success: true, 
      summary: { updated: updatedCount, inserted: insertedCount } 
    };
  }, [allContracts, importHashes]);

  // MOTOR DE SINCRONIZAÇÃO DE IDENTIDADE (Auto-Registro)
  const syncManagersFromData = useCallback((managers: { name: string, pa: string }[]) => {
    setUsers(prevUsers => {
      const updatedUsers = [...prevUsers];
      let hasChanges = false;

      managers.forEach(mgr => {
        const normalizedName = mgr.name.trim().toUpperCase();
        if (!normalizedName || normalizedName === 'GERENTE NÃO ATRIBUÍDO' || normalizedName === 'N/A') return;

        const exists = updatedUsers.find(u => u.name.toUpperCase() === normalizedName);
        if (!exists) {
          const userLogin = normalizedName.toLowerCase().replace(/\s+/g, '.');
          updatedUsers.push({
            id: `mgr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            name: normalizedName,
            email: `${userLogin}@sicoob.com.br`,
            role: UserRole.Gerente,
            pa: mgr.pa.trim().toUpperCase(),
            password: 'mudar123',
            isAutoRegistered: true
          });
          hasChanges = true;
          console.log(`[IDENTIDADE] Gerente "${normalizedName}" efetivado no diretório.`);
        }
      });

      return hasChanges ? updatedUsers : prevUsers;
    });
  }, []);

  const triggerManualSync = useCallback(() => {
    setSyncStatus('syncing');
    setTimeout(() => {
      setSyncStatus('online');
      setLastSync(new Date().toLocaleTimeString());
    }, 1000);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const updateTaskStatus = useCallback((id: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  }, []);

  const value = useMemo(() => ({
    allContracts,
    notifications,
    tasks,
    users,
    importHashes,
    syncStatus,
    lastSync,
    setAllContracts,
    setNotifications,
    setTasks,
    setUsers,
    triggerManualSync,
    markNotificationRead,
    updateTaskStatus,
    upsertDatabase,
    syncManagersFromData
  }), [allContracts, notifications, tasks, users, importHashes, syncStatus, lastSync, triggerManualSync, markNotificationRead, updateTaskStatus, upsertDatabase, syncManagersFromData]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
