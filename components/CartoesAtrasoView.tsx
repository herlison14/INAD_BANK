
import React, { useMemo } from 'react';
import { Contract } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import FeatherIcon from './FeatherIcon';

interface CartoesAtrasoViewProps {
  contracts: Contract[];
  isDarkMode: boolean;
  onNavigateToDetails: (id: string) => void;
}

const CartoesAtrasoView: React.FC<CartoesAtrasoViewProps> = ({ contracts, isDarkMode, onNavigateToDetails }) => {
  // Filtra o que já veio filtrado globalmente (PA/Gerente) para mostrar apenas Cartões
  const cardContracts = useMemo(() => {
    return contracts.filter(c => {
      const normalizedSheet = c.originSheet?.toLowerCase().trim() || '';
      const isFromCardSheet = normalizedSheet.includes('cartão') || 
                              normalizedSheet.includes('cartao');
      
      const normalizedProduct = c.product.toLowerCase();
      const isCardProduct = normalizedProduct.includes('cartão') || 
                            normalizedProduct.includes('cartao');
      
      return isFromCardSheet || isCardProduct;
    });
  }, [contracts]);

  const stats = useMemo(() => {
    const totalDebt = cardContracts.reduce((acc, c) => acc + c.saldoDevedor, 0);
    const count = cardContracts.length;
    return { totalDebt, count };
  }, [cardContracts]);

  const chartData = useMemo(() => {
    const ranges = {
      '1-30d': 0,
      '31-60d': 0,
      '61-90d': 0,
      '91-180d': 0,
      '181d+': 0
    };
    cardContracts.forEach(c => {
      if (c.daysOverdue <= 30) ranges['1-30d'] += c.saldoDevedor;
      else if (c.daysOverdue <= 60) ranges['31-60d'] += c.saldoDevedor;
      else if (c.daysOverdue <= 90) ranges['61-90d'] += c.saldoDevedor;
      else if (c.daysOverdue <= 180) ranges['91-180d'] += c.saldoDevedor;
      else ranges['181d+'] += c.saldoDevedor;
    });
    return Object.entries(ranges).map(([name, value]) => ({ name, value }));
  }, [cardContracts]);

  const formatBRL = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-red-600 to-red-800 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <FeatherIcon name="package" className="h-64 w-64" />
          </div>
          <div className="relative z-10">
            <p className="text-red-100 text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-80">Monitoramento Específico</p>
            <h2 className="text-4xl font-black mb-6 tracking-tighter italic">{formatBRL(stats.totalDebt)}</h2>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md w-fit px-4 py-2 rounded-2xl border border-white/20">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-xs font-black uppercase tracking-tight">{stats.count} cartões filtrados</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700">
          <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 mb-8 uppercase tracking-[0.2em] flex items-center gap-2">
            <div className="w-4 h-1 bg-red-500 rounded-full"></div>
            Dívida por Ageing (Filtro Ativo)
          </h3>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={9} fontBold="900" stroke={isDarkMode ? '#94a3b8' : '#64748b'} />
                <Tooltip 
                  cursor={{fill: isDarkMode ? '#1e293b' : '#f8fafc'}}
                  contentStyle={{ backgroundColor: isDarkMode ? '#0f172a' : '#fff', border: 'none', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                  formatter={(val: number) => [formatBRL(val), 'Dívida']}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index > 2 ? '#ef4444' : '#fca5a5'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="p-8 border-b border-gray-50 dark:border-slate-700 flex justify-between items-center">
            <h3 className="font-black text-gray-900 dark:text-white flex items-center gap-3 text-lg uppercase tracking-tighter italic">
                <div className="w-2 h-8 bg-red-600 rounded-full"></div>
                Detalhamento dos Cartões
            </h3>
            <span className="px-4 py-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-[10px] font-black uppercase">
                {cardContracts.length} Registros
            </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-gray-400 uppercase tracking-[0.2em] bg-gray-50/50 dark:bg-slate-900/50 border-b border-gray-50 dark:border-slate-800">
              <tr>
                <th className="px-8 py-5 font-black">PA (Col A)</th>
                <th className="px-8 py-5 font-black">Gerente (Col B)</th>
                <th className="px-8 py-5 font-black">Sócio (Col C)</th>
                <th className="px-8 py-5 font-black">CPF (Col D)</th>
                <th className="px-8 py-5 font-black text-right">Dívida (Col I)</th>
                <th className="px-8 py-5 font-black text-center">Dias (Col N)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {cardContracts.map((c) => (
                <tr key={c.id} className="hover:bg-red-50/20 dark:hover:bg-red-900/5 transition-all group cursor-pointer" onClick={() => onNavigateToDetails(c.id)}>
                  <td className="px-8 py-5 font-bold text-gray-600 dark:text-gray-400 text-xs">{c.pa}</td>
                  <td className="px-8 py-5 text-gray-500 dark:text-gray-500 text-xs font-medium">{c.gerente}</td>
                  <td className="px-8 py-5 font-black text-gray-900 dark:text-white uppercase tracking-tight text-xs">{c.clientName}</td>
                  <td className="px-8 py-5 font-mono text-[10px] text-gray-400">{c.cpfCnpj}</td>
                  <td className="px-8 py-5 text-right font-black text-red-600 dark:text-red-400">{formatBRL(c.saldoDevedor)}</td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-tighter ${c.daysOverdue > 90 ? 'bg-red-600 text-white shadow-lg shadow-red-200 dark:shadow-none' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`}>
                        {c.daysOverdue} d
                    </span>
                  </td>
                </tr>
              ))}
              {cardContracts.length === 0 && (
                <tr>
                    <td colSpan={6} className="px-8 py-24 text-center">
                      <div className="bg-gray-50 dark:bg-slate-900/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-200 dark:border-slate-800">
                        <FeatherIcon name="package" className="h-8 w-8 text-gray-300 dark:text-gray-700" />
                      </div>
                      <p className="text-gray-400 dark:text-gray-600 italic font-bold uppercase text-[10px] tracking-widest">Nenhum cartão encontrado nos filtros atuais</p>
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CartoesAtrasoView;
