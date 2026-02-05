
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FeatherIcon from './FeatherIcon';
import { formatCurrency } from '../utils/formatter';
import { Input } from './ui/Input';
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

  // Estados para exibição formatada (com ponto e vírgula)
  const [displayValor, setDisplayValor] = useState('');
  const [displayEntrada, setDisplayEntrada] = useState('');

  // --- POLÍTICA SICOOB RECOVERY PRO ---
  const MAX_PARCELAS = 48;
  const DESCONTO_A_VISTA = 15; 
  const TAXA_MULTA = 0.02;
  const TAXA_MORA_MES = 0.01; 
  const TAXA_IOF_FIXO = 0.0038;
  const TAXA_IOF_DIARIO = 0.000082;
  const ENTRADA_MIN_PERCENT = 0.10;

  // Função para formatar número como string BRL para o Input
  const formatToBRLInput = (value: number | null): string => {
    if (value === null) return '';
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Função para converter string do Input em número (centavos)
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
      const valorParcela = parcelas > 0 ? saldoAFinanciar / parcelas : 0;

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-2 max-w-[1400px] mx-auto pb-10">
      
      {/* Coluna de Configuração */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl p-10 rounded-[4rem] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-12"
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
             <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-500/30">
                <FeatherIcon name="calculator" className="text-white" />
             </div>
             <h3 className="text-2xl font-black uppercase tracking-tighter italic text-slate-800 dark:text-white">RECOVERY <span className="text-blue-600">PRO</span></h3>
          </div>
          <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
            <div className={`w-2 h-2 rounded-full ${isBlocked ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">SISTEMA ATIVO</span>
          </div>
        </div>

        <div className="space-y-12">
          {/* Campo Valor Principal */}
          <div className="space-y-4">
            <label className="text-[11px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-[0.2em] ml-2">
              Capital Original em Atraso
            </label>
            <div className="relative group">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400 text-2xl tabular-nums italic">R$</span>
              <Input 
                type="text" 
                value={displayValor} 
                onChange={handleValorInputChange}
                placeholder="0,00"
                className="pl-20 py-8 text-4xl font-black tabular-nums border-none bg-slate-50 dark:bg-slate-950 ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-4 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Seletor de Prazo */}
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Prazo do Acordo</label>
              <div className={`px-6 py-2 rounded-2xl text-2xl font-black italic tracking-tighter tabular-nums ${calculos.isAVista ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20' : 'bg-blue-600 text-white shadow-xl shadow-blue-500/20'}`}>
                {parcelas === 1 ? 'LIQUIDAÇÃO' : `${parcelas} Meses`}
              </div>
            </div>
            <Slider 
              min={1} 
              max={MAX_PARCELAS} 
              step={1} 
              value={[parcelas]} 
              onValueChange={(v) => { setParcelas(v[0]); setEntradaManual(null); setDisplayEntrada(''); }} 
            />
            <div className="flex justify-between text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest px-2">
              <span>À VISTA (1X)</span>
              <span>12X</span>
              <span>24X</span>
              <span>36X</span>
              <span className="text-blue-600 dark:text-blue-400 underline decoration-2 underline-offset-4">48X LIMITE</span>
            </div>
          </div>

          {/* Campo de Entrada Dinâmica */}
          {!calculos.isAVista && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 bg-slate-50 dark:bg-slate-950 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Entrada Proposta (Mín. 10%)</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400 text-xl tabular-nums italic">R$</span>
                <Input 
                  type="text" 
                  value={displayEntrada || formatToBRLInput(calculos.entrada)} 
                  onChange={handleEntradaInputChange}
                  placeholder="0,00"
                  className="pl-16 py-6 text-2xl font-black tabular-nums border-none bg-white dark:bg-slate-900"
                />
              </div>
            </motion.div>
          )}

          {/* Feedback de Compliance */}
          <div className={`p-8 rounded-[3rem] border-2 border-dashed transition-all duration-500 flex gap-6 items-center ${
            calculos.guard.type === 'danger' ? 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400' : 
            calculos.guard.type === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400' : 
            'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
          }`}>
             <div className="bg-white/20 p-4 rounded-2xl">
                <FeatherIcon name={isBlocked ? "lock" : "shield"} className="w-8 h-8" />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Validação de Governança</p>
                <p className="text-xs font-bold leading-relaxed">{calculos.guard.msg}</p>
             </div>
          </div>
        </div>
      </motion.div>

      {/* Coluna de Resultados (The BI Board) */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-10">
        <div className={`rounded-[4rem] p-12 text-white shadow-[0_60px_100px_-20px_rgba(0,0,0,0.6)] flex flex-col justify-between relative overflow-hidden group flex-1 transition-all duration-1000 ${
          isBlocked ? 'bg-slate-950' : 
          calculos.isAVista ? 'bg-emerald-600' : 
          'bg-slate-900'
        }`}>
          
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none group-hover:scale-125 transition-transform duration-[2s] rotate-12">
            <FeatherIcon name={isBlocked ? "lock" : calculos.isAVista ? "zap" : "trending-up"} className="w-[30rem] h-[30rem]" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-12">
               <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-white/20 ${isBlocked ? 'bg-red-600' : 'bg-white/20'}`}>
                {isBlocked ? 'CONTRATO BLOQUEADO' : calculos.tipo}
              </span>
            </div>
            
            <div className="space-y-6">
              <span className="text-[12px] font-black uppercase opacity-60 tracking-[0.5em] block ml-1">Valor Total para Quitação</span>
              <h2 className="text-8xl font-black italic tracking-tighter leading-none animate-fade-in-up tabular-nums">
                {formatCurrency(calculos.valorFinal)}
              </h2>
              <AnimatePresence>
                {calculos.economia > 0 && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-4 bg-white/20 backdrop-blur-3xl w-fit px-8 py-4 rounded-3xl border border-white/20 mt-8"
                  >
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                    <p className="text-lg font-black uppercase tracking-tight italic">
                      Economia Real: <span className="text-yellow-400">{formatCurrency(calculos.economia)}</span>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 mt-16 relative z-10">
            <div className={`backdrop-blur-3xl p-8 rounded-[3rem] border border-white/10 shadow-2xl transition-all ${isBlocked ? 'bg-red-500/10' : 'bg-white/10 hover:bg-white/15'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <span className="block text-[10px] font-black uppercase opacity-50 mb-3 tracking-widest">
                    {calculos.isAVista ? 'Desembolso Único' : 'Entrada Inicial'}
                  </span>
                  <span className="text-4xl font-black italic tabular-nums">{formatCurrency(calculos.entrada)}</span>
                </div>
                <FeatherIcon name="check-circle" className="text-white/40 h-10 w-10" />
              </div>
            </div>
            
            {!calculos.isAVista && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`backdrop-blur-3xl p-8 rounded-[3rem] border border-white/10 shadow-2xl transition-all ${isBlocked ? 'bg-red-950 border-red-500/50' : 'bg-white/10 hover:bg-white/15'}`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="block text-[10px] font-black uppercase opacity-50 mb-3 tracking-widest">Fluxo de {parcelas} Parcelas</span>
                    <span className={`text-4xl font-black italic tabular-nums transition-colors ${isBlocked ? 'text-red-500' : 'text-white'}`}>
                      {formatCurrency(calculos.parcela)}
                    </span>
                  </div>
                  <FeatherIcon name={isBlocked ? "trash-2" : "calendar"} className={`h-10 w-10 transition-colors ${isBlocked ? 'text-red-500' : 'text-white/40'}`} />
                </div>
              </motion.div>
            )}
          </div>

          <button 
            disabled={isBlocked}
            className={`w-full mt-12 py-8 rounded-[3rem] font-black uppercase tracking-[0.4em] text-[13px] shadow-2xl transition-all flex items-center justify-center gap-6 group/btn ${
              isBlocked 
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                : calculos.isAVista 
                  ? 'bg-white text-emerald-800 hover:scale-[1.03] active:scale-95' 
                  : 'bg-blue-600 text-white hover:scale-[1.03] active:scale-95 shadow-blue-500/40'
            }`}
          >
            <FeatherIcon name={isBlocked ? "lock" : "zap"} className="h-6 w-6 transition-transform group-hover/btn:scale-125" />
            {isBlocked ? 'ACORDO NEGADO PELA GOVERNANÇA' : `CONFIRMAR ${calculos.isAVista ? 'LIQUIDAÇÃO' : 'PARCELAMENTO'}`}
          </button>
        </div>

        {/* Executive Context */}
        <div className="bg-slate-100 dark:bg-slate-900/50 p-10 rounded-[4rem] border border-slate-200 dark:border-slate-800 flex items-start gap-8">
           <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl text-slate-400 shadow-xl">
             <FeatherIcon name="info" className="w-8 h-8 text-blue-500" />
           </div>
           <div>
              <h4 className="text-sm font-black uppercase tracking-widest mb-4 italic text-slate-800 dark:text-white">Diretrizes de Recuperação</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-bold uppercase tracking-tight space-y-2">
                • Liquidação à vista: Isenção de mora e multa com 15% de deságio.<br/>
                • Parcelas mínimas: Fixadas em R$ 150,00 para garantir a viabilidade da operação.<br/>
                • PDD: Contratos acima de 36 meses reduzem a provisão em 10% na primeira parcela paga.
              </p>
           </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CalculadoraRenegociacaoView;
