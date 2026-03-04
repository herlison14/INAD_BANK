
import React, { useMemo } from 'react';
import FeatherIcon from './FeatherIcon';
import { UserRole, User, ViewName, VIEWS } from '../types';

interface SidebarProps {
  isOpen: boolean;
  activeView: ViewName;
  setActiveView: (view: ViewName) => void;
  unreadNotificationCount: number;
  pendingTaskCount: number;
  userRole: UserRole;
  user: User;
  onLogout: () => void;
  allowedViews: ViewName[];
}

const Sidebar: React.FC<SidebarProps> = ({ 
    isOpen, 
    activeView, 
    setActiveView, 
    unreadNotificationCount, 
    pendingTaskCount,
    user,
    userRole,
    onLogout
}) => {
  
  const navItems = useMemo(() => {
    const baseItems: { name: ViewName; icon: string }[] = [
      { name: VIEWS.DASHBOARD, icon: 'home' },
      { name: VIEWS.IMPORTACAO, icon: 'upload' },
      { name: VIEWS.CARTOES_ATRASO, icon: 'package' },
      { name: VIEWS.PREJUIZO, icon: 'alert-octagon' },
      { name: VIEWS.ANALISE_DINAMICA, icon: 'pie-chart' },
      { name: VIEWS.CALCULADORA, icon: 'calculator' },
      { name: VIEWS.DETALHAMENTO, icon: 'list' },
      { name: VIEWS.INSIGHTS_IA, icon: 'cpu' },
      { name: VIEWS.GESTAO_TAREFAS, icon: 'check-square' },
      { name: VIEWS.NOTIFICACOES, icon: 'bell' },
    ];

    if (userRole === UserRole.Admin || userRole === UserRole.Coordenador) {
      baseItems.push({ name: VIEWS.ADMINISTRACAO, icon: 'sliders' });
    }

    return baseItems;
  }, [userRole]);

  return (
    <aside className={`fixed top-0 left-0 h-full bg-[var(--surface-container)] backdrop-blur-2xl shadow-2xl z-50 lg:z-30 transition-all transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:w-72 border-r border-[var(--border-default)] duration-300`}>
      <nav className="h-full flex flex-col p-6">
        <div className="flex items-center mb-10 px-2">
            <div className="w-1.5 h-6 bg-[var(--brand-primary)] rounded-full mr-3"></div>
            <h2 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest italic leading-none">PAINEL <span className="text-[var(--brand-primary)]">INAD 1.0</span></h2>
        </div>
        
        <ul className="flex-grow space-y-1.5 overflow-y-auto pr-2 custom-scrollbar scroll-smooth">
          {navItems.map(item => (
            <li key={item.name}>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setActiveView(item.name); }}
                className={`flex items-center justify-between p-3.5 rounded-2xl transition-all group relative overflow-hidden ${
                  activeView === item.name
                    ? 'bg-[var(--brand-primary)] text-white font-bold shadow-xl shadow-blue-500/30'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-background)] hover:text-[var(--text-primary)]'
                }`}
              >
                <div className="flex items-center relative z-10">
                    <FeatherIcon name={item.icon} className={`h-4 w-4 transition-colors ${activeView === item.name ? 'text-white' : 'text-[var(--text-secondary)] group-hover:text-[var(--brand-primary)]'}`} />
                    <span className="ml-4 text-[11px] font-black uppercase tracking-wider">{item.name}</span>
                </div>
                
                <div className="flex items-center gap-1.5 relative z-10">
                  {item.name === VIEWS.NOTIFICACOES && unreadNotificationCount > 0 && (
                      <span className={`text-[9px] font-black rounded-full h-5 px-1.5 flex items-center justify-center ${activeView === item.name ? 'bg-white text-[var(--brand-primary)]' : 'bg-[var(--status-error)] text-white animate-pulse'}`}>
                          {unreadNotificationCount}
                      </span>
                  )}
                  {item.name === VIEWS.GESTAO_TAREFAS && pendingTaskCount > 0 && (
                      <span className={`text-[9px] font-black rounded-full h-5 px-1.5 flex items-center justify-center ${activeView === item.name ? 'bg-white text-[var(--brand-primary)]' : 'bg-indigo-500 text-white'}`}>
                          {pendingTaskCount}
                      </span>
                  )}
                </div>
                
                {activeView === item.name && (
                   <div className="absolute inset-0 bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-accent)] opacity-90"></div>
                )}
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-auto border-t border-[var(--border-default)] pt-6 px-2">
          <div className="flex items-center gap-3 p-3 mb-4 bg-[var(--surface-background)] rounded-2xl border border-[var(--border-default)] group hover:border-[var(--brand-primary)]/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-accent)] flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/20 uppercase italic">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-black text-[var(--text-primary)] truncate uppercase tracking-tighter leading-none">{user.name}</p>
              <p className="text-[9px] font-bold text-[var(--brand-primary)] uppercase tracking-widest mt-1.5">
                {user.role} • {user.pa || 'GLOBAL'}
              </p>
            </div>
          </div>

          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 p-4 text-[var(--status-error)] hover:bg-[var(--status-error)]/10 rounded-2xl transition-all group"
          >
            <div className="p-2 bg-[var(--status-error)]/10 rounded-lg group-hover:bg-[var(--status-error)]/20 transition-colors">
              <FeatherIcon name="log-out" className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Encerrar Sessão</span>
          </button>
          
          <div className="mt-6 flex flex-col items-center gap-1 opacity-40">
            <FeatherIcon name="shield" className="w-3 h-3 text-slate-400" />
            <p className="text-[7px] text-slate-400 dark:text-slate-600 text-center font-black uppercase tracking-[0.3em] italic leading-tight">
              SISTEMA AUDITADO SICOOB<br/>PAINEL INAD 1.0
            </p>
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
