
import React, { useState, useEffect, useCallback } from 'react';
import { Contract, Task, TaskStatus } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

// Removed global ai initialization to follow guidelines of creating instance right before use.

interface InsightsIAViewProps {
  contracts: Contract[];
  onNavigateToDetails: (contractId: string) => void;
  selectedProducts: string[];
  onAddNotifications: (contracts: Contract[]) => void;
  onAddTasks: (tasks: Task[]) => void;
  onAnalysisComplete?: (summary: string) => void;
}

// A component to render the AI-generated content with simple formatting
const InsightRenderer: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n').filter(line => line.trim() !== '');

  return (
    <div className="space-y-3 text-gray-700 dark:text-gray-300">
      {lines.map((line, index) => {
        if (line.match(/^### (.*)/)) {
           return <h3 key={index} className="text-xl font-semibold text-gray-800 dark:text-gray-100 mt-6 mb-3">{line.replace(/^### /, '')}</h3>;
        }
        if (line.match(/^\*\*(.*)\*\*$/)) {
          return <h3 key={index} className="text-xl font-semibold text-gray-800 dark:text-gray-100 mt-6 mb-3">{line.replace(/\*\*/g, '')}</h3>;
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={index} className="flex items-start pl-2">
              <span className="text-blue-500 mr-3 mt-1 flex-shrink-0">➜</span>
              <p>{line.substring(2)}</p>
            </div>
          );
        }
        return <p key={index}>{line}</p>;
      })}
    </div>
  );
};


const InsightsIAView: React.FC<InsightsIAViewProps> = ({ contracts, onNavigateToDetails, selectedProducts, onAddNotifications, onAddTasks, onAnalysisComplete }) => {
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [riskyContracts, setRiskyContracts] = useState<Contract[]>([]);
  
  const [notificationsCreated, setNotificationsCreated] = useState(false);
  const [tasksCreated, setTasksCreated] = useState(false);
  
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);
  const [taskGenerationError, setTaskGenerationError] = useState<string | null>(null);
  const [suggestedTasks, setSuggestedTasks] = useState<Task[]>([]);

  // Report Generation State
  const [reportContent, setReportContent] = useState<string>('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  useEffect(() => {
    // Reset status when contracts change
    setNotificationsCreated(false);
    setTasksCreated(false);
    setSuggestedTasks([]);
    setReportContent(''); // Reset report when filter changes
  }, [contracts]);

  const handleCreateNotifications = () => {
    if (riskyContracts.length > 0) {
      onAddNotifications(riskyContracts);
      setNotificationsCreated(true);
    }
  };
  
  const handleConfirmAndCreateTasks = () => {
    if (suggestedTasks.length > 0) {
      onAddTasks(suggestedTasks);
      setTasksCreated(true);
      setSuggestedTasks([]);
    }
  };

  const handleGenerateReport = async () => {
    if (contracts.length === 0) return;
    
    setIsGeneratingReport(true);
    
    const totalSaldoDevedor = contracts.reduce((sum, c) => sum + c.saldoDevedor, 0);
    const totalValorProvisionado = contracts.reduce((sum, c) => sum + c.valorProvisionado, 0);
    
    const prompt = `
      Atue como um Consultor Financeiro Executivo de uma Cooperativa de Crédito (Sistema Sicoob). Gere um "Relatório Executivo de Recuperação de Crédito" formal e detalhado.
      O relatório deve manter o tom cooperativista (parceria, apoio, respeito) e ser estruturado profissionalmente para a diretoria.

      Dados da Carteira Selecionada:
      - Produtos Analisados: ${selectedProducts.join(', ')}
      - Total de Contratos: ${contracts.length}
      - Saldo Devedor Total: R$ ${totalSaldoDevedor.toLocaleString('pt-BR')}
      - Valor Provisionado Total: R$ ${totalValorProvisionado.toLocaleString('pt-BR')}
      - Principais Gerentes Envolvidos: ${Array.from(new Set(contracts.map(c => c.gerente))).slice(0, 5).join(', ')}
      
      Estrutura do Relatório:
      1. Título (Relatório Executivo Cooperativo - Data de Hoje)
      2. Resumo Executivo (Visão geral rápida da saúde da carteira selecionada)
      3. Análise de Risco (Detalhamento da exposição financeira)
      4. Plano de Ação Recomendado (Estratégias de abordagem consultiva e recuperação)
      5. Conclusão

      Não use markdown complexo, use texto corrido e quebras de linha para facilitar a leitura em um editor de texto simples.
    `;

    try {
      // Initialize GoogleGenAI right before the call to ensure correct API key usage.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      setReportContent(response.text || '');
    } catch (e) {
      console.error(e);
      setReportContent("Erro ao gerar o relatório. Por favor, tente novamente.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleExportReport = () => {
    if (!reportContent) return;

    const element = document.createElement("a");
    const file = new Blob([reportContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Relatorio_Executivo_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  const handleGenerateTasks = useCallback(async () => {
    if (riskyContracts.length === 0) return;
    
    setIsGeneratingTasks(true);
    setTaskGenerationError(null);
    setSuggestedTasks([]);
    
    const prompt = `
      Você é um gerente de recuperação de crédito em uma cooperativa (Sicoob). 
      Gere UMA tarefa concisa e acionável para o gerente responsável por CADA contrato de alto risco abaixo.
      A tarefa deve respeitar o relacionamento cooperativista, priorizando o contato do gerente para PJ/Rural e canais digitais para PF simples, mas sempre com tom de ajuda.

      Contratos de Alto Risco:
      ${riskyContracts.map(c => `- ID do Contrato: ${c.id}, Gerente: ${c.gerente}, Produto: ${c.product}, Saldo Devedor: R$${c.saldoDevedor.toFixed(2)}, Dias em Atraso: ${c.daysOverdue}`).join('\n')}

      Sua resposta DEVE SER um array JSON de objetos. Cada objeto deve ter duas propriedades: "contractId" (string) e "taskDescription" (string).
      Exemplo de Resposta: [{"contractId": "C005", "taskDescription": "Agendar visita consultiva para entender safra e propor renegociação."}, {"contractId": "C008", "taskDescription": "Ligar oferecendo plano de regularização amigável."}]
    `;
    
    try {
      // Initialize GoogleGenAI right before the call to ensure correct API key usage.
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
                contractId: { type: Type.STRING },
                taskDescription: { type: Type.STRING },
              },
              required: ["contractId", "taskDescription"],
            },
          },
        },
      });

      const generatedTasks = JSON.parse(response.text || '[]');
      
      const newTasks: Task[] = generatedTasks.map((taskData: { contractId: string, taskDescription: string }) => {
        const contract = riskyContracts.find(c => c.id === taskData.contractId);
        if (!contract) return null;
        return {
          id: `task-${contract.id}-${Date.now()}`,
          contract: contract,
          manager: contract.gerente,
          description: taskData.taskDescription,
          status: TaskStatus.Pendente,
          creationDate: new Date().toISOString(),
        };
      }).filter((t: Task | null): t is Task => t !== null);
      
      setSuggestedTasks(newTasks);

    } catch (e) {
      console.error(e);
      setTaskGenerationError("Ocorreu um erro ao sugerir tarefas com a IA. Tente novamente.");
    } finally {
      setIsGeneratingTasks(false);
    }

  }, [riskyContracts]);


  const generateInsights = useCallback(async (data: Contract[]) => {
    if (data.length === 0) {
      setInsights(null);
      setRiskyContracts([]);
      return;
    }

    setLoading(true);
    setError(null);

    const totalSaldoDevedor = data.reduce((sum, c) => sum + c.saldoDevedor, 0);
    const totalValorProvisionado = data.reduce((sum, c) => sum + c.valorProvisionado, 0);
    
    const productDistribution = data.reduce((acc, contract) => {
        acc[contract.product] = (acc[contract.product] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const productSummary = Object.entries(productDistribution)
        .map(([product, count]) => `- ${product}: ${count} contrato(s)`)
        .join('\n');

    const riskiestContractsSample = [...data]
      .sort((a, b) => b.saldoDevedor - a.saldoDevedor)
      .slice(0, 5)
      .map(c => `- ID ${c.id}, Produto: ${c.product}: Saldo R$${c.saldoDevedor.toFixed(2)}, Provisionado R$${c.valorProvisionado.toFixed(2)}, Atraso ${c.daysOverdue} dias.`)
      .join('\n');

    const filterContextSummary = selectedProducts.includes('Todos')
      ? `A análise atual considera todos os produtos.`
      : `A análise atual está focada nos produtos: **${selectedProducts.join(', ')}**.`;
      
    const prompt = `
      Você é a IA responsável por apoiar a cobrança em uma cooperativa de crédito (Sicoob).
      Seu objetivo é sugerir a melhor abordagem de recuperação, respeitando o modelo cooperativista (parceria, educação financeira, sem agressividade).

      **Contexto da Análise:**
      ${filterContextSummary}

      **Resumo dos Dados da Carteira Filtrada:**
      - Número de Contratos: ${data.length}
      - Saldo Devedor Total: ${totalSaldoDevedor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
      - Valor Provisionado Total: ${totalValorProvisionado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
      - Distribuição por Produto:
      ${productSummary}
      - Amostra dos Contratos de Maior Risco:
      ${riskiestContractsSample}

      **Regras de Ouro da Cooperativa:**
      1. **Crédito Pessoal**: Use canais digitais (Whats, SMS). Recomende renegociação digital.
      2. **Consignado**: Contato suave, evite pressão. Risco regulatório.
      3. **Rural**: Abordagem CONSULTIVA. Priorize o Gerente de Negócios. Respeite safra. Evite excesso de mensagens automáticas.
      4. **Cartão**: Digital aceitável. Ofereça parcelamento.
      5. **PJ Micro**: Priorize o gerente.

      **Sua Análise Deve Conter TRÊS SEÇÕES (Markdown ###):**

      ### Resumo da Carteira e Risco
      Diagnóstico do risco focando na visão cooperativista. Identifique onde a cooperativa está mais exposta.

      ### Principais Pontos de Atenção
      Identifique os 3 a 5 contratos da amostra que exigem ação. Justifique com base no produto e atraso. Ex: "O contrato rural X precisa de visita pois o atraso é atípico para a safra".

      ### Recomendações Estratégicas (Ação Cooperativa)
      Sugira ações específicas para os grupos de produtos encontrados.
      - Para Rural: Sugira visitas ou contatos de relacionamento.
      - Para Cartão/Pessoal: Sugira campanhas digitais.
      - Para Críticos (Alto Valor): Sugira atuação próxima do gerente e PA.
      
      **IMPORTANTE**: Ao final, adicione uma linha com APENAS os IDs dos contratos de maior risco citados, formato:
      ID_RISCO:[ID1],[ID2],[ID3]
    `;

    try {
      // Initialize GoogleGenAI right before the call to ensure correct API key usage.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      const rawText = response.text || '';
      
      const riskIdRegex = /ID_RISCO:\[?([^\]]*)\]?/;
      const match = rawText.match(riskIdRegex);
      
      let cleanText = rawText;
      let currentRiskyContracts: Contract[] = [];
      
      if (match && match[1]) {
        const ids = match[1].split(',').map(id => id.trim());
        currentRiskyContracts = data.filter(c => ids.includes(c.id));
        setRiskyContracts(currentRiskyContracts);
        cleanText = rawText.replace(riskIdRegex, '').trim();
      } else {
        setRiskyContracts([]);
      }

      setInsights(cleanText);
      
      // Update global ticker with summary
      if (onAnalysisComplete) {
          const riskCount = currentRiskyContracts.length;
          const maxExposure = currentRiskyContracts.length > 0 
            ? Math.max(...currentRiskyContracts.map(c => c.saldoDevedor)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
            : 'R$ 0,00';
          
          const summaryMsg = riskCount > 0
             ? `⚠️ ALERTA COOPERATIVO: ${riskCount} contratos exigem atenção consultiva. Maior exposição: ${maxExposure}. Verifique a aba "Insights de IA".`
             : `✅ CARTEIRA SAUDÁVEL: Indicadores dentro da normalidade cooperativista. Nenhum risco crítico detectado.`;
          
          onAnalysisComplete(summaryMsg);
      }

    } catch (e) {
      console.error(e);
      setError('Ocorreu um erro ao gerar a análise de IA. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [selectedProducts, onAnalysisComplete]);

  useEffect(() => {
    generateInsights(contracts);
  }, [contracts, generateInsights]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 font-semibold">A IA Cooperativa está analisando os data...</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Processando perfil de risco e estratégias de relacionamento.</p>
        </div>
      );
    }

    if (error) {
      return <div className="text-center p-8 text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-300 rounded-lg">{error}</div>;
    }
    
    if (!insights && contracts.length > 0) {
       return <div className="text-center p-8 text-gray-500 dark:text-gray-400">Pronto para gerar insights cooperativos.</div>;
    }
    
    if (!insights) {
      return (
          <div className="text-center p-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-700 rounded-lg">
            <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-300">Nenhum contrato encontrado para os filtros selecionados.</h3>
            <p className="mt-2">Ajuste os filtros acima para iniciar uma nova análise.</p>
          </div>
      );
    }

    return <InsightRenderer content={insights} />;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-lg shadow-md transition-colors">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          {selectedProducts.includes('Todos')
            ? 'Insights de IA (Visão Cooperativa)' 
            : `Análise Cooperativa (${selectedProducts.join(', ')})`}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">A inteligência artificial sugere ações de cobrança baseadas no relacionamento e nas particularidades de cada produto.</p>
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            {renderContent()}
            {riskyContracts.length > 0 && !loading && (
            <div className="mt-8 space-y-6">
                <div className="bg-gray-100 dark:bg-slate-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Ações Recomendadas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-slate-800 p-4 rounded shadow-sm">
                            <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Alertas de Risco</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Notificar equipe sobre contratos prioritários.</p>
                            <button
                                onClick={handleCreateNotifications}
                                disabled={notificationsCreated || riskyContracts.length === 0}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors flex items-center justify-center space-x-2 disabled:bg-gray-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                                <span>{notificationsCreated ? 'Alertas Criados' : 'Gerar Alertas'}</span>
                            </button>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-4 rounded shadow-sm">
                            <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Tarefas Consultivas</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">IA sugere a melhor abordagem para o gerente.</p>
                             <button
                                onClick={handleGenerateTasks}
                                disabled={tasksCreated || isGeneratingTasks || riskyContracts.length === 0}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors flex items-center justify-center space-x-2 disabled:bg-gray-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                                <span>{isGeneratingTasks ? 'Analisando...' : tasksCreated ? 'Tarefas Criadas' : 'Sugerir Abordagem'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {isGeneratingTasks && (
                  <div className="text-center p-4 mt-4">
                    <p className="text-gray-600 dark:text-gray-300">IA está definindo a melhor estratégia de contato...</p>
                  </div>
                )}

                {taskGenerationError && (
                  <div className="text-center p-4 mt-4 text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-300 rounded-lg">
                    {taskGenerationError}
                  </div>
                )}
                
                {suggestedTasks.length > 0 && !isGeneratingTasks && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Estratégias Sugeridas pela IA:</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      {suggestedTasks.map(task => (
                        <div key={task.id} className="bg-gray-50 dark:bg-slate-700 p-3 rounded-md border border-gray-200 dark:border-gray-600">
                          <p className="font-semibold text-gray-700 dark:text-gray-200">{task.contract.clientName} ({task.manager})</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleConfirmAndCreateTasks}
                      className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
                    >
                      Aprovar e Criar {suggestedTasks.length} Tarefas
                    </button>
                  </div>
                )}

                {/* Report Generation Section */}
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-lg border border-indigo-100 dark:border-indigo-800">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="text-xl font-semibold text-indigo-900 dark:text-indigo-300">Gerador de Relatório Executivo</h3>
                            <p className="text-sm text-indigo-700 dark:text-indigo-400">Relatório formal para diretoria com visão cooperativista.</p>
                        </div>
                        {!reportContent && (
                            <button
                                onClick={handleGenerateReport}
                                disabled={isGeneratingReport}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition-colors flex items-center space-x-2 disabled:bg-indigo-300"
                            >
                                {isGeneratingReport ? (
                                    <span>Gerando...</span>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                                        <span>Gerar Relatório</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    {reportContent && (
                        <div className="space-y-4 animate-fade-in">
                            <textarea
                                value={reportContent}
                                onChange={(e) => setReportContent(e.target.value)}
                                className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm font-mono text-gray-800 dark:text-gray-200"
                            />
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setReportContent('')}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                                >
                                    Descartar
                                </button>
                                <button
                                    onClick={handleExportReport}
                                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition-colors flex items-center space-x-2"
                                >
                                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                    <span>Baixar Relatório (.txt)</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default InsightsIAView;
