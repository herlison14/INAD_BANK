
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import FeatherIcon from './FeatherIcon';
import { Contract } from '../types';
import { formatCurrency } from '../utils/formatter';

interface SheetMetrics {
  name: string;
  count: number;
  balance: number;
  criticalExposure: number; // % of balance > 60 days
  color: string;
  icon: string;
}

export const SheetBreakdownGrid: React.FC<{ contracts: Contract[] }> = ({ contracts }) => {
  const metrics = useMemo(() => {
    const origins: ('Geral' | 'Cartoes' | 'Prejuizo')[] = ['Geral', 'Cartoes', 'Prejuizo'];
    
    return origins.map(origin => {
      const sheetContracts = contracts.filter(c => c.originSheet === origin);
      const totalBalance = sheetContracts.reduce((acc, c) => acc + c.saldoDevedor, 0);
      const criticalBalance = sheetContracts
        .filter(c => c.daysOverdue > 60)
        .reduce((acc, c) => acc + c.saldoDevedor, 0);
      
      const exposure = totalBalance > 0 ? (criticalBalance / totalBalance) * 100 : 0;
      
      let name = "Base Geral";
      let color = "var(--brand-primary)";
      let icon = "database";
      
      if (origin === 'Cartoes') {
        name = "Fluxo Cartões";
        color = "var(--status-error)";
        icon = "credit-card";
      } else if (origin === 'Prejuizo') {
        name = "Prejuízo (PREJ 02)";
        color = "#f59e0b"; // amber-500
        icon = "alert-octagon";
      }

      return {
        name,
        count: sheetContracts.length,
        balance: totalBalance,
        criticalExposure: exposure,
        color,
        icon
      };
    });
  }, [contracts]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
      {metrics.map((m, idx) => (
        <motion.div 
          key={m.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="box-glow p-8 rounded-[3.5rem] shadow-sm hover:shadow-xl transition-all group"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 rounded-2xl" style={{ backgroundColor: `${m.color}20`, color: m.color }}>
              <FeatherIcon name={m.icon} className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tighter italic">{m.name}</h4>
              <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Métricas por Canal</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1">Saldo Devedor</p>
                <p className="text-xl font-black text-[var(--text-primary)] tabular-nums italic">{formatCurrency(m.balance)}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1">Registros</p>
                <p className="text-xl font-black text-[var(--text-primary)] tabular-nums italic">{m.count}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border-default)]/50">
              <div className="flex justify-between items-center mb-2">
                <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Exposição Crítica (+60d)</p>
                <p className="text-xs font-black text-[var(--text-primary)]">{m.criticalExposure.toFixed(1)}%</p>
              </div>
              <div className="w-full h-2 bg-[var(--surface-background)] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${m.criticalExposure}%` }}
                  className="h-full"
                  style={{ backgroundColor: m.color }}
                />
              </div>
              <p className="text-[8px] font-bold text-[var(--text-secondary)] uppercase mt-2 italic">
                Representa a migração para faixas de maior risco
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default SheetBreakdownGrid;
