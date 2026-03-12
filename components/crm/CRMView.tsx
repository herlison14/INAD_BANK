
'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  Users, 
  Building2, 
  Calendar as CalendarIcon, 
  BarChart3, 
  Zap, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  ChevronRight,
  LayoutGrid,
  List
} from 'lucide-react';
import Pipeline from './Pipeline';
import Contacts from './Contacts';
import Organizations from './Organizations';
import Activities from './Activities';
import CRMDashboard from './CRMDashboard';
import Automations from './Automations';

type CRMTab = 'pipeline' | 'contacts' | 'organizations' | 'activities' | 'reports' | 'automations';

const CRMView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CRMTab>('pipeline');
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'pipeline', label: 'Funil de Vendas', icon: Briefcase },
    { id: 'contacts', label: 'Contatos', icon: Users },
    { id: 'organizations', label: 'Empresas', icon: Building2 },
    { id: 'activities', label: 'Atividades', icon: CalendarIcon },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
    { id: 'automations', label: 'Automações', icon: Zap },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'pipeline': return <Pipeline searchTerm={searchTerm} />;
      case 'contacts': return <Contacts searchTerm={searchTerm} />;
      case 'organizations': return <Organizations searchTerm={searchTerm} />;
      case 'activities': return <Activities />;
      case 'reports': return <CRMDashboard />;
      case 'automations': return <Automations />;
      default: return <Pipeline searchTerm={searchTerm} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl">
      {/* Header do CRM */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">
            CRM de <span className="text-emerald-500">Vendas</span>
          </h1>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">
            Gestão completa do ciclo de vida do cliente
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar no CRM..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 transition-all w-64"
            />
          </div>
          
          <button className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-emerald-500 hover:text-white transition-all">
            <Filter className="w-4 h-4" />
          </button>

          <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all">
            <Plus className="w-4 h-4" />
            Novo Negócio
          </button>
        </div>
      </header>

      {/* Navegação de Abas */}
      <nav className="bg-white dark:bg-slate-900 px-8 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as CRMTab)}
              className={`flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${
                isActive 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
              {tab.label}
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-t-full"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Conteúdo Principal */}
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full w-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default CRMView;
