
import React, { useMemo } from 'react';
import { Contract, ContractStatus, UserRole } from '../types';
import KpiCard from './KpiCard';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, AreaChart, Area, BarChart, Bar
} from 'recharts';
import { formatCurrency } from '../utils/formatter';
import FeatherIcon from './FeatherIcon';
import PredictiveAIAlerts from './PredictiveAIAlerts';
import SmartQueryBar from './SmartQueryBar';
import { motion } from 'framer-motion';

interface DashboardProps {
    contracts: Contract[];
    filterName: string;
    onNavigateToDetails: (id: string) => void;
    isDarkMode: boolean;
    userRole: UserRole;
    onGoToImport?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ contracts, onNavigateToDetails, isDarkMode, userRole, onGoToImport }) => {
  const isEmpty = contracts.length === 0;
  const activeContracts = useMemo(() => contracts.filter(c => c.status !== ContractStatus.Resolved), [contracts]);

  const statsData = useMemo(() => {
    if (isEmpty) return { totalSaldo: 0, totalProv: 0, ticketMedio: 0, highRiskCount: 0, count: 0 };
    const totalSaldo = activeContracts.reduce((sum, c) => sum + c.saldoDevedor, 0);
    const totalProv = activeContracts.reduce((sum, c) => sum + c.valorProvisionado, 0);
    const ticketMedio = activeContracts.length > 0 ? totalSaldo / activeContracts.length : 0;
    const highRiskCount = activeContracts.filter(c => c.daysOverdue > 90).length;

    return { totalSaldo, totalProv, ticketMedio, highRiskCount, count: activeContracts.length };
  }, [activeContracts, isEmpty]);

  const ageingData = useMemo(() => {
    if (isEmpty) return [];
    const categories = {
      '1-30d': 0, '31-60d': 0, '61-90d': 0, '91-180d': 0, '181-365d': 0, '365d+': 0
    };
    activeContracts.forEach(c => {
      if (c.daysOverdue <= 30) categories['1-30d'] += c.saldoDevedor;
      else if (c.daysOverdue <= 60) categories['31-60d'] += c.saldoDevedor;
      else if (c.daysOverdue <= 90) categories['61-90d'] += c.saldoDevedor;
      else if (c.daysOverdue <= 180) categories['91-180d'] += c.saldoDevedor;
      else if (c.daysOverdue <= 365) categories['181-365d'] += c.saldoDevedor;
      else categories['365d+'] += c.saldoDevedor;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [activeContracts, isEmpty]);

  if (isEmpty) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[75vh] text-center p-6"
      >
        <div className="bg-[#020617] p-16 rounded-[5rem] shadow-4xl border border-white/5 max-w-4xl relative overflow-hidden group">
          {/* Fundo Decorativo */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-transparent pointer-events-none"></div>
          <div className="absolute -bottom-32 -right-32 p-8 opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-all duration-[5s]">
            <FeatherIcon name="cpu" className="w-[30rem] h-[30rem] text-white" />
          </div>
          
          <div className="relative z-10">
            <div className="bg-blue-600/20 p-8 rounded-[2.5rem] w-fit mx-auto mb-12 border border-blue-500/20 shadow-2xl">
              <FeatherIcon name="zap" className="w-16 h-16 text-blue-400 animate-pulse" />
            </div>
            
            <h2 className="text-7xl font-black text-white uppercase tracking-tighter italic leading-[0.9] mb-8">
              PROTOCOLOS EM <br/> <span className="text-blue-500">STANDBY</span>
            </h2>
            
            <p className="text-slate-400 font-bold uppercase text-[11px] tracking-[0.5em] mb-16 leading-relaxed max-w-lg mx-auto opacity-60">
              Nenhuma carga de ativos foi detectada no diretório auditado. O sistema aguarda injeção de base estratégica (Col A-AB) ou fluxo de cartões (Col A-N).
            </p>
            
            <button 
              onClick={onGoToImport}
              className="group bg-blue-600 hover:bg-blue-700 text-white px-20 py-8 rounded-[3rem] font-black uppercase text-[13px] tracking-[0.4em] shadow-3xl shadow-blue-600/40 transition-all flex items-center gap-6 mx-auto active:scale-95"
            >
              Iniciar Protocolo de Injeção
              <FeatherIcon name="upload" className="w-5 h-5 transition-transform group-hover:-translate-y-1" />
            </button>
          </div>
        </div>
        
        <div className="mt-16 flex gap-12 opacity-30">
            <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Segurança</span>
                <FeatherIcon name="shield" className="w-6 h-6 text-slate-500" />
            </div>
            <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Auditado</span>
                <FeatherIcon name="check-circle" className="w-6 h-6 text-slate-500" />
            </div>
            <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Sincro</span>
                <FeatherIcon name="refresh-cw" className="w-6 h-6 text-slate-500" />
            </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      <SmartQueryBar />
      <PredictiveAIAlerts contracts={contracts} onNavigateToDetails={onNavigateToDetails} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <KpiCard title="Saldo em Atraso" value={statsData.totalSaldo} icon="dollar" trend="+3.2%" />
        <KpiCard title="Total Provisionado" value={statsData.totalProv} icon="package" trend="-1.5%" isNegativeTrend />
        <KpiCard title="Ticket Médio" value={statsData.ticketMedio} icon="ticket" trend="+0.8%" />
        <KpiCard title="Risco Crítico (>90d)" value={statsData.highRiskCount} icon="clock" trend="+12%" isNegativeTrend />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="premium-card p-12 rounded-[4rem] shadow-2xl">
          <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic mb-12">Performance de Recuperação</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { month: 'Set', real: 420000 }, { month: 'Out', real: 380000 }, { month: 'Nov', real: 510000 }, { month: 'Dez', real: 640000 }
              ]}>
                <defs>
                  <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="month" stroke={isDarkMode ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke={isDarkMode ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#fff', border: 'none', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="real" stroke="#4f46e5" strokeWidth={5} fillOpacity={1} fill="url(#colorReal)" name="Realizado" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="premium-card p-12 rounded-[4rem] shadow-2xl">
          <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-12 uppercase tracking-tighter italic">Ageing Financeiro</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageingData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="name" stroke={isDarkMode ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke={isDarkMode ? '#94a3b8' : '#64748b'} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#fff', border: 'none', borderRadius: '24px' }}
                  formatter={(val: number) => [formatCurrency(val), 'Saldo']}
                />
                <Bar dataKey="value" fill="#4f46e5" radius={[16, 16, 0, 0]} barSize={50}>
                    {ageingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fillOpacity={1 - index * 0.12} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
