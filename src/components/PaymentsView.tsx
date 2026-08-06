import React, { useState } from 'react';
import { PaymentItem, Account } from '../types';

interface PaymentsViewProps {
  payments: PaymentItem[];
  accounts: Account[];
  onPayNow: (payment: PaymentItem) => void;
  onAddPayment: (payment: Omit<PaymentItem, 'id' | 'status'>) => void;
  onToggleAutoPay: (id: string, assignedAccountName?: string, dueDate?: string) => void;
  onUpdatePayment?: (payment: PaymentItem) => void;
  onDeletePayment?: (id: string) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments,
  accounts,
  onPayNow,
  onAddPayment,
  onToggleAutoPay,
  onUpdatePayment,
  onDeletePayment,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'paid'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentItem | null>(null);
  const [deletingPayment, setDeletingPayment] = useState<PaymentItem | null>(null);

  // Form states for creating new payment
  const [service, setService] = useState('');
  const [category, setCategory] = useState('Servicios');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [autoPay, setAutoPay] = useState(false);
  const [assignedAccountName, setAssignedAccountName] = useState(() => accounts[0]?.name || '');

  // Edit modal form states
  const [editService, setEditService] = useState('');
  const [editCategory, setEditCategory] = useState('Servicios');
  const [editAmount, setEditAmount] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editAutoPay, setEditAutoPay] = useState(false);
  const [editAssignedAccountName, setEditAssignedAccountName] = useState('');

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return 'No programada';
    if (dateStr.includes('-') && dateStr.length === 10) {
      const [y, m, d] = dateStr.split('-');
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const monthIdx = parseInt(m, 10) - 1;
      if (monthIdx >= 0 && monthIdx < 12) {
        return `${parseInt(d, 10)} ${months[monthIdx]}, ${y}`;
      }
    }
    return dateStr;
  };

  const filteredPayments = payments.filter((p) => {
    if (filterStatus === 'pending') return p.status === 'pending';
    if (filterStatus === 'paid') return p.status === 'paid';
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!service || !amount) return;

    onAddPayment({
      service,
      category,
      amount: parseFloat(amount),
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      autoPay,
      assignedAccountName: assignedAccountName || accounts[0]?.name || 'Banco Principal',
      icon:
        category === 'Entretenimiento'
          ? 'movie'
          : category === 'Servicios'
          ? 'bolt'
          : category === 'Seguros'
          ? 'security'
          : 'receipt_long',
    });

    setService('');
    setAmount('');
    setDueDate(new Date().toISOString().split('T')[0]);
    setAutoPay(false);
    setShowAddModal(false);
  };

  const openEditModal = (item: PaymentItem) => {
    setEditingPayment(item);
    setEditService(item.service);
    setEditCategory(item.category);
    setEditAmount(item.amount.toString());
    setEditDueDate(item.dueDate || new Date().toISOString().split('T')[0]);
    setEditAutoPay(item.autoPay);
    setEditAssignedAccountName(item.assignedAccountName || accounts[0]?.name || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayment || !editService || !editAmount) return;

    const newIcon =
      editCategory === 'Entretenimiento'
        ? 'movie'
        : editCategory === 'Servicios'
        ? 'bolt'
        : editCategory === 'Seguros'
        ? 'security'
        : editCategory === 'Vivienda'
        ? 'home'
        : 'receipt_long';

    const updated: PaymentItem = {
      ...editingPayment,
      service: editService,
      category: editCategory,
      amount: parseFloat(editAmount),
      dueDate: editDueDate,
      autoPay: editAutoPay,
      assignedAccountName: editAssignedAccountName,
      icon: newIcon,
    };

    if (onUpdatePayment) {
      onUpdatePayment(updated);
    } else {
      onToggleAutoPay(editingPayment.id, editAssignedAccountName, editDueDate);
    }

    setEditingPayment(null);
  };

  const handleConfirmDelete = () => {
    if (deletingPayment && onDeletePayment) {
      onDeletePayment(deletingPayment.id);
      setDeletingPayment(null);
    }
  };

  const totalUpcoming = payments
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#dfe3e8]/60 shadow-[0px_4px_20px_rgba(0,0,0,0.03)]">
        <div>
          <h2 className="text-2xl font-bold text-[#181c20]">Pagos Recurrentes y Cobros Automáticos</h2>
          <p className="text-xs text-[#414754] mt-1">
            Gestiona tus suscripciones y programa cobros automáticos asociados a tus cuentas. Total pendiente este mes:{' '}
            <span className="font-bold text-[#b81d17] font-mono">${totalUpcoming.toFixed(2)}</span>
          </p>
        </div>
        <button
          onClick={() => {
            setAssignedAccountName(accounts[0]?.name || '');
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 bg-[#005bbf] hover:bg-[#004899] text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Programar Nuevo Pago
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-[#f1f4fa] p-1 rounded-xl text-xs font-semibold w-fit">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
            filterStatus === 'all' ? 'bg-white text-[#005bbf] shadow-2xs' : 'text-[#414754]'
          }`}
        >
          Todos ({payments.length})
        </button>
        <button
          onClick={() => setFilterStatus('pending')}
          className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
            filterStatus === 'pending' ? 'bg-white text-[#b81d17] shadow-2xs' : 'text-[#414754]'
          }`}
        >
          Pendientes ({payments.filter((p) => p.status === 'pending').length})
        </button>
        <button
          onClick={() => setFilterStatus('paid')}
          className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
            filterStatus === 'paid' ? 'bg-white text-[#006e2c] shadow-2xs' : 'text-[#414754]'
          }`}
        >
          Completados ({payments.filter((p) => p.status === 'paid').length})
        </button>
      </div>

      {/* Payments Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPayments.map((item) => {
          const isPaid = item.status === 'paid';

          return (
            <div
              key={item.id}
              className={`bg-white p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isPaid
                  ? 'border-gray-200 bg-gray-50/50'
                  : 'border-[#dfe3e8] hover:border-blue-300 shadow-xs hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white ${
                        isPaid ? 'bg-gray-400' : 'bg-[#005bbf]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#181c20]">{item.service}</h4>
                      <p className="text-xs text-[#414754] mt-0.5">{item.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.autoPay && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-[#005bbf] flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[12px]">sync</span> Auto
                      </span>
                    )}
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        isPaid
                          ? 'bg-emerald-100 text-[#006e2c]'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isPaid ? 'Pagado' : 'Pendiente'}
                    </span>
                  </div>
                </div>

                {/* Account & Date Info Badge */}
                <div className="mt-3 p-2.5 bg-[#f8fafc] rounded-xl border border-gray-100 space-y-1 text-xs">
                  <div className="flex justify-between items-center text-[#414754]">
                    <span className="flex items-center gap-1 text-[11px] font-medium">
                      <span className="material-symbols-outlined text-xs text-gray-500">calendar_today</span>
                      Fecha de cobro:
                    </span>
                    <span className="font-bold text-[#181c20] font-mono">
                      {formatDisplayDate(item.dueDate)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[#414754]">
                    <span className="flex items-center gap-1 text-[11px] font-medium">
                      <span className="material-symbols-outlined text-xs text-gray-500">credit_card</span>
                      Cuenta / Tarjeta:
                    </span>
                    <span className="font-semibold text-[#005bbf]">
                      {item.assignedAccountName || 'No asignada'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#dfe3e8]/50 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-[#414754] uppercase tracking-wider font-semibold">Monto</p>
                  <p className="text-lg font-extrabold text-[#181c20] font-mono">
                    ${item.amount.toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-[#005bbf] hover:bg-blue-50 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                    title="Editar pago programado"
                  >
                    <span className="material-symbols-outlined text-base">edit</span>
                    <span className="hidden sm:inline">Editar</span>
                  </button>

                  {onDeletePayment && (
                    <button
                      onClick={() => setDeletingPayment(item)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-[#b81d17] hover:bg-red-50 transition-colors cursor-pointer"
                      title="Eliminar pago programado"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  )}

                  {!isPaid && (
                    <button
                      onClick={() => onPayNow(item)}
                      className="px-3.5 py-1.5 bg-[#006e2c] hover:bg-[#005320] text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1 ml-1"
                    >
                      <span className="material-symbols-outlined text-sm">check</span>
                      Pagar
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Scheduled Payment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#dfe3e8] shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#181c20]">Programar Pago Recurrente</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#414754] mb-1">Nombre del Servicio / Factura</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Netflix, Factura Luz, Gimnasio, Spotify"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#005bbf]/30"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#414754] mb-1">Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#005bbf]/30"
                >
                  <option value="Servicios">Servicios (Luz, Agua, Internet)</option>
                  <option value="Entretenimiento">Entretenimiento / Streaming</option>
                  <option value="Seguros">Seguros / Salud</option>
                  <option value="Vivienda">Vivienda / Alquiler</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#414754] mb-1">Monto ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="29.99"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#005bbf]/30"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#414754] mb-1">Fecha Programada de Cobro</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#005bbf]/30 font-sans"
                />
              </div>

              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autopay-new"
                    checked={autoPay}
                    onChange={(e) => setAutoPay(e.target.checked)}
                    className="w-4 h-4 text-[#005bbf] rounded border-[#dfe3e8] cursor-pointer"
                  />
                  <label htmlFor="autopay-new" className="text-xs font-bold text-[#181c20] cursor-pointer flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-[#005bbf]">sync</span>
                    Activar Cobro Automático
                  </label>
                </div>

                {/* Account Selection */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#414754] mb-1">
                    Cuenta o Tarjeta para asociar el cobro {autoPay && <span className="text-[#005bbf] font-bold">(Requerido para Auto-Pay)</span>}
                  </label>
                  <select
                    value={assignedAccountName}
                    onChange={(e) => setAssignedAccountName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#005bbf]/30 bg-white"
                  >
                    {accounts.length === 0 && <option value="">No hay cuentas registradas</option>}
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.name}>
                        {acc.name} {acc.institution ? `(${acc.institution})` : ''} - {acc.accountNumber}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-[#f1f4fa] text-[#414754] font-semibold rounded-xl hover:bg-[#e5e8ee] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#005bbf] text-white font-semibold rounded-xl hover:bg-[#004899] cursor-pointer"
                >
                  Guardar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Configure / Edit Payment Modal */}
      {editingPayment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#dfe3e8] shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#181c20]">Editar Pago Programado</h3>
                <p className="text-xs text-gray-500">{editingPayment.service}</p>
              </div>
              <button
                onClick={() => setEditingPayment(null)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#414754] mb-1">Nombre del Servicio / Factura</label>
                <input
                  type="text"
                  required
                  value={editService}
                  onChange={(e) => setEditService(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#005bbf]/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#414754] mb-1">Categoría</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#005bbf]/30"
                  >
                    <option value="Servicios">Servicios</option>
                    <option value="Entretenimiento">Entretenimiento</option>
                    <option value="Seguros">Seguros</option>
                    <option value="Vivienda">Vivienda</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#414754] mb-1">Monto ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#005bbf]/30"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#414754] mb-1">Seleccionar Fecha para este Cobro</label>
                <input
                  type="date"
                  required
                  value={editDueDate.includes('-') && editDueDate.length === 10 ? editDueDate : new Date().toISOString().split('T')[0]}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#005bbf]/30 font-sans"
                />
              </div>

              <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autopay-edit"
                    checked={editAutoPay}
                    onChange={(e) => setEditAutoPay(e.target.checked)}
                    className="w-4 h-4 text-[#005bbf] rounded border-[#dfe3e8] cursor-pointer"
                  />
                  <label htmlFor="autopay-edit" className="text-xs font-bold text-[#181c20] cursor-pointer flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-[#005bbf]">sync</span>
                    Cobro Automático Activo
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#414754] mb-1">
                    Asociar a Cuenta o Tarjeta:
                  </label>
                  <select
                    value={editAssignedAccountName}
                    onChange={(e) => setEditAssignedAccountName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#005bbf]/30 bg-white"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.name}>
                        {acc.name} {acc.institution ? `(${acc.institution})` : ''} - {acc.accountNumber}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-2">
                {onDeletePayment && (
                  <button
                    type="button"
                    onClick={() => {
                      const itemToDelete = editingPayment;
                      setEditingPayment(null);
                      setDeletingPayment(itemToDelete);
                    }}
                    className="px-3 py-2 bg-red-50 text-[#b81d17] hover:bg-red-100 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                    Eliminar
                  </button>
                )}
                <div className="flex gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setEditingPayment(null)}
                    className="px-4 py-2 bg-[#f1f4fa] text-[#414754] font-semibold rounded-xl hover:bg-[#e5e8ee] cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#005bbf] text-white font-semibold rounded-xl hover:bg-[#004899] cursor-pointer shadow-xs"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Payment Confirmation Modal */}
      {deletingPayment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-[#dfe3e8] shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-[#b81d17] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">warning</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#181c20]">¿Eliminar pago programado?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Vas a eliminar el pago de <strong>{deletingPayment.service}</strong> (${deletingPayment.amount.toFixed(2)}).
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeletingPayment(null)}
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
