import React from 'react';
import { NotificationItem } from '../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onClearAllNotifications: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearAllNotifications,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex justify-end animate-fadeIn">
      <div className="bg-white w-full max-w-sm h-full p-6 shadow-2xl flex flex-col justify-between border-l border-[#dfe3e8] animate-slideLeft">
        {/* Top Header */}
        <div>
          <div className="flex justify-between items-center border-b border-[#dfe3e8]/60 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#005bbf]">notifications</span>
              <h3 className="text-base font-bold text-[#181c20]">Notificaciones</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 mb-4">
            <span className="text-xs font-semibold text-[#414754]">
              {notifications.length} {notifications.length === 1 ? 'notificación' : 'notificaciones'}
            </span>
            {notifications.length > 0 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={onMarkAllAsRead}
                  className="text-xs text-[#005bbf] font-semibold hover:underline cursor-pointer"
                >
                  Leídas
                </button>
                <button
                  onClick={onClearAllNotifications}
                  className="text-xs text-red-600 font-semibold hover:underline cursor-pointer"
                >
                  Eliminar todas
                </button>
              </div>
            )}
          </div>

          {/* List */}
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">No tienes notificaciones pendientes.</p>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all text-xs space-y-1 relative group ${
                    item.read
                      ? 'bg-gray-50/60 border-gray-100 opacity-75'
                      : 'bg-[#f7f9ff] border-[#005bbf]/20 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between pr-5">
                    <span className="font-bold text-[#181c20]">{item.title}</span>
                    <span className="text-[10px] text-gray-400">{item.time}</span>
                  </div>
                  <p className="text-[#414754] text-[11px] leading-relaxed pr-5">{item.description}</p>

                  {/* Individual Delete Button */}
                  <button
                    onClick={() => onDeleteNotification(item.id)}
                    className="absolute top-2.5 right-2.5 text-gray-400 hover:text-red-600 cursor-pointer p-1 rounded-full hover:bg-red-50 transition-colors"
                    title="Eliminar notificación"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#dfe3e8]/60 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#f1f4fa] hover:bg-[#e5e8ee] text-[#181c20] text-xs font-semibold rounded-xl cursor-pointer"
          >
            Cerrar Notificaciones
          </button>
        </div>
      </div>
    </div>
  );
};
