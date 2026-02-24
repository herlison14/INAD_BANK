import React, { useState, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ComposedChart, Bar, Line, Legend, BarChart
} from 'recharts';
import FeatherIcon from './FeatherIcon';
import { Contract } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE: ANÁLISE DINÂMICA (COM TODOS OS GRÁFICOS RESTAURADOS)
// ─────────────────────────────────────────────────────────────────────────────
const AnaliseDinamicaView: React.FC<{ contracts: Contract[] }> = ({ contracts }) => {
  const [gerenteSelecionado, setGerenteSelecionado] = useState<string | null>(null);
  const [tipoGrafico, setTipoGrafico] = useState<'hibrido' | 'barras' | 'area'>('hibrido');
  const [periodoHistorico, setPeriodoHistorico] = useState<'diario' | 'semanal' | 'quinzenal' | 'mensal'>('semanal');

  const stats = useMemo(() => {
    const nomes = Array.from(new Set(contracts.map(c => c.gerente)));
    return nomes.map(nome => {
      const cG = contracts.filter(c => c.gerente === nome);
      const rec = cG.filter(c => c.status === 'Liquidado' || c.status === 'Renegociado').length;
      return {
        name: nome,
        resolvidos: rec,
        pendentes: cG.length - rec,
        taxa: Math.round((rec / cG.length) * 100),
        volume: cG.reduce((acc, curr) => acc + curr.saldoDevedor, 0)
      };
    }).sort((a, b) => b.taxa - a.taxa);
  }, [contracts]);

  // Simulação de Histórico de Performance
  const dadosHistoricos = useMemo(() => {
    if (!gerenteSelecionado) return [];
    
    const baseStats = stats.find(s => s.name === gerenteSelecionado);
    if (!baseStats) return [];

    const labels = {
      diario: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'],
      semanal: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
      quinzenal: ['1ª Quinzena', '2ª Quinzena'],
      mensal: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun']
    };

    return labels[periodoHistorico].map((label, index) => {
      // Gerar variação aleatória controlada baseada na taxa real
      const variacao = (Math.random() * 20) - 10;
      const taxaSimulada = Math.max(0, Math.min(100, baseStats.taxa + variacao));
      return {
        periodo: label,
        taxa: Math.round(taxaSimulada),
        resolvidos: Math.round(baseStats.resolvidos * (taxaSimulada / baseStats.taxa || 1)),
        usoSistema: Math.round(Math.random() * 50 + 20) // Minutos de uso
      };
    });
  }, [gerenteSelecionado, periodoHistorico, stats]);

  const exportarAvaliacaoGerente = () => {
    if (!gerenteSelecionado) return;
    
    const baseStats = stats.find(s => s.name === gerenteSelecionado);
    if (!baseStats) return;

    const headers = ['Período', 'Taxa de Resolução (%)', 'Contratos Resolvidos', 'Minutos Uso Sistema'];
    const rows = dadosHistoricos.map(d => [d.periodo, d.taxa, d.resolvidos, d.usoSistema]);

    const csvContent = [
      `Relatório de Avaliação - Gerente: ${gerenteSelecionado}`,
      `Data de Extração: ${new Date().toLocaleString()}`,
      `Eficiência Atual: ${baseStats.taxa}%`,
      '',
      headers.join(';'),
      ...rows.map(row => row.join(';'))
    ].join('\n');

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `avaliacao_${gerenteSelecionado.replace(/\s/g, '_')}_${periodoHistorico}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const dadosFiltrados = gerenteSelecionado ? stats.filter(s => s.name === gerenteSelecionado) : stats;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">Intelligence <span className="text-blue-600">Hub</span></h2>
        <div className="flex gap-4">
          {gerenteSelecionado && (
            <button 
              onClick={exportarAvaliacaoGerente}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 font-black rounded-xl text-[10px] uppercase transition-all border border-emerald-100 dark:border-emerald-800"
            >
              <FeatherIcon name="file-text" className="w-3 h-3" />
              Exportar Avaliação
            </button>
          )}
          <select value={tipoGrafico} onChange={(e) => setTipoGrafico(e.target.value as any)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-black outline-none focus:ring-2 ring-blue-500">
            <option value="hibrido">Visão Híbrida (Eficiência)</option>
            <option value="barras">Comparativo de Volume</option>
            <option value="area">Tendência Preditiva</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lista Lateral de Gerentes */}
        <div className="lg:col-span-3 space-y-2 max-h-[750px] overflow-y-auto pr-2 custom-scrollbar">
          {stats.map((g) => (
            <div key={g.name} onClick={() => setGerenteSelecionado(g.name)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${gerenteSelecionado === g.name ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-[1.02]' : 'bg-white dark:bg-slate-800 border-transparent hover:border-blue-200'}`}>
              <p className="text-xs font-black uppercase truncate">{g.name}</p>
              <p className={`text-[10px] font-bold ${gerenteSelecionado === g.name ? 'text-blue-100' : 'text-slate-400'}`}>{g.taxa}% Eficiência</p>
            </div>
          ))}
        </div>

        {/* Área de Gráficos */}
        <div className="lg:col-span-9 space-y-6">
          {/* Gráfico Principal */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-700 h-[400px] shadow-xl">
            <ResponsiveContainer width="100%" height="100%">
              {tipoGrafico === 'hibrido' ? (
                <ComposedChart data={dadosFiltrados}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                  <Legend iconType="circle" />
                  <Bar dataKey="resolvidos" name="Resolvidos" fill="#10B981" radius={[6, 6, 0, 0]} barSize={40} />
                  <Line type="monotone" dataKey="taxa" name="% Eficiência" stroke="#6366F1" strokeWidth={3} dot={{r: 6}} />
                </ComposedChart>
              ) : tipoGrafico === 'barras' ? (
                <BarChart data={dadosFiltrados}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="resolvidos" name="Resolvidos" fill="#10B981" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="pendentes" name="Pendentes" fill="#F43F5E" stackId="a" radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : (
                <AreaChart data={dadosFiltrados}>
                  <defs>
                    <linearGradient id="colorEf" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <Tooltip />
                  <Area type="monotone" dataKey="taxa" name="% Eficiência" stroke="#6366F1" strokeWidth={3} fill="url(#colorEf)" fillOpacity={1} />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Histórico (Só aparece se um gerente for selecionado) */}
          {gerenteSelecionado && (
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-700 h-[350px] shadow-xl animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2">
                  <FeatherIcon name="activity" className="text-blue-600 w-4 h-4" />
                  Histórico de Performance: {gerenteSelecionado}
                </h3>
                <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                  {(['diario', 'semanal', 'quinzenal', 'mensal'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriodoHistorico(p)}
                      className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg transition-all ${periodoHistorico === p ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height="80%">
                <AreaChart data={dadosHistoricos}>
                  <defs>
                    <linearGradient id="colorHist" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="periodo" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <Tooltip />
                  <Area type="monotone" dataKey="taxa" name="Taxa Resolução (%)" stroke="#10B981" strokeWidth={3} fill="url(#colorHist)" />
                  <Area type="monotone" dataKey="usoSistema" name="Uso Sistema (min)" stroke="#6366F1" strokeWidth={2} fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnaliseDinamicaView;
