import React, { useState, useMemo } from 'react';
import { Order } from '../../../lib/types';
import { formatCurrency, calculateTotal, calculatePaid, cn } from '../../../lib/utils';
import { PaymentActions } from './PaymentActions';
import { ProcessingPayment } from './ProcessingPayment';
import { CheckCircle2, AlertCircle, Check } from 'lucide-react';

interface PayByProductModeProps {
  order: Order;
  onPayment: (amount: number, method: 'cash' | 'card', itemsPaid?: string[]) => void;
}

// Modo: Pago por Producto
// Permite seleccionar ítems específicos para pagar
export const PayByProductMode: React.FC<PayByProductModeProps> = ({ order, onPayment }) => {
  const totalOrder = calculateTotal(order.items);
  const totalPaid = calculatePaid(order.payments);
  const totalRemaining = totalOrder - totalPaid;

  // Verificamos si hay pagos previos que NO sean de tipo producto
  // Si existen, bloqueamos este modo para evitar inconsistencias matemáticas
  const hasGenericPayments = order.payments.some(p => p.type !== 'product');

  // Calculamos la cantidad restante de cada ítem en tiempo real
  const itemStatus = useMemo(() => {
    const status = new Map<string, number>(); // itemId -> cantidad restante
    
    // 1. Empezamos con las cantidades originales
    order.items.forEach(item => {
      status.set(item.id, item.qty);
    });

    // 2. Restamos lo que ya se ha pagado específicamente como "producto"
    order.payments.forEach(p => {
      if (p.type === 'product' && p.itemsPaid) {
        p.itemsPaid.forEach(id => {
          const current = status.get(id) || 0;
          status.set(id, Math.max(0, current - 1));
        });
      }
    });
    
    return status;
  }, [order]);

  // Si hay pagos genéricos previos, mostramos pantalla de bloqueo
  if (hasGenericPayments) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8 text-center animate-in fade-in duration-300">
        <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6 border border-orange-100">
            <AlertCircle size={40} className="text-orange-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">Modo no disponible</h3>
        <p className="text-gray-500 max-w-sm mx-auto mb-6 leading-relaxed">
            No es posible seleccionar productos individualmente porque ya se han realizado pagos parciales generales en esta cuenta.
        </p>
        <div className="text-sm font-medium text-orange-600 bg-orange-50 px-4 py-2 rounded-lg border border-orange-100">
            Utilice "Pagar todo", "Por persona" o "Por partes"
        </div>
      </div>
    );
  }

  // Estado de selección actual: itemId -> cantidad seleccionada para pagar AHORA
  const [selection, setSelection] = useState<Record<string, number>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Alternar selección simple (todo o nada, o ciclo)
  const toggleItem = (itemId: string, max: number) => {
    setSelection(prev => {
      const current = prev[itemId] || 0;
      if (current < max) {
         return { ...prev, [itemId]: current + 1 };
      } else {
         return { ...prev, [itemId]: 0 };
      }
    });
  };
  
  // Ajuste fino de cantidades (+/-)
  const updateSelection = (itemId: string, delta: number, max: number) => {
    setSelection(prev => {
      const current = prev[itemId] || 0;
      const next = Math.max(0, Math.min(max, current + delta));
      if (next === 0) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [itemId]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: next };
    });
  };

  // Calcular total monetario de la selección actual
  const selectedTotal = order.items.reduce((sum, item) => {
    const count = selection[item.id] || 0;
    return sum + (count * item.unitPrice);
  }, 0);

  const handlePayment = (method: 'cash' | 'card') => {
    if (selectedTotal <= 0) return;
    
    if (method === 'card') {
      setIsProcessing(true);
      return;
    }
    
    completePayment(method);
  };

  const completePayment = (method: 'cash' | 'card') => {
    // Construir array plano de IDs pagados (ej: ['ID1', 'ID1', 'ID2'])
    const itemsPaid: string[] = [];
    Object.entries(selection).forEach(([id, count]) => {
      for (let i = 0; i < count; i++) {
        itemsPaid.push(id);
      }
    });

    onPayment(selectedTotal, method, itemsPaid);
    setSelection({}); // Limpiar selección tras pago
    setIsProcessing(false);
  };

  return (
    <div className="flex flex-col h-full relative">
      {isProcessing && (
        <ProcessingPayment 
          amount={selectedTotal} 
          onComplete={() => completePayment('card')} 
        />
      )}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {/* Productos Pendientes */}
        {order.items.map(item => {
          const remainingQty = itemStatus.get(item.id) || 0;
          if (remainingQty === 0) return null; // Solo mostramos los pendientes aquí

          const selectedQty = selection[item.id] || 0;
          const isSelected = selectedQty > 0;

          return (
            <div 
              key={item.id}
              className={cn(
                "flex items-center justify-between p-3 sm:p-4 rounded-xl border-2 transition-all cursor-pointer gap-2 sm:gap-4",
                isSelected ? "border-gray-900 bg-gray-50" : "border-gray-100 bg-white hover:border-gray-200"
              )}
              onClick={() => toggleItem(item.id, remainingQty)}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={cn(
                  "w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors",
                  isSelected ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300"
                )}>
                  {isSelected && <CheckCircle2 size={14} />}
                </div>
                <div className="flex-1 min-w-0 mr-1">
                  <div className="font-bold text-gray-900 leading-snug wrap-break-word">{item.name}</div>
                  <div className="text-xs sm:text-sm text-gray-500">{formatCurrency(item.unitPrice)} / ud</div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                 {/* Stepper si hay múltiples unidades disponibles */}
                 {remainingQty > 1 ? (
                   <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-0.5 sm:p-1">
                     <button 
                       className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded hover:bg-gray-100 font-bold"
                       onClick={() => updateSelection(item.id, -1, remainingQty)}
                     >
                       -
                     </button>
                     <span className="w-4 text-center font-medium text-sm sm:text-base">{selectedQty}</span>
                     <button 
                       className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded hover:bg-gray-100 font-bold"
                       onClick={() => updateSelection(item.id, 1, remainingQty)}
                     >
                       +
                     </button>
                   </div>
                 ) : (
                   <div className="font-medium px-2">
                     {selectedQty}/{remainingQty}
                   </div>
                 )}
                 <div className="font-bold w-16 sm:w-20 text-right text-sm sm:text-base">
                   {formatCurrency(selectedQty * item.unitPrice)}
                 </div>
              </div>
            </div>
          );
        })}

        {/* Sección de Productos Completamente Pagados */}
        {order.items.some(item => (itemStatus.get(item.id) || 0) < item.qty) && (
           <div className="pt-6">
             <div className="text-sm font-bold text-emerald-600 px-1 mb-3 uppercase tracking-wide flex items-center gap-2">
                <Check size={16} /> Productos Pagados
             </div>
             <div className="space-y-2 opacity-70">
                {order.items.map(item => {
                  const remainingQty = itemStatus.get(item.id) || 0;
                  const paidQty = item.qty - remainingQty;
                  
                  if (paidQty <= 0) return null; // Solo mostrar si hay algo pagado

                  return (
                    <div key={`paid-${item.id}`} className="flex items-center justify-between p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                       <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-200">
                             <Check size={12} />
                          </div>
                          <div>
                             <div className="font-medium text-gray-700 line-through decoration-emerald-500/50">{item.name}</div>
                             <div className="text-xs text-emerald-600 font-medium">{paidQty} pagados</div>
                          </div>
                       </div>
                       <div className="font-bold text-emerald-700">
                          {formatCurrency(paidQty * item.unitPrice)}
                       </div>
                    </div>
                  );
                })}
             </div>
           </div>
        )}
        
        {Array.from(itemStatus.values()).every(q => q === 0) && (
          <div className="text-center p-8 text-gray-500">
            Todos los productos han sido pagados.
          </div>
        )}
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded-xl flex flex-col gap-3 mb-4">
        {/* Resumen Global para móvil */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-3">
           <div className="flex flex-col">
             <span className="text-xs text-gray-500 font-medium uppercase">Subtotal Cuenta</span>
             <span className="text-sm font-bold text-gray-600">{formatCurrency(totalOrder)}</span>
           </div>
           <div className="flex flex-col items-end">
             <span className="text-xs text-gray-500 font-medium uppercase">Falta por pagar</span>
             <span className="text-sm font-bold text-orange-600">{formatCurrency(totalRemaining)}</span>
           </div>
        </div>

        <div className="flex justify-between items-center pt-1">
           <span className="font-medium text-gray-900 uppercase text-sm">Total seleccionado</span>
           <span className="text-3xl font-bold text-gray-900">{formatCurrency(selectedTotal)}</span>
        </div>
      </div>

      <PaymentActions 
        amount={selectedTotal}
        onPayCash={() => handlePayment('cash')} 
        onPayCard={() => handlePayment('card')}
        disabled={selectedTotal <= 0}
      />
    </div>
  );
};
