
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
  const { allContracts, importHashes } = useApp();

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-24">
        <div className="text-center space-y-4">
            <h2 className="text-6xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">Injeção Master</h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em]">Protocolo de Governança Sicoob v4.0</p>
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
                    Diretório v4 Ativo
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
                <div className="flex items-center gap-3 ml-4">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">Base Geral (A-AB)</h3>
                </div>
                <FileImporter onDataImported={onDataImported} label="Injetar Lote Geral" />
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-3 ml-4">
                    <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">Cartões (A-N)</h3>
                </div>
                <FileImporter onDataImported={onDataImported} label="Injetar Aba Cartões" isCardImport={true} />
            </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/10 p-10 rounded-[3.5rem] border border-amber-100 dark:border-amber-800 flex items-start gap-8">
            <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl text-amber-600 shadow-xl">
                <FeatherIcon name="alert-circle" className="w-8 h-8" />
            </div>
            <div className="space-y-4">
                <h4 className="text-sm font-black uppercase tracking-widest italic text-amber-800 dark:text-amber-300">Resumo de Protocolos Estritos</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocolo Geral (Índices Python)</p>
                        <div className="grid grid-cols-3 gap-2 text-[9px] font-bold uppercase text-amber-900 dark:text-amber-200">
                            <div className="p-1.5 bg-white/50 dark:bg-black/20 rounded">A: PA</div>
                            <div className="p-1.5 bg-white/50 dark:bg-black/20 rounded">B: Gerente</div>
                            <div className="p-1.5 bg-white/50 dark:bg-black/20 rounded">D: CPF</div>
                            <div className="p-1.5 bg-white/50 dark:bg-black/20 rounded">L: Produto</div>
                            <div className="p-1.5 bg-white/50 dark:bg-black/20 rounded">M: Contrato</div>
                            <div className="p-1.5 bg-white/50 dark:bg-black/20 rounded">AA: Saldo</div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocolo Cartões (Aba Específica)</p>
                        <div className="grid grid-cols-3 gap-2 text-[9px] font-bold uppercase text-amber-900 dark:text-amber-200">
                            <div className="p-1.5 bg-white/50 dark:bg-black/20 rounded">A: PA</div>
                            <div className="p-1.5 bg-white/50 dark:bg-black/20 rounded">B: Gerente</div>
                            <div className="p-1.5 bg-white/50 dark:bg-black/20 rounded">C: Sócio</div>
                            <div className="p-1.5 bg-white/50 dark:bg-black/20 rounded">D: CPF</div>
                            <div className="p-1.5 bg-white/50 dark:bg-black/20 rounded">I: Dívida</div>
                            <div className="p-1.5 bg-white/50 dark:bg-black/20 rounded">N: Atraso</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ImportacaoView;
