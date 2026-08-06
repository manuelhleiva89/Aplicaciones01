import React, { useState, useRef, useMemo } from 'react';
import {
  Transaction,
  WeeklyChartData,
  FinancialGoal,
  InvestmentItem,
  LoanItem,
  Account,
  AppSettings,
  TabType,
} from '../types';
import { formatMoney } from '../utils/formatters';

interface DashboardChartsCarouselProps {
  transactions?: Transaction[];
  weeklyData: WeeklyChartData[];
  goals: FinancialGoal[];
  investments: InvestmentItem[];
  loans: LoanItem[];
  accounts: Account[];
  settings: AppSettings;
  setActiveTab: (tab: TabType) => void;
}

export const DashboardChartsCarousel: React.FC<DashboardChartsCarouselProps> = ({
  transactions = [],
  weeklyData,
  goals,
  investments,
  loans,
  accounts,
  settings,
  setActiveTab,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [chartTimeframe, setChartTimeframe] = useState<'weekly' | 'monthly'>('weekly');

  // Dynamic computation of income vs expense based on timeframe and transactions
  const flowData = useMemo(() => {
    if (chartTimeframe === 'weekly') {
      const weeks = [
        { label: 'Sem 1', income: 0, expense: 0 },
        { label: 'Sem 2', income: 0, expense: 0 },
        { label: 'Sem 3', income: 0, expense: 0 },
        { label: 'Sem 4', income: 0, expense: 0 },
      ];

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      if (transactions && transactions.length > 0) {
        transactions.forEach((tx) => {
          let txDate: Date | null = null;
          if (tx.timestamp) {
            txDate = new Date(tx.timestamp);
          } else if (tx.date) {
            const parsed = new Date(tx.date);
            if (!isNaN(parsed.getTime())) txDate = parsed;
          }

          if (txDate && !isNaN(txDate.getTime())) {
            if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
              const day = txDate.getDate();
              let idx = 3;
              if (day <= 7) idx = 0;
              else if (day <= 14) idx = 1;
              else if (day <= 21) idx = 2;

              const amt = Math.abs(tx.amount);
              if (tx.type === 'income') {
                weeks[idx].income += amt;
              } else if (tx.type === 'expense') {
                weeks[idx].expense += amt;
              }
            }
          }
        });
      }

      const totalCalculated = weeks.reduce((sum, w) => sum + w.income + w.expense, 0);

      // If transactions yielded data for current month, use it
      if (totalCalculated > 0) {
        return weeks;
      }

      // Otherwise respect the application's stored weeklyData
      if (weeklyData && weeklyData.length > 0) {
        return weeklyData.map((d) => ({
          label: d.week,
          income: d.income,
          expense: d.expense,
        }));
      }

      return weeks;
    } else {
      // Monthly timeframe: last 6 months
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const now = new Date();
      const monthsList: { label: string; month: number; year: number; income: number; expense: number }[] = [];

      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthsList.push({
          label: monthNames[d.getMonth()],
          month: d.getMonth(),
          year: d.getFullYear(),
          income: 0,
          expense: 0,
        });
      }

      if (transactions && transactions.length > 0) {
        transactions.forEach((tx) => {
          let txDate: Date | null = null;
          if (tx.timestamp) {
            txDate = new Date(tx.timestamp);
          } else if (tx.date) {
            const parsed = new Date(tx.date);
            if (!isNaN(parsed.getTime())) txDate = parsed;
          }

          if (txDate && !isNaN(txDate.getTime())) {
            const txMonth = txDate.getMonth();
            const txYear = txDate.getFullYear();

            const target = monthsList.find((m) => m.month === txMonth && m.year === txYear);
            if (target) {
              const amt = Math.abs(tx.amount);
              if (tx.type === 'income') {
                target.income += amt;
              } else if (tx.type === 'expense') {
                target.expense += amt;
              }
            }
          }
        });
      }

      const totalMonthlyCalculated = monthsList.reduce((sum, m) => sum + m.income + m.expense, 0);

      if (totalMonthlyCalculated > 0) {
        return monthsList.map((m) => ({
          label: m.label,
          income: m.income,
          expense: m.expense,
        }));
      }

      // Fallback monthly baseline data derived from application weeklyData or defaults
      const weeklySumIncome = (weeklyData && weeklyData.length > 0)
        ? weeklyData.reduce((s, w) => s + w.income, 0)
        : 11300;
      const weeklySumExpense = (weeklyData && weeklyData.length > 0)
        ? weeklyData.reduce((s, w) => s + w.expense, 0)
        : 6000;

      const monthlyMultipliers = [0.85, 0.92, 1.05, 0.98, 1.1, 1.0];

      return monthsList.map((m, idx) => ({
        label: m.label,
        income: Math.round(weeklySumIncome * monthlyMultipliers[idx % monthlyMultipliers.length]),
        expense: Math.round(weeklySumExpense * monthlyMultipliers[idx % monthlyMultipliers.length]),
      }));
    }
  }, [transactions, chartTimeframe, weeklyData]);

  const maxVal = useMemo(() => {
    const values = flowData.flatMap((d) => [d.income, d.expense]);
    const highest = Math.max(...values, 0);
    return highest > 0 ? highest * 1.1 : 100;
  }, [flowData]);

  // Swipe gesture handling
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const slides = [
    { id: 'income_expenses', title: 'Ingresos vs Gastos', icon: 'bar_chart' },
    { id: 'goals', title: 'Metas Financieras', icon: 'flag' },
    { id: 'investments', title: 'Inversiones y Proyección', icon: 'trending_up' },
    { id: 'liquidity_debts', title: 'Disponibilidad vs Deudas', icon: 'account_balance' },
    { id: 'credit_cards', title: 'Tarjetas: Disponibilidad vs Gasto', icon: 'credit_card' },
  ];

  const totalSlides = slides.length;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 40;
    const isRightSwipe = distance < -40;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // --- Calculations for Slide 2: Goals ---
  const totalSavedGoals = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTargetGoals = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const overallGoalsPct = totalTargetGoals > 0 ? Math.min(100, (totalSavedGoals / totalTargetGoals) * 100) : 0;

  // --- Calculations for Slide 3: Investments ---
  const investmentAccounts = accounts.filter((a) => a.type === 'investment');
  const totalInvestmentAccountsBalance = investmentAccounts.reduce((sum, a) => sum + a.balance, 0);

  // --- Calculations for Slide 4: Liquidity vs Debts ---
  // Liquid assets = accounts where type !== 'credit' and balance > 0
  const totalLiquidity = accounts.reduce((sum, acc) => {
    if (acc.type !== 'credit') {
      return sum + Math.max(0, acc.balance);
    }
    return sum;
  }, 0);

  // Total Debts = sum of loans + absolute credit card negative balances
  const totalLoanDebts = loans.reduce((sum, l) => sum + l.loanAmount, 0);
  const totalCreditDebts = accounts.reduce((sum, acc) => {
    if (acc.type === 'credit' && acc.balance < 0) {
      return sum + Math.abs(acc.balance);
    }
    return sum;
  }, 0);
  const totalDebts = totalLoanDebts + totalCreditDebts;

  const netNetValue = totalLiquidity - totalDebts;
  const maxLiquidityDebt = Math.max(1, totalLiquidity, totalDebts);
  const liquidityPct = Math.min(100, (totalLiquidity / maxLiquidityDebt) * 100);
  const debtPct = Math.min(100, (totalDebts / maxLiquidityDebt) * 100);

  // --- Calculations for Slide 5: Credit Cards Availability vs Spent ---
  const creditCards = accounts.filter((a) => a.type === 'credit');
  const totalCreditLimit = creditCards.reduce((sum, c) => sum + (c.creditLimit || 5000), 0);
  const totalCreditSpent = creditCards.reduce((sum, c) => sum + (c.balance < 0 ? Math.abs(c.balance) : 0), 0);
  const totalCreditAvailable = Math.max(0, totalCreditLimit - totalCreditSpent);
  const totalCreditUsagePct = totalCreditLimit > 0 ? Math.min(100, Math.round((totalCreditSpent / totalCreditLimit) * 100)) : 0;
  const totalCreditAvailablePct = Math.max(0, 100 - totalCreditUsagePct);

  return (
    <div
      className="bg-white rounded-2xl p-5 md:p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-[#dfe3e8]/50 flex flex-col justify-between select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header with Navigation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#005bbf] flex items-center justify-center">
            <span className="material-symbols-outlined text-lg">{slides[currentSlide].icon}</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-[#181c20]">{slides[currentSlide].title}</h3>
          </div>
        </div>

        {/* Carousel Prev/Next & Dots */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          {/* Quick Tab Indicators */}
          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
            {slides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentSlide === idx ? 'w-6 bg-[#005bbf]' : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                title={slide.title}
              />
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={prevSlide}
              className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
              title="Anterior"
            >
              <span className="material-symbols-outlined text-base">chevron_left</span>
            </button>
            <button
              onClick={nextSlide}
              className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
              title="Siguiente"
            >
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* SLIDE 0: INGRESOS VS GASTOS */}
      {currentSlide === 0 && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500 font-medium">Comparativo de flujos de efectivo</span>
            <div className="flex items-center gap-1 bg-[#f1f4fa] p-1 rounded-xl font-semibold">
              <button
                onClick={() => setChartTimeframe('weekly')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  chartTimeframe === 'weekly' ? 'bg-white text-[#005bbf] shadow-2xs' : 'text-[#414754]'
                }`}
              >
                Semanal
              </button>
              <button
                onClick={() => setChartTimeframe('monthly')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  chartTimeframe === 'monthly' ? 'bg-white text-[#005bbf] shadow-2xs' : 'text-[#414754]'
                }`}
              >
                Mensual
              </button>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="pt-2 border-b border-[#dfe3e8] pb-3">
            <div className="h-44 flex items-end justify-around gap-2 px-1">
              {flowData.map((data, idx) => {
                const incHeight = Math.min(100, Math.round((data.income / maxVal) * 100));
                const expHeight = Math.min(100, Math.round((data.expense / maxVal) * 100));

                return (
                  <div key={idx} className="flex flex-col items-center gap-2 w-full group">
                    <div className="flex items-end justify-center w-full gap-1 h-32">
                      {/* Income Bar */}
                      <div
                        style={{ height: `${incHeight}%` }}
                        className="w-3.5 md:w-5 bg-[#005bbf] rounded-t-md hover:bg-[#1a73e8] transition-all cursor-pointer relative"
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-1.5 rounded font-mono pointer-events-none transition-opacity z-10 whitespace-nowrap shadow-md z-20">
                          +{formatMoney(data.income, settings)}
                        </div>
                      </div>

                      {/* Expense Bar */}
                      <div
                        style={{ height: `${expHeight}%` }}
                        className="w-3.5 md:w-5 bg-[#b81d17] rounded-t-md hover:bg-[#dc392c] transition-all cursor-pointer relative"
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-1.5 rounded font-mono pointer-events-none transition-opacity z-10 whitespace-nowrap shadow-md z-20">
                          -{formatMoney(data.expense, settings)}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-[#414754] group-hover:text-[#005bbf] transition-colors">
                      {data.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart Legend */}
          <div className="flex justify-center items-center gap-6 text-xs pt-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#005bbf] inline-block"></span>
              <span className="font-semibold text-[#414754]">Ingresos</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#b81d17] inline-block"></span>
              <span className="font-semibold text-[#414754]">Gastos</span>
            </div>
          </div>
        </div>
      )}

      {/* SLIDE 1: METAS FINANCIERAS */}
      {currentSlide === 1 && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
            <div>
              <p className="text-[10px] font-bold text-[#005bbf] uppercase">Ahorro Acumulado en Metas</p>
              <p className="text-base font-extrabold text-[#181c20] font-mono">
                {formatMoney(totalSavedGoals, settings)} / {formatMoney(totalTargetGoals, settings)}
              </p>
            </div>
            <button
              onClick={() => setActiveTab('goals')}
              className="px-3 py-1.5 bg-[#005bbf] hover:bg-[#004899] text-white font-semibold rounded-lg shadow-xs text-[11px] transition-all cursor-pointer flex items-center gap-1"
            >
              Ver Metas
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </button>
          </div>

          {/* Goals Progress Bars */}
          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {goals.map((goal) => {
              const pct = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
              return (
                <div key={goal.id} className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#181c20] flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: goal.color || '#005bbf' }}
                      />
                      {goal.title}
                    </span>
                    <span className="font-mono font-extrabold text-[#005bbf]">{pct.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: goal.color || '#005bbf',
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                    <span>{formatMoney(goal.currentAmount, settings)}</span>
                    <span>Meta: {formatMoney(goal.targetAmount, settings)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SLIDE 2: INVERSIONES Y FONDOS */}
      {currentSlide === 2 && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-3.5 bg-gradient-to-r from-purple-900 to-indigo-950 text-white rounded-xl shadow-xs flex items-center justify-between text-xs">
            <div>
              <p className="text-[10px] text-purple-200 font-semibold uppercase">Capital Total en Inversiones</p>
              <p className="text-xl font-extrabold font-mono text-purple-200">
                {formatMoney(totalInvestmentAccountsBalance, settings)}
              </p>
              <p className="text-[10px] text-purple-300 mt-0.5">
                {investmentAccounts.length} fondo(s) de inversión enlazado(s)
              </p>
            </div>
            <button
              onClick={() => setActiveTab('investments')}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-xs text-[11px] transition-all cursor-pointer flex items-center gap-1"
            >
              Inversiones
              <span className="material-symbols-outlined text-xs">trending_up</span>
            </button>
          </div>

          {/* Investment Portfolio Composition */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-700">Cuentas de Inversión Enlazadas</h4>
            {investmentAccounts.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-2">No tienes cuentas de inversión registradas.</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1 text-xs">
                {investmentAccounts.map((acc) => (
                  <div key={acc.id} className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#181c20]">{acc.name}</p>
                      <p className="text-[10px] text-purple-700 font-semibold">
                        {acc.institution || 'Cuenta de Inversión'}
                      </p>
                    </div>
                    <span className="font-extrabold text-purple-900 font-mono">
                      {formatMoney(acc.balance, settings)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SLIDE 3: DISPONIBILIDAD VS DEUDAS */}
      {currentSlide === 3 && (
        <div className="space-y-4 animate-fadeIn">
          {/* Summary Badges */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-[#006e2c] block">Disponibilidad Líquida</span>
              <span className="text-lg font-extrabold text-[#006e2c] font-mono">
                {formatMoney(totalLiquidity, settings)}
              </span>
              <span className="text-[10px] text-gray-500 block mt-0.5">Cuentas bancarias y efectivo</span>
            </div>

            <div className="p-3 bg-red-50 rounded-xl border border-red-200">
              <span className="text-[10px] uppercase font-bold text-[#b81d17] block">Deudas & Préstamos</span>
              <span className="text-lg font-extrabold text-[#b81d17] font-mono">
                {formatMoney(totalDebts, settings)}
              </span>
              <span className="text-[10px] text-gray-500 block mt-0.5">Préstamos y Tarjetas de Crédito</span>
            </div>
          </div>

          {/* Visual Comparison Bars */}
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-3 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-[#006e2c]">Disponibilidad (Activos)</span>
                <span className="font-mono text-gray-600">{formatMoney(totalLiquidity, settings)}</span>
              </div>
              <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                <div className="h-full bg-[#006e2c] rounded-full transition-all duration-500" style={{ width: `${liquidityPct}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-[#b81d17]">Deudas Total (Pasivos)</span>
                <span className="font-mono text-gray-600">{formatMoney(totalDebts, settings)}</span>
              </div>
              <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                <div className="h-full bg-[#b81d17] rounded-full transition-all duration-500" style={{ width: `${debtPct}%` }} />
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-xs">
              <span className="font-bold text-[#181c20]">Patrimonio Neto Líquido:</span>
              <span className={`font-mono font-extrabold text-sm ${netNetValue >= 0 ? 'text-[#006e2c]' : 'text-[#b81d17]'}`}>
                {formatMoney(netNetValue, settings)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SLIDE 4: DISPONIBILIDAD DE TARJETAS VS GASTO ACUMULADO */}
      {currentSlide === 4 && (
        <div className="space-y-4 animate-fadeIn">
          {/* Summary Badges */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
              <span className="text-[10px] uppercase font-bold text-gray-500 block">Límite Total</span>
              <span className="text-xs sm:text-sm md:text-base font-extrabold text-[#181c20] font-mono">
                {formatMoney(totalCreditLimit, settings)}
              </span>
            </div>

            <div className="p-2.5 bg-red-50/80 rounded-xl border border-red-200">
              <span className="text-[10px] uppercase font-bold text-[#b81d17] block">Gasto Acumulado</span>
              <span className="text-xs sm:text-sm md:text-base font-extrabold text-[#b81d17] font-mono">
                {formatMoney(totalCreditSpent, settings)}
              </span>
            </div>

            <div className="p-2.5 bg-emerald-50/80 rounded-xl border border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-[#006e2c] block">Disponible</span>
              <span className="text-xs sm:text-sm md:text-base font-extrabold text-[#006e2c] font-mono">
                {formatMoney(totalCreditAvailable, settings)}
              </span>
            </div>
          </div>

          {/* Combined Progress Bar */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2 text-xs">
            <div className="flex justify-between items-center text-[11px]">
              <span className="font-bold text-gray-700">Uso Global de Crédito ({totalCreditUsagePct}% Usado)</span>
              <span className="font-bold text-[#006e2c]">{totalCreditAvailablePct}% Libre</span>
            </div>

            <div className="w-full bg-emerald-500 h-3.5 rounded-full overflow-hidden flex relative shadow-inner">
              <div
                className="bg-[#b81d17] h-full transition-all duration-500 flex items-center justify-center text-[9px] text-white font-bold shrink-0"
                style={{ width: `${totalCreditUsagePct}%` }}
                title={`Gasto acumulado: ${totalCreditUsagePct}%`}
              >
                {totalCreditUsagePct > 15 ? `${totalCreditUsagePct}%` : ''}
              </div>
              <div
                className="bg-[#006e2c] h-full transition-all duration-500 flex items-center justify-center text-[9px] text-white font-bold shrink-0"
                style={{ width: `${totalCreditAvailablePct}%` }}
                title={`Disponible: ${totalCreditAvailablePct}%`}
              >
                {totalCreditAvailablePct > 15 ? `${totalCreditAvailablePct}% Libre` : ''}
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] pt-1 text-gray-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#b81d17] inline-block" />
                <span>Gasto Acumulado (Deuda)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#006e2c] inline-block" />
                <span>Disponibilidad Libre</span>
              </div>
            </div>
          </div>

          {/* Breakdown per Card */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-gray-700">Desglose por Tarjeta</span>
              <button
                onClick={() => setActiveTab('accounts')}
                className="text-[11px] font-bold text-[#005bbf] hover:underline flex items-center gap-1 cursor-pointer"
              >
                Ver Cuentas
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </button>
            </div>

            {creditCards.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-2 text-center">No tienes tarjetas de crédito registradas.</p>
            ) : (
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1 text-xs">
                {creditCards.map((card) => {
                  const limit = card.creditLimit || 5000;
                  const spent = card.balance < 0 ? Math.abs(card.balance) : 0;
                  const available = Math.max(0, limit - spent);
                  const usagePct = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
                  const availPct = Math.max(0, 100 - usagePct);

                  return (
                    <div key={card.id} className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] shrink-0"
                            style={{ backgroundColor: card.color || '#b81d17' }}
                          >
                            <span className="material-symbols-outlined text-xs">credit_card</span>
                          </div>
                          <div>
                            <span className="font-bold text-[#181c20] block">{card.name}</span>
                            <span className="text-[10px] text-gray-500 font-mono">{card.accountNumber}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-bold font-mono text-[#006e2c] block">
                            {formatMoney(available, settings)} libre
                          </span>
                          <span className="text-[10px] font-mono text-[#b81d17]">
                            -{formatMoney(spent, settings)} gastado
                          </span>
                        </div>
                      </div>

                      {/* Card individual bar */}
                      <div className="w-full bg-emerald-200/60 h-2 rounded-full overflow-hidden flex">
                        <div
                          className="bg-[#b81d17] h-full transition-all duration-300 shrink-0"
                          style={{ width: `${usagePct}%` }}
                          title={`Gastado: ${usagePct}%`}
                        />
                        <div
                          className="bg-[#006e2c] h-full transition-all duration-300 shrink-0"
                          style={{ width: `${availPct}%` }}
                          title={`Disponible: ${availPct}%`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
