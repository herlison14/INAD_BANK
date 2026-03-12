
import React from 'react';
import { useApp } from '../context/AppContext';

const PipelineView: React.FC = () => {
  const { deals, stages } = useApp();
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Pipeline de Vendas</h1>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map(stage => (
          <div key={stage.id} className="min-w-[300px] bg-[#1a1f2e] rounded-xl border border-[#2e3347] flex flex-col h-[calc(100vh-200px)]">
            <div className="p-4 border-b border-[#2e3347] flex justify-between items-center">
              <h3 className="font-bold text-sm uppercase tracking-wider">{stage.name}</h3>
              <span className="text-xs bg-[#2e3347] px-2 py-1 rounded-full">
                {deals.filter(d => d.stageId === stage.id).length}
              </span>
            </div>
            <div className="p-2 flex-1 overflow-y-auto space-y-2">
              {deals.filter(d => d.stageId === stage.id).map(deal => (
                <div key={deal.id} className="bg-[#2e3347] p-4 rounded-lg border border-white/5 hover:border-blue-500/50 transition-all cursor-pointer">
                  <p className="font-bold text-sm mb-1">{deal.title}</p>
                  <p className="text-blue-400 font-bold text-xs">
                    {deal.value.toLocaleString('pt-BR', { style: 'currency', currency: deal.currency })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PipelineView;
