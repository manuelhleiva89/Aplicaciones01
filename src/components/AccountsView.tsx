import React, { useState } from 'react';
import { Account, Transaction } from '../types';

interface AccountsViewProps {
  accounts: Account[];
  transactions: Transaction[];
  onOpenTransfer: () => void;
  onAddAccount: (acc: Omit<Account, 'id'>) => void;
  onUpdateAccount?: (acc: Account) => void;
  onDeleteAccount?: (id: string) => void;
  onNavigateToInvestments?: () => void;
  onPayCreditCard?: (card: Account) => void;
}

const PRESET_COLORS = [
  { name: 'Azul M3', hex: '#005bbf' },
  { name: 'Verde Esmeralda', hex: '#006e2c' },
  { name: 'Púrpura Imperial', hex: '#6b21a8' },
  { name: 'Rojo Carmesí', hex: '#b81d17' },
  { name: 'Cian', hex: '#0891b2' },
  { name: 'Ámbar', hex: '#d97706' },
  { name: 'Índigo', hex: '#4f46e5' },
  { name: 'Rosa Vibrante', hex: '#e11d48' },
  { name: 'Verde Menta', hex: '#059669' },
  { name: 'Gris Pizarra', hex: '#334155' },
  { name: 'Naranja Vivo', hex: '#ea580c' },
  { name: 'Teal Marino', hex: '#0d9488' },
];

const DEFAULT_TYPE_COLORS: Record<Account['type'], string> = {
  checking: '#005bbf',
  savings: '#006e2c',
  investment: '#6b21a8',
  credit: '#b81d17',
  debit: '#0891b2',
};

