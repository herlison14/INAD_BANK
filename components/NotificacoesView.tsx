
import React from 'react';
import { AppNotification } from '../types';
import FeatherIcon from './FeatherIcon';

interface NotificacoesViewProps {
  notifications: AppNotification[];
  onNavigateToDetails: (id: string) => void;
  onMarkAllAsRead: () => void;
}

const NotificacoesView: React.FC<NotificacoesViewProps> = ({ notifications, onMarkAllAsRead }) => {
  return (
    <div className="space-y-10 animate-fade-in max-w-[1000px] mx-auto pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">Central de <span className="text-blue-500">Notificações</span></h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-2">Alertas do sistema e atualizações de negócios</p>
        </div>
        <button 
          onClick={onMarkAllAsRead}
          className="text-[10px] font-black uppercase text-blue-400 hover:text-blue-300 transition-colors"
        >
          Marcar todas como lidas
        </button>
      </div>

      <div className="space-y-4">
        {notifications.map((notif, index) => (
          <div key={`${notif.id}-${index}`} className={`p-6 rounded-3xl shadow-xl border flex items-start gap-6 group transition-all ${
            notif.read ? 'bg-[#1a1f2e] border-[#2e3347] opacity-60' : 'bg-[#242938] border-blue-500/30'
          }`}>
            <div className={`p-4 rounded-2xl shadow-lg ${
              notif.type === 'URGENTE' ? 'bg-red-500 text-white shadow-red-600/20' : 
              notif.type === 'META' ? 'bg-emerald-500 text-white shadow-emerald-600/20' : 
              'bg-blue-600 text-white shadow-blue-600/20'
            }`}>
              <FeatherIcon name={notif.type === 'URGENTE' ? 'alert-triangle' : notif.type === 'META' ? 'trending-up' : 'info'} className="w-5 h-5" />
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className={`text-[9px] font-black uppercase tracking-widest ${
                  notif.type === 'URGENTE' ? 'text-red-500' : 'text-blue-400'
                }`}>{notif.type}</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase">{new Date(notif.timestamp).toLocaleString()}</span>
              </div>
              <p className="text-lg font-black text-white uppercase italic leading-tight">{notif.message}</p>
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="py-40 text-center">
            <FeatherIcon name="check-circle" className="w-16 h-16 mx-auto text-slate-700 mb-6" />
            <p className="text-lg font-black text-slate-500 uppercase tracking-widest italic">Tudo limpo por aqui.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificacoesView;
