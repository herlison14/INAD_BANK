
import React, { useMemo } from 'react';
import { Contract, AutomationLog, UserRole } from '../types';
import ContractsTable from './ContractsTable';
import FeatherIcon from './FeatherIcon';

interface DetalhamentoViewProps {
  contracts: Contract[];
  initialSearchTerm?: string;
  onNavigateToDetails: (contractId: string) => void;
  onSimulateRenegotiation: (value: number) => void;
  automationLogs?: AutomationLog[];
  userRole?: UserRole;
}

const DetalhamentoView: React.FC<DetalhamentoViewProps> = ({ contracts, initialSearchTerm, onNavigateToDetails, onSimulateRenegotiation, automationLogs, userRole }) => {
  
  const selectedLogs = useMemo(() => {
      if (!automationLogs || !initialSearchTerm) return [];
      return automationLogs.filter(log => 
        log.contractId.toLowerCase().includes(initialSearchTerm.toLowerCase()) ||
        log.contractClient.toLowerCase().includes(initialSearchTerm.toLowerCase())
      ).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [automationLogs, initialSearchTerm]);

  if (contracts.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 p-24 rounded-[3.5rem] text-center border border-slate-100 dark:border-slate-800 shadow-sm animate-fade-in">
        <FeatherIcon name="list" className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto mb-6" />
        <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest italic">Aguardando Carga Master</h3>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-4">Os dados injetados na aba Importação aparecerão aqui automaticamente.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
        <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-1 uppercase tracking-tighter italic">Espelho de Carteira (Detalhamento)</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <FeatherIcon name="info" className="h-4 w-4 text-blue-500" />
            Visualização Auditada: <span className="text-blue-600 font-black">{userRole}</span> • Filtro RLS Ativo.
        </p>
        <ContractsTable 
            contracts={contracts} 
            initialSearchTerm={initialSearchTerm} 
            onNavigateToDetails={onNavigateToDetails} 
            onSimulateRenegotiation={onSimulateRenegotiation}
            userRole={userRole}
        />
      </div>

      {initialSearchTerm && selectedLogs.length > 0 && (
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm animate-fade-in transition-colors border border-slate-100 dark:border-slate-700">
              <h3 className="text-xl font-black text-gray-800 dark:text-white mb-6 flex items-center uppercase tracking-tighter italic">
                  <FeatherIcon name="zap" className="text-yellow-500 mr-3 h-6 w-6" />
                  Histórico de Automação ({initialSearchTerm})
              </h3>
              <div className="relative border-l-2 border-gray-100 dark:border-slate-700 ml-3 space-y-6">
                  {selectedLogs.map((log) => (
                      <div key={log.id} className="ml-6 relative">
                          <span className="absolute -left-9 flex items-center justify-center w-6 h-6 bg-blue-50 dark:bg-blue-900/50 rounded-full ring-4 ring-white dark:ring-slate-800">
                              <FeatherIcon name="check-square" className="h-3 w-3 text-blue-600 dark:text-blue-300" />
                          </span>
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                            <div>
                                <h4 className="flex items-center mb-1 text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                    {log.description}
                                </h4>
                                <p className="block mb-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Regra: {log.ruleName}</p>
                            </div>
                            <time className="block mb-1 text-[10px] font-black text-gray-400 uppercase tracking-widest sm:order-last sm:mb-0">
                                {new Date(log.timestamp).toLocaleString('pt-BR')}
                            </time>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};

export default DetalhamentoView;
