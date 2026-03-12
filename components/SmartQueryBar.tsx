
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Type } from "@google/genai";
import FeatherIcon from './FeatherIcon';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/formatter';

interface ChartDataItem {
  label: string;
  value: number;
}

interface AIResponse {
  answer: string;
  chartData?: ChartDataItem[];
}

const SmartQueryBar: React.FC = () => {
  const { allContracts } = useApp();
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);

  const handleSmartSearch = async () => {
    if (!query.trim() || isAnalyzing) return;
    
    setIsAnalyzing(true);
    setResponse(null);

    // Resumo dos dados para o contexto da IA (truncado para eficiência)
    const contextData = allContracts.slice(0, 50).map(c => ({
      c: c.clientName,
      v: c.saldoDevedor,
      d: c.daysOverdue,
      p: c.pa,
      m: c.gerente,
      prod: c.product
    }));

    const prompt = `
      Você é o "Cérebro" do BI de Recuperação de Crédito Sicoob. Analise os dados da cooperativa e responda à pergunta do usuário.
      Seja sênior, direto e use o tom cooperativista.
      
      Dados (Amostra):
      ${JSON.stringify(contextData)}

      Pergunta do Usuário: "${query}"

      Retorne APENAS um JSON com o seguinte formato:
      {
        "answer": "Sua resposta textual aqui",
        "chartData": [ {"label": "Nome", "value": 123}, ... ] (Opcional: use se a pergunta envolver comparações ou rankings)
      }
      
      Regras:
      - Responda em português.
      - Se a pergunta for sobre tendências, faça uma análise baseada nos dados.
      - Se for sobre "quem" ou "onde", identifique os gerentes ou PAs mais expostos.
    `;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const genResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              answer: { type: Type.STRING },
              chartData: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    value: { type: Type.NUMBER }
                  },
                  required: ["label", "value"]
                }
              }
            },
            required: ["answer"]
          }
        },
      });

      const data = JSON.parse(genResponse.text || '{}') as AIResponse;
      setResponse(data);
    } catch (e) {
      console.error("Erro na busca inteligente:", e);
      setResponse({ answer: "Desculpe, ocorreu um erro ao processar sua consulta inteligente. Tente perguntar de outra forma." });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto mb-12">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
        <div className="relative flex items-center bg-[#1a1f2e] border-2 border-[#2e3347] rounded-[2.5rem] p-2.5 shadow-2xl transition-all group-focus-within:ring-2 ring-emerald-500/30">
          <div className="pl-6 pr-4">
            <FeatherIcon name="sparkles" className="text-emerald-500 animate-pulse" />
          </div>
          <input 
            type="text"
            placeholder="Pergunte à IA: 'Qual gerente possui maior inadimplência?' ou 'Como está a PA Rural?'"
            className="w-full bg-transparent border-none focus:ring-0 text-sm font-black py-4 text-[#f0f4ff] placeholder:text-[#718096] placeholder:font-medium"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSmartSearch()}
          />
          <button 
            onClick={handleSmartSearch}
            disabled={isAnalyzing || !query.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white p-5 rounded-full transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-900/40"
          >
            {isAnalyzing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <FeatherIcon name="send" className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {response && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mt-6 p-10 bg-[#1a1f2e]/95 backdrop-blur-2xl rounded-[3.5rem] border border-[#2e3347] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none rotate-12">
               <FeatherIcon name="cpu" className="w-64 h-64" />
            </div>

            <div className="flex items-start gap-6 mb-10 relative z-10">
              <div className="p-4 bg-blue-600/10 rounded-2xl text-blue-500 border border-blue-600/20">
                <FeatherIcon name="message-square" className="w-6 h-6" />
              </div>
              <p className="text-base font-bold text-[#cbd5e0] leading-relaxed italic">
                {response.answer}
              </p>
            </div>

            {response.chartData && response.chartData.length > 0 && (
              <div className="h-[280px] w-full bg-[#242938]/50 rounded-[2.5rem] p-8 border border-dashed border-[#2e3347] relative z-10">
                <div className="flex items-end gap-6 h-full justify-around">
                  {response.chartData.map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-3 w-full max-w-[80px] group/bar">
                      <span className="text-[10px] font-black text-blue-500 tabular-nums opacity-0 group-hover/bar:opacity-100 transition-opacity">
                        {item.value > 1000 ? formatCurrency(item.value) : item.value}
                      </span>
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.min(100, (item.value / Math.max(...response.chartData!.map(d => d.value))) * 100)}%` }}
                        className="w-full bg-gradient-to-t from-blue-600 to-indigo-400 rounded-2xl shadow-lg shadow-blue-500/20 group-hover/bar:brightness-110 transition-all"
                      />
                      <span className="text-[9px] font-black uppercase text-[#a0aec0] text-center truncate w-full tracking-tighter" title={item.label}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartQueryBar;
