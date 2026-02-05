
import React, { useMemo } from 'react';
import { Contract, ContractStatus, UserRole } from '../types';
import KpiCard from './KpiCard';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar
} from 'recharts';
import ContractCard from './ContractCard';
import { formatCurrency } from '../utils/formatter';
import FeatherIcon from './FeatherIcon';
import PredictiveAIAlerts from './PredictiveAIAlerts';
import SmartQueryBar from './SmartQueryBar';

interface DashboardProps {
    contracts: Contract[]; // Estes dados já vêm filtrados por segurança no App.tsx
    filterName: string;
    onNavigateToDetails: (id: string) => void;
    isDarkMode: boolean;
    userRole: UserRole;
}

const Dashboard: React.FC<DashboardProps> = ({ contracts, onNavigateToDetails, isDarkMode, userRole }) => {
  const activeContracts = useMemo(() => contracts.filter(c => c.status !== ContractStatus.Resolved), [contracts]);

  const statsData = useMemo(() => {
    const totalSaldo = activeContracts.reduce((sum, c) => sum + c.saldoDevedor, 0);
    const totalProv = activeContracts.reduce((sum, c) => sum + c.valorProvisionado, 0);
    const ticketMedio = activeContracts.length > 0 ? totalSaldo / activeContracts.length : 0;
    const highRiskCount = activeContracts.filter(c => c.daysOverdue > 90).length;

    return { totalSaldo, totalProv, ticketMedio, highRiskCount, count: activeContracts.length };
  }, [activeContracts]);

  const ageingData = useMemo(() => {
    const categories = {
      '1-30d': 0,
      '31-60d': 0,
      '61-90d': 0,
      '91-180d': 0,
      '181-365d': 0,
      '365d+': 0
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
  }, [activeContracts]);

  const recoveryTrendData = useMemo(() => {
    return [
      { month: 'Set', real: 420000, proj: 400000 },
      { month: 'Out', real: 380000, proj: 450000 },
      { month: 'Nov', real: 510000, proj: 500000 },
      { month: 'Dez', real: 640000, proj: 600000 },
      { month: 'Jan', real: null, proj: 720000 },
      { month: 'Fev', real: null, proj: 850000 },
    ];
  }, []);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-8 animate-fade-in">
      <SmartQueryBar />
      <PredictiveAIAlerts contracts={contracts} onNavigateToDetails={onNavigateToDetails} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Saldo em Atraso" value={statsData.totalSaldo} icon="dollar" trend="+3.2%" />
        <KpiCard title="Total Provisionado" value={statsData.totalProv} icon="package" trend="-1.5%" isNegativeTrend />
        <KpiCard title="Ticket Médio" value={statsData.ticketMedio} icon="ticket" trend="+0.8%" />
        <KpiCard title="Risco Crítico (>90d)" value={statsData.highRiskCount} icon="clock" trend="+12%" isNegativeTrend />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">Tendência de Recuperação</h3>
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full uppercase tracking-widest">Injeção IA Ativa</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={recoveryTrendData}>
                <defs>
                  <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="month" stroke={isDarkMode ? '#94a3b8' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={isDarkMode ? '#94a3b8' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val/1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#fff', border: 'none', borderRadius: '16px' }} />
                <Area type="monotone" dataKey="real" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorReal)" name="Realizado" />
                <Area type="monotone" dataKey="proj" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" fillOpacity={0} name="Projetado" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-xl font-black text-slate-800 dark:text-white mb-8 uppercase tracking-tighter italic">Ageing de Carteira</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageingData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="name" stroke={isDarkMode ? '#94a3b8' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={isDarkMode ? '#94a3b8' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#fff', border: 'none', borderRadius: '12px' }}
                  formatter={(val: number) => [formatCurrency(val), 'Saldo']}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
           <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">Casos Críticos (RLS Ativo)</h3>
           <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
              <FeatherIcon name="shield" className="w-3 h-3" /> Blindagem de Dados Ativa
           </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {activeContracts.slice(0, 6).map(contract => (
            <ContractCard 
              key={contract.id} 
              contract={contract} 
              userRole={userRole} 
              onNavigateToDetails={onNavigateToDetails} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
