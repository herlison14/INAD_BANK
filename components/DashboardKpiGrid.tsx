import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FeatherIcon from './FeatherIcon';
import { Contract } from '../types';

// ─── PARÂMETROS DE RISCO (Configuração da Equipe de Crédito) ────────────────
const THRESHOLDS = {
  ROLL_FORWARD_MAX: 15.0, // Alerta acima de 15% de rolagem de atraso
  LOSS_EXPECTANCY_WARN: 500000.00 // Alerta para perdas projetadas altas
};

// ─── CONFIGURAÇÃO DOS BOXES (Dicionário de Negócio) ─────────────────────────
const BOXES_DATA = [
  {
    key: 'cash',
    title: "CASH RECOVERY (LIQUIDADO)",
    subtitle: "CONSOLIDADO Y+I",
    icon: "dollar-sign",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    description: "Indica o capital que efetivamente entrou no caixa (liquidações reais). É o KPI de sucesso final, separando promessas de pagamento de dinheiro recuperado de fato."
  },
  {
    key: 'roll',
    title: "ROLL-FORWARD RATE",
    subtitle: "ALERTA DE FLUXO",
    icon: "activity",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    description: "Mede a degradação da carteira: quantos clientes 'rolaram' para uma faixa de atraso mais grave. Se ultrapassar 15%, a estratégia de cobrança precisa de revisão urgente."
  },
  {
    key: 'pcld',
    title: "PROVISÃO PCLD ACUMULADA",
    subtitle: "BASE COLUNA Z",
    icon: "shield",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    description: "Reserva financeira (Provisão para Créditos de Liquidação Duvidosa) destinada a cobrir perdas esperadas, conforme exigências regulatórias bancárias."
  },
  {
    key: 'loss',
    title: "LOSS EXPECTANCY (90D+)",
    subtitle: "INTERVENÇÃO IMEDIATA",
    icon: "alert-circle",
    color: "text-red-500",
    bg: "bg-red-500/10",
    description: "Valor projetado de perda definitiva para contratos com atraso superior a 90 dias sem acordo. Requer ação jurídica ou descontos agressivos (haircut)."
  }
];

export const DashboardKpiGrid: React.FC<{ contratos: Contract[] }> = ({ contratos }) => {
  const [infoOpen, setInfoOpen] = useState<string | null>(null);

  // Lógica de Processamento de Dados
  const processedMetrics = useMemo(() => {
    const totalRecuperado = contratos.filter(c => c.status === 'Resolvido').reduce((acc, c) => acc + (c.valorPago || 0), 0);
    const totalExposicao = contratos.reduce((acc, c) => acc + (c.saldoDevedor || 0), 0);
    
    // Simulação do Roll-Rate para ativação do batimento (exemplo em 17.5% conforme estratégia)
    const rollRate = 17.5; 

    return {
      cash: { val: `R$ ${totalRecuperado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, critical: false },
      roll: { val: `${rollRate}%`, critical: rollRate > THRESHOLDS.ROLL_FORWARD_MAX },
      pcld: { val: `R$ ${(totalExposicao * 0.12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, critical: false },
      loss: { val: `R$ ${contratos.filter(c => c.daysOverdue > 90).reduce((acc, c) => acc + c.saldoDevedor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, critical: false }
    };
  }, [contratos]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {BOXES_DATA.map((box) => {
        const metric = processedMetrics[box.key as keyof typeof processedMetrics];
        
        return (
          <motion.div 
            key={box.key}
            // Efeito de Batimento (Pulse) se estiver crítico
            animate={metric.critical ? { 
              boxShadow: ["0px 0px 0px rgba(239, 68, 68, 0)", "0px 0px 25px rgba(239, 68, 68, 0.4)", "0px 0px 0px rgba(239, 68, 68, 0)"],
              borderColor: ["#1e293b", "#ef4444", "#1e293b"]
            } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className={`relative bg-slate-900/60 border ${metric.critical ? 'border-red-500' : 'border-slate-800'} p-6 rounded-[2.5rem] backdrop-blur-xl group`}
          >
            {/* Linha Superior */}
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${metric.critical ? 'bg-red-500/20 text-red-500' : `${box.bg} ${box.color}`}`}>
                <FeatherIcon name={metric.critical ? "alert-triangle" : box.icon} className="w-5 h-5" />
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-black uppercase tracking-widest ${metric.critical ? 'text-red-500' : box.color}`}>
                  {metric.critical ? "CRÍTICO" : box.subtitle}
                </span>
                
                {/* Botão de Interrogação */}
                <button 
                  onClick={() => setInfoOpen(infoOpen === box.key ? null : box.key)}
                  className="w-6 h-6 rounded-full flex items-center justify-center bg-slate-800 text-slate-400 hover:text-white transition-all"
                >
                  <span className="text-xs font-bold">?</span>
                </button>
              </div>
            </div>

            {/* Valores Principais */}
            <p className="text-slate-500 text-[10px] font-bold uppercase mb-1 tracking-tight">{box.title}</p>
            <h3 className={`text-2xl font-black font-mono italic tracking-tighter ${metric.critical ? 'text-red-500' : 'text-white'}`}>
              {metric.val}
            </h3>

            {/* Modal de Informação (Tooltip Expandido) */}
            <AnimatePresence>
              {infoOpen === box.key && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute inset-0 z-20 bg-slate-900 p-6 rounded-[2.5rem] flex flex-col justify-center"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${box.color}`}>{box.title}</span>
                    <button onClick={() => setInfoOpen(null)} className="text-slate-400 hover:text-white">
                       <FeatherIcon name="x" className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {box.description}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};

export default DashboardKpiGrid;
