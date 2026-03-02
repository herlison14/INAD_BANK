import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { Contract, VIEWS, ViewName } from '../types';
import FeatherIcon from './FeatherIcon';
import { useApp } from '../context/AppContext';

interface GerenteStats {
  name: string;
  totalSaldo: number;
  qtdContratos: number;
  mediaDias: number;
  criticos: number;
  score: number;
}

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

function fmtBRL(val: number): string {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });
}

function fmtK(val: number): string {
  if (val >= 1_000_000) return `R$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000)     return `R$${(val / 1_000).toFixed(0)}K`;
  return fmtBRL(val);
}

const ChartTooltip: React.FC<{ active?: boolean; payload?: any[]; label?: string }> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 p-3 text-xs">
      <p className="font-black text-slate-700 dark:text-white mb-2">{label}</p>
      {payload.map((e: any) => (
        <div key={e.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: e.color }} />
          <span className="text-slate-500">{e.name}:</span>
          <span className="font-bold text-slate-700 dark:text-slate-200">
            {typeof e.value === 'number' && e.value > 1000 ? fmtK(e.value) : e.value}
          </span>
        </div>
      ))}
    </div>
  );
};

interface AnaliseDinamicaViewProps {
  contracts: Contract[];
}

const AnaliseDinamicaView: React.FC<AnaliseDinamicaViewProps> = ({ contracts: propContracts }) => {
  const contracts = propContracts;
  const [activeGerenteIdx, setActiveGerenteIdx] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<keyof GerenteStats>('totalSaldo');

  // Agrupamento único — sem duplicação
  const gerenteStats = useMemo<GerenteStats[]>(() => {
    const map = new Map<string, GerenteStats>();
    for (const c of contracts) {
      const key = (c.gerente || 'Sem Gerente').trim();
      if (!map.has(key)) map.set(key, { name: key, totalSaldo: 0, qtdContratos: 0, mediaDias: 0, criticos: 0, score: 0 });
      const g = map.get(key)!;
      g.totalSaldo   += c.saldoDevedor;
      g.qtdContratos += 1;
      g.mediaDias    += c.daysOverdue;
      if (c.daysOverdue > 60) g.criticos++;
    }
    return Array.from(map.values()).map((g) => ({
      ...g,
      mediaDias: g.qtdContratos > 0 ? Math.round(g.mediaDias / g.qtdContratos) : 0,
      score: Math.min(100, Math.round((g.criticos / Math.max(g.qtdContratos, 1)) * 60 + (Math.min(g.mediaDias || 0, 120) / 120) * 40)),
    }));
  }, [contracts]);

  const sortedGerentes = useMemo(
    () => [...gerenteStats].sort((a, b) => (b[sortKey] as number) - (a[sortKey] as number)),
    [gerenteStats, sortKey],
  );

  const kpis = useMemo(() => ({
    total:     contracts.reduce((s, c) => s + c.saldoDevedor, 0),
    criticos:  contracts.filter((c) => c.daysOverdue > 60).length,
    mediaDias: contracts.length > 0 ? Math.round(contracts.reduce((s, c) => s + c.daysOverdue, 0) / contracts.length) : 0,
    maiorSaldo: contracts.reduce((max, c) => Math.max(max, c.saldoDevedor), 0),
  }), [contracts]);

  const barData = useMemo(() => sortedGerentes.slice(0, 8).map((g) => ({
    name: g.name.split(' ')[0], fullName: g.name,
    'Saldo Total': g.totalSaldo, 'Críticos': g.criticos,
  })), [sortedGerentes]);

  const pieData = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of contracts) map.set(c.product || 'Outros', (map.get(c.product || 'Outros') ?? 0) + c.saldoDevedor);
    return Array.from(map.entries()).sort(([, a], [, b]) => b - a).slice(0, 6).map(([name, value]) => ({ name, value }));
  }, [contracts]);

  if (!contracts.length) return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
        <FeatherIcon name="bar-chart-2" className="w-9 h-9 text-slate-300 dark:text-slate-600" />
      </div>
      <h3 className="text-xl font-black text-slate-600 dark:text-slate-400 mb-2">Nenhum dado disponível</h3>
      <p className="text-sm text-slate-400 max-w-xs">Importe uma planilha para visualizar as análises dinâmicas.</p>
    </div>
  );

  const maxSaldo = Math.max(...gerenteStats.map((x) => x.totalSaldo), 1);

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Exposição Total',    value: fmtK(kpis.total),        icon: 'dollar-sign',    color: 'from-blue-500 to-blue-600',    text: 'text-blue-600 dark:text-blue-400' },
          { label: 'Contratos Críticos', value: String(kpis.criticos),   icon: 'alert-triangle', color: 'from-red-500 to-red-600',      text: 'text-red-600 dark:text-red-400' },
          { label: 'Média de Atraso',    value: `${kpis.mediaDias}d`,    icon: 'clock',          color: 'from-amber-500 to-amber-600',  text: 'text-amber-600 dark:text-amber-400' },
          { label: 'Maior Exposição',    value: fmtK(kpis.maiorSaldo),   icon: 'trending-up',    color: 'from-violet-500 to-violet-600', text: 'text-violet-600 dark:text-violet-400' },
        ].map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            whileHover={{ y: -2 }} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/60 shadow-sm">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${k.color} flex items-center justify-center mb-3 shadow-md`}>
              <FeatherIcon name={k.icon} className="w-5 h-5 text-white" />
            </div>
            <p className={`text-2xl font-black tabular-nums ${k.text}`}>{k.value}</p>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">{k.label}</p>
          </motion.div>
        ))}
      </div>

      {/* GERENTES — Rolagem Horizontal acima do gráfico */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/60 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
          <div>
            <h3 className="font-black text-slate-800 dark:text-white text-sm uppercase tracking-widest">Performance por Gerente</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Clique para ver detalhes e filtrar o gráfico</p>
          </div>
          <div className="flex gap-1.5">
            {([
              { key: 'totalSaldo', label: 'Saldo' }, { key: 'criticos', label: 'Críticos' },
              { key: 'qtdContratos', label: 'Qtd.' }, { key: 'mediaDias', label: 'Atraso' },
            ] as { key: keyof GerenteStats; label: string }[]).map(({ key, label }) => (
              <button key={key} onClick={() => setSortKey(key)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${sortKey === key ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex overflow-x-auto custom-scrollbar scroll-smooth p-6 gap-4">
          {sortedGerentes.map((g, idx) => {
            const isActive = activeGerenteIdx === idx;
            const riskColor = g.score >= 70 ? 'bg-red-500' : g.score >= 40 ? 'bg-amber-500' : 'bg-emerald-500';
            return (
              <motion.button 
                key={g.name} 
                onClick={() => setActiveGerenteIdx(isActive ? null : idx)}
                whileHover={{ y: -4 }}
                className={`min-w-[220px] p-5 rounded-2xl border-2 transition-all text-left relative overflow-hidden shrink-0 ${
                  isActive 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-xl shadow-blue-500/10' 
                    : 'border-slate-50 dark:border-slate-700/40 bg-slate-50/30 dark:bg-slate-800/40 hover:border-blue-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center font-black text-slate-700 dark:text-slate-200">
                    {g.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-800 dark:text-white truncate">{g.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${riskColor}`} />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Score {g.score}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 relative z-10">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Saldo</span>
                    <span className="text-sm font-black text-blue-600 dark:text-blue-400 tabular-nums">{fmtK(g.totalSaldo)}</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-blue-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round((g.totalSaldo / maxSaldo) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                    <span>{g.qtdContratos} contratos</span>
                    {g.criticos > 0 && <span className="text-red-500">{g.criticos} Críticos</span>}
                  </div>
                </div>

                {isActive && (
                  <div className="absolute top-0 right-0 p-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Gráfico Principal — agora ocupa a largura total abaixo dos gerentes */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/60 shadow-sm p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="font-black text-slate-800 dark:text-white">Análise de Exposição</h3>
            <p className="text-xs text-slate-400">Comparativo de saldo e criticidade</p>
          </div>
          {activeGerenteIdx !== null && (
            <button 
              onClick={() => setActiveGerenteIdx(null)}
              className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-all"
            >
              Limpar Filtro: {sortedGerentes[activeGerenteIdx].name}
            </button>
          )}
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={barData} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.15)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmtK} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={60} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 24 }} />
            <Bar dataKey="Saldo Total" fill="#3b82f6" radius={[8, 8, 0, 0]} maxBarSize={50} />
            <Bar dataKey="Críticos"    fill="#ef4444" radius={[8, 8, 0, 0]} maxBarSize={50} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráficos secundários */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-12">
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/60 shadow-sm p-6">
          <h3 className="font-black text-slate-800 dark:text-white mb-1">Distribuição por Faixa de Atraso</h3>
          <p className="text-xs text-slate-400 mb-6">Saldo agrupado por tempo em atraso</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[
              { faixa: '0–15d',  valor: contracts.filter((c) => c.daysOverdue >= 0  && c.daysOverdue <= 15).reduce((s, c) => s + c.saldoDevedor, 0) },
              { faixa: '16–30d', valor: contracts.filter((c) => c.daysOverdue > 15  && c.daysOverdue <= 30).reduce((s, c) => s + c.saldoDevedor, 0) },
              { faixa: '31–60d', valor: contracts.filter((c) => c.daysOverdue > 30  && c.daysOverdue <= 60).reduce((s, c) => s + c.saldoDevedor, 0) },
              { faixa: '61–90d', valor: contracts.filter((c) => c.daysOverdue > 60  && c.daysOverdue <= 90).reduce((s, c) => s + c.saldoDevedor, 0) },
              { faixa: '90d+',   valor: contracts.filter((c) => c.daysOverdue > 90).reduce((s, c) => s + c.saldoDevedor, 0) },
            ]} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.15)" vertical={false} />
              <XAxis dataKey="faixa" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmtK} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={56} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="valor" name="Saldo" fill="#8b5cf6" radius={[8, 8, 0, 0]} maxBarSize={52} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/60 shadow-sm p-6">
          <h3 className="font-black text-slate-800 dark:text-white mb-1">Exposição por Produto</h3>
          <p className="text-xs text-slate-400 mb-4">Distribuição do saldo por tipo de produto</p>
          {pieData.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {pieData.map((_, idx) => <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(val: any) => fmtK(Number(val || 0))} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {pieData.map((d, idx) => {
                  const pct = Math.round((d.value / pieData.reduce((s, x) => s + x.value, 0)) * 100);
                  return (
                    <div key={d.name} className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: CHART_COLORS[idx % CHART_COLORS.length] }} />
                      <span className="text-slate-500 dark:text-slate-400 flex-1 truncate">{d.name}</span>
                      <span className="font-black text-slate-700 dark:text-slate-200 tabular-nums">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-slate-300 dark:text-slate-600">
              <FeatherIcon name="pie-chart" className="w-10 h-10" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnaliseDinamicaView;
