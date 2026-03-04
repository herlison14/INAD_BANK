
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
      <div className="bg-[var(--surface-container)] p-10 rounded-[3.5rem] shadow-2xl border border-[var(--border-default)] flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
        {isEmpty && (
            <div className="absolute top-0 left-0 w-1 h-full bg-[var(--border-default)]"></div>
        )}
        <div className="flex items-center gap-6">
            <div className={`p-5 rounded-3xl shadow-xl transition-all ${isEmpty ? 'bg-[var(--surface-elevated)] text-[var(--text-secondary)]/30' : 'bg-[var(--status-error)] text-white shadow-red-500/20'}`}>
                <FeatherIcon name="package" className="w-8 h-8" />
            </div>
            <div>
                <h2 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">Lista Operacional <span className="text-[var(--status-error)]">Cartões</span></h2>
                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.4em] mt-1">
                    {isEmpty ? 'Aguardando Sincronização de Arquivo' : 'Sincronização Ativa • Fluxo de Cobrança v3.5'}
                </p>
            </div>
        </div>
        
        <div className="flex gap-10">
            <div className="text-right">
                <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1">Exposição do Fluxo</p>
                <p className={`text-2xl font-black italic tabular-nums transition-colors ${isEmpty ? 'text-[var(--text-secondary)]/30' : 'text-[var(--text-primary)]'}`}>
                    {formatCurrency(stats.totalDebt)}
                </p>
            </div>
            <div className="w-px h-10 bg-[var(--border-default)] self-center"></div>
            <div className="text-right">
                <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1">Itens em Carteira</p>
                <p className={`text-2xl font-black italic tabular-nums transition-colors ${isEmpty ? 'text-[var(--text-secondary)]/30' : 'text-[var(--status-error)]'}`}>
                    {stats.count}
                </p>
            </div>
        </div>
      </div>

      {/* Tabela de Alta Performance ou Estado de Espera */}
      <div className="bg-[var(--surface-container)] rounded-[3.5rem] shadow-2xl border border-[var(--border-default)] overflow-hidden transition-all min-h-[500px] flex flex-col">
        {isEmpty ? (
            <div className="flex-1 flex flex-col items-center justify-center p-20 space-y-6">
                <div className="relative">
                    <FeatherIcon name="package" className="w-24 h-24 text-[var(--text-secondary)]/10" />
                    <div className="absolute inset-0 flex items-center justify-center">
                         <div className="w-4 h-4 bg-[var(--text-secondary)]/20 rounded-full animate-ping"></div>
                    </div>
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-black text-[var(--text-secondary)] uppercase tracking-tighter italic">Nenhum Cartão Importado</h3>
                    <p className="text-[10px] font-bold text-[var(--text-secondary)]/50 uppercase tracking-[0.2em] max-w-xs mx-auto">
                        Injete a planilha de cartões na aba de importação para popular esta visão estratégica.
                    </p>
                </div>
            </div>
        ) : (
            <>
                <div className="p-10 border-b border-[var(--border-default)] flex justify-between items-center bg-[var(--surface-background)]/50">
                    <h3 className="font-black text-[var(--text-primary)] flex items-center gap-3 text-lg uppercase tracking-tighter italic">
                        Detalhamento de Plásticos em Atraso (Coluna I)
                    </h3>
                    <div className="flex items-center gap-4">
                        <span className="text-[9px] font-black uppercase text-[var(--status-success)] bg-[var(--status-success)]/10 px-3 py-1 rounded-full">Base Atualizada</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-[10px] text-[var(--text-secondary)] uppercase tracking-[0.2em] bg-[var(--surface-background)]/50 border-b border-[var(--border-default)]">
                      <tr>
                        <th className="px-10 py-6 font-black">Unidade (PA)</th>
                        <th className="px-10 py-6 font-black">Gestor</th>
                        <th className="px-10 py-6 font-black">Sócio</th>
                        <th className="px-10 py-6 font-black">Documento</th>
                        <th className="px-10 py-6 text-right font-black">Dívida Atual</th>
                        <th className="px-10 py-6 text-center font-black">Atraso</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-default)]/50">
                      {cardContracts.map((c, index) => (
                        <tr key={`${c.id}-${index}`} className="hover:bg-[var(--status-error)]/5 transition-all group cursor-pointer" onClick={() => onNavigateToDetails(c.id)}>
                          <td className="px-10 py-6 font-bold text-[var(--text-secondary)] text-xs uppercase italic">{c.pa}</td>
                          <td className="px-10 py-6 text-[var(--text-secondary)]/70 text-[11px] font-semibold">{c.gerente}</td>
                          <td className="px-10 py-6 font-black text-[var(--text-primary)] uppercase tracking-tight text-xs italic">{c.clientName}</td>
                          <td className="px-10 py-6 font-mono text-[10px] text-[var(--text-secondary)]">{c.cpfCnpj}</td>
                          <td className="px-10 py-6 text-right font-black text-[var(--status-error)] tabular-nums">{formatCurrency(c.saldoDevedor)}</td>
                          <td className="px-10 py-6 text-center">
                            <span className={`px-4 py-1 rounded-xl text-[10px] font-black uppercase tracking-tighter ${c.daysOverdue > 90 ? 'bg-[var(--status-error)] text-white' : 'bg-[var(--status-error)]/10 text-[var(--status-error)]'}`}>
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
