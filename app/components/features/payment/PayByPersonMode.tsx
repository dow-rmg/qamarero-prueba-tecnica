import React, { useState } from 'react';
import { Order } from '../../../lib/types';
import { formatCurrency, calculateTotal, calculatePaid, cn } from '../../../lib/utils';
import { PaymentActions } from './PaymentActions';
import { ProcessingPayment } from './ProcessingPayment';
import { CustomNumberInput } from './CustomNumberInput';
import { Users, User, Plus, Pencil } from 'lucide-react';

interface PayByPersonModeProps {
  order: Order;
  onPayment: (amount: number, method: 'cash' | 'card') => void;
}

// Modo: Pago por Persona (División equitativa del restante)
export const PayByPersonMode: React.FC<PayByPersonModeProps> = ({ order, onPayment }) => {
  const total = calculateTotal(order.items);
  const paid = calculatePaid(order.payments);
  const remaining = total - paid;
  
  // Estado local para seleccionar número de personas entre las que dividir
  const [personCount, setPersonCount] = useState<number>(2);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  // Dividimos el monto RESTANTE entre el número de personas seleccionadas
  const shareAmount = remaining / personCount;
  
  // Al realizar un pago, pagamos UNA cuota de las calculadas
  // Reducimos el contador de personas para facilitar el flujo (ej: de 3 quedan 2)
  const handlePayment = (method: 'cash' | 'card') => {
    if (method === 'card') {
      setIsProcessing(true);
      return;
    }
    completePayment(method);
  };

  const completePayment = (method: 'cash' | 'card') => {
    onPayment(shareAmount, method);
    if (personCount > 1) {
      setPersonCount(prev => prev - 1);
    }
    setIsProcessing(false);
  };

  return (
    <div className="flex flex-col h-full relative">
      {isProcessing && (
        <ProcessingPayment 
          amount={shareAmount} 
          onComplete={() => completePayment('card')} 
        />
      )}
      
      <CustomNumberInput 
        isOpen={showCustomInput}
        onClose={() => setShowCustomInput(false)}
        onConfirm={(num) => {
            setPersonCount(num);
            setShowCustomInput(false);
        }}
        title="Número de personas"
      />

      {/* Selector de número de personas */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
        {[2, 3, 4, 5, 6, 7].map(num => (
           <button
             key={num}
             onClick={() => setPersonCount(num)}
             className={cn(
               "flex-1 min-w-[60px] aspect-square rounded-xl flex flex-col items-center justify-center font-bold text-xl border-2 transition-all",
               personCount === num 
                 ? "bg-gray-900 text-white border-gray-900" 
                 : "bg-white text-gray-900 border-gray-200 hover:border-gray-400"
             )}
           >
             <span>{num}</span>
             <Users size={14} className="opacity-50" />
           </button>
        ))}
        <button
            onClick={() => setShowCustomInput(true)}
            className={cn(
               "flex-1 min-w-[60px] aspect-square rounded-xl flex flex-col items-center justify-center font-bold text-xl border-2 transition-all relative",
               personCount > 7 
                 ? "bg-gray-900 text-white border-gray-900" 
                 : "bg-white text-gray-900 border-gray-200 hover:border-gray-400"
            )}
        >
            {personCount > 7 ? (
                <>
                  <span>{personCount}</span>
                  <div className="absolute top-1 right-1 bg-white/20 p-1 rounded-full">
                    <Pencil size={10} className="text-white" />
                  </div>
                </>
            ) : (
                <Plus size={24} />
            )}
             <Users size={14} className="opacity-50" />
        </button>
      </div>

      {/* Resumen de cuotas */}
      <div className="flex flex-col gap-2 mb-6 p-4 bg-gray-50 rounded-xl">
        <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-1">
           <span className="text-xs text-gray-400 font-medium uppercase">Subtotal</span>
           <span className="text-sm font-bold text-gray-600">{formatCurrency(total)}</span>
        </div>
        <div className="flex justify-between items-end pt-1">
           <div>
             <div className="text-xs text-gray-500 font-medium uppercase">Cuota por persona</div>
             <div className="text-3xl font-bold text-gray-900">{formatCurrency(shareAmount)}</div>
           </div>
           <div className="text-right">
             <div className="text-xs text-gray-500 font-medium uppercase">Falta por pagar</div>
             <div className="text-xl font-bold text-orange-600">{formatCurrency(remaining)}</div>
           </div>
        </div>
      </div>

      {/* Lista visual de pagos pendientes y realizados */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-6 pr-1">
        <div className="text-sm font-medium text-gray-500 px-1">Pagos pendientes ({personCount})</div>
        {Array.from({ length: personCount }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <User size={16} className="text-gray-500" />
              </div>
              <span className="font-medium text-gray-900">Persona {i + 1}</span>
            </div>
            <span className="font-bold text-gray-900">{formatCurrency(shareAmount)}</span>
          </div>
        ))}

        {/* Pagos ya realizados */}
        {order.payments.length > 0 && (
          <div className="pt-4">
             <div className="text-sm font-bold text-emerald-600 px-1 mb-2 uppercase tracking-wide">Pagos realizados ({order.payments.length})</div>
             <div className="space-y-3">
               {order.payments.slice().reverse().map((p) => (
                 <div key={p.id} className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-emerald-100">
                       <User size={16} className="text-emerald-600" />
                     </div>
                     <div className="flex flex-col">
                        <span className="font-medium text-emerald-900">Pago completado</span>
                        <span className="text-xs text-emerald-600/80">
                          {p.method === 'card' ? 'Tarjeta' : 'Efectivo'} • {new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                     </div>
                   </div>
                   <span className="font-bold text-emerald-700">{formatCurrency(p.amount)}</span>
                 </div>
               ))}
             </div>
          </div>
        )}
      </div>

      <PaymentActions 
        amount={shareAmount}
        onPayCash={() => handlePayment('cash')} 
        onPayCard={() => handlePayment('card')}
        disabled={remaining <= 0}
      />
    </div>
  );
};
