import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';

interface TransactionsViewProps {
  transactions: Transaction[];
  onOpenAddExpense: () => void;
  onDeleteTransaction: (id: string) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  onOpenAddExpense,
  onDeleteTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((tx) => set.add(tx.category));
    return Array.from(set);
  }, [transactions]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        tx.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.notes && tx.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'all' || tx.category === selectedCategory;

      const matchesType = selectedType === 'all' || tx.type === selectedType;

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [transactions, searchTerm, selectedCategory, selectedType]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#dfe3e8]/60 shadow-[0px_4px_20px_rgba(0,0,0,0.03)]">
        <div>
          <h2 className="text-2xl font-bold text-[#181c20]">Historial de Transacciones</h2>
          <p className="text-xs text-[#414754] mt-1">
            Consulta, filtra y gestiona todos tus movimientos financieros.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenAddExpense}
            className="px-4 py-2.5 bg-[#005bbf] hover:bg-[#004899] text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Añadir Transacción
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#dfe3e8]/60 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="md:col-span-5 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por título, categoría, nota..."
              className="w-full pl-9 pr-4 py-2 bg-[#f7f9ff] border border-[#dfe3e8] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#005bbf]/30 focus:border-[#005bbf]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-[#f7f9ff] border border-[#dfe3e8] rounded-xl text-xs font-medium text-[#181c20] focus:outline-none focus:ring-2 focus:ring-[#005bbf]/30 focus:border-[#005bbf]"
            >
              <option value="all">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter Tabs */}
          <div className="md:col-span-4 flex items-center bg-[#f1f4fa] p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setSelectedType('all')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                selectedType === 'all' ? 'bg-white text-[#005bbf] shadow-2xs' : 'text-[#414754]'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setSelectedType('income')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                selectedType === 'income' ? 'bg-white text-[#006e2c] shadow-2xs' : 'text-[#414754]'
              }`}
            >
              Ingresos
            </button>
            <button
              onClick={() => setSelectedType('expense')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                selectedType === 'expense' ? 'bg-white text-[#b81d17] shadow-2xs' : 'text-[#414754]'
              }`}
            >
              Gastos
            </button>
            <button
              onClick={() => setSelectedType('transfer')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                selectedType === 'transfer' ? 'bg-white text-[#181c20] shadow-2xs' : 'text-[#414754]'
              }`}
            >
              Transf.
            </button>
          </div>
        </div>
      </div>

      {/* Transactions List / Table */}
      <div className="bg-white rounded-2xl border border-[#dfe3e8]/60 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-[#005bbf] flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-3xl">search_off</span>
            </div>
            <h3 className="text-base font-bold text-[#181c20]">No se encontraron transacciones</h3>
            <p className="text-xs text-[#414754] mt-1 max-w-sm mx-auto">
              Prueba cambiando tus filtros de búsqueda o registra una nueva transacción.
            </p>
            <button
              onClick={onOpenAddExpense}
              className="mt-4 px-4 py-2 bg-[#005bbf] text-white text-xs font-semibold rounded-xl hover:bg-[#004899] transition-colors cursor-pointer"
            >
              + Registrar Gasto / Ingreso
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f7f9ff] border-b border-[#dfe3e8] text-[11px] font-bold text-[#414754] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Movimiento</th>
                  <th className="py-3.5 px-4">Categoría</th>
                  <th className="py-3.5 px-4">Cuenta</th>
                  <th className="py-3.5 px-4">Fecha</th>
                  <th className="py-3.5 px-4 text-right">Monto</th>
                  <th className="py-3.5 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dfe3e8]/50 text-xs">
                {filteredTransactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  const isTransfer = tx.type === 'transfer';

                  const formattedAmt = Math.abs(tx.amount).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  });

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-[#f7f9ff]/80 transition-colors group"
                    >
                      {/* Movement / Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                              isIncome
                                ? 'bg-emerald-100 text-[#006e2c]'
                                : isTransfer
                                ? 'bg-blue-100 text-[#005bbf]'
                                : 'bg-red-100 text-[#b81d17]'
                            }`}
                          >
                            <span className="material-symbols-outlined text-lg">{tx.icon || 'receipt'}</span>
                          </div>
                          <div>
                            <span className="font-bold text-[#181c20] block group-hover:text-[#005bbf] transition-colors">
                              {tx.title}
                            </span>
                            {tx.notes && (
                              <span className="text-[11px] text-[#414754] block truncate max-w-[200px]">
                                {tx.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-1 bg-[#f1f4fa] text-[#414754] font-medium rounded-lg text-[11px]">
                          {tx.category}
                        </span>
                      </td>

                      {/* Account */}
                      <td className="py-3.5 px-4 text-[#414754] font-medium">
                        {tx.accountName}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-[#414754]">
                        {tx.date}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right font-bold font-mono">
                        <span
                          className={
                            isIncome
                              ? 'text-[#006e2c]'
                              : isTransfer
                              ? 'text-[#181c20]'
                              : 'text-[#b81d17]'
                          }
                        >
                          {isIncome ? `+$${formattedAmt}` : isTransfer ? `$${formattedAmt}` : `-$${formattedAmt}`}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1.5 text-gray-400 hover:text-[#b81d17] hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar registro"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
