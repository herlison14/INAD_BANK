
import React, { useMemo } from 'react';
import { Contract } from '../types';
import FeatherIcon from './FeatherIcon';
import { formatCurrency } from '../utils/formatter';

interface CartoesAtrasoViewProps {
  contracts: Contract[];
  isDarkMode: boolean;
  onNavigateToDetails: (id: string) => void;
}

const CartoesAtrasoView: React.FC<CartoesAtrasoViewProps> = ({ contracts, onNavigateToDetails }) => {
  // Filtra estritamente contratos que vieram da planilha de Cartões (Coluna I)
  const cardContracts = useMemo(() => {
    return contracts.filter(c => c.originSheet === 'Cartoes');
  }, [contracts]);

  const isEmpty = cardContracts.length === 0;

  const stats = useMemo(() => {
    if (isEmpty) return { totalDebt: 0, count: 0 };
    const totalDebt = cardContracts.reduce((acc, c) => acc + (c.saldoDevedor || 0), 0);
    const count = cardContracts.length;
    return { totalDebt, count };
  }, [cardContracts, isEmpty]);

  return (
    <div className="space-y-8 animate-fade-in max-w-[1400px] mx-auto pb-20">
      {/* Resumo Executivo Minimalista */}
      <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
        {isEmpty && (
            <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 dark:bg-slate-800"></div>
        )}
        <div className="flex items-center gap-6">
            <div className={`p-5 rounded-3xl shadow-xl transition-all ${isEmpty ? 'bg-slate-100 dark:bg-slate-800 text-slate-300' : 'bg-red-600 text-white shadow-red-500/20'}`}>
                <FeatherIcon name="package" className="w-8 h-8" />
            </div>
            <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Lista Operacional <span className="text-red-600">Cartões</span></h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-1">
                    {isEmpty ? 'Aguardando Sincronização de Arquivo' : 'Sincronização Ativa • Fluxo de Cobrança v3.5'}
                </p>
            </div>
        </div>
        
        <div className="flex gap-10">
            <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Exposição do Fluxo</p>
                <p className={`text-2xl font-black italic tabular-nums transition-colors ${isEmpty ? 'text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                    {formatCurrency(stats.totalDebt)}
                </p>
            </div>
            <div className="w-px h-10 bg-slate-100 dark:bg-slate-800 self-center"></div>
            <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Itens em Carteira</p>
                <p className={`text-2xl font-black italic tabular-nums transition-colors ${isEmpty ? 'text-slate-300' : 'text-red-600'}`}>
                    {stats.count}
                </p>
            </div>
        </div>
      </div>

      {/* Tabela de Alta Performance ou Estado de Espera */}
      <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-all min-h-[500px] flex flex-col">
        {isEmpty ? (
            <div className="flex-1 flex flex-col items-center justify-center p-20 space-y-6">
                <div className="relative">
                    <FeatherIcon name="package" className="w-24 h-24 text-slate-100 dark:text-slate-800/50" />
                    <div className="absolute inset-0 flex items-center justify-center">
                         <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded-full animate-ping"></div>
                    </div>
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-black text-slate-400 uppercase tracking-tighter italic">Nenhum Cartão Importado</h3>
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] max-w-xs mx-auto">
                        Injete a planilha de cartões na aba de importação para popular esta visão estratégica.
                    </p>
                </div>
            </div>
        ) : (
            <>
                <div className="p-10 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
                    <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-3 text-lg uppercase tracking-tighter italic">
                        Detalhamento de Plásticos em Atraso (Coluna I)
                    </h3>
                    <div className="flex items-center gap-4">
                        <span className="text-[9px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">Base Atualizada</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-[10px] text-slate-400 uppercase tracking-[0.2em] bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-50 dark:border-slate-800">
                      <tr>
                        <th className="px-10 py-6 font-black">Unidade (PA)</th>
                        <th className="px-10 py-6 font-black">Gestor</th>
                        <th className="px-10 py-6 font-black">Sócio</th>
                        <th className="px-10 py-6 font-black">Documento</th>
                        <th className="px-10 py-6 text-right font-black">Dívida Atual</th>
                        <th className="px-10 py-6 text-center font-black">Atraso</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {cardContracts.map((c) => (
                        <tr key={c.id} className="hover:bg-red-50/20 dark:hover:bg-red-900/5 transition-all group cursor-pointer" onClick={() => onNavigateToDetails(c.id)}>
                          <td className="px-10 py-6 font-bold text-slate-500 text-xs uppercase italic">{c.pa}</td>
                          <td className="px-10 py-6 text-slate-400 text-[11px] font-semibold">{c.gerente}</td>
                          <td className="px-10 py-6 font-black text-slate-900 dark:text-white uppercase tracking-tight text-xs italic">{c.clientName}</td>
                          <td className="px-10 py-6 font-mono text-[10px] text-slate-400">{c.cpfCnpj}</td>
                          <td className="px-10 py-6 text-right font-black text-red-600 tabular-nums">{formatCurrency(c.saldoDevedor)}</td>
                          <td className="px-10 py-6 text-center">
                            <span className={`px-4 py-1 rounded-xl text-[10px] font-black uppercase tracking-tighter ${c.daysOverdue > 90 ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`}>
                                {c.daysOverdue} d
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default CartoesAtrasoView;
