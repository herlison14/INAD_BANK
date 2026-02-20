
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
            <div className="relative flex-grow max-w-md">
                <input
                    type="text"
                    placeholder="Buscar Sócio, CPF ou Contrato..."
                    value={searchTerm}
                    className="w-full bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-3.5 text-sm font-bold outline-none focus:border-blue-500 transition-all"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            {userRole === UserRole.Admin && (
                <button
                    onClick={handleExportCSV}
                    className="bg-black dark:bg-white text-white dark:text-black text-[10px] font-black py-4 px-8 rounded-2xl flex items-center gap-3 transition-all hover:scale-105 uppercase tracking-widest shadow-xl"
                >
                    <FeatherIcon name="upload" className="h-4 w-4 rotate-180" />
                    Exportar Detalhamento
                </button>
            )}
        </div>

      <div className="overflow-x-auto rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900">
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
            <tr>
              {['PA', 'Gerente', 'Sócio', 'CPF', 'Contrato', 'Atraso', 'Saldo Devedor', 'Telefones'].map((label, idx) => (
                <th key={idx} className="px-8 py-6 font-black">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {sortedContracts.map((c) => (
              <tr key={c.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/5 transition-colors group">
                <td className="px-8 py-6 text-xs font-bold text-slate-500 uppercase">{c.pa}</td>
                <td className="px-8 py-6 text-[11px] font-semibold text-slate-400">{c.gerente}</td>
                <td className="px-8 py-6 text-sm font-black text-slate-900 dark:text-white uppercase italic tracking-tight">{c.socio}</td>
                <td className="px-8 py-6 font-mono text-[10px] text-slate-400">{maskCpfCnpj(c.cpfCnpj, userRole)}</td>
                <td className="px-8 py-6 text-xs font-black text-blue-600 dark:text-blue-400 cursor-pointer hover:underline" onClick={() => onNavigateToDetails && onNavigateToDetails(c.id)}>{c.id}</td>
                <td className="px-8 py-6 text-center">
                   <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${c.daysOverdue > 90 ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                      {c.daysOverdue} d
                   </span>
                </td>
                <td 
                    className="px-8 py-6 font-mono font-black text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
                    onClick={() => onSimulateRenegotiation && onSimulateRenegotiation(c.saldoDevedor)}
                    title="Clique para simular renegociação"
                >
                    {c.saldoDevedor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td className="px-8 py-6 font-mono text-[10px] text-slate-400">{c.phone || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContractsTable;
