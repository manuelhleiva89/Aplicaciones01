import React, { useState } from 'react';
import { AppSettings, AuthUser } from '../types';
import { formatMoney } from '../utils/formatters';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  authUser?: AuthUser;
  onOpenAuthModal?: () => void;
  savedPin?: string;
  isPinEnabled?: boolean;
  onTogglePinEnabled?: (enabled: boolean) => void;
  onOpenChangePinModal?: () => void;
  onLockAppNow?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  authUser,
  onOpenAuthModal,
  savedPin = '1234',
  isPinEnabled = true,
  onTogglePinEnabled,
  onOpenChangePinModal,
  onLockAppNow,
}) => {
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);
  const [currencyCode, setCurrencyCode] = useState(settings.currencyCode);
  const [decimals, setDecimals] = useState(settings.decimals);

  const [expenseCategories, setExpenseCategories] = useState<string[]>(
    settings.expenseCategories
  );
  const [incomeCategories, setIncomeCategories] = useState<string[]>(
    settings.incomeCategories
  );

  const [newExpenseCat, setNewExpenseCat] = useState('');
  const [newIncomeCat, setNewIncomeCat] = useState('');

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      currencySymbol,
      currencyCode,
      decimals,
      expenseCategories,
      incomeCategories,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const addExpenseCategory = () => {
    const trimmed = newExpenseCat.trim();
    if (!trimmed || expenseCategories.includes(trimmed)) return;
    const updated = [...expenseCategories, trimmed];
    setExpenseCategories(updated);
    setNewExpenseCat('');
    onUpdateSettings({ ...settings, expenseCategories: updated });
  };

  const removeExpenseCategory = (cat: string) => {
    const updated = expenseCategories.filter((c) => c !== cat);
    setExpenseCategories(updated);
    onUpdateSettings({ ...settings, expenseCategories: updated });
  };

  const addIncomeCategory = () => {
    const trimmed = newIncomeCat.trim();
    if (!trimmed || incomeCategories.includes(trimmed)) return;
    const updated = [...incomeCategories, trimmed];
    setIncomeCategories(updated);
    setNewIncomeCat('');
    onUpdateSettings({ ...settings, incomeCategories: updated });
  };

  const removeIncomeCategory = (cat: string) => {
    const updated = incomeCategories.filter((c) => c !== cat);
    setIncomeCategories(updated);
    onUpdateSettings({ ...settings, incomeCategories: updated });
  };

  const currencyPresets = [
    { symbol: '$', code: 'USD', name: 'Dólar Estadounidense ($)' },
    { symbol: '€', code: 'EUR', name: 'Euro (€)' },
    { symbol: '£', code: 'GBP', name: 'Libra Esterlina (£)' },
    { symbol: 'S/.', code: 'PEN', name: 'Sol Peruano (S/.)' },
    { symbol: 'Mex$', code: 'MXN', name: 'Peso Mexicano (Mex$)' },
    { symbol: 'CLP$', code: 'CLP', name: 'Peso Chileno (CLP$)' },
    { symbol: 'Bs.', code: 'BOB', name: 'Boliviano (Bs.)' },
    { symbol: 'R$', code: 'BRL', name: 'Real Brasileño (R$)' },
    { symbol: 'CHF', code: 'CHF', name: 'Franco Suizo (CHF)' },
  ];

  const handleSelectPreset = (preset: { symbol: string; code: string }) => {
    setCurrencySymbol(preset.symbol);
    setCurrencyCode(preset.code);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#dfe3e8]/60 shadow-[0px_4px_20px_rgba(0,0,0,0.03)]">
        <div>
          <h2 className="text-2xl font-bold text-[#181c20]">Configuración y Preferencias</h2>
          <p className="text-xs text-[#414754] mt-1">
            Personaliza el símbolo de moneda, número de decimales y categorías de ingresos/gastos.
          </p>
        </div>
      </div>

      {/* Security & Account Mode Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security & PIN Lock Card */}
        <div className="bg-white p-6 rounded-2xl border border-[#dfe3e8] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-700 rounded-xl flex items-center justify-center border border-indigo-100">
                <span className="material-symbols-outlined text-22">lock</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[#181c20]">Seguridad y Candado PIN</h3>
                <p className="text-xs text-gray-500">Protección con PIN de 4 dígitos al reabrir la app</p>
              </div>
            </div>

            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
              isPinEnabled
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-gray-100 text-gray-600 border-gray-200'
            }`}>
              {isPinEnabled ? 'PIN Activo' : 'Desactivado'}
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <p className="font-semibold text-gray-800">Solicitar PIN al reabrir la aplicación</p>
                <p className="text-[11px] text-gray-500">Al cerrar la pestaña o reabrir, se pedirá el PIN configurado.</p>
              </div>
              <button
                type="button"
                onClick={() => onTogglePinEnabled && onTogglePinEnabled(!isPinEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  isPinEnabled ? 'bg-[#005bbf]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isPinEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-gray-700 flex items-start gap-2 text-[11px]">
              <span className="material-symbols-outlined text-base text-[#005bbf] shrink-0 mt-0.5">key</span>
              <div>
                PIN actual almacenado de forma segura en tu navegador. PIN inicial por defecto: <strong className="font-mono text-gray-900">1234</strong>.
              </div>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={onOpenChangePinModal}
                className="flex-1 py-2.5 px-3 bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 font-semibold text-xs rounded-xl shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base text-[#005bbf]">pin</span>
                Cambiar PIN / Contraseña
              </button>

              <button
                type="button"
                onClick={onLockAppNow}
                className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              >
                <span className="material-symbols-outlined text-base text-amber-400">lock_open</span>
                Bloquear Ahora
              </button>
            </div>
          </div>
        </div>

        {/* Account Mode & Limits Card */}
        <div className="bg-white p-6 rounded-2xl border border-[#dfe3e8] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-blue-50 text-[#005bbf] rounded-xl flex items-center justify-center border border-blue-100">
                <span className="material-symbols-outlined text-22">badge</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[#181c20]">Tipo de Cuenta de Sesión</h3>
                <p className="text-xs text-gray-500">Registro con Correo vs Cuenta Demo</p>
              </div>
            </div>

            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
              authUser?.provider === 'guest'
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}>
              {authUser?.provider === 'guest' ? 'Cuenta Demo' : 'Correo Registrado'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {authUser?.provider === 'guest' ? (
              <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200/80 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <span className="material-symbols-outlined text-base text-amber-700">warning</span>
                  Modo Demo con Límites Activo
                </div>
                <p className="text-amber-800 text-[11px] leading-relaxed">
                  Estás en el modo de prueba sin registro. Tienes restringida la creación a un máximo de <strong>2 cuentas</strong>, <strong>2 tarjetas de crédito</strong> y <strong>2 fondos de inversión</strong>.
                </p>
              </div>
            ) : (
              <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200/80 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <span className="material-symbols-outlined text-base text-emerald-600">verified</span>
                  Acceso Ilimitado Activado
                </div>
                <p className="text-emerald-800 text-[11px]">
                  Registrado como <strong>{authUser?.email}</strong>. Puedes crear cuentas, tarjetas y fondos de inversión sin restricción.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={onOpenAuthModal}
              className="w-full py-2.5 px-4 bg-[#005bbf] hover:bg-[#004899] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
            >
              <span className="material-symbols-outlined text-base">manage_accounts</span>
              {authUser?.provider === 'guest'
                ? 'Registrarme con Correo para Acceso Ilimitado'
                : 'Administrar Mi Cuenta de Sesión'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Currency & Formatting Card */}
        <div className="bg-white p-6 rounded-2xl border border-[#dfe3e8] shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <div className="w-9 h-9 bg-blue-50 text-[#005bbf] rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">payments</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#181c20]">Moneda y Formato Numérico</h3>
              <p className="text-xs text-gray-500">Configura la divisa principal y precisión decimal</p>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            {/* Currency Presets */}
            <div>
              <label className="block font-semibold text-[#414754] mb-1.5">Presets de Moneda Rápida</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {currencyPresets.map((p) => (
                  <button
                    type="button"
                    key={p.code}
                    onClick={() => handleSelectPreset(p)}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex items-center gap-1.5 ${
                      currencySymbol === p.symbol && currencyCode === p.code
                        ? 'border-[#005bbf] bg-blue-50/60 font-bold text-[#005bbf]'
                        : 'border-[#dfe3e8] hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="font-mono text-xs px-1.5 py-0.5 bg-gray-200/60 rounded text-gray-800">
                      {p.symbol}
                    </span>
                    <span className="truncate text-[11px]">{p.code}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#414754] mb-1">Símbolo de Moneda</label>
                <input
                  type="text"
                  required
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#005bbf]/30 font-mono text-sm"
                  placeholder="Ej. $, €, S/."
                />
              </div>

              <div>
                <label className="block font-semibold text-[#414754] mb-1">Código ISO</label>
                <input
                  type="text"
                  required
                  value={currencyCode}
                  onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#005bbf]/30 font-mono text-sm uppercase"
                  placeholder="Ej. USD, EUR"
                />
              </div>
            </div>

            {/* Decimal Selector */}
            <div>
              <label className="block font-semibold text-[#414754] mb-1.5">
                Número de Decimales a Mostrar
              </label>
              <div className="flex gap-2">
                {[0, 2, 3, 4].map((num) => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => setDecimals(num)}
                    className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      decimals === num
                        ? 'bg-[#005bbf] text-white border-[#005bbf] shadow-xs'
                        : 'border-[#dfe3e8] text-[#414754] hover:bg-gray-50'
                    }`}
                  >
                    {num} {num === 1 ? 'Decimal' : 'Decimales'}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Preview Box */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-100/80 space-y-1">
              <span className="text-[10px] font-bold text-[#005bbf] uppercase tracking-wider">
                Vista Previa de Formato
              </span>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-gray-600">Ejemplo de saldo:</span>
                <span className="text-xl font-extrabold text-[#181c20] font-mono">
                  {formatMoney(12345.6789, {
                    currencySymbol,
                    currencyCode,
                    decimals,
                    expenseCategories: [],
                    incomeCategories: [],
                  })}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              {savedSuccess ? (
                <span className="text-xs font-bold text-[#006e2c] flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  ¡Ajustes guardados!
                </span>
              ) : (
                <span></span>
              )}

              <button
                type="submit"
                className="px-5 py-2.5 bg-[#005bbf] hover:bg-[#004899] text-white font-semibold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">save</span>
                Guardar Moneda
              </button>
            </div>
          </form>
        </div>

        {/* Categories Customization Card */}
        <div className="bg-white p-6 rounded-2xl border border-[#dfe3e8] shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <div className="w-9 h-9 bg-purple-50 text-purple-700 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">category</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#181c20]">Gestión de Categorías</h3>
              <p className="text-xs text-gray-500">Agrega o elimina categorías de ingresos y gastos</p>
            </div>
          </div>

          {/* Expense Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#b81d17] uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">trending_down</span>
              Categorías de Gastos ({expenseCategories.length})
            </h4>

            <div className="flex gap-2 text-xs">
              <input
                type="text"
                placeholder="Nueva categoría de gasto..."
                value={newExpenseCat}
                onChange={(e) => setNewExpenseCat(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addExpenseCategory())}
                className="flex-1 px-3 py-1.5 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#005bbf]/30"
              />
              <button
                type="button"
                onClick={addExpenseCategory}
                className="px-3 py-1.5 bg-[#b81d17] hover:bg-red-800 text-white font-semibold rounded-xl cursor-pointer text-xs flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">add</span> Añadir
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1 bg-gray-50 rounded-xl border border-gray-100">
              {expenseCategories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-lg text-[11px] font-semibold text-gray-700 border border-gray-200 shadow-2xs group"
                >
                  {cat}
                  <button
                    onClick={() => removeExpenseCategory(cat)}
                    className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer ml-1"
                    title="Eliminar categoría"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Income Categories */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-[#006e2c] uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              Categorías de Ingresos ({incomeCategories.length})
            </h4>

            <div className="flex gap-2 text-xs">
              <input
                type="text"
                placeholder="Nueva categoría de ingreso..."
                value={newIncomeCat}
                onChange={(e) => setNewIncomeCat(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addIncomeCategory())}
                className="flex-1 px-3 py-1.5 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#005bbf]/30"
              />
              <button
                type="button"
                onClick={addIncomeCategory}
                className="px-3 py-1.5 bg-[#006e2c] hover:bg-[#005320] text-white font-semibold rounded-xl cursor-pointer text-xs flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">add</span> Añadir
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1 bg-gray-50 rounded-xl border border-gray-100">
              {incomeCategories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-lg text-[11px] font-semibold text-gray-700 border border-gray-200 shadow-2xs group"
                >
                  {cat}
                  <button
                    onClick={() => removeIncomeCategory(cat)}
                    className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer ml-1"
                    title="Eliminar categoría"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
