import React, { useState } from 'react';
import { AutomationRule, AutomationLog, TriggerType, ActionType, AutomationAction, Contract } from '../types';
import FeatherIcon from './FeatherIcon';

interface AutomacoesViewProps {
  rules: AutomationRule[];
  logs: AutomationLog[];
  onToggleRule: (ruleId: string) => void;
  onCreateRule: (rule: AutomationRule) => void;
  onDeleteRule: (ruleId: string) => void;
}

const AutomacoesView: React.FC<AutomacoesViewProps> = ({ rules, logs, onToggleRule, onCreateRule, onDeleteRule }) => {
  const [activeTab, setActiveTab] = useState<'regras' | 'logs'>('regras');
  const [showNewRuleForm, setShowNewRuleForm] = useState(false);

  // Form State - Rule Info
  const [newName, setNewName] = useState('');
  const [newTrigger, setNewTrigger] = useState<TriggerType>(TriggerType.ON_IMPORT);
  
  // Form State - Condition (Single for MVP)
  const [newConditionField, setNewConditionField] = useState<string>('daysOverdue');
  const [newConditionOperator, setNewConditionOperator] = useState<string>('>');
  const [newConditionValue, setNewConditionValue] = useState<string>('');

  // Form State - Actions (Multiple)
  const [draftActions, setDraftActions] = useState<AutomationAction[]>([]);
  const [currentActionType, setCurrentActionType] = useState<ActionType>(ActionType.CREATE_NOTIFICATION);
  const [currentActionTemplate, setCurrentActionTemplate] = useState('');

  const handleAddActionToDraft = () => {
      if (!currentActionTemplate.trim()) return;

      setDraftActions([...draftActions, {
          type: currentActionType,
          template: currentActionTemplate
      }]);
      
      // Reset action input but keep type for convenience
      setCurrentActionTemplate('');
  };

  const handleRemoveActionFromDraft = (index: number) => {
      const newDraft = [...draftActions];
      newDraft.splice(index, 1);
      setDraftActions(newDraft);
  };

  const handleSaveRule = () => {
    if (!newName.trim()) {
        alert('Defina um nome para a regra.');
        return;
    }
    if (draftActions.length === 0) {
        alert('Adicione pelo menos uma ação para esta regra.');
        return;
    }

    const rule: AutomationRule = {
      id: `rule-${Date.now()}`,
      name: newName,
      description: `${newTrigger}: Se ${newConditionField} ${newConditionOperator} ${newConditionValue}`,
      active: true,
      trigger: newTrigger,
      conditions: [
        {
          field: newConditionField as keyof Contract,
          operator: newConditionOperator as any,
          value: isNaN(Number(newConditionValue)) ? newConditionValue : Number(newConditionValue),
        }
      ],
      actions: draftActions
    };
    onCreateRule(rule);
    
    // Reset form
    setShowNewRuleForm(false);
    setNewName('');
    setNewConditionValue('');
    setDraftActions([]);
    setCurrentActionTemplate('');
  };

  const insertVariable = (variable: string) => {
      setCurrentActionTemplate(prev => prev + variable);
  };

  const renderRulesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-[#cbd5e0]">Regras de Automação Ativas</h3>
        <button
          onClick={() => setShowNewRuleForm(!showNewRuleForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
        >
          <FeatherIcon name="zap" className="h-4 w-4" />
          <span>Nova Regra</span>
        </button>
      </div>

      {showNewRuleForm && (
        <div className="bg-[#242938] p-6 rounded-lg border border-[#2e3347] animate-fade-in">
          <h4 className="font-bold text-[#f0f4ff] mb-4 text-lg border-b border-[#2e3347] pb-2">Configurar Nova Automação</h4>
          
          {/* 1. Gatilhos e Nome */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-[#cbd5e0] mb-1">Nome da Regra</label>
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)} className="block w-full border-[#2e3347] bg-[#242938] text-[#f0f4ff] rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Ex: Régua 15 Dias Crédito Pessoal" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#cbd5e0] mb-1">Gatilho (Quando executar?)</label>
              <select value={newTrigger} onChange={e => setNewTrigger(e.target.value as TriggerType)} className="block w-full border-[#2e3347] bg-[#242938] text-[#f0f4ff] rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500">
                {Object.values(TriggerType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          
          {/* 2. Condições */}
          <div className="mb-6 bg-[#1a1f2e] p-4 rounded-md border border-[#2e3347]">
            <label className="block text-sm font-bold text-[#cbd5e0] mb-2">Condições (Se...)</label>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
               <select value={newConditionField} onChange={e => setNewConditionField(e.target.value)} className="block w-full md:w-1/3 border-[#2e3347] bg-[#242938] text-[#f0f4ff] rounded-md shadow-sm p-2">
                  <option value="daysOverdue">Dias de Atraso</option>
                  <option value="saldoDevedor">Saldo Devedor</option>
                  <option value="product">Produto</option>
                  <option value="pa">PA</option>
                  <option value="status">Status do Contrato</option>
               </select>
               <select value={newConditionOperator} onChange={e => setNewConditionOperator(e.target.value)} className="block w-full md:w-1/4 border-[#2e3347] bg-[#242938] text-[#f0f4ff] rounded-md shadow-sm p-2">
                  <option value=">">maior que</option>
                  <option value="<">menor que</option>
                  <option value="==">igual a</option>
                  <option value="!=">diferente de</option>
                  <option value=">=">maior ou igual</option>
                  <option value="contains">contém</option>
                  <option value="not_contains">não contém</option>
               </select>
               <input type="text" value={newConditionValue} onChange={e => setNewConditionValue(e.target.value)} className="block w-full md:w-1/3 border-[#2e3347] bg-[#242938] text-[#f0f4ff] rounded-md shadow-sm p-2" placeholder="Valor (ex: 15, 1000, Cartão)" />
            </div>
          </div>

          {/* 3. Ações */}
          <div className="mb-6 bg-[#1a1f2e] p-4 rounded-md border border-[#2e3347]">
            <label className="block text-sm font-bold text-[#cbd5e0] mb-2">Ações (Então...)</label>
            
            {/* Lista de Ações Adicionadas */}
            {draftActions.length > 0 && (
                <div className="mb-4 space-y-2">
                    {draftActions.map((action, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-[#242938] p-2 rounded border border-[#2e3347]">
                            <div className="flex items-center">
                                <span className={`text-xs font-bold px-2 py-1 rounded mr-3 ${
                                    action.type === ActionType.CREATE_TASK ? 'bg-blue-900 text-blue-200' : 
                                    action.type === ActionType.CREATE_NOTIFICATION ? 'bg-yellow-900 text-yellow-200' :
                                    'bg-green-900 text-green-200'
                                }`}>
                                    {action.type}
                                </span>
                                <span className="text-sm text-[#e2e8f0] truncate max-w-md">{action.template}</span>
                            </div>
                            <button onClick={() => handleRemoveActionFromDraft(idx)} className="text-red-400 hover:text-red-300">
                                <FeatherIcon name="trash-2" className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Inputs para nova ação */}
            <div className="flex flex-col space-y-2">
               <div className="flex flex-col md:flex-row md:space-x-2 space-y-2 md:space-y-0">
                   <select value={currentActionType} onChange={e => setCurrentActionType(e.target.value as ActionType)} className="block w-full md:w-1/3 border-gray-300 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-md shadow-sm p-2">
                      {Object.values(ActionType).map(a => <option key={a} value={a}>{a}</option>)}
                   </select>
                   <div className="relative w-full md:w-2/3">
                        <input 
                            type="text" 
                            value={currentActionTemplate} 
                            onChange={e => setCurrentActionTemplate(e.target.value)} 
                            className="block w-full border-gray-300 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-md shadow-sm p-2 pr-10" 
                            placeholder="Template da mensagem/tarefa" 
                        />
                   </div>
               </div>
               
               {/* Helper de Variáveis */}
               <div className="flex flex-wrap gap-2 items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                   <span>Variáveis disponíveis:</span>
                   {['[ClientName]', '[ID]', '[SaldoDevedor]', '[DiasAtraso]', '[Produto]', '[Gerente]'].map(v => (
                       <button 
                        key={v} 
                        onClick={() => insertVariable(v)}
                        className="bg-gray-100 dark:bg-slate-600 hover:bg-gray-200 dark:hover:bg-slate-500 px-2 py-1 rounded border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-200 transition-colors"
                       >
                           {v}
                       </button>
                   ))}
               </div>

               <button 
                onClick={handleAddActionToDraft} 
                disabled={!currentActionTemplate.trim()}
                className="self-end mt-2 text-sm bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-200 font-semibold py-2 px-4 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
               >
                   <FeatherIcon name="plus" className="h-4 w-4 mr-1" />
                   Adicionar Ação
               </button>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-[#2e3347]">
            <button onClick={() => setShowNewRuleForm(false)} className="px-4 py-2 text-[#a0aec0] hover:bg-[#242938] rounded-md transition-colors">Cancelar</button>
            <button onClick={handleSaveRule} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 shadow-sm transition-colors">Salvar Regra Completa</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {rules.map(rule => (
          <div key={rule.id} className={`border rounded-lg p-5 shadow-none transition-all hover:shadow-md flex flex-col ${rule.active ? 'bg-[#1a1f2e] border-[#2e3347]' : 'bg-[#1a1f2e]/50 border-[#2e3347] opacity-75'}`}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-full flex-shrink-0 ${rule.active ? 'bg-green-900 text-green-300' : 'bg-[#242938] text-[#a0aec0]'}`}>
                  <FeatherIcon name="zap" className="h-4 w-4" />
                </div>
                <h4 className="font-semibold text-[#f0f4ff] leading-tight">{rule.name}</h4>
              </div>
              <div className="flex space-x-1 ml-2">
                <button onClick={() => onToggleRule(rule.id)} title={rule.active ? "Desativar" : "Ativar"} className="p-1 text-[#a0aec0] hover:text-blue-400 transition-colors">
                  <FeatherIcon name={rule.active ? "pause" : "play"} className="h-4 w-4" />
                </button>
                <button onClick={() => onDeleteRule(rule.id)} title="Excluir" className="p-1 text-[#a0aec0] hover:text-red-400 transition-colors">
                  <FeatherIcon name="trash-2" className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="text-xs text-[#a0aec0] mb-4 bg-[#242938]/50 p-2 rounded border border-[#2e3347]">
                <strong className="text-[#cbd5e0]">Gatilho:</strong> {rule.trigger}
                <br />
                <strong className="text-[#cbd5e0]">Condições:</strong>
                <ul className="list-disc pl-4 mt-1">
                    {rule.conditions.map((c, i) => (
                        <li key={i}>{c.field} {c.operator} {c.value}</li>
                    ))}
                </ul>
            </div>
            
            <div className="flex-grow space-y-2">
               <h5 className="text-xs font-bold text-[#a0aec0] uppercase tracking-wide mb-1">Ações Configuradas:</h5>
               {rule.actions.map((action, idx) => (
                   <div key={idx} className="flex items-start space-x-2 text-sm">
                        <span className={`mt-0.5 flex-shrink-0 w-2 h-2 rounded-full ${
                            action.type === ActionType.CREATE_TASK ? 'bg-blue-500' : 
                            action.type.includes('Enviar') ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></span>
                        <div>
                            <span className="font-semibold text-[#cbd5e0] block text-xs">{action.type}</span>
                            <span className="text-[#a0aec0] text-xs line-clamp-2" title={action.template}>{action.template}</span>
                        </div>
                   </div>
               ))}
            </div>
          </div>
        ))}
        {rules.length === 0 && (
            <div className="col-span-full text-center py-12 text-[#a0aec0] bg-[#1a1f2e]/50 rounded-lg border border-dashed border-[#2e3347]">
                <FeatherIcon name="zap" className="h-12 w-12 mx-auto text-[#2e3347] mb-3" />
                <p className="font-medium">Nenhuma regra de automação configurada.</p>
                <p className="text-sm mt-1">Crie fluxos para automatizar tarefas e notificações.</p>
            </div>
        )}
      </div>
    </div>
  );

  const renderLogsTab = () => (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#cbd5e0]">Histórico de Execução</h3>
        <div className="overflow-x-auto bg-[#1a1f2e] rounded-lg shadow-none border border-[#2e3347]">
            <table className="min-w-full divide-y divide-[#2e3347]">
                <thead className="bg-[#242938]">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#a0aec0] uppercase tracking-wider">Data/Hora</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#a0aec0] uppercase tracking-wider">Regra</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#a0aec0] uppercase tracking-wider">Contrato</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#a0aec0] uppercase tracking-wider">Ação</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#a0aec0] uppercase tracking-wider">Detalhe</th>
                    </tr>
                </thead>
                <tbody className="bg-[#1a1f2e] divide-y divide-[#2e3347]">
                    {logs.slice().reverse().map((log) => (
                        <tr key={log.id} className="hover:bg-[#242938] transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#a0aec0]">
                                {new Date(log.timestamp).toLocaleString('pt-BR')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#f0f4ff]">
                                {log.ruleName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#e2e8f0]">
                                {log.contractClient} <span className="text-[#a0aec0]">({log.contractId})</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#e2e8f0]">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    log.actionType === ActionType.CREATE_TASK ? 'bg-blue-900 text-blue-200' : 
                                    log.actionType.includes('Enviar') ? 'bg-green-900 text-green-200' : 'bg-[#242938] text-[#a0aec0]'
                                }`}>
                                    {log.actionType}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#a0aec0] max-w-xs truncate" title={log.description}>
                                {log.description}
                            </td>
                        </tr>
                    ))}
                    {logs.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-10 text-center text-[#a0aec0]">Nenhuma automação executada ainda.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-[#1a1f2e] p-6 rounded-lg shadow-none ring-1 ring-[#2e3347] transition-colors">
        <h2 className="text-2xl font-bold text-[#f0f4ff] mb-2">Motor de Automação</h2>
        <p className="text-[#a0aec0] mb-6">Configure fluxos automáticos para agilizar a cobrança e padronizar ações da equipe.</p>
        
        <div className="border-b border-[#2e3347] mb-6">
            <nav className="-mb-px flex space-x-8">
                <button
                    onClick={() => setActiveTab('regras')}
                    className={`${activeTab === 'regras' ? 'border-blue-500 text-blue-400' : 'border-transparent text-[#a0aec0] hover:text-[#f0f4ff] hover:border-[#cbd5e0]'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors`}
                >
                    <FeatherIcon name="sliders" className="mr-2 h-4 w-4" />
                    Regras Configuradas
                </button>
                <button
                    onClick={() => setActiveTab('logs')}
                    className={`${activeTab === 'logs' ? 'border-blue-500 text-blue-400' : 'border-transparent text-[#a0aec0] hover:text-[#f0f4ff] hover:border-[#cbd5e0]'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors`}
                >
                    <FeatherIcon name="list" className="mr-2 h-4 w-4" />
                    Logs de Execução
                </button>
            </nav>
        </div>

        {activeTab === 'regras' ? (
          <div className="space-y-8">
            {/* Diretrizes de Risco (Conforme solicitado pelo Especialista Sênior) */}
            <div className="bg-blue-600 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-10">
                  <FeatherIcon name="shield" className="w-32 h-32" />
               </div>
               <div className="relative z-10">
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-6">Diretrizes de Risco & Performance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20">
                        <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-70">Régua 0-30</p>
                        <p className="text-sm font-bold">Régua Preventiva: SMS e Push.</p>
                     </div>
                     <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20">
                        <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-70">Ação 31-60</p>
                        <p className="text-sm font-bold">Ação Corretiva: Renegociação via IA.</p>
                     </div>
                     <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20">
                        <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-70">Crítico 90+</p>
                        <p className="text-sm font-bold">Crítico: Ajuizamento e Alerta Gerencial.</p>
                     </div>
                  </div>
               </div>
            </div>
            {renderRulesTab()}
          </div>
        ) : renderLogsTab()}
      </div>
    </div>
  );
};

export default AutomacoesView;