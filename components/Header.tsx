
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

const Header: React.FC<HeaderProps> = ({ darkMode, toggleDarkMode, currentUser, searchValue, onSearchChange, onDataImported }) => {
  const { triggerManualSync } = useApp();

  return (
    <header className="bg-[var(--surface-container)]/80 backdrop-blur-xl border-b border-[var(--border-default)] p-4 px-10 flex flex-col md:flex-row justify-between items-center sticky top-0 z-40 gap-4 transition-all">
      <div className="flex items-center flex-1 w-full gap-4">
        <div className="flex items-center mr-4">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mr-3">
            <span className="text-white font-black text-xl italic">P</span>
          </div>
          <h1 className="text-xl font-black tracking-tighter text-[var(--text-primary)] italic leading-none">
            PAINEL <span className="text-emerald-600">INAD 1.0</span>
          </h1>
        </div>
 
        {/* Global Search Bar */}
        <div className="relative w-full max-w-sm group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-secondary)] group-focus-within:text-emerald-500 transition-colors">
            <FeatherIcon name="search" className="h-4 w-4" />
          </div>
          <input 
            type="text" 
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[var(--surface-background)] border-2 border-[var(--border-default)] rounded-2xl py-2.5 pl-11 pr-4 text-sm font-black focus:ring-2 focus:ring-emerald-500 text-[var(--text-primary)] transition-all placeholder:text-[var(--text-secondary)]"
            placeholder="Buscar por cliente, CPF ou contrato..."
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
        {/* Quick Import Hub */}
        <div className="hidden xl:flex items-center gap-2">
            <div className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[var(--surface-background)] text-[var(--text-secondary)] border border-[var(--border-default)] transition-all flex items-center gap-2 cursor-pointer hover:bg-[var(--surface-elevated)]">
                <span>Base Estratégica</span>
            </div>
            <div className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[var(--brand-primary)] text-white transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20">
                <span>Fluxo Cartões</span>
            </div>
        </div>

        <div className="w-px h-8 bg-[var(--border-default)] hidden lg:block mx-2"></div>

        <button onClick={toggleDarkMode} className="p-2.5 rounded-xl bg-[var(--surface-background)] text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] transition-all border border-[var(--border-default)]">
          <FeatherIcon name={darkMode ? "sun" : "moon"} className="h-4 w-4" />
        </button>

        <div className="hidden md:flex flex-col items-end min-w-[100px]">
          <p className="text-[9px] font-black text-[var(--brand-primary)] uppercase tracking-widest leading-none mb-1">Auditado</p>
          <p className="text-xs font-bold text-[var(--text-primary)] truncate">{currentUser.name.split(' ')[0]}</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
