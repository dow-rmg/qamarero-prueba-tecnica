import React, { useState } from 'react';
import { Order } from '../../../lib/types';
import { useTable } from '../../../context/TableContext'; // Import hook to start split
import { formatCurrency, calculateTotal, calculatePaid, cn } from '../../../lib/utils';
import { PaymentActions } from './PaymentActions';
import { ProcessingPayment } from './ProcessingPayment';
import { CustomNumberInput } from './CustomNumberInput';
import { PieChart, Plus, Pencil, History, X, CreditCard, Banknote } from 'lucide-react';

interface PayByShareModeProps {
  order: Order;
  onPayment: (amount: number, method: 'cash' | 'card', shareCount?: number) => void;
}

// Modo: Pago Por Partes (Flexible)
// El usuario define "somos X personas" y cada uno paga Y partes
export const PayByShareMode: React.FC<PayByShareModeProps> = ({ order, onPayment }) => {
  const { startShareSplit } = useTable();
  const [setupShares, setSetupShares] = useState(2); // Configuración inicial de partes
  const [sharesToPay, setSharesToPay] = useState(1); // Cuántas partes va a pagar el usuario actual
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const totalOrder = calculateTotal(order.items);
  const totalPaid = calculatePaid(order.payments);
  const totalRemaining = totalOrder - totalPaid;

  // Si ya hay una sesión de división activa, mostramos la interfaz de pago
  if (order.splitState?.isActive) {
    const { totalShares, remainingShares, shareAmount } = order.splitState;
    const currentPaymentAmount = sharesToPay * shareAmount;
    const paidShares = totalShares - remainingShares;

    const handlePayment = (method: 'cash' | 'card') => {
      if (method === 'card') {
        setIsProcessing(true);
        return;
      }
      completePayment(method);
    };

    const completePayment = (method: 'cash' | 'card') => {
      onPayment(currentPaymentAmount, method, sharesToPay);
      setSharesToPay(1); // Resetear a 1 para la siguiente persona
      setIsProcessing(false);
      setShowHistory(false);
    };
    
    // Validar que no paguemos más partes de las que quedan
    const maxShares = remainingShares;

    return (
      <div className="flex flex-col h-full relative overflow-hidden">
        {isProcessing && (
          <ProcessingPayment 
            amount={currentPaymentAmount} 
            onComplete={() => completePayment('card')} 
          />
        )}

        {/* Botón Historial Flotante (si hay pagos) */}
        {order.payments.length > 0 && !showHistory && (
           <div className="absolute top-[180px] right-0 z-10">
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
          // Vista Historial Overlay
          <div className="absolute inset-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200 z-20">
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
                     <div className="text-right">
                       <div className="font-bold text-gray-900">{formatCurrency(p.amount)}</div>
                       {p.type === 'share' && p.shareCount && (
                         <div className="text-[10px] text-gray-500 font-medium">
                           {p.shareCount} {p.shareCount === 1 ? 'parte' : 'partes'}
                         </div>
                       )}
                     </div>
                  </div>
                ))}
             </div>
          </div>
        ) : (
          <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-200">
            {/* Banner de información de estado */}
            <div className="p-4 bg-gray-50 rounded-2xl mb-4 border border-gray-100">
               <div className="flex justify-between items-start mb-3 border-b border-gray-200 pb-3">
                 <div>
                   <div className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">Estado</div>
                   <div className="flex items-baseline gap-1">
                     <span className="text-3xl font-bold text-gray-900">{remainingShares}</span>
                     <span className="text-base font-medium text-gray-500">de {totalShares} partes quedan</span>
                   </div>
                 </div>
                 <div className="text-right">
                    <div className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">Valor Parte</div>
                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(shareAmount)}</div>
                 </div>
               </div>
               
               <div className="flex justify-between text-sm text-gray-500">
                 <div className="flex flex-col">
                   <span className="uppercase font-medium text-gray-400">Subtotal Cuenta</span>
                   <span className="font-bold text-gray-700 text-base">{formatCurrency(totalOrder)}</span>
                 </div>
                 <div className="flex flex-col items-end">
                   <span className="uppercase font-medium text-gray-400">Falta</span>
                   <span className="font-bold text-orange-600 text-base">{formatCurrency(totalRemaining)}</span>
                 </div>
               </div>
            </div>

            {/* Selector de cuántas partes paga el usuario actual */}
            <div className="flex-1 flex flex-col items-center justify-center space-y-6">
               <h3 className="text-lg font-bold text-gray-900 text-center px-4">
                 ¿Cuántas partes vas a pagar?
               </h3>
               
               <div className="flex items-center gap-4">
                 <button 
                   onClick={() => setSharesToPay(prev => Math.max(1, prev - 1))}
                   className="w-14 h-14 rounded-2xl border-2 border-gray-200 text-2xl flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all bg-white leading-none"
                   disabled={sharesToPay <= 1}
                 >
                   -
                 </button>
                 <div className="flex flex-col items-center min-w-[100px]">
                    <span className="text-5xl font-bold text-gray-900">{sharesToPay}</span>
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">
                      {sharesToPay === 1 ? 'parte' : 'partes'}
                    </span>
                 </div>
                 <button 
                   onClick={() => setSharesToPay(prev => Math.min(maxShares, prev + 1))}
                   className="w-14 h-14 rounded-2xl border-2 border-gray-900 bg-gray-900 text-white text-2xl flex items-center justify-center hover:bg-gray-800 active:scale-95 transition-all shadow-lg shadow-gray-900/20 leading-none"
                   disabled={sharesToPay >= maxShares}
                 >
                   +
                 </button>
               </div>
               
               <div className="w-full max-w-xs bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                 <span className="text-sm font-medium text-gray-500 uppercase">A cobrar</span>
                 <span className="text-2xl font-bold text-gray-900">{formatCurrency(currentPaymentAmount)}</span>
               </div>
            </div>

            <PaymentActions 
              amount={currentPaymentAmount}
              onPayCash={() => handlePayment('cash')} 
              onPayCard={() => handlePayment('card')}
            />
          </div>
        )}
      </div>
    );
  }

  // Fase de configuración inicial (antes de activar el modo split)
  return (
    <div className="flex flex-col h-full justify-center relative">
      <CustomNumberInput 
        isOpen={showCustomInput}
        onClose={() => setShowCustomInput(false)}
        onConfirm={(num) => {
            setSetupShares(num);
            setShowCustomInput(false);
        }}
        title="Número de partes"
      />

      <div className="text-center space-y-8">
        <div className="flex justify-center">
          <div className="p-4 bg-gray-100 rounded-full">
            <PieChart size={48} className="text-gray-400" />
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dividir por partes</h2>
          <p className="text-gray-500">Selecciona el número total de personas para dividir la cuenta</p>
        </div>

        {/* Selección rápida de número de comensales */}
        <div className="flex flex-wrap justify-center gap-3 px-4">
          {[2, 3, 4, 5, 6, 7, 8].map(num => (
            <button
              key={num}
              onClick={() => setSetupShares(num)}
              className={cn(
                "w-16 h-16 rounded-2xl font-bold text-2xl border-2 transition-all flex flex-col items-center justify-center",
                setupShares === num 
                  ? "bg-gray-900 text-white border-gray-900 shadow-lg scale-110" 
                  : "bg-white text-gray-900 border-gray-200 hover:border-gray-300"
              )}
            >
              {num}
            </button>
          ))}
          <button
              onClick={() => setShowCustomInput(true)}
              className={cn(
                "w-16 h-16 rounded-2xl font-bold text-2xl border-2 transition-all flex flex-col items-center justify-center relative",
                setupShares > 8 
                  ? "bg-gray-900 text-white border-gray-900 shadow-lg scale-110" 
                  : "bg-white text-gray-900 border-gray-200 hover:border-gray-300"
              )}
          >
              {setupShares > 8 ? (
                  <>
                    <span>{setupShares}</span>
                    <div className="absolute top-1 right-1 bg-white/20 p-1 rounded-full">
                      <Pencil size={10} className="text-white" />
                    </div>
                  </>
              ) : (
                  <Plus size={24} />
              )}
          </button>
        </div>

        <div className="pt-8 px-8">
          <button
            onClick={() => startShareSplit(order.tableId, setupShares)}
            className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20"
          >
            Comenzar división en {setupShares} partes
          </button>
        </div>
      </div>
    </div>
  );
};
