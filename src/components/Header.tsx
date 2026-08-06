import React from 'react';
import { TabType, UserProfile } from '../types';
import { AppLogo } from './AppLogo';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  userProfile: UserProfile;
  onOpenNotifications: () => void;
  onOpenAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  userProfile,
  onOpenNotifications,
  onOpenAuthModal,
}) => {
  return (
    <>
      {/* Desktop Header */}
      <header className="w-full top-0 sticky bg-[#f7f9ff] border-b border-[#dfe3e8]/60 shadow-xs z-40 hidden md:flex">
        <div className="flex items-center justify-between px-6 py-3.5 w-full max-w-[1280px] mx-auto">
          {/* Brand Logo & Avatar */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAuthModal}
              className="relative group cursor-pointer"
              title="Mi Cuenta / Registro"
            >
              <img
                className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/30 group-hover:ring-blue-500 transition-all shadow-sm"
                src={userProfile.avatarUrl}
                alt={userProfile.name}
              />
              <span className="absolute -bottom-1 -right-1 bg-[#005bbf] text-white p-0.5 rounded-full text-[10px]">
                <span className="material-symbols-outlined text-[10px] block">person</span>
              </span>
            </button>
            <div>
              <AppLogo size="md" />
            </div>
          </div>

          {/* Desktop / Tablet Nav Links */}
          <nav className="flex items-center gap-1 bg-[#ebeef4]/60 p-1 rounded-xl text-xs overflow-x-auto max-w-[420px] lg:max-w-none shrink">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-2.5 lg:px-3 py-1.5 lg:py-2 rounded-lg font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-white text-[#005bbf] shadow-xs'
                  : 'text-[#414754] hover:text-[#181c20] hover:bg-white/50'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-2.5 lg:px-3 py-1.5 lg:py-2 rounded-lg font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                activeTab === 'transactions'
                  ? 'bg-white text-[#005bbf] shadow-xs'
                  : 'text-[#414754] hover:text-[#181c20] hover:bg-white/50'
              }`}
            >
              Movimientos
            </button>
            <button
              onClick={() => setActiveTab('accounts')}
              className={`px-2.5 lg:px-3 py-1.5 lg:py-2 rounded-lg font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                activeTab === 'accounts'
                  ? 'bg-white text-[#005bbf] shadow-xs'
                  : 'text-[#414754] hover:text-[#181c20] hover:bg-white/50'
              }`}
            >
              Cuentas
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-2.5 lg:px-3 py-1.5 lg:py-2 rounded-lg font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                activeTab === 'payments'
                  ? 'bg-white text-[#005bbf] shadow-xs'
                  : 'text-[#414754] hover:text-[#181c20] hover:bg-white/50'
              }`}
            >
              Pagos
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`px-2.5 lg:px-3 py-1.5 lg:py-2 rounded-lg font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                activeTab === 'goals'
                  ? 'bg-white text-[#005bbf] shadow-xs'
                  : 'text-[#414754] hover:text-[#181c20] hover:bg-white/50'
              }`}
            >
              Metas
            </button>
            <button
              onClick={() => setActiveTab('investments')}
              className={`px-2.5 lg:px-3 py-1.5 lg:py-2 rounded-lg font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                activeTab === 'investments'
                  ? 'bg-white text-[#005bbf] shadow-xs'
                  : 'text-[#414754] hover:text-[#181c20] hover:bg-white/50'
              }`}
            >
              Inversión
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-2.5 lg:px-3 py-1.5 lg:py-2 rounded-lg font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-white text-[#005bbf] shadow-xs'
                  : 'text-[#414754] hover:text-[#181c20] hover:bg-white/50'
              }`}
            >
              Ajustes
            </button>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5 lg:gap-2 shrink-0">
            <button
              onClick={onOpenAuthModal}
              className="px-2.5 lg:px-3 py-1.5 rounded-xl border border-[#dfe3e8] bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-sm text-[#005bbf]">person</span>
              <span className="hidden lg:inline">{userProfile.name.split(' ')[0]}</span>
            </button>

            <button
              onClick={onOpenNotifications}
              className="relative p-2.5 rounded-full hover:bg-[#e5e8ee] transition-colors text-[#005bbf] cursor-pointer active:scale-95"
              title="Notificaciones"
            >
              <span className="material-symbols-outlined text-2xl">notifications</span>
              {userProfile.unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 bg-[#b81d17] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {userProfile.unreadNotifications}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Top Header */}
      <header className="w-full top-0 sticky bg-[#f7f9ff] border-b border-[#dfe3e8]/50 shadow-xs z-40 md:hidden">
        <div className="flex items-center justify-between px-4 py-3 w-full">
          <button onClick={onOpenAuthModal} className="flex items-center gap-2.5 cursor-pointer">
            <img
              className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/20"
              src={userProfile.avatarUrl}
              alt={userProfile.name}
            />
            <div className="text-left">
              <p className="text-[10px] text-[#414754] font-medium leading-none">{userProfile.greeting}</p>
              <h2 className="text-sm font-bold text-[#181c20] mt-0.5 leading-tight">{userProfile.name}</h2>
            </div>
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-full hover:bg-[#e5e8ee] transition-colors text-[#005bbf] cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">notifications</span>
              {userProfile.unreadNotifications > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-[#b81d17] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {userProfile.unreadNotifications}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
