
import React from 'react';
import { useApp } from '../context/AppContext';

const EmpresasView: React.FC = () => {
  const { organizations } = useApp();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Empresas</h1>
      <div className="bg-[#1a1f2e] rounded-xl border border-[#2e3347] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#2e3347] text-xs uppercase font-bold text-slate-400">
            <tr>
              <th className="p-4">Nome</th>
              <th className="p-4">Setor</th>
              <th className="p-4">Tamanho</th>
              <th className="p-4">Website</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2e3347]">
            {organizations.map(org => (
              <tr key={org.id} className="hover:bg-[#2e3347]/50 transition-colors">
                <td className="p-4 font-bold">{org.name}</td>
                <td className="p-4 text-sm">{org.sector || 'N/A'}</td>
                <td className="p-4 text-sm">{org.size || 'N/A'}</td>
                <td className="p-4 text-sm text-blue-400">{org.website || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmpresasView;
