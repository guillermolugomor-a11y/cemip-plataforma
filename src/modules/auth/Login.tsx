import React, { useState } from 'react';
import { useAuthStore } from '../../lib/AuthStore';
import { Mail, Lock, Loader2, ChevronRight, ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Login() {
  const { signIn } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' ? 'Credenciales incorrectas' : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-apple-bg flex items-center justify-center p-6 font-sans selection:bg-apple-blue/10 selection:text-apple-blue relative overflow-hidden">
      
      {/* ── Background Mesh Gradient ─────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full bg-apple-blue/15 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-purple-500/5 blur-[100px] animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* ── Pattern Overlay ─────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]" 
           style={{ backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />

      <div className="w-full max-w-[440px] animate-apple relative z-10">
        
        {/* ── Logo Area ─────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center mb-12">
          <div className="relative group">
            <div className="absolute -inset-4 bg-apple-blue/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <img 
              src="/logo.jpg" 
              alt="CEMIP" 
              className="w-32 h-auto object-contain relative transition-transform duration-700 group-hover:scale-105" 
            />
          </div>
        </div>

        {/* ── Login Card (Glassmorphism) ─────────────────────────────────── */}
        <div className="glass-effect dark:bg-apple-secondary/40 border border-white/40 dark:border-white/5 rounded-[40px] p-10 shadow-apple-huge shadow-black/5 relative overflow-hidden">
          
          {/* Subtle shine effect */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-50" />
          
          <div className="mb-10 text-center">
            <h2 className="text-[24px] font-black text-apple-black tracking-tight leading-tight">Acceso Administrativo</h2>
            <p className="text-[14px] text-apple-text-tertiary font-medium mt-2">Ingresa tus credenciales para continuar.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-apple-text-tertiary ml-1 opacity-70">Correo Electrónico</label>
              <div className="relative group">
                <div className="absolute inset-0 bg-apple-blue/5 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-apple-text-tertiary group-focus-within:text-apple-blue transition-all duration-300" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 bg-apple-slate/50 dark:bg-apple-bg/50 border border-apple-separator/20 dark:border-white/5 rounded-2xl pl-12 pr-4 text-[15px] font-semibold text-apple-black focus:ring-0 focus:border-apple-blue/30 transition-all placeholder:text-apple-text-tertiary/40"
                  placeholder="ejemplo@cemip.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-apple-text-tertiary ml-1 opacity-70">Contraseña</label>
              <div className="relative group">
                <div className="absolute inset-0 bg-apple-blue/5 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-apple-text-tertiary group-focus-within:text-apple-blue transition-all duration-300" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 bg-apple-slate/50 dark:bg-apple-bg/50 border border-apple-separator/20 dark:border-white/5 rounded-2xl pl-12 pr-4 text-[15px] font-semibold text-apple-black focus:ring-0 focus:border-apple-blue/30 transition-all placeholder:text-apple-text-tertiary/40"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-apple-red/5 border border-apple-red/10 rounded-2xl text-apple-red text-[13px] font-bold text-center animate-apple">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full h-14 bg-apple-black dark:bg-white dark:text-black text-white rounded-2xl text-[14px] font-black uppercase tracking-[0.15em] flex items-center justify-center gap-2 hover:shadow-apple-huge hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:active:scale-100 group",
                isLoading && "cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Iniciar Sesión
                  <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={3} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-apple-separator/20 dark:border-white/5 flex items-center justify-center gap-2.5">
             <div className="w-6 h-6 rounded-full bg-apple-green/10 flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-apple-green" />
             </div>
             <span className="text-[10px] font-bold text-apple-text-tertiary uppercase tracking-widest opacity-60">Sistema Seguro de Gestión Clínica</span>
          </div>
        </div>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-6 mt-12">
          <p className="text-[13px] text-apple-text-tertiary font-medium">
            ¿Olvidaste tu contraseña? <span className="text-apple-blue cursor-pointer font-bold hover:underline">Contacta a soporte</span>
          </p>
          <div className="flex items-center gap-4 text-[10px] font-black text-apple-text-tertiary uppercase tracking-widest opacity-40">
            <span>© 2026 CEMIP</span>
            <div className="w-1 h-1 bg-apple-text-tertiary rounded-full" />
            <span>Privacidad</span>
            <div className="w-1 h-1 bg-apple-text-tertiary rounded-full" />
            <span>Soporte</span>
          </div>
        </div>
      </div>
    </div>
  );
}

