
import React, { useState, useEffect } from 'react';
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

  const handleManualScan = () => {
    const count = executarVarreduraCredito();
    setManualScanResult(count);
    setTimeout(() => setManualScanResult(null), 3000);
  };

  const performScan = async () => {
    if (contracts.length === 0) return;
    setLoading(true);

    const dataSample = contracts.slice(0, 20).map(c => ({
      id: c.id,
      clientName: c.clientName,
      socio: c.socio,
      atraso: c.daysOverdue,
      saldo: c.saldoDevedor,
      gerente: c.gerente,
      managerEmail: c.managerEmail,
      tel: c.phone ? 'Sim' : 'Não'
    }));

    const prompt = `
      Como um Motor de Análise de Risco Sênior, realize 3 varreduras nos dados abaixo:
      1. VARREDURA DE RISCO (Sócio): Identifique quem saltou de faixa ou está em nível crítico.
      2. VARREDURA DE VOLUME (Gerente): Identifique gerentes com saldo acima da média.
      3. VARREDURA DE URGÊNCIA (Contrato): Liste contratos com saldo alto e telefone válido para ação imediata.

      Dados: ${JSON.stringify(dataSample)}

      Retorne uma análise executiva em markdown, focando em "O QUÊ FAZER" e "POR QUÊ".
      Além disso, crie tarefas para os gerentes responsáveis pelos contratos mais críticos e notificações de alerta.
    `;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              analysis: {
                type: Type.STRING,
                description: "A análise executiva em markdown."
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
                    priority: { type: Type.NUMBER, description: "1 para Crítico, 2 para Alerta" }
                  },
                  required: ["contractId", "contractClient", "managerEmail", "description", "priority"]
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
            id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            contractId: t.contractId,
            contractClient: t.contractClient,
            managerEmail: t.managerEmail,
            description: t.description,
            status: TaskStatus.Pendente,
            priority: t.priority === 1 ? 1 : 2,
            creationDate: new Date().toLocaleString('pt-BR'),
            aiScore: 95
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

      <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] border border-slate-100 dark:border-slate-800 shadow-2xl prose dark:prose-invert max-w-none">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-6">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">A IA está processando os dados da Cooperativa...</p>
          </div>
        ) : (
          <div className="text-slate-700 dark:text-slate-300 font-medium">
             {aiAnalysis ? aiAnalysis.split('\n').map((line, i) => <p key={i}>{line}</p>) : 'Inicie a varredura para ver os insights.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default InsightsIAView;
