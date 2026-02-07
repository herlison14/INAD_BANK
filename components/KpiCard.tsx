
import React, { useMemo } from 'react';
import FeatherIcon from './FeatherIcon';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: 'dollar' | 'file' | 'ticket' | 'clock' | 'package';
  trend?: string;
  isNegativeTrend?: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, trend = "+5.2%", isNegativeTrend = false }) => {
  const formattedValue = useMemo(() => {
    if (typeof value === 'number') {
        if (title.toLowerCase().includes('saldo') || title.toLowerCase().includes('valor')) {
            return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 });
        }
        return value.toLocaleString('pt-BR');
    }
    return value;
  }, [value, title]);

  return (
    <div className="premium-card p-6 rounded-[2.5rem] flex flex-col justify-between transition-all hover:scale-[1.03] group cursor-default">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${
                icon === 'dollar' ? 'bg-emerald-500/10 text-emerald-500' : 
                icon === 'file' ? 'bg-indigo-500/10 text-indigo-500' :
                icon === 'package' ? 'bg-blue-500/10 text-blue-500' :
                'bg-amber-500/10 text-amber-500'
            }`}>
                <FeatherIcon name={icon} className="h-6 w-6" />
            </div>
            <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${isNegativeTrend ? 'text-red-500' : 'text-emerald-500'}`}>
                {trend}
                <svg className={`h-3 w-3 ${isNegativeTrend ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            </div>
        </div>
        
        <div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">{title}</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tighter tabular-nums leading-none">
                {formattedValue}
            </p>
        </div>
    </div>
  );
};

export default KpiCard;
