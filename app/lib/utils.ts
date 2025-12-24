import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Item, Payment } from "./types";

// Utilidad para combinar clases de Tailwind de forma condicional y segura
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formateador de moneda para Euros (ES)
export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

// Calcula el total absoluto de una lista de ítems
export function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
}

// Calcula el total pagado sumando el historial de pagos
export function calculatePaid(payments: Payment[]): number {
  return payments.reduce((sum, p) => sum + p.amount, 0);
}

// Calcula cuánto queda pendiente por pagar
// Evita números negativos retornando máximo entre 0 y la resta
export function calculateRemaining(items: Item[], payments: Payment[]): number {
  const total = calculateTotal(items);
  const paid = calculatePaid(payments);
  return Math.max(0, total - paid);
}
