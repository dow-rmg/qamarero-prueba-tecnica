'use client';

import React, { createContext, useContext, useState } from 'react';
import { Order, Payment, Table } from '../lib/types';
import { MOCK_TABLES, INITIAL_ORDER } from '../lib/data';

// Definición de las funciones y datos expuestos por el contexto
interface TableContextType {
  tables: Table[]; // Lista de mesas
  orders: Record<string, Order>; // Pedidos activos
  activeTableId: string | null; // ID de la mesa seleccionada actualmente
  addPayment: (tableId: string, payment: Omit<Payment, 'id' | 'timestamp'>) => void; // Función para registrar un pago
  startShareSplit: (tableId: string, totalShares: number) => void; // Función para iniciar modo "Por Partes"
  closeTable: (tableId: string) => void; // Cierra la mesa manualmente
  resetApp: () => void; // Reinicia el estado a los valores por defecto
  getOrder: (tableId: string) => Order | undefined; // Obtiene el pedido de una mesa
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export function TableProvider({ children }: { children: React.ReactNode }) {
  const [tables] = useState<Table[]>(MOCK_TABLES);
  // Inicializamos directamente con los datos por defecto para evitar re-renders innecesarios al montar
  const [orders, setOrders] = useState<Record<string, Order>>({
    [INITIAL_ORDER.tableId]: { ...INITIAL_ORDER, payments: [] }
  });

  // Restaura el estado de la aplicación usando los datos mockeados iniciales
  const resetApp = () => {
    setOrders({
      [INITIAL_ORDER.tableId]: { ...INITIAL_ORDER, payments: [] }
    });
  };

  // Inicia la lógica de división por partes (setup inicial de cuántas partes son)
  const startShareSplit = (tableId: string, totalShares: number) => {
    setOrders(prev => {
      const order = prev[tableId];
      if (!order) return prev;

      // Calculamos cuánto vale cada parte basándonos en lo que queda por pagar en ESE momento
      const total = order.items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
      const paid = order.payments.reduce((sum, p) => sum + p.amount, 0);
      const remaining = total - paid;
      const shareAmount = remaining / totalShares;

      return {
        ...prev,
        [tableId]: {
          ...order,
          splitState: {
            isActive: true,
            type: 'share',
            totalShares,
            remainingShares: totalShares, // Al principio quedan todas las partes
            shareAmount
          }
        }
      };
    });
  };

  // Lógica central para procesar un pago
  const addPayment = (tableId: string, paymentData: Omit<Payment, 'id' | 'timestamp'>) => {
    setOrders(prev => {
      const order = prev[tableId];
      if (!order) return prev;

      const newPayment: Payment = {
        ...paymentData,
        id: Math.random().toString(36).substr(2, 9), // ID simple
        timestamp: Date.now(),
      };

      const updatedPayments = [...order.payments, newPayment];
      
      // Recalcular estado de la cuenta
      const total = order.items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
      const paid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
      
      // Determinar si la mesa debe cerrarse o quedar pendiente
      let newStatus = order.status;
      if (paid >= total - 0.01) { // Tolerancia a flotantes
        newStatus = 'closed';
      } else if (updatedPayments.length > 0) {
        newStatus = 'payment_pending';
      }

      // Actualizar lógica del estado de "Por Partes" si aplica
      let newSplitState = order.splitState;
      if (paymentData.type === 'share' && order.splitState && order.splitState.isActive) {
        const sharesPaid = paymentData.shareCount || 0;
        const remaining = order.splitState.remainingShares - sharesPaid;
        
        // Si no quedan partes o la mesa se cierra, limpiamos el estado split
        if (remaining <= 0 || newStatus === 'closed') {
          newSplitState = undefined; 
        } else {
          newSplitState = {
            ...order.splitState,
            remainingShares: remaining
          };
        }
      }

      // Si se pagó todo por cualquier otro método, limpiar estado split
      if (newStatus === 'closed') {
        newSplitState = undefined;
      }

      return {
        ...prev,
        [tableId]: {
          ...order,
          payments: updatedPayments,
          status: newStatus,
          splitState: newSplitState
        },
      };
    });
  };

  const closeTable = (tableId: string) => {
    setOrders(prev => {
      const order = prev[tableId];
      if (!order) return prev;
      return {
        ...prev,
        [tableId]: { ...order, status: 'closed' }
      };
    });
  };

  const getOrder = (tableId: string) => orders[tableId];

  return (
    <TableContext.Provider value={{ 
      tables, 
      orders, 
      activeTableId: null, 
      addPayment, 
      startShareSplit,
      closeTable,
      resetApp,
      getOrder
    }}>
      {children}
    </TableContext.Provider>
  );
}

// Hook personalizado para usar el contexto
export function useTable() {
  const context = useContext(TableContext);
  if (context === undefined) {
    throw new Error('useTable must be used within a TableProvider');
  }
  return context;
}
