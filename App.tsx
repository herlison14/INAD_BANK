
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserRole, TaskStatus, AppNotification, User, Contract } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import { Skeleton } from './components/ui/Skeleton';
import { useDebounce } from './hooks/useDebounce';
import { AppProvider, useApp } from './context/AppContext';
import { useSelfHealing } from './hooks/useSelfHealing';
import FilterBar from './components/FilterBar';
import LoginView from './components/LoginView';

// Components de Visualização
import ImportacaoView from './components/ImportacaoView';
import InsightsIAView from './components/InsightsIAView';
import DetalhamentoView from './components/DetalhamentoView';
import GestaoTarefasView from './components/GestaoTarefasView';
import NotificacoesView from './components/NotificacoesView';
import CartoesAtrasoView from './components/CartoesAtrasoView';
import VisaoDinamicaView from './components/VisaoDinamicaView';
import CalculadoraRenegociacaoView from './components/CalculadoraRenegociacaoView';
import AdministracaoView from './components/AdministracaoView';

const AppContent: React.FC = () => {
  const { healingError } = useSelfHealing();
  const { 
    allContracts, 
    notifications, 
    setNotifications,
    tasks, 
    setTasks, 
    updateTaskStatus,
    importHashes
  } = useApp();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loggedUser, setLoggedUser] = useState<User | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('Dashboard Principal');
  const [calculatorInitialValue, setCalculatorInitialValue] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [globalSearch, setGlobalSearch] = useState('');
  const debouncedSearch = useDebounce(globalSearch, 300);

  const [filters, setFilters] = useState({
    pa: 'Todas',
    gerente: 'Todos',
    produto: 'Todos'
  });

  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => setIsLoading(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true';
  });

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  const filteredContracts = useMemo(() => {
    if (!loggedUser) return [];

    const userPA = (loggedUser.pa || '').trim().toUpperCase();
    const userName = (loggedUser.name || '').trim().toUpperCase();

    let visibleData: Contract[] = [];
    if (loggedUser.role === UserRole.Admin) {
      visibleData = allContracts;
    } else {
      visibleData = allContracts.filter(c => 
        (c.pa || '').trim().toUpperCase() === userPA && 
        (c.gerente || '').trim().toUpperCase() === userName
      );
    }

    return visibleData.filter(contract => {
      if (debouncedSearch) {
        const s = debouncedSearch.toLowerCase();
        const matchSearch = contract.clientName.toLowerCase().includes(s) || 
                            contract.id.toLowerCase().includes(s) || 
                            contract.cpfCnpj.includes(s);
        if (!matchSearch) return false;
      }
      
      const paMatch = filters.pa === 'Todas' || contract.pa === filters.pa.toUpperCase();
      const managerMatch = filters.gerente === 'Todos' || contract.gerente === filters.gerente.toUpperCase();
      const productMatch = filters.produto === 'Todos' || contract.product === filters.produto;
      
      return paMatch && managerMatch && productMatch;
    });
  }, [allContracts, filters, debouncedSearch, loggedUser]);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    setLoggedUser(null);
    setIsLoading(true);
    sessionStorage.clear();
    setActiveView('Dashboard Principal');
  }, []);

  const stats = useMemo(() => {
    const total = filteredContracts.reduce((acc, c) => acc + c.saldoDevedor, 0);
    return {
      totalFormatted: total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      count: filteredContracts.length,
    };
  }, [filteredContracts]);

  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={(user) => { setLoggedUser(user); setIsAuthenticated(true); }} />;
  }

  return (
    <div className="flex h-screen overflow-hidden font-sans transition-colors duration-300 bg-[#f8faff] dark:bg-[#0f172a]">
      <Sidebar 
        isOpen={sidebarOpen} 
        activeView={activeView} 
        setActiveView={(view) => { setActiveView(view); setSidebarOpen(false); }}
        unreadNotificationCount={notifications.filter(n => !n.read).length}
        pendingTaskCount={tasks.filter(t => t.status === TaskStatus.Pendente).length}
        userRole={loggedUser?.role || UserRole.Gerente}
        user={loggedUser!}
        onLogout={handleLogout}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header 
          onMenuClick={() => setSidebarOpen(true)} 
          darkMode={darkMode} 
          toggleDarkMode={() => setDarkMode(!darkMode)} 
          currentUser={loggedUser!}
          onLogout={handleLogout}
          searchValue={globalSearch}
          onSearchChange={setGlobalSearch}
          onDataImported={() => setActiveView('Dashboard Principal')}
        />
        
        {/* Ticker Bar Estilizada */}
        <div className="h-10 bg-indigo-900 dark:bg-black text-white flex items-center overflow-hidden border-b border-white/5 relative z-20 shadow-xl shrink-0">
          <div className="absolute left-0 top-0 bottom-0 bg-indigo-600 px-6 flex items-center z-30 shadow-xl border-r border-white/10">
             <span className="text-[10px] font-black uppercase tracking-widest italic flex items-center gap-3">
               <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-ping" /> {loggedUser?.role === UserRole.Admin ? 'PREMIUM GLOBAL' : `UNIDADE ${loggedUser?.pa}`}
             </span>
          </div>
          <div className="flex animate-infinite-scroll whitespace-nowrap gap-16 items-center pl-80">
            <span className="text-xs font-bold uppercase tracking-tight">SALDO SOB MONITORAMENTO: <span className="text-indigo-300">{stats.totalFormatted}</span></span>
            <span className="text-xs font-bold uppercase tracking-tight">ESTADO DA REDE: <span className={allContracts.length > 0 ? "text-green-400" : "text-red-400"}>{allContracts.length > 0 ? "SINCRONIZADA" : "AGUARDANDO IMPORTAÇÃO"}</span></span>
            <span className="text-xs font-bold uppercase tracking-tight italic opacity-40">CARGAS ATIVAS: {importHashes.length}</span>
            <span className="text-xs font-bold uppercase tracking-tight">SALDO SOB MONITORAMENTO: <span className="text-indigo-300">{stats.totalFormatted}</span></span>
            <span className="text-xs font-bold uppercase tracking-tight">ESTADO DA REDE: <span className={allContracts.length > 0 ? "text-green-400" : "text-red-400"}>{allContracts.length > 0 ? "SINCRONIZADA" : "AGUARDANDO IMPORTAÇÃO"}</span></span>
          </div>
        </div>

        {/* Abas Superiores Estilo Premium */}
        <div className="nav-glass px-10 pt-4 flex gap-10 border-b border-slate-200/60 dark:border-slate-800 shrink-0">
            {[
                {id: 'Dashboard Principal', label: 'DASHBOARD GERAL'},
                {id: 'Cartões em Atraso', label: 'LISTA DE CARTÕES'},
                {id: 'Calculadora', label: 'SIMULADOR DE ACORDO'},
                {id: 'Detalhamento', label: 'ANÁLISE DETALHADA'}
            ].map(t => (
                <button 
                    key={t.id} 
                    onClick={() => setActiveView(t.id)} 
                    className={`pb-4 text-[11px] font-black tracking-widest transition-all uppercase border-b-4 whitespace-nowrap ${activeView === t.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                >
                    {t.label}
                </button>
            ))}
        </div>

        <main className="flex-1 overflow-x-hidden overflow-y-auto pb-10">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div key="loader" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="p-8 space-y-6">
                <Skeleton className="h-[300px] w-full rounded-[3.5rem]" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Skeleton className="h-40 w-full rounded-3xl" />
                    <Skeleton className="h-40 w-full rounded-3xl" />
                    <Skeleton className="h-40 w-full rounded-3xl" />
                    <Skeleton className="h-40 w-full rounded-3xl" />
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key={activeView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="p-4 sm:p-10"
              >
                {['Dashboard Principal', 'Cartões em Atraso', 'Análise Dinâmica', 'Detalhamento'].includes(activeView) && allContracts.length > 0 && (
                   <FilterBar data={filteredContracts} onFilterChange={setFilters} />
                )}

                {activeView === 'Dashboard Principal' && (
                  <Dashboard 
                    contracts={filteredContracts} 
                    filterName="Estratégico" 
                    onNavigateToDetails={(id) => { setGlobalSearch(id); setActiveView('Detalhamento'); }} 
                    isDarkMode={darkMode} 
                    userRole={loggedUser!.role} 
                    onGoToImport={() => setActiveView('Importação')}
                  />
                )}
                {activeView === 'Importação' && <ImportacaoView onDataImported={() => setActiveView('Dashboard Principal')} contractCount={allContracts.length} />}
                {activeView === 'Insights de IA' && (
                  <InsightsIAView 
                    contracts={filteredContracts} 
                    onNavigateToDetails={(id) => { setGlobalSearch(id); setActiveView('Detalhamento'); }} 
                    selectedProducts={filters.produto === 'Todos' ? ['Todos'] : [filters.produto]} 
                    onAddNotifications={(notifs) => {
                      const newNotifications: AppNotification[] = notifs.map(c => ({
                        id: `ai-notif-${c.id}-${Date.now()}`,
                        contract: c,
                        message: `IA ALERTA: Risco detectado no contrato ${c.id} (${c.clientName}).`,
                        timestamp: new Date().toISOString(),
                        read: false
                      }));
                      setNotifications(prev => [...prev, ...newNotifications]);
                    }} 
                    onAddTasks={(tsks) => setTasks(prev => [...prev, ...tsks])} 
                  />
                )}
                {activeView === 'Detalhamento' && <DetalhamentoView contracts={filteredContracts} initialSearchTerm={debouncedSearch} onNavigateToDetails={(id) => setGlobalSearch(id)} onSimulateRenegotiation={(val) => { setCalculatorInitialValue(val); setActiveView('Calculadora'); }} userRole={loggedUser!.role} />}
                {activeView === 'Gestão de Tarefas' && <GestaoTarefasView tasks={tasks} onUpdateTaskStatus={updateTaskStatus} onNavigateToDetails={(id) => { setGlobalSearch(id); setActiveView('Detalhamento'); }} onSetTaskReminder={() => {}} />}
                {activeView === 'Notificações' && <NotificacoesView notifications={notifications} onNavigateToDetails={(id) => { setGlobalSearch(id); setActiveView('Detalhamento'); }} onMarkAllAsRead={() => setNotifications(prev => prev.map(n => ({...n, read: true})))} />}
                {activeView === 'Cartões em Atraso' && <CartoesAtrasoView contracts={filteredContracts} isDarkMode={darkMode} onNavigateToDetails={(id) => { setGlobalSearch(id); setActiveView('Detalhamento'); }} />}
                {activeView === 'Análise Dinâmica' && <VisaoDinamicaView contracts={filteredContracts} isDarkMode={darkMode} />}
                {activeView === 'Calculadora' && <CalculadoraRenegociacaoView isDarkMode={darkMode} initialValue={calculatorInitialValue} />}
                {activeView === 'Administração' && <AdministracaoView />}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default App;
