
import React from 'react';
import { AppNotification } from '../types';
import FeatherIcon from './FeatherIcon';

interface NotificacoesViewProps {
  notifications: AppNotification[];
  onNavigateToDetails: (contractId: string) => void;
  onMarkAllAsRead: () => void;
}

const NotificacoesView: React.FC<NotificacoesViewProps> = ({ notifications, onNavigateToDetails }) => {
  return (
    <div className="space-y-10 animate-fade-in max-w-[1000px] mx-auto pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">News <span className="text-[var(--brand-primary)]">Feed</span></h2>
          <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.4em] mt-2">Alertas Direcionados e Atualizações de Carga</p>
        </div>
      </div>

      <div className="space-y-6">
        {notifications.map((notif, index) => (
          <div key={`${notif.id}-${index}`} className="bg-[var(--surface-container)] p-8 rounded-[3rem] shadow-xl border border-[var(--border-default)] flex items-start gap-8 group transition-all hover:bg-[var(--surface-elevated)]">
            <div className={`p-5 rounded-2xl shadow-lg ${
              notif.type === 'URGENTE' ? 'bg-[var(--status-error)] text-white shadow-red-600/20' : 
              notif.type === 'META' ? 'bg-[var(--status-success)] text-white shadow-emerald-600/20' : 
              'bg-[var(--brand-primary)] text-white shadow-blue-600/20'
            }`}>
              <FeatherIcon name={notif.type === 'URGENTE' ? 'alert-triangle' : notif.type === 'META' ? 'trending-up' : 'info'} className="w-6 h-6" />
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <span className={`text-[9px] font-black uppercase tracking-widest ${
                  notif.type === 'URGENTE' ? 'text-[var(--status-error)]' : 'text-[var(--brand-primary)]'
                }`}>{notif.type}</span>
                <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase">{new Date(notif.timestamp).toLocaleTimeString()}</span>
              </div>
              <p className="text-lg font-black text-[var(--text-primary)] uppercase italic leading-tight">{notif.message}</p>
              <p className="text-xs font-bold text-[var(--text-secondary)] mt-2 uppercase tracking-widest">Responsável: {notif.managerEmail}</p>
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="py-40 text-center">
            <FeatherIcon name="smile" className="w-16 h-16 mx-auto text-[var(--text-secondary)]/20 mb-6" />
            <p className="text-lg font-black text-[var(--text-secondary)] uppercase tracking-widest italic">Nenhum alerta crítico para você hoje.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificacoesView;
