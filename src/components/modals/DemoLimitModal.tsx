import React from 'react';

interface DemoLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister: () => void;
  itemType: 'cuentas' | 'tarjetas de crédito' | 'fondos de inversión' | 'préstamos';
}

export const DemoLimitModal: React.FC<DemoLimitModalProps> = ({
  isOpen,
  onClose,
  onOpenRegister,
  itemType,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#dfe3e8] shadow-2xl relative text-center space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
        >
          ✕
        </button>

        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
          <span className="material-symbols-outlined text-32">lock_clock</span>
        </div>

        <div>
          <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full mb-1">
            Límite de Cuenta Demo
          </span>
          <h3 className="text-xl font-bold text-[#181c20]">
            Límite de 2 {itemType} alcanzado
          </h3>
          <p className="text-xs text-gray-600 mt-2 leading-relaxed">
            Estás utilizando la <strong>Cuenta Demo sin registro</strong>. Este modo está restringido a un máximo de <strong>2 {itemType}</strong> por ítem.
          </p>
        </div>

        <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-100 text-left text-xs space-y-1.5 text-blue-900">
          <div className="font-bold flex items-center gap-1.5 text-[#005bbf]">
            <span className="material-symbols-outlined text-base">verified</span>
            ¿Quieres agregar {itemType} ilimitadas?
          </div>
          <p className="text-gray-600 text-[11px]">
            Crea tu cuenta gratuita con correo electrónico para remover los límites y gestionar todas tus finanzas sin restricciones.
          </p>
        </div>

        <div className="flex gap-2.5 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
          >
            Entendido
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenRegister();
            }}
            className="flex-1 py-2.5 bg-[#005bbf] hover:bg-[#004899] text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">app_registration</span>
            Registrarme con Correo
          </button>
        </div>
      </div>
    </div>
  );
};
