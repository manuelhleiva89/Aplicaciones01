export type TabType =
  | 'dashboard'
  | 'transactions'
  | 'accounts'
  | 'payments'
  | 'goals'
  | 'investments'
  | 'settings';

export type TransactionType = 'expense' | 'income' | 'transfer';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  provider: 'google' | 'email' | 'guest';
  avatarUrl: string;
  isLoggedIn: boolean;
}

export interface AppSettings {
  currencySymbol: string;
  currencyCode: string;
  decimals: number;
  expenseCategories: string[];
  incomeCategories: string[];
}

export interface FinancialGoal {
  id: string;
  title: string;
  category?: string;
  linkedAccountId?: string;
  linkedAccountName?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  monthlyContribution: number;
  icon: string;
  color: string;
}

export interface InvestmentItem {
  id: string;
  title: string;
  principalAmount: number;
  annualRate: number; // % e.g. 8.5
  termMonths: number;
  monthlyContribution: number;
  compoundingFrequency: 'monthly' | 'annual';
  startDate: string;
  category: string;
}

export interface LoanItem {
  id: string;
  title: string;
  loanAmount: number;
  annualInterestRate: number; // % e.g. 12.0
  termMonths: number;
  startDate: string;
  lenderOrType: string;
}

export interface Transaction {
  id: string;
  title: string;
  category: string;
  date: string; // ISO or formatted e.g. "Hoy, 10:30 AM"
  timestamp: number;
  amount: number;
  type: TransactionType;
  icon: string;
  accountName: string;
  notes?: string;
}

export interface Account {
  id: string;
  name: string;
  institution?: string;
  type: 'savings' | 'checking' | 'investment' | 'credit' | 'debit';
  accountNumber: string;
  balance: number;
  icon: string;
  color: string;
  // Credit Card Specific Fields
  creditLimit?: number;
  interestRate?: number;
  cutoffDay?: number;
  paymentDueDay?: number;
}

export interface PaymentItem {
  id: string;
  service: string;
  category: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  autoPay: boolean;
  assignedAccountName?: string;
  icon: string;
  isCreditCardPayment?: boolean;
  creditCardAccountId?: string;
  cutoffDate?: string;
  minimumPayment?: number;
}

export interface WeeklyChartData {
  week: string;
  income: number;
  expense: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success';
}

export interface UserProfile {
  name: string;
  greeting: string;
  avatarUrl: string;
  unreadNotifications: number;
}
