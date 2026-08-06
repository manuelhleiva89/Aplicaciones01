import React, { useState } from 'react';
import { FinancialGoal, Account, AppSettings } from '../types';
import { formatMoney, calculateMonthsBetween } from '../utils/formatters';

interface GoalsViewProps {
  goals: FinancialGoal[];
  accounts: Account[];
  settings: AppSettings;
  onAddGoal: (goal: Omit<FinancialGoal, 'id'>) => void;
  onUpdateGoal: (goal: FinancialGoal) => void;
  onDeleteGoal: (id: string) => void;
  onDepositToGoal: (goalId: string, amount: number, accountId?: string) => void;
}

const COLOR_PALETTE = [
  '#005bbf', // Azul Clásico
  '#006e2c', // Verde Esmeralda
  '#6b21a8', // Violeta Púrpura
  '#b81d17', // Carmesí
  '#d97706', // Ámbar / Dorado
  '#0284c7', // Azul Cian
  '#db2777', // Rosa Fucsia
  '#4f46e5', // Índigo
  '#059669', // Verde Menta
  '#0891b2', // Turquesa
  '#ea580c', // Naranja
  '#1e293b', // Gris Carbón
];

const ICON_OPTIONS = [
  { id: 'savings', label: 'Alcancía' },
  { id: 'home', label: 'Casa' },
  { id: 'school', label: 'Estudios' },
  { id: 'directions_car', label: 'Vehículo' },
  { id: 'flight_takeoff', label: 'Viaje' },
  { id: 'laptop_mac', label: 'Tecnología' },
  { id: 'shield', label: 'Emergencia' },
  { id: 'trending_up', label: 'Inversión' },
  { id: 'celebration', label: 'Celebración' },
  { id: 'shopping_bag', label: 'Compras' },
  { id: 'favorite', label: 'Salud' },
  { id: 'star', label: 'Especial' },
];

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  accounts,
  settings,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onDepositToGoal,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [depositGoal, setDepositGoal] = useState<FinancialGoal | null>(null);

  // Form states for create goal
  const [title, setTitle] = useState('');
  const [linkedAccountId, setLinkedAccountId] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [targetDate, setTargetDate] = useState('2028-12-31');
  const [color, setColor] = useState('#005bbf');
  const [icon, setIcon] = useState('savings');

  // Form states for edit goal
  const [editTitle, setEditTitle] = useState('');
  const [editLinkedAccountId, setEditLinkedAccountId] = useState('');
  const [editTargetAmount, setEditTargetAmount] = useState('');
  const [editCurrentAmount, setEditCurrentAmount] = useState('');
  const [editTargetDate, setEditTargetDate] = useState('');
  const [editColor, setEditColor] = useState('#005bbf');
  const [editIcon, setEditIcon] = useState('savings');

  // Deposit modal state
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');

  const totalSavedAll = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTargetAll = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const overallPercentage = totalTargetAll > 0 ? Math.min(100, (totalSavedAll / totalTargetAll) * 100) : 0;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetAmount) return;

    const targetVal = parseFloat(targetAmount);
    const currentVal = parseFloat(currentAmount) || 0;
    const months = calculateMonthsBetween(new Date().toISOString().split('T')[0], targetDate);
    const monthlyNeeded = Math.max(0, (targetVal - currentVal) / months);

    const linkedAcc = accounts.find((a) => a.id === linkedAccountId);

    onAddGoal({
      title,
      linkedAccountId: linkedAccountId || undefined,
      linkedAccountName: linkedAcc ? linkedAcc.name : undefined,
      targetAmount: targetVal,
      currentAmount: currentVal,
      targetDate,
      monthlyContribution: Math.round(monthlyNeeded),
      icon,
      color,
    });

    setTitle('');
    setLinkedAccountId('');
    setTargetAmount('');
    setCurrentAmount('0');
    setColor('#005bbf');
    setIcon('savings');
    setShowAddModal(false);
  };

  const openEditModal = (goal: FinancialGoal) => {
    setEditingGoal(goal);
    setEditTitle(goal.title);
    setEditLinkedAccountId(goal.linkedAccountId || '');
    setEditTargetAmount(goal.targetAmount.toString());
    setEditCurrentAmount(goal.currentAmount.toString());
    setEditTargetDate(goal.targetDate);
    setEditColor(goal.color || '#005bbf');
    setEditIcon(goal.icon || 'savings');
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal || !editTitle || !editTargetAmount) return;

    const targetVal = parseFloat(editTargetAmount);
    const currentVal = parseFloat(editCurrentAmount) || 0;
    const months = calculateMonthsBetween(new Date().toISOString().split('T')[0], editTargetDate);
    const monthlyNeeded = Math.max(0, (targetVal - currentVal) / months);

    const linkedAcc = accounts.find((a) => a.id === editLinkedAccountId);

    onUpdateGoal({
      ...editingGoal,
      title: editTitle,
      linkedAccountId: editLinkedAccountId || undefined,
      linkedAccountName: linkedAcc ? linkedAcc.name : editLinkedAccountId ? editingGoal.linkedAccountName : undefined,
      targetAmount: targetVal,
      currentAmount: currentVal,
      targetDate: editTargetDate,
      monthlyContribution: Math.round(monthlyNeeded),
      icon: editIcon,
      color: editColor,
    });

    setEditingGoal(null);
  };

  const handleOpenDepositModal = (goal: FinancialGoal) => {
    setDepositGoal(goal);
    setDepositAmount('');
    // Default to goal's linked account if available
    if (goal.linkedAccountId && accounts.some((a) => a.id === goal.linkedAccountId)) {
      setSelectedAccountId(goal.linkedAccountId);
    } else {
      setSelectedAccountId(accounts[0]?.id || '');
    }
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositGoal || !depositAmount) return;

    const amount = parseFloat(depositAmount);
    if (amount <= 0) return;

    onDepositToGoal(depositGoal.id, amount, selectedAccountId || undefined);
    setDepositAmount('');
    setDepositGoal(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#dfe3e8]/60 shadow-[0px_4px_20px_rgba(0,0,0,0.03)]">
        <div>
          <h2 className="text-2xl font-bold text-[#181c20]">Metas Financieras y Plan de Ahorro</h2>
          <p className="text-xs text-[#414754] mt-1">
            Establece metas personalizadas, enlaza una cuenta bancaria y realiza un seguimiento automático de tus ahorros.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-[#005bbf] hover:bg-[#004899] text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Nueva Meta Financiera
        </button>
      </div>

      {/* Global Goal Progress Summary Card */}
      <div className="bg-gradient-to-r from-[#005bbf] to-indigo-900 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <span className="material-symbols-outlined text-[180px]">flag</span>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-blue-200">
              Ahorro Total en Metas
            </p>
            <p className="text-3xl font-extrabold font-mono mt-1">
              {formatMoney(totalSavedAll, settings)}
            </p>
            <p className="text-xs text-blue-100 mt-0.5">
              De un objetivo acumulado de {formatMoney(totalTargetAll, settings)}
            </p>
          </div>

          <div className="md:col-span-2 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold">Progreso Global de Metas</span>
              <span className="font-mono font-extrabold text-sm">{overallPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden p-0.5 backdrop-blur-xs">
              <div
                className="bg-[#86f898] h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${overallPercentage}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-blue-200">
              Tienes {goals.length} metas activas configuradas con planes de aportación.
            </p>
          </div>
        </div>
      </div>

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {goals.map((goal) => {
          const pct = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
          const monthsLeft = calculateMonthsBetween(new Date().toISOString().split('T')[0], goal.targetDate);
          const recommendedMonthly = monthsLeft > 0 ? remaining / monthsLeft : remaining;

          const linkedAcc = accounts.find((a) => a.id === goal.linkedAccountId);

          return (
            <div
              key={goal.id}
              className="bg-white p-5 rounded-2xl border border-[#dfe3e8] shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header info */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xs"
                      style={{ backgroundColor: goal.color || '#005bbf' }}
                    >
                      <span className="material-symbols-outlined text-2xl">{goal.icon || 'savings'}</span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#181c20]">{goal.title}</h3>
                      {/* Linked Bank Account Badge */}
                      {linkedAcc ? (
                        <div className="flex items-center gap-1 text-[11px] font-medium text-[#005bbf] bg-blue-50/80 border border-blue-100/80 px-2.5 py-0.5 rounded-lg mt-1 w-fit">
                          <span className="material-symbols-outlined text-xs">account_balance</span>
                          <span>Cuenta: {linkedAcc.name}</span>
                        </div>
                      ) : goal.linkedAccountName ? (
                        <div className="flex items-center gap-1 text-[11px] font-medium text-[#005bbf] bg-blue-50/80 border border-blue-100/80 px-2.5 py-0.5 rounded-lg mt-1 w-fit">
                          <span className="material-symbols-outlined text-xs">account_balance</span>
                          <span>Cuenta: {goal.linkedAccountName}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[11px] font-medium text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-0.5 rounded-lg mt-1 w-fit">
                          <span className="material-symbols-outlined text-xs">link_off</span>
                          <span>Sin cuenta enlazada</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(goal)}
                      className="text-gray-400 hover:text-[#005bbf] transition-colors cursor-pointer p-1 rounded-lg hover:bg-blue-50"
                      title="Editar meta"
                    >
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      className="text-gray-300 hover:text-red-600 transition-colors cursor-pointer p-1 rounded-lg hover:bg-red-50"
                      title="Eliminar meta"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-[#414754] font-medium">Progreso de ahorro:</span>
                    <span className="font-extrabold text-[#005bbf] font-mono">{pct.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: goal.color || '#005bbf',
                      }}
                    ></div>
                  </div>
                </div>

                {/* Amount Values */}
                <div className="mt-4 grid grid-cols-2 gap-2 p-3 bg-gray-50/70 rounded-xl border border-gray-100 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-semibold block">Ahorrado</span>
                    <span className="font-bold text-[#006e2c] font-mono text-sm">
                      {formatMoney(goal.currentAmount, settings)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-semibold block">Meta Final</span>
                    <span className="font-bold text-[#181c20] font-mono text-sm">
                      {formatMoney(goal.targetAmount, settings)}
                    </span>
                  </div>
                </div>

                {/* Monthly Savings Plan recommendation */}
                <div className="mt-3 p-3 bg-blue-50/60 rounded-xl border border-blue-100/80 space-y-1 text-xs">
                  <div className="flex justify-between items-center text-gray-700">
                    <span className="flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-sm text-[#005bbf]">calendar_month</span>
                      Fecha límite:
                    </span>
                    <span className="font-bold text-gray-900">{goal.targetDate}</span>
                  </div>

                  <div className="flex justify-between items-center text-gray-700">
                    <span className="flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-sm text-[#005bbf]">insights</span>
                      Plan mensual sugerido:
                    </span>
                    <span className="font-extrabold text-[#005bbf] font-mono">
                      {formatMoney(recommendedMonthly, settings)} / mes
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-[#dfe3e8]/60 flex justify-end gap-2">
                <button
                  onClick={() => handleOpenDepositModal(goal)}
                  className="px-3.5 py-1.5 bg-[#005bbf] hover:bg-[#004899] text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">add_circle</span>
                  Aportar Fondos
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create Goal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#dfe3e8] shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#181c20]">Crear Nueva Meta Financiera</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#414754] mb-1">Nombre de la Meta</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Enganche de Casa, Viaje a Europa, Fondo Vacaciones"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#005bbf]/30 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#414754] mb-1">
                  Cuenta Bancaria Enlazada (Opcional)
                </label>
                <select
                  value={linkedAccountId}
                  onChange={(e) => setLinkedAccountId(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#005bbf]/30 text-xs"
                >
                  <option value="">Sin cuenta enlazada</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.accountNumber}) - Saldo: {formatMoney(acc.balance, settings)}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-500 mt-1">
                  Enlazar una cuenta te permite asociar directamente tus fondos de ahorro a una cuenta bancaria.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#414754] mb-1">Monto Meta ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="10000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#005bbf]/30 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#414754] mb-1">Ahorro Inicial ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#005bbf]/30 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#414754] mb-1">Fecha Límite Estimada</label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#005bbf]/30 font-sans text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#414754] mb-1">Icono de la Meta</label>
                <div className="grid grid-cols-6 gap-2">
                  {ICON_OPTIONS.map((ic) => (
                    <button
                      type="button"
                      key={ic.id}
                      onClick={() => setIcon(ic.id)}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                        icon === ic.id
                          ? 'border-[#005bbf] bg-blue-50 text-[#005bbf] font-bold shadow-xs'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                      title={ic.label}
                    >
                      <span className="material-symbols-outlined text-lg">{ic.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#414754] mb-1">Color Distintivo</label>
                <div className="flex flex-wrap gap-2 items-center">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${
                        color.toLowerCase() === c.toLowerCase() ? 'border-gray-900 scale-110 shadow-sm' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  {/* Custom color picker option */}
                  <label
                    className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-100 text-gray-600 relative overflow-hidden"
                    title="Elegir color personalizado"
                  >
                    <span className="material-symbols-outlined text-xs">palette</span>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </label>
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
                  className="px-4 py-2 bg-[#005bbf] text-white font-semibold rounded-xl hover:bg-[#004899] cursor-pointer shadow-xs"
                >
                  Guardar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Goal */}
      {editingGoal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#dfe3e8] shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#181c20]">Editar Meta Financiera</h3>
              <button
                onClick={() => setEditingGoal(null)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#414754] mb-1">Nombre de la Meta</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#005bbf]/30 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#414754] mb-1">
                  Cuenta Bancaria Enlazada (Opcional)
                </label>
                <select
                  value={editLinkedAccountId}
                  onChange={(e) => setEditLinkedAccountId(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#005bbf]/30 text-xs"
                >
                  <option value="">Sin cuenta enlazada</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.accountNumber}) - Saldo: {formatMoney(acc.balance, settings)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#414754] mb-1">Monto Meta ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editTargetAmount}
                    onChange={(e) => setEditTargetAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#005bbf]/30 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#414754] mb-1">Monto Actual ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editCurrentAmount}
                    onChange={(e) => setEditCurrentAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#005bbf]/30 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#414754] mb-1">Fecha Límite Estimada</label>
                <input
                  type="date"
                  required
                  value={editTargetDate}
                  onChange={(e) => setEditTargetDate(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#005bbf]/30 font-sans text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#414754] mb-1">Icono de la Meta</label>
                <div className="grid grid-cols-6 gap-2">
                  {ICON_OPTIONS.map((ic) => (
                    <button
                      type="button"
                      key={ic.id}
                      onClick={() => setEditIcon(ic.id)}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                        editIcon === ic.id
                          ? 'border-[#005bbf] bg-blue-50 text-[#005bbf] font-bold shadow-xs'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                      title={ic.label}
                    >
                      <span className="material-symbols-outlined text-lg">{ic.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#414754] mb-1">Color Distintivo</label>
                <div className="flex flex-wrap gap-2 items-center">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setEditColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${
                        editColor.toLowerCase() === c.toLowerCase() ? 'border-gray-900 scale-110 shadow-sm' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <label
                    className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-100 text-gray-600 relative overflow-hidden"
                    title="Elegir color personalizado"
                  >
                    <span className="material-symbols-outlined text-xs">palette</span>
                    <input
                      type="color"
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </label>
                </div>
              </div>

              <div className="pt-2 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingGoal(null)}
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
            </form>
          </div>
        </div>
      )}

      {/* Modal: Deposit to Goal */}
      {depositGoal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#dfe3e8] shadow-xl">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="text-lg font-bold text-[#181c20]">Aportar Fondos a Meta</h3>
                <p className="text-xs text-[#005bbf] font-semibold">{depositGoal.title}</p>
              </div>
              <button
                onClick={() => setDepositGoal(null)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#414754] mb-1">Monto del Aporte ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="250.00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#005bbf]/30 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#414754] mb-1">
                  Descontar del Saldo de Cuenta:
                </label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#005bbf]/30 text-xs"
                >
                  <option value="">No descontar de ninguna cuenta</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.accountNumber}) - Saldo: {formatMoney(acc.balance, settings)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setDepositGoal(null)}
                  className="px-4 py-2 bg-[#f1f4fa] text-[#414754] font-semibold rounded-xl hover:bg-[#e5e8ee] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#006e2c] text-white font-semibold rounded-xl hover:bg-[#005320] cursor-pointer shadow-xs"
                >
                  Confirmar Aporte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
