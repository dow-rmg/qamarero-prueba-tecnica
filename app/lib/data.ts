import { Order, Table } from './types';

// Datos de ejemplo basados en el JSON proporcionado
const pedidoData = {
    "table": {
        "id": "MESA-18",
        "name": "Terraza Norte",
        "server": "Lucía"
    },
    "currency": "EUR",
    "items": [
        {
            "id": "I1",
            "name": "Entrante - Pan con tomate",
            "qty": 2,
            "unitPrice": 4.00,
            "notes": "Compartido para la mesa"
        },
        {
            "id": "I2",
            "name": "Jamón ibérico",
            "qty": 1,
            "unitPrice": 18.50,
            "notes": "Ración completa"
        },
        {
            "id": "I3",
            "name": "Pizza Prosciutto e Funghi",
            "qty": 1,
            "unitPrice": 12.50
        },
        {
            "id": "I4",
            "name": "Pasta Pesto Genovese",
            "qty": 1,
            "unitPrice": 13.00
        },
        {
            "id": "I5",
            "name": "Ensalada Caprese",
            "qty": 1,
            "unitPrice": 10.50
        },
        {
            "id": "I6",
            "name": "Risotto de setas",
            "qty": 1,
            "unitPrice": 14.50
        },
        {
            "id": "I7",
            "name": "Agua con gas 1L",
            "qty": 2,
            "unitPrice": 3.00
        },
        {
            "id": "I8",
            "name": "Cerveza artesanal IPA",
            "qty": 3,
            "unitPrice": 4.80
        },
        {
            "id": "I9",
            "name": "Copa de vino tinto Rioja",
            "qty": 3,
            "unitPrice": 5.50
        },
        {
            "id": "I10",
            "name": "Tiramisú",
            "qty": 2,
            "unitPrice": 6.00
        },
        {
            "id": "I11",
            "name": "Helado de pistacho",
            "qty": 1,
            "unitPrice": 5.50
        },
        {
            "id": "I12",
            "name": "Café espresso",
            "qty": 4,
            "unitPrice": 2.20
        }
    ]
};

// Generar mesas de ejemplo para el mapa del salón
export const MOCK_TABLES: Table[] = [
    { id: 'MESA-18', name: 'Terraza Norte', server: 'Lucía' }, // La mesa activa del ejemplo
    { id: 'MESA-1', name: 'Barra 1' },
    { id: 'MESA-2', name: 'Barra 2' },
    { id: 'MESA-3', name: 'Salón 1' },
    { id: 'MESA-4', name: 'Salón 2' },
    { id: 'MESA-6', name: 'Terraza Sur' },
];

// Estado inicial del pedido basado en los datos de ejemplo
export const INITIAL_ORDER: Order = {
    tableId: pedidoData.table.id,
    tableName: pedidoData.table.name,
    server: pedidoData.table.server,
    currency: pedidoData.currency,
    items: pedidoData.items,
    status: 'active',
    createdAt: Date.now(),
    payments: []
};
