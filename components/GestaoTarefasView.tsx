
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, TaskStatus, Contract } from '../types';
import FeatherIcon from './FeatherIcon';

interface GestaoTarefasViewProps {
  tasks: Task[];
  contracts: Contract[];
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onNavigateToDetails: (contractId: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE: GESTÃO DE TAREFAS COM HISTÓRICO DE NEGOCIAÇÃO
// ─────────────────────────────────────────────────────────────────────────────
const GestaoTarefasView: React.FC<GestaoTarefasViewProps> = ({ tasks, contracts, onUpdateTaskStatus, onNavigateToDetails }) => {
  const [taskAtiva, setTaskAtiva] = useState<Task | null>(null);
  const [resumoNegociacao, setResumoNegociacao] = useState("");

  // Simulação de Histórico de Propostas Recusadas
  const historicoPropostas = [
    { data: '12/02/2026', valor: 'R$ 15.000,00', motivo: 'Parcela muito alta' },
    { data: '05/02/2026', valor: 'R$ 12.000,00', motivo: 'Sem entrada disponível' },
  ];

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => a.priority - b.priority);
  }, [tasks]);

  // Função de Exportação para Excel (CSV)
  const exportarRelatorio = () => {
    const headers = [
      'Contrato', 
      'Cliente', 
      'Atraso (Dias)', 
      'Data Criação', 
      'Hora Criação', 
      'Gerente', 
      'Status Atual', 
      'Gerou Acordo', 
      'Resumo Interação', 
      'Histórico Recusas'
    ];

    const rows = sortedTasks.map(t => {
      const contract = contracts.find(c => c.id === t.contractId);
      const [data, hora] = t.creationDate.split(', ');
      
      // Se for a task ativa, incluímos o resumo que está sendo editado
      const resumo = t.id === taskAtiva?.id ? resumoNegociacao : '';
      
      // Histórico formatado para uma única célula
      const historicoStr = historicoPropostas.map(h => `${h.data}: ${h.valor} (${h.motivo})`).join(' | ');

      return [
        t.contractId,
        t.contractClient,
        contract?.daysOverdue || 'N/A',
        data || t.creationDate,
        hora || '',
        contract?.gerente || t.managerEmail,
        t.status,
        t.status === TaskStatus.Concluida ? 'SIM' : 'NÃO',
        resumo.replace(/\n/g, ' '),
        historicoStr
      ];
    });

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
    ].join('\n');

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_negociacao_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-2">
      {/* Lista de Tarefas / Contratos */}
      <div className="lg:col-span-5 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-black text-[var(--text-primary)] flex items-center gap-2 uppercase tracking-tighter italic">
            <FeatherIcon name="list" className="text-[var(--brand-primary)]" /> Fila de Negociação
          </h3>
          <button 
            onClick={exportarRelatorio}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--surface-container)] hover:bg-[var(--brand-primary)] hover:text-white text-[var(--text-secondary)] rounded-xl text-[10px] font-black uppercase transition-all shadow-sm border border-[var(--border-default)]"
          >
            <FeatherIcon name="download" className="w-3 h-3" />
            Exportar Excel
          </button>
        </div>
        <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar scroll-smooth">
          {sortedTasks.map((t, index) => (
            <div key={`${t.id}-${index}`} onClick={() => setTaskAtiva(t)}
              className={`p-5 rounded-3xl border-2 transition-all cursor-pointer ${taskAtiva?.id === t.id ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5 shadow-lg' : 'border-[var(--border-default)] bg-[var(--surface-container)] hover:border-[var(--brand-primary)]/30'}`}>
              <div className="flex justify-between items-start">
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${t.priority === 1 ? 'bg-[var(--status-error)]/10 text-[var(--status-error)]' : 'bg-[var(--status-warning)]/10 text-[var(--status-warning)]'}`}>
                  {t.priority === 1 ? 'CRÍTICA' : 'ALERTA'}
                </span>
                <span className="text-[10px] font-mono text-[var(--text-secondary)]/50">ID: {t.id.slice(-5)}</span>
              </div>
              <p className="font-black text-[var(--text-primary)] mt-2 uppercase italic">{t.contractClient}</p>
              <p className="text-[10px] text-[var(--text-secondary)] mt-1 line-clamp-1">{t.description}</p>
              
              <div className="mt-4 flex justify-between items-center">
                <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">{t.status}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); onNavigateToDetails(t.contractId); }}
                  className="p-2 bg-[var(--surface-background)] text-[var(--text-secondary)] rounded-xl hover:bg-[var(--brand-primary)] hover:text-white transition-all border border-[var(--border-default)]"
                >
                  <FeatherIcon name="external-link" className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="py-20 text-center bg-[var(--surface-background)]/50 rounded-[3rem] border-2 border-dashed border-[var(--border-default)]">
               <FeatherIcon name="check-square" className="w-12 h-12 mx-auto text-[var(--text-secondary)]/20 mb-4" />
               <p className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest italic">Fila vazia</p>
            </div>
          )}
        </div>
      </div>

      {/* CRM: Histórico e Resumo Editável */}
      <div className="lg:col-span-7">
        <AnimatePresence mode="wait">
          {taskAtiva ? (
            <motion.div key={taskAtiva.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="bg-[var(--surface-container)] rounded-[3rem] border border-[var(--border-default)] shadow-2xl overflow-hidden">
              
              <div className="p-8 space-y-8">
                {/* Cabeçalho do Cliente */}
                <div className="flex justify-between items-start border-b border-[var(--border-default)] pb-6">
                  <div>
                    <h4 className="text-2xl font-black text-[var(--text-primary)] uppercase italic tracking-tighter">Dossiê de Negociação</h4>
                    <p className="text-sm font-bold text-[var(--brand-primary)]">{taskAtiva.contractClient}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Status do Acordo</p>
                    <select 
                      value={taskAtiva.status} 
                      onChange={(e) => onUpdateTaskStatus(taskAtiva.id, e.target.value as TaskStatus)}
                      className="bg-transparent border-none text-[var(--status-warning)] font-black italic outline-none cursor-pointer text-right"
                    >
                      {Object.values(TaskStatus).map(s => <option key={s} value={s} className="bg-[var(--surface-container)] text-[var(--text-primary)]">{s}</option>)}
                    </select>
                  </div>
                </div>

                {/* HISTÓRICO DE RECUSAS */}
                <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] flex items-center gap-2">
                    <FeatherIcon name="archive" className="w-3 h-3" /> Histórico de Propostas Recusadas
                  </h5>
                  <div className="space-y-2">
                    {historicoPropostas.map((h, i) => (
                      <div key={i} className="flex justify-between p-4 bg-[var(--surface-background)] rounded-2xl border border-[var(--border-default)]">
                        <div>
                          <p className="text-xs font-black text-[var(--text-primary)]">{h.valor}</p>
                          <p className="text-[10px] text-[var(--status-error)] font-bold uppercase italic">Motivo: {h.motivo}</p>
                        </div>
                        <span className="text-[10px] text-[var(--text-secondary)] font-mono">{h.data}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* BOX EDITÁVEL DE RESUMO */}
                <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] flex items-center gap-2">
                    <FeatherIcon name="edit-3" className="w-3 h-3" /> Resumo da Última Interação
                  </h5>
                  <textarea 
                    value={resumoNegociacao}
                    onChange={(e) => setResumoNegociacao(e.target.value)}
                    placeholder="Ex: O cliente demonstrou interesse, mas aguarda liberação do FGTS para a entrada de 15%. Retornar dia 25."
                    className="w-full h-40 p-6 bg-[var(--surface-background)] border-2 border-[var(--border-default)] rounded-[2rem] text-sm text-[var(--text-primary)] focus:ring-4 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] outline-none transition-all resize-none font-medium placeholder:text-[var(--text-secondary)]/30"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button className="flex-1 py-5 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 transition-all hover:scale-[1.02]">
                    Salvar Resumo e Histórico
                  </button>
                  <button className="px-8 py-5 bg-[var(--status-success)] hover:bg-[var(--status-success)]/90 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.02]">
                    Converter em Acordo
                  </button>
                </div>
              </div>

            </motion.div>
          ) : (
            <div className="h-[600px] flex items-center justify-center border-4 border-dashed border-[var(--border-default)] rounded-[4rem] p-12 text-center">
              <div className="opacity-20">
                <FeatherIcon name="mouse-pointer" className="w-16 h-16 mx-auto mb-6 text-[var(--text-secondary)]" />
                <p className="font-black uppercase text-xs tracking-[0.3em] text-[var(--text-secondary)]">Selecione um contrato para visualizar o histórico</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GestaoTarefasView;
