
import React, { useMemo } from 'react';
import FeatherIcon from './FeatherIcon';
import { UserRole, User, ViewName, VIEWS } from '../types';

interface SidebarProps {
  isOpen: boolean;
  activeView: ViewName;
  setActiveView: (view: ViewName) => void;
  unreadNotificationCount: number;
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
    isOpen, 
    activeView, 
    setActiveView, 
    unreadNotificationCount, 
    user,
    onLogout
}) => {
  
  const navItems = useMemo(() => {
    const items: { name: ViewName; icon: string; label: string }[] = [
      { name: VIEWS.DASHBOARD, icon: 'home', label: 'Dashboard' },
      { name: VIEWS.PIPELINE, icon: 'layers', label: 'Pipeline' },
      { name: VIEWS.NEGOCIOS, icon: 'briefcase', label: 'Negócios' },
      { name: VIEWS.CONTATOS, icon: 'users', label: 'Contatos' },
      { name: VIEWS.EMPRESAS, icon: 'grid', label: 'Empresas' },
      { name: VIEWS.AGENDA, icon: 'calendar', label: 'Agenda' },
      { name: VIEWS.PRODUTOS, icon: 'package', label: 'Produtos' },
      { name: VIEWS.RELATORIOS, icon: 'pie-chart', label: 'Relatórios' },
      { name: VIEWS.AUTOMACOES, icon: 'zap', label: 'Automações' },
      { name: VIEWS.NOTIFICACOES, icon: 'bell', label: 'Notificações' },
    ];

    if (user.role === UserRole.Admin || user.role === UserRole.Manager) {
      items.push({ name: VIEWS.ADMINISTRACAO, icon: 'settings', label: 'Administração' });
    }

    return items;
  }, [user.role]);

  return (
    <aside className={`fixed top-0 left-0 h-full bg-[#1a1f2e] shadow-2xl z-50 lg:z-30 transition-all transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:w-72 border-r border-[#2e3347] duration-300`}>
      <nav className="h-full flex flex-col p-6">
        <div className="flex items-center mb-10 px-2">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full mr-3"></div>
            <h2 className="text-sm font-black text-white uppercase tracking-widest italic leading-none">CRM <span className="text-blue-500">PROJETOS</span></h2>
        </div>
        
        <ul className="flex-grow space-y-1 overflow-y-auto pr-2 custom-scrollbar">
          {navItems.map((item, index) => (
            <li key={`${item.name}-${index}`}>
              <button
                onClick={() => setActiveView(item.name)}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all group relative overflow-hidden ${
                  activeView === item.name
                    ? 'bg-blue-600 text-white font-bold shadow-xl shadow-blue-500/30'
                    : 'text-slate-400 hover:bg-[#2e3347] hover:text-white'
                }`}
              >
                <div className="flex items-center relative z-10">
                    <FeatherIcon name={item.icon} className={`h-4 w-4 transition-colors ${activeView === item.name ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
                    <span className="ml-4 text-[11px] font-black uppercase tracking-wider">{item.label}</span>
                </div>
                
                {item.name === VIEWS.NOTIFICACOES && unreadNotificationCount > 0 && (
                    <span className={`relative z-10 text-[9px] font-black rounded-full h-5 px-1.5 flex items-center justify-center ${activeView === item.name ? 'bg-white text-blue-600' : 'bg-red-500 text-white animate-pulse'}`}>
                        {unreadNotificationCount}
                    </span>
                )}
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-auto border-t border-[#2e3347] pt-6 px-2">
          <div className="flex items-center gap-3 p-3 mb-4 bg-[#0f1117] rounded-2xl border border-[#2e3347] group hover:border-blue-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/20 uppercase italic">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-black text-white truncate uppercase tracking-tighter leading-none">{user.name}</p>
              <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mt-1.5">
                {user.role}
              </p>
            </div>
          </div>

          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 p-4 text-red-500 hover:bg-red-500/10 rounded-2xl transition-all group"
          >
            <FeatherIcon name="log-out" className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sair</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
