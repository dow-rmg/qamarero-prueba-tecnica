# Prueba Técnica Qamarero - División de Cuentas

Este proyecto es una prueba técnica desarrollada para **Qamarero**. El objetivo principal es implementar una solución de interfaz para TPV que permita dividir cuentas de restaurantes de forma eficiente entre varios comensales.

## Descripción del Proyecto

La aplicación simula un entorno de TPV donde se gestionan mesas y pedidos. La funcionalidad central se enfoca en las diferentes estrategias para dividir y saldar una cuenta, con especial atención a la experiencia de usuario en dispositivos móviles.

### 🚀 Demo en Vivo

Puedes probar la aplicación directamente en: **[https://qamarero-prueba-tecnica.vercel.app/](https://qamarero-prueba-tecnica.vercel.app/)**

### Funcionalidades Implementadas

#### 1. Gestión de Mesas
- Visualización del estado de las mesas (Libre/Ocupada).
- Acceso al detalle del pedido de cada mesa.
- Gestión visual de mesas cerradas tras completar el pago (liberación automática).

#### 2. Modalidades de Pago y División
Se han implementado 4 lógicas distintas para dividir la cuenta:

- **Pagar Todo**: Pago del importe total o parcial. Incluye visualización de **historial de pagos** y control de deuda restante.
- **Por Persona**: División equitativa. Soporta selección rápida o **entrada numérica personalizada** para grupos grandes. Muestra desglose de cuotas y estado de pagos ya realizados.
- **Por Producto**: Selección manual de ítems. Incluye **lógica de bloqueo** si ya existen pagos genéricos previos para asegurar la consistencia contable, y visualización separada de productos ya saldados.
- **Por Partes**: Sistema de división flexible (participaciones). Permite definir un número arbitrario de partes y realizar pagos parciales acumulativos con seguimiento de estado en tiempo real.

#### 3. Experiencia de Usuario (UX)
- **Simulación de Datáfono**: Pantalla de transición "Procesando pago" al seleccionar tarjeta.
- **Interfaz Mobile-First**: Adaptación completa de tablas, teclados numéricos y banners informativos para maximizar el espacio en pantallas pequeñas.
- **Inputs Avanzados**: Teclados personalizados para importes y número de comensales.

## Stack Tecnológico

- **Framework**: Next.js (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Estado**: React Context API

## Estructura del Proyecto

La estructura sigue los patrones estándar de Next.js con App Router:

```
qamarero/
├── app/
│   ├── components/
│   │   ├── features/
│   │   │   ├── payment/       # Lógica de los modos de pago
│   │   │   │   ├── PayAllMode.tsx
│   │   │   │   ├── PayByPersonMode.tsx
│   │   │   │   ├── PayByProductMode.tsx
│   │   │   │   ├── PayByShareMode.tsx
│   │   │   │   ├── ProcessingPayment.tsx  # Simulación de cobro
│   │   │   │   ├── CustomNumberInput.tsx  # Input numérico avanzado
│   │   │   │   └── ...
│   │   │   ├── OrderPreview.tsx
│   │   │   └── TableCard.tsx
│   │   └── ui/                # Componentes de interfaz reutilizables
│   ├── context/               # Lógica de estado y negocio (TableContext)
│   ├── lib/                   # Tipos y funciones auxiliares
│   └── page.tsx               # Vista principal de mesas
└── ...
```

## Ejecución

1.  Instalar dependencias:
    ```bash
    npm install
    ```

2.  Iniciar servidor de desarrollo:
    ```bash
    npm run dev
    ```

3.  Acceder a `http://localhost:3000`.

## Consideraciones

- **Persistencia**: El estado de la aplicación es volátil (en memoria) y se reinicia al recargar la página, restaurando los datos iniciales de `pedido.json`.
- **Adaptabilidad**: La interfaz es totalmente responsiva, con optimizaciones específicas para evitar elementos cortados o deformados en resoluciones móviles.
