import React, { useState } from 'react';
import { Account, Transaction, TransactionType } from '../../types';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  accounts,
  onAddTransaction,
}) => {
  if (!isOpen) return null;

  const [type, setType] = useState<TransactionType>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Alimentación');
  const [accountName, setAccountName] = useState(accounts[0]?.name || 'Banco Principal');
  const [notes, setNotes] = useState('');

  const categoriesByExpense = [
    'Alimentación',
    'Supermercado',
    'Ocio',
    'Restaurantes',
    'Transporte',
    'Salud',
    'Servicios',
    'Hogar',
    'Compras',
    'Otro',
  ];

  const categoriesByIncome = [
    'Nómina / Salario',
    'Proyecto Freelance',
    'Inversiones',
    'Reembolso',
    'Regalo',
    'Otro Ingreso',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    const parsedAmount = parseFloat(amount);
    const finalAmount = type === 'expense' ? -Math.abs(parsedAmount) : Math.abs(parsedAmount);

    let icon = 'receipt';
    if (type === 'income') {
      icon = 'work';
    } else {
      if (category.includes('Alimentación') || category.includes('Supermercado')) icon = 'shopping_cart';
      else if (category.includes('Restaurantes') || category.includes('Ocio')) icon = 'restaurant';
      else if (category.includes('Transporte')) icon = 'directions_car';
      else if (category.includes('Salud')) icon = 'fitness_center';
      else if (category.includes('Servicios')) icon = 'bolt';
      else icon = 'payments';
    }

    onAddTransaction({
      title,
      category,
      date: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      amount: finalAmount,
      type,
      icon,
      accountName,
      notes: notes.trim() || undefined,
    });

    // Reset and close
    setTitle('');
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
              <span className="material-symbols-outlined text-xl">
                {type === 'expense' ? 'add_circle' : 'payments'}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#181c20]">
                {type === 'expense' ? 'Añadir Nuevo Gasto' : 'Añadir Nuevo Ingreso'}
              </h3>
              <p className="text-xs text-[#414754]">Registra un movimiento en tus cuentas</p>
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
          {/* Type Toggle */}
          <div className="flex bg-[#f1f4fa] p-1 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategory(categoriesByExpense[0]);
              }}
              className={`flex-1 py-2.5 rounded-xl text-center transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-[#b81d17] text-white shadow-xs'
                  : 'text-[#414754] hover:text-[#181c20]'
              }`}
            >
              Gasto (-)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory(categoriesByIncome[0]);
              }}
              className={`flex-1 py-2.5 rounded-xl text-center transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-[#006e2c] text-white shadow-xs'
                  : 'text-[#414754] hover:text-[#181c20]'
              }`}
            >
              Ingreso (+)
            </button>
          </div>

          {/* Form Body */}
          <form id="add-expense-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Amount Box */}
            <div className="bg-[#f7f9ff] p-4 rounded-2xl border border-[#dfe3e8] text-center">
              <label className="block text-xs font-semibold text-[#414754] mb-1">Monto ($)</label>
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

            {/* Title */}
            <div>
              <label className="block font-semibold text-[#414754] mb-1">Concepto / Descripción</label>
              <input
                type="text"
                required
                placeholder="Ej. Supermercado Mercadona, Compra de café..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#005bbf]/30 focus:border-[#005bbf] text-xs font-medium"
              />
            </div>

            {/* Category & Account Selectors */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#414754] mb-1">Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#005bbf]/30 focus:border-[#005bbf] text-xs font-medium"
                >
                  {(type === 'expense' ? categoriesByExpense : categoriesByIncome).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#414754] mb-1">Cuenta Afiliada</label>
                <select
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#005bbf]/30 focus:border-[#005bbf] text-xs font-medium"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.name}>
                      {acc.name} (${acc.balance.toFixed(0)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes Optional */}
            <div>
              <label className="block font-semibold text-[#414754] mb-1">Notas Opcionales</label>
              <textarea
                rows={2}
                placeholder="Detalles adicionales, número de recibo o personas..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#005bbf]/30 text-xs"
              ></textarea>
            </div>
          </form>
        </div>

        {/* Actions */}
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
            form="add-expense-form"
            className={`px-6 py-2.5 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer ${
              type === 'expense'
                ? 'bg-[#b81d17] hover:bg-[#a01611]'
                : 'bg-[#006e2c] hover:bg-[#005320]'
            }`}
          >
            {type === 'expense' ? 'Guardar Gasto' : 'Guardar Ingreso'}
          </button>
        </div>
      </div>
    </div>
  );
};
