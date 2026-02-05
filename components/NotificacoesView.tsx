import React from 'react';
import { AppNotification } from '../types';

interface NotificacoesViewProps {
  notifications: AppNotification[];
  onNavigateToDetails: (contractId: string) => void;
  onMarkAllAsRead: () => void;
}

const NotificacoesView: React.FC<NotificacoesViewProps> = ({ notifications, onNavigateToDetails, onMarkAllAsRead }) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  const timeSince = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " anos atrás";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " meses atrás";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " dias atrás";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " horas atrás";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutos atrás";
    return Math.floor(seconds) + " segundos atrás";
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-md transition-colors">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">Central de Notificações</h2>
            <p className="text-gray-600 dark:text-gray-400">Alertas e avisos importantes sobre sua carteira.</p>
          </div>
          <button
            onClick={onMarkAllAsRead}
            disabled={unreadCount === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-3 rounded-md flex items-center space-x-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><polyline points="20 6 9 17 4 12" /></svg>
            <span>Marcar todas como lidas</span>
          </button>
        </div>

        <div className="space-y-3">
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <div
                key={notification.id}
                onClick={() => onNavigateToDetails(notification.contract.id)}
                className={`flex items-start p-4 rounded-lg border cursor-pointer transition-colors ${
                  notification.read
                    ? 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border-gray-200 dark:border-gray-700'
                    : 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-800'
                }`}
              >
                {!notification.read && <div className="h-2.5 w-2.5 bg-blue-500 rounded-full mr-4 mt-1.5 flex-shrink-0"></div>}
                <div className="flex-grow">
                  <p className={`font-semibold ${notification.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>{notification.message}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Contrato: {notification.contract.id} | Saldo Devedor: {notification.contract.saldoDevedor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{timeSince(notification.timestamp)}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
              <h3 className="text-lg font-semibold">Nenhuma notificação por aqui</h3>
              <p>Os alertas gerados pela IA aparecerão nesta área.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificacoesView;