
import React, { useMemo } from 'react';
import FeatherIcon from './FeatherIcon';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: 'dollar' | 'file' | 'ticket' | 'clock' | 'package' | 'shield' | 'activity' | 'alert-circle';
  trend?: string;
  isNegativeTrend?: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, trend, isNegativeTrend = false }) => {
  const formattedValue = useMemo(() => {
    if (typeof value === 'number') {
        return value.toLocaleString('pt-BR', { 
            style: 'currency', 
            currency: 'BRL', 
            minimumFractionDigits: 2 
        });
    }
    return value;
  }, [value]);

  return (
    <div className="premium-card p-8 rounded-[3rem] flex flex-col justify-between transition-all hover:scale-[1.02] group border border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-start mb-6">
            <div className={`p-4 rounded-2xl ${
                icon === 'dollar' ? 'bg-emerald-500/10 text-emerald-500' : 
                icon === 'shield' ? 'bg-blue-500/10 text-blue-500' :
                icon === 'alert-circle' ? 'bg-rose-500/10 text-rose-500' :
                'bg-indigo-500/10 text-indigo-500'
            }`}>
                <FeatherIcon name={icon} className="h-6 w-6" />
            </div>
            {trend && (
              <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${isNegativeTrend ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {trend}
              </div>
            )}
        </div>
        
        <div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2">{title}</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tighter tabular-nums leading-none">
                {formattedValue}
            </p>
        </div>
    </div>
  );
};

export default KpiCard;
