
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FeatherIcon from './FeatherIcon';
import { Deal, DealStatus } from '../types';

// ─── CONFIGURAÇÃO DOS BOXES (Dicionário de Negócio CRM) ──────────────────────
const BOXES_DATA = [
  {
    key: 'revenue',
    title: "RECEITA TOTAL (GANHOS)",
    subtitle: "VALOR CONSOLIDADO",
    icon: "dollar-sign",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    description: "Soma total do valor de todos os negócios marcados como 'Ganho'."
  },
  {
    key: 'pipeline',
    title: "VALOR EM PIPELINE",
    subtitle: "NEGÓCIOS ABERTOS",
    icon: "layers",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    description: "Soma total do valor de todos os negócios com status 'Aberto'."
  },
  {
    key: 'openCount',
    title: "NEGÓCIOS ATIVOS",
    subtitle: "CONTAGEM ATUAL",
    icon: "briefcase",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    description: "Quantidade total de negócios que ainda estão em negociação (Abertos)."
  },
  {
    key: 'conversion',
    title: "TAXA DE CONVERSÃO",
    subtitle: "EFICIÊNCIA DE VENDAS",
    icon: "trending-up",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    description: "Percentual de negócios ganhos em relação ao total de negócios fechados (Ganhos + Perdidos)."
  },
  {
    key: 'avgValue',
    title: "TICKET MÉDIO",
    subtitle: "VALOR POR NEGÓCIO",
    icon: "target",
    color: "text-red-500",
    bg: "bg-red-500/10",
    description: "Valor médio de cada negócio ganho."
  }
];

export const DashboardKpiGrid: React.FC<{ deals: Deal[], onCardClick?: (key: string) => void }> = ({ deals, onCardClick }) => {
  const [infoOpen, setInfoOpen] = useState<string | null>(null);

  const processedMetrics = useMemo(() => {
    const wonDeals = deals.filter(d => d.status === DealStatus.Won);
    const openDeals = deals.filter(d => d.status === DealStatus.Open);
    const lostDeals = deals.filter(d => d.status === DealStatus.Lost);
    const closedDealsCount = wonDeals.length + lostDeals.length;

    const totalRevenue = wonDeals.reduce((acc, d) => acc + d.value, 0);
    const pipelineValue = openDeals.reduce((acc, d) => acc + d.value, 0);
    const conversionRate = closedDealsCount > 0 ? (wonDeals.length / closedDealsCount) * 100 : 0;
    const avgValue = wonDeals.length > 0 ? totalRevenue / wonDeals.length : 0;

    return {
      revenue: { val: totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }), critical: false },
      pipeline: { val: pipelineValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }), critical: false },
      openCount: { val: `${openDeals.length}`, critical: false },
      conversion: { val: `${conversionRate.toFixed(1)}%`, critical: conversionRate < 20 && closedDealsCount > 5 },
      avgValue: { val: avgValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }), critical: false }
    };
  }, [deals]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {BOXES_DATA.map((box) => {
        const metric = processedMetrics[box.key as keyof typeof processedMetrics];
        
        return (
          <motion.div 
            key={box.key}
            animate={metric.critical ? { 
              boxShadow: ["0px 0px 0px rgba(239, 68, 68, 0)", "0px 0px 25px rgba(239, 68, 68, 0.4)", "0px 0px 0px rgba(239, 68, 68, 0)"],
              borderColor: ["#2e3347", "#ef4444", "#2e3347"]
            } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
            onClick={() => onCardClick && onCardClick(box.key)}
            className={`relative bg-[#1a1f2e] border ${metric.critical ? 'border-red-500' : 'border-[#2e3347]'} p-6 rounded-3xl group cursor-pointer hover:bg-[#2e3347] transition-colors shadow-xl`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${metric.critical ? 'bg-red-500/20 text-red-500' : `bg-blue-500/20 text-blue-400`}`}>
                <FeatherIcon name={metric.critical ? "alert-triangle" : box.icon} className="w-5 h-5" />
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-black uppercase tracking-widest ${metric.critical ? 'text-red-500' : 'text-slate-400'}`}>
                  {metric.critical ? "ATENÇÃO" : box.subtitle}
                </span>
                
                <button 
                  onClick={(e) => { e.stopPropagation(); setInfoOpen(infoOpen === box.key ? null : box.key); }}
                  className="w-6 h-6 rounded-full flex items-center justify-center bg-[#0f1117] text-slate-500 hover:text-white transition-all border border-[#2e3347]"
                >
                  <span className="text-xs font-black">?</span>
                </button>
              </div>
            </div>
 
            <p className="text-slate-400 text-[10px] font-black uppercase mb-1 tracking-tight">{box.title}</p>
            <h3 className={`text-2xl font-black font-mono italic tracking-tighter ${metric.critical ? 'text-red-500' : 'text-white'}`}>
              {metric.val}
            </h3>

            <AnimatePresence>
              {infoOpen === box.key && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute inset-0 z-20 bg-[#2e3347] p-6 rounded-3xl flex flex-col justify-center border border-blue-500/30"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest text-blue-400`}>{box.title}</span>
                    <button onClick={(e) => { e.stopPropagation(); setInfoOpen(null); }} className="text-slate-400 hover:text-white">
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
