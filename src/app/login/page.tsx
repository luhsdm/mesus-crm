'use client';

import React, { useState, useEffect } from 'react';
import { LogIn, Lock, Mail, BarChart2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [supabase, setSupabase] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const { createBrowserClient } = await import('@supabase/ssr');
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
      if (url && key) {
        setSupabase(createBrowserClient(url, key));
      }
    };
    init();
  }, []);

  const handleLogin = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message || 'E-mail ou senha incorretos.');
      setLoading(false);
    } else {
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center p-6 font-sans text-[#e6edf3]">
      <div className="w-full max-w-[400px] bg-[#111318] border border-[#21262d] rounded-[28px] p-10 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">

        <div className="flex flex-col items-center mb-8">
          <div className="w-11 h-11 bg-[#5c54ed] rounded-xl flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(92,84,237,0.3)]">
            <BarChart2 className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Mesus Media</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7d8590]">Intelligence CRM</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d8590]" />
            <input
              type="email"
              placeholder="seu@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0a0c10] border border-[#30363d] text-[#e6edf3] rounded-xl py-3.5 pl-12 pr-4 text-sm focus:border-[#5c54ed] focus:ring-4 focus:ring-[#5c54ed]/10 outline-none transition-all placeholder:text-[#484f58]"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d8590]" />
            <input
              type="password"
              placeholder="Sua senha"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0a0c10] border border-[#30363d] text-[#e6edf3] rounded-xl py-3.5 pl-12 pr-4 text-sm focus:border-[#5c54ed] focus:ring-4 focus:ring-[#5c54ed]/10 outline-none transition-all placeholder:text-[#484f58]"
            />
          </div>

          {error && (
            <div role="alert" className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-3 px-4 rounded-lg animate-in fade-in zoom-in-95">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !supabase}
            className="w-full bg-[#5c54ed] hover:bg-[#4a42d4] text-white font-bold py-4 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-[#5c54ed]/20"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <div className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                <span>Entrar no sistema</span>
              </div>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-[#21262d] pt-6">
          <p className="text-[11px] text-[#7d8590] leading-relaxed">
            Ambiente Seguro Next.js<br />
            Acesso restrito a colaboradores Mesus Media.
          </p>
        </div>
      </div>
    </div>
  );
}
