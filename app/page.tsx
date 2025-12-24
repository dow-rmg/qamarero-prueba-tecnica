'use client';

import { useState } from 'react';
import { useTable } from './context/TableContext';
import { TableCard } from './components/features/TableCard';
import { OrderPreview } from './components/features/OrderPreview';
import { LayoutGrid, UtensilsCrossed, ChevronLeft, PlusCircle } from 'lucide-react';

export default function TablesPage() {
  const { tables, orders } = useTable();
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  const selectedOrder = selectedTableId ? orders[selectedTableId] : null;
  const selectedTable = selectedTableId ? tables.find(t => t.id === selectedTableId) : null;
  
  // Solo mostramos el pedido si NO está cerrado
  const activeOrder = selectedOrder && selectedOrder.status !== 'closed' ? selectedOrder : null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Contenido Principal - Grid de Mesas */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Cabecera de la sección */}
        <header className="px-6 py-4 bg-white border-b border-gray-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
              <LayoutGrid size={24} />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Salón Principal</h1>
          </div>
          <div className="flex gap-2">
             {/* Leyenda de estados */}
             <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="w-3 h-3 rounded-full bg-white border border-gray-300"></span> Libre
                <span className="w-3 h-3 rounded-full bg-gray-900"></span> Ocupada
             </div>
          </div>
        </header>

        {/* Grid Responsive de Mesas */}
        <main 
          className="flex-1 overflow-y-auto p-6"
          onClick={() => setSelectedTableId(null)}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {tables.map(table => (
              <TableCard
                key={table.id}
                table={table}
                order={orders[table.id]}
                isSelected={selectedTableId === table.id}
                onClick={() => setSelectedTableId(table.id)}
              />
            ))}
          </div>
        </main>
      </div>

      {/* Panel Lateral Derecho - Vista Previa del Pedido */}
      {/* Comportamiento: Drawer flotante en móvil, Columna fija en desktop */}
      <div className={`
        fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-20
        ${selectedTableId ? 'translate-x-0' : 'translate-x-full'}
        lg:relative lg:transform-none lg:w-[400px] lg:border-l lg:border-gray-100 lg:shadow-none lg:block
        ${!selectedTableId && 'lg:hidden'} 
      `}>
        {activeOrder ? (
          <div className="h-full bg-gray-50 flex flex-col">
             {/* Contenedor del OrderPreview que ocupa todo el alto restante */}
             <div className="flex-1 overflow-hidden">
                <OrderPreview 
                  order={activeOrder} 
                  onClose={() => setSelectedTableId(null)} 
                />
             </div>
          </div>
        ) : (
          // Estado vacío
          <div className="flex flex-col h-full bg-white lg:bg-white">
             {/* Cabecera para mesas vacías */}
             {selectedTableId && (
               <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                 <button onClick={() => setSelectedTableId(null)} className="lg:hidden p-1 -ml-2 text-gray-500 hover:text-gray-900">
                   <ChevronLeft size={24} />
                 </button>
                 <div>
                   <h2 className="text-xl font-bold text-gray-900">{selectedTable?.name}</h2>
                   <div className="text-sm text-gray-500">Mesa libre</div>
                 </div>
               </div>
             )}
             
             <div className="flex-1 flex items-center justify-center text-gray-400 flex-col gap-4 p-8 text-center">
                <div className="p-6 bg-gray-100 rounded-full">
                  <UtensilsCrossed size={48} className="opacity-50" />
                </div>
                <p className="text-lg font-medium">
                  {selectedTableId ? 'Esta mesa está libre' : 'Selecciona una mesa para ver el pedido'}
                </p>
                
                {selectedTableId && (
                   <button 
                     className="mt-2 px-8 py-4 rounded-xl bg-gray-900 text-white font-bold text-lg shadow-lg shadow-gray-900/10 hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center gap-2"
                   >
                     <PlusCircle size={24} />
                     Nueva comanda
                   </button>
                )}
             </div>
          </div>
        )}
      </div>
      
      {/* Overlay oscuro para fondo cuando el drawer móvil está abierto */}
      {selectedTableId && (
        <div 
          className="fixed inset-0 bg-black/20 z-10 lg:hidden"
          onClick={() => setSelectedTableId(null)}
        />
      )}
    </div>
  );
}
