import React, { useState } from 'react';
import { Order } from '../../../lib/types';
import { formatCurrency, calculateTotal, calculatePaid } from '../../../lib/utils';
import { Keypad } from '../../ui/Keypad';
import { PaymentActions } from './PaymentActions';
import { ProcessingPayment } from './ProcessingPayment';
import { History, X, CreditCard, Banknote } from 'lucide-react';

interface PayAllModeProps {
  order: Order;
  onPayment: (amount: number, method: 'cash' | 'card') => void;
}

// Modo: Pagar Todo (o una cantidad personalizada)
export const PayAllMode: React.FC<PayAllModeProps> = ({ order, onPayment }) => {
  const total = calculateTotal(order.items);
  const paid = calculatePaid(order.payments);
  const remaining = total - paid;
  
  const [inputAmount, setInputAmount] = useState<string>('');
  const [showHistory, setShowHistory] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Si no hay input manual, asumimos que se quiere pagar todo lo restante
  const currentAmount = inputAmount ? parseFloat(inputAmount) : remaining;

  // Manejo del teclado numérico
  const handleKeyPress = (key: string) => {
    if (key === '.' && inputAmount.includes('.')) return;
    // Limitar a 2 decimales
    if (inputAmount.includes('.') && inputAmount.split('.')[1].length >= 2) return;
    
    setInputAmount(prev => prev + key);
  };

  const handleDelete = () => {
    setInputAmount(prev => prev.slice(0, -1));
  };

  // Ejecución del pago
  const handlePayment = (method: 'cash' | 'card') => {
    // Validaciones básicas de monto
    if (currentAmount <= 0 || currentAmount > remaining + 0.01) return;

    if (method === 'card') {
      setIsProcessing(true);
      return; // Esperamos al callback del componente de procesamiento
    }

    // Efectivo pasa directo
    completePayment(method);
  };

  const completePayment = (method: 'cash' | 'card') => {
    onPayment(currentAmount, method);
    setInputAmount('');
    setShowHistory(false);
    setIsProcessing(false);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      {isProcessing && (
        <ProcessingPayment 
          amount={currentAmount} 
          onComplete={() => completePayment('card')} 
        />
      )}

      {/* Header: Resumen Compacto */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm shrink-0 mb-4">
        {/* Info Row: Total y Falta */}
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-50">
           <div className="flex items-center gap-3">
             <span className="text-sm font-medium text-gray-500">Subtotal:</span>
             <span className="text-xl font-bold text-gray-900">{formatCurrency(total)}</span>
           </div>
           <div className="flex items-center gap-3">
             <span className="text-sm font-medium text-gray-500">Falta:</span>
             <span className="text-xl font-bold text-orange-600">{formatCurrency(remaining)}</span>
           </div>
        </div>
        
        {/* Main Row: A Pagar y Pagado */}
        <div className="flex justify-between items-end">
           <div>
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">A Pagar</div>
              <div className="text-4xl font-bold text-gray-900 leading-none">{formatCurrency(currentAmount)}</div>
           </div>
           
           <div className="text-right">
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Pagado</div>
              <div className="text-xl font-bold text-emerald-600 leading-none">
                {formatCurrency(paid)}
              </div>
           </div>
        </div>
      </div>

      {/* Contenido Principal: Teclado o Historial */}
      <div className="flex-1 min-h-0 relative flex flex-col">
        {/* Botón Historial Flotante (si hay pagos) */}
        {order.payments.length > 0 && !showHistory && (
           <div className="absolute top-0 right-1 z-10">
             <button
               onClick={() => setShowHistory(true)}
               className="flex items-center gap-2 bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
             >
               <span className="text-[10px] font-bold uppercase tracking-wider">Historial</span>
               <History size={12} className="text-gray-300" />
             </button>
           </div>
        )}

        {showHistory ? (
          // Vista Historial
          <div className="absolute inset-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200 z-10">
             <div className="flex items-center justify-between p-4 border-b border-gray-50 bg-gray-50/50">
                <h3 className="font-bold text-gray-900">Historial de Pagos</h3>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="p-1 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
                >
                  <X size={20} />
                </button>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {order.payments.slice().reverse().map((p) => (
                  <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                     <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${p.method === 'card' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          {p.method === 'card' ? <CreditCard size={16} /> : <Banknote size={16} />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">
                            {p.method === 'card' ? 'Tarjeta' : 'Efectivo'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                     </div>
                     <span className="font-bold text-gray-900">{formatCurrency(p.amount)}</span>
                  </div>
                ))}
             </div>
          </div>
        ) : (
          // Vista Teclado
          <div className="h-full flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-full mb-3">
                 <Keypad onKeyPress={handleKeyPress} onDelete={handleDelete} />
            </div>
            
            <PaymentActions 
              amount={currentAmount}
              onPayCash={() => handlePayment('cash')} 
              onPayCard={() => handlePayment('card')}
              disabled={currentAmount <= 0 || currentAmount > remaining + 0.01}
            />
          </div>
        )}
      </div>
    </div>
  );
};

