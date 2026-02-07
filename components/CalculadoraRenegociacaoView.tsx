
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
    if (initialValue !== undefined) {
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
        tipo: 'PARCELAMENTO LONGO',
        valorFinal: valorComEncargos,
        entrada: entradaEfetiva,
        parcela: valorParcela,
        economia: 0,
        isAVista: false,
        guard
      };
    }
  }, [valorManual, parcelas, entradaManual]);

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-2 max-w-[1400px] mx-auto pb-10">
      
      {/* PAINEL DE COMANDO (TERMINAL STYLE) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 rounded-[3rem] p-10 shadow-2xl border border-white/5 space-y-10 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full -mr-20 -mt-20"></div>
        
        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 italic">
                <span className="text-white font-black text-xl">C</span>
             </div>
             <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tighter italic leading-none">TERMINAL <span className="text-indigo-400">BI</span></h3>
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.3em]">PROCESSO DE SIMULAÇÃO v4.2</p>
             </div>
          </div>
          <div className="flex gap-1.5">
             <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
             <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
             <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
          </div>
        </div>

        <div className="space-y-10 relative z-10">
          {/* CAPITAL ORIGINAL */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.2em]">Capital de Origem</label>
                <span className="text-[9px] font-bold text-slate-500 uppercase">Input Manual Autorizado</span>
            </div>
            <div className="bg-white rounded-2xl p-4 flex items-center shadow-2xl shadow-black/40 border border-white/10 transition-transform focus-within:scale-[1.01]">
                <span className="text-slate-400 font-black text-3xl italic mr-4 tabular-nums">R$</span>
                <input 
                  type="text" 
                  value={displayValor} 
                  onChange={handleValorInputChange}
                  placeholder="0,00"
                  className="w-full bg-transparent border-none text-4xl font-black text-slate-900 outline-none tabular-nums placeholder:text-slate-200"
                />
            </div>
          </div>

          {/* PRAZO EXECUTIVO */}
          <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Prazo Estratégico</label>
                <div className={`px-4 py-1.5 rounded-xl text-lg font-black italic tabular-nums shadow-lg ${calculos.isAVista ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-indigo-300'}`}>
                    {parcelas === 1 ? 'LIQUIDAÇÃO' : `${parcelas} PARCELAS`}
                </div>
            </div>
            <div className="px-4">
                <Slider 
                  min={1} 
                  max={MAX_PARCELAS} 
                  step={1} 
                  value={[parcelas]} 
                  onValueChange={(v) => { setParcelas(v[0]); setEntradaManual(null); setDisplayEntrada(''); }} 
                />
            </div>
            <div className="flex justify-between text-[9px] font-black text-slate-600 uppercase tracking-widest px-4">
              <span>À VISTA</span>
              <div className="flex gap-8">
                  <span>12X</span>
                  <span>24X</span>
                  <span>36X</span>
              </div>
              <span className="text-indigo-400">48X MAX</span>
            </div>
          </div>

          {/* ENTRADA DINÂMICA */}
          {!calculos.isAVista && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 p-6 bg-white/5 rounded-[2rem] border border-white/5">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Proposta de Entrada (Sugerido: {formatCurrency(calculos.entrada)})</label>
              <div className="bg-white/10 rounded-xl p-3 flex items-center border border-white/5">
                <span className="text-slate-500 font-bold text-lg italic mr-4 tabular-nums">R$</span>
                <input 
                  type="text" 
                  value={displayEntrada || formatToBRLInput(calculos.entrada)} 
                  onChange={handleEntradaInputChange}
                  placeholder="0,00"
                  className="w-full bg-transparent border-none text-xl font-black text-white outline-none tabular-nums"
                />
              </div>
            </motion.div>
          )}

          {/* MENSAGEM DE GOVERNANÇA */}
          <div className={`p-6 rounded-[2rem] border-2 border-dashed flex gap-5 items-center transition-colors duration-500 ${
            calculos.guard.type === 'danger' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 
            calculos.guard.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 
            'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
          }`}>
             <FeatherIcon name={isBlocked ? "lock" : "shield"} className="w-6 h-6 flex-shrink-0" />
             <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-[0.1em] opacity-60">Status de Compliance</p>
                <p className="text-[11px] font-bold leading-tight">{calculos.guard.msg}</p>
             </div>
          </div>
        </div>
      </motion.div>

      {/* PAINEL DE RESULTADOS (BI BOARD) */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-8 h-full">
        <div className={`flex-1 rounded-[3.5rem] p-12 text-white shadow-2xl flex flex-col justify-between relative overflow-hidden transition-all duration-700 ${
          isBlocked ? 'bg-slate-950' : calculos.isAVista ? 'bg-gradient-to-br from-indigo-700 to-indigo-900' : 'bg-slate-800'
        }`}>
          
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-[2s]">
            <FeatherIcon name={calculos.isAVista ? "zap" : "trending-up"} className="w-64 h-64" />
          </div>

          <div className="relative z-10 space-y-12">
            <div className="flex items-center justify-between">
                <span className="px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] bg-white/10 border border-white/10">
                    {isBlocked ? 'BLOQUEIO DE MESA' : calculos.tipo}
                </span>
                <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Protocolo Auditado</span>
            </div>
            
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase opacity-40 tracking-[0.4em] block">Montante para Quitação</span>
              <h2 className="text-7xl font-black italic tracking-tighter leading-none tabular-nums">
                {formatCurrency(calculos.valorFinal)}
              </h2>
              {calculos.economia > 0 && (
                <div className="inline-flex items-center gap-3 bg-white/10 px-6 py-3 rounded-2xl border border-white/10 mt-4 backdrop-blur-md">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-ping" />
                    <p className="text-sm font-black uppercase tracking-tight">Economia: <span className="text-indigo-300">{formatCurrency(calculos.economia)}</span></p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-10 relative z-10">
            <div className="bg-white/5 border border-white/5 p-6 rounded-3xl flex flex-col justify-between h-32 hover:bg-white/10 transition-colors">
               <span className="text-[9px] font-black uppercase opacity-40 tracking-widest">{calculos.isAVista ? 'Parcela Única' : 'Aporte de Entrada'}</span>
               <span className="text-3xl font-black italic tabular-nums">{formatCurrency(calculos.entrada)}</span>
            </div>
            
            {!calculos.isAVista && (
              <div className="bg-white/5 border border-white/5 p-6 rounded-3xl flex flex-col justify-between h-32 hover:bg-white/10 transition-colors">
                 <span className="text-[9px] font-black uppercase opacity-40 tracking-widest">{parcelas - 1} Mensalidades de</span>
                 <span className="text-3xl font-black italic tabular-nums">{formatCurrency(calculos.parcela)}</span>
              </div>
            )}
          </div>

          <button 
            disabled={isBlocked}
            className={`w-full mt-10 py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] transition-all flex items-center justify-center gap-4 ${
              isBlocked 
                ? 'bg-slate-900 text-slate-700 cursor-not-allowed border border-white/5' 
                : 'bg-white text-indigo-900 hover:scale-[1.02] shadow-2xl shadow-black/40'
            }`}
          >
            <FeatherIcon name={isBlocked ? "lock" : "zap"} className="h-5 w-5" />
            {isBlocked ? 'NEGADO POR POLÍTICA' : 'CONSOLIDAR ACORDO'}
          </button>
        </div>

        {/* DIRETRIZES DE ALÇADA */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 flex items-start gap-6">
           <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600">
             <FeatherIcon name="info" className="w-6 h-6" />
           </div>
           <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800 dark:text-white">Diretrizes de Alçada Sicoob Recovery</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-bold uppercase tracking-tight">
                • Liquidação à vista: Isenção de mora e multa com 15% de deságio.<br/>
                • Parcelas mínimas: Fixadas em R$ 150,00 para viabilidade.<br/>
                • PDD: Contratos acima de 36 meses reduzem a provisão em 10% na quitação.
              </p>
           </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CalculadoraRenegociacaoView;
