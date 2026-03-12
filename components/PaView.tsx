import React, { useMemo } from 'react';
import { Contract } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type GroupedByPa = Record<string, { count: number; saldoDevedor: number; valorProvisionado: number; }>;

interface PaViewProps {
    contracts: Contract[];
    isDarkMode: boolean;
}

const PaView: React.FC<PaViewProps> = ({ contracts, isDarkMode }) => {
  
  const dataByPa = useMemo(() => {
    const grouped = contracts.reduce((acc: GroupedByPa, contract) => {
      const pa = contract.pa || 'Não especificado';
      if (!acc[pa]) {
        acc[pa] = {
          count: 0,
          saldoDevedor: 0,
          valorProvisionado: 0,
        };
      }
      acc[pa].count++;
      acc[pa].saldoDevedor += contract.saldoDevedor;
      acc[pa].valorProvisionado += contract.valorProvisionado;
      return acc;
    }, {} as GroupedByPa);

    return Object.entries(grouped)
      .map(([name, values]: [string, GroupedByPa[string]]) => ({
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
      <h2 className="text-2xl font-bold text-[#f0f4ff]">Visão por Posto de Atendimento (PA)</h2>
      <p className="text-[#a0aec0]">Análise de inadimplência por Posto de Atendimento.</p>
      
      <div className="bg-[#1a1f2e] p-4 rounded-lg shadow-none ring-1 ring-[#2e3347] transition-colors">
        <h3 className="font-semibold mb-4 text-[#cbd5e0]">Comparativo de Saldo Devedor por PA</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dataByPa} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={isDarkMode ? 0.1 : 0.4} />
            <XAxis type="number" stroke={axisColor} fontSize={12} tickFormatter={(value) => new Intl.NumberFormat('pt-BR', { notation: 'compact', compactDisplay: 'short' }).format(value)} />
            <YAxis type="category" dataKey="name" stroke={axisColor} fontSize={12} width={100} />
            <Tooltip 
              cursor={{fill: 'rgba(59, 130, 246, 0.1)'}} 
              contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, color: tooltipText }} 
              itemStyle={{ color: tooltipText }}
              formatter={(value: any) => formatCurrency(Number(value || 0))}
            />
            <Legend wrapperStyle={{ color: axisColor }} />
            <Bar dataKey="Saldo Devedor" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#1a1f2e] p-4 rounded-lg shadow-none ring-1 ring-[#2e3347] transition-colors">
        <h3 className="font-semibold mb-4 text-[#cbd5e0]">Detalhes por PA</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-[#a0aec0]">
            <thead className="text-xs text-[#cbd5e0] uppercase bg-[#1a1f2e]">
              <tr>
                <th scope="col" className="px-6 py-3">Posto de Atendimento</th>
                <th scope="col" className="px-6 py-3 text-right">Nº Contratos</th>
                <th scope="col" className="px-6 py-3 text-right">Saldo Devedor</th>
                <th scope="col" className="px-6 py-3 text-right">Valor Provisionado</th>
              </tr>
            </thead>
            <tbody>
              {dataByPa.map((item) => (
                <tr key={item.name} className="bg-[#1a1f2e] border-b border-[#2e3347] hover:bg-[#242938] transition-colors">
                  <td className="px-6 py-4 font-medium text-[#f0f4ff]">{item.name}</td>
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

export default PaView;