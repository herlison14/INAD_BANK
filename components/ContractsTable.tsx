
import React, { useState, useMemo, useEffect } from 'react';
import { Contract, ContractStatus, UserRole } from '../types';
import FeatherIcon from './FeatherIcon';

declare const Papa: any;

type SortConfig = {
  key: keyof Contract | 'daysOverdue';
  direction: 'ascending' | 'descending';
} | null;

const maskCpfCnpj = (val: string, role: UserRole): string => {
    if (role === UserRole.Admin || role === UserRole.Coordenador) return val;
    if (!val || val.length < 5) return '***.***.***-**';
    const firstPart = val.substring(0, 3);
    const lastPart = val.substring(val.length - 2);
    return `${firstPart}.***.***-${lastPart}`;
};

const StatusBadge: React.FC<{ status: ContractStatus }> = ({ status }) => {
    const baseClasses = "px-2 py-1 text-[9px] font-black uppercase rounded-lg";
    const statusClasses = {
        [ContractStatus.Overdue]: "bg-red-500 text-white",
        [ContractStatus.Negotiating]: "bg-amber-500 text-white",
        [ContractStatus.Resolved]: "bg-blue-500 text-white",
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
}

interface ContractsTableProps {
  contracts: Contract[];
  initialSearchTerm?: string;
  onNavigateToDetails?: (contractId: string) => void;
  onSimulateRenegotiation?: (value: number) => void;
  userRole?: UserRole;
}

const ContractsTable: React.FC<ContractsTableProps> = ({ contracts, initialSearchTerm = '', onNavigateToDetails, onSimulateRenegotiation, userRole = UserRole.Gerente }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'daysOverdue', direction: 'ascending' });

  useEffect(() => {
    setSearchTerm(initialSearchTerm);
  }, [initialSearchTerm]);

  const filteredContracts = useMemo(() => {
    return contracts.filter(contract =>
      (contract.socio || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contract.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contract.cpfCnpj || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [contracts, searchTerm]);

  const sortedContracts = useMemo(() => {
    let sortableItems = [...filteredContracts];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Contract];
        const bValue = b[sortConfig.key as keyof Contract];
        if (aValue! < bValue!) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue! > bValue!) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredContracts, sortConfig]);

  const requestSort = (key: keyof Contract | 'daysOverdue') => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleExportCSV = () => {
    const dataForCsv = sortedContracts.map(c => ({
        'PA': c.pa,
        'Gerente': c.gerente,
        'SÓCIO': c.socio,
        'CPF': maskCpfCnpj(c.cpfCnpj, userRole), 
        'Contrato': c.id,
        'Dias Atraso': c.daysOverdue,
        'Saldo Devedor': c.saldoDevedor,
        'Telefones': c.phone
    }));
    const csv = Papa.unparse(dataForCsv);
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ESPELHO_CARTEIRA_${new Date().getTime()}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--surface-container)] p-6 rounded-[2.5rem] border border-[var(--border-default)]">
            <div className="relative flex-grow max-w-md">
                <input
                    type="text"
                    placeholder="Buscar Sócio, CPF ou Contrato..."
                    value={searchTerm}
                    className="w-full bg-[var(--surface-background)] border-2 border-[var(--border-default)] rounded-2xl px-6 py-3.5 text-sm font-bold outline-none focus:border-[var(--brand-primary)] transition-all text-[var(--text-primary)]"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            {userRole === UserRole.Admin && (
                <button
                    onClick={handleExportCSV}
                    className="bg-[var(--text-primary)] text-[var(--surface-background)] text-[10px] font-black py-4 px-8 rounded-2xl flex items-center gap-3 transition-all hover:scale-105 uppercase tracking-widest shadow-xl"
                >
                    <FeatherIcon name="upload" className="h-4 w-4 rotate-180" />
                    Exportar Detalhamento
                </button>
            )}
        </div>

      <div className="overflow-x-auto rounded-[3rem] border border-[var(--border-default)] shadow-2xl bg-[var(--surface-container)]">
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest bg-[var(--surface-background)]/50 border-b border-[var(--border-default)]">
            <tr>
              {['PA', 'Gerente', 'Sócio', 'CPF', 'Contrato', 'Atraso', 'Saldo Devedor', 'Telefones'].map((label, idx) => (
                <th key={idx} className="px-8 py-6 font-black">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-default)]/50">
            {sortedContracts.map((c, index) => (
              <tr key={`${c.id}-${index}`} className="hover:bg-[var(--brand-primary)]/5 transition-colors group">
                <td className="px-8 py-6 text-xs font-bold text-[var(--text-secondary)] uppercase">{c.pa}</td>
                <td className="px-8 py-6 text-[11px] font-semibold text-[var(--text-secondary)]/70">{c.gerente}</td>
                <td className="px-8 py-6 text-sm font-black text-[var(--text-primary)] uppercase italic tracking-tight">{c.socio}</td>
                <td className="px-8 py-6 font-mono text-[10px] text-[var(--text-secondary)]">{maskCpfCnpj(c.cpfCnpj, userRole)}</td>
                <td className="px-8 py-6 text-xs font-black text-[var(--brand-primary)] cursor-pointer hover:underline" onClick={() => onNavigateToDetails && onNavigateToDetails(c.id)}>{c.id}</td>
                <td className="px-8 py-6 text-center">
                   <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${c.daysOverdue > 90 ? 'bg-[var(--status-error)] text-white' : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)]'}`}>
                      {c.daysOverdue} d
                   </span>
                </td>
                <td 
                    className="px-8 py-6 font-mono font-black text-[var(--brand-primary)] cursor-pointer hover:underline"
                    onClick={() => onSimulateRenegotiation && onSimulateRenegotiation(c.saldoDevedor)}
                    title="Clique para simular renegociação"
                >
                    {c.saldoDevedor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td className="px-8 py-6 font-mono text-[10px] text-[var(--text-secondary)]">{c.phone || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContractsTable;
