// Definición de la estructura de una Mesa
export interface Table {
  id: string; // Identificador único de la mesa
  name: string; // Nombre visible de la mesa (ej: "Terraza Norte")
  server?: string; // Nombre del camarero asignado (opcional)
}

// Definición de un Ítem o Producto en el pedido
export interface Item {
  id: string; // Identificador único del ítem
  name: string; // Nombre del producto
  qty: number; // Cantidad pedida
  unitPrice: number; // Precio unitario
  notes?: string; // Notas de cocina (opcional)
}

// Estructura de un Pago realizado
export interface Payment {
  id: string; // ID único del pago
  amount: number; // Cantidad monetaria pagada
  method: 'cash' | 'card'; // Método de pago: efectivo o tarjeta
  timestamp: number; // Marca de tiempo del pago
  // Tipo de división usado para este pago
  type: 'full' | 'amount' | 'product' | 'person' | 'share';
  
  // Metadatos opcionales dependiendo del tipo de pago:
  itemsPaid?: string[]; // IDs de ítems pagados (para pago por producto)
  paidItems?: { itemId: string; qty: number }[]; // Estructura alternativa para ítems pagados
  personIndex?: number; // Índice de la persona (para pago por persona)
  shareCount?: number; // Número de partes pagadas (para pago por partes)
}

// Estructura principal de un Pedido (Order)
export interface Order {
  tableId: string; // ID de la mesa asociada
  tableName: string; // Nombre de la mesa (redundancia para facilitar acceso)
  server: string; // Camarero
  currency: string; // Moneda (ej: EUR)
  items: Item[]; // Lista de productos pedidos
  status: 'active' | 'payment_pending' | 'closed'; // Estado del pedido
  createdAt: number; // Fecha de creación
  payments: Payment[]; // Historial de pagos realizados
  
  // Estado persistente para sesiones de pago dividido (específicamente por partes/share)
  splitState?: {
    isActive: boolean; // Si el modo de división está activo
    type: 'share'; // Tipo de división (actualmente solo 'share' usa estado persistente complejo)
    totalShares: number; // Total de partes en las que se divide la cuenta
    remainingShares: number; // Partes que quedan por pagar
    shareAmount: number; // Cantidad fija por parte (snapshot al momento de dividir)
  };
}

// Estado global de la aplicación (para el Contexto)
export interface TableState {
  tables: Table[]; // Lista de todas las mesas
  orders: Record<string, Order>; // Diccionario de pedidos activos indexado por tableId
}
