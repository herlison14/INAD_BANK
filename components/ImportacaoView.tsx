
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
  const { allContracts } = useApp();

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-24">
        <div className="text-center space-y-4">
            <h2 className="text-6xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">Central de Injeção</h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em]">Sincronização Master v4.0 • UPSERT Protocol</p>
        </div>

        <div className="bg-blue-600 p-8 rounded-[3rem] shadow-2xl flex items-center justify-between text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none group-hover:scale-125 transition-transform duration-[2s]">
                <FeatherIcon name="cpu" className="w-40 h-40" />
            </div>
            <div className="flex items-center gap-8 relative z-10">
                <div className="bg-white/20 p-5 rounded-3xl backdrop-blur-xl border border-white/20">
                    <FeatherIcon name="activity" className="w-10 h-10" />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">Status da Base Local</p>
                    <p className="text-3xl font-black italic tracking-tighter leading-none">{allContracts.length} Contratos Ativos</p>
                </div>
            </div>
            <div className="hidden md:block px-6 py-3 bg-black/20 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest relative z-10">
                Lógica Master: On Duplicate Key Update
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
                <div className="flex items-center gap-3 ml-4">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">Base Geral</h3>
                </div>
                <FileImporter 
                    onDataImported={onDataImported} 
                    label="Injetar Contratos (A/B)"
                />
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest px-6 italic">
                    Prioriza Coluna A (PA) e Coluna B (Gerente) para vinculação RLS.
                </p>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-3 ml-4">
                    <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">Base Cartões</h3>
                </div>
                <FileImporter 
                    onDataImported={onDataImported} 
                    label="Injetar Cartões (I/N)"
                    isCardImport={true}
                />
                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest px-6 italic">
                    Sanitiza Saldo (Col I) e Dias de Atraso (Col N).
                </p>
            </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/50 p-10 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 flex items-start gap-8">
            <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl text-blue-600 shadow-xl">
                <FeatherIcon name="shield" className="w-8 h-8" />
            </div>
            <div className="space-y-4">
                <h4 className="text-sm font-black uppercase tracking-widest italic text-slate-800 dark:text-white">Governança de Dados Sicoob</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-bold uppercase tracking-tight">
                    O sistema gera um Fingerprint (Hash) para cada arquivo importado. Isso impede que a mesma planilha seja re-processada, garantindo a integridade dos saldos financeiros e impedindo a duplicidade física no banco de dados local.
                </p>
            </div>
        </div>
    </div>
  );
};

export default ImportacaoView;
