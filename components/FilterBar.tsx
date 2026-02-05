
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FeatherIcon from './FeatherIcon';
import { Contract } from '../types';

interface FilterBarProps {
  onFilterChange: (filters: { pa: string; gerente: string; produto: string }) => void;
  data: Contract[];
}

const FilterBar: React.FC<FilterBarProps> = ({ onFilterChange, data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    pa: 'Todas',
    gerente: 'Todos',
    produto: 'Todos'
  });

  // Extração dinâmica de opções únicas para evitar duplicidade
  const options = {
    pas: ['Todas', ...Array.from(new Set(data.map(i => i.pa)))],
    gerentes: ['Todos', ...Array.from(new Set(data.filter(i => activeFilters.pa === 'Todas' || i.pa === activeFilters.pa).map(i => i.gerente)))],
    produtos: ['Todos', ...Array.from(new Set(data.map(i => i.product)))]
  };

  const handleUpdateFilter = (key: string, value: string) => {
    const newFilters = { ...activeFilters, [key as keyof typeof activeFilters]: value };
    // Reset de Gerente se a PA mudar para manter a coesão
    if (key === 'pa') newFilters.gerente = 'Todos';
    
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const activeCount = Object.values(activeFilters).filter(v => v !== 'Todas' && v !== 'Todos').length;

  return (
    <div className="w-full mb-8">
      {/* Botão de Controle / Badge de Filtros Ativos */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-3 px-8 py-4 bg-white dark:bg-slate-900 border-2 rounded-[2rem] shadow-sm hover:shadow-xl transition-all text-[11px] font-black uppercase tracking-widest ${isOpen ? 'border-blue-500 text-blue-600' : 'border-slate-100 dark:border-slate-800 text-slate-500'}`}
        >
          <FeatherIcon name="filter" className={`w-4 h-4 ${isOpen ? "text-blue-500" : ""}`} />
          Filtros Avançados {activeCount > 0 && <span className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[9px]">{activeCount}</span>}
          <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            <FeatherIcon name="chevron-down" className="w-4 h-4" />
          </div>
        </button>

        <div className="flex flex-wrap justify-center gap-2">
          <AnimatePresence>
            {Object.entries(activeFilters).map(([key, val]) => val !== 'Todas' && val !== 'Todos' && (
              <motion.span 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                key={key} 
                className="px-4 py-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-full border border-blue-500/20 flex items-center gap-2 uppercase tracking-tighter"
              >
                <span className="opacity-50">{key}:</span> {val} 
                <div 
                    className="cursor-pointer hover:bg-blue-600 hover:text-white rounded-full p-0.5 transition-colors"
                    onClick={() => handleUpdateFilter(key, key === 'pa' ? 'Todas' : 'Todos')}
                >
                    <FeatherIcon name="x" className="w-3 h-3" />
                </div>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Painel de Filtros Expandível */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl">
              
              {/* Filtro de PA */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-2 tracking-widest">
                  <FeatherIcon name="map-pin" className="w-3.5 h-3.5" /> Ponto de Atendimento
                </label>
                <select 
                  className="w-full h-14 px-6 bg-white dark:bg-slate-950 rounded-2xl border-none ring-2 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-blue-500 text-sm font-bold appearance-none transition-all outline-none"
                  value={activeFilters.pa}
                  onChange={(e) => handleUpdateFilter('pa', e.target.value)}
                >
                  {options.pas.map(pa => <option key={pa} value={pa}>{pa}</option>)}
                </select>
              </div>

              {/* Filtro de Gerente */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-2 tracking-widest">
                  <FeatherIcon name="user" className="w-3.5 h-3.5" /> Gerente Responsável
                </label>
                <select 
                  className="w-full h-14 px-6 bg-white dark:bg-slate-950 rounded-2xl border-none ring-2 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-blue-500 text-sm font-bold transition-all appearance-none outline-none"
                  value={activeFilters.gerente}
                  onChange={(e) => handleUpdateFilter('gerente', e.target.value)}
                >
                  {options.gerentes.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              {/* Filtro de Produto */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-2 tracking-widest">
                  <FeatherIcon name="package" className="w-3.5 h-3.5" /> Tipo de Produto
                </label>
                <select 
                  className="w-full h-14 px-6 bg-white dark:bg-slate-950 rounded-2xl border-none ring-2 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-blue-500 text-sm font-bold appearance-none transition-all outline-none"
                  value={activeFilters.produto}
                  onChange={(e) => handleUpdateFilter('produto', e.target.value)}
                >
                  {options.produtos.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilterBar;
