import React from 'react';
import { Table, Order } from '../../lib/types';
import { cn, formatCurrency, calculateTotal, calculatePaid } from '../../lib/utils';

interface TableCardProps {
  table: Table;
  order?: Order;
  isSelected: boolean;
  onClick: () => void;
}

export const TableCard: React.FC<TableCardProps> = ({ table, order, isSelected, onClick }) => {
  // Determinamos si la mesa tiene actividad relevante (pedido activo y no cerrado)
  const hasOrder = !!order && order.status !== 'closed';
  
  // Cálculos de totales para mostrar resumen en la tarjeta
  const total = hasOrder ? calculateTotal(order.items) : 0;
  const paid = hasOrder ? calculatePaid(order.payments) : 0;
  const remaining = total - paid;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "relative flex flex-col items-center justify-center p-4 rounded-xl shadow-sm transition-all duration-200 border-2 aspect-square",
        // Estilos condicionales según estado (Ocupada vs Libre)
        hasOrder 
          ? "bg-gray-900 text-white border-gray-900" 
          : "bg-white text-gray-500 border-gray-100 hover:border-gray-300",
        // Estilo de selección (borde naranja)
        isSelected && "ring-4 ring-orange-500/30 border-orange-500 z-10 scale-105"
      )}
    >
      <div className="flex flex-col items-center gap-1 w-full">
        <span className="text-xs font-medium uppercase tracking-wider opacity-60">
          {table.id}
        </span>
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-center leading-tight line-clamp-2 px-1">
          {table.name}
        </h3>
        {hasOrder && (
          <div className="flex flex-col items-center">
            {/* Monto restante destacado */}
            <span className="text-xl font-mono text-orange-400 font-bold tracking-tight">
              {formatCurrency(remaining)}
            </span>
             {paid > 0 && (
              <span className="text-xs text-gray-400">
                Pagado: {formatCurrency(paid)}
              </span>
            )}
          </div>
        )}
      </div>
      
      {hasOrder && order?.server && (
        <div className="absolute bottom-3 left-0 right-0 text-center text-xs opacity-60">
          {order.server}
        </div>
      )}
    </button>
  );
};
