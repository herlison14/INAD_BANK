
import React, { useMemo } from 'react';
import { DealStatus } from '../types';
import DashboardKpiGrid from './DashboardKpiGrid';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, BarChart, Bar, PieChart, Pie
} from 'recharts';
import FeatherIcon from './FeatherIcon';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

const Dashboard: React.FC = () => {
  const { deals, stages } = useApp();
  
  const isEmpty = deals.length === 0;

  const pipelineData = useMemo(() => {
    return stages.map(stage => ({
      name: stage.name,
      value: deals.filter(d => d.stageId === stage.id).reduce((acc, d) => acc + d.value, 0),
      count: deals.filter(d => d.stageId === stage.id).length
    }));
  }, [deals, stages]);

  const statusMix = useMemo(() => {
    const won = deals.filter(d => d.status === DealStatus.Won).reduce((acc, d) => acc + d.value, 0);
    const lost = deals.filter(d => d.status === DealStatus.Lost).reduce((acc, d) => acc + d.value, 0);
    const open = deals.filter(d => d.status === DealStatus.Open).reduce((acc, d) => acc + d.value, 0);
    
    return [
      { name: 'Ganhos', value: won, color: '#10b981' },
      { name: 'Perdidos', value: lost, color: '#ef4444' },
      { name: 'Em Aberto', value: open, color: '#3b82f6' }
    ];
  }, [deals]);

  return (
    <div className="space-y-10 animate-fade-in pb-20 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Dashboard de Vendas</h1>
          <p className="text-slate-400 text-sm">Visão geral da performance comercial</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-[#1a1f2e] border border-[#2e3347] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#2e3347] transition-all flex items-center gap-2">
            <FeatherIcon name="download" className="w-4 h-4" /> Exportar
          </button>
        </div>
      </div>

      {/* PAINEL DE INDICADORES CRÍTICOS */}
      <DashboardKpiGrid deals={deals} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* GRÁFICO: VALOR POR ETAPA DO PIPELINE */}
        <div className="bg-[#1a1f2e] p-8 rounded-3xl border border-[#2e3347] shadow-2xl lg:col-span-2">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Valor por Etapa</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Distribuição financeira no funil</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400">
               <FeatherIcon name="bar-chart-2" className="w-6 h-6" />
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2e3347" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `R$ ${(val/1000).toFixed(0)}k`} />
                <Tooltip 
                  cursor={{fill: '#2e3347', fillOpacity: 0.4}}
                  contentStyle={{ backgroundColor: '#1a1f2e', border: '1px solid #2e3347', borderRadius: '16px', color: '#fff' }} 
                  formatter={(v: any) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICO: COMPOSIÇÃO DE STATUS */}
        <div className="bg-[#1a1f2e] p-8 rounded-3xl border border-[#2e3347] shadow-2xl lg:col-span-1">
          <h3 className="text-xl font-black text-white mb-8 uppercase tracking-tighter italic">Composição de Status</h3>
          <div className="h-64 mb-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                    data={isEmpty ? [{name: 'Sem Dados', value: 1}] : statusMix} 
                    cx="50%" cy="50%" 
                    innerRadius={60} 
                    outerRadius={90} 
                    paddingAngle={8} 
                    dataKey="value"
                >
                  {statusMix.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                  {isEmpty && <Cell fill="#2e3347" />}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1f2e', border: '1px solid #2e3347', borderRadius: '16px', color: '#fff' }}
                  formatter={(v: any) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-3">
             {statusMix.map((item) => (
                <div key={item.name} className="flex justify-between items-center p-4 rounded-2xl bg-[#0f1117] border border-[#2e3347]">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{item.name}</span>
                    </div>
                    <span className="text-xs font-bold text-white">{item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
