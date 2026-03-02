import React, { useMemo } from 'react';
import { Contract } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type GroupedByManager = Record<string, { count: number; saldoDevedor: number; valorProvisionado: number; }>;

interface ManagerViewProps {
    contracts: Contract[];
    isDarkMode: boolean;
}

const ManagerView: React.FC<ManagerViewProps> = ({ contracts, isDarkMode }) => {
  
  const dataByManager = useMemo(() => {
    const grouped = contracts.reduce((acc: GroupedByManager, contract) => {
      const manager = contract.gerente || 'Não especificado';
      if (!acc[manager]) {
        acc[manager] = {
          count: 0,
          saldoDevedor: 0,
          valorProvisionado: 0,
        };
      }
      acc[manager].count++;
      acc[manager].saldoDevedor += contract.saldoDevedor;
      acc[manager].valorProvisionado += contract.valorProvisionado;
      return acc;
    }, {} as GroupedByManager);

    return Object.entries(grouped)
      .map(([name, values]: [string, GroupedByManager[string]]) => ({
        name,
        'Nº Contratos': values.count,
        'Saldo Devedor': values.saldoDevedor,
        'Valor Provisionado': values.valorProvisionado,
      }))
      .sort((a, b) => b['Saldo Devedor'] - a['Saldo Devedor']);
  }, [contracts]);

  const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  // Chart colors for dark mode
  const axisColor = isDarkMode ? '#94a3b8' : '#4b5563';
  const tooltipBg = isDarkMode ? '#1e293b' : '#ffffff';
  const tooltipBorder = isDarkMode ? '#334155' : '#e5e7eb';
  const tooltipText = isDarkMode ? '#f1f5f9' : '#1f2937';

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Visão por Gerente</h2>
      <p className="text-gray-600 dark:text-gray-400">Performance da carteira por gerente responsável.</p>
      
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md transition-colors">
        <h3 className="font-semibold mb-4 text-gray-700 dark:text-gray-200">Comparativo de Saldo Devedor por Gerente</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dataByManager} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={isDarkMode ? 0.1 : 0.4} />
            <XAxis type="number" stroke={axisColor} fontSize={12} tickFormatter={(value) => new Intl.NumberFormat('pt-BR', { notation: 'compact', compactDisplay: 'short' }).format(value)} />
            <YAxis type="category" dataKey="name" stroke={axisColor} fontSize={12} width={100} />
            <Tooltip 
              cursor={{fill: 'rgba(239, 68, 68, 0.1)'}} 
              contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, color: tooltipText }} 
              itemStyle={{ color: tooltipText }}
              formatter={(value: any) => formatCurrency(Number(value || 0))}
            />
            <Legend wrapperStyle={{ color: axisColor }} />
            <Bar dataKey="Saldo Devedor" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md transition-colors">
        <h3 className="font-semibold mb-4 text-gray-700 dark:text-gray-200">Detalhes por Gerente</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
            <thead className="text-xs text-gray-700 dark:text-gray-200 uppercase bg-gray-50 dark:bg-slate-700">
              <tr>
                <th scope="col" className="px-6 py-3">Gerente</th>
                <th scope="col" className="px-6 py-3 text-right">Nº Contratos</th>
                <th scope="col" className="px-6 py-3 text-right">Saldo Devedor</th>
                <th scope="col" className="px-6 py-3 text-right">Valor Provisionado</th>
              </tr>
            </thead>
            <tbody>
              {dataByManager.map((item) => (
                <tr key={item.name} className="bg-white dark:bg-slate-800 border-b dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.name}</td>
                  <td className="px-6 py-4 text-right">{item['Nº Contratos']}</td>
                  <td className="px-6 py-4 text-right">{formatCurrency(item['Saldo Devedor'])}</td>
                  <td className="px-6 py-4 text-right">{formatCurrency(item['Valor Provisionado'])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerView;