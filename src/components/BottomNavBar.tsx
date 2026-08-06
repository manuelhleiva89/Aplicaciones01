import React from 'react';
import { TabType } from '../types';

interface BottomNavBarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, setActiveTab }) => {
  const tabs: Array<{ id: TabType; label: string; icon: string }> = [
    { id: 'dashboard', label: 'Inicio', icon: 'dashboard' },
    { id: 'transactions', label: 'Movimientos', icon: 'receipt_long' },
    { id: 'accounts', label: 'Cuentas', icon: 'account_balance_wallet' },
    { id: 'payments', label: 'Pagos', icon: 'event_repeat' },
    { id: 'goals', label: 'Metas', icon: 'flag' },
    { id: 'investments', label: 'Inversión', icon: 'trending_up' },
    { id: 'settings', label: 'Ajustes', icon: 'settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 md:hidden bg-white/95 backdrop-blur-md border-t border-[#dfe3e8] shadow-[0px_-4px_20px_rgba(0,0,0,0.05)] px-1 py-1.5 overflow-x-auto">
      <div className="flex justify-between items-center min-w-max mx-auto gap-1 px-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 cursor-pointer active:scale-95 ${
                isActive
                  ? 'bg-blue-50 text-[#005bbf] font-bold'
                  : 'text-[#414754] hover:text-[#181c20]'
              }`}
            >
              <span className="material-symbols-outlined text-lg" data-weight={isActive ? 'fill' : undefined}>
                {tab.icon}
              </span>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
