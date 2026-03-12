
import React from 'react';
import { useApp } from '../context/AppContext';

const NegociosView: React.FC = () => {
  const { deals } = useApp();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Negócios</h1>
      <div className="bg-[#1a1f2e] rounded-xl border border-[#2e3347] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#2e3347] text-xs uppercase font-bold text-slate-400">
            <tr>
              <th className="p-4">Título</th>
              <th className="p-4">Valor</th>
              <th className="p-4">Status</th>
              <th className="p-4">Data de Fechamento</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2e3347]">
            {deals.map(deal => (
              <tr key={deal.id} className="hover:bg-[#2e3347]/50 transition-colors">
                <td className="p-4 font-bold">{deal.title}</td>
                <td className="p-4 text-blue-400 font-bold">
                  {deal.value.toLocaleString('pt-BR', { style: 'currency', currency: deal.currency })}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                    deal.status === 'Ganho' ? 'bg-emerald-500/20 text-emerald-400' :
                    deal.status === 'Perdido' ? 'bg-red-500/20 text-red-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {deal.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-400">{new Date(deal.expectedCloseDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NegociosView;
