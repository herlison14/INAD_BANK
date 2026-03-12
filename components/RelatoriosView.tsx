
import React from 'react';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const RelatoriosView: React.FC = () => {
  const { deals } = useApp();
  
  const data = [
    { name: 'Ganho', value: deals.filter(d => d.status === 'Ganho').length },
    { name: 'Perdido', value: deals.filter(d => d.status === 'Perdido').length },
    { name: 'Aberto', value: deals.filter(d => d.status === 'Aberto').length },
  ];

  const COLORS = ['#10b981', '#ef4444', '#3b82f6'];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Relatórios e Performance</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1a1f2e] p-6 rounded-xl border border-[#2e3347]">
          <h3 className="font-bold mb-6">Status dos Negócios</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#1a1f2e] p-6 rounded-xl border border-[#2e3347]">
          <h3 className="font-bold mb-6">Volume de Vendas</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2e3347" />
                <XAxis dataKey="name" stroke="#a0aec0" />
                <YAxis stroke="#a0aec0" />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelatoriosView;
