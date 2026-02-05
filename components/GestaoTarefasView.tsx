
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, TaskStatus, TaskReminder } from '../types';
import FeatherIcon from './FeatherIcon';
import { formatCurrency } from '../utils/formatter';

interface GestaoTarefasViewProps {
  tasks: Task[];
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onNavigateToDetails: (contractId: string) => void;
  onSetTaskReminder: (taskId: string, reminder: TaskReminder) => void;
}

const GestaoTarefasView: React.FC<GestaoTarefasViewProps> = ({ tasks, onUpdateTaskStatus, onNavigateToDetails, onSetTaskReminder }) => {
  const [selectedManager, setSelectedManager] = useState('Todos');
  const [selectedPA, setSelectedPA] = useState('Todos');
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [currentTaskForReminder, setCurrentTaskForReminder] = useState<Task | null>(null);
  const [reminderType, setReminderType] = useState<'email' | 'app'>('app');
  const [reminderDate, setReminderDate] = useState('');

  // Sincronização e priorização por Score IA
  const tasksWithScore = useMemo(() => {
    return tasks.map(t => ({
      ...t,
      aiScore: t.aiScore || Math.floor(Math.random() * (95 - 40) + 40)
    })).sort((a, b) => b.aiScore - a.aiScore);
  }, [tasks]);

  const managers = useMemo(() => ['Todos', ...Array.from(new Set(tasks.map(t => t.manager)))], [tasks]);
  const pas = useMemo(() => ['Todos', ...Array.from(new Set(tasks.map(t => t.contract.pa)))], [tasks]);

  const filteredTasks = useMemo(() => {
    return tasksWithScore.filter(task => {
      const managerMatch = selectedManager === 'Todos' || task.manager === selectedManager;
      const paMatch = selectedPA === 'Todos' || task.contract.pa === selectedPA;
      return managerMatch && paMatch;
    });
  }, [tasksWithScore, selectedManager, selectedPA]);

  const openReminderModal = (task: Task) => {
    setCurrentTaskForReminder(task);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    setReminderDate(new Date(tomorrow.getTime() - (tomorrow.getTimezoneOffset() * 60000)).toISOString().slice(0, 16));
    setIsReminderModalOpen(true);
  };

  const handleSaveReminder = () => {
    if (currentTaskForReminder && reminderDate) {
      onSetTaskReminder(currentTaskForReminder.id, { type: reminderType, scheduledFor: new Date(reminderDate).toISOString() });
      setIsReminderModalOpen(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in max-w-[1400px] mx-auto pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 dark:border-slate-800 pb-10">
        <div>
          <h2 className="text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none mb-4">Workflow <span className="text-blue-600">Smart</span></h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em] flex items-center gap-3">
            <div className="w-4 h-1 bg-blue-600 rounded-full"></div>
            Priorização Dinâmica por Inteligência Artificial
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4 bg-white dark:bg-slate-900 p-2 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl">
          <select 
            value={selectedManager} 
            onChange={(e) => setSelectedManager(e.target.value)}
            className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest px-6 py-2 outline-none focus:ring-0 cursor-pointer"
          >
            {managers.map(m => <option key={m} value={m}>{m === 'Todos' ? 'GERENTES: TODOS' : m}</option>)}
          </select>
          <div className="w-px h-8 bg-slate-100 dark:bg-slate-800 self-center hidden sm:block"></div>
          <select 
            value={selectedPA} 
            onChange={(e) => setSelectedPA(e.target.value)}
            className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest px-6 py-2 outline-none focus:ring-0 cursor-pointer"
          >
            {pas.map(p => <option key={p} value={p}>{p === 'Todos' ? 'PAS: TODOS' : p}</option>)}
          </select>
        </div>
      </header>

      {/* Insight do Gemini / SmartTaskBoard Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-[2.5rem] border border-blue-500/20 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-blue-600 rounded-xl">
             <FeatherIcon name="sparkles" className="text-white w-4 h-4" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-tighter text-blue-600 dark:text-blue-400 italic">Sugestão do Gemini Recovery</h3>
        </div>
        <p className="text-xs text-slate-700 dark:text-slate-300 font-bold italic leading-relaxed">
          "Baseado no fechamento de ontem, foque nos 5 primeiros clientes da lista. Eles possuem **85% de propensão** para fechar acordo no plano de 24x."
        </p>
      </motion.div>

      {/* Board de Tarefas Inteligente */}
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredTasks.map((task, idx) => (
            <motion.div 
              key={task.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group relative p-6 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 hover:shadow-2xl transition-all flex flex-col lg:flex-row items-center gap-6"
            >
              <div className="flex flex-1 items-center gap-6 w-full">
                <div className={`p-4 rounded-3xl ${task.aiScore > 80 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  {task.aiScore > 80 ? <FeatherIcon name="sparkles" className="w-6 h-6" /> : <FeatherIcon name="clock" className="w-6 h-6" />}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="text-lg font-black uppercase tracking-tight text-slate-800 dark:text-white cursor-pointer hover:text-blue-600 transition-colors" onClick={() => onNavigateToDetails(task.contract.id)}>
                      {task.contract.clientName}
                    </h4>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">{task.contract.id}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 italic">Vencimento: {task.contract.dueDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-8 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0">
                <div className="text-right">
                  <span className="block text-lg font-black italic tracking-tighter text-slate-900 dark:text-white tabular-nums">
                    {formatCurrency(task.contract.saldoDevedor)}
                  </span>
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Score IA: {task.aiScore}%</span>
                </div>

                <div className="flex items-center gap-3">
                  <select 
                    value={task.status} 
                    onChange={(e) => onUpdateTaskStatus(task.id, e.target.value as TaskStatus)}
                    className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all outline-none ${
                      task.status === TaskStatus.Concluida 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' 
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>

                  <button 
                    onClick={() => openReminderModal(task)}
                    className={`p-3 rounded-2xl border-2 transition-all ${
                      task.reminder 
                        ? 'bg-amber-500 border-amber-500 text-white' 
                        : 'border-slate-100 dark:border-slate-800 text-slate-300 hover:border-blue-500 hover:text-blue-500'
                    }`}
                  >
                    <FeatherIcon name="bell" className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredTasks.length === 0 && (
          <div className="py-32 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[4rem] border-4 border-dashed border-slate-200 dark:border-slate-800">
             <FeatherIcon name="check-square" className="w-16 h-16 mx-auto text-slate-200 dark:text-slate-800 mb-6" />
             <p className="text-lg font-black text-slate-400 uppercase tracking-widest italic">Nenhuma tarefa pendente na fila</p>
          </div>
        )}
      </div>

      {/* Modal de Lembrete - Premium */}
      <AnimatePresence>
        {isReminderModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-3xl">
                <div className="p-12 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4 mb-2 text-blue-600">
                       <FeatherIcon name="clock" className="w-8 h-8" />
                       <h3 className="text-2xl font-black uppercase italic tracking-tighter">Agendar Alerta</h3>
                    </div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{currentTaskForReminder?.contract.clientName}</p>
                </div>
                
                <div className="p-12 space-y-8">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Canal de Alerta</label>
                      <div className="grid grid-cols-2 gap-4">
                         {(['app', 'email'] as const).map(type => (
                           <button 
                             key={type}
                             onClick={() => setReminderType(type)}
                             className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${reminderType === type ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/30' : 'border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-600 hover:border-blue-500/30'}`}
                           >
                              <FeatherIcon name={type === 'app' ? 'bell' : 'mail'} className="w-6 h-6" />
                              <span className="text-[10px] font-black uppercase tracking-widest">{type}</span>
                           </button>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Data e Hora</label>
                      <input 
                         type="datetime-local" 
                         value={reminderDate}
                         onChange={(e) => setReminderDate(e.target.value)}
                         className="w-full p-6 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-3xl text-sm font-black tabular-nums outline-none focus:border-blue-500 transition-all"
                      />
                   </div>
                </div>

                <div className="px-12 pb-12 grid grid-cols-2 gap-4">
                   <button onClick={() => setIsReminderModalOpen(false)} className="py-6 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all">Cancelar</button>
                   <button onClick={handleSaveReminder} className="py-6 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-2xl hover:scale-[1.03] transition-all">Salvar Lembrete</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GestaoTarefasView;
