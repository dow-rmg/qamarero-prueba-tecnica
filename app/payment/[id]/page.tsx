'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTable } from '../../context/TableContext';
import { PaymentScreen } from '../../components/features/payment/PaymentScreen';

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { getOrder } = useTable();
  const tableId = params.id as string;
  
  // Obtenemos el estado actual del pedido del contexto
  const order = getOrder(tableId);

  // Manejo de error si la mesa no existe o se perdió el estado (f5)
  if (!order) {
    // Redirección segura al inicio si no hay datos
    if (typeof window !== 'undefined') {
       router.push('/');
    }
    return <div className="p-8 text-center">Cargando mesa...</div>;
  }

  return <PaymentScreen order={order} />;
}
