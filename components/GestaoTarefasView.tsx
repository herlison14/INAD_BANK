
import React, { useMemo } from 'react';
import { Task, TaskStatus } from '../types';
import FeatherIcon from './FeatherIcon';
import { formatCurrency } from '../utils/formatter';

interface GestaoTarefasViewProps {
  tasks: Task[];
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onNavigateToDetails: (contractId: string) => void;
}

const GestaoTarefasView: React.FC<GestaoTarefasViewProps> = ({ tasks, onUpdateTaskStatus, onNavigateToDetails }) => {
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => a.priority - b.priority);
  }, [tasks]);

  return (
    <div className="space-y-8 animate-fade-in max-w-[1400px] mx-auto pb-20">
      <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] shadow-2xl border border-slate-100 dark:border-slate-800">
        <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-4">
          Workflow <span className="text-blue-600">Automatizado</span>
        </h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Fila de Ações por Prioridade de Risco</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {sortedTasks.map((task) => (
          <div key={task.id} className={`p-8 rounded-[3rem] border bg-white dark:bg-slate-900 shadow-xl flex flex-col md:flex-row items-center gap-8 group transition-all hover:scale-[1.01] ${task.priority === 1 ? 'border-red-500/20' : 'border-amber-500/20'}`}>
            <div className={`p-6 rounded-3xl ${task.priority === 1 ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-amber-500 text-white shadow-amber-500/20'} shadow-lg`}>
              <FeatherIcon name={task.priority === 1 ? "alert-circle" : "bell"} className="w-8 h-8" />
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${task.priority === 1 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                  PRIORIDADE {task.priority === 1 ? 'CRÍTICA' : 'ALERTA'}
                </span>
                <h4 className="text-xl font-black text-slate-800 dark:text-white uppercase italic">{task.contractClient}</h4>
              </div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{task.description}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-2">ID: {task.contractId} • Responsável: {task.managerEmail}</p>
            </div>

            <div className="flex items-center gap-4">
              <select 
                value={task.status} 
                onChange={(e) => onUpdateTaskStatus(task.id, e.target.value as TaskStatus)}
                className="bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-3 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 ring-blue-500"
              >
                {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button 
                onClick={() => onNavigateToDetails(task.contractId)}
                className="p-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-110 transition-transform"
              >
                <FeatherIcon name="list" className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="py-32 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[4rem] border-4 border-dashed border-slate-200 dark:border-slate-800">
             <FeatherIcon name="check-square" className="w-16 h-16 mx-auto text-slate-200 dark:text-slate-800 mb-6" />
             <p className="text-lg font-black text-slate-400 uppercase tracking-widest italic">Nenhuma tarefa designada para seu e-mail.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GestaoTarefasView;
