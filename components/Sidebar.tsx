
import React, { useMemo } from 'react';
import FeatherIcon from './FeatherIcon';
import { UserRole, User } from '../types';

interface SidebarProps {
  isOpen: boolean;
  activeView: string;
  setActiveView: (view: string) => void;
  unreadNotificationCount: number;
  pendingTaskCount: number;
  userRole: UserRole;
  user: User;
  onLogout: () => void;
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
    const baseItems = [
      { name: 'Dashboard Principal', icon: 'home' },
      { name: 'Importação', icon: 'upload' },
      { name: 'Cartões em Atraso', icon: 'package' },
      { name: 'Análise Dinâmica', icon: 'pie-chart' },
      { name: 'Calculadora', icon: 'calculator' },
      { name: 'Detalhamento', icon: 'list' },
      { name: 'Insights de IA', icon: 'cpu' },
      { name: 'Gestão de Tarefas', icon: 'check-square' },
      { name: 'Notificações', icon: 'bell' },
    ];

    if (userRole === UserRole.Admin || userRole === UserRole.Coordenador) {
      baseItems.push({ name: 'Administração', icon: 'sliders' });
    }

    return baseItems;
  }, [userRole]);

  return (
    <aside className={`fixed top-0 left-0 h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl shadow-2xl z-50 lg:z-30 transition-all transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:w-72 border-r border-slate-200 dark:border-slate-800 duration-300`}>
      <nav className="h-full flex flex-col p-6">
        <div className="flex items-center mb-10 px-2">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full mr-3"></div>
            <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest italic leading-none">PAINEL <span className="text-blue-600">INAD 1.0</span></h2>
        </div>
        
        <ul className="flex-grow space-y-1.5 overflow-y-auto pr-2 custom-scrollbar">
          {navItems.map(item => (
            <li key={item.name}>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setActiveView(item.name); }}
                className={`flex items-center justify-between p-3.5 rounded-2xl transition-all group relative overflow-hidden ${
                  activeView === item.name
                    ? 'bg-blue-600 text-white font-bold shadow-xl shadow-blue-500/30'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <div className="flex items-center relative z-10">
                    <FeatherIcon name={item.icon} className={`h-4 w-4 transition-colors ${activeView === item.name ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'}`} />
                    <span className="ml-4 text-[11px] font-black uppercase tracking-wider">{item.name}</span>
                </div>
                
                <div className="flex items-center gap-1.5 relative z-10">
                  {item.name === 'Notificações' && unreadNotificationCount > 0 && (
                      <span className={`text-[9px] font-black rounded-full h-5 px-1.5 flex items-center justify-center ${activeView === item.name ? 'bg-white text-blue-600' : 'bg-red-500 text-white animate-pulse'}`}>
                          {unreadNotificationCount}
                      </span>
                  )}
                  {item.name === 'Gestão de Tarefas' && pendingTaskCount > 0 && (
                      <span className={`text-[9px] font-black rounded-full h-5 px-1.5 flex items-center justify-center ${activeView === item.name ? 'bg-white text-blue-600' : 'bg-indigo-500 text-white'}`}>
                          {pendingTaskCount}
                      </span>
                  )}
                </div>
                
                {activeView === item.name && (
                   <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-90"></div>
                )}
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-auto border-t border-slate-100 dark:border-white/10 pt-6 px-2">
          <div className="flex items-center gap-3 p-3 mb-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 group hover:border-blue-500/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/20 uppercase italic">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-black text-slate-900 dark:text-white truncate uppercase tracking-tighter leading-none">{user.name}</p>
              <p className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-1.5">
                {user.role} • {user.pa || 'GLOBAL'}
              </p>
            </div>
          </div>

          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 p-4 text-red-500 hover:bg-red-500/10 rounded-2xl transition-all group"
          >
            <div className="p-2 bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transition-colors">
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
