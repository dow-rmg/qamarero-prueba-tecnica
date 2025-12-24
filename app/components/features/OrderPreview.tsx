import React from 'react';
import { useRouter } from 'next/navigation';
import { Order } from '../../lib/types';
import { formatCurrency, calculateTotal, calculatePaid } from '../../lib/utils';
import { Receipt, PlusCircle, ChefHat, Printer, ChevronLeft } from 'lucide-react';

interface OrderPreviewProps {
  order: Order;
  onClose?: () => void; // Para cerrar el modal en móvil
}

export const OrderPreview: React.FC<OrderPreviewProps> = ({ order, onClose }) => {
  const router = useRouter();
  const total = calculateTotal(order.items);
  const paid = calculatePaid(order.payments);
  const remaining = total - paid;

  return (
    <div className="flex flex-col h-full bg-white lg:border-l border-gray-100">
      {/* Header del pedido: Nombre mesa, camarero, hora */}
      <div className="p-6 border-b border-gray-100 bg-gray-50/50">
        <div className="flex justify-between items-start mb-2">
           <div className="flex items-center gap-2">
             {onClose && (
               <button onClick={onClose} className="lg:hidden p-1 -ml-2 text-gray-500 hover:text-gray-900">
                 <ChevronLeft size={24} />
               </button>
             )}
             <h2 className="text-xl font-bold text-gray-900">{order.tableName}</h2>
           </div>
           <div className="text-right">
             <div className="text-2xl font-bold text-gray-900">{formatCurrency(remaining)}</div>
           </div>
        </div>
        <div className="flex justify-between items-center text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <ChefHat size={16} />
            <span>{order.server}</span>
            <span>•</span>
            <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          {paid > 0 && (
             <div className="text-xs text-green-600 font-medium">Pagado: {formatCurrency(paid)}</div>
          )}
        </div>
      </div>

      {/* Lista de productos pedidos */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between items-start p-3 hover:bg-gray-100 rounded-lg transition-colors group">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded text-xs font-medium text-gray-600 group-hover:bg-gray-200">
                {item.qty}
              </div>
              <div>
                <div className="font-medium text-gray-900">{item.name}</div>
                {item.notes && (
                  <div className="text-xs text-gray-500 mt-0.5">{item.notes}</div>
                )}
              </div>
            </div>
            <div className="font-medium text-gray-900 tabular-nums">
              {formatCurrency(item.unitPrice * item.qty)}
            </div>
          </div>
        ))}
      </div>

      {/* Botones de Acción */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50 space-y-3">
        {/* Botones secundarios */}
        <div className="flex gap-3">
          <button 
            className="flex-1 py-3 px-4 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-[0.98] transition-all"
          >
            <PlusCircle size={20} />
            Nueva comanda
          </button>
          <button 
            className="w-14 flex-none py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-[0.98] transition-all"
            aria-label="Imprimir ticket"
          >
            <Printer size={20} />
          </button>
        </div>

        {/* Botón principal para ir a Pagar */}
        <button
          onClick={() => router.push(`/payment/${order.tableId}`)}
          className="w-full py-4 px-4 rounded-xl bg-gray-900 text-white font-bold text-lg shadow-lg shadow-gray-900/10 hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Receipt size={24} />
          Pagar cuenta
        </button>
      </div>
    </div>
  );
};
