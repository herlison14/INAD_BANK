
import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Contract, TaskStatus } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import FeatherIcon from './FeatherIcon';
import { formatCurrency } from '../utils/formatter';
import { useApp } from '../context/AppContext';

interface InsightsIAViewProps {
  contracts: Contract[];
  onNavigateToDetails: (id: string) => void;
}

const InsightsIAView: React.FC<InsightsIAViewProps> = ({ contracts, onNavigateToDetails }) => {
  const { setTasks, setNotifications, aiAnalysis, setAiAnalysis, executarVarreduraCredito } = useApp();
  const [loading, setLoading] = useState(false);
  const [manualScanResult, setManualScanResult] = useState<number | null>(null);

  const topOfensores = useMemo(() => {
    return [...contracts]
      .sort((a, b) => b.saldoDevedor - a.saldoDevedor)
      .slice(0, 10);
  }, [contracts]);

  const diretrizes = [
    { faixa: "0-30 dias", acao: "Régua Preventiva: SMS e Push.", icon: "mail" },
    { faixa: "31-60 dias", acao: "Ação Corretiva: Renegociação via IA.", icon: "cpu" },
    { faixa: "61-90 dias", acao: "Mitigação: Bloqueio de novos créditos.", icon: "slash" },
    { faixa: "90+ dias", acao: "Crítico: Ajuizamento e Alerta Gerencial.", icon: "alert-octagon" },
  ];

  const handleManualScan = () => {
    const count = executarVarreduraCredito();
    setManualScanResult(count);
    setTimeout(() => setManualScanResult(null), 3000);
  };

  const performScan = async () => {
    if (contracts.length === 0) return;
    setLoading(true);

    const dataSample = contracts.slice(0, 50).map(c => ({
      id: c.id,
      clientName: c.clientName,
      saldoDevedor: c.saldoDevedor,
      daysOverdue: c.daysOverdue,
      pa: c.pa,
      managerEmail: c.managerEmail,
      originSheet: c.originSheet
    }));

    const systemInstruction = `
      Você é o motor de Inteligência Artificial do sistema "Sicoob Recovery V6". 
      Sua função é analisar contratos de crédito, identificar riscos e gerar tarefas de cobrança.

      LOGICA DE NEGÓCIO:
      1. Varredura de Crédito: Priorize contratos onde (saldoDevedor * daysOverdue) seja maior.
      2. Criticidade: Se daysOverdue > 60, a prioridade é 1 (Alta). Caso contrário, prioridade 2 (Média).
      3. Tom de Voz: Profissional, bancário e focado em recuperação de ativos.

      OBJETIVO:
      Retorne uma análise detalhada dos TOP 10 riscos e sugira as ações imediatas.
      Gere tarefas (tasks) e notificações (notifications) para os gerentes responsáveis.
    `;

    const prompt = `Analise os seguintes contratos e gere os insights: ${JSON.stringify(dataSample)}`;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              analysis: {
                type: Type.STRING,
                description: "A análise executiva em markdown dos TOP 10 riscos."
              },
              tasks: {
                type: Type.ARRAY,
                description: "Lista de tarefas a serem criadas para os gerentes.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    contractId: { type: Type.STRING },
                    contractClient: { type: Type.STRING },
                    managerEmail: { type: Type.STRING },
                    description: { type: Type.STRING },
                    priority: { type: Type.NUMBER, description: "1 para Alta, 2 para Média" },
                    aiScore: { type: Type.NUMBER, description: "Score de 0 a 100" }
                  },
                  required: ["contractId", "contractClient", "managerEmail", "description", "priority", "aiScore"]
                }
              },
              notifications: {
                type: Type.ARRAY,
                description: "Lista de notificações a serem enviadas.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    managerEmail: { type: Type.STRING },
                    message: { type: Type.STRING },
                    type: { type: Type.STRING, description: "URGENTE, META, ou SISTEMA" }
                  },
                  required: ["managerEmail", "message", "type"]
                }
              }
            },
            required: ["analysis", "tasks", "notifications"]
          }
        }
      });
      
      const result = JSON.parse(response.text || '{}');
      setAiAnalysis(result.analysis || 'Falha na varredura.');
      
      if (result.tasks && Array.isArray(result.tasks)) {
        setTasks(prev => {
          const newTasks = result.tasks.map((t: any) => ({
            id: `task-ia-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            contractId: t.contractId,
            contractClient: t.contractClient,
            managerEmail: t.managerEmail,
            description: t.description,
            status: TaskStatus.Pendente,
            priority: t.priority === 1 ? 1 : 2,
            creationDate: new Date().toLocaleString('pt-BR'),
            aiScore: t.aiScore || 95
          }));
          return [...newTasks, ...prev];
        });
      }

      if (result.notifications && Array.isArray(result.notifications)) {
        setNotifications(prev => {
          const newNotifs = result.notifications.map((n: any) => ({
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            managerEmail: n.managerEmail,
            type: ['URGENTE', 'META', 'SISTEMA'].includes(n.type) ? n.type : 'SISTEMA',
            message: n.message,
            timestamp: new Date().toLocaleString('pt-BR'),
            read: false
          }));
          return [...newNotifs, ...prev];
        });
      }

    } catch (e) {
      console.error(e);
      setAiAnalysis("Erro ao conectar com o Motor de IA.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (!aiAnalysis && contracts.length > 0) {
      performScan(); 
    }
  }, [contracts.length, aiAnalysis]);

  return (
    <div className="space-y-10 animate-fade-in max-w-[1400px] mx-auto pb-20">
      <div className="bg-slate-900 text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <FeatherIcon name="cpu" className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-4">Motor de <span className="text-blue-400">Insights IA</span></h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.4em]">Varredura Tripla: Risco, Volume e Urgência</p>
          <div className="flex flex-wrap gap-4 mt-10">
            <button 
              onClick={performScan} 
              disabled={loading}
              className="px-10 py-4 bg-blue-600 rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Sincronizando Motor...' : 'Rodar Insights IA'}
            </button>
            <button 
              onClick={handleManualScan} 
              className="px-10 py-4 bg-slate-800 border border-white/10 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all relative"
            >
              {manualScanResult !== null ? `Geradas ${manualScanResult} Tarefas!` : 'Varredura de Crédito (Regra)'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top 10 Ofensores */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-xl font-black uppercase italic text-slate-800 dark:text-white">Top 10 Ofensores</h4>
            <FeatherIcon name="alert-octagon" className="w-8 h-8 text-rose-500" />
          </div>
          <div className="space-y-4">
            {topOfensores.map((c, idx) => (
              <div key={c.id} className="flex flex-col p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => onNavigateToDetails(c.id)}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-400">#{idx + 1}</span>
                    <p className="text-xs font-black text-slate-800 dark:text-white uppercase truncate max-w-[200px]">⚠️ ALERTA: {c.clientName}</p>
                  </div>
                  <p className="text-sm font-black text-rose-600 tabular-nums">{formatCurrency(c.saldoDevedor)}</p>
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <span>{c.daysOverdue} dias em atraso</span>
                  <span className="text-blue-500">Ação: Alerta ao Gerente</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Diretrizes de Performance */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-xl font-black uppercase italic text-slate-800 dark:text-white">Diretrizes de Performance</h4>
            <FeatherIcon name="target" className="w-8 h-8 text-blue-500" />
          </div>
          <div className="grid grid-cols-1 gap-4">
            {diretrizes.map((d) => (
              <div key={d.faixa} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-blue-500/30 transition-all">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                    <FeatherIcon name={d.icon} className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black text-blue-600 uppercase tracking-widest">{d.faixa}</span>
                </div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{d.acao}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl">
           <FeatherIcon name="trending-up" className="w-10 h-10 text-rose-500 mb-6" />
           <h4 className="text-lg font-black uppercase italic text-slate-800 dark:text-white mb-2">Anomalias de Risco</h4>
           <p className="text-xs font-bold text-slate-400 leading-relaxed uppercase">Sócios com saltos súbitos de faixa de atraso são priorizados no feed.</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl">
           <FeatherIcon name="activity" className="w-10 h-10 text-blue-500 mb-6" />
           <h4 className="text-lg font-black uppercase italic text-slate-800 dark:text-white mb-2">Desvio de Volume</h4>
           <p className="text-xs font-bold text-slate-400 leading-relaxed uppercase">Análise de concentração de saldo por gerência comparada à média global.</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl">
           <FeatherIcon name="zap" className="w-10 h-10 text-amber-500 mb-6" />
           <h4 className="text-lg font-black uppercase italic text-slate-800 dark:text-white mb-2">Ações de Urgência</h4>
           <p className="text-xs font-bold text-slate-400 leading-relaxed uppercase">Contratos "High Value" com canais de contato ativos identificados.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] border border-slate-100 dark:border-slate-800 shadow-2xl max-w-none">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-6">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">A IA está processando os dados da Cooperativa...</p>
          </div>
        ) : (
          <div className="text-slate-700 dark:text-slate-300 font-medium prose dark:prose-invert max-w-none">
             {aiAnalysis ? (
               <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
             ) : (
               <p className="text-center text-slate-400 uppercase tracking-widest text-xs py-10">Inicie a varredura para ver os insights do Motor de IA.</p>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InsightsIAView;
