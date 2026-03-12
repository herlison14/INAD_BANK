
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Contract, UserRole } from '../types';
import FeatherIcon from './FeatherIcon';

interface ContractCardProps {
  contract: Contract;
  userRole: UserRole;
  onNavigateToDetails: (id: string) => void;
}

const ContractCard: React.FC<ContractCardProps> = ({ contract, userRole, onNavigateToDetails }) => {
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  // Lógica de Mascaramento para LGPD
  const maskCPF = (cpf: string) => {
    if (showSensitiveData || userRole === UserRole.Admin) return cpf;
    // Oculta parte do documento se não for admin e não estiver revelado
    return cpf.replace(/(\d{3})\.\d{3}\.\d{3}-(\d{2})/, "$1.***.***-$2");
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="relative group overflow-hidden rounded-[2.5rem] border border-[#2e3347] bg-[#1a1f2e] backdrop-blur-xl p-6 shadow-xl transition-all hover:shadow-2xl hover:bg-[#242938]"
    >
      {/* Header do Card */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-blue-500/10 rounded-2xl shadow-inner">
            <FeatherIcon name="package" className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-black text-[#f0f4ff] leading-none uppercase tracking-tighter text-sm">
              {contract.clientName}
            </h3>
            <p className="text-[10px] text-[#a0aec0] font-bold uppercase tracking-[0.2em] mt-1">
              Ref: {contract.id}
            </p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${contract.daysOverdue > 90 ? 'bg-red-500 text-white animate-pulse' : 'bg-[#242938] text-[#a0aec0]'}`}>
          {contract.daysOverdue} dias
        </div>
      </div>

      {/* Grid de Informações Sensíveis (LGPD) */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="space-y-1.5">
          <span className="text-[9px] font-black text-[#a0aec0] uppercase tracking-widest flex items-center gap-1.5">
            <FeatherIcon name="list" className="w-3 h-3" /> Documento
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#e2e8f0]">
              {maskCPF(contract.cpfCnpj)}
            </span>
            <button 
              onClick={() => setShowSensitiveData(!showSensitiveData)}
              className="p-1 hover:bg-[#2e3347] rounded-lg transition-colors text-blue-500"
              title={showSensitiveData ? "Ocultar" : "Mostrar"}
            >
              <FeatherIcon name={showSensitiveData ? "sun" : "moon"} className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="space-y-1.5 text-right">
          <span className="text-[9px] font-black text-[#a0aec0] uppercase tracking-widest flex items-center justify-end gap-1.5">
             Unidade <FeatherIcon name="map-pin" className="w-3 h-3" />
          </span>
          <span className="text-xs font-black text-[#e2e8f0] uppercase tracking-tighter">{contract.pa}</span>
        </div>
      </div>

      {/* Barra de Valor e Ação */}
      <div className="pt-6 border-t border-[#2e3347] flex justify-between items-center">
        <div>
          <span className="block text-[9px] font-black text-[#a0aec0] uppercase tracking-widest mb-1">Saldo Devedor</span>
          <span className="text-xl font-black text-[#f0f4ff] tabular-nums italic tracking-tighter">
            {contract.saldoDevedor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
        <button 
          onClick={() => onNavigateToDetails(contract.id)}
          className="bg-[#f0f4ff] text-[#0f1117] px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-black/20"
        >
          Detalhar
        </button>
      </div>

      {/* Indicador de Segurança */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-1.5 text-[8px] font-black text-green-500 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20 backdrop-blur-md">
          <FeatherIcon name="check-square" className="w-2.5 h-2.5" /> PROTEGIDO LGPD
        </div>
      </div>
    </motion.div>
  );
};

export default ContractCard;