export const AccountsView: React.FC<AccountsViewProps> = ({
  accounts,
  transactions,
  onOpenTransfer,
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
  onNavigateToInvestments,
  onPayCreditCard,
}) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);

  // New Account Form State
  const [newAccName, setNewAccName] = useState('');
  const [newAccInstitution, setNewAccInstitution] = useState('');
  const [newAccType, setNewAccType] = useState<Account['type']>('checking');
  const [newAccColor, setNewAccColor] = useState('#005bbf');
  const [newAccNumber, setNewAccNumber] = useState('');
  const [newAccBalance, setNewAccBalance] = useState('');
  const [newCreditLimit, setNewCreditLimit] = useState('5000');
  const [newInterestRate, setNewInterestRate] = useState('36');
  const [newCutoffDay, setNewCutoffDay] = useState('15');
  const [newPaymentDueDay, setNewPaymentDueDay] = useState('5');

  // Edit Account Form State
  const [editAccName, setEditAccName] = useState('');
  const [editAccInstitution, setEditAccInstitution] = useState('');
  const [editAccType, setEditAccType] = useState<Account['type']>('checking');
  const [editAccColor, setEditAccColor] = useState('#005bbf');
  const [editAccNumber, setEditAccNumber] = useState('');
  const [editAccBalance, setEditAccBalance] = useState('');
  const [editCreditLimit, setEditCreditLimit] = useState('5000');
  const [editInterestRate, setEditInterestRate] = useState('36');
  const [editCutoffDay, setEditCutoffDay] = useState('15');
  const [editPaymentDueDay, setEditPaymentDueDay] = useState('5');

  const totalAssets = accounts
    .filter((a) => a.balance > 0)
    .reduce((sum, a) => sum + a.balance, 0);

  const totalLiabilities = accounts
    .filter((a) => a.balance < 0)
    .reduce((sum, a) => sum + Math.abs(a.balance), 0);

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName || !newAccBalance) return;

    let rawBalance = parseFloat(newAccBalance) || 0;
    if (newAccType === 'credit' && rawBalance > 0) {
      rawBalance = -rawBalance;
    }

    onAddAccount({
      name: newAccName,
      institution: newAccInstitution.trim() || undefined,
      type: newAccType,
      accountNumber: newAccNumber ? `**** ${newAccNumber.slice(-4)}` : '**** 1234',
      balance: rawBalance,
      icon:
        newAccType === 'checking'
          ? 'account_balance'
          : newAccType === 'savings'
          ? 'savings'
          : newAccType === 'investment'
          ? 'trending_up'
          : 'credit_card',
      color: newAccColor || DEFAULT_TYPE_COLORS[newAccType],
      creditLimit: newAccType === 'credit' ? parseFloat(newCreditLimit) || 5000 : undefined,
      interestRate: newAccType === 'credit' ? parseFloat(newInterestRate) || 36 : undefined,
      cutoffDay: newAccType === 'credit' ? parseInt(newCutoffDay, 10) || 15 : undefined,
      paymentDueDay: newAccType === 'credit' ? parseInt(newPaymentDueDay, 10) || 5 : undefined,
    });

    setNewAccName('');
    setNewAccInstitution('');
    setNewAccNumber('');
    setNewAccBalance('');
    setNewAccColor('#005bbf');
    setNewCreditLimit('5000');
    setNewInterestRate('36');
    setNewCutoffDay('15');
    setNewPaymentDueDay('5');
    setShowAddAccountModal(false);
  };

  const handleStartEditing = (acc: Account, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingAccount(acc);
    setEditAccName(acc.name);
    setEditAccInstitution(acc.institution || '');
    setEditAccType(acc.type);
    setEditAccColor(acc.color || DEFAULT_TYPE_COLORS[acc.type] || '#005bbf');
    setEditAccNumber(acc.accountNumber.replace(/\D/g, ''));
    setEditAccBalance(Math.abs(acc.balance).toString());
    setEditCreditLimit((acc.creditLimit || 5000).toString());
    setEditInterestRate((acc.interestRate || 36).toString());
    setEditCutoffDay((acc.cutoffDay || 15).toString());
    setEditPaymentDueDay((acc.paymentDueDay || 5).toString());
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount || !editAccName || !editAccBalance) return;

    let rawBalance = parseFloat(editAccBalance) || 0;
    if (editAccType === 'credit' && rawBalance > 0) {
      rawBalance = -rawBalance;
    }

    const updated: Account = {
      ...editingAccount,
      name: editAccName,
      institution: editAccInstitution.trim() || undefined,
      type: editAccType,
      accountNumber: editAccNumber ? `**** ${editAccNumber.slice(-4)}` : editingAccount.accountNumber,
      balance: rawBalance,
      icon:
        editAccType === 'checking'
          ? 'account_balance'
          : editAccType === 'savings'
          ? 'savings'
          : editAccType === 'investment'
          ? 'trending_up'
          : 'credit_card',
      color: editAccColor || DEFAULT_TYPE_COLORS[editAccType],
      creditLimit: editAccType === 'credit' ? parseFloat(editCreditLimit) || 5000 : undefined,
      interestRate: editAccType === 'credit' ? parseFloat(editInterestRate) || 36 : undefined,
      cutoffDay: editAccType === 'credit' ? parseInt(editCutoffDay, 10) || 15 : undefined,
      paymentDueDay: editAccType === 'credit' ? parseInt(editPaymentDueDay, 10) || 5 : undefined,
    };

    if (onUpdateAccount) {
      onUpdateAccount(updated);
    }
    setEditingAccount(null);
  };

  const handleConfirmDelete = () => {
    if (deletingAccount && onDeleteAccount) {
      onDeleteAccount(deletingAccount.id);
      if (selectedAccountId === deletingAccount.id) {
        setSelectedAccountId(null);
      }
      setDeletingAccount(null);
    }
  };

  const activeAccount = accounts.find((a) => a.id === selectedAccountId);
  const accountTransactions = activeAccount
    ? transactions.filter((t) => t.accountName.toLowerCase().includes(activeAccount.name.toLowerCase()))
    : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Assets */}
        <div className="bg-white p-5 rounded-2xl border border-[#dfe3e8]/60 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#414754]">Activos Totales</p>
            <p className="text-2xl font-extrabold text-[#006e2c] mt-1 font-mono">
              ${totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#006e2c] flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">account_balance</span>
          </div>
        </div>

        {/* Total Liabilities */}
        <div className="bg-white p-5 rounded-2xl border border-[#dfe3e8]/60 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#414754]">Deudas / Tarjetas</p>
            <p className="text-2xl font-extrabold text-[#b81d17] mt-1 font-mono">
              -${totalLiabilities.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#b81d17] flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">credit_card</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white p-5 rounded-2xl border border-[#dfe3e8]/60 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] flex items-center justify-around gap-2">
          <button
            onClick={onOpenTransfer}
            className="flex-1 py-3 px-3 bg-[#005bbf] hover:bg-[#004899] text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">swap_horiz</span>
            Transferir
          </button>
          <button
            onClick={() => setShowAddAccountModal(true)}
            className="flex-1 py-3 px-3 bg-[#f1f4fa] hover:bg-[#e5e8ee] text-[#181c20] font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-[#dfe3e8]"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Añadir Cuenta
          </button>
        </div>
      </div>

      {/* Account Grid Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#181c20]">Tus Cuentas y Tarjetas</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {accounts.map((acc) => {
            const isNegative = acc.balance < 0;
            const isSelected = selectedAccountId === acc.id;
            const isInvestment = acc.type === 'investment';

            return (
              <div
                key={acc.id}
                onClick={() => setSelectedAccountId(isSelected ? null : acc.id)}
                className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#005bbf] ring-2 ring-[#005bbf]/20 shadow-md'
                    : 'border-[#dfe3e8]/70 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div
                  className="absolute top-0 left-0 w-full h-1"
                  style={{ backgroundColor: acc.color }}
                ></div>

                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-2xs"
                      style={{ backgroundColor: acc.color }}
                    >
                      <span className="material-symbols-outlined text-xl">{acc.icon}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleStartEditing(acc, e)}
                        className="p-1 text-gray-400 hover:text-[#005bbf] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Modificar Cuenta"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingAccount(acc);
                        }}
                        className="p-1 text-gray-400 hover:text-[#b81d17] hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar Cuenta"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h4 className="text-sm font-bold text-[#181c20] group-hover:text-[#005bbf] transition-colors truncate">
                      {acc.name}
                    </h4>
                    <span className="text-[10px] font-semibold text-gray-400 font-mono shrink-0">
                      {acc.accountNumber}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs mt-0.5">
                    <p className="text-[#414754]">
                      {acc.type === 'savings'
                        ? 'Cuenta de Ahorro'
                        : acc.type === 'checking'
                        ? 'Cuenta Corriente'
                        : acc.type === 'investment'
                        ? 'Cuenta de Inversión'
                        : acc.type === 'credit'
                        ? 'Tarjeta de Crédito'
                        : 'Tarjeta de Débito'}
                    </p>
                    {acc.institution && (
                      <span className="text-[10px] font-semibold bg-[#f1f4fa] text-[#005bbf] px-2 py-0.5 rounded-md border border-[#dfe3e8]/80 truncate max-w-[120px]">
                        {acc.institution}
                      </span>
                    )}
                  </div>

                  {isInvestment && (
                    <div className="mt-2.5 pt-2 border-t border-purple-100 flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200/60 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">trending_up</span>
                        Cuenta de Inversión
                      </span>
                      {onNavigateToInvestments && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateToInvestments();
                          }}
                          className="text-[10px] font-bold text-[#005bbf] hover:underline cursor-pointer flex items-center gap-0.5"
                        >
                          Ir a Inversiones ↗
                        </button>
                      )}
                    </div>
                  )}

                  {acc.type === 'credit' && (() => {
                    const limit = acc.creditLimit || 5000;
                    const debt = acc.balance < 0 ? Math.abs(acc.balance) : 0;
                    const available = limit - debt;
                    const availablePct = Math.max(0, Math.min(100, Math.round((available / limit) * 100)));

                    return (
                      <div className="mt-2.5 pt-2 border-t border-red-100 space-y-2">
                        {/* Box de Disponibilidad Destacado */}
                        <div className="p-2.5 bg-emerald-50/80 rounded-xl border border-emerald-200/60 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                              Disponibilidad de esta Tarjeta
                            </span>
                            <span className="text-sm font-extrabold text-[#006e2c] font-mono">
                              ${available.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 font-mono">
                            {availablePct}% Libre
                          </span>
                        </div>

                        {/* Barra de Progreso de Disponibilidad */}
                        <div className="w-full bg-red-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#006e2c] h-full transition-all duration-300"
                            style={{ width: `${availablePct}%` }}
                            title={`${availablePct}% disponible`}
                          ></div>
                        </div>

                        <div className="grid grid-cols-2 gap-1 text-[11px] text-[#414754]">
                          <div>
                            <span className="text-gray-400 block text-[10px]">Límite de Crédito</span>
                            <span className="font-mono font-bold text-gray-800">${limit.toLocaleString('en-US')}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[10px]">Saldo Actual (Deuda)</span>
                            <span className="font-mono font-bold text-[#b81d17]">
                              -${debt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between text-[10px] text-gray-500 pt-1 border-t border-gray-100">
                          <span>Tasa: <strong>{acc.interestRate || 36}% EA</strong></span>
                          <span>Corte: <strong>Día {acc.cutoffDay || 15}</strong></span>
                          <span>Pago: <strong>Día {acc.paymentDueDay || 5}</strong></span>
                        </div>

                        {onPayCreditCard && acc.balance < 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onPayCreditCard(acc);
                            }}
                            className="w-full mt-2 py-1.5 bg-[#b81d17] hover:bg-red-800 text-white font-bold text-[11px] rounded-xl shadow-2xs flex items-center justify-center gap-1 cursor-pointer transition-all"
                          >
                            <span className="material-symbols-outlined text-xs">payments</span>
                            Pagar Tarjeta de Crédito
                          </button>
                        )}
                      </div>
                    );
                  })()}
                </div>

                <div className="mt-4 pt-3 border-t border-[#dfe3e8]/50 flex justify-between items-baseline">
                  <span className="text-[11px] text-gray-400">
                    {acc.type === 'credit' ? 'Saldo actual (Deuda)' : 'Saldo actual'}
                  </span>
                  <span
                    className={`text-lg font-bold font-mono ${
                      acc.type === 'credit'
                        ? 'text-[#b81d17]'
                        : isNegative
                        ? 'text-[#b81d17]'
                        : 'text-[#006e2c]'
                    }`}
                  >
                    {acc.type === 'credit'
                      ? acc.balance < 0
                        ? `-$${Math.abs(acc.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : `$${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : isNegative
                      ? `-$${Math.abs(acc.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : `$${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Account Activity */}
      {activeAccount && (
        <div className="bg-white p-6 rounded-2xl border border-[#005bbf]/30 shadow-md animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-gray-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#181c20]">
                  Movimientos de: <span className="text-[#005bbf]">{activeAccount.name}</span>
                </h3>
                {activeAccount.institution && (
                  <span className="text-xs font-semibold bg-blue-50 text-[#005bbf] px-2.5 py-0.5 rounded-full border border-blue-200">
                    {activeAccount.institution}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#414754] mt-1">
                Número: {activeAccount.accountNumber} | Saldo: ${activeAccount.balance.toLocaleString('en-US')}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleStartEditing(activeAccount)}
                className="px-3 py-1.5 bg-blue-50 text-[#005bbf] hover:bg-blue-100 text-xs font-bold rounded-xl border border-blue-200 flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                Modificar
              </button>
              <button
                onClick={() => setDeletingAccount(activeAccount)}
                className="px-3 py-1.5 bg-red-50 text-[#b81d17] hover:bg-red-100 text-xs font-bold rounded-xl border border-red-200 flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
                Eliminar
              </button>
              <button
                onClick={() => setSelectedAccountId(null)}
                className="text-xs font-semibold text-gray-400 hover:text-gray-600 cursor-pointer ml-2"
              >
                ✕ Cerrar
              </button>
            </div>
          </div>

          {accountTransactions.length === 0 ? (
            <p className="text-xs text-[#414754] py-4 text-center">
              No hay transacciones asociadas específicamente a esta cuenta.
            </p>
          ) : (
            <div className="divide-y divide-[#dfe3e8]/50">
              {accountTransactions.map((tx) => (
                <div key={tx.id} className="py-3 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-gray-400 text-base">{tx.icon}</span>
                    <div>
                      <p className="font-bold text-[#181c20]">{tx.title}</p>
                      <p className="text-[10px] text-gray-400">{tx.date}</p>
                    </div>
                  </div>
                  <span
                    className={`font-bold font-mono ${
                      tx.type === 'income' ? 'text-[#006e2c]' : 'text-[#b81d17]'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Account Modal */}
      {showAddAccountModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#dfe3e8] shadow-xl my-auto max-h-[90vh] flex flex-col space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100 shrink-0">
              <h3 className="text-lg font-bold text-[#181c20]">Añadir Nueva Cuenta</h3>
              <button
                onClick={() => setShowAddAccountModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto pr-1 space-y-4 flex-1">
              <form id="add-account-form" onSubmit={handleCreateAccount} className="space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-semibold text-[#414754] mb-1">Nombre de la Cuenta</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Mi Cuenta Principal, Fondo CETES"
                    value={newAccName}
                    onChange={(e) => setNewAccName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl focus:ring-2 focus:ring-[#005bbf]/30 focus:border-[#005bbf] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#414754] mb-1">Nombre del Banco / Institución Financiera</label>
                  <input
                    type="text"
                    placeholder="Ej. Santander, BBVA, Mercado Pago, GBM, Nu, Revolut"
                    value={newAccInstitution}
                    onChange={(e) => setNewAccInstitution(e.target.value)}
                    className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl focus:ring-2 focus:ring-[#005bbf]/30 focus:border-[#005bbf] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#414754] mb-1">Tipo de Cuenta</label>
                  <select
                    value={newAccType}
                    onChange={(e) => {
                      const type = e.target.value as Account['type'];
                      setNewAccType(type);
                      setNewAccColor(DEFAULT_TYPE_COLORS[type]);
                    }}
                    className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl focus:ring-2 focus:ring-[#005bbf]/30 focus:border-[#005bbf] outline-none font-semibold bg-white"
                  >
                    <option value="savings">Cuenta de Ahorro</option>
                    <option value="checking">Cuenta Corriente</option>
                    <option value="investment">Cuenta de Inversión</option>
                    <option value="credit">Tarjeta de Crédito</option>
                    <option value="debit">Tarjeta de Débito</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#414754] mb-1.5">
                    Color de la Cuenta
                  </label>
                  <div className="p-2.5 bg-gray-50 rounded-xl border border-[#dfe3e8] space-y-2">
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {PRESET_COLORS.map((c) => {
                        const isSelected = newAccColor.toLowerCase() === c.hex.toLowerCase();
                        return (
                          <button
                            key={c.hex}
                            type="button"
                            onClick={() => setNewAccColor(c.hex)}
                            className={`w-6 h-6 rounded-full transition-all flex items-center justify-center cursor-pointer shrink-0 ${
                              isSelected
                                ? 'ring-2 ring-offset-1 ring-[#005bbf] scale-110 shadow-xs'
                                : 'hover:scale-105 opacity-80 hover:opacity-100'
                            }`}
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          >
                            {isSelected && (
                              <span className="material-symbols-outlined text-white text-[10px] font-bold">
                                check
                              </span>
                            )}
                          </button>
                        );
                      })}
                      <label
                        className="relative w-6 h-6 rounded-full border border-gray-300 bg-white flex items-center justify-center cursor-pointer overflow-hidden hover:scale-105 transition-transform shrink-0"
                        title="Seleccionar color personalizado"
                      >
                        <input
                          type="color"
                          value={newAccColor}
                          onChange={(e) => setNewAccColor(e.target.value)}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        />
                        <span className="material-symbols-outlined text-gray-600 text-xs">palette</span>
                      </label>
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-gray-200/60">
                      <div
                        className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: newAccColor }}
                      ></div>
                      <span className="text-[11px] font-mono text-gray-600 uppercase font-medium">
                        {newAccColor}
                      </span>
                    </div>
                  </div>
                </div>

                {newAccType === 'credit' && (
                  <div className="p-3 bg-red-50/60 rounded-xl border border-red-200/80 space-y-3">
                    <span className="text-[11px] font-bold text-[#b81d17] uppercase tracking-wider block">
                      Parámetros de la Tarjeta de Crédito
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#414754] mb-1">
                          Límite de Crédito ($)
                        </label>
                        <input
                          type="number"
                          step="1"
                          required
                          placeholder="5000"
                          value={newCreditLimit}
                          onChange={(e) => setNewCreditLimit(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-[#dfe3e8] rounded-lg text-xs font-mono bg-white outline-none focus:border-[#b81d17]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#414754] mb-1">
                          Tasa de Interés Anual (%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          required
                          placeholder="36"
                          value={newInterestRate}
                          onChange={(e) => setNewInterestRate(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-[#dfe3e8] rounded-lg text-xs font-mono bg-white outline-none focus:border-[#b81d17]"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#414754] mb-1">
                          Fecha de Corte (Día 1-31)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={31}
                          required
                          placeholder="15"
                          value={newCutoffDay}
                          onChange={(e) => setNewCutoffDay(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-[#dfe3e8] rounded-lg text-xs font-mono bg-white outline-none focus:border-[#b81d17]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#414754] mb-1">
                          Fecha de Pago (Día 1-31)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={31}
                          required
                          placeholder="5"
                          value={newPaymentDueDay}
                          onChange={(e) => setNewPaymentDueDay(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-[#dfe3e8] rounded-lg text-xs font-mono bg-white outline-none focus:border-[#b81d17]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {newAccType === 'investment' && (
                  <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-900 text-[11px] flex items-start gap-2">
                    <span className="material-symbols-outlined text-base text-purple-700 shrink-0">trending_up</span>
                    <span>
                      Las cuentas creadas como <strong>Cuenta de Inversión</strong> se enlazan automáticamente con la pestaña de <strong>Inversiones</strong>.
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#414754] mb-1">Últimos 4 dígitos de la tarjeta / cuenta</label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="4821"
                    value={newAccNumber}
                    onChange={(e) => setNewAccNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl focus:ring-2 focus:ring-[#005bbf]/30 focus:border-[#005bbf] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#414754] mb-1">
                    {newAccType === 'credit' ? 'Saldo Actual / Deuda Inicial ($)' : 'Saldo Inicial ($)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="1000.00"
                    value={newAccBalance}
                    onChange={(e) => setNewAccBalance(e.target.value)}
                    className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl focus:ring-2 focus:ring-[#005bbf]/30 focus:border-[#005bbf] outline-none font-mono"
                  />
                </div>
              </form>
            </div>

            <div className="pt-3 flex gap-2 justify-end border-t border-gray-100 bg-white shrink-0 sticky bottom-0 z-10 text-xs">
              <button
                type="button"
                onClick={() => setShowAddAccountModal(false)}
                className="px-4 py-2 bg-[#f1f4fa] text-[#414754] font-semibold rounded-xl hover:bg-[#e5e8ee] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="add-account-form"
                className="px-4 py-2 bg-[#005bbf] text-white font-semibold rounded-xl hover:bg-[#004899] cursor-pointer"
              >
                Guardar Cuenta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Account Modal */}
      {editingAccount && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#dfe3e8] shadow-xl my-auto max-h-[90vh] flex flex-col space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100 shrink-0">
              <h3 className="text-lg font-bold text-[#181c20]">Modificar Cuenta</h3>
              <button
                onClick={() => setEditingAccount(null)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto pr-1 space-y-4 flex-1">
              <form id="edit-account-form" onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-semibold text-[#414754] mb-1">Nombre de la Cuenta</label>
                  <input
                    type="text"
                    required
                    value={editAccName}
                    onChange={(e) => setEditAccName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl focus:ring-2 focus:ring-[#005bbf]/30 focus:border-[#005bbf] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#414754] mb-1">Nombre del Banco / Institución Financiera</label>
                  <input
                    type="text"
                    value={editAccInstitution}
                    onChange={(e) => setEditAccInstitution(e.target.value)}
                    className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl focus:ring-2 focus:ring-[#005bbf]/30 focus:border-[#005bbf] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#414754] mb-1">Tipo de Cuenta</label>
                  <select
                    value={editAccType}
                    onChange={(e) => {
                      const type = e.target.value as Account['type'];
                      setEditAccType(type);
                      setEditAccColor(DEFAULT_TYPE_COLORS[type]);
                    }}
                    className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl focus:ring-2 focus:ring-[#005bbf]/30 focus:border-[#005bbf] outline-none font-semibold bg-white"
                  >
                    <option value="savings">Cuenta de Ahorro</option>
                    <option value="checking">Cuenta Corriente</option>
                    <option value="investment">Cuenta de Inversión</option>
                    <option value="credit">Tarjeta de Crédito</option>
                    <option value="debit">Tarjeta de Débito</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#414754] mb-1.5">
                    Color de la Cuenta
                  </label>
                  <div className="p-2.5 bg-gray-50 rounded-xl border border-[#dfe3e8] space-y-2">
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {PRESET_COLORS.map((c) => {
                        const isSelected = editAccColor.toLowerCase() === c.hex.toLowerCase();
                        return (
                          <button
                            key={c.hex}
                            type="button"
                            onClick={() => setEditAccColor(c.hex)}
                            className={`w-6 h-6 rounded-full transition-all flex items-center justify-center cursor-pointer shrink-0 ${
                              isSelected
                                ? 'ring-2 ring-offset-1 ring-[#005bbf] scale-110 shadow-xs'
                                : 'hover:scale-105 opacity-80 hover:opacity-100'
                            }`}
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          >
                            {isSelected && (
                              <span className="material-symbols-outlined text-white text-[10px] font-bold">
                                check
                              </span>
                            )}
                          </button>
                        );
                      })}
                      <label
                        className="relative w-6 h-6 rounded-full border border-gray-300 bg-white flex items-center justify-center cursor-pointer overflow-hidden hover:scale-105 transition-transform shrink-0"
                        title="Seleccionar color personalizado"
                      >
                        <input
                          type="color"
                          value={editAccColor}
                          onChange={(e) => setEditAccColor(e.target.value)}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        />
                        <span className="material-symbols-outlined text-gray-600 text-xs">palette</span>
                      </label>
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-gray-200/60">
                      <div
                        className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: editAccColor }}
                      ></div>
                      <span className="text-[11px] font-mono text-gray-600 uppercase font-medium">
                        {editAccColor}
                      </span>
                    </div>
                  </div>
                </div>

                {editAccType === 'credit' && (
                  <div className="p-3 bg-red-50/60 rounded-xl border border-red-200/80 space-y-3">
                    <span className="text-[11px] font-bold text-[#b81d17] uppercase tracking-wider block">
                      Parámetros de la Tarjeta de Crédito
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#414754] mb-1">
                          Límite de Crédito ($)
                        </label>
                        <input
                          type="number"
                          step="1"
                          required
                          value={editCreditLimit}
                          onChange={(e) => setEditCreditLimit(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-[#dfe3e8] rounded-lg text-xs font-mono bg-white outline-none focus:border-[#b81d17]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#414754] mb-1">
                          Tasa de Interés Anual (%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          required
                          value={editInterestRate}
                          onChange={(e) => setEditInterestRate(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-[#dfe3e8] rounded-lg text-xs font-mono bg-white outline-none focus:border-[#b81d17]"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#414754] mb-1">
                          Fecha de Corte (Día 1-31)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={31}
                          required
                          value={editCutoffDay}
                          onChange={(e) => setEditCutoffDay(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-[#dfe3e8] rounded-lg text-xs font-mono bg-white outline-none focus:border-[#b81d17]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#414754] mb-1">
                          Fecha de Pago (Día 1-31)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={31}
                          required
                          value={editPaymentDueDay}
                          onChange={(e) => setEditPaymentDueDay(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-[#dfe3e8] rounded-lg text-xs font-mono bg-white outline-none focus:border-[#b81d17]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#414754] mb-1">Últimos 4 dígitos de tarjeta / cuenta</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={editAccNumber}
                    onChange={(e) => setEditAccNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl focus:ring-2 focus:ring-[#005bbf]/30 focus:border-[#005bbf] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#414754] mb-1">
                    {editAccType === 'credit' ? 'Saldo Actual (Deuda) ($)' : 'Saldo Actual ($)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editAccBalance}
                    onChange={(e) => setEditAccBalance(e.target.value)}
                    className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl focus:ring-2 focus:ring-[#005bbf]/30 focus:border-[#005bbf] outline-none font-mono"
                  />
                </div>
              </form>
            </div>

            <div className="pt-3 flex gap-2 justify-end border-t border-gray-100 bg-white shrink-0 sticky bottom-0 z-10 text-xs">
              <button
                type="button"
                onClick={() => setEditingAccount(null)}
                className="px-4 py-2 bg-[#f1f4fa] text-[#414754] font-semibold rounded-xl hover:bg-[#e5e8ee] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="edit-account-form"
                className="px-4 py-2 bg-[#005bbf] text-white font-semibold rounded-xl hover:bg-[#004899] cursor-pointer"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingAccount && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-[#dfe3e8] shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-[#b81d17] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">warning</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#181c20]">¿Eliminar esta cuenta?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Vas a eliminar <strong>{deletingAccount.name}</strong> con un saldo de ${deletingAccount.balance.toLocaleString('en-US')}.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeletingAccount(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-[#b81d17] hover:bg-red-800 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
