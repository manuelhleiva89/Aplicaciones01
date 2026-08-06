import { Account, Transaction, PaymentItem } from '../types';

export interface CreditCardBillingInfo {
  card: Account;
  currentDebt: number;
  creditLimit: number;
  availableCredit: number;
  interestRate: number;
  cutoffDay: number;
  paymentDueDay: number;
  nextCutoffDateStr: string;
  nextPaymentDueDateStr: string;
  accumulatedExpensesInCycle: number;
  minimumPayment: number;
}

export function getCreditCardBillingInfo(
  card: Account,
  transactions: Transaction[] = []
): CreditCardBillingInfo {
  const currentDebt = card.balance < 0 ? Math.abs(card.balance) : 0;
  const creditLimit = card.creditLimit || 5000;
  const availableCredit = Math.max(0, creditLimit - currentDebt);
  const interestRate = card.interestRate ?? 36; // Default 36% annual
  const cutoffDay = card.cutoffDay ?? 15;
  const paymentDueDay = card.paymentDueDay ?? 5;

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-indexed
  const currentDay = today.getDate();

  // Determine current/next cutoff date
  let cutoffYear = currentYear;
  let cutoffMonth = currentMonth;

  if (currentDay > cutoffDay) {
    cutoffMonth += 1;
    if (cutoffMonth > 11) {
      cutoffMonth = 0;
      cutoffYear += 1;
    }
  }

  const cutoffDateObj = new Date(cutoffYear, cutoffMonth, Math.min(cutoffDay, 28));

  // Determine payment due date
  let dueYear = cutoffYear;
  let dueMonth = cutoffMonth + 1;
  if (dueMonth > 11) {
    dueMonth = 0;
    dueYear += 1;
  }
  const paymentDueDateObj = new Date(dueYear, dueMonth, Math.min(paymentDueDay, 28));

  const nextCutoffDateStr = cutoffDateObj.toISOString().split('T')[0];
  const nextPaymentDueDateStr = paymentDueDateObj.toISOString().split('T')[0];

  // Calculate accumulated expenses on this card during current billing period
  const cycleStartObj = new Date(cutoffYear, cutoffMonth - 1, Math.min(cutoffDay, 28));

  const accumulatedExpensesInCycle = transactions
    .filter((tx) => {
      if (tx.type !== 'expense') return false;
      const isThisCard =
        tx.accountName.toLowerCase().includes(card.name.toLowerCase()) ||
        card.name.toLowerCase().includes(tx.accountName.toLowerCase());
      if (!isThisCard) return false;

      const txDate = new Date(tx.timestamp || tx.date);
      return txDate >= cycleStartObj;
    })
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  // Use currentDebt if present, otherwise accumulated expenses
  const totalBalanceToPay = currentDebt > 0 ? currentDebt : accumulatedExpensesInCycle;

  // Minimum payment is 10% of total balance adeudado a la fecha
  const minimumPayment = Math.round(totalBalanceToPay * 0.1 * 100) / 100;

  return {
    card,
    currentDebt: totalBalanceToPay,
    creditLimit,
    availableCredit,
    interestRate,
    cutoffDay,
    paymentDueDay,
    nextCutoffDateStr,
    nextPaymentDueDateStr,
    accumulatedExpensesInCycle: totalBalanceToPay,
    minimumPayment,
  };
}

/**
 * Synchronizes credit card dynamic auto-payments with the `payments` state array.
 */
export function syncCreditCardPayments(
  accounts: Account[],
  payments: PaymentItem[],
  transactions: Transaction[]
): PaymentItem[] {
  const creditCards = accounts.filter((a) => a.type === 'credit');
  let updatedPayments = [...payments];

  creditCards.forEach((card) => {
    const info = getCreditCardBillingInfo(card, transactions);
    const existingIndex = updatedPayments.findIndex(
      (p) =>
        p.isCreditCardPayment &&
        (p.creditCardAccountId === card.id || p.service.includes(card.name))
    );

    const paymentItem: PaymentItem = {
      id: existingIndex >= 0 ? updatedPayments[existingIndex].id : `cc-pay-${card.id}`,
      service: `Pago Tarjeta: ${card.name}`,
      category: 'Tarjetas de Crédito',
      amount: info.accumulatedExpensesInCycle,
      dueDate: info.nextPaymentDueDateStr,
      status: info.accumulatedExpensesInCycle > 0 ? 'pending' : 'paid',
      autoPay: true,
      assignedAccountName: card.name,
      icon: 'credit_card',
      isCreditCardPayment: true,
      creditCardAccountId: card.id,
      cutoffDate: info.nextCutoffDateStr,
      minimumPayment: info.minimumPayment,
    };

    if (existingIndex >= 0) {
      if (info.accumulatedExpensesInCycle === 0) {
        paymentItem.status = 'paid';
      } else {
        paymentItem.status = updatedPayments[existingIndex].status;
      }
      updatedPayments[existingIndex] = paymentItem;
    } else {
      updatedPayments.push(paymentItem);
    }
  });

  return updatedPayments;
}
