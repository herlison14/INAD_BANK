"use client";

import React, { useState, useCallback, useMemo, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserRole, TaskStatus, AppNotification, User, Contract, Task, VIEWS, ViewName } from '../types';
import Header from '../components/Header';
import Dashboard from '../components/Dashboard';
import Sidebar from '../components/Sidebar';
import { Skeleton } from '../components/ui/Skeleton';
import { AppProvider, useApp, ImportSyncResult } from '../context/AppContext';
import { useSelfHealing } from '../hooks/useSelfHealing';
import FilterBar from '../components/FilterBar';
import LoginView from '../components/LoginView';
import FeatherIcon from '../components/FeatherIcon';

// Components de Visualização
import ImportacaoView from '../components/ImportacaoView';
import InsightsIAView from '../components/InsightsIAView';
import DetalhamentoView from '../components/DetalhamentoView';
import GestaoTarefasView from '../components/GestaoTarefasView';
import NotificacoesView from '../components/NotificacoesView';
import CartoesAtrasoView from '../components/CartoesAtrasoView';
import PrejuizoView from '../components/PrejuizoView';
import CalculadoraRenegociacaoView from '../components/CalculadoraRenegociacaoView';
import AnaliseDinamicaView from '../components/AnaliseDinamicaView';
import AnaliseDinamicaPro from '../components/AnaliseDinamicaPro';
import AdministracaoView from '../components/AdministracaoView';
import UnifiedView from '../components/UnifiedView';
import CRMView from '../components/crm/CRMView';

// ─────────────────────────────────────────────────────────────────────────────
// ERROR BOUNDARY
// ─────────────────────────────────────────────────────────────────────────────
interface ErrorBoundaryProps { children: ReactNode; }
interface ErrorBoundaryState { hasError: boolean; }

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Erro crítico detectado:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#1a1f2e] p-6 text-center">
          <h2 className="text-2xl font-black text-[#f0f4ff] mb-4">Ops! Algo deu errado.</h2>
          <p className="text-[#a0aec0] mb-6 max-w-md">
            Ocorreu um erro ao processar os dados da visualização. Isso geralmente acontece por dados inesperados na planilha.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all"
          >
            Recarregar Sistema
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SISTEMA DE SEGURANÇA
// ─────────────────────────────────────────────────────────────────────────────
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.Admin]: Object.values(VIEWS),
  [UserRole.Coordenador]: Object.values(VIEWS),
  [UserRole.Gerente]: [
    VIEWS.INICIO, 
    VIEWS.CARTEIRA, 
    VIEWS.CARTOES_ATRASO, 
    VIEWS.PREJUIZO, 
    VIEWS.ANALISE_DINAMICA, 
    VIEWS.CALCULADORA_RENEGOCIACAO, 
    VIEWS.DETALHAMENTO, 
    VIEWS.INSIGHTS_IA, 
    VIEWS.GESTAO_TAREFAS, 
    VIEWS.NOTIFICACOES,
    VIEWS.CRM_VENDAS
  ],
};

function canAccess(role: UserRole, view: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(view) ?? false;
}

const AccessDenied: React.FC<{ role: UserRole }> = ({ role }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center h-full py-32 text-center">
    <div className="w-20 h-20 rounded-3xl bg-red-900/30 flex items-center justify-center mb-6">
      <FeatherIcon name="lock" className="w-9 h-9 text-red-500" />
    </div>
    <h2 className="text-2xl font-black text-[var(--text-primary)] mb-2">Acesso Restrito</h2>
    <p className="text-[var(--text-secondary)] text-sm max-w-sm">
      Seu perfil <span className="font-bold text-[var(--text-primary)]">({role})</span> não
      tem permissão para acessar esta área.
    </p>
  </motion.div>
);

