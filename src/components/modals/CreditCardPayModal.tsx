import React, { useState } from 'react';
import { Account, AppSettings } from '../../types';
import { getCreditCardBillingInfo } from '../../utils/creditCard';
import { formatMoney } from '../../utils/formatters';

export interface CreditCardPayExecution {
  card: Account;
  payingAccountId: string;
  amountPaid: number;
  optionType: 'full' | 'minimum' | 'custom';
  remainingBalance: number;
  interestCharged: number;
}

interface CreditCardPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: Account | null;
  bankAccounts: Account[];
  settings?: AppSettings;
  onConfirmPayment: (execution: CreditCardPayExecution) => void;
}

export const CreditCardPayModal: React.FC<CreditCardPayModalProps> = ({
  isOpen,
  onClose,
  card,
  bankAccounts,
  settings,
  onConfirmPayment,
}) => {
  if (!isOpen || !card) return null;

  const cardInfo = getCreditCardBillingInfo(card, []);
  const fullBalance = cardInfo.currentDebt;
  const minimumPayment = cardInfo.minimumPayment;
  const annualRate = cardInfo.interestRate;

  const [paymentOption, setPaymentOption] = useState<'full' | 'minimum' | 'custom'>('minimum');
  const [customAmount, setCustomAmount] = useState<string>(minimumPayment.toString());
  const [selectedPayingAccountId, setSelectedPayingAccountId] = useState<string>(
    bankAccounts[0]?.id || ''
  );

  // Compute actual amount being paid based on selection
  let amountToPay = fullBalance;
  if (paymentOption === 'minimum') {
    amountToPay = minimumPayment;
  } else if (paymentOption === 'custom') {
    const parsed = parseFloat(customAmount);
    amountToPay = isNaN(parsed) || parsed < 0 ? 0 : Math.min(parsed, fullBalance);
  }

  // Calculate remaining balance after payment
  const remainingBalance = Math.max(0, fullBalance - amountToPay);

  // Calculate monthly interest rate & charge for next period if balance remains
  // Monthly rate = (annualRate / 100) / 12
  const monthlyRate = annualRate / 100 / 12;
  const interestCharged = remainingBalance > 0 ? Math.round(remainingBalance * monthlyRate * 100) / 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountToPay <= 0) return;
    if (!selectedPayingAccountId) return;

    onConfirmPayment({
      card,
      payingAccountId: selectedPayingAccountId,
      amountPaid: amountToPay,
      optionType: paymentOption,
      remainingBalance,
      interestCharged,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-[#dfe3e8] shadow-xl space-y-4 my-auto max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-start border-b border-gray-100 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-[#b81d17] flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">credit_card</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#181c20]">Pago de Tarjeta de Crédito</h3>
              <p className="text-xs text-gray-500">{card.name} ({card.institution || card.accountNumber})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer p-1"
          >
            ✕
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto pr-1 space-y-4 flex-1">
          {/* Card Financial Summary Card */}
          <div className="bg-[#f8fafc] p-4 rounded-2xl border border-gray-200/80 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 font-medium">Deuda Total / Gastos Acumulados</span>
              <span className="font-extrabold text-[#b81d17] text-base font-mono">
                {formatMoney(fullBalance, settings)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200/60 text-[11px]">
              <div>
                <span className="text-gray-400 block">Tasa de Interés Anual</span>
                <span className="font-bold text-[#181c20]">{annualRate}% EA</span>
              </div>
              <div>
                <span className="text-gray-400 block">Fecha Límite de Pago</span>
                <span className="font-bold text-[#005bbf]">{cardInfo.nextPaymentDueDateStr}</span>
              </div>
            </div>
          </div>

          <form id="credit-card-pay-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Payment Method Selector (Pago Mínimo, Pago Completo, Otro Monto) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#181c20]">
                Selecciona la Modalidad de Pago:
              </label>

              <div className="grid grid-cols-1 gap-2.5">
                {/* Option 1: Pago Completo */}
                <label
                  onClick={() => setPaymentOption('full')}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentOption === 'full'
                      ? 'border-[#006e2c] bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentOption"
                      checked={paymentOption === 'full'}
                      onChange={() => setPaymentOption('full')}
                      className="accent-[#006e2c] w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#181c20] block">
                        Pago Completo (Sin Intereses)
                      </span>
                      <span className="text-[11px] text-emerald-800">
                        Liquida el 100% de la deuda. No genera recargos.
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-[#006e2c] font-mono shrink-0">
                    {formatMoney(fullBalance, settings)}
                  </span>
                </label>

                {/* Option 2: Pago Mínimo */}
                <label
                  onClick={() => setPaymentOption('minimum')}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentOption === 'minimum'
                      ? 'border-[#005bbf] bg-blue-50/60 ring-2 ring-blue-500/20 shadow-xs'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentOption"
                      checked={paymentOption === 'minimum'}
                      onChange={() => setPaymentOption('minimum')}
                      className="accent-[#005bbf] w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#181c20] block">
                        Pago Mínimo
                      </span>
                      <span className="text-[11px] text-gray-500">
                        Cubre el 10% del monto acumulado adeudado a la fecha.
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-[#005bbf] font-mono shrink-0">
                    {formatMoney(minimumPayment, settings)}
                  </span>
                </label>

                {/* Option 3: Otro Monto */}
                <label
                  onClick={() => setPaymentOption('custom')}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentOption === 'custom'
                      ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-500/20 shadow-xs'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 w-full">
                    <input
                      type="radio"
                      name="paymentOption"
                      checked={paymentOption === 'custom'}
                      onChange={() => setPaymentOption('custom')}
                      className="accent-purple-600 w-4 h-4 cursor-pointer shrink-0"
                    />
                    <div className="w-full">
                      <span className="text-xs font-bold text-[#181c20] block">
                        Otro Monto Personalizado
                      </span>
                      {paymentOption === 'custom' && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-500">$</span>
                          <input
                            type="number"
                            step="0.01"
                            max={fullBalance}
                            min={1}
                            value={customAmount}
                            onChange={(e) => setCustomAmount(e.target.value)}
                            className="w-full px-3 py-1.5 border border-purple-300 rounded-lg text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                            placeholder="Monto a abonar"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Interest Calculation Live Breakdown Banner */}
            {paymentOption !== 'full' && (
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                  <span className="material-symbols-outlined text-base text-amber-700">calculate</span>
                  <span>Proyección de Interés para el Próximo Mes</span>
                </div>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  Al abonar <strong>{formatMoney(amountToPay, settings)}</strong>, quedará un saldo restante de{' '}
                  <strong className="text-red-700 font-mono">{formatMoney(remainingBalance, settings)}</strong>.
                </p>
                <div className="pt-1 border-t border-amber-200/60 flex justify-between items-center font-bold text-xs">
                  <span className="text-amber-900">Interés a financiar ({annualRate}% EA):</span>
                  <span className="text-[#b81d17] font-mono text-sm font-extrabold">
                    +{formatMoney(interestCharged, settings)}
                  </span>
                </div>
                <p className="text-[10px] text-amber-800 italic">
                  * Este interés se sumará automáticamente a los gastos del mes corriente para actualizar tu balance.
                </p>
              </div>
            )}

            {/* Paying Bank Account Selector */}
            <div>
              <label className="block text-xs font-bold text-[#181c20] mb-1">
                Cuenta de Débito / Banco con la que vas a Pagar:
              </label>
              <select
                value={selectedPayingAccountId}
                onChange={(e) => setSelectedPayingAccountId(e.target.value)}
                className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl focus:ring-2 focus:ring-[#005bbf]/30 focus:border-[#005bbf] outline-none text-xs font-semibold bg-white"
              >
                {bankAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.institution || acc.accountNumber}) — Saldo: ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </option>
                ))}
              </select>
            </div>
          </form>
        </div>

        {/* Sticky Modal Action Buttons */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2 bg-white shrink-0 sticky bottom-0 z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-[#f1f4fa] text-[#414754] font-semibold rounded-xl text-xs hover:bg-[#e5e8ee] cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="credit-card-pay-form"
            disabled={amountToPay <= 0 || !selectedPayingAccountId}
            className="px-5 py-2.5 bg-[#005bbf] hover:bg-[#004899] text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs disabled:opacity-50"
          >
            Confirmar Pago de {formatMoney(amountToPay, settings)}
          </button>
        </div>
      </div>
    </div>
  );
};
