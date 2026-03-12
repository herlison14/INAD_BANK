
import React, { useMemo } from 'react';
import { Contract } from '../types';
import FeatherIcon from './FeatherIcon';
import { formatCurrency } from '../utils/formatter';

interface PrejuizoViewProps {
  contracts: Contract[];
  onNavigateToDetails: (contractId: string) => void;
}

const PrejuizoView: React.FC<PrejuizoViewProps> = ({ contracts, onNavigateToDetails }) => {
  const prejContracts = useMemo(() => {
    return contracts.filter(c => c.originSheet === 'Prejuizo');
  }, [contracts]);

  const totalPrejuizo = useMemo(() => {
    return prejContracts.reduce((acc, c) => acc + c.saldoDevedor, 0);
  }, [prejContracts]);

  if (prejContracts.length === 0) {
    return (
      <div className="bg-[var(--surface-container)] p-24 rounded-[3.5rem] text-center border border-[var(--border-default)] shadow-sm animate-fade-in">
        <FeatherIcon name="alert-octagon" className="w-16 h-16 text-amber-500/20 mx-auto mb-6" />
        <h3 className="text-xl font-black text-[var(--text-secondary)] uppercase tracking-widest italic">Aguardando Carga PREJ 02</h3>
        <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-4">Os dados de prejuízo aparecerão aqui após a importação.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in">
      {/* HEADER E RESUMO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[var(--surface-container)] p-10 rounded-[3.5rem] border border-[var(--border-default)] flex items-center gap-8">
          <div className="p-6 bg-amber-500 text-white rounded-3xl shadow-xl shadow-amber-500/20">
            <FeatherIcon name="alert-octagon" className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-4xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic leading-none">Contratos em Prejuízo</h2>
            <p className="text-[var(--text-secondary)] font-bold uppercase text-[10px] tracking-[0.4em] mt-3">Monitoramento de Perdas Efetivadas (PREJ 02)</p>
          </div>
        </div>

        <div className="bg-[var(--surface-container)] p-10 rounded-[3.5rem] border border-[var(--border-default)] flex flex-col justify-center">
          <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-2">Impacto Financeiro Total</p>
          <p className="text-4xl font-black text-[var(--text-primary)] italic tracking-tighter tabular-nums">{formatCurrency(totalPrejuizo)}</p>
          <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase mt-2">{prejContracts.length} Contratos Identificados</p>
        </div>
      </div>

      {/* TABELA DE PREJUÍZO */}
      <div className="bg-[var(--surface-container)] rounded-[3.5rem] border border-[var(--border-default)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-default)] text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                <th className="px-10 py-6">PA</th>
                <th className="px-10 py-6">Gerente</th>
                <th className="px-10 py-6">Sócio / Cliente</th>
                <th className="px-10 py-6">CPF/CNPJ</th>
                <th className="px-10 py-6 text-right">Valor Prejuízo</th>
                <th className="px-10 py-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]/50">
              {prejContracts.map((c, index) => (
                <tr key={`${c.id}-${index}`} className="hover:bg-amber-500/5 transition-all group cursor-pointer" onClick={() => onNavigateToDetails(c.id)}>
                  <td className="px-10 py-6 font-bold text-[var(--text-secondary)] text-xs uppercase italic">{c.pa}</td>
                  <td className="px-10 py-6 text-[var(--text-secondary)]/70 text-[11px] font-semibold">{c.gerente}</td>
                  <td className="px-10 py-6 font-black text-[var(--text-primary)] uppercase tracking-tight text-xs italic">{c.clientName}</td>
                  <td className="px-10 py-6 font-mono text-[10px] text-[var(--text-secondary)]">{c.cpfCnpj}</td>
                  <td className="px-10 py-6 text-right font-black text-amber-600 tabular-nums">{formatCurrency(c.saldoDevedor)}</td>
                  <td className="px-10 py-6 text-center">
                    <span className="px-4 py-1 rounded-xl text-[10px] font-black uppercase tracking-tighter bg-amber-500/10 text-amber-600">
                        PREJUÍZO
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PrejuizoView;
