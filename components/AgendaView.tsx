
import React from 'react';
import { useApp } from '../context/AppContext';
import FeatherIcon from './FeatherIcon';

const AgendaView: React.FC = () => {
  const { activities } = useApp();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Agenda de Atividades</h1>
      <div className="space-y-4">
        {activities.map(activity => (
          <div key={activity.id} className="bg-[#1a1f2e] p-4 rounded-xl border border-[#2e3347] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${
                activity.status === 'Concluída' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
              }`}>
                <FeatherIcon name={activity.type === 'Ligação' ? 'phone' : activity.type === 'E-mail' ? 'mail' : 'calendar'} className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold">{activity.title}</h3>
                <p className="text-xs text-slate-400">{new Date(activity.dueDate).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                activity.status === 'Concluída' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {activity.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgendaView;
