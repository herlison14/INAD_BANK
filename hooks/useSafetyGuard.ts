
import { formatCurrency } from '../utils/formatter';

export interface Proposta {
  parcelas: number;
  valorParcela: number;
  isAVista: boolean;
  desconto?: number;
}

export interface GuardResult {
  valid: boolean;
  msg: string;
  type: 'danger' | 'warning' | 'info';
}

export const useSafetyGuard = () => {
  const checkAnomalies = (proposta: Proposta): GuardResult => {
    // 1. Prevenção de Margem Negativa / Custo Operacional
    if (!proposta.isAVista && proposta.valorParcela > 0 && proposta.valorParcela < 150) {
      return { 
        valid: false, 
        msg: `OPERAÇÃO NEGADA: Parcela de ${formatCurrency(proposta.valorParcela)} está abaixo do custo operacional mínimo (R$ 150,00).`,
        type: 'danger' 
      };
    }

    // 2. Conflito de Desconto (Exclusivo à Vista)
    if (!proposta.isAVista && (proposta.desconto || 0) > 0) {
      return {
        valid: false,
        msg: "ERRO DE POLÍTICA: Descontos sobre o principal são exclusivos para liquidação à vista.",
        type: 'danger'
      };
    }

    // 3. Trava de Alçada para Prazos Longos
    if (proposta.parcelas > 36) {
      return { 
        valid: true, 
        msg: "ALERTA DE ALÇADA: Prazos superiores a 36 meses requerem garantia real ou caucionamento de bens.",
        type: 'warning'
      };
    }

    return { 
      valid: true, 
      msg: proposta.isAVista 
        ? "QUITAÇÃO TOTAL: Desconto de 15% liberado pela mesa de crédito." 
        : "COMPLIANCE OK: Proposta dentro dos limites automáticos de renegociação.", 
      type: 'info' 
    };
  };

  return { checkAnomalies };
};