// ─────────────────────────────────────────────────────────────────────────────
// TOAST DE SINCRONIZAÇÃO
// ─────────────────────────────────────────────────────────────────────────────
const SyncToast: React.FC<{ result: ImportSyncResult; onClose: () => void }> = ({ result, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: -30, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -20, scale: 0.95 }}
    className="fixed top-6 right-6 z-[100] bg-[#1a1f2e] rounded-2xl shadow-none ring-1 ring-[#2e3347] border border-[#2e3347] p-5 w-80"
  >
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-[var(--status-success)]/10 flex items-center justify-center">
          <FeatherIcon name="check-circle" className="w-4 h-4 text-[var(--status-success)]" />
        </div>
        <span className="font-black text-[var(--text-primary)] text-sm">Sincronização Completa</span>
      </div>
      <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
        <FeatherIcon name="x" className="w-4 h-4" />
      </button>
    </div>
    <div className="space-y-2">
      {[
        { icon: 'file-text', label: 'Contratos importados', value: result.inserted, color: 'text-[var(--brand-primary)]' },
        { icon: 'check-square', label: 'Tarefas geradas', value: result.tasksGenerated, color: 'text-[var(--brand-accent)]' },
        { icon: 'bell', label: 'Notificações criadas', value: result.notificationsGenerated, color: 'text-[var(--status-warning)]' },
        ...(result.duplicates > 0 ? [{ icon: 'copy', label: 'Duplicatas ignoradas', value: result.duplicates, color: 'text-[var(--text-secondary)]' }] : []),
      ].map((item) => (
        <div key={item.label} className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
            <FeatherIcon name={item.icon} className={`w-3.5 h-3.5 ${item.color}`} />
            {item.label}
          </span>
          <span className={`font-black ${item.color}`}>{item.value}</span>
        </div>
      ))}
    </div>
    <p className="text-xs text-[var(--text-secondary)] mt-3 pt-3 border-t border-[var(--border-default)]">
      Tarefas e Notificações atualizadas automaticamente.
    </p>
  </motion.div>
);

