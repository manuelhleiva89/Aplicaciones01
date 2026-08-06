import React, { useState } from 'react';
import { Transaction, Account, AppSettings } from '../../types';
import { formatMoney } from '../../utils/formatters';

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  accounts?: Account[];
  settings?: AppSettings;
}

export const ReportsModal: React.FC<ReportsModalProps> = ({
  isOpen,
  onClose,
  transactions,
  accounts = [],
  settings = { currencySymbol: '$', currencyCode: 'USD', decimals: 2, expenseCategories: [], incomeCategories: [] },
}) => {
  if (!isOpen) return null;

  const [period, setPeriod] = useState<'month' | 'year'>('month');

  // 1. Calculate transaction metrics (Income & Expenses)
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  // 2. Calculate Account Balances (Assets, Liabilities, Net Worth) directly from stored bank accounts and cards
  const totalAssets = accounts
    .filter((a) => a.balance > 0)
    .reduce((sum, a) => sum + a.balance, 0);

  const totalLiabilities = accounts
    .filter((a) => a.balance < 0)
    .reduce((sum, a) => sum + Math.abs(a.balance), 0);

  const netPatrimony = totalAssets - totalLiabilities;

  // Category breakdown for expenses
  const expensesByCategory: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const cat = t.category || 'Otros';
      expensesByCategory[cat] = (expensesByCategory[cat] || 0) + Math.abs(t.amount);
    });

  const categoryList = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 border border-[#dfe3e8] shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#dfe3e8]/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#005bbf] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-xl">analytics</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#181c20]">Reporte Financiero General</h3>
              <p className="text-xs text-[#414754]">Alimentado por tus Cuentas Bancarias, Tarjetas y Flujo de Caja</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-[#f1f4fa] p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setPeriod('month')}
                className={`px-3 py-1 rounded-lg cursor-pointer ${
                  period === 'month' ? 'bg-white text-[#005bbf] shadow-2xs' : 'text-gray-600'
                }`}
              >
                Este Mes
              </button>
              <button
                onClick={() => setPeriod('year')}
                className={`px-3 py-1 rounded-lg cursor-pointer ${
                  period === 'year' ? 'bg-white text-[#005bbf] shadow-2xs' : 'text-gray-600'
                }`}
              >
                Año 2026
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Section 1: Estado Patrimonial de Cuentas y Tarjetas */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-[#181c20] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#005bbf] text-lg">account_balance_wallet</span>
              Balance General de Cuentas y Tarjetas
            </h4>
            <span className="text-[11px] text-[#005bbf] font-semibold bg-blue-50 px-2.5 py-0.5 rounded-full">
              {accounts.length} Cuentas vinculadas
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#f7f9ff] p-4 rounded-2xl border border-[#dfe3e8]">
              <span className="text-xs font-semibold text-[#414754]">Patrimonio Neto Total</span>
              <p className="text-xl font-extrabold text-[#181c20] font-mono mt-1">
                {formatMoney(netPatrimony, settings)}
              </p>
            </div>

            <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100">
              <span className="text-xs font-semibold text-[#006e2c]">Activos en Cuentas</span>
              <p className="text-xl font-extrabold text-[#006e2c] font-mono mt-1">
                {formatMoney(totalAssets, settings)}
              </p>
            </div>

            <div className="bg-red-50/60 p-4 rounded-2xl border border-red-100">
              <span className="text-xs font-semibold text-[#b81d17]">Deuda en Tarjetas</span>
              <p className="text-xl font-extrabold text-[#b81d17] font-mono mt-1">
                {formatMoney(totalLiabilities, settings)}
              </p>
            </div>
          </div>

          {/* Accounts Mini Breakdown */}
          {accounts.length > 0 && (
            <div className="bg-[#f8fafc] p-3 rounded-2xl border border-[#dfe3e8]/60 space-y-2">
              <span className="text-[11px] font-bold text-[#414754] uppercase tracking-wider block">
                Cuentas y Tarjetas que Alimentan este Reporte
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="p-2.5 bg-white rounded-xl border border-gray-150 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-gray-500 text-base">{acc.icon}</span>
                      <div>
                        <p className="font-bold text-[#181c20] text-[11px] leading-tight">{acc.name}</p>
                        <p className="text-[10px] text-gray-400">{acc.institution || acc.accountNumber}</p>
                      </div>
                    </div>
                    <span
                      className={`font-mono font-bold text-xs ${
                        acc.balance < 0 ? 'text-[#b81d17]' : 'text-[#181c20]'
                      }`}
                    >
                      {formatMoney(acc.balance, settings)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Summary Stat Cards for Cashflow (Transactions) */}
        <div className="space-y-3 pt-2 border-t border-gray-100">
          <h4 className="text-sm font-bold text-[#181c20] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#005bbf] text-lg">swap_vert</span>
            Flujo de Caja Mensual (Ingresos vs Gastos)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#f7f9ff] p-4 rounded-2xl border border-[#dfe3e8]">
              <span className="text-xs font-semibold text-[#414754]">Total Ingresos</span>
              <p className="text-xl font-extrabold text-[#006e2c] font-mono mt-1">
                +{formatMoney(totalIncome, settings)}
              </p>
            </div>

            <div className="bg-[#f7f9ff] p-4 rounded-2xl border border-[#dfe3e8]">
              <span className="text-xs font-semibold text-[#414754]">Total Gastos</span>
              <p className="text-xl font-extrabold text-[#b81d17] font-mono mt-1">
                -{formatMoney(totalExpense, settings)}
              </p>
            </div>

            <div className="bg-[#f7f9ff] p-4 rounded-2xl border border-[#dfe3e8]">
              <span className="text-xs font-semibold text-[#414754]">Capacidad de Ahorro</span>
              <p className="text-xl font-extrabold text-[#005bbf] font-mono mt-1">
                {savingsRate}% <span className="text-xs font-sans font-medium text-gray-500">({formatMoney(netSavings, settings)})</span>
              </p>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        {categoryList.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-[#181c20] mb-3">Distribución de Gastos por Categoría</h4>
            <div className="space-y-3">
              {categoryList.map(([cat, amount]) => {
                const pct = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;

                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[#181c20]">{cat}</span>
                      <span className="text-[#414754] font-mono">
                        {formatMoney(amount, settings)} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-[#f1f4fa] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#005bbf] rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Smart AI Financial Insight */}
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-start gap-3">
          <span className="material-symbols-outlined text-[#006e2c] text-2xl">auto_awesome</span>
          <div>
            <h5 className="text-xs font-bold text-[#005320]">Análisis Integrado de Gestión Financiera</h5>
            <p className="text-xs text-emerald-900 mt-0.5 leading-relaxed">
              Tus activos totales ascienden a <strong>{formatMoney(totalAssets, settings)}</strong> distribuidos en {accounts.length} cuentas. Tus ingresos mensuales superan tus gastos en un {savingsRate}%, manteniendo tus deudas de tarjetas en un nivel controlado del {100 - (totalAssets > 0 ? Math.round((netPatrimony / totalAssets) * 100) : 0)}% respecto a tus activos totales.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#005bbf] text-white font-bold rounded-xl shadow-xs hover:bg-[#004899] cursor-pointer text-xs"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

