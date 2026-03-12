
import React from 'react';
import { motion } from 'framer-motion';
import FeatherIcon from './FeatherIcon';

const AutoHealingOverlay: React.FC<{ errorType: string }> = ({ errorType }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-xl"
    >
      <div className="max-w-md w-full p-8 bg-[#1a1f2e] rounded-[3rem] shadow-4xl border border-[#2e3347] text-center">
        {/* Ícone Animado de Reparo */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            className="absolute inset-0 border-4 border-t-blue-500 border-r-transparent border-b-indigo-500 border-l-transparent rounded-full"
          />
          <div className="absolute inset-0 flex items-center justify-center text-blue-500">
            <FeatherIcon name="zap" className="h-10 w-10 animate-pulse" />
          </div>
        </div>

        <h2 className="text-2xl font-black text-[#f0f4ff] mb-2 uppercase tracking-tighter italic">
          Otimizando sua Conexão
        </h2>
        
        <p className="text-[#a0aec0] text-sm mb-8 leading-relaxed font-medium">
          Detectamos uma instabilidade em <span className="font-bold text-blue-400">{errorType}</span>. 
          Nosso auto-corretor está reestabelecendo os protocolos de segurança.
        </p>

        {/* Status das Etapas de Reparo */}
        <div className="space-y-3 mb-8 text-left">
          {[
            { label: 'Verificando Integridade do Token', status: 'done' },
            { label: 'Sincronizando Banco de Dados', status: 'loading' },
            { label: 'Limpando Cache de Sessão', status: 'pending' }
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-[#242938]/50 border border-[#2e3347]">
              {step.status === 'done' ? (
                <div className="text-green-500"><FeatherIcon name="check-square" className="h-5 w-5" /></div>
              ) : step.status === 'loading' ? (
                <div className="text-blue-500 animate-spin"><FeatherIcon name="refresh-cw" className="h-5 w-5" /></div>
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-[#2e3347]" />
              )}
              <span className={`text-[10px] font-black uppercase tracking-widest ${step.status === 'pending' ? 'opacity-30' : 'opacity-100'}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        <button 
          onClick={() => window.location.reload()}
          className="w-full py-5 bg-[#f0f4ff] text-[#0f1117] rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
        >
          Forçar Reinicialização Manual
        </button>
      </div>
    </motion.div>
  );
};

export default AutoHealingOverlay;
