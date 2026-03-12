import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Contact, 
  Organization, 
  Deal, 
  Activity, 
  Pipeline, 
  Stage, 
  Product, 
  AppNotification, 
  User, 
  UserRole, 
  ViewName, 
  VIEWS, 
  AppFilters,
  DealStatus,
  ActivityStatus,
  ActivityType
} from '../types';
import { useDebounce } from '../hooks/useDebounce';

interface AppContextType {
  // Data
  deals: Deal[];
  contacts: Contact[];
  organizations: Organization[];
  activities: Activity[];
  pipelines: Pipeline[];
  stages: Stage[];
  products: Product[];
  notifications: AppNotification[];
  users: User[];
  
  // Status
  syncStatus: 'online' | 'syncing' | 'offline';
  isSyncing: boolean;
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
  filteredDeals: Deal[];
  
  // Actions
  setDeals: React.Dispatch<React.SetStateAction<Deal[]>>;
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
  setOrganizations: React.Dispatch<React.SetStateAction<Organization[]>>;
  setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  
  addDeal: (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDeal: (id: string, updates: Partial<Deal>) => void;
  deleteDeal: (id: string) => void;
  
  addContact: (contact: Omit<Contact, 'id' | 'createdAt'>) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt'>) => void;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  
  triggerManualSync: () => void;
  clearDatabase: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DB_KEY_PREFIX = 'crm_v1_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loggedUser, setLoggedUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<ViewName>(VIEWS.PIPELINE);
  const [filters, setFilters] = useState<AppFilters>({ ownerId: 'Todos', period: 'Este Mês', pipelineId: 'default' });
  const [globalSearch, setGlobalSearch] = useState('');
  const debouncedSearch = useDebounce(globalSearch, 300);
  
  const [syncStatus, setSyncStatus] = useState<'online' | 'syncing' | 'offline'>('online');
  const isSyncing = syncStatus === 'syncing';

  // Load Initial Data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const load = (key: string, setter: any, defaultValue: any = []) => {
        const saved = localStorage.getItem(DB_KEY_PREFIX + key);
        if (saved) {
          try {
            setter(JSON.parse(saved));
          } catch (e) {
            console.error(`Error loading ${key}`, e);
            setter(defaultValue);
          }
        } else {
          setter(defaultValue);
        }
      };

      load('deals', setDeals);
      load('contacts', setContacts);
      load('organizations', setOrganizations);
      load('activities', setActivities);
      load('pipelines', setPipelines, [{ id: 'default', name: 'Funil de Vendas' }]);
      load('stages', setStages, [
        { id: 's1', name: 'Prospecção', order: 0, pipelineId: 'default' },
        { id: 's2', name: 'Qualificação', order: 1, pipelineId: 'default' },
        { id: 's3', name: 'Proposta', order: 2, pipelineId: 'default' },
        { id: 's4', name: 'Negociação', order: 3, pipelineId: 'default' },
        { id: 's5', name: 'Fechado', order: 4, pipelineId: 'default' },
      ]);
      load('products', setProducts);
      load('notifications', setNotifications);
      
      const savedUsers = localStorage.getItem(DB_KEY_PREFIX + 'users');
      const defaultAdmin: User = { 
        id: 'admin-1', 
        role: UserRole.Admin, 
        name: 'Administrador', 
        email: 'admin@crm.com', 
        password: '123' 
      };
      if (!savedUsers) {
        setUsers([defaultAdmin]);
      } else {
        setUsers(JSON.parse(savedUsers));
      }

