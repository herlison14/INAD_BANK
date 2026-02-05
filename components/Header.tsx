
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
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, darkMode, toggleDarkMode, currentUser, searchValue, onSearchChange }) => {
  const { syncStatus, lastSync, triggerManualSync } = useApp();

  return (
    <header className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 p-4 flex justify-between items-center sticky top-0 z-40">
      <div className="flex items-center flex-1">
        <button onClick={onMenuClick} className="text-slate-500 lg:hidden mr-4 hover:bg-slate-100 p-2 rounded-xl transition-colors">
          <FeatherIcon name="list" />
        </button>
        
        <div className="hidden sm:flex items-center mr-8">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/30 mr-3">
            <FeatherIcon name="cpu" className="text-white h-5 w-5" />
          </div>
          <h1 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter italic leading-none">
            RECOVERY <span className="text-blue-600">3.5</span>
          </h1>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full max-w-md group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <FeatherIcon name="list" className="h-4 w-4" />
          </div>
          <input 
            type="text" 
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-2xl py-2.5 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 dark:text-white transition-all placeholder:text-slate-400"
            placeholder="Buscar por cliente, CPF ou contrato..."
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4 ml-4">
        {/* Sync Status Hub */}
        <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl">
           <div className="flex flex-col items-end">
             <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Data Sync</span>
             <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 tabular-nums leading-none">{lastSync}</span>
           </div>
           <button 
            onClick={triggerManualSync}
            className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${syncStatus === 'syncing' ? 'animate-spin bg-blue-100 text-blue-600' : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'}`}
           >
             <div className={`w-2 h-2 rounded-full ${syncStatus === 'online' ? 'bg-green-500' : 'bg-blue-500'} animate-pulse`} />
           </button>
        </div>

        <div className="hidden md:flex flex-col items-end mr-2">
          <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">Nível Sênior</p>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{currentUser.name}</p>
        </div>

        <button onClick={toggleDarkMode} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-yellow-400 hover:bg-slate-200 transition-all border border-slate-200 dark:border-slate-700">
          <FeatherIcon name={darkMode ? "sun" : "moon"} className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};

export default Header;
