
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

  const options = {
    pas: ['Todas', ...Array.from(new Set(data.map(i => i.pa)))],
    gerentes: ['Todos', ...Array.from(new Set(data.filter(i => activeFilters.pa === 'Todas' || i.pa === activeFilters.pa).map(i => i.gerente)))],
    produtos: ['Todos', ...Array.from(new Set(data.map(i => i.product)))]
  };

  const handleUpdateFilter = (key: string, value: string) => {
    const newFilters = { ...activeFilters, [key as keyof typeof activeFilters]: value };
    if (key === 'pa') newFilters.gerente = 'Todos';
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const activeCount = Object.values(activeFilters).filter(v => v !== 'Todas' && v !== 'Todos').length;

  return (
    <div className="w-full mb-10">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`group flex items-center gap-4 px-10 py-5 bg-white dark:bg-slate-900 border-2 rounded-[2.5rem] shadow-xl transition-all text-[11px] font-black uppercase tracking-[0.2em] ${isOpen ? 'border-indigo-500 text-indigo-600' : 'border-slate-100 dark:border-slate-800 text-slate-500'}`}
        >
          <FeatherIcon name="filter" className={`w-4 h-4 transition-transform group-hover:scale-125 ${isOpen ? "text-indigo-500" : ""}`} />
          Filtros de Alçada {activeCount > 0 && <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] shadow-lg shadow-indigo-600/30">{activeCount}</span>}
          <div className={`transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`}>
            <FeatherIcon name="chevron-down" className="w-4 h-4" />
          </div>
        </button>

        <div className="flex flex-wrap justify-center gap-3">
          <AnimatePresence>
            {Object.entries(activeFilters).map(([key, val]) => val !== 'Todas' && val !== 'Todos' && (
              <motion.span 
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                key={key} 
                className="px-5 py-2.5 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-2xl border border-indigo-500/10 shadow-sm flex items-center gap-3 uppercase tracking-widest italic"
              >
                <span className="opacity-40">{key === 'pa' ? 'Unidade' : key}:</span> {val} 
                <div 
                    className="cursor-pointer bg-slate-100 dark:bg-slate-800 hover:bg-red-500 hover:text-white rounded-lg p-1 transition-all"
                    onClick={() => handleUpdateFilter(key, key === 'pa' ? 'Todas' : 'Todos')}
                >
                    <FeatherIcon name="x" className="w-3 h-3" />
                </div>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-12 bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl rounded-[3.5rem] border border-slate-200/50 dark:border-slate-800 shadow-3xl">
              
              <div className="space-y-4">
                <label className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-3 tracking-[0.3em]">
                  <FeatherIcon name="map-pin" className="w-4 h-4 text-indigo-500" /> Regional Sicoob
                </label>
                <select 
                  className="w-full h-16 px-8 bg-white dark:bg-slate-950 rounded-[2rem] border-none shadow-inner ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-indigo-500 text-sm font-black transition-all appearance-none outline-none cursor-pointer"
                  value={activeFilters.pa}
                  onChange={(e) => handleUpdateFilter('pa', e.target.value)}
                >
                  {options.pas.map(pa => <option key={pa} value={pa}>{pa}</option>)}
                </select>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-3 tracking-[0.3em]">
                  <FeatherIcon name="user" className="w-4 h-4 text-indigo-500" /> Gestor de Negócios
                </label>
                <select 
                  className="w-full h-16 px-8 bg-white dark:bg-slate-950 rounded-[2rem] border-none shadow-inner ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-indigo-500 text-sm font-black transition-all appearance-none outline-none cursor-pointer"
                  value={activeFilters.gerente}
                  onChange={(e) => handleUpdateFilter('gerente', e.target.value)}
                >
                  {options.gerentes.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-3 tracking-[0.3em]">
                  <FeatherIcon name="package" className="w-4 h-4 text-indigo-500" /> Modalidade Ativa
                </label>
                <select 
                  className="w-full h-16 px-8 bg-white dark:bg-slate-950 rounded-[2rem] border-none shadow-inner ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-indigo-500 text-sm font-black transition-all appearance-none outline-none cursor-pointer"
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
