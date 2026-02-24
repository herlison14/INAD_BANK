import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';

// 1. ENGINE DE CÁLCULO PARA O LETREIRO (Contexto Bancário)
const useMétricasLetreiro = (filtros: any) => {
  const { allContracts } = useApp();

  return useMemo(() => {
    // Filtra a base conforme a PA ou Gerente selecionado no FilterBar
    const baseFiltrada = allContracts.filter(c => {
      const matchPA = filtros.pa === 'Todas' || c.pa === filtros.pa;
      const matchGerente = filtros.gerente === 'Todos' || c.gerente === filtros.gerente;
      return matchPA && matchGerente;
    });

    const saldoTotal = baseFiltrada.reduce((acc, c) => acc + (c.saldoDevedor || 0), 0);
    const resolvidos = baseFiltrada.filter(c => c.status === 'Resolvido').length;
    const taxaEficiencia = baseFiltrada.length > 0 ? (resolvidos / baseFiltrada.length) * 100 : 0;
    
    // Cálculo de Provisão (PDD) - Contratos > 90 dias sem acordo
    const pddProjetado = baseFiltrada
      .filter(c => c.daysOverdue > 90 && c.status !== 'Resolvido')
      .reduce((acc, c) => acc + (c.saldoDevedor || 0), 0);

    return [
      { label: "Exposição Sob Gestão", value: `R$ ${saldoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, color: "text-emerald-400" },
      { label: "Eficiência da Carteira", value: `${taxaEficiencia.toFixed(1)}%`, color: "text-blue-400" },
      { label: "Risco de Perda (PDD > 90d)", value: `R$ ${pddProjetado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, color: "text-red-400" },
      { label: "Contratos em Aberto", value: (baseFiltrada.length - resolvidos).toString(), color: "text-orange-400" },
      { label: "Filtro Ativo", value: filtros.pa !== 'Todas' ? `PA: ${filtros.pa}` : "Geral", color: "text-cyan-400" }
    ];
  }, [allContracts, filtros]);
};

const LetreiroDinamico: React.FC<{ filtros: any }> = ({ filtros }) => {
  const kpis = useMétricasLetreiro(filtros);
  const [index, setIndex] = useState(0);
  const { isSyncing } = useApp();

  // Troca de informação a cada 3 segundos (Dinâmica veloz)
  useEffect(() => {
    if (kpis.length === 0) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % kpis.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [kpis.length]);

  if (kpis.length === 0) return null;

  return (
    <div className="flex items-center bg-slate-900 border-b border-slate-800 h-12 overflow-hidden shadow-2xl relative z-20 shrink-0">
      {/* Badge de Alerta Tático */}
      <div className="relative z-10 bg-red-600 px-6 h-full flex items-center justify-center">
        <motion.span 
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-[10px] font-black text-white italic tracking-widest whitespace-nowrap"
        >
          MONITORAMENTO DE RISCO
        </motion.span>
        {/* Triângulo de corte visual */}
        <div className="absolute right-[-15px] top-0 border-t-[48px] border-t-red-600 border-r-[15px] border-r-transparent" />
      </div>

      <div className="flex-1 flex items-center h-full px-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${index}-${filtros.pa}-${filtros.gerente}`} // Muda o KPI ou o Filtro = Reinicia animação
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex items-center gap-4"
          >
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">
              {kpis[index].label}:
            </span>
            <span className={`text-lg font-black font-mono tracking-tight ${kpis[index].color}`}>
              {kpis[index].value}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Status de Sincronização Dinâmico */}
      <div className="hidden md:flex items-center gap-3 px-6 border-l border-slate-800 h-full">
        <div className="flex flex-col items-end">
          <span className="text-[9px] font-bold text-slate-500">ENGINE IA 3.0</span>
          <span className={`text-[10px] font-black uppercase ${isSyncing ? 'text-yellow-500' : 'text-emerald-500'}`}>
            {isSyncing ? 'Sincronizando' : 'Auditado'}
          </span>
        </div>
        <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-yellow-500 animate-spin' : 'bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse'}`} />
      </div>
    </div>
  );
};

export default LetreiroDinamico;
