import React, { useState } from 'react';
import { AuthUser } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  authUser: AuthUser;
  onUpdateAuthUser: (user: AuthUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  authUser,
  onUpdateAuthUser,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);

  if (!isOpen) return null;

  const handleGoogleAuth = () => {
    setIsConnectingGoogle(true);
    setTimeout(() => {
      setIsConnectingGoogle(false);
      onUpdateAuthUser({
        id: `google-${Date.now()}`,
        name: authUser.name || 'Usuario Google',
        email: authUser.email || 'usuario.google@gmail.com',
        provider: 'google',
        avatarUrl:
          authUser.avatarUrl ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        isLoggedIn: true,
      });
      onClose();
    }, 800);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const displayName = mode === 'signup' ? name || email.split('@')[0] : authUser.name || email.split('@')[0];

    onUpdateAuthUser({
      id: `custom-${Date.now()}`,
      name: displayName,
      email: email,
      provider: 'email',
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=005bbf&color=fff`,
      isLoggedIn: true,
    });
    onClose();
  };

  const handleDemoLogin = () => {
    onUpdateAuthUser({
      id: 'guest',
      name: 'Usuario Demo',
      email: 'demo@fintrack.app',
      provider: 'guest',
      avatarUrl:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
      isLoggedIn: true,
    });
    onClose();
  };

  const handleLogout = () => {
    onUpdateAuthUser({
      id: 'guest',
      name: 'Usuario Demo',
      email: 'demo@fintrack.app',
      provider: 'guest',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
      isLoggedIn: false,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#dfe3e8] shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
        >
          ✕
        </button>

        {authUser.isLoggedIn && authUser.provider !== 'guest' ? (
          <div className="space-y-5 text-center">
            <div className="w-16 h-16 rounded-full mx-auto overflow-hidden ring-4 ring-blue-100 shadow-md">
              <img src={authUser.avatarUrl} alt={authUser.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#181c20]">{authUser.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{authUser.email}</p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 mt-2 border border-emerald-200">
                <span className="material-symbols-outlined text-sm">
                  {authUser.provider === 'google' ? 'verified' : 'mail'}
                </span>
                {authUser.provider === 'google' ? 'Cuenta Google (Acceso Ilimitado)' : 'Cuenta Registrada con Correo (Ilimitado)'}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-left text-xs space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Estado de sesión:</span>
                <span className="font-bold text-emerald-600">Registrado & Sincronizado</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Límite de elementos:</span>
                <span className="font-bold text-[#005bbf]">Sin Límites (Ilimitado)</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>ID de Usuario:</span>
                <span className="font-mono text-gray-800">{authUser.id}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cerrar Ventana
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 text-[#b81d17] font-semibold text-xs rounded-xl transition-all cursor-pointer border border-red-200 flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                Cerrar Sesión
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-blue-50 text-[#005bbf] rounded-2xl flex items-center justify-center mx-auto mb-2 border border-blue-100">
                <span className="material-symbols-outlined text-28">account_circle</span>
              </div>
              <h3 className="text-xl font-bold text-[#181c20]">
                {mode === 'signup' ? 'Registro de Cuenta' : 'Iniciar Sesión'}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Elige tu método de acceso preferido
              </p>
            </div>

            {/* Banner: Option 1 vs Option 2 */}
            <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-left text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <span className="material-symbols-outlined text-base text-amber-700">info</span>
                Límites según tipo de cuenta:
              </div>
              <ul className="text-[11px] text-amber-800 space-y-0.5 list-disc pl-4">
                <li>
                  <strong>Registro con Correo:</strong> Acceso 100% ilimitado.
                </li>
                <li>
                  <strong>Cuenta Demo sin registro:</strong> Máximo 2 cuentas, 2 tarjetas de crédito y 2 fondos de inversión.
                </li>
              </ul>
            </div>

            {/* Quick Demo Button */}
            <button
              onClick={handleDemoLogin}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer mb-4"
            >
              <span className="material-symbols-outlined text-base text-amber-400">explore</span>
              Ingresar con Cuenta Demo (Sin Registro)
            </button>

            <div className="relative flex py-2 items-center mb-4">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-3 text-gray-400 text-[11px] font-medium">
                o regístrate con correo para acceso ilimitado
              </span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* Google Quick Button */}
            <button
              onClick={handleGoogleAuth}
              disabled={isConnectingGoogle}
              className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-xl border border-gray-300 shadow-xs flex items-center justify-center gap-3 transition-all cursor-pointer mb-3"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              {isConnectingGoogle
                ? 'Conectando con Google...'
                : 'Continuar con Google'}
            </button>

            <div className="relative flex py-2 items-center mb-4">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-3 text-gray-400 text-[11px] font-medium">
                o cuenta personalizada
              </span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <form onSubmit={handleCustomSubmit} className="space-y-3.5 text-xs">
              {mode === 'signup' && (
                <div>
                  <label className="block font-semibold text-[#414754] mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Alex Carter"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#005bbf]/30"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-[#414754] mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  placeholder="alex@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#005bbf]/30"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#414754] mb-1">Contraseña</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dfe3e8] rounded-xl outline-none focus:ring-2 focus:ring-[#005bbf]/30"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#005bbf] hover:bg-[#004899] text-white font-semibold rounded-xl shadow-xs transition-all cursor-pointer mt-2"
              >
                {mode === 'signup' ? 'Crear Cuenta Personalizada' : 'Iniciar Sesión'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
                className="text-xs text-[#005bbf] font-semibold hover:underline cursor-pointer"
              >
                {mode === 'signup'
                  ? '¿Ya tienes cuenta? Inicia sesión aquí'
                  : '¿No tienes cuenta? Regístrate gratis'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
