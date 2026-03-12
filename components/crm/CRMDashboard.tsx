
'use client';

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Briefcase, 
  Users, 
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Filter
} from 'lucide-react';
import { MOCK_DEALS, MOCK_STAGES } from '../../lib/crm-mock-data';

const CRMDashboard: React.FC = () => {
  // Dados para o Funil de Vendas
  const funnelData = MOCK_STAGES.map(stage => ({
    name: stage.name,
    value: MOCK_DEALS.filter(d => d.stageId === stage.id).length,
    amount: MOCK_DEALS.filter(d => d.stageId === stage.id).reduce((acc, d) => acc + d.value, 0)
  }));

  // Dados para Receita Mensal (Mock)
  const revenueData = [
    { month: 'Jan', revenue: 45000, target: 40000 },
    { month: 'Fev', revenue: 52000, target: 40000 },
    { month: 'Mar', revenue: 38000, target: 45000 },
    { month: 'Abr', revenue: 65000, target: 45000 },
    { month: 'Mai', revenue: 48000, target: 50000 },
    { month: 'Jun', revenue: 72000, target: 50000 },
  ];

  // Dados para Conversão por Canal (Mock)
  const channelData = [
    { name: 'Indicação', value: 45 },
    { name: 'LinkedIn', value: 25 },
    { name: 'Site', value: 20 },
    { name: 'Outros', value: 10 },
  ];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  return (
    <div className="h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 p-8 custom-scrollbar">
      {/* Grid de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Negócios no Funil', value: '12', change: '+20%', up: true, icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Receita Prevista', value: 'R$ 145k', change: '+12%', up: true, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Taxa de Conversão', value: '24%', change: '-5%', up: false, icon: Target, color: 'text-violet-500', bg: 'bg-violet-500/10' },
          { label: 'Novos Leads', value: '48', change: '+35%', up: true, icon: Users, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-2xl ${kpi.bg} ${kpi.color} group-hover:scale-110 transition-transform`}>
                <kpi.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${kpi.up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {kpi.change}
              </div>
            </div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</h3>
            <p className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Grid de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Funil de Vendas */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest italic">Funil de Conversão</h3>
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
              <Filter className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }}
                />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9', opacity: 0.5 }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" fill="#10b981" radius={[0, 12, 12, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Receita x Meta */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest italic">Receita x Meta</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Receita</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Meta</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                <Line type="monotone" dataKey="target" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Origem de Leads */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest italic mb-8">Origem de Leads</h3>
          <div className="flex items-center h-80">
            <div className="flex-1 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {channelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-48 space-y-4">
              {channelData.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">{item.name}</span>
                  </div>
                  <span className="text-xs font-black text-slate-900 dark:text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Atividades Recentes (Mock) */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest italic mb-8">Atividades Recentes</h3>
          <div className="space-y-6">
            {[
              { user: 'João Silva', action: 'Moveu negócio', target: 'Expansão de Servidores', time: 'Há 5 min', color: 'bg-blue-500' },
              { user: 'Maria Oliveira', action: 'Criou novo contato', target: 'Roberto Santos', time: 'Há 12 min', color: 'bg-emerald-500' },
              { user: 'João Silva', action: 'Concluiu atividade', target: 'Ligar para João', time: 'Há 45 min', color: 'bg-violet-500' },
              { user: 'Sistema', action: 'Automação executada', target: 'E-mail de boas-vindas', time: 'Há 1 hora', color: 'bg-amber-500' },
            ].map((log, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className={`w-2 h-2 rounded-full mt-1.5 ${log.color}`}></div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    <span className="font-black">{log.user}</span> {log.action} <span className="text-emerald-500 italic">"{log.target}"</span>
                  </p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CRMDashboard;
