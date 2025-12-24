import React from 'react';
import { CreditCard, Banknote } from 'lucide-react';

interface PaymentActionsProps {
  onPayCash: () => void;
  onPayCard: () => void;
  disabled?: boolean;
  amount: number;
}

// Botones reutilizables para las acciones finales de pago (Efectivo / Tarjeta)
export const PaymentActions: React.FC<PaymentActionsProps> = ({ onPayCash, onPayCard, disabled }) => {
  return (
    <div className="grid grid-cols-2 gap-3 w-full md:max-w-[320px] mx-auto shrink-0">
      <button
        onClick={onPayCard}
        disabled={disabled}
        className="flex flex-col items-center justify-center p-4 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
      >
        <CreditCard size={24} className="mb-1" />
        <span className="font-bold text-base">Con tarjeta</span>
      </button>
      
      <button
        onClick={onPayCash}
        disabled={disabled}
        className="flex flex-col items-center justify-center p-4 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
      >
        <Banknote size={24} className="mb-1" />
        <span className="font-bold text-base">En efectivo</span>
      </button>
    </div>
  );
};
