import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Keypad } from '../../ui/Keypad';

interface CustomNumberInputProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (num: number) => void;
  title: string;
}

export const CustomNumberInput: React.FC<CustomNumberInputProps> = ({ isOpen, onClose, onConfirm, title }) => {
  const [value, setValue] = useState('');

  if (!isOpen) return null;

  const handleKeyPress = (key: string) => {
    // Evitar decimales si es para contar personas
    if (key === '.') return;
    setValue(prev => {
        // Limitar a 2 dígitos para número de personas (max 99)
        if (prev.length >= 2) return prev;
        return prev + key;
    });
  };

  const handleDelete = () => {
    setValue(prev => prev.slice(0, -1));
  };

  const handleConfirm = () => {
    const num = parseInt(value, 10);
    if (num > 0) {
      onConfirm(num);
      setValue('');
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col animate-in fade-in duration-200">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="font-bold text-lg text-gray-900">{title}</h3>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
          <X size={24} />
        </button>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-6xl font-bold text-gray-900 mb-8 w-full text-center h-20 flex items-center justify-center border-b-2 border-gray-100">
           {value || <span className="text-gray-300">0</span>}
        </div>

        <div className="w-full max-w-[320px]">
           <Keypad onKeyPress={handleKeyPress} onDelete={handleDelete} hideDecimal />
        </div>
        
        <button
          onClick={handleConfirm}
          disabled={!value || parseInt(value, 10) === 0}
          className="w-full max-w-[320px] mt-8 py-4 bg-gray-900 text-white rounded-xl font-bold text-lg shadow-lg shadow-gray-900/10 hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Check size={24} />
          Confirmar
        </button>
      </div>
    </div>
  );
};

