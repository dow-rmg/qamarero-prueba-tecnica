import React from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { formatCurrency } from '../../../lib/utils';

interface ProcessingPaymentProps {
  amount: number;
  onComplete: () => void;
}

export const ProcessingPayment: React.FC<ProcessingPaymentProps> = ({ amount, onComplete }) => {
  React.useEffect(() => {
    // Simular tiempo de procesamiento del datáfono (2.5 segundos)
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-8 p-8 max-w-sm w-full text-center">
        
        {/* Animación de acercar tarjeta */}
        <div className="relative w-32 h-32 flex items-center justify-center">
            <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-20"></div>
            <div className="relative bg-emerald-50 w-24 h-24 rounded-full flex items-center justify-center border-2 border-emerald-100 shadow-sm">
                <CreditCard size={40} className="text-emerald-600 animate-pulse" />
            </div>
            {/* Indicador de carga circular */}
            <Loader2 className="absolute -bottom-8 text-gray-400 animate-spin" size={24} />
        </div>

        <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">Acerque tarjeta</h3>
            <p className="text-gray-500 text-sm">Esperando lectura del datáfono...</p>
        </div>

        <div className="bg-gray-50 px-6 py-3 rounded-xl border border-gray-100 w-full">
            <div className="text-xs text-gray-500 uppercase font-medium mb-1">Total a cobrar</div>
            <div className="text-3xl font-bold text-gray-900">{formatCurrency(amount)}</div>
        </div>

        <button 
            onClick={onComplete}
            className="text-xs text-gray-400 hover:text-gray-600 underline decoration-gray-300 underline-offset-4"
        >
            Simular cobro completado
        </button>
      </div>
    </div>
  );
};

