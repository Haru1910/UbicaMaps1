import { useState } from 'react';
import { DEMO_CREDENTIALS } from '../services/dataService';

interface LoginScreenProps {
  onLogin: (tipo: 'admin' | 'motorizado', id: string, nombre: string) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [mode, setMode] = useState<'select' | 'admin' | 'motorizado'>('select');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [motoId, setMotoId] = useState('');
  const [motoPassword, setMotoPassword] = useState('');
  const [error, setError] = useState('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const admin = DEMO_CREDENTIALS.admins.find(
      a => a.email === email && a.password === password
    );

    if (admin) {
      onLogin('admin', admin.id, admin.nombre);
    } else {
      setError('Credenciales incorrectas. Intenta con haru@mototrack.com / admin123');
    }
  };

  const handleMotoLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const moto = DEMO_CREDENTIALS.motorizados.find(
      m => m.id === motoId && m.password === motoPassword
    );

    if (moto) {
      onLogin('motorizado', moto.id, moto.nombre);
    } else {
      setError('Credenciales incorrectas. Intenta con moto_1 / moto001');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center px-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-4xl shadow-2xl shadow-indigo-500/30 mb-4">
            🏍️
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
            MotoTrack
          </h1>
          <p className="text-gray-400 mt-2">Sistema de Geolocalización en Tiempo Real</p>
        </div>

        {/* Card */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">

          {mode === 'select' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white text-center mb-6">
                ¿Cómo deseas ingresar?
              </h2>

              <button
                onClick={() => setMode('admin')}
                className="w-full p-5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl hover:from-indigo-500/30 hover:to-purple-500/30 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-500/30 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    👨‍💼
                  </div>
                  <div className="text-left">
                    <p className="text-white font-semibold">Administrador</p>
                    <p className="text-gray-400 text-sm">Visualizar motorizados en el mapa</p>
                  </div>
                  <i className="fas fa-chevron-right text-gray-500 ml-auto group-hover:text-indigo-400 transition-colors"></i>
                </div>
              </button>

              <button
                onClick={() => setMode('motorizado')}
                className="w-full p-5 bg-gradient-to-r from-green-500/20 to-teal-500/20 border border-green-500/30 rounded-2xl hover:from-green-500/30 hover:to-teal-500/30 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/30 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    🏍️
                  </div>
                  <div className="text-left">
                    <p className="text-white font-semibold">Motorizado</p>
                    <p className="text-gray-400 text-sm">Enviar mi ubicación</p>
                  </div>
                  <i className="fas fa-chevron-right text-gray-500 ml-auto group-hover:text-green-400 transition-colors"></i>
                </div>
              </button>
            </div>
          )}

          {mode === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => { setMode('select'); setError(''); }}
                  className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                >
                  <i className="fas fa-arrow-left text-white"></i>
                </button>
                <h2 className="text-xl font-semibold text-white">
                  Ingreso Administrador
                </h2>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Email</label>
                <div className="relative">
                  <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="haru@mototrack.com"
                    className="w-full pl-11 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Contraseña</label>
                <div className="relative">
                  <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg shadow-indigo-500/30"
              >
                Ingresar como Administrador
              </button>

              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 mt-4">
                <p className="text-indigo-300 text-xs text-center">
                  <strong>Demo:</strong> haru@mototrack.com / admin123
                </p>
              </div>
            </form>
          )}

          {mode === 'motorizado' && (
            <form onSubmit={handleMotoLogin} className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => { setMode('select'); setError(''); }}
                  className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                >
                  <i className="fas fa-arrow-left text-white"></i>
                </button>
                <h2 className="text-xl font-semibold text-white">
                  Ingreso Motorizado
                </h2>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">ID de Motorizado</label>
                <div className="relative">
                  <i className="fas fa-motorcycle absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
                  <input
                    type="text"
                    value={motoId}
                    onChange={(e) => setMotoId(e.target.value)}
                    placeholder="moto_1"
                    className="w-full pl-11 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Contraseña</label>
                <div className="relative">
                  <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
                  <input
                    type="password"
                    value={motoPassword}
                    onChange={(e) => setMotoPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl text-white font-semibold hover:from-green-600 hover:to-teal-600 transition-all shadow-lg shadow-green-500/30"
              >
                Conectar como Motorizado
              </button>

              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 mt-4">
                <p className="text-green-300 text-xs text-center">
                  <strong>Demo:</strong> moto_1 / moto001
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-xs">
            MotoTrack v1.0 • Geolocalización en tiempo real
          </p>
          <p className="text-gray-600 text-xs mt-1">
            Actualización cada 2 segundos • 40 motorizados + 3 administradores
          </p>
        </div>
      </div>
    </div>
  );
}
