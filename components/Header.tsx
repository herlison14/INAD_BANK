
import React from 'react';
import { User } from '../types';
import FeatherIcon from './FeatherIcon';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  onMenuClick: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  currentUser: User;
  onLogout: () => void;
  searchValue: string;
  onSearchChange: (val: string) => void;
  onDataImported: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, darkMode, toggleDarkMode, currentUser, searchValue, onSearchChange, onDataImported }) => {
  const { triggerManualSync } = useApp();

  return (
    <header className="nav-glass p-4 px-6 flex flex-col md:flex-row justify-between items-center sticky top-0 z-40 gap-4 transition-all">
      <div className="flex items-center flex-1 w-full gap-4">
        <button onClick={onMenuClick} className="text-slate-500 lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-xl transition-colors">
          <FeatherIcon name="list" />
        </button>
        
        <div className="hidden sm:flex items-center mr-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none mr-3">
            <span className="text-white font-black text-xl italic">C</span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tighter text-slate-800 dark:text-white italic leading-none">
            CONV-BASE <span className="text-indigo-600">PRO</span>
          </h1>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full max-w-sm group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
            <FeatherIcon name="list" className="h-4 w-4" />
          </div>
          <input 
            type="text" 
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-100/50 dark:bg-slate-800/50 border-none rounded-2xl py-2.5 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all placeholder:text-slate-400"
            placeholder="Buscar por cliente, CPF ou contrato..."
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
        {/* Quick Import Hub */}
        <div className="hidden xl:flex items-center gap-2">
            <div className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700">
                <span>Base Estratégica</span>
            </div>
            <div className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest btn-grad text-white transition-all flex items-center gap-2 cursor-pointer">
                <span>Fluxo Cartões</span>
            </div>
        </div>

        <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 hidden lg:block mx-2"></div>

        <button onClick={toggleDarkMode} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-yellow-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700">
          <FeatherIcon name={darkMode ? "sun" : "moon"} className="h-4 w-4" />
        </button>

        <div className="hidden md:flex flex-col items-end min-w-[100px]">
          <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest leading-none mb-1">Auditado</p>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{currentUser.name.split(' ')[0]}</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
