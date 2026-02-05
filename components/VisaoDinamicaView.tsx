
import React, { useState, useMemo } from 'react';
import { Contract } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import FeatherIcon from './FeatherIcon';

interface VisaoDinamicaViewProps {
    contracts: Contract[];
    isDarkMode: boolean;
}

type GroupDimension = 'product' | 'pa' | 'gerente';
type MetricType = 'saldoDevedor' | 'count' | 'valorProvisionado';

const VisaoDinamicaView: React.FC<VisaoDinamicaViewProps> = ({ contracts, isDarkMode }) => {
  const [dimension, setDimension] = useState<GroupDimension>('product');
  const [metric, setMetric] = useState<MetricType>('saldoDevedor');

  const dimensionLabels: Record<GroupDimension, string> = {
    product: 'Produto',
    pa: 'Posto de Atendimento (PA)',
    gerente: 'Gerente'
  };

  const metricLabels: Record<MetricType, string> = {
    saldoDevedor: 'Saldo Devedor',
    count: 'Nº de Contratos',
    valorProvisionado: 'Valor Provisionado'
  };

  const aggregatedData = useMemo(() => {
    const grouped = contracts.reduce((acc: Record<string, any>, contract) => {
      const key = contract[dimension] || 'Não Informado';
      if (!acc[key]) {
        acc[key] = { name: key, saldoDevedor: 0, count: 0, valorProvisionado: 0 };
      }
      acc[key].saldoDevedor += contract.saldoDevedor;
      acc[key].count += 1;
      acc[key].valorProvisionado += contract.valorProvisionado;
      return acc;
    }, {});

    // Ordenar e limitar aos top 15 para manter a limpeza visual se houver muitos dados
    return Object.values(grouped)
      .sort((a: any, b: any) => b[metric] - a[metric])
      .slice(0, 15); 
  }, [contracts, dimension, metric]);

  const formatValue = (value: number) => {
    if (metric === 'count') return value.toLocaleString('pt-BR');
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const axisColor = isDarkMode ? '#94a3b8' : '#64748b';
  const tooltipBg = isDarkMode ? '#0f172a' : '#ffffff';
  const tooltipBorder = isDarkMode ? '#334155' : '#e2e8f0';
  const tooltipText = isDarkMode ? '#f1f5f9' : '#1e293b';

  // Cores dinâmicas para as barras
  const barColor = metric === 'saldoDevedor' ? '#3b82f6' : metric === 'count' ? '#8b5cf6' : '#f59e0b';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-10">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FeatherIcon name="pie-chart" className="text-blue-500 h-6 w-6" />
                    Análise Dinâmica de Carteira
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Comparativo de performance por categorias e métricas.</p>
            </div>
            
            <div className="flex flex-wrap gap-4">
                <div className="flex flex-col min-w-[140px]">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Dimensão</span>
                    <div className="inline-flex bg-gray-100 dark:bg-slate-900/50 p-1 rounded-lg">
                        {(['product', 'pa', 'gerente'] as GroupDimension[]).map((dim) => (
                            <button
                                key={dim}
                                onClick={() => setDimension(dim)}
                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${dimension === dim ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm' : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                {dim === 'product' ? 'Produtos' : dim === 'pa' ? 'PAs' : 'Gerentes'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col min-w-[140px]">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Métrica de Valor</span>
                    <div className="inline-flex bg-gray-100 dark:bg-slate-900/50 p-1 rounded-lg">
                        {(['saldoDevedor', 'count', 'valorProvisionado'] as MetricType[]).map((met) => (
                            <button
                                key={met}
                                onClick={() => setMetric(met)}
                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${metric === met ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm' : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                {met === 'saldoDevedor' ? 'Saldo' : met === 'count' ? 'Qtd' : 'Provisão'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        <div className="h-[500px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={aggregatedData} 
              layout="vertical" 
              margin={{ top: 5, right: 60, left: 20, bottom: 5 }}
              barSize={24}
            >
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={isDarkMode ? 0.05 : 0.2} horizontal={false} />
              <XAxis 
                type="number"
                stroke={axisColor} 
                fontSize={10}
                tickFormatter={(value) => metric === 'count' ? value : new Intl.NumberFormat('pt-BR', { notation: 'compact', compactDisplay: 'short' }).format(value)} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                type="category"
                dataKey="name" 
                stroke={axisColor} 
                fontSize={11} 
                width={150}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                cursor={{fill: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)'}} 
                contentStyle={{ 
                    backgroundColor: tooltipBg, 
                    border: `1px solid ${tooltipBorder}`, 
                    borderRadius: '12px', 
                    color: tooltipText,
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }} 
                formatter={(value: number) => [formatValue(value), metricLabels[metric]]}
              />
              <Bar 
                dataKey={metric} 
                fill={barColor} 
                radius={[0, 100, 100, 0]} 
                animationDuration={1500}
              >
                {aggregatedData.map((entry, index) => (
                    <Cell 
                        key={`cell-${index}`} 
                        fillOpacity={1 - (index * 0.04)} 
                        className="hover:opacity-80 transition-opacity cursor-pointer" 
                    />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-4 italic">Visualizando os top {aggregatedData.length} resultados por {metricLabels[metric].toLowerCase()}.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
        <h3 className="font-bold text-gray-800 dark:text-white mb-6 flex items-center text-lg">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg mr-3">
                <FeatherIcon name="list" className="h-5 w-5 text-blue-500" />
            </div>
            Listagem de Apoio: {dimensionLabels[dimension]}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
            <thead className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-gray-50/50 dark:bg-slate-900/30">
              <tr>
                <th className="px-6 py-4 font-bold">{dimensionLabels[dimension]}</th>
                <th className="px-6 py-4 font-bold text-right">Nº Contratos</th>
                <th className="px-6 py-4 font-bold text-right">Saldo Devedor</th>
                <th className="px-6 py-4 font-bold text-right">Provisão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {aggregatedData.map((item: any) => (
                <tr key={item.name} className="hover:bg-blue-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                  <td className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">{item.name}</td>
                  <td className="px-6 py-4 text-right tabular-nums">{item.count}</td>
                  <td className="px-6 py-4 text-right font-mono tabular-nums">{item.saldoDevedor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  <td className="px-6 py-4 text-right font-mono text-amber-600 dark:text-amber-400 tabular-nums">{item.valorProvisionado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VisaoDinamicaView;
