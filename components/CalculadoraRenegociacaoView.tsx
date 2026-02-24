import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import FeatherIcon from './FeatherIcon';

const CalculadoraRenegociacaoView: React.FC<{ initialValue?: number; isDarkMode?: boolean }> = ({ initialValue = 0 }) => {
  // Estados de Entrada
  const [valorPrincipal, setValorPrincipal] = useState<number>(initialValue);
  const [diasAtraso, setDiasAtraso] = useState<number>(0);
  const [taxaJurosMensal, setTaxaJurosMensal] = useState<number>(1.99);
  const [percentualMulta, setPercentualMulta] = useState<number>(2.0);
  const [percentualMora, setPercentualMora] = useState<number>(1.0);
  const [taxaTEC, setTaxaTEC] = useState<number>(25.00);
  const [numParcelas, setNumParcelas] = useState<number>(12);
  const [descontoAVista, setDescontoAVista] = useState<number>(0);
  const [valorEntradaManual, setValorEntradaManual] = useState<number>(0);

  // 🧠 Lógica de Negócio: Percentual de Entrada por Faixa de Atraso
  const regrasEntrada = useMemo(() => {
    if (diasAtraso <= 90) return { pct: 10, label: 'Até 90 dias (10%)' };
    if (diasAtraso <= 360) return { pct: 15, label: 'Até 360 dias (15%)' };
    return { pct: 20, label: 'Superior a 360 dias (20%)' };
  }, [diasAtraso]);

  // Cálculos Financeiros
  const calculos = useMemo(() => {
    const multa = valorPrincipal * (percentualMulta / 100);
    const jurosDiarios = (taxaJurosMensal / 30) / 100;
    const jurosAcumulados = valorPrincipal * jurosDiarios * diasAtraso;
    const moraAcumulada = valorPrincipal * ((percentualMora / 30) / 100) * diasAtraso;
    
    const valorAtualizado = valorPrincipal + multa + jurosAcumulados + moraAcumulada;
    const valorComDesconto = valorAtualizado * (1 - (descontoAVista / 100));
    const valorBaseAcordo = valorComDesconto + taxaTEC;
    
    // Cálculo de Entrada Mínima Obrigatória
    const entradaMinima = valorBaseAcordo * (regrasEntrada.pct / 100);
    const entradaEfetiva = Math.max(valorEntradaManual, entradaMinima);
    
    const saldoParaParcelar = valorBaseAcordo - entradaEfetiva;

    // Cálculo de Parcela (Tabela Price)
    const i = (taxaJurosMensal / 100);
    const valorParcela = numParcelas > 0 && i > 0
      ? (saldoParaParcelar * i) / (1 - Math.pow(1 + i, -numParcelas))
      : saldoParaParcelar / (numParcelas || 1);

    return {
      totalDivida: valorAtualizado,
      totalAcordo: valorBaseAcordo,
      entradaMinima,
      entradaEfetiva,
      saldoParaParcelar,
      parcela: valorParcela,
      economia: valorAtualizado - valorBaseAcordo,
      isEntradaValida: (valorEntradaManual || entradaEfetiva) >= entradaMinima
    };
  }, [valorPrincipal, diasAtraso, taxaJurosMensal, percentualMulta, percentualMora, taxaTEC, numParcelas, descontoAVista, valorEntradaManual, regrasEntrada]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
            <span className="p-2 bg-emerald-500 rounded-xl text-white shadow-lg"><FeatherIcon name="calculator" /></span>
            Calculadora de Acordos
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Simulação com política de entrada progressiva e encargos contratuais.</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-2xl border border-blue-100 dark:border-blue-800">
           <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest block">Política de Entrada</span>
           <span className="text-sm font-bold text-blue-800 dark:text-white">{regrasEntrada.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* INPUTS */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase">Valor Principal</label>
                <input type="number" value={valorPrincipal} onChange={(e) => setValorPrincipal(Number(e.target.value))}
                  className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl text-xl font-black text-slate-800 dark:text-white outline-none ring-2 ring-transparent focus:ring-blue-500 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase">Dias de Atraso</label>
                <input type="number" value={diasAtraso} onChange={(e) => setDiasAtraso(Number(e.target.value))}
                  className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl text-xl font-black text-slate-800 dark:text-white outline-none ring-2 ring-transparent focus:ring-blue-500 transition-all" />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase block">Valor de Entrada (R$)</label>
              <div className="relative">
                 <input type="number" 
                   value={valorEntradaManual || ''} 
                   placeholder={`Mínimo sugerido: R$ ${calculos.entradaMinima.toFixed(2)}`}
                   onChange={(e) => setValorEntradaManual(Number(e.target.value))}
                   className={`w-full px-4 py-4 pr-32 bg-slate-50 dark:bg-slate-900 rounded-2xl text-lg font-black outline-none ring-2 transition-all ${valorEntradaManual > 0 && valorEntradaManual < calculos.entradaMinima ? 'ring-orange-500/50' : 'ring-transparent focus:ring-emerald-500'}`} />
                 <div className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-white dark:bg-slate-800 rounded-lg text-[10px] font-black shadow-sm">
                    MIN: {regrasEntrada.pct}%
                 </div>
              </div>
              {valorEntradaManual > 0 && valorEntradaManual < calculos.entradaMinima && (
                <p className="text-orange-500 text-[10px] font-bold uppercase italic">A entrada informada é menor que a política permitida para este atraso.</p>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {[{l: 'Juros %', v: taxaJurosMensal, s: setTaxaJurosMensal}, {l: 'Multa %', v: percentualMulta, s: setPercentualMulta}, {l: 'Mora %', v: percentualMora, s: setPercentualMora}, {l: 'TEC R$', v: taxaTEC, s: setTaxaTEC}].map(i => (
                <div key={i.l}>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">{i.l}</label>
                  <input type="number" value={i.v} onChange={(e) => i.s(Number(e.target.value))} className="w-full p-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-sm font-bold text-slate-800 dark:text-white" />
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-4">
               <div className="flex justify-between text-xs font-black text-slate-400 uppercase">
                  <span>Prazo: {numParcelas}x</span>
                  <span>Desconto: {descontoAVista}%</span>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input type="range" min="1" max="72" value={numParcelas} onChange={(e) => setNumParcelas(Number(e.target.value))}
                    className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                  <input type="range" min="0" max="95" value={descontoAVista} onChange={(e) => setDescontoAVista(Number(e.target.value))}
                    className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
               </div>
            </div>
          </div>
        </div>

        {/* RESULTADOS */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl border border-white/5 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-6">Proposta de Acordo</h3>
              
              <div className="space-y-4 border-b border-white/10 pb-6 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="opacity-50">Total Atualizado</span>
                  <span className="font-mono">R$ {calculos.totalDivida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm text-emerald-400 font-bold">
                  <span>Desconto aplicado</span>
                  <span>- R$ {calculos.economia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black uppercase opacity-50 mb-1">Entrada Necessária</p>
                  <p className="text-3xl font-black text-emerald-400">R$ {calculos.entradaEfetiva.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase opacity-50 mb-1">Saldo em {numParcelas}x</p>
                  <p className="text-2xl font-black">R$ {calculos.parcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} /mês</p>
                </div>
              </div>

              <button className={`w-full mt-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${calculos.isEntradaValida ? 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30' : 'bg-slate-700 cursor-not-allowed opacity-50'}`}>
                {calculos.isEntradaValida ? 'Gerar Minuta de Acordo' : 'Entrada Insuficiente'}
              </button>
            </div>
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculadoraRenegociacaoView;
