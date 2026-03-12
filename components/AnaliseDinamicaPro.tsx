import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  Bar, ComposedChart, Line
} from 'recharts';
import { Contract } from '../types';
import { useApp } from '../context/AppContext';
import FeatherIcon from './FeatherIcon';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
type Periodo = 'Diario' | 'Semanal' | 'Quinzenal' | 'Mensal';

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE DE ANALISE DINÂMICA (CÓDIGO PRINCIPAL ATUALIZADO)
// ─────────────────────────────────────────────────────────────────────────────
const AnaliseDinamicaPro: React.FC<{ contracts: Contract[] }> = ({ contracts }) => {
  const [periodo, setPeriodo] = useState<Periodo>('Semanal');
  const [selectedManager, setSelectedManager] = useState<string | null>(null);

  // 1. ENGINE DE PROCESSAMENTO (Engenharia Anti-Duplicidade + Estratégia de Crédito)
  const chartData = useMemo(() => {
    const agora = new Date();
    
    // Filtro de Temporalidade
    let filtrados = contracts.filter(c => {
      const dataRef = new Date(c.timestamp);
      const diffDias = (agora.getTime() - dataRef.getTime()) / (1000 * 3600 * 24);
      if (periodo === 'Diario') return diffDias <= 1;
      if (periodo === 'Semanal') return diffDias <= 7;
      if (periodo === 'Quinzenal') return diffDias <= 15;
      if (periodo === 'Mensal') return diffDias <= 30;
      return true;
    });

    // Filtro por Gerente Selecionado
    if (selectedManager) {
      filtrados = filtrados.filter(c => c.gerente === selectedManager);
    }

    // Agrupamento Imutável por Gerente para evitar duplicidade de barras
    const statsMap = new Map<string, { resolvidos: number; total: number }>();

    filtrados.forEach(c => {
      const gName = c.gerente || 'Não Informado';
      const stats = statsMap.get(gName) || { resolvidos: 0, total: 0 };
      
      statsMap.set(gName, {
        resolvidos: c.status === 'Resolvido' ? stats.resolvidos + 1 : stats.resolvidos,
        total: stats.total + 1
      });
    });

    // Formatação para Recharts com Rank de Eficiência
    return Array.from(statsMap.entries()).map(([name, s]) => ({
      name: name.split(' ')[0], // Label amigável para o eixo X
      fullName: name,
      resolvidos: s.resolvidos,
      eficiencia: s.total > 0 ? Math.round((s.resolvidos / s.total) * 100) : 0,
    })).sort((a, b) => b.eficiencia - a.eficiencia);
  }, [contracts, periodo]);

  // 2. EXPORTAÇÃO DE RELATÓRIO GERENCIAL (CSV UTF-8 BOM)
  const handleExportFullReport = useCallback(() => {
    if (chartData.length === 0) return;

    const headers = ['GERENTE', 'CONTRATOS_RESOLVIDOS', 'EFICIENCIA_PERCENTUAL', 'PERIODO'];
    const rows = chartData.map(d => [
      d.fullName, d.resolvidos, `${d.eficiencia}%`, periodo
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(v => `"${v}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Relatorio_Gerencial_${periodo}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }, [chartData, periodo]);

  return (
    <div className="space-y-6">
      {/* CABEÇALHO E FILTROS DINÂMICOS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">
            Análise de <span className="text-[var(--brand-primary)]">Recuperação</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest mt-1">Acompanhamento de performance por ciclo temporal</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-[var(--surface-background)] p-1 rounded-2xl flex border border-[var(--border-default)]">
            {(['Diario', 'Semanal', 'Quinzenal', 'Mensal'] as Periodo[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  periodo === p 
                    ? 'bg-[var(--brand-primary)] text-white shadow-lg shadow-blue-500/20' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {selectedManager && (
            <button 
              onClick={() => setSelectedManager(null)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[var(--status-error)]/10 text-[var(--status-error)] rounded-xl text-[10px] font-black uppercase tracking-widest border border-[var(--status-error)]/20 hover:bg-[var(--status-error)]/20 transition-all"
            >
              <FeatherIcon name="x-circle" className="w-4 h-4" />
              LIMPAR FILTRO
            </button>
          )}

          <button 
            onClick={handleExportFullReport}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all"
          >
            <FeatherIcon name="download" className="w-4 h-4" />
            EXPORTAR {periodo.toUpperCase()}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* GRÁFICO PRINCIPAL COM RESET DE CANVAS (KEY) */}
        <div className="lg:col-span-3 bg-[var(--surface-container)] rounded-[3rem] p-10 border border-[var(--border-default)] shadow-sm h-[400px]">
          <ResponsiveContainer width="100%" height="100%" key={`render-${periodo}`}>
            <ComposedChart data={chartData}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2e3347" opacity={0.5} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} stroke="#94a3b8" />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} fontSize={11} stroke="#94a3b8" />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} fontSize={11} stroke="#94a3b8" />
              <Tooltip 
                cursor={{fill: '#242938'}} 
                contentStyle={{ borderRadius: '16px', border: '1px solid #2e3347', backgroundColor: '#1a1f2e', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
              />
              <Legend verticalAlign="top" align="right" iconType="circle" />
              <Bar 
                yAxisId="left" 
                dataKey="resolvidos" 
                name="Contratos Resolvidos" 
                fill="url(#barGradient)" 
                radius={[6, 6, 0, 0]} 
                barSize={24} 
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="eficiencia" 
                name="% Eficiência" 
                stroke="#6366f1" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#6366f1' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* RANKING LADO A LADO PARA O GERENTE */}
        <div className="bg-[var(--surface-container)] rounded-[3rem] p-8 border border-[var(--border-default)] shadow-sm overflow-hidden flex flex-col max-h-[200px]">
          <h3 className="text-xs font-black text-[var(--text-primary)] mb-6 uppercase tracking-[0.2em] italic">
            Performance Ranking
          </h3>
          <div className="flex-1 overflow-y-auto space-y-5 pr-2 custom-scrollbar scroll-smooth">
            {chartData.map((manager, index) => (
              <button 
                key={manager.fullName} 
                onClick={() => setSelectedManager(selectedManager === manager.fullName ? null : manager.fullName)}
                className={`w-full flex items-center justify-between group p-2 rounded-2xl transition-all ${selectedManager === manager.fullName ? 'bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20' : 'hover:bg-[var(--surface-background)]'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black ${
                    index === 0 ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-[var(--surface-background)] text-[var(--text-secondary)] border border-[var(--border-default)]'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black text-[var(--text-primary)] uppercase italic tracking-tight">{manager.fullName}</p>
                    <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">{manager.resolvidos} acordos</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-[var(--brand-primary)] italic">{manager.eficiencia}%</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnaliseDinamicaPro;
