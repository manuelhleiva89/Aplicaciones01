import React, { useState } from 'react';

interface ChangePinModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPin: string;
  onSavePin: (newPin: string) => void;
}

export const ChangePinModal: React.FC<ChangePinModalProps> = ({
  isOpen,
  onClose,
  currentPin,
  onSavePin,
}) => {
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Check old PIN if configured
    if (currentPin && oldPin !== currentPin) {
      setErrorMsg('El PIN actual es incorrecto.');
      return;
    }

    if (newPin.length < 4) {
      setErrorMsg('El nuevo PIN debe tener al menos 4 dígitos.');
      return;
    }

    if (newPin !== confirmPin) {
      setErrorMsg('Los nuevos PINs no coinciden.');
      return;
    }

    onSavePin(newPin);
    setSuccessMsg('¡PIN actualizado correctamente!');
    setTimeout(() => {
      onClose();
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      setSuccessMsg('');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#dfe3e8] shadow-2xl relative space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
          <div className="w-10 h-10 bg-blue-50 text-[#005bbf] rounded-2xl flex items-center justify-center border border-blue-100">
            <span className="material-symbols-outlined text-24">pin</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#181c20]">Cambiar PIN de Seguridad</h3>
            <p className="text-xs text-gray-500">Configura un código numérico para proteger el acceso a la app.</p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-2.5 bg-red-50 text-[#b81d17] border border-red-200 rounded-xl text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-[#414754] mb-1">
              PIN Actual (por defecto: 1234)
            </label>
            <input
              type="password"
              maxLength={6}
              required
              value={oldPin}
              onChange={(e) => setOldPin(e.target.value)}
              placeholder="••••"
              className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#005bbf]/30 font-mono text-center tracking-widest text-base"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#414754] mb-1">Nuevo PIN de 4 dígitos</label>
            <input
              type="password"
              maxLength={6}
              required
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="••••"
              className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#005bbf]/30 font-mono text-center tracking-widest text-base"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#414754] mb-1">Confirmar Nuevo PIN</label>
            <input
              type="password"
              maxLength={6}
              required
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              placeholder="••••"
              className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#005bbf]/30 font-mono text-center tracking-widest text-base"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#005bbf] hover:bg-[#004899] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Guardar Nuevo PIN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
