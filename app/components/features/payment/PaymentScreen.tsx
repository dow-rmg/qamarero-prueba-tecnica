import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Order, Payment } from '../../../lib/types';
import { useTable } from '../../../context/TableContext';
import { PaymentSummary } from './PaymentSummary';
import { PayAllMode } from './PayAllMode';
import { PayByPersonMode } from './PayByPersonMode';
import { PayByProductMode } from './PayByProductMode';
import { PayByShareMode } from './PayByShareMode';
import { cn } from '../../../lib/utils';
import { ChevronLeft } from 'lucide-react';

interface PaymentScreenProps {
  order: Order;
}

type Tab = 'full' | 'person' | 'product' | 'share';

// Componente principal de la pantalla de pagos
// Orquesta los diferentes modos de pago y la navegación
export const PaymentScreen: React.FC<PaymentScreenProps> = ({ order }) => {
  const router = useRouter();
  const { addPayment } = useTable();
  const [activeTab, setActiveTab] = useState<Tab>('full');

  // Efecto para redirigir tras cerrar la mesa
  useEffect(() => {
    if (order.status === 'closed') {
      const timer = setTimeout(() => {
        router.push('/');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [order.status, router]);

  // Manejador unificado de pagos que delega al contexto
  const handlePayment = (amount: number, method: 'cash' | 'card', extra?: Partial<Payment>) => {
    addPayment(order.tableId, {
      amount,
      method,
      type: activeTab === 'full' ? 'full' : activeTab === 'person' ? 'person' : activeTab === 'product' ? 'product' : 'share',
      ...extra
    });
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'full', label: 'Pagar todo' },
    { id: 'person', label: 'Por persona' },
    { id: 'product', label: 'Por producto' },
    { id: 'share', label: 'Por partes' },
  ];

  // Lógica de "Volver" con seguridad
  const handleBack = () => {
    const total = order.items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
    const paid = order.payments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = total - paid;

    // Si hay deuda pendiente, avisar al usuario antes de salir
    if (remaining > 0 && remaining < total) {
      if (window.confirm('La cuenta no está pagada completamente. ¿Deseas guardar el progreso y salir?')) {
        router.push('/');
      }
    } else {
      router.push('/');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100 overflow-hidden">
      {/* Header móvil (solo visible en pantallas pequeñas) */}
      <div className="lg:hidden bg-white p-4 border-b flex items-center gap-3">
        <button onClick={handleBack} className="p-2 -ml-2">
          <ChevronLeft />
        </button>
        <span className="font-bold">Mesa {order.tableName}</span>
      </div>

      {/* Panel Izquierdo (Resumen) - Oculto en móvil, visible en tablet/desktop */}
      <div className="hidden lg:block w-[400px] p-6 h-full">
        <div className="mb-4">
           <button 
             onClick={handleBack}
             className="flex items-center gap-2 text-gray-500 font-medium hover:text-gray-900 transition-colors"
           >
             <ChevronLeft size={20} />
             Volver a mesas
           </button>
        </div>
        <PaymentSummary order={order} className="h-[calc(100%-3rem)]" />
      </div>

      {/* Panel Derecho (Interacción y Modos de Pago) */}
      <div className="flex-1 flex flex-col min-w-0 bg-white lg:m-6 lg:rounded-3xl lg:shadow-xl overflow-hidden border-l border-gray-100 lg:border-none">
        {/* Navegación por pestañas (Tabs) */}
        <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 py-4 px-2 text-center font-bold text-xs sm:text-sm uppercase tracking-wide transition-all whitespace-nowrap min-w-fit sm:min-w-[120px]",
                activeTab === tab.id 
                  ? "bg-gray-900 text-white" 
                  : "bg-white text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Área de contenido dinámico según el modo seleccionado */}
        <div className="flex-1 p-4 lg:p-8 overflow-hidden relative">
          <div className="h-full w-full max-w-3xl mx-auto">
            {activeTab === 'full' && (
              <PayAllMode 
                order={order} 
                onPayment={(amt, method) => handlePayment(amt, method)} 
              />
            )}
            {activeTab === 'person' && (
              <PayByPersonMode 
                order={order} 
                onPayment={(amt, method) => handlePayment(amt, method)} 
              />
            )}
            {activeTab === 'product' && (
              <PayByProductMode 
                order={order} 
                onPayment={(amt, method, items) => handlePayment(amt, method, { itemsPaid: items })} 
              />
            )}
            {activeTab === 'share' && (
              <PayByShareMode 
                order={order} 
                onPayment={(amt, method, shares) => handlePayment(amt, method, { shareCount: shares })} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
