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
    title: "SALDO DEVEDOR TOTAL",
    subtitle: "SOMATÓRIA COLUNA Y",
    icon: "dollar-sign",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    description: "Somatória Contábil da Coluna Y (A partir da linha 2). Representa o montante total de exposição financeira sob gestão."
  },
  {
    key: 'roll',
    title: "TOTAL DE LINHAS PROCESSADAS",
    subtitle: "CONTAGEM DE REGISTROS",
    icon: "list",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    description: "Contagem total de linhas processadas da planilha (Excluindo cabeçalho)."
  },
  {
    key: 'pcld',
    title: "PROVISÃO PCLD (Z)",
    subtitle: "SOMATÓRIA COLUNA Z",
    icon: "shield",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    description: "Reserva financeira (Provisão para Créditos de Liquidação Duvidosa) destinada a cobrir perdas esperadas, conforme exigências regulatórias bancárias."
  },
  {
    key: 'loss',
    title: "EXPOSIÇÃO DE RISCO",
    subtitle: "CÁLCULO PROJETADO",
    icon: "alert-circle",
    color: "text-red-500",
    bg: "bg-red-500/10",
    description: "Cálculo de risco baseado no saldo real (15% do saldo devedor total)."
  }
];

export const DashboardKpiGrid: React.FC<{ contratos: Contract[], onCardClick?: (key: string) => void }> = ({ contratos, onCardClick }) => {
  const [infoOpen, setInfoOpen] = useState<string | null>(null);

  // Lógica de Processamento de Dados (Somas Reais Colunas Y e Z)
  const processedMetrics = useMemo(() => {
    // 1. Soma Real da Coluna Y (Saldo Devedor / Exposure)
    const totalSaldoY = contratos.reduce((acc, c) => acc + (c.saldoDevedor || 0), 0);
    
    // 2. Soma Real da Coluna Z (Provisão PCLD)
    const totalPcldZ = contratos.reduce((acc, c) => acc + (c.valorProvisionado || 0), 0);
    
    // 3. Contagem de Linhas (Excluindo cabeçalho)
    const totalLinhas = contratos.length;

    // 4. Exposição de Risco: Cálculo de risco baseado no saldo real (15% conforme solicitado)
    const lossExpectancy = totalSaldoY * 0.15;

    return {
      cash: { val: `R$ ${totalSaldoY.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`, critical: false },
      roll: { val: `${totalLinhas}`, critical: totalLinhas > 1000 },
      pcld: { val: `R$ ${totalPcldZ.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`, critical: false },
      loss: { val: `R$ ${lossExpectancy.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`, critical: lossExpectancy > THRESHOLDS.LOSS_EXPECTANCY_WARN }
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
              borderColor: ["var(--border-default)", "var(--status-error)", "var(--border-default)"]
            } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
            onClick={() => onCardClick && onCardClick(box.key)}
            className={`relative bg-[var(--surface-container)] border ${metric.critical ? 'border-[var(--status-error)]' : 'border-[var(--border-default)]'} p-6 rounded-[2.5rem] backdrop-blur-xl group cursor-pointer hover:bg-[var(--surface-elevated)] transition-colors shadow-sm`}
          >
            {/* Linha Superior */}
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${metric.critical ? 'bg-[var(--status-error)]/20 text-[var(--status-error)]' : `bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]`}`}>
                <FeatherIcon name={metric.critical ? "alert-triangle" : box.icon} className="w-5 h-5" />
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-black uppercase tracking-widest ${metric.critical ? 'text-[var(--status-error)]' : 'text-[var(--brand-primary)]'}`}>
                  {metric.critical ? "CRÍTICO" : box.subtitle}
                </span>
                
                {/* Botão de Interrogação */}
                <button 
                  onClick={(e) => { e.stopPropagation(); setInfoOpen(infoOpen === box.key ? null : box.key); }}
                  className="w-6 h-6 rounded-full flex items-center justify-center bg-[var(--surface-background)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all border border-[var(--border-default)]"
                >
                  <span className="text-xs font-bold">?</span>
                </button>
              </div>
            </div>

            {/* Valores Principais */}
            <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase mb-1 tracking-tight">{box.title}</p>
            <h3 className={`text-2xl font-black font-mono italic tracking-tighter ${metric.critical ? 'text-[var(--status-error)]' : 'text-[var(--text-primary)]'}`}>
              {metric.val}
            </h3>

            {/* Modal de Informação (Tooltip Expandido) */}
            <AnimatePresence>
              {infoOpen === box.key && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute inset-0 z-20 bg-[var(--surface-elevated)] p-6 rounded-[2.5rem] flex flex-col justify-center border border-[var(--brand-primary)]/30"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)]`}>{box.title}</span>
                    <button onClick={(e) => { e.stopPropagation(); setInfoOpen(null); }} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                       <FeatherIcon name="x" className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
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
