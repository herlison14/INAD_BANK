
import React, { useMemo } from 'react';
import { Contract, UserRole } from '../types';
import KpiCard from './KpiCard';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, BarChart, Bar, PieChart, Pie
} from 'recharts';
import { formatCurrency } from '../utils/formatter';
import FeatherIcon from './FeatherIcon';
import PredictiveAIAlerts from './PredictiveAIAlerts';
import SmartQueryBar from './SmartQueryBar';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';

interface DashboardProps {
    contracts: Contract[];
    filterName: string;
    onNavigateToDetails: (id: string) => void;
    isDarkMode: boolean;
    userRole: UserRole;
}

const Dashboard: React.FC<DashboardProps> = ({ contracts, onNavigateToDetails, isDarkMode, userRole }) => {
  const { lastUpdateTimestamp } = useApp();
  
  const isEmpty = contracts.length === 0;

  // Cálculos Financeiros Sênior (Auditados)
  const stats = useMemo(() => {
    if (isEmpty) return { totalSaldo: 0, totalProv: 0, coverage: 0, count: 0, criticalCount: 0 };
    
    // Total LGD (Exposição Bruta)
    const totalSaldo = contracts.reduce((sum, c) => sum + (c.saldoDevedor || 0), 0);
    // Total PCLD (Provisão)
    const totalProv = contracts.reduce((sum, c) => sum + (c.valorProvisionado || 0), 0);
    // Índice de Cobertura Bancária
    const coverage = totalSaldo > 0 ? (totalProv / totalSaldo) * 100 : 0;
    // Quantidade Crítica (Perdas Reais > 90d)
    const criticalCount = contracts.filter(c => c.daysOverdue > 90).length;

    return { totalSaldo, totalProv, coverage, count: contracts.length, criticalCount };
  }, [contracts, isEmpty]);

  // Buckets de Aging (Envelhecimento da Dívida)
  const agingBuckets = useMemo(() => {
    if (isEmpty) return [];
    const buckets = [
      { range: '0-30d', value: 0 },
      { range: '31-60d', value: 0 },
      { range: '61-90d', value: 0 },
      { range: '90d+', value: 0 },
    ];

    contracts.forEach(c => {
      if (c.daysOverdue <= 30) buckets[0].value += c.saldoDevedor;
      else if (c.daysOverdue <= 60) buckets[1].value += c.saldoDevedor;
      else if (c.daysOverdue <= 90) buckets[2].value += c.saldoDevedor;
      else buckets[3].value += c.saldoDevedor;
    });

    return buckets;
  }, [contracts, isEmpty]);

  const portfolioMix = useMemo(() => {
    if (isEmpty) return [];
    const geral = contracts.filter(c => c.originSheet === 'Geral').reduce((s, c) => s + c.saldoDevedor, 0);
    const cartoes = contracts.filter(c => c.originSheet === 'Cartoes').reduce((s, c) => s + c.saldoDevedor, 0);
    return [
      { name: 'Crédito Estratégico', value: geral, color: '#4f46e5' },
      { name: 'Fluxo Cartões', value: cartoes, color: '#f43f5e' }
    ];
  }, [contracts, isEmpty]);

  const axisColor = isDarkMode ? '#94a3b8' : '#64748b';

  return (
    <div className="space-y-10 animate-fade-in pb-20 max-w-[1600px] mx-auto">
      <AnimatePresence>
        {!isEmpty && lastUpdateTimestamp && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-2xl w-fit mx-auto shadow-lg"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest italic">
              Governança de Dados: Sincronização Consolidada em {lastUpdateTimestamp}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <SmartQueryBar />
      <PredictiveAIAlerts contracts={contracts} onNavigateToDetails={onNavigateToDetails} />

      {/* PAINEL DE INDICADORES CRÍTICOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <KpiCard 
            title="Exposição (LGD)" 
            value={stats.totalSaldo} 
            icon="dollar" 
            trend="Consolidado Y+I" 
        />
        <KpiCard 
            title="Provisão PCLD" 
            value={stats.totalProv} 
            icon="shield" 
            trend="Base Coluna Z" 
        />
        <KpiCard 
            title="Índice de Cobertura" 
            value={`${stats.coverage.toFixed(2)}%`} 
            icon="activity" 
            trend={stats.coverage < 15 ? "Abaixo do Target" : "Ideal: >15%"} 
            isNegativeTrend={stats.coverage < 15}
        />
        <KpiCard 
            title="Loss Expectancy (90d+)" 
            value={stats.criticalCount} 
            icon="alert-circle" 
            trend="Intervenção Imediata"
            isNegativeTrend={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* GRÁFICO: ENVELHECIMENTO DA DÍVIDA (AGING) */}
        <div className="premium-card p-12 rounded-[4rem] shadow-2xl lg:col-span-2 relative overflow-hidden">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">Análise de Aging (Vencimento)</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Exposição Financeira por Janela de Atraso</p>
            </div>
            <div className="p-4 bg-indigo-500/10 rounded-3xl text-indigo-500">
               <FeatherIcon name="clock" className="w-6 h-6" />
            </div>
          </div>
          
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agingBuckets}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="range" stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `R$ ${(val/1000).toFixed(0)}k`} />
                <Tooltip 
                  cursor={{fill: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'}}
                  contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#fff', border: 'none', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }} 
                  formatter={(v: number) => formatCurrency(v)} 
                />
                <Bar dataKey="value" radius={[15, 15, 0, 0]}>
                  {agingBuckets.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 3 ? '#f43f5e' : '#4f46e5'} fillOpacity={0.8 + (index * 0.05)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICO: COMPOSIÇÃO DE CARTEIRA (MIX) */}
        <div className="premium-card p-12 rounded-[4rem] shadow-2xl lg:col-span-1 relative overflow-hidden">
          <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-8 uppercase tracking-tighter italic">Composição do Risco</h3>
          <div className="h-64 mb-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                    data={isEmpty ? [{name: 'Sem Dados', value: 1}] : portfolioMix} 
                    cx="50%" cy="50%" 
                    innerRadius={70} 
                    outerRadius={100} 
                    paddingAngle={8} 
                    dataKey="value"
                >
                  {portfolioMix.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                  {isEmpty && <Cell fill="#334155" />}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-4">
             {portfolioMix.map((item) => (
                <div key={item.name} className="flex justify-between items-center p-5 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 hover:scale-[1.02] transition-transform">
                    <div className="flex items-center gap-4">
                        <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">{item.name}</span>
                    </div>
                    <span className="text-sm font-black italic tabular-nums text-slate-900 dark:text-white">{formatCurrency(item.value)}</span>
                </div>
             ))}
             {isEmpty && (
                <div className="py-10 text-center space-y-4">
                   <FeatherIcon name="package" className="w-12 h-12 mx-auto text-slate-200 dark:text-slate-800" />
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Aguardando Fluxo de Dados</p>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
