
import React from 'react';
import { motion } from 'framer-motion';
import FileImporter from './FileImporter';
import { Contract } from '../types';
import FeatherIcon from './FeatherIcon';
import { useApp } from '../context/AppContext';

interface ImportacaoViewProps {
  onDataImported: (data: Contract[]) => void;
  contractCount: number;
}

const ImportacaoView: React.FC<ImportacaoViewProps> = ({ onDataImported, contractCount }) => {
  const { allContracts, importHashes, clearDatabase, addAuditLog } = useApp();

  const handleHardReset = () => {
    const confirm1 = window.confirm("🚨 ALERTA DE SEGURANÇA: Você está prestes a executar um HARD RESET.");
    if (!confirm1) return;

    const confirm2 = window.confirm("Isso apagará permanentemente todos os contratos, tarefas, notificações e históricos de importação. Esta ação é IRREVERSÍVEL. Deseja continuar?");
    if (!confirm2) return;

    clearDatabase();
    addAuditLog('SISTEMA', 'HARD RESET', 'Protocolo de reset total executado com sucesso.');
    alert("✅ SISTEMA RESETADO: O Dashboard agora está limpo e pronto para nova carga.");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-24">
        <div className="text-center space-y-4">
            <h2 className="text-6xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">Injeção Master</h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em]">PAINEL INAD 1.0 - Módulo ETL</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-blue-600 p-8 rounded-[3.5rem] shadow-2xl flex flex-col justify-between text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-125 transition-transform duration-[2s]">
                    <FeatherIcon name="cpu" className="w-32 h-32" />
                </div>
                <div className="flex items-center gap-6 relative z-10 mb-8">
                    <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-xl border border-white/20">
                        <FeatherIcon name="activity" className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">Total em Base</p>
                        <p className="text-4xl font-black italic tracking-tighter leading-none">{allContracts.length}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-black/20 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest relative z-10 w-fit">
                    Modo Governança Estrita
                </div>
            </div>

            <div className="bg-slate-900 dark:bg-black p-8 rounded-[3.5rem] shadow-2xl flex flex-col justify-between text-white relative overflow-hidden group border border-white/5">
                <div className="absolute bottom-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-125 transition-transform duration-[2s]">
                    <FeatherIcon name="shield" className="w-32 h-32" />
                </div>
                <div className="flex items-center gap-6 relative z-10 mb-8">
                    <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-xl border border-white/10">
                        <FeatherIcon name="list" className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">Arquivos Auditados</p>
                        <p className="text-4xl font-black italic tracking-tighter leading-none text-blue-400">{importHashes.length}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest relative z-10 w-fit">
                    Diretório PAINEL INAD 1.0 Ativo
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
                <div className="flex items-center gap-3 ml-4">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">BASE GERAL (Sincro Automática)</h3>
                </div>
                <FileImporter onDataImported={onDataImported} label="Injetar Lote Estratégico" />
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-3 ml-4">
                    <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">FLUXO CARTÕES (Aba Cartão)</h3>
                </div>
                <FileImporter onDataImported={onDataImported} label="Injetar Movimento Cartão" isCardImport={true} />
            </div>
        </div>

        {/* BOX DE HARD RESET (ZONA DE PERIGO) */}
        <div className="bg-red-600 p-1 rounded-[3.5rem] shadow-2xl shadow-red-500/20 overflow-hidden group">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.4rem] flex flex-col md:flex-row items-center gap-8">
              <div className="p-6 bg-red-500 text-white rounded-3xl shadow-xl group-hover:rotate-12 transition-transform duration-500">
                  <FeatherIcon name="trash-2" className="w-10 h-10" />
              </div>
              <div className="flex-1 space-y-3 text-center md:text-left">
                  <h4 className="text-lg font-black uppercase tracking-tighter italic text-red-600">Protocolo de Hard Reset</h4>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-relaxed">
                      Esta função é vital para garantir a integridade do sistema ao trocar de base. 
                      O Hard Reset limpa resíduos de importações anteriores, garantindo que nenhum dado antigo 
                      contamine os novos gráficos do Dashboard ou as análises da IA.
                  </p>
              </div>
              <button 
                  onClick={handleHardReset}
                  className="px-10 py-6 bg-red-600 hover:bg-red-700 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center gap-4"
              >
                  <FeatherIcon name="refresh-cw" className="w-5 h-5" />
                  RESETE DE DADOS
              </button>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/10 p-10 rounded-[3.5rem] border border-blue-100 dark:border-blue-800 flex items-start gap-8">
            <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl text-blue-600 shadow-xl">
                <FeatherIcon name="info" className="w-8 h-8" />
            </div>
            <div className="space-y-4">
                <h4 className="text-sm font-black uppercase tracking-widest italic text-blue-800 dark:text-blue-300">Diretrizes de Mapeamento</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-blue-200 dark:border-blue-800 pb-2">Protocolo Base Geral:</p>
                        <div className="grid grid-cols-2 gap-2 text-[9px] font-bold uppercase text-blue-900 dark:text-blue-200">
                            <div>A: PAs</div>
                            <div>B: Gerentes</div>
                            <div>D: CPF</div>
                            <div>F: Telefones</div>
                            <div>J: Produtos</div>
                            <div>K: Contrato ID</div>
                            <div>P: Atraso</div>
                            <div>Y: Saldo</div>
                            <div>Z: Provisão</div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest border-b border-rose-200 dark:border-rose-900 pb-2">Protocolo Cartão:</p>
                        <div className="grid grid-cols-2 gap-2 text-[9px] font-bold uppercase text-rose-900 dark:text-rose-200">
                            <div>A: PA</div>
                            <div>B: Gerente</div>
                            <div>C: Sócio</div>
                            <div>D: CPF</div>
                            <div>I: Dívida</div>
                            <div>M: Contrato</div>
                            <div>N: Atraso</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ImportacaoView;