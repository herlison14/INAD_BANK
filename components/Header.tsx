
import React from 'react';
import { User } from '../types';
import FeatherIcon from './FeatherIcon';

interface HeaderProps {
  onMenuClick: () => void;
  currentUser: User;
  onLogout: () => void;
  searchValue: string;
  onSearchChange: (val: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, currentUser, searchValue, onSearchChange }) => {
  return (
    <header className="bg-[#1a1f2e]/80 backdrop-blur-xl border-b border-[#2e3347] p-4 px-6 md:px-10 flex flex-col md:flex-row justify-between items-center sticky top-0 z-40 gap-4 transition-all">
      <div className="flex items-center flex-1 w-full gap-4">
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg bg-[#2e3347] text-white">
          <FeatherIcon name="menu" className="w-5 h-5" />
        </button>
        
        <div className="flex items-center mr-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 mr-3">
            <span className="text-white font-black text-xl italic">C</span>
          </div>
          <h1 className="text-xl font-black tracking-tighter text-white italic leading-none">
            CRM <span className="text-blue-500">PROJETOS</span>
          </h1>
        </div>
 
        {/* Global Search Bar */}
        <div className="relative w-full max-w-sm group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
            <FeatherIcon name="search" className="h-4 w-4" />
          </div>
          <input 
            type="text" 
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#0f1117] border-2 border-[#2e3347] rounded-2xl py-2.5 pl-11 pr-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 text-white transition-all placeholder:text-slate-500"
            placeholder="Buscar negócios, contatos ou empresas..."
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
        <div className="hidden xl:flex items-center gap-2">
            <button className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20">
                <FeatherIcon name="plus" className="w-3 h-3" />
                <span>Novo Negócio</span>
            </button>
        </div>

        <div className="w-px h-8 bg-[#2e3347] hidden lg:block mx-2"></div>

        <button className="p-2.5 rounded-xl bg-[#0f1117] text-slate-400 hover:bg-[#2e3347] transition-all border border-[#2e3347] relative">
          <FeatherIcon name="bell" className="h-4 w-4" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0f1117]"></span>
        </button>

        <div className="hidden md:flex flex-col items-end min-w-[100px]">
          <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">{currentUser.role}</p>
          <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