      const savedAuth = sessionStorage.getItem('crm_auth');
      if (savedAuth) {
        try {
          const user = JSON.parse(savedAuth);
          setLoggedUser(user);
          setIsAuthenticated(true);
        } catch (e) {}
      }
    }
  }, []);

  // Persistence
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DB_KEY_PREFIX + 'deals', JSON.stringify(deals));
      localStorage.setItem(DB_KEY_PREFIX + 'contacts', JSON.stringify(contacts));
      localStorage.setItem(DB_KEY_PREFIX + 'organizations', JSON.stringify(organizations));
      localStorage.setItem(DB_KEY_PREFIX + 'activities', JSON.stringify(activities));
      localStorage.setItem(DB_KEY_PREFIX + 'pipelines', JSON.stringify(pipelines));
      localStorage.setItem(DB_KEY_PREFIX + 'stages', JSON.stringify(stages));
      localStorage.setItem(DB_KEY_PREFIX + 'products', JSON.stringify(products));
      localStorage.setItem(DB_KEY_PREFIX + 'users', JSON.stringify(users));
      localStorage.setItem(DB_KEY_PREFIX + 'notifications', JSON.stringify(notifications));
    }
  }, [deals, contacts, organizations, activities, pipelines, stages, products, users, notifications]);

  const login = useCallback((user: User) => {
    setLoggedUser(user);
    setIsAuthenticated(true);
    sessionStorage.setItem('crm_auth', JSON.stringify(user));
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setLoggedUser(null);
    sessionStorage.removeItem('crm_auth');
  }, []);

  const addDeal = useCallback((deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newDeal: Deal = {
      ...deal,
      id: `deal-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setDeals(prev => [newDeal, ...prev]);
  }, []);

  const updateDeal = useCallback((id: string, updates: Partial<Deal>) => {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d));
  }, []);

  const deleteDeal = useCallback((id: string) => {
    setDeals(prev => prev.filter(d => d.id !== id));
  }, []);

  const addContact = useCallback((contact: Omit<Contact, 'id' | 'createdAt'>) => {
    const newContact: Contact = {
      ...contact,
      id: `contact-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setContacts(prev => [newContact, ...prev]);
  }, []);

  const updateContact = useCallback((id: string, updates: Partial<Contact>) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const addActivity = useCallback((activity: Omit<Activity, 'id' | 'createdAt'>) => {
    const newActivity: Activity = {
      ...activity,
      id: `act-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setActivities(prev => [newActivity, ...prev]);
  }, []);

  const updateActivity = useCallback((id: string, updates: Partial<Activity>) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, []);

  const triggerManualSync = useCallback(() => {
    setSyncStatus('syncing');
    setTimeout(() => setSyncStatus('online'), 1000);
  }, []);

  const clearDatabase = useCallback(() => {
    setDeals([]);
    setContacts([]);
    setOrganizations([]);
    setActivities([]);
    setNotifications([]);
    if (typeof window !== 'undefined') {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(DB_KEY_PREFIX)) localStorage.removeItem(key);
      });
    }
  }, []);

  const filteredDeals = useMemo(() => {
    const s = debouncedSearch.toLowerCase();
    return deals.filter(d => {
      const matchSearch = !s || d.title.toLowerCase().includes(s);
      const matchOwner = filters.ownerId === 'Todos' || d.ownerId === filters.ownerId;
      const matchPipeline = filters.pipelineId === 'default' || d.pipelineId === filters.pipelineId;
      return matchSearch && matchOwner && matchPipeline;
    });
  }, [deals, debouncedSearch, filters]);

  const lastUpdateTimestamp = useMemo(() => new Date().toLocaleString(), [deals, contacts, activities]);

  const value = useMemo(() => ({
    deals, contacts, organizations, activities, pipelines, stages, products, notifications, users,
    syncStatus, isSyncing, lastUpdateTimestamp,
    isAuthenticated, loggedUser, login, logout,
    activeView, setActiveView, filters, setFilters, globalSearch, setGlobalSearch,
    filteredDeals,
    setDeals, setContacts, setOrganizations, setActivities, setNotifications, setUsers,
    addDeal, updateDeal, deleteDeal,
    addContact, updateContact,
    addActivity, updateActivity,
    triggerManualSync, clearDatabase
  }), [
    deals, contacts, organizations, activities, pipelines, stages, products, notifications, users,
    syncStatus, isSyncing, lastUpdateTimestamp,
    isAuthenticated, loggedUser, login, logout,
    activeView, filters, globalSearch,
    filteredDeals,
    addDeal, updateDeal, deleteDeal,
    addContact, updateContact,
    addActivity, updateActivity,
    triggerManualSync, clearDatabase
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
