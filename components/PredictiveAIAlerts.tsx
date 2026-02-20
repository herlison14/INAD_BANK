
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Type } from "@google/genai";
import { Contract } from '../types';
import FeatherIcon from './FeatherIcon';
import { formatCurrency } from '../utils/formatter';

interface PredictiveAIAlertsProps {
  contracts: Contract[];
  onNavigateToDetails: (id: string) => void;
}

interface AIInsight {
  id: string;
  client: string;
  riskLevel: 'CRÍTICO' | 'ALTO' | 'MÉDIO';
  action: string;
  reason: string;
}

const PredictiveAIAlerts: React.FC<PredictiveAIAlertsProps> = ({ contracts, onNavigateToDetails }) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeWithGemini = async () => {
    if (contracts.length === 0) {
      setInsights([]);
      return;
    }
    
    setLoading(true);
    setError(null);

    const contractsData = contracts
      .sort((a, b) => b.saldoDevedor - a.saldoDevedor)
      .slice(0, 10)
      .map(c => ({
        id: c.id,
        name: c.clientName,
        debt: c.saldoDevedor,
        days: c.daysOverdue,
        product: c.product
      }));

    const prompt = `
      Atue como um analista sênior de risco de crédito do Sicoob. Analise os 10 contratos de maior exposição abaixo e identifique os 3 casos mais críticos que exigem intervenção imediata.
      Considere o saldo devedor e os dias em atraso para priorizar.

      Contratos:
      ${JSON.stringify(contractsData)}

      Retorne APENAS um array JSON de objetos, cada um com:
      "id" (ID do contrato), "client" (Nome do cliente), "riskLevel" (CRÍTICO, ALTO ou MÉDIO), "action" (Ação baseada em princípios cooperativos), "reason" (Justificativa técnica curta).
    `;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                client: { type: Type.STRING },
                riskLevel: { type: Type.STRING, enum: ["CRÍTICO", "ALTO", "MÉDIO"] },
                action: { type: Type.STRING },
                reason: { type: Type.STRING },
              },
              required: ["id", "client", "riskLevel", "action", "reason"],
            },
          },
        },
      });

      const data = JSON.parse(response.text || '[]');
      setInsights(data);
    } catch (e) {
      console.error("Erro na análise preditiva:", e);
      setError("Falha ao processar predições de IA.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    analyzeWithGemini();
  }, [contracts.length]);

  return (
    <div className="mb-12 bg-gradient-to-br from-slate-900 via-slate-850 to-black p-[1px] rounded-[3.5rem] overflow-hidden shadow-2xl">
      <div className="bg-slate-900/95 backdrop-blur-3xl p-10 rounded-[3.5rem]">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-blue-500/15 rounded-3xl border border-blue-500/20">
              <FeatherIcon name="activity" className="text-blue-400 animate-pulse w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic leading-none">Monitor Preditivo Gemini AI</h2>
              <p className="text-[10px] text-blue-500 font-black uppercase tracking-[0.3em] mt-2">Insights de Risco em Tempo Real</p>
            </div>
          </div>
          <button 
            onClick={analyzeWithGemini}
            disabled={loading || contracts.length === 0}
            className="flex items-center gap-3 px-8 py-3.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/30 transition-all text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
          >
            <FeatherIcon name="refresh-cw" className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Processando Dados...' : 'Recalcular Predições'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <AnimatePresence mode="wait">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-white/5 animate-pulse rounded-[2.5rem] border border-white/5" />
              ))
            ) : error ? (
              <div className="col-span-full py-12 text-center text-slate-500 font-bold uppercase text-xs tracking-widest bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
                {error}
              </div>
            ) : insights.length > 0 ? (
              insights.map((alert, idx) => (
                <motion.div 
                  key={alert.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => onNavigateToDetails(alert.id)}
                  className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-white/10 transition-all group cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                    <FeatherIcon name="zap" className="w-24 h-24" />
                  </div>
                  
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <span className={`px-4 py-1 rounded-full text-[9px] font-black tracking-widest ${
                      alert.riskLevel === 'CRÍTICO' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      RISCO {alert.riskLevel}
                    </span>
                    <FeatherIcon name="alert-circle" className="text-white/20 group-hover:text-blue-400 transition-colors" />
                  </div>
                  
                  <h4 className="font-black text-white text-lg mb-2 truncate italic">{alert.client}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-6 h-12 overflow-hidden line-clamp-3 font-medium uppercase tracking-tight">
                    {alert.reason}
                  </p>
                  
                  <div className="pt-6 border-t border-white/10 flex flex-col gap-2 relative z-10">
                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Ação Sugerida:</span>
                    <span className="text-[11px] font-black text-white leading-tight uppercase italic">{alert.action}</span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-slate-500 font-bold uppercase text-xs tracking-widest border border-dashed border-white/5 rounded-[2.5rem]">
                Nenhum dado preditivo disponível.
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PredictiveAIAlerts;
