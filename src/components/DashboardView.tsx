import React from 'react';
import {
  Transaction,
  WeeklyChartData,
  TabType,
  FinancialGoal,
  InvestmentItem,
  LoanItem,
  Account,
  AppSettings,
} from '../types';
import { DashboardChartsCarousel } from './DashboardChartsCarousel';
import { formatMoney } from '../utils/formatters';

interface DashboardViewProps {
  totalBalance: number;
  transactions: Transaction[];
  weeklyData: WeeklyChartData[];
  goals?: FinancialGoal[];
  investments?: InvestmentItem[];
  loans?: LoanItem[];
  accounts?: Account[];
  settings?: AppSettings;
  onOpenAddExpense: () => void;
  onOpenTransfer: () => void;
  onOpenReports: () => void;
  setActiveTab: (tab: TabType) => void;
  onSelectTransaction?: (tx: Transaction) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  totalBalance,
  transactions,
  weeklyData,
  goals = [],
  investments = [],
  loans = [],
  accounts = [],
  settings = { currencySymbol: '$', currencyCode: 'USD', decimals: 2, expenseCategories: [], incomeCategories: [] },
  onOpenAddExpense,
  onOpenTransfer,
  onOpenReports,
  setActiveTab,
  onSelectTransaction,
}) => {
  const recentTransactions = transactions.slice(0, 5);

  // Derived indicator calculations directly from stored accounts and cards
  const totalAssets = accounts
    .filter((a) => a.balance > 0)
    .reduce((sum, a) => sum + a.balance, 0);

  const totalLiabilities = accounts
    .filter((a) => a.balance < 0)
    .reduce((sum, a) => sum + Math.abs(a.balance), 0);

  const bankAccounts = accounts.filter((a) => a.type !== 'credit');
  const creditCards = accounts.filter((a) => a.type === 'credit');

  const totalBankAssets = bankAccounts.reduce((sum, a) => sum + (a.balance > 0 ? a.balance : 0), 0);
  const totalCreditLimit = creditCards.reduce((sum, c) => sum + (c.creditLimit || 5000), 0);
  const totalCreditDebt = creditCards.reduce((sum, c) => sum + (c.balance < 0 ? Math.abs(c.balance) : 0), 0);
  const totalCreditAvailable = Math.max(0, totalCreditLimit - totalCreditDebt);

  const totalVolume = totalAssets + totalLiabilities;
  const assetsPercentage = totalVolume > 0 ? Math.round((totalAssets / totalVolume) * 100) : 100;
  const liabilitiesPercentage = totalVolume > 0 ? 100 - assetsPercentage : 0;

  return (
    <div className="space-y-6 pb-8">
      {/* Balance Total Card */}
      <section className="w-full">
        <div className="bg-white rounded-2xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-[#dfe3e8]/50 flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#005bbf] text-xl">account_balance_wallet</span>
                <h3 className="text-sm font-semibold text-[#414754] tracking-wide">Balance Total Neto</h3>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl md:text-4xl font-extrabold text-[#181c20] tracking-tight font-mono">
                  {formatMoney(totalBalance, settings)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('accounts')}
              className="px-3.5 py-2 bg-[#f1f4fa] hover:bg-[#e2e8f0] text-[#005bbf] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">credit_card</span>
              <span>Gestionar Cuentas ({accounts.length})</span>
            </button>
          </div>

          {/* Accounts & Credit Cards Indicator Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-gray-100">
            {/* Activos en Cuentas Bancarias */}
            <div
              onClick={() => setActiveTab('accounts')}
              className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center justify-between cursor-pointer hover:bg-emerald-50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#006e2c] flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">account_balance</span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-emerald-900 block leading-tight">
                    Cuentas Bancarias ({bankAccounts.length})
                  </span>
                  <span className="text-xs font-extrabold text-[#006e2c] font-mono">
                    {formatMoney(totalBankAssets, settings)}
                  </span>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-200/60 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                Saldo Disponible
              </span>
            </div>

            {/* Disponibilidad en Tarjetas de Crédito */}
            <div
              onClick={() => setActiveTab('accounts')}
              className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between cursor-pointer hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#005bbf] flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">credit_card</span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-blue-900 block leading-tight">
                    Disponibilidad Tarjetas ({creditCards.length})
                  </span>
                  <span className="text-xs font-extrabold text-[#005bbf] font-mono">
                    {formatMoney(totalCreditAvailable, settings)}
                  </span>
                </div>
              </div>
              <span className="text-[10px] bg-blue-200/60 text-blue-900 px-2 py-0.5 rounded-full font-bold">
                Límite Libre
              </span>
            </div>
          </div>

          {/* Activos vs Pasivos Proportional Ratio Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between items-center text-xs text-[#414754]">
              <span className="font-semibold text-emerald-800 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                Activos: {assetsPercentage}%
              </span>
              <span className="font-semibold text-red-700 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
                Pasivos: {liabilitiesPercentage}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-[#006e2c] transition-all duration-500"
                style={{ width: `${assetsPercentage}%` }}
                title={`Activos: ${assetsPercentage}%`}
              ></div>
              <div
                className="h-full bg-[#b81d17] transition-all duration-500"
                style={{ width: `${liabilitiesPercentage}%` }}
                title={`Pasivos: ${liabilitiesPercentage}%`}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Action Buttons */}
      <section className="grid grid-cols-3 gap-3 md:gap-4">
        {/* Añadir Gasto */}
        <button
          onClick={onOpenAddExpense}
          className="flex flex-col items-center justify-center p-3.5 bg-white rounded-2xl border border-[#dfe3e8]/60 shadow-2xs hover:shadow-md hover:border-[#005bbf]/40 transition-all duration-200 cursor-pointer group active:scale-98"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#005bbf] text-white flex items-center justify-center shadow-md group-hover:bg-[#004899] group-hover:scale-105 transition-all">
            <span className="material-symbols-outlined text-2xl">add_circle</span>
          </div>
          <span className="text-xs font-semibold text-[#181c20] mt-2">Añadir Gasto</span>
        </button>

        {/* Transferir */}
        <button
          onClick={onOpenTransfer}
          className="flex flex-col items-center justify-center p-3.5 bg-white rounded-2xl border border-[#dfe3e8]/60 shadow-2xs hover:shadow-md hover:border-gray-400/40 transition-all duration-200 cursor-pointer group active:scale-98"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#dfe3e8] text-[#181c20] flex items-center justify-center shadow-2xs group-hover:bg-[#cbd5e1] group-hover:scale-105 transition-all">
            <span className="material-symbols-outlined text-2xl">swap_horiz</span>
          </div>
          <span className="text-xs font-semibold text-[#181c20] mt-2">Transferir</span>
        </button>

        {/* Ver Reportes */}
        <button
          onClick={onOpenReports}
          className="flex flex-col items-center justify-center p-3.5 bg-white rounded-2xl border border-[#dfe3e8]/60 shadow-2xs hover:shadow-md hover:border-gray-400/40 transition-all duration-200 cursor-pointer group active:scale-98"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#dfe3e8] text-[#181c20] flex items-center justify-center shadow-2xs group-hover:bg-[#cbd5e1] group-hover:scale-105 transition-all">
            <span className="material-symbols-outlined text-2xl">analytics</span>
          </div>
          <span className="text-xs font-semibold text-[#181c20] mt-2">Ver Reportes</span>
        </button>
      </section>



      {/* Main Grid for Chart Carousel & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Charts Carousel */}
        <section className="lg:col-span-7">
          <DashboardChartsCarousel
            transactions={transactions}
            weeklyData={weeklyData}
            goals={goals}
            investments={investments}
            loans={loans}
            accounts={accounts}
            settings={settings}
            setActiveTab={setActiveTab}
          />
        </section>

        {/* Recent Activity Section */}
        <section className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-[#dfe3e8]/50 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-[#181c20]">Actividad Reciente</h3>
              <button
                onClick={() => setActiveTab('transactions')}
                className="text-xs font-bold text-[#005bbf] hover:underline flex items-center gap-1 cursor-pointer"
              >
                Ver Todo
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            {/* List of Recent Transactions */}
            <div className="divide-y divide-[#dfe3e8]/50">
              {recentTransactions.map((tx) => {
                const isIncome = tx.type === 'income';
                const formattedAmt = Math.abs(tx.amount).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                });

                return (
                  <div
                    key={tx.id}
                    onClick={() => onSelectTransaction && onSelectTransaction(tx)}
                    className="flex items-center justify-between py-3.5 px-2 hover:bg-[#f7f9ff] transition-colors rounded-xl cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#dfe3e8]/60 flex items-center justify-center text-[#414754] group-hover:bg-blue-50 group-hover:text-[#005bbf] transition-colors">
                        <span className="material-symbols-outlined text-xl">{tx.icon || 'receipt'}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#181c20] group-hover:text-[#005bbf] transition-colors">
                          {tx.title}
                        </h4>
                        <p className="text-xs text-[#414754] mt-0.5">{tx.date}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-sm font-bold font-mono ${
                          isIncome ? 'text-[#006e2c]' : 'text-[#b81d17]'
                        }`}
                      >
                        {isIncome ? `+$${formattedAmt}` : `-$${formattedAmt}`}
                      </span>
                      <p className="text-[11px] text-gray-400 capitalize mt-0.5">{tx.category}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#dfe3e8]/40 text-center">
            <button
              onClick={onOpenAddExpense}
              className="w-full py-2.5 px-4 bg-[#f1f4fa] hover:bg-[#e5e8ee] text-[#005bbf] font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Registrar nuevo movimiento
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
