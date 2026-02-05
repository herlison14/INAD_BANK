
import React, { useState, useMemo, useEffect } from 'react';
import { Contract, ContractStatus, UserRole } from '../types';
import FeatherIcon from './FeatherIcon';

declare const Papa: any;
declare const XLSX: any;

type SortConfig = {
  key: keyof Contract | 'daysOverdue' | 'delinquencyRange';
  direction: 'ascending' | 'descending';
} | null;

const getDelinquencyRange = (days: number): string => {
    if (days <= 30) return '1-30 dias';
    if (days <= 60) return '31-60 dias';
    if (days <= 90) return '61-90 dias';
    if (days <= 180) return '91-180 dias';
    if (days <= 365) return '181-365 dias';
    return '365+ dias';
};

// LGPD Masking Function
const maskCpfCnpj = (val: string, role: UserRole): string => {
    if (role === UserRole.Admin) return val;
    if (!val || val.length < 5) return '***.***.***-**';
    
    // Simple masking: show only first 3 and last 2 digits
    const firstPart = val.substring(0, 3);
    const lastPart = val.substring(val.length - 2);
    return `${firstPart}.***.***-${lastPart}`;
};

const StatusBadge: React.FC<{ status: ContractStatus }> = ({ status }) => {
    const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full";
    const statusClasses = {
        [ContractStatus.Overdue]: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        [ContractStatus.Negotiating]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        [ContractStatus.Resolved]: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
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
      contract.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.gerente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.pa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.cpfCnpj.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [contracts, searchTerm]);

  const sortedContracts = useMemo(() => {
    let sortableItems = [...filteredContracts];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        if (sortConfig.key === 'daysOverdue') {
            aValue = a.daysOverdue;
            bValue = b.daysOverdue;
        } else if (sortConfig.key === 'delinquencyRange') {
             aValue = a.daysOverdue;
             bValue = b.daysOverdue;
        } else {
            aValue = a[sortConfig.key as keyof Contract];
            bValue = b[sortConfig.key as keyof Contract];
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredContracts, sortConfig]);

  const requestSort = (key: keyof Contract | 'daysOverdue' | 'delinquencyRange') => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIndicator = (key: keyof Contract | 'daysOverdue' | 'delinquencyRange') => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? '▲' : '▼';
  };

  const getExportData = () => {
    return sortedContracts.map(c => {
        return {
            'Contrato ID': c.id,
            'Cliente': c.clientName,
            'CPF/CNPJ': maskCpfCnpj(c.cpfCnpj, userRole), 
            'Produto': c.product,
            'Saldo Devedor (R$)': c.saldoDevedor,
            'Dias em Atraso (Col R)': c.daysOverdue,
            'Faixa de Atraso': getDelinquencyRange(c.daysOverdue),
            'Status': c.status,
            'Gerente': c.gerente,
            'PA Responsável': c.pa,
            'Região': c.region,
            'Data Vencimento': c.dueDate,
        };
    });
  };

  const handleExportCSV = () => {
    if (sortedContracts.length === 0) return;
    const dataForCsv = getExportData();
    const csv = Papa.unparse(dataForCsv);
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'contratos_inadimplentes.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const headers: { key: keyof Contract | 'daysOverdue' | 'delinquencyRange', label: string }[] = [
      { key: 'id', label: 'Contrato'},
      { key: 'clientName', label: 'Cliente'},
      { key: 'cpfCnpj', label: 'CPF/CNPJ'},
      { key: 'product', label: 'Produto'},
      { key: 'saldoDevedor', label: 'Saldo Devedor'},
      { key: 'daysOverdue', label: 'Dias Atraso'},
      { key: 'delinquencyRange', label: 'Faixa de Atraso'},
      { key: 'status', label: 'Status'},
      { key: 'gerente', label: 'Gerente'},
      { key: 'pa', label: 'PA Responsável'},
  ];

  return (
    <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white uppercase tracking-tighter italic">Lista de Contratos</h3>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
                <div className="relative flex-grow sm:flex-grow-0">
                    <input
                        type="text"
                        placeholder="Pesquisar..."
                        value={searchTerm}
                        className="bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 pr-10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64 transition-colors"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute right-3 top-2.5 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>
                {userRole === UserRole.Admin && (
                    <button
                        onClick={handleExportCSV}
                        disabled={sortedContracts.length === 0}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center space-x-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed uppercase tracking-tighter"
                    >
                        <FeatherIcon name="upload" className="h-4 w-4 rotate-180" />
                        <span className="hidden sm:inline">CSV</span>
                    </button>
                )}
            </div>
        </div>
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
          <thead className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50 dark:bg-slate-900">
            <tr>
              {headers.map(({ key, label }) => (
                <th key={key} scope="col" className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap" onClick={() => requestSort(key)}>
                    <div className="flex items-center gap-2 font-black">
                        {label} <span className="text-[8px] opacity-50">{getSortIndicator(key)}</span>
                    </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {sortedContracts.map((contract) => (
              <tr key={contract.id} className="bg-white dark:bg-slate-800 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group">
                <td 
                    className="px-6 py-4 font-black text-gray-900 dark:text-white whitespace-nowrap cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 italic"
                    onClick={() => onNavigateToDetails && onNavigateToDetails(contract.id)}
                    title="Ver histórico e logs"
                >
                    {contract.id}
                </td>
                <td className="px-6 py-4 max-w-[200px] truncate font-semibold uppercase tracking-tight">{contract.clientName}</td>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-400">
                    {maskCpfCnpj(contract.cpfCnpj, userRole)}
                </td>
                <td className="px-6 py-4 text-[11px] font-bold uppercase text-gray-500">{contract.product}</td>
                <td 
                    className="px-6 py-4 font-mono font-black text-blue-600 dark:text-blue-400 cursor-pointer group-hover:underline flex items-center gap-2"
                    onClick={() => onSimulateRenegotiation && onSimulateRenegotiation(contract.saldoDevedor)}
                    title="Iniciar Simulação de Renegociação"
                >
                    {contract.saldoDevedor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td className="px-6 py-4 text-center tabular-nums font-bold">{contract.daysOverdue}</td>
                <td className="px-6 py-4 whitespace-nowrap text-[10px] font-black text-gray-400 uppercase tracking-widest">{getDelinquencyRange(contract.daysOverdue)}</td>
                <td className="px-6 py-4"><StatusBadge status={contract.status} /></td>
                <td className="px-6 py-4 text-[11px] font-semibold">{contract.gerente}</td>
                <td className="px-6 py-4 text-[11px] whitespace-nowrap font-semibold">{contract.pa}</td>
              </tr>
            ))}
             {sortedContracts.length === 0 && (
                <tr>
                    <td colSpan={10} className="text-center py-24 text-gray-500 dark:text-gray-400 italic font-bold uppercase text-xs tracking-widest">Nenhum contrato encontrado nos filtros atuais</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContractsTable;