// ─────────────────────────────────────────────────────────────────────────────
// APP CONTENT
// ─────────────────────────────────────────────────────────────────────────────
const AppContent: React.FC = () => {
  const { useSelfHealing } = require('../hooks/useSelfHealing'); // Dynamic import if needed or just use standard
  const { healingError } = useSelfHealing();
  const { 
    allContracts, notifications, setNotifications, tasks, setTasks, updateTaskStatus, updateTask, importContracts, isSyncing,
    isAuthenticated, loggedUser, login, logout, activeView, setActiveView, filters, setFilters, globalSearch, setGlobalSearch,
    filteredContracts, baseVisibleContracts
  } = useApp();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [syncResult, setSyncResult] = useState<ImportSyncResult | null>(null);
  const [calcData, setCalcData] = useState({ value: 0, days: 0, id: '' });
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const saved = typeof window !== 'undefined' && localStorage.getItem('darkMode') === 'true';
    setDarkMode(saved);
  }, []);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('darkMode', String(darkMode)); } catch { /* ignorado */ }
    }
  }, [darkMode]);

  useEffect(() => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    const t = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(t);
  }, [isAuthenticated, activeView]);

  const totalSaldo = useMemo(() => filteredContracts.reduce((acc, c) => acc + c.saldoDevedor, 0), [filteredContracts]);

  const visibleTasks = useMemo(() => {
    if (!loggedUser) return [];
    if (loggedUser.role === UserRole.Admin || loggedUser.role === UserRole.Coordenador) return tasks;
    const userEmail = loggedUser.email.toLowerCase();
    return tasks.filter(t => t.managerEmail.toLowerCase() === userEmail);
  }, [tasks, loggedUser]);

  const handleMarkAllAsRead = useCallback(() => { 
    setNotifications((prev: AppNotification[]) => prev.map((n) => ({ ...n, read: true }))); 
  }, [setNotifications]);

  const navigateToDetails = useCallback((id: string) => { 
    setGlobalSearch(id); 
    setActiveView(VIEWS.DETALHAMENTO); 
  }, [setGlobalSearch, setActiveView]);

  const handleTransferToCalc = useCallback((contract: any) => {
    setCalcData({
      value: contract.saldoDevedor,
      days: contract.daysOverdue,
      id: contract.id
    });
    setActiveView(VIEWS.CALCULADORA_RENEGOCIACAO);
  }, [setActiveView]);

  const handleDataImported = useCallback((newContracts?: Contract[], precalculatedResult?: ImportSyncResult) => {
    if (newContracts && newContracts.length > 0) {
      const result = precalculatedResult || importContracts(newContracts);
      setSyncResult(result);
      setFilters({ pa: 'Todas', gerente: 'Todos', produto: 'Todos' });
      setGlobalSearch('');
      setTimeout(() => setSyncResult(null), 6000);
    }
    setActiveView(VIEWS.INICIO);
  }, [importContracts, setActiveView, setFilters, setGlobalSearch]);

  if (!isAuthenticated || !loggedUser) {
    return <LoginView onLoginSuccess={login} />;
  }

  const renderActiveViewContent = () => {
    switch (activeView) {
      case VIEWS.INICIO: 
        return (
          <UnifiedView 
            tabs={[
              { id: 'dashboard', label: 'Painel Geral', icon: 'bar-chart-2', component: <Dashboard contracts={filteredContracts} filterName="Geral" onNavigateToDetails={navigateToDetails} onContractClick={handleTransferToCalc} isDarkMode={darkMode} userRole={loggedUser.role} /> },
              { id: 'import', label: 'Importação', icon: 'upload', component: <ImportacaoView onDataImported={handleDataImported} contractCount={allContracts.length} /> },
              { id: 'insights', label: 'Insights IA', icon: 'cpu', component: <InsightsIAView contracts={filteredContracts} onNavigateToDetails={navigateToDetails} /> },
            ]}
          />
        );
      case VIEWS.IMPORTACAO: 
        return <ImportacaoView onDataImported={handleDataImported} contractCount={allContracts.length} />;
      case VIEWS.CARTEIRA:
        return (
          <UnifiedView 
            tabs={[
              { id: 'detalhamento', label: 'Detalhamento', icon: 'list', component: <DetalhamentoView contracts={filteredContracts} initialSearchTerm={globalSearch} onNavigateToDetails={(id) => setGlobalSearch(id)} onSimulateRenegotiation={(val, days, id) => { setCalcData({ value: val, days, id }); setActiveView(VIEWS.CALCULADORA_RENEGOCIACAO); }} userRole={loggedUser.role} /> },
              { id: 'cartoes', label: 'Cartões em Atraso', icon: 'credit-card', component: <CartoesAtrasoView contracts={filteredContracts} isDarkMode={darkMode} onNavigateToDetails={navigateToDetails} onContractClick={handleTransferToCalc} /> },
              { id: 'prejuizo', label: 'Prejuízo', icon: 'alert-octagon', component: <PrejuizoView contracts={filteredContracts} onNavigateToDetails={navigateToDetails} /> },
              { id: 'calculadora', label: 'Calculadora', icon: 'calculator', component: <CalculadoraRenegociacaoView isDarkMode={darkMode} initialData={calcData} /> },
              { id: 'analise', label: 'Análise Dinâmica', icon: 'pie-chart', component: <div className="space-y-8"><AnaliseDinamicaPro contracts={filteredContracts} /><AnaliseDinamicaView contracts={filteredContracts} /></div> },
            ]}
          />
        );
      case VIEWS.ANALISE_DINAMICA: 
        return <AnaliseDinamicaView contracts={baseVisibleContracts} />;
      case VIEWS.GESTAO_TAREFAS: 
        return <GestaoTarefasView tasks={visibleTasks} contracts={allContracts} onUpdateTaskStatus={updateTaskStatus} onUpdateTask={updateTask} onNavigateToDetails={navigateToDetails} onSimulateRenegotiation={(val, days, id) => { setCalcData({ value: val, days, id }); setActiveView(VIEWS.CALCULADORA_RENEGOCIACAO); }} />;
      case VIEWS.CALCULADORA_RENEGOCIACAO: 
        return <CalculadoraRenegociacaoView isDarkMode={darkMode} initialData={calcData} />;
      case VIEWS.CARTOES_ATRASO: 
        return <CartoesAtrasoView contracts={filteredContracts} isDarkMode={darkMode} onNavigateToDetails={navigateToDetails} onContractClick={handleTransferToCalc} />;
      case VIEWS.DETALHAMENTO:
        return <DetalhamentoView contracts={filteredContracts} initialSearchTerm={globalSearch} onNavigateToDetails={(id) => setGlobalSearch(id)} onSimulateRenegotiation={(val, days, id) => { setCalcData({ value: val, days, id }); setActiveView(VIEWS.CALCULADORA_RENEGOCIACAO); }} userRole={loggedUser.role} />;
      case VIEWS.INSIGHTS_IA:
        return <InsightsIAView contracts={filteredContracts} onNavigateToDetails={navigateToDetails} />;
      case VIEWS.NOTIFICACOES:
        return <NotificacoesView notifications={notifications} onNavigateToDetails={navigateToDetails} onMarkAllAsRead={handleMarkAllAsRead} />;
      case VIEWS.PREJUIZO:
        return <PrejuizoView contracts={filteredContracts} onNavigateToDetails={navigateToDetails} />;
      case VIEWS.ADMINISTRACAO: 
        return <AdministracaoView />;
      case VIEWS.CRM_VENDAS:
        return <CRMView />;
      default: 
        return <Dashboard contracts={filteredContracts} filterName="Geral" onNavigateToDetails={navigateToDetails} isDarkMode={darkMode} userRole={loggedUser.role} />;
    }
  };

  const viewsWithFilterBar: ViewName[] = [VIEWS.INICIO, VIEWS.CARTEIRA, VIEWS.CARTOES_ATRASO, VIEWS.DETALHAMENTO, VIEWS.PREJUIZO];

  return (
    <div className="flex h-screen bg-[#0f1117] text-[#f0f4ff] overflow-hidden font-sans">
      <AnimatePresence>
        {syncResult && <SyncToast result={syncResult} onClose={() => setSyncResult(null)} />}
      </AnimatePresence>

      <Sidebar 
        isOpen={sidebarOpen} 
        activeView={activeView} 
        setActiveView={setActiveView} 
        unreadNotificationCount={notifications.filter(n => !n.read).length}
        pendingTaskCount={visibleTasks.filter(t => t.status === TaskStatus.Pendente).length}
        user={loggedUser}
        userRole={loggedUser.role} 
        onLogout={logout}
        allowedViews={Object.values(VIEWS).filter(v => canAccess(loggedUser.role, v))}
      />
      
      <main className="flex-1 flex flex-col min-w-0 bg-[#1a1f2e]">
        <Header 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          darkMode={darkMode}
          toggleDarkMode={() => setDarkMode((p) => !p)}
          currentUser={loggedUser}
          onLogout={logout}
          searchValue={globalSearch}
          onSearchChange={setGlobalSearch}
          onDataImported={() => handleDataImported()}
        />
        
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="h-10 bg-[#0f1117] text-white flex items-center border-b border-white/5 relative z-20 overflow-hidden shrink-0">
            <div className="absolute left-0 bg-red-600 px-4 h-full flex items-center font-black text-[9px] italic skew-x-[-15deg] -ml-3 shadow-xl z-30">ALERTA DE EXPOSIÇÃO</div>
            <div className="flex animate-infinite-scroll whitespace-nowrap gap-16 items-center pl-48">
              <span className="text-[10px] font-black uppercase tracking-widest">
                SALDO DEVEDOR CONSOLIDADO:{' '}
                <span className="text-emerald-400 text-base ml-2 font-black">{totalSaldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </span>
              {isSyncing && (
                <span className="text-[9px] font-black text-yellow-400 uppercase tracking-[0.3em] flex items-center gap-2">
                  <FeatherIcon name="loader" className="w-3 h-3 animate-spin" /> SINCRONIZANDO...
                </span>
              )}
            </div>
          </div>

          {viewsWithFilterBar.includes(activeView) && (
            <div className="p-4 bg-[#1a1f2e] border-b border-[#2e3347]">
              <FilterBar data={baseVisibleContracts} onFilterChange={setFilters} />
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
            <ErrorBoundary>
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                    <Skeleton className="h-[400px] w-full rounded-[4rem]" />
                  </motion.div>
                ) : (
                  <motion.div
                    key={activeView}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="h-full w-full"
                  >
                    {!canAccess(loggedUser.role, activeView) ? (
                      <AccessDenied role={loggedUser.role} />
                    ) : (
                      renderActiveViewContent()
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </ErrorBoundary>
          </div>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <ErrorBoundary>
    <AppProvider>
      <AppContent />
    </AppProvider>
  </ErrorBoundary>
);

export default App;
