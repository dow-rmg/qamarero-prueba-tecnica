import React from 'react';
import { Order } from '../../../lib/types';
import { cn, formatCurrency, calculateTotal, calculatePaid } from '../../../lib/utils';

interface PaymentSummaryProps {
  order: Order;
  className?: string;
}

// Resumen lateral del pedido que se muestra en pantallas grandes durante el pago
export const PaymentSummary: React.FC<PaymentSummaryProps> = ({ order, className }) => {
  const total = calculateTotal(order.items);
  const paid = calculatePaid(order.payments);
  const remaining = total - paid;

  return (
    <div className={cn("flex flex-col h-full bg-white p-6 rounded-2xl shadow-sm border border-gray-100", className)}>
      {/* Cabecera del resumen */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Cuenta {order.tableName}</h2>
        <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
          {order.items.length} productos
        </span>
      </div>

      {/* Lista scrolleable de productos */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm group">
            <div className="flex gap-3">
              <span className="font-medium text-gray-500 w-6">{item.qty}</span>
              <span className="text-gray-900">{item.name}</span>
            </div>
            <span className="font-medium text-gray-900">{formatCurrency(item.unitPrice * item.qty)}</span>
          </div>
        ))}
      </div>

      {/* Footer con totales financieros */}
      <div className="mt-6 pt-6 border-t border-dashed border-gray-200 space-y-3">
        <div className="flex justify-between text-gray-500">
          <span>Subtotal</span>
          <span>{formatCurrency(total)}</span>
        </div>
        {paid > 0 && (
          <div className="flex justify-between text-green-600 font-medium">
            <span>Pagado</span>
            <span>- {formatCurrency(paid)}</span>
          </div>
        )}
        <div className="flex justify-between items-end pt-2">
          <span className="text-lg font-bold text-gray-900">Total</span>
          <span className="text-3xl font-bold text-gray-900">{formatCurrency(remaining)}</span>
        </div>
      </div>
    </div>
  );
};
