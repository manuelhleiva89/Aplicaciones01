import React, { useState, useEffect, useMemo } from 'react';
import {
  TabType,
  Transaction,
  Account,
  PaymentItem,
  NotificationItem,
  UserProfile,
  WeeklyChartData,
  AppSettings,
  AuthUser,
  FinancialGoal,
  InvestmentItem,
  LoanItem,
} from './types';
import {
  initialAccounts,
  initialTransactions,
  initialWeeklyChartData,
  initialPayments,
  initialNotifications,
  initialUserProfile,
  initialAppSettings,
  initialAuthUser,
  initialGoals,
  initialInvestments,
  initialLoans,
} from './data/mockData';

import { Header } from './components/Header';
import { BottomNavBar } from './components/BottomNavBar';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { AccountsView } from './components/AccountsView';
import { PaymentsView } from './components/PaymentsView';
import { GoalsView } from './components/GoalsView';
import { InvestmentsLoansView } from './components/InvestmentsLoansView';
import { SettingsView } from './components/SettingsView';

import { AddExpenseModal } from './components/modals/AddExpenseModal';
import { TransferModal } from './components/modals/TransferModal';
import { ReportsModal } from './components/modals/ReportsModal';
import { NotificationDrawer } from './components/modals/NotificationDrawer';
import { AuthModal } from './components/modals/AuthModal';
import { CreditCardPayModal, CreditCardPayExecution } from './components/modals/CreditCardPayModal';
import { DemoLimitModal } from './components/modals/DemoLimitModal';
import { ChangePinModal } from './components/modals/ChangePinModal';
import { PinLockScreen } from './components/PinLockScreen';
import { syncCreditCardPayments } from './utils/creditCard';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Security PIN and Lock state
  const [savedPin, setSavedPin] = useState<string>(() => {
    return localStorage.getItem('fintrack_pin') || '1234';
  });

  const [isPinEnabled, setIsPinEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('fintrack_pin_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  const [isLocked, setIsLocked] = useState<boolean>(() => {
    const saved = localStorage.getItem('fintrack_pin_enabled');
    const enabled = saved !== null ? saved === 'true' : true;
    return enabled;
  });

  const [isChangePinModalOpen, setIsChangePinModalOpen] = useState(false);

  const [demoLimitModalInfo, setDemoLimitModalInfo] = useState<{
    isOpen: boolean;
    itemType: 'cuentas' | 'tarjetas de crédito' | 'fondos de inversión' | 'préstamos';
  }>({
    isOpen: false,
    itemType: 'cuentas',
  });

  useEffect(() => {
    localStorage.setItem('fintrack_pin', savedPin);
  }, [savedPin]);

  useEffect(() => {
    localStorage.setItem('fintrack_pin_enabled', String(isPinEnabled));
  }, [isPinEnabled]);

  // App persistent state with localStorage initializers
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('fintrack_accounts');
    return saved ? JSON.parse(saved) : initialAccounts;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('fintrack_transactions');
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [weeklyData, setWeeklyData] = useState<WeeklyChartData[]>(() => {
    const saved = localStorage.getItem('fintrack_weekly_data');
    return saved ? JSON.parse(saved) : initialWeeklyChartData;
  });

  const [payments, setPayments] = useState<PaymentItem[]>(() => {
    const saved = localStorage.getItem('fintrack_payments');
    return saved ? JSON.parse(saved) : initialPayments;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('fintrack_notifications');
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('fintrack_settings');
    return saved ? JSON.parse(saved) : initialAppSettings;
  });

  const [authUser, setAuthUser] = useState<AuthUser>(() => {
    const saved = localStorage.getItem('fintrack_auth_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.email === 'alex.carter@gmail.com') {
          return initialAuthUser;
        }
        return parsed;
      } catch (e) {
        return initialAuthUser;
      }
    }
    return initialAuthUser;
  });

  const [goals, setGoals] = useState<FinancialGoal[]>(() => {
    const saved = localStorage.getItem('fintrack_goals');
    return saved ? JSON.parse(saved) : initialGoals;
  });

  const [investments, setInvestments] = useState<InvestmentItem[]>(() => {
    const saved = localStorage.getItem('fintrack_investments');
    return saved ? JSON.parse(saved) : initialInvestments;
  });

  const [loans, setLoans] = useState<LoanItem[]>(() => {
    const saved = localStorage.getItem('fintrack_loans');
    return saved ? JSON.parse(saved) : initialLoans;
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => ({
    ...initialUserProfile,
    name: authUser.isLoggedIn ? authUser.name : 'Nuevo Usuario',
    avatarUrl: authUser.avatarUrl,
  }));

  // Modal open states
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(!authUser.isLoggedIn);
  const [payCardModalCard, setPayCardModalCard] = useState<Account | null>(null);

  // Sync credit card dynamic payments when accounts or transactions change
  useEffect(() => {
    setPayments((prev) => syncCreditCardPayments(accounts, transactions, prev));
  }, [accounts, transactions]);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('fintrack_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('fintrack_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('fintrack_weekly_data', JSON.stringify(weeklyData));
  }, [weeklyData]);

  useEffect(() => {
    localStorage.setItem('fintrack_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('fintrack_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('fintrack_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('fintrack_auth_user', JSON.stringify(authUser));
    setUserProfile((prev) => ({
      ...prev,
      name: authUser.isLoggedIn ? authUser.name : 'Nuevo Usuario',
      avatarUrl: authUser.avatarUrl,
    }));
  }, [authUser]);

  useEffect(() => {
    localStorage.setItem('fintrack_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('fintrack_investments', JSON.stringify(investments));
  }, [investments]);

  useEffect(() => {
    localStorage.setItem('fintrack_loans', JSON.stringify(loans));
  }, [loans]);

  // Derived total balance
  const totalBalance = useMemo(() => {
    return accounts.reduce((sum, acc) => sum + acc.balance, 0);
  }, [accounts]);

  // Unread notifications count update
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  useEffect(() => {
    setUserProfile((prev) => ({ ...prev, unreadNotifications: unreadCount }));
  }, [unreadCount]);

  // Handler: Add new transaction (Expense or Income)
  const handleAddTransaction = (newTx: Omit<Transaction, 'id' | 'timestamp'>) => {
    const txId = 'tx-' + Date.now();
    const createdTx: Transaction = {
      ...newTx,
      id: txId,
      timestamp: Date.now(),
    };

    // 1. Add to transactions list
    setTransactions((prev) => [createdTx, ...prev]);

    // 2. Update target account balance
    setAccounts((prevAccounts) =>
      prevAccounts.map((acc) => {
        if (
          acc.name.toLowerCase().includes(newTx.accountName.toLowerCase()) ||
          newTx.accountName.toLowerCase().includes(acc.name.toLowerCase())
        ) {
          return { ...acc, balance: acc.balance + newTx.amount };
        }
        return acc;
      })
    );

    // 3. Update weekly chart data if expense/income
    if (newTx.type === 'expense') {
      setWeeklyData((prevChart) => {
        const copy = [...prevChart];
        if (copy.length > 0) {
          copy[copy.length - 1].expense += Math.abs(newTx.amount);
        }
        return copy;
      });
    } else if (newTx.type === 'income') {
      setWeeklyData((prevChart) => {
        const copy = [...prevChart];
        if (copy.length > 0) {
          copy[copy.length - 1].income += Math.abs(newTx.amount);
        }
        return copy;
      });
    }

    // 4. Add notification
    const newNotif: NotificationItem = {
      id: 'notif-' + Date.now(),
      title: newTx.type === 'income' ? 'Ingreso registrado' : 'Nuevo gasto registrado',
      description: `${newTx.title}: ${newTx.type === 'income' ? '+' : '-'}${settings.currencySymbol}${Math.abs(newTx.amount).toFixed(settings.decimals)}`,
      time: 'Justo ahora',
      read: false,
      type: newTx.type === 'income' ? 'success' : 'info',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Handler: Delete transaction
  const handleDeleteTransaction = (id: string) => {
    const txToDelete = transactions.find((t) => t.id === id);
    if (!txToDelete) return;

    // Revert account balance
    setAccounts((prevAccounts) =>
      prevAccounts.map((acc) => {
        if (
          acc.name.toLowerCase().includes(txToDelete.accountName.toLowerCase()) ||
          txToDelete.accountName.toLowerCase().includes(acc.name.toLowerCase())
        ) {
          return { ...acc, balance: acc.balance - txToDelete.amount };
        }
        return acc;
      })
    );

    // Remove from transactions
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Handler: Execute Transfer
  const handleExecuteTransfer = (
    fromAccId: string,
    toAccId: string,
    amount: number,
    notes?: string
  ) => {
    const sourceAcc = accounts.find((a) => a.id === fromAccId);
    const destAcc = accounts.find((a) => a.id === toAccId);

    if (!sourceAcc || !destAcc) return;

    // Update account balances
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === fromAccId) return { ...acc, balance: acc.balance - amount };
        if (acc.id === toAccId) return { ...acc, balance: acc.balance + amount };
        return acc;
      })
    );

    // Record transfer transaction
    const transferTx: Transaction = {
      id: 'tx-' + Date.now(),
      title: `Transferencia: ${sourceAcc.name} → ${destAcc.name}`,
      category: 'Transferencia',
      date: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      amount: -amount,
      type: 'transfer',
      icon: 'swap_horiz',
      accountName: sourceAcc.name,
      notes: notes || `Transferido hacia ${destAcc.name}`,
    };

    setTransactions((prev) => [transferTx, ...prev]);

    // Notification
    const notif: NotificationItem = {
      id: 'notif-' + Date.now(),
      title: 'Transferencia realizada',
      description: `Se han transferido ${settings.currencySymbol}${amount.toFixed(settings.decimals)} de ${sourceAcc.name} a ${destAcc.name}.`,
      time: 'Justo ahora',
      read: false,
      type: 'info',
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Handler: Add new Account
  const handleAddAccount = (newAcc: Omit<Account, 'id'>) => {
    if (authUser.provider === 'guest') {
      if (newAcc.type === 'credit') {
        const creditCount = accounts.filter((a) => a.type === 'credit').length;
        if (creditCount >= 2) {
          setDemoLimitModalInfo({ isOpen: true, itemType: 'tarjetas de crédito' });
          return;
        }
      } else if (newAcc.type === 'investment') {
        const invCount =
          accounts.filter((a) => a.type === 'investment').length + investments.length;
        if (invCount >= 2) {
          setDemoLimitModalInfo({ isOpen: true, itemType: 'fondos de inversión' });
          return;
        }
      } else {
        const bankCount = accounts.filter(
          (a) => a.type !== 'credit' && a.type !== 'investment'
        ).length;
        if (bankCount >= 2) {
          setDemoLimitModalInfo({ isOpen: true, itemType: 'cuentas' });
          return;
        }
      }
    }

    const accId = 'acc-' + Date.now();
    setAccounts((prev) => [...prev, { ...newAcc, id: accId }]);
  };

  // Handler: Update Account
  const handleUpdateAccount = (updatedAcc: Account) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === updatedAcc.id ? updatedAcc : acc))
    );
  };

  // Handler: Delete Account
  const handleDeleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((acc) => acc.id !== id));
  };

  // Handler: Confirm Credit Card Payment execution (pago mínimo, pago completo, otro monto)
  const handleConfirmCreditCardPay = (execution: CreditCardPayExecution) => {
    const { card, payingAccountId, amountPaid, remainingBalance, interestCharged, optionType } = execution;
    const payingAccount = accounts.find((a) => a.id === payingAccountId);
    if (!payingAccount) return;

    // 1. Update account balances
    setAccounts((prevAccounts) =>
      prevAccounts.map((acc) => {
        // Deduct from paying bank account
        if (acc.id === payingAccountId) {
          return { ...acc, balance: acc.balance - amountPaid };
        }
        // Add to credit card (reduces negative balance), and add interest charged if applicable
        if (acc.id === card.id) {
          const updatedBalance = acc.balance + amountPaid - interestCharged;
          return { ...acc, balance: updatedBalance };
        }
        return acc;
      })
    );

    // 2. Add payment transaction
    const payTx: Transaction = {
      id: 'tx-' + Date.now(),
      title: `Pago Tarjeta: ${card.name}`,
      category: 'Pago Tarjeta de Crédito',
      date: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      amount: -amountPaid,
      type: 'expense',
      icon: 'credit_card',
      accountName: payingAccount.name,
      notes: `Pago de tarjeta (${
        optionType === 'full'
          ? 'Pago Completo'
          : optionType === 'minimum'
          ? 'Pago Mínimo'
          : 'Monto Personalizado'
      }). Tarjeta: ${card.name}`,
    };

    const newTxs: Transaction[] = [payTx];

    // 3. If minimum or partial payment generates interest, record interest charge transaction
    if (interestCharged > 0) {
      const interestTx: Transaction = {
        id: 'tx-' + (Date.now() + 1),
        title: `Interés generado: ${card.name}`,
        category: 'Comisiones e Intereses',
        date: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now() + 1,
        amount: -interestCharged,
        type: 'expense',
        icon: 'percent',
        accountName: card.name,
        notes: `Interés por saldo no liquidado (${settings.currencySymbol}${remainingBalance.toFixed(2)}) al ${card.interestRate || 36}% EA`,
      };
      newTxs.push(interestTx);
    }

    setTransactions((prev) => [...newTxs, ...prev]);

    // 4. Mark credit card payment item in payments list as paid
    setPayments((prev) =>
      prev.map((p) => {
        if (p.creditCardAccountId === card.id && p.status === 'pending') {
          return { ...p, status: 'paid', amount: amountPaid };
        }
        return p;
      })
    );

    // 5. Add notification
    const notif: NotificationItem = {
      id: 'notif-' + Date.now(),
      title: 'Pago de Tarjeta de Crédito Procesado',
      description: `Se abonaron ${settings.currencySymbol}${amountPaid.toFixed(settings.decimals)} a ${card.name} desde ${payingAccount.name}.${
        interestCharged > 0
          ? ` (+${settings.currencySymbol}${interestCharged.toFixed(settings.decimals)} de recargo por intereses para el siguiente periodo).`
          : ''
      }`,
      time: 'Justo ahora',
      read: false,
      type: 'success',
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Handler: Pay recurring bill
  const handlePayNow = (payment: PaymentItem) => {
    // If it is a credit card payment, open credit card pay modal
    if (payment.isCreditCardPayment || payment.creditCardAccountId) {
      const card = accounts.find((a) => a.id === payment.creditCardAccountId || a.name === payment.service);
      if (card) {
        setPayCardModalCard(card);
        return;
      }
    }

    // 1. Mark payment as paid
    setPayments((prev) =>
      prev.map((p) => (p.id === payment.id ? { ...p, status: 'paid' } : p))
    );

    // 2. Add as expense transaction with assigned account if specified
    const targetAccount = payment.assignedAccountName || accounts[0]?.name || 'Banco Principal';

    handleAddTransaction({
      title: payment.service,
      category: payment.category,
      date: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      amount: -payment.amount,
      type: 'expense',
      icon: payment.icon,
      accountName: targetAccount,
      notes: `Pago de factura (${payment.service})${payment.autoPay ? ' - Cobro automático' : ''}`,
    });
  };

  // Handler: Add recurring payment item
  const handleAddPayment = (newPayment: Omit<PaymentItem, 'id' | 'status'>) => {
    const pId = 'pay-' + Date.now();
    setPayments((prev) => [{ ...newPayment, id: pId, status: 'pending' }, ...prev]);
  };

  // Handler: Update full payment item
  const handleUpdatePayment = (updatedPayment: PaymentItem) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === updatedPayment.id ? updatedPayment : p))
    );
  };

  // Handler: Delete payment item
  const handleDeletePayment = (id: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== id));
  };

  // Handler: Toggle AutoPay with account & date
  const handleToggleAutoPay = (id: string, assignedAccountName?: string, dueDate?: string) => {
    setPayments((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            autoPay: !p.autoPay,
            assignedAccountName:
              assignedAccountName !== undefined ? assignedAccountName : p.assignedAccountName,
            dueDate: dueDate || p.dueDate,
          };
        }
        return p;
      })
    );
  };

  // Handler: Financial Goals
  const handleAddGoal = (newGoal: Omit<FinancialGoal, 'id'>) => {
    const gId = 'goal-' + Date.now();
    setGoals((prev) => [{ ...newGoal, id: gId }, ...prev]);
  };

  const handleUpdateGoal = (updatedGoal: FinancialGoal) => {
    setGoals((prev) => prev.map((g) => (g.id === updatedGoal.id ? updatedGoal : g)));
  };

  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const handleDepositToGoal = (goalId: string, amount: number, accountId?: string) => {
    // 1. Increase goal current saved
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          return { ...g, currentAmount: g.currentAmount + amount };
        }
        return g;
      })
    );

    // 2. If account selected, deduct balance and add transaction
    if (accountId) {
      const acc = accounts.find((a) => a.id === accountId);
      if (acc) {
        const goal = goals.find((g) => g.id === goalId);
        handleAddTransaction({
          title: `Aporte a Meta: ${goal?.title || 'Ahorro'}`,
          category: 'Ahorro',
          date: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          amount: -amount,
          type: 'expense',
          icon: 'savings',
          accountName: acc.name,
          notes: `Destinado a la meta de ahorro`,
        });
      }
    }
  };

  // Handler: Investments & Loans
  const handleAddInvestment = (inv: Omit<InvestmentItem, 'id'>) => {
    if (authUser.provider === 'guest') {
      const invCount =
        investments.length + accounts.filter((a) => a.type === 'investment').length;
      if (invCount >= 2) {
        setDemoLimitModalInfo({ isOpen: true, itemType: 'fondos de inversión' });
        return;
      }
    }

    const invId = 'inv-' + Date.now();
    setInvestments((prev) => [{ ...inv, id: invId }, ...prev]);
  };

  const handleDeleteInvestment = (id: string) => {
    setInvestments((prev) => prev.filter((i) => i.id !== id));
  };

  const handleAddLoan = (loan: Omit<LoanItem, 'id'>) => {
    if (authUser.provider === 'guest') {
      if (loans.length >= 2) {
        setDemoLimitModalInfo({ isOpen: true, itemType: 'préstamos' });
        return;
      }
    }

    const lId = 'loan-' + Date.now();
    setLoans((prev) => [{ ...loan, id: lId }, ...prev]);
  };

  const handleDeleteLoan = (id: string) => {
    setLoans((prev) => prev.filter((l) => l.id !== id));
  };

  // Handler: Notifications
  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <div className="min-h-screen bg-[#f7f9ff] text-[#181c20] flex flex-col font-['Inter',sans-serif]">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userProfile={userProfile}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-6 py-6 pb-24 md:pb-12">
        {activeTab === 'dashboard' && (
          <DashboardView
            totalBalance={totalBalance}
            transactions={transactions}
            weeklyData={weeklyData}
            goals={goals}
            investments={investments}
            loans={loans}
            accounts={accounts}
            settings={settings}
            onOpenAddExpense={() => setIsAddExpenseOpen(true)}
            onOpenTransfer={() => setIsTransferOpen(true)}
            onOpenReports={() => setIsReportsOpen(true)}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            transactions={transactions}
            onOpenAddExpense={() => setIsAddExpenseOpen(true)}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {activeTab === 'accounts' && (
          <AccountsView
            accounts={accounts}
            transactions={transactions}
            onOpenTransfer={() => setIsTransferOpen(true)}
            onAddAccount={handleAddAccount}
            onUpdateAccount={handleUpdateAccount}
            onDeleteAccount={handleDeleteAccount}
            onNavigateToInvestments={() => setActiveTab('investments')}
            onPayCreditCard={(card) => setPayCardModalCard(card)}
          />
        )}

        {activeTab === 'payments' && (
          <PaymentsView
            payments={payments}
            accounts={accounts}
            onPayNow={handlePayNow}
            onAddPayment={handleAddPayment}
            onToggleAutoPay={handleToggleAutoPay}
            onUpdatePayment={handleUpdatePayment}
            onDeletePayment={handleDeletePayment}
          />
        )}

        {activeTab === 'goals' && (
          <GoalsView
            goals={goals}
            accounts={accounts}
            settings={settings}
            onAddGoal={handleAddGoal}
            onUpdateGoal={handleUpdateGoal}
            onDeleteGoal={handleDeleteGoal}
            onDepositToGoal={handleDepositToGoal}
          />
        )}

        {activeTab === 'investments' && (
          <InvestmentsLoansView
            investments={investments}
            loans={loans}
            accounts={accounts}
            settings={settings}
            onAddInvestment={handleAddInvestment}
            onDeleteInvestment={handleDeleteInvestment}
            onAddLoan={handleAddLoan}
            onDeleteLoan={handleDeleteLoan}
            onNavigateToAccounts={() => setActiveTab('accounts')}
            onUpdateAccount={handleUpdateAccount}
            onDeleteAccount={handleDeleteAccount}
            onAddAccount={handleAddAccount}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={setSettings}
            authUser={authUser}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            savedPin={savedPin}
            isPinEnabled={isPinEnabled}
            onTogglePinEnabled={(enabled) => setIsPinEnabled(enabled)}
            onOpenChangePinModal={() => setIsChangePinModalOpen(true)}
            onLockAppNow={() => setIsLocked(true)}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Security Pin Lock Screen */}
      <PinLockScreen
        isLocked={isLocked}
        onUnlock={() => setIsLocked(false)}
        savedPin={savedPin}
        userEmail={authUser.email}
      />

      {/* Change Pin Modal */}
      <ChangePinModal
        isOpen={isChangePinModalOpen}
        onClose={() => setIsChangePinModalOpen(false)}
        currentPin={savedPin}
        onSavePin={(newPin) => setSavedPin(newPin)}
      />

      {/* Demo Account Limit Warning Modal */}
      <DemoLimitModal
        isOpen={demoLimitModalInfo.isOpen}
        onClose={() => setDemoLimitModalInfo((prev) => ({ ...prev, isOpen: false }))}
        onOpenRegister={() => setIsAuthModalOpen(true)}
        itemType={demoLimitModalInfo.itemType}
      />

      {/* Interactive Modals & Drawers */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        accounts={accounts}
        onAddTransaction={handleAddTransaction}
      />

      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        accounts={accounts}
        onExecuteTransfer={handleExecuteTransfer}
      />

      <ReportsModal
        isOpen={isReportsOpen}
        onClose={() => setIsReportsOpen(false)}
        transactions={transactions}
        accounts={accounts}
        settings={settings}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
        onDeleteNotification={handleDeleteNotification}
        onClearAllNotifications={handleClearAllNotifications}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        authUser={authUser}
        onUpdateAuthUser={setAuthUser}
      />

      <CreditCardPayModal
        isOpen={!!payCardModalCard}
        onClose={() => setPayCardModalCard(null)}
        card={payCardModalCard}
        bankAccounts={accounts.filter((a) => a.type !== 'credit')}
        settings={settings}
        onConfirmPayment={handleConfirmCreditCardPay}
      />
    </div>
  );
}
