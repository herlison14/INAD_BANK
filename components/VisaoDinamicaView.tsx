
import React, { useState, useMemo } from 'react';
import { Contract } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, Line, ComposedChart, PieChart, Pie, Legend
} from 'recharts';
import FeatherIcon from './FeatherIcon';
import { formatCurrency } from '../utils/formatter';

interface VisaoDinamicaViewProps {
    contracts: Contract[];
    isDarkMode: boolean;
}

const VisaoDinamicaView: React.FC<VisaoDinamicaViewProps> = ({ contracts, isDarkMode }) => {
  const [activeMetric, setActiveMetric] = useState<'saldo' | 'volumetria'>('saldo');

  const isEmpty = contracts.length === 0;

  // Cálculos de Aging Ranges para o Donut (Market Share do Atraso)
  const agingData = useMemo(() => {
    if (isEmpty) return [];
    const slices = {
      '0-15 Dias': 0,
      '16-30 Dias': 0,
      '31-60 Dias': 0,
      '61-90 Dias': 0,
      '90+ Dias': 0
    };

    contracts.forEach(c => {
      if (c.daysOverdue <= 15) slices['0-15 Dias'] += c.saldoDevedor;
      else if (c.daysOverdue <= 30) slices['16-30 Dias'] += c.saldoDevedor;
      else if (c.daysOverdue <= 60) slices['31-60 Dias'] += c.saldoDevedor;
      else if (c.daysOverdue <= 90) slices['61-90 Dias'] += c.saldoDevedor;
      else slices['90+ Dias'] += c.saldoDevedor;
    });

    return Object.entries(slices).map(([name, value]) => ({ name, value }));
  }, [contracts, isEmpty]);

  // Comparativo Gerentes (Volumetria vs Valor)
  const managerComparison = useMemo(() => {
    if (isEmpty) return [];
    const grouped = contracts.reduce((acc: Record<string, any>, c) => {
      if (!acc[c.gerente]) acc[c.gerente] = { name: c.gerente, saldo: 0, count: 0 };
      acc[c.gerente].saldo += c.saldoDevedor;
      acc[c.gerente].count += 1;
      return acc;
    }, {});

    return Object.values(grouped).sort((a: any, b: any) => b.saldo - a.saldo).slice(0, 8);
  }, [contracts, isEmpty]);

  const axisColor = isDarkMode ? '#94a3b8' : '#64748b';
  const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* GRÁFICO A: COMPARATIVO DE VOLUMETRIA E VALOR */}
        <div className="premium-card p-10 rounded-[4rem] shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-10">
            <div>
               <h3 className="text-xl font-black text-[#f0f4ff] uppercase tracking-tighter italic">Performance por Gerente</h3>
               <p className="text-[9px] font-bold text-[#a0aec0] uppercase tracking-widest mt-1">Cruzamento de Saldo vs Quantidade</p>
            </div>
            <div className="flex bg-[#242938] p-1 rounded-2xl">
               <button 
                onClick={() => setActiveMetric('saldo')}
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${activeMetric === 'saldo' ? 'bg-indigo-600 text-white shadow-lg' : 'text-[#a0aec0]'}`}
               >
                 Valor
               </button>
               <button 
                onClick={() => setActiveMetric('volumetria')}
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${activeMetric === 'volumetria' ? 'bg-indigo-600 text-white shadow-lg' : 'text-[#a0aec0]'}`}
               >
                 Volume
               </button>
            </div>
          </div>

          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={managerComparison}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis dataKey="name" stroke={axisColor} fontSize={9} axisLine={false} tickLine={false} />
                <YAxis stroke={axisColor} fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => activeMetric === 'saldo' ? `R$${(v/1000).toFixed(0)}k` : v} />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', backgroundColor: isDarkMode ? '#0f172a' : '#fff' }}
                  formatter={(v: any) => activeMetric === 'saldo' ? formatCurrency(Number(v || 0)) : `${v} Contratos`}
                />
                <Bar dataKey={activeMetric === 'saldo' ? 'saldo' : 'count'} radius={[10, 10, 0, 0]}>
                  {managerComparison.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICO B: MARKET SHARE DO ATRASO (DONUT) */}
        <div className="premium-card p-10 rounded-[4rem] shadow-2xl">
          <h3 className="text-xl font-black text-[#f0f4ff] uppercase tracking-tighter italic mb-8">Market Share do Atraso</h3>
          <div className="h-[300px] mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={agingData} 
                  cx="50%" cy="50%" 
                  innerRadius={80} outerRadius={120} 
                  paddingAngle={8} 
                  dataKey="value"
                >
                  {agingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => formatCurrency(Number(v || 0))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4">
             {agingData.map((item, idx) => (
                <div key={item.name} className="flex justify-between items-center bg-[#1a1f2e] p-3 rounded-2xl border border-[#2e3347]">
                   <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: colors[idx % colors.length]}} />
                      <span className="text-[9px] font-black uppercase text-[#a0aec0]">{item.name}</span>
                   </div>
                   <span className="text-[11px] font-black text-[#f0f4ff] tabular-nums">{formatCurrency(item.value)}</span>
                </div>
             ))}
          </div>
        </div>
      </div>

      {/* TABELA COMPARATIVA DINÂMICA (BOX DE DETALHES) */}
      <div className="bg-[#1a1f2e] rounded-[3.5rem] shadow-2xl border border-[#2e3347]">
        <div className="p-10 border-b border-[#2e3347] bg-[#1a1f2e]/50 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black text-[#f0f4ff] uppercase tracking-tighter italic">Espelho Multidimensional</h3>
            <p className="text-[9px] font-bold text-[#a0aec0] uppercase tracking-widest mt-1">Interatividade Cruzada Ativada</p>
          </div>
          <div className="flex gap-4">
             <div className="text-right">
                <p className="text-[9px] font-black text-[#a0aec0] uppercase mb-1">Total Exposto (Filtro)</p>
                <p className="text-lg font-black italic text-indigo-600">{formatCurrency(contracts.reduce((a,b) => a + (b.originSheet === 'Geral' ? b.saldoDevedor : 0), 0))}</p>
             </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#1a1f2e]/80 text-[9px] font-black uppercase tracking-widest text-[#a0aec0]">
              <tr>
                <th className="px-10 py-6">Sócio (Identidade)</th>
                <th className="px-10 py-6">Modalidade</th>
                <th className="px-10 py-6 text-center">Contratos</th>
                <th className="px-10 py-6 text-right">Saldo Devedor</th>
                <th className="px-10 py-6 text-center">Status Atraso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2e3347]">
              {contracts.slice(0, 15).map((c) => (
                <tr key={c.id} className="hover:bg-[#242938] transition-colors">
                  <td className="px-10 py-6">
                     <p className="font-black text-[#f0f4ff] uppercase text-[10px] italic">{c.clientName}</p>
                     <p className="text-[9px] text-[#a0aec0] font-bold">{c.cpfCnpj}</p>
                  </td>
                  <td className="px-10 py-6 text-[10px] font-black text-[#a0aec0] uppercase italic">{c.product}</td>
                  <td className="px-10 py-6 text-center font-black tabular-nums text-[#a0aec0] text-xs">01</td>
                  <td className="px-10 py-6 text-right font-black tabular-nums text-[#f0f4ff]">
                    {formatCurrency(c.saldoDevedor)}
                  </td>
                  <td className="px-10 py-6 text-center">
                     <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tighter ${c.daysOverdue > 90 ? 'bg-red-600 text-white' : 'bg-[#242938] text-[#a0aec0]'}`}>
                      {c.daysOverdue} d
                     </span>
                  </td>
                </tr>
              ))}
              {isEmpty && (
                <tr>
                  <td colSpan={5} className="py-24 text-center text-[#718096] font-black uppercase tracking-[0.3em] italic">Aguardando injeção de dados para consolidação</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VisaoDinamicaView;
