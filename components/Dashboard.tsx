
import React, { useMemo } from 'react';
import { Contract, UserRole } from '../types';
import DashboardKpiGrid from './DashboardKpiGrid';
import SheetBreakdownGrid from './SheetBreakdownGrid';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, BarChart, Bar, PieChart, Pie
} from 'recharts';
import { formatCurrency } from '../utils/formatter';
import FeatherIcon from './FeatherIcon';
import SmartQueryBar from './SmartQueryBar';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';

interface DashboardProps {
    contracts: Contract[];
    filterName: string;
    onNavigateToDetails: (id: string) => void;
    onCardClick?: (key: string) => void;
    isDarkMode: boolean;
    userRole: UserRole;
}

const Dashboard: React.FC<DashboardProps> = ({ contracts, onNavigateToDetails, onCardClick, isDarkMode, userRole }) => {
  const { lastUpdateTimestamp } = useApp();
  
  const isEmpty = contracts.length === 0;

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
    const prejuizo = contracts.filter(c => c.originSheet === 'Prejuizo').reduce((s, c) => s + c.saldoDevedor, 0);
    return [
      { name: 'Crédito Estratégico', value: geral, color: 'var(--brand-primary)' },
      { name: 'Fluxo Cartões', value: cartoes, color: 'var(--status-error)' },
      { name: 'Prejuízo (PREJ 02)', value: prejuizo, color: '#f59e0b' } // amber-500
    ];
  }, [contracts, isEmpty]);

  const axisColor = isDarkMode ? 'var(--text-secondary)' : 'var(--text-secondary)';

  return (
    <div className="space-y-10 animate-fade-in pb-20 max-w-[1600px] mx-auto">
      <AnimatePresence>
        {!isEmpty && lastUpdateTimestamp && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="flex items-center gap-3 bg-[var(--status-success)]/10 border border-[var(--status-success)]/20 px-6 py-3 rounded-2xl w-fit mx-auto shadow-lg"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--status-success)] animate-pulse" />
            <span className="text-[10px] font-black text-[var(--status-success)] uppercase tracking-widest italic">
              Governança de Dados: Sincronização Consolidada em {lastUpdateTimestamp}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <SmartQueryBar />

      {/* PAINEL DE INDICADORES CRÍTICOS */}
      <DashboardKpiGrid contratos={contracts} onCardClick={onCardClick} />

      {/* BREAKDOWN POR PLANILHA IMPORTADA */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 ml-4">
          <div className="w-3 h-3 bg-[var(--brand-primary)] rounded-full"></div>
          <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tighter italic">Performance por Canal de Origem</h3>
        </div>
        <SheetBreakdownGrid contracts={contracts} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* GRÁFICO: ENVELHECIMENTO DA DÍVIDA (AGING) */}
        <div className="premium-card p-12 rounded-[4rem] shadow-2xl lg:col-span-2 relative overflow-hidden">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">Análise de Aging (Vencimento)</h3>
              <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-1">Exposição Financeira por Janela de Atraso</p>
            </div>
            <div className="p-4 bg-[var(--brand-primary)]/10 rounded-3xl text-[var(--brand-primary)]">
               <FeatherIcon name="clock" className="w-6 h-6" />
            </div>
          </div>
          
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agingBuckets}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-default)" />
                <XAxis dataKey="range" stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `R$ ${(val/1000).toFixed(0)}k`} />
                <Tooltip 
                  cursor={{fill: 'var(--surface-elevated)', fillOpacity: 0.1}}
                  contentStyle={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border-default)', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', color: 'var(--text-primary)' }} 
                  itemStyle={{ color: 'var(--text-primary)' }}
                  formatter={(v: any) => formatCurrency(Number(v || 0))} 
                />
                <Bar dataKey="value" radius={[15, 15, 0, 0]}>
                  {agingBuckets.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 3 ? 'var(--status-error)' : 'var(--brand-primary)'} fillOpacity={0.8 + (index * 0.05)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICO: COMPOSIÇÃO DE CARTEIRA (MIX) */}
        <div className="premium-card p-12 rounded-[4rem] shadow-2xl lg:col-span-1 relative overflow-hidden">
          <h3 className="text-2xl font-black text-[var(--text-primary)] mb-8 uppercase tracking-tighter italic">Composição do Risco</h3>
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
                  {isEmpty && <Cell fill="var(--border-default)" />}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border-default)', borderRadius: '16px', color: 'var(--text-primary)' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                  formatter={(v: any) => formatCurrency(Number(v || 0))} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-4">
             {portfolioMix.map((item, index) => (
                <div key={item.name} className="flex justify-between items-center p-5 rounded-[2rem] bg-[var(--surface-background)] border border-[var(--border-default)] hover:scale-[1.02] transition-transform">
                    <div className="flex items-center gap-4">
                        <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                        <span className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-wider">{item.name}</span>
                    </div>
                    <span className="text-sm font-black italic tabular-nums text-[var(--text-primary)]">{formatCurrency(item.value)}</span>
                </div>
             ))}
             {isEmpty && (
                <div className="py-10 text-center space-y-4">
                   <FeatherIcon name="package" className="w-12 h-12 mx-auto text-[var(--border-default)]" />
                   <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.4em]">Aguardando Fluxo de Dados</p>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
