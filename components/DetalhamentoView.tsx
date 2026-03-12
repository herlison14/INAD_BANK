
import React, { useMemo } from 'react';
import { Contract, AutomationLog, UserRole } from '../types';
import ContractsTable from './ContractsTable';
import FeatherIcon from './FeatherIcon';

interface DetalhamentoViewProps {
  contracts: Contract[];
  initialSearchTerm?: string;
  onNavigateToDetails: (contractId: string) => void;
  onSimulateRenegotiation: (value: number, daysOverdue: number, contractId: string) => void;
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
      <div className="bg-[var(--surface-container)] p-24 rounded-[3.5rem] text-center border border-[var(--border-default)] shadow-sm animate-fade-in">
        <FeatherIcon name="list" className="w-16 h-16 text-[var(--text-secondary)]/20 mx-auto mb-6" />
        <h3 className="text-xl font-black text-[var(--text-secondary)] uppercase tracking-widest italic">Aguardando Carga Master</h3>
        <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-4">Os dados injetados na aba Importação aparecerão aqui automaticamente.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div className="box-glow p-4 sm:p-6 rounded-3xl shadow-sm transition-colors">
        <h2 className="text-2xl font-black text-[var(--text-primary)] mb-1 uppercase tracking-tighter italic">Espelho de Carteira (Detalhamento)</h2>
        <p className="text-[var(--text-secondary)] mb-6 text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <FeatherIcon name="info" className="h-4 w-4 text-[var(--brand-primary)]" />
            Visualização Auditada: <span className="text-[var(--brand-primary)] font-black">{userRole}</span> • Filtro RLS Ativo.
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
          <div className="box-glow p-8 rounded-3xl shadow-sm animate-fade-in transition-colors">
              <h3 className="text-xl font-black text-[var(--text-primary)] mb-6 flex items-center uppercase tracking-tighter italic">
                  <FeatherIcon name="zap" className="text-[var(--status-warning)] mr-3 h-6 w-6" />
                  Histórico de Automação ({initialSearchTerm})
              </h3>
              <div className="relative border-l-2 border-[var(--border-default)] ml-3 space-y-6">
                  {selectedLogs.map((log, index) => (
                      <div key={`${log.id}-${index}`} className="ml-6 relative">
                          <span className="absolute -left-9 flex items-center justify-center w-6 h-6 bg-[var(--brand-primary)]/10 rounded-full ring-4 ring-[var(--surface-container)]">
                              <FeatherIcon name="check-square" className="h-3 w-3 text-[var(--brand-primary)]" />
                          </span>
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                            <div>
                                <h4 className="flex items-center mb-1 text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">
                                    {log.description}
                                </h4>
                                <p className="block mb-2 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Regra: {log.ruleName}</p>
                            </div>
                            <time className="block mb-1 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest sm:order-last sm:mb-0">
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
