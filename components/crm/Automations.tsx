
'use client';

import React, { useState } from 'react';
import { 
  Zap, 
  Plus, 
  Play, 
  Pause, 
  Trash2, 
  Edit2, 
  ChevronRight, 
  Mail, 
  MessageSquare, 
  Bell, 
  ArrowRight,
  Settings,
  Clock,
  CheckCircle2
} from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  active: boolean;
  trigger: string;
  action: string;
  lastRun?: string;
}

const Automations: React.FC = () => {
  const [rules, setRules] = useState<AutomationRule[]>([
    { id: '1', name: 'Boas-vindas a Novos Leads', description: 'Envia e-mail automático quando um novo lead é criado via formulário.', active: true, trigger: 'Novo Lead Criado', action: 'Enviar E-mail', lastRun: 'Há 2 horas' },
    { id: '2', name: 'Alerta de Negócio Parado', description: 'Cria tarefa para o vendedor se o negócio ficar 5 dias na mesma etapa.', active: true, trigger: 'Negócio Inativo > 5 dias', action: 'Criar Tarefa', lastRun: 'Há 1 dia' },
    { id: '3', name: 'Notificar Slack - Negócio Ganho', description: 'Envia mensagem no canal de vendas quando um negócio é fechado.', active: false, trigger: 'Negócio Ganho', action: 'Notificar Slack', lastRun: 'Nunca' },
  ]);

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Header Local */}
      <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Fluxos de Automação</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Otimize seu processo de vendas com gatilhos inteligentes</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all">
          <Plus className="w-4 h-4" />
          Criar Automação
        </button>
      </div>

      {/* Lista de Automações */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {rules.map((rule) => (
          <div key={rule.id} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 hover:shadow-2xl transition-all group relative overflow-hidden">
            {/* Indicador de Status */}
            <div className={`absolute left-0 top-0 bottom-0 w-2 ${rule.active ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">{rule.name}</h3>
                  <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${rule.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {rule.active ? 'Ativo' : 'Pausado'}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 max-w-2xl">{rule.description}</p>
              </div>

              {/* Visualização do Fluxo */}
              <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="text-center px-4">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Gatilho</p>
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-900 dark:text-white uppercase">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    {rule.trigger}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300" />
                <div className="text-center px-4">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Ação</p>
                  <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {rule.action}
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center gap-2">
                <div className="text-right mr-4 hidden xl:block">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Última Execução</p>
                  <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase">{rule.lastRun}</p>
                </div>
                <button 
                  onClick={() => setRules(prev => prev.map(r => r.id === rule.id ? { ...r, active: !r.active } : r))}
                  className={`p-3 rounded-xl transition-all ${rule.active ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                >
                  {rule.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 rounded-xl transition-all">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button className="p-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Template de Automação */}
        <div className="bg-emerald-500/5 border-2 border-dashed border-emerald-500/20 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center group hover:bg-emerald-500/10 transition-all cursor-pointer">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Explorar Templates</h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Comece rápido com fluxos pré-configurados</p>
        </div>
      </div>
    </div>
  );
};

export default Automations;
