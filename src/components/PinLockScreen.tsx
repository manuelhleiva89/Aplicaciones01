import React, { useState, useEffect } from 'react';
import { AppLogo } from './AppLogo';

interface PinLockScreenProps {
  isLocked: boolean;
  onUnlock: () => void;
  savedPin: string;
  userEmail?: string;
}

export const PinLockScreen: React.FC<PinLockScreenProps> = ({
  isLocked,
  onUnlock,
  savedPin,
  userEmail,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  useEffect(() => {
    if (!isLocked) {
      setPinInput('');
      setErrorMsg('');
    }
  }, [isLocked]);

  // Physical keyboard support
  useEffect(() => {
    if (!isLocked) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        if (pinInput.length < 6) {
          handleKeyPress(e.key);
        }
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Enter') {
        handleVerify(pinInput);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, pinInput, savedPin]);

  if (!isLocked) return null;

  const handleKeyPress = (num: string) => {
    setErrorMsg('');
    if (pinInput.length < 6) {
      const nextPin = pinInput + num;
      setPinInput(nextPin);
      if (nextPin.length === 4 || nextPin.length === 6) {
        handleVerify(nextPin);
      }
    }
  };

  const handleDelete = () => {
    setErrorMsg('');
    setPinInput((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setErrorMsg('');
    setPinInput('');
  };

  const handleVerify = (codeToVerify: string) => {
    const targetPin = savedPin || '1234';
    if (codeToVerify === targetPin) {
      setErrorMsg('');
      onUnlock();
    } else {
      if (codeToVerify.length >= 4) {
        setIsShaking(true);
        setErrorMsg('PIN o Contraseña incorrecta. Intenta de nuevo.');
        setTimeout(() => setIsShaking(false), 500);
        setTimeout(() => setPinInput(''), 400);
      }
    }
  };

  const handleResetToDefault = () => {
    localStorage.setItem('fintrack_pin', '1234');
    setShowForgotModal(false);
    setErrorMsg('El PIN se ha restablecido al valor inicial: 1234');
    setPinInput('');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-4 text-white select-none animate-fadeIn">
      <div className="max-w-sm w-full mx-auto text-center space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center">
          <AppLogo size="xl" textColor="text-white" />
          <p className="text-xs text-slate-400 mt-2">Protección de Seguridad y Finanzas</p>
        </div>

        {/* Lock Title & Instructions */}
        <div>
          <h3 className="text-lg font-bold text-slate-100">Aplicación Bloqueada</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Ingresa tu PIN de seguridad para acceder
          </p>
        </div>

        {/* PIN Indicators */}
        <div className={`flex justify-center items-center gap-3 py-2 ${isShaking ? 'animate-bounce text-red-400' : ''}`}>
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pinInput.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 border ${
                  isFilled
                    ? 'bg-blue-500 border-blue-400 scale-110 shadow-md shadow-blue-500/50'
                    : 'bg-slate-800/80 border-slate-700'
                }`}
              />
            );
          })}
        </div>

        {/* Error Message */}
        {errorMsg ? (
          <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs font-semibold animate-fadeIn">
            {errorMsg}
          </div>
        ) : (
          <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-300 text-[11px]">
            📌 PIN predeterminado: <strong className="text-white font-mono">1234</strong>
          </div>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto pt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num)}
              className="w-16 h-16 rounded-2xl bg-slate-800/80 hover:bg-slate-700/90 active:scale-95 text-xl font-bold font-mono transition-all border border-slate-700/60 shadow-sm flex items-center justify-center cursor-pointer text-white"
            >
              {num}
            </button>
          ))}

          <button
            type="button"
            onClick={handleClear}
            className="w-16 h-16 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-xs font-semibold text-slate-400 transition-all border border-slate-800 flex items-center justify-center cursor-pointer"
            title="Limpiar"
          >
            C
          </button>

          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="w-16 h-16 rounded-2xl bg-slate-800/80 hover:bg-slate-700/90 active:scale-95 text-xl font-bold font-mono transition-all border border-slate-700/60 shadow-sm flex items-center justify-center cursor-pointer text-white"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="w-16 h-16 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-slate-300 transition-all border border-slate-800 flex items-center justify-center cursor-pointer"
            title="Borrar"
          >
            <span className="material-symbols-outlined text-xl">backspace</span>
          </button>
        </div>

        {/* Footer Actions */}
        <div className="pt-3">
          <button
            onClick={() => setShowForgotModal(true)}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium underline cursor-pointer"
          >
            ¿Olvidaste tu PIN de seguridad?
          </button>
        </div>
      </div>

      {/* Forgot PIN Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[110]">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/30">
              <span className="material-symbols-outlined text-28">lock_reset</span>
            </div>

            <h3 className="text-lg font-bold text-white">Restablecer PIN de Seguridad</h3>
            <p className="text-xs text-slate-300">
              ¿Deseas restablecer el PIN de seguridad de la aplicación al valor inicial por defecto (<strong>1234</strong>)?
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowForgotModal(false)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleResetToDefault}
                className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
              >
                Restablecer a 1234
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
