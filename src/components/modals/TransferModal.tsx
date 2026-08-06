import React, { useState } from 'react';
import { Account, Transaction } from '../../types';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  onExecuteTransfer: (
    fromAccId: string,
    toAccId: string,
    amount: number,
    notes?: string
  ) => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  accounts,
  onExecuteTransfer,
}) => {
  if (!isOpen) return null;

  const [fromAccId, setFromAccId] = useState(accounts[0]?.id || '');
  const [toAccId, setToAccId] = useState(accounts[1]?.id || accounts[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (fromAccId === toAccId) {
      setErrorMsg('La cuenta de origen y destino deben ser distintas.');
      return;
    }

    const val = parseFloat(amount);
    if (!val || val <= 0) {
      setErrorMsg('Introduce un monto válido mayor a 0.');
      return;
    }

    onExecuteTransfer(fromAccId, toAccId, val, notes);
    setAmount('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#dfe3e8] shadow-2xl space-y-4 my-auto max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-[#dfe3e8]/60 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#005bbf] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-xl">swap_horiz</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#181c20]">Transferir Fondos</h3>
              <p className="text-xs text-[#414754]">Mueve dinero entre tus cuentas sin costo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto pr-1 space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              {errorMsg}
            </div>
          )}

          <form id="transfer-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Amount Input */}
            <div className="bg-[#f7f9ff] p-4 rounded-2xl border border-[#dfe3e8] text-center">
              <label className="block text-xs font-semibold text-[#414754] mb-1">Monto a Transferir ($)</label>
              <div className="flex items-center justify-center text-3xl font-extrabold text-[#181c20] font-mono">
                <span className="mr-1 text-gray-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-transparent text-center font-bold text-3xl outline-none w-48 focus:text-[#005bbf]"
                  autoFocus
                />
              </div>
            </div>

            {/* From Account */}
            <div>
              <label className="block font-semibold text-[#414754] mb-1">Desde Cuenta Origen</label>
              <select
                value={fromAccId}
                onChange={(e) => setFromAccId(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#005bbf]/30 font-medium bg-white"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (${acc.balance.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Arrow Icon */}
            <div className="flex justify-center -my-2">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-[#005bbf] flex items-center justify-center border border-blue-200 shadow-2xs">
                <span className="material-symbols-outlined text-base">arrow_downward</span>
              </div>
            </div>

            {/* To Account */}
            <div>
              <label className="block font-semibold text-[#414754] mb-1">Hacia Cuenta Destino</label>
              <select
                value={toAccId}
                onChange={(e) => setToAccId(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#005bbf]/30 font-medium bg-white"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (${acc.balance.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block font-semibold text-[#414754] mb-1">Nota o Motivo (Opcional)</label>
              <input
                type="text"
                placeholder="Ej. Transferencia a ahorro mensual"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#005bbf]/30"
              />
            </div>
          </form>
        </div>

        {/* Sticky Action Footer */}
        <div className="pt-3 flex gap-3 justify-end border-t border-[#dfe3e8]/60 bg-white shrink-0 sticky bottom-0 z-10 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-[#f1f4fa] text-[#414754] font-semibold rounded-xl hover:bg-[#e5e8ee] transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="transfer-form"
            className="px-6 py-2.5 bg-[#005bbf] hover:bg-[#004899] text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">swap_horiz</span>
            Confirmar Transferencia
          </button>
        </div>
      </div>
    </div>
  );
};
