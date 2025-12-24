import React from 'react';
import { Delete } from 'lucide-react';

interface KeypadProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  onClear?: () => void;
  hideDecimal?: boolean;
}

export const Keypad: React.FC<KeypadProps> = ({ onKeyPress, onDelete, hideDecimal = false }) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'];

  return (
    <div className="grid grid-cols-3 gap-3 w-full md:max-w-[320px] mx-auto">
      {keys.map((key) => {
        if (key === '.' && hideDecimal) return <div key={key} />; // Espacio vacío para mantener grid
        
        return (
        <button
          key={key}
          onClick={() => onKeyPress(key)}
          // Estilos de botones redondeados y grandes para fácil acceso táctil
            className="h-16 w-full rounded-2xl border-2 border-gray-100 text-2xl font-medium text-gray-900 hover:bg-gray-50 active:bg-gray-100 transition-colors bg-white shadow-sm"
        >
          {key}
        </button>
        );
      })}
      <button
        onClick={onDelete}
        // Botón de borrado diferenciado en rojo
        className="h-16 w-full rounded-2xl bg-red-50 text-red-500 hover:bg-red-100 active:bg-red-200 transition-colors flex items-center justify-center border-2 border-red-50"
      >
        <Delete size={28} />
      </button>
    </div>
  );
};
