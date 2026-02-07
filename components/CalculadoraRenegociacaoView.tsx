
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FeatherIcon from './FeatherIcon';
import { formatCurrency } from '../utils/formatter';
import { Slider } from './ui/Slider';
import { useSafetyGuard } from '../hooks/useSafetyGuard';

interface CalculadoraRenegociacaoViewProps {
    isDarkMode: boolean;
    initialValue?: number;
}

const CalculadoraRenegociacaoView: React.FC<CalculadoraRenegociacaoViewProps> = ({ isDarkMode, initialValue }) => {
  const [valorManual, setValorManual] = useState<number>(initialValue || 0);
  const [parcelas, setParcelas] = useState(1);
  const [entradaManual, setEntradaManual] = useState<number | null>(null);
  const { checkAnomalies } = useSafetyGuard();

  const [displayValor, setDisplayValor] = useState('');
  const [displayEntrada, setDisplayEntrada] = useState('');

  const MAX_PARCELAS = 48;
  const DESCONTO_A_VISTA = 15; 
  const TAXA_MULTA = 0.02;
  const TAXA_MORA_MES = 0.01; 
  const TAXA_IOF_FIXO = 0.0038;
  const TAXA_IOF_DIARIO = 0.000082;
  const ENTRADA_MIN_PERCENT = 0.10;

  const formatToBRLInput = (value: number | null): string => {
    if (value === null) return '';
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const parseBRLInput = (value: string): number => {
    const cleanedValue = value.replace(/\D/g, '');
    return Number(cleanedValue) / 100;
  };

  useEffect(() => {
    if (initialValue !== undefined && initialValue > 0) {
      setValorManual(initialValue);
      setDisplayValor(formatToBRLInput(initialValue));
    }
  }, [initialValue]);

  const calculos = useMemo(() => {
    const isAVista = parcelas === 1;
    
    if (isAVista) {
      const totalAVista = valorManual * (1 - DESCONTO_A_VISTA / 100);
      const economia = valorManual - totalAVista;
      const guard = checkAnomalies({ parcelas, valorParcela: 0, isAVista: true, desconto: DESCONTO_A_VISTA });

      return {
        tipo: 'LIQUIDAÇÃO À VISTA',
        valorFinal: totalAVista,
        entrada: totalAVista,
        parcela: 0,
        economia: economia,
        isAVista: true,
        guard
      };
    } else {
      const multa = valorManual * TAXA_MULTA;
      const moraTotal = valorManual * (TAXA_MORA_MES * parcelas); 
      const iofTotal = valorManual * (TAXA_IOF_FIXO + (TAXA_IOF_DIARIO * (parcelas * 30)));
      
      const valorComEncargos = valorManual + multa + moraTotal + iofTotal;
      const entradaSugerida = valorComEncargos * ENTRADA_MIN_PERCENT;
      const entradaEfetiva = entradaManual !== null ? entradaManual : entradaSugerida;
      
      const saldoAFinanciar = Math.max(0, valorComEncargos - entradaEfetiva);
      const valorParcela = parcelas > 1 ? saldoAFinanciar / (parcelas - 1) : 0;

      const guard = checkAnomalies({ parcelas, valorParcela, isAVista: false });

      return {
        tipo: 'PARCELAMENTO ESTRATÉGICO',
        valorFinal: valorComEncargos,
        entrada: entradaEfetiva,
        parcela: valorParcela,
        economia: 0,
        isAVista: false,
        guard
      };
    }
  }, [valorManual, parcelas, entradaManual, checkAnomalies]);

  const handleValorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numericValue = parseBRLInput(rawValue);
    setValorManual(numericValue);
    setDisplayValor(formatToBRLInput(numericValue));
  };

  const handleEntradaInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numericValue = parseBRLInput(rawValue);
    setEntradaManual(numericValue);
    setDisplayEntrada(formatToBRLInput(numericValue));
  };

  const isBlocked = !calculos.guard.valid;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-2 max-w-[1400px] mx-auto pb-20 animate-fade-in">
      
      {/* TERMINAL DE COMANDO (INPUTS) */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-[#0f172a] rounded-[3.5rem] p-10 shadow-3xl border border-white/5 space-y-12 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>
        
        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/20 italic">
                <span className="text-white font-black text-2xl">C</span>
             </div>
             <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter italic leading-none">TERMINAL <span className="text-blue-400">BI</span></h3>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-1">SICOOB RECOVERY v3.5</p>
             </div>
          </div>
          <div className="flex gap-2">
             <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
             <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
             <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>
          </div>
        </div>

        <div className="space-y-12 relative z-10">
          {/* CAMPO: CAPITAL DE ORIGEM */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
                <label className="text-[11px] font-black uppercase text-blue-400 tracking-[0.2em]">Montante em Aberto</label>
                <span className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-2">
                    <FeatherIcon name="lock" className="w-3 h-3" /> Input Auditado
                </span>
            </div>
            <div className="bg-white rounded-3xl p-6 flex items-center shadow-2xl shadow-black/40 border-b-4 border-blue-600 transition-all focus-within:scale-[1.02]">
                <span className="text-slate-300 font-black text-3xl italic mr-4 tabular-nums">R$</span>
                <input 
                  type="text" 
                  value={displayValor} 
                  onChange={handleValorInputChange}
                  placeholder="0,00"
                  className="w-full bg-transparent border-none text-5xl font-black text-slate-900 outline-none tabular-nums placeholder:text-slate-100"
                />
            </div>
          </div>

          {/* CAMPO: PRAZO EXECUTIVO */}
          <div className="space-y-8 px-2">
            <div className="flex justify-between items-center">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Prazo de Renegociação</label>
                <div className={`px-6 py-2 rounded-2xl text-xl font-black italic tabular-nums shadow-lg transition-colors ${calculos.isAVista ? 'bg-blue-600 text-white' : 'bg-slate-800 text-blue-400'}`}>
                    {parcelas === 1 ? 'QUITAÇÃO À VISTA' : `${parcelas} PARCELAS`}
                </div>
            </div>
            <div className="pt-2">
                <Slider 
                  min={1} 
                  max={MAX_PARCELAS} 
                  step={1} 
                  value={[parcelas]} 
                  onValueChange={(v) => { setParcelas(v[0]); setEntradaManual(null); setDisplayEntrada(''); }} 
                />
            </div>
            <div className="flex justify-between text-[10px] font-black text-slate-600 uppercase tracking-widest">
              <span className={parcelas === 1 ? "text-blue-500" : ""}>À VISTA</span>
              <div className="flex gap-10">
                  <span className={parcelas === 12 ? "text-blue-500" : ""}>12X</span>
                  <span className={parcelas === 24 ? "text-blue-500" : ""}>24X</span>
                  <span className={parcelas === 36 ? "text-blue-500" : ""}>36X</span>
              </div>
              <span className={parcelas === 48 ? "text-blue-500" : "text-slate-700"}>48X MAX</span>
            </div>
          </div>

          {/* ENTRADA DINÂMICA (APENAS PARCELADO) */}
          <AnimatePresence>
            {!calculos.isAVista && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 p-8 bg-white/5 rounded-[2.5rem] border border-white/5"
              >
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Aporte de Entrada (Sugerido: {formatCurrency(calculos.entrada)})</label>
                <div className="bg-white/10 rounded-2xl p-4 flex items-center border border-white/5 focus-within:border-blue-500/50 transition-colors">
                  <span className="text-slate-600 font-black text-2xl italic mr-4 tabular-nums">R$</span>
                  <input 
                    type="text" 
                    value={displayEntrada || formatToBRLInput(calculos.entrada)} 
                    onChange={handleEntradaInputChange}
                    placeholder="0,00"
                    className="w-full bg-transparent border-none text-2xl font-black text-white outline-none tabular-nums"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STATUS DE COMPLIANCE / GOVERNANÇA */}
          <div className={`p-8 rounded-[2.5rem] border-2 border-dashed flex gap-6 items-center transition-all duration-500 ${
            calculos.guard.type === 'danger' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 
            calculos.guard.type === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 
            'bg-blue-500/10 border-blue-500/30 text-blue-400'
          }`}>
             <div className={`p-3 rounded-2xl ${
                 calculos.guard.type === 'danger' ? 'bg-red-500/20' : 
                 calculos.guard.type === 'warning' ? 'bg-amber-500/20' : 
                 'bg-blue-500/20'
             }`}>
                <FeatherIcon name={isBlocked ? "lock" : "shield"} className="w-6 h-6 flex-shrink-0" />
             </div>
             <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Compliance Check</p>
                <p className="text-xs font-bold leading-relaxed">{calculos.guard.msg}</p>
             </div>
          </div>
        </div>
      </motion.div>

      {/* PAINEL DE RESULTADOS (BI BOARD) */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }} 
        animate={{ opacity: 1, x: 0 }} 
        className="flex flex-col gap-8"
      >
        <div className={`flex-1 rounded-[4rem] p-12 text-white shadow-3xl flex flex-col justify-between relative overflow-hidden transition-all duration-700 ${
          isBlocked ? 'bg-slate-950 grayscale' : calculos.isAVista ? 'bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900' : 'bg-slate-800'
        }`}>
          
          {/* Background Decor */}
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transition-transform duration-[3s] group-hover:scale-110">
            <FeatherIcon name={calculos.isAVista ? "zap" : "trending-up"} className="w-80 h-80" />
          </div>

          <div className="relative z-10 space-y-10">
            <div className="flex items-center justify-between">
                <span className="px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] bg-white/10 border border-white/10 backdrop-blur-md">
                    {isBlocked ? 'BLOQUEIO DE POLÍTICA' : calculos.tipo}
                </span>
                <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.4em]">Protocolo Auditado</span>
            </div>
            
            <div className="space-y-4">
              <span className="text-[11px] font-black uppercase opacity-50 tracking-[0.4em] block ml-1">Montante para Quitação</span>
              <h2 className="text-8xl font-black italic tracking-tighter leading-none tabular-nums flex items-baseline gap-2">
                <span className="text-4xl not-italic opacity-40">R$</span>
                {calculos.valorFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              {calculos.economia > 0 && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-4 bg-emerald-500/20 px-8 py-4 rounded-[2rem] border border-emerald-500/30 mt-6 backdrop-blur-xl"
                >
                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
                    <p className="text-sm font-black uppercase tracking-tight">Economia Gerada: <span className="text-emerald-300 ml-2">{formatCurrency(calculos.economia)}</span></p>
                </motion.div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12 relative z-10">
            <div className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] flex flex-col justify-between h-40 hover:bg-white/10 transition-colors group">
               <span className="text-[10px] font-black uppercase opacity-40 tracking-widest group-hover:opacity-60 transition-opacity">
                  {calculos.isAVista ? 'Liquidação Única' : 'Aporte Inicial'}
               </span>
               <span className="text-4xl font-black italic tabular-nums">{formatCurrency(calculos.entrada)}</span>
            </div>
            
            {!calculos.isAVista && (
              <div className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] flex flex-col justify-between h-40 hover:bg-white/10 transition-colors group">
                 <span className="text-[10px] font-black uppercase opacity-40 tracking-widest group-hover:opacity-60 transition-opacity">
                    {parcelas - 1} Mensalidades de
                 </span>
                 <span className="text-4xl font-black italic tabular-nums">{formatCurrency(calculos.parcela)}</span>
              </div>
            )}
          </div>

          <button 
            disabled={isBlocked}
            className={`w-full mt-10 py-8 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-[12px] transition-all flex items-center justify-center gap-6 ${
              isBlocked 
                ? 'bg-slate-900 text-slate-700 cursor-not-allowed border border-white/5' 
                : 'bg-white text-blue-900 hover:scale-[1.02] shadow-3xl shadow-black/50 active:scale-95'
            }`}
          >
            <FeatherIcon name={isBlocked ? "lock" : "check-circle"} className="h-6 w-6" />
            {isBlocked ? 'REPROVADO POR ALÇADA' : 'CONSOLIDAR ACORDO MASTER'}
          </button>
        </div>

        {/* DIRETRIZES DE GOVERNANÇA */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 flex items-start gap-8 shadow-sm">
           <div className="p-5 bg-blue-50 dark:bg-blue-900/30 rounded-3xl text-blue-600 shadow-inner">
             <FeatherIcon name="info" className="w-8 h-8" />
           </div>
           <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white italic">Protocolo de Recuperação Sicoob</h4>
              <div className="space-y-2 text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                <p>• Liquidação Total: Isenção de 100% dos encargos e 15% de deságio no principal.</p>
                <p>• Fluxo Parcelado: Entrada mínima de 10% do saldo atualizado.</p>
                <p>• Alçada Superior: Renegociações acima de 48 meses exigem comitê de crédito.</p>
              </div>
           </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CalculadoraRenegociacaoView;
