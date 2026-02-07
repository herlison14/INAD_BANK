
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Contract, AppNotification, Task, TaskStatus, User, UserRole } from '../types';

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
  // Inicialização Rígida: Base V4 começa VAZIA
  const [allContracts, setAllContracts] = useState<Contract[]>(() => {
    const saved = localStorage.getItem('sicoob_db_recovery_v4');
    return saved ? JSON.parse(saved) : []; 
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('sicoob_db_users_v4');
    const initialUsers = [
      { id: 'admin-1', role: UserRole.Admin, name: 'ADMINISTRADOR MASTER', email: 'admin@admin', pa: 'GLOBAL', password: '123' }
    ];
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [importHashes, setImportHashes] = useState<string[]>(() => {
    const saved = localStorage.getItem('sicoob_db_audit_hashes_v4');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [syncStatus, setSyncStatus] = useState<'online' | 'syncing' | 'offline'>('online');
  const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    localStorage.setItem('sicoob_db_recovery_v4', JSON.stringify(allContracts));
  }, [allContracts]);

  useEffect(() => {
    localStorage.setItem('sicoob_db_users_v4', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('sicoob_db_audit_hashes_v4', JSON.stringify(importHashes));
  }, [importHashes]);

  const upsertDatabase = useCallback((newContracts: Contract[], fileSignature: string) => {
    if (importHashes.includes(fileSignature)) return { success: false };

    setSyncStatus('syncing');
    let updatedCount = 0;
    let insertedCount = 0;

    const contractsMap = new Map<string, Contract>(allContracts.map(c => [c.id, c]));

    newContracts.forEach(newC => {
      if (contractsMap.has(newC.id)) {
        const existing = contractsMap.get(newC.id);
        if (existing) {
          contractsMap.set(newC.id, {
            ...existing,
            ...newC
          });
          updatedCount++;
        }
      } else {
        contractsMap.set(newC.id, newC);
        insertedCount++;
      }
    });

    const result = Array.from(contractsMap.values());

    setTimeout(() => {
      setAllContracts(result);
      setImportHashes(prev => [...prev, fileSignature]);
      setSyncStatus('online');
      setLastSync(new Date().toLocaleTimeString());
    }, 800);

    return { success: true, summary: { updated: updatedCount, inserted: insertedCount } };
  }, [allContracts, importHashes]);

  const syncManagersFromData = useCallback((managers: { name: string, pa: string }[]) => {
    setUsers(prevUsers => {
      const updatedUsers = [...prevUsers];
      let hasChanges = false;
      managers.forEach(mgr => {
        const normalizedName = mgr.name.trim().toUpperCase();
        if (!normalizedName || normalizedName === 'GERENTE NÃO ATRIBUÍDO') return;
        const exists = updatedUsers.find(u => u.name.toUpperCase() === normalizedName);
        if (!exists) {
          updatedUsers.push({
            id: `mgr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            name: normalizedName,
            email: `${normalizedName.toLowerCase().replace(/\s+/g, '.')}@sicoob.com.br`,
            role: UserRole.Gerente,
            pa: mgr.pa.trim().toUpperCase(),
            password: 'mudar123',
            isAutoRegistered: true
          });
          hasChanges = true;
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
    allContracts, notifications, tasks, users, importHashes, syncStatus, lastSync,
    setAllContracts, setNotifications, setTasks, setUsers, triggerManualSync,
    markNotificationRead, updateTaskStatus, upsertDatabase, syncManagersFromData
  }), [allContracts, notifications, tasks, users, importHashes, syncStatus, lastSync, triggerManualSync, markNotificationRead, updateTaskStatus, upsertDatabase, syncManagersFromData]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useApp must be used within an AppProvider');
  return context;
};
