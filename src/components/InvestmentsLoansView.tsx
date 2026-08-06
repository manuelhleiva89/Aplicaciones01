import React, { useState, useMemo } from 'react';
import { InvestmentItem, LoanItem, AppSettings, Account } from '../types';
import { formatMoney } from '../utils/formatters';

interface InvestmentsLoansViewProps {
  investments: InvestmentItem[];
  loans: LoanItem[];
  accounts?: Account[];
  settings: AppSettings;
  onAddInvestment: (inv: Omit<InvestmentItem, 'id'>) => void;
  onDeleteInvestment: (id: string) => void;
  onAddLoan: (loan: Omit<LoanItem, 'id'>) => void;
  onDeleteLoan: (id: string) => void;
  onNavigateToAccounts?: () => void;
  onUpdateAccount?: (acc: Account) => void;
  onDeleteAccount?: (id: string) => void;
  onAddAccount?: (acc: Omit<Account, 'id'>) => void;
}

export const InvestmentsLoansView: React.FC<InvestmentsLoansViewProps> = ({
  investments,
  loans,
  accounts = [],
  settings,
  onAddInvestment,
  onDeleteInvestment,
  onAddLoan,
  onDeleteLoan,
  onNavigateToAccounts,
  onUpdateAccount,
  onDeleteAccount,
  onAddAccount,
}) => {
  const [activeTab, setActiveTab] = useState<'investments' | 'loans'>('investments');

  // Investment Accounts
  const investmentAccounts = useMemo(() => {
    return accounts.filter((a) => a.type === 'investment');
  }, [accounts]);

  const totalInvestmentAccountsBalance = useMemo(() => {
    return investmentAccounts.reduce((sum, a) => sum + a.balance, 0);
  }, [investmentAccounts]);

  const totalPortfolioValue = totalInvestmentAccountsBalance;

  // New Investment Account Modal
  const [showAddInvAccountModal, setShowAddInvAccountModal] = useState(false);
  const [newInvName, setNewInvName] = useState('');
  const [newInvInstitution, setNewInvInstitution] = useState('');
  const [newInvNumber, setNewInvNumber] = useState('');
  const [newInvBalance, setNewInvBalance] = useState('');

  // Editing Investment Account Modal
  const [editingInvAccount, setEditingInvAccount] = useState<Account | null>(null);
  const [editInvName, setEditInvName] = useState('');
  const [editInvInstitution, setEditInvInstitution] = useState('');
  const [editInvNumber, setEditInvNumber] = useState('');
  const [editInvBalance, setEditInvBalance] = useState('');

  // Deleting Investment Account Confirmation
  const [deletingInvAccount, setDeletingInvAccount] = useState<Account | null>(null);

  // Investment Compound Interest Calculator State
  const [invAmount, setInvAmount] = useState(0);
  const [invTermMonths, setInvTermMonths] = useState(0);
  const [invRate, setInvRate] = useState(0); // % annual
  const [invMonthlyContribution, setInvMonthlyContribution] = useState(0);
  const [showInvCompoundTable, setShowInvCompoundTable] = useState(true);

  // --- Investment Compound Interest Calculation ---
  const invCalc = useMemo(() => {
    const p = Math.max(0, invAmount);
    const n = Math.max(0, invTermMonths);
    const r = Math.max(0, invRate) / 100 / 12; // monthly interest rate
    const c = Math.max(0, invMonthlyContribution);

    if (n === 0 || (p === 0 && c === 0)) {
      return {
        totalInvested: p,
        totalInterest: 0,
        finalBalance: p,
        roi: 0,
        schedule: [],
      };
    }

    let currentBalance = p;
    let totalInvested = p;
    let totalInterest = 0;

    const schedule: Array<{
      month: number;
      startBalance: number;
      contribution: number;
      interestEarned: number;
      accumulatedInterest: number;
      endBalance: number;
    }> = [];

    for (let m = 1; m <= n; m++) {
      const startBalance = currentBalance;
      const interestEarned = startBalance * r;
      totalInterest += interestEarned;
      currentBalance = startBalance + interestEarned + c;
      if (m > 1) {
        totalInvested += c;
      }

      schedule.push({
        month: m,
        startBalance,
        contribution: c,
        interestEarned,
        accumulatedInterest: totalInterest,
        endBalance: currentBalance,
      });
    }

    const roi = totalInvested > 0 ? (totalInterest / totalInvested) * 100 : 0;

    return {
      totalInvested,
      totalInterest,
      finalBalance: currentBalance,
      roi,
      schedule,
    };
  }, [invAmount, invTermMonths, invRate, invMonthlyContribution]);

  // Loan Simulator State
  const [loanTitle, setLoanTitle] = useState('Préstamo Personal / Hipotecario');
  const [loanAmount, setLoanAmount] = useState(0);
  const [loanRate, setLoanRate] = useState(0); // % annual
  const [loanTermMonths, setLoanTermMonths] = useState(0);
  const [lender, setLender] = useState('');

  const [showAmortizationTable, setShowAmortizationTable] = useState(false);

  // --- Loan Calculation (French Amortization Method) ---
  const loanCalc = useMemo(() => {
    const p = Math.max(0, loanAmount);
    const r = Math.max(0, loanRate) / 100 / 12; // monthly interest rate
    const n = Math.max(0, loanTermMonths);

    if (p === 0 || n === 0) {
      return {
        monthlyPayment: 0,
        totalRepay: 0,
        totalInterestPayable: 0,
        interestRatio: 0,
        schedule: [],
      };
    }

    let monthlyPayment = 0;
    if (r > 0) {
      monthlyPayment = (p * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
    } else {
      monthlyPayment = p / n;
    }

    const totalRepay = monthlyPayment * n;
    const totalInterestPayable = totalRepay - p;

    let balance = p;
    const schedule: Array<{
      month: number;
      payment: number;
      interest: number;
      principal: number;
      remainingBalance: number;
    }> = [];

    for (let m = 1; m <= n; m++) {
      const interest = balance * r;
      const principal = monthlyPayment - interest;
      balance = Math.max(0, balance - principal);

      schedule.push({
        month: m,
        payment: monthlyPayment,
        interest,
        principal,
        remainingBalance: balance,
      });
    }

    return {
      monthlyPayment,
      totalRepay,
      totalInterestPayable,
      interestRatio: p > 0 ? (totalInterestPayable / p) * 100 : 0,
      schedule,
    };
  }, [loanAmount, loanRate, loanTermMonths]);

  const handleCreateInvAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvName || !newInvBalance || !onAddAccount) return;

    onAddAccount({
      name: newInvName,
      institution: newInvInstitution.trim() || 'Cuenta de Inversión',
      type: 'investment',
      accountNumber: newInvNumber ? `**** ${newInvNumber.slice(-4)}` : '**** 8888',
      balance: parseFloat(newInvBalance),
      icon: 'trending_up',
      color: '#6b21a8',
    });

    setNewInvName('');
    setNewInvInstitution('');
    setNewInvNumber('');
    setNewInvBalance('');
    setShowAddInvAccountModal(false);
  };

  const handleStartEditingInvAccount = (acc: Account) => {
    setEditingInvAccount(acc);
    setEditInvName(acc.name);
    setEditInvInstitution(acc.institution || '');
    setEditInvNumber(acc.accountNumber.replace(/\D/g, ''));
    setEditInvBalance(acc.balance.toString());
  };

  const handleSaveEditInvAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvAccount || !editInvName || !editInvBalance || !onUpdateAccount) return;

    onUpdateAccount({
      ...editingInvAccount,
      name: editInvName,
      institution: editInvInstitution.trim() || undefined,
      accountNumber: editInvNumber ? `**** ${editInvNumber.slice(-4)}` : editingInvAccount.accountNumber,
      balance: parseFloat(editInvBalance),
    });

    setEditingInvAccount(null);
  };

  const handleConfirmDeleteInvAccount = () => {
    if (deletingInvAccount && onDeleteAccount) {
      onDeleteAccount(deletingInvAccount.id);
      setDeletingInvAccount(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#dfe3e8]/60 shadow-[0px_4px_20px_rgba(0,0,0,0.03)]">
        <div>
          <h2 className="text-2xl font-bold text-[#181c20]">Inversiones y Préstamos</h2>
          <p className="text-xs text-[#414754] mt-1">
            Gestión integral de tu portafolio de fondos de inversión enlazados y simulador de rendimiento y préstamos.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#f1f4fa] p-1 rounded-xl text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('investments')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'investments'
                ? 'bg-white text-[#006e2c] shadow-xs'
                : 'text-[#414754] hover:text-[#181c20]'
            }`}
          >
            <span className="material-symbols-outlined text-base">trending_up</span>
            Inversiones (Interés a Favor)
          </button>
          <button
            onClick={() => setActiveTab('loans')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'loans'
                ? 'bg-white text-[#b81d17] shadow-xs'
                : 'text-[#414754] hover:text-[#181c20]'
            }`}
          >
            <span className="material-symbols-outlined text-base">real_estate_agent</span>
            Préstamos (Interés a Pagar)
          </button>
        </div>
      </div>

      {/* TAB 1: INVERSIONES */}
      {activeTab === 'investments' && (
        <div className="space-y-6">
          {/* Investment Portfolio Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-purple-900 to-indigo-950 text-white p-5 rounded-2xl shadow-md flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-200">Portafolio Total Invertido</p>
                <p className="text-2xl font-extrabold font-mono mt-1">
                  {formatMoney(totalPortfolioValue, settings)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-200 border border-purple-400/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#dfe3e8]/60 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#414754]">Fondos en Cuentas de Inversión</p>
                <p className="text-xl font-extrabold text-purple-800 font-mono mt-1">
                  {formatMoney(totalInvestmentAccountsBalance, settings)}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">{investmentAccounts.length} cuenta(s) enlazada(s)</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">trending_up</span>
              </div>
            </div>
          </div>

          {/* LINKED INVESTMENT ACCOUNTS SECTION */}
          <div className="bg-white p-6 rounded-2xl border border-[#dfe3e8] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div>
                <p className="text-xs text-[#414754]">
                  Cuentas clasificadas como "Cuenta de Inversión" en tu módulo de Cuentas.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {onAddAccount && (
                  <button
                    onClick={() => setShowAddInvAccountModal(true)}
                    className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                    Añadir Fondo de Inversión
                  </button>
                )}
                {onNavigateToAccounts && (
                  <button
                    onClick={onNavigateToAccounts}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1"
                  >
                    Ver todas las cuentas ↗
                  </button>
                )}
              </div>
            </div>

            {investmentAccounts.length === 0 ? (
              <div className="p-6 bg-purple-50/50 rounded-2xl border border-dashed border-purple-200 text-center space-y-3">
                <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-2xl">trending_up</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#181c20]">No tienes Fondos de Inversión enlazados</h4>
                  <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
                    Puedes registrar fondos CETES, GBM, Mercado Pago Inversiones o tu broker directamente para llevar control del capital real.
                  </p>
                </div>
                {onAddAccount && (
                  <button
                    onClick={() => setShowAddInvAccountModal(true)}
                    className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                    Registrar Mi Primer Fondo de Inversión
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {investmentAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="p-4 bg-gradient-to-br from-purple-50/50 to-white rounded-2xl border border-purple-200/80 shadow-2xs space-y-3 relative group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-purple-700 text-white flex items-center justify-center shadow-xs">
                          <span className="material-symbols-outlined text-lg">trending_up</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[#181c20]">{acc.name}</h4>
                          <p className="text-[11px] text-purple-700 font-semibold">{acc.institution || 'Fondo de Inversión'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleStartEditingInvAccount(acc)}
                          className="p-1 text-gray-400 hover:text-purple-700 hover:bg-purple-100 rounded-lg transition-colors cursor-pointer"
                          title="Modificar Fondo"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        <button
                          onClick={() => setDeletingInvAccount(acc)}
                          className="p-1 text-gray-400 hover:text-[#b81d17] hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar Fondo"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-purple-100/80 flex items-baseline justify-between">
                      <span className="text-[11px] text-gray-500 font-mono">{acc.accountNumber}</span>
                      <span className="text-lg font-bold font-mono text-purple-900">
                        {formatMoney(acc.balance, settings)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CALCULADORA DE RENTABILIDAD E INTERÉS COMPUESTO (FONDOS DE INVERSIÓN) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Simulator Inputs */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#dfe3e8] shadow-xs space-y-4 text-xs">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <div className="w-8 h-8 bg-purple-50 text-purple-700 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">calculate</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#181c20]">Simulador de Fondos de Inversión</h3>
                  <p className="text-[11px] text-gray-500">Rentabilidad e interés compuesto por plazo</p>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#414754] mb-1">Monto Inicial de Inversión ($)</label>
                <input
                  type="number"
                  step="500"
                  value={invAmount}
                  onChange={(e) => setInvAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-purple-500/30 font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#414754] mb-1">Meses de Plazo</label>
                  <input
                    type="number"
                    min="0"
                    max="360"
                    value={invTermMonths}
                    onChange={(e) => setInvTermMonths(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-purple-500/30 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#414754] mb-1">Tasa de Interés Anual (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={invRate}
                    onChange={(e) => setInvRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-purple-500/30 font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#414754] mb-1">Aportación Mensual Adicional ($)</label>
                <input
                  type="number"
                  step="100"
                  value={invMonthlyContribution}
                  onChange={(e) => setInvMonthlyContribution(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-purple-500/30 font-mono text-sm"
                />
                <p className="text-[10px] text-gray-400 mt-1">Opcional: suma depósitos recurrentes cada mes</p>
              </div>
            </div>

            {/* Results & Compound Interest Table */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-md space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-semibold text-purple-200">
                      Saldo Final Estimado con Interés Compuesto
                    </span>
                    <h3 className="text-3xl font-extrabold font-mono text-emerald-400 mt-1">
                      {formatMoney(invCalc.finalBalance, settings)}
                    </h3>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold font-mono">
                    +{invCalc.roi.toFixed(1)}% Rendimiento
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-purple-700/60 text-xs">
                  <div>
                    <span className="text-purple-200 text-[11px] block">Capital Total Invertido</span>
                    <span className="font-bold text-white font-mono text-base">
                      {formatMoney(invCalc.totalInvested, settings)}
                    </span>
                  </div>
                  <div>
                    <span className="text-purple-200 text-[11px] block">Ganancia / Rentabilidad Generada</span>
                    <span className="font-bold text-emerald-400 font-mono text-base">
                      +{formatMoney(invCalc.totalInterest, settings)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tabla de Interés Compuesto */}
              <div className="bg-white p-5 rounded-2xl border border-[#dfe3e8] shadow-xs">
                <button
                  onClick={() => setShowInvCompoundTable(!showInvCompoundTable)}
                  className="w-full flex justify-between items-center text-xs font-bold text-[#181c20] cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-purple-700">table_chart</span>
                    Tabla de Interés Compuesto ({invCalc.schedule.length} meses)
                  </span>
                  <span className="material-symbols-outlined">
                    {showInvCompoundTable ? 'expand_less' : 'expand_more'}
                  </span>
                </button>

                {showInvCompoundTable && (
                  <div className="mt-4 max-h-64 overflow-y-auto border border-gray-100 rounded-xl">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-purple-50 text-purple-900 sticky top-0 font-bold">
                        <tr>
                          <th className="p-2">Mes</th>
                          <th className="p-2">Saldo Inicial</th>
                          <th className="p-2 text-purple-700">Interés Generado</th>
                          <th className="p-2 text-emerald-700">Interés Acumulado</th>
                          <th className="p-2 font-bold text-gray-900">Saldo Final</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-mono">
                        {invCalc.schedule.map((row) => (
                          <tr key={row.month} className="hover:bg-purple-50/40">
                            <td className="p-2 font-bold font-sans"># {row.month}</td>
                            <td className="p-2 text-gray-600">
                              {formatMoney(row.startBalance, settings)}
                            </td>
                            <td className="p-2 text-purple-700 font-semibold">
                              +{formatMoney(row.interestEarned, settings)}
                            </td>
                            <td className="p-2 text-emerald-700 font-bold">
                              +{formatMoney(row.accumulatedInterest, settings)}
                            </td>
                            <td className="p-2 font-bold text-gray-900">
                              {formatMoney(row.endBalance, settings)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRÉSTAMOS */}
      {activeTab === 'loans' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Loan Inputs */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#dfe3e8] shadow-xs space-y-4 text-xs">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <div className="w-8 h-8 bg-red-50 text-[#b81d17] rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">credit_score</span>
                </div>
                <h3 className="text-base font-bold text-[#181c20]">Calculadora de Préstamo</h3>
              </div>

              <div>
                <label className="block font-semibold text-[#414754] mb-1">Nombre / Concepto del Préstamo</label>
                <input
                  type="text"
                  value={loanTitle}
                  onChange={(e) => setLoanTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#b81d17]/30"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#414754] mb-1">Monto del Préstamo ($)</label>
                <input
                  type="number"
                  step="500"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#b81d17]/30 font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#414754] mb-1">Tasa Anual (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={loanRate}
                    onChange={(e) => setLoanRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#b81d17]/30 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#414754] mb-1">Plazo (Meses)</label>
                  <input
                    type="number"
                    value={loanTermMonths}
                    onChange={(e) => setLoanTermMonths(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#b81d17]/30 font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#414754] mb-1">Prestamista / Banco</label>
                <input
                  type="text"
                  placeholder="Ej. Banco Santander, BBVA, Financiera"
                  value={lender}
                  onChange={(e) => setLender(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#b81d17]/30"
                />
              </div>
            </div>

            {/* Loan Results & Amortization Table */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-gradient-to-br from-gray-900 to-slate-800 text-white p-6 rounded-2xl shadow-md space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-semibold text-gray-300">
                      Cuota Mensual Estimada
                    </span>
                    <h3 className="text-3xl font-extrabold font-mono text-amber-300 mt-1">
                      {formatMoney(loanCalc.monthlyPayment, settings)} / mes
                    </h3>
                  </div>
                  <span className="px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded-full text-xs font-bold font-mono">
                    +{loanCalc.interestRatio.toFixed(1)}% Carga Financiera
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-700 text-xs">
                  <div>
                    <span className="text-gray-300 text-[11px] block">Monto Solicitado</span>
                    <span className="font-bold text-white font-mono text-base">
                      {formatMoney(loanAmount, settings)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-300 text-[11px] block">Intereses Totales a Pagar</span>
                    <span className="font-bold text-red-400 font-mono text-base">
                      {formatMoney(loanCalc.totalInterestPayable, settings)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Full Amortization Schedule */}
              <div className="bg-white p-5 rounded-2xl border border-[#dfe3e8] shadow-xs">
                <button
                  onClick={() => setShowAmortizationTable(!showAmortizationTable)}
                  className="w-full flex justify-between items-center text-xs font-bold text-[#181c20] cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-[#b81d17]">receipt</span>
                    Tabla de Amortización Completa ({loanCalc.schedule.length} cuotas)
                  </span>
                  <span className="material-symbols-outlined">
                    {showAmortizationTable ? 'expand_less' : 'expand_more'}
                  </span>
                </button>

                {showAmortizationTable && (
                  <div className="mt-4 max-h-60 overflow-y-auto border border-gray-100 rounded-xl">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-gray-50 text-gray-600 sticky top-0">
                        <tr>
                          <th className="p-2">Cuota</th>
                          <th className="p-2 font-bold">Pago Total</th>
                          <th className="p-2 text-[#006e2c]">Abono Capital</th>
                          <th className="p-2 text-[#b81d17]">Interés</th>
                          <th className="p-2">Saldo Pendiente</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-mono">
                        {loanCalc.schedule.map((row) => (
                          <tr key={row.month} className="hover:bg-gray-50/80">
                            <td className="p-2 font-bold font-sans"># {row.month}</td>
                            <td className="p-2 font-bold text-gray-900">
                              {formatMoney(row.payment, settings)}
                            </td>
                            <td className="p-2 text-[#006e2c]">
                              {formatMoney(row.principal, settings)}
                            </td>
                            <td className="p-2 text-[#b81d17]">
                              {formatMoney(row.interest, settings)}
                            </td>
                            <td className="p-2 text-gray-600">
                              {formatMoney(row.remainingBalance, settings)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Investment Account Modal */}
      {showAddInvAccountModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#dfe3e8] shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#181c20]">Añadir Fondo de Inversión</h3>
              <button
                onClick={() => setShowAddInvAccountModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInvAccount} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[#414754] mb-1">Nombre del Fondo / Portafolio</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. CETES Directo, Portafolio GBM, Nu Cdt"
                  value={newInvName}
                  onChange={(e) => setNewInvName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#414754] mb-1">Plataforma / Institución Financiera</label>
                <input
                  type="text"
                  placeholder="Ej. CETES, GBM+, Mercado Pago, Nu, Interactive Brokers"
                  value={newInvInstitution}
                  onChange={(e) => setNewInvInstitution(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#414754] mb-1">Últimos 4 dígitos de la cuenta / contrato</label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="9921"
                  value={newInvNumber}
                  onChange={(e) => setNewInvNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-600 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#414754] mb-1">Saldo Actual Invertido ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="5000.00"
                  value={newInvBalance}
                  onChange={(e) => setNewInvBalance(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-600 outline-none font-mono"
                />
              </div>

              <div className="pt-4 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddInvAccountModal(false)}
                  className="px-4 py-2 bg-[#f1f4fa] text-[#414754] font-semibold rounded-xl hover:bg-[#e5e8ee] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-700 text-white font-semibold rounded-xl hover:bg-purple-800 cursor-pointer shadow-xs"
                >
                  Guardar Fondo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Investment Account Modal */}
      {editingInvAccount && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#dfe3e8] shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#181c20]">Modificar Fondo de Inversión</h3>
              <button
                onClick={() => setEditingInvAccount(null)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditInvAccount} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[#414754] mb-1">Nombre del Fondo</label>
                <input
                  type="text"
                  required
                  value={editInvName}
                  onChange={(e) => setEditInvName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#414754] mb-1">Institución / Plataforma</label>
                <input
                  type="text"
                  value={editInvInstitution}
                  onChange={(e) => setEditInvInstitution(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#414754] mb-1">Últimos 4 dígitos de contrato</label>
                <input
                  type="text"
                  maxLength={4}
                  value={editInvNumber}
                  onChange={(e) => setEditInvNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-600 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#414754] mb-1">Saldo Actual Invertido ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editInvBalance}
                  onChange={(e) => setEditInvBalance(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-600 outline-none font-mono"
                />
              </div>

              <div className="pt-4 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingInvAccount(null)}
                  className="px-4 py-2 bg-[#f1f4fa] text-[#414754] font-semibold rounded-xl hover:bg-[#e5e8ee] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-700 text-white font-semibold rounded-xl hover:bg-purple-800 cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Investment Account Confirmation */}
      {deletingInvAccount && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-[#dfe3e8] shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-[#b81d17] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">warning</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#181c20]">¿Eliminar fondo de inversión?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Vas a eliminar el fondo <strong>{deletingInvAccount.name}</strong> (${deletingInvAccount.balance.toLocaleString('en-US')}).
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeletingInvAccount(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDeleteInvAccount}
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
