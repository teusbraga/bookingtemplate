'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { loginAction } from '../actions';
import { Calendar, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect') || '';
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set('redirect', redirectParam);

    try {
      const result = await loginAction(formData);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
    } catch {
      // Next.js redirect dispara exceção intencional
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
      {error && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">E-mail</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              name="email"
              type="email"
              required
              placeholder="seu@email.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-slate-300">Senha</label>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-semibold py-2.5 px-4 rounded-xl text-sm transition-all shadow-md cursor-pointer mt-2"
        >
          {loading ? 'Entrando...' : 'Entrar na plataforma'}
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <div className="text-center pt-2 border-t border-slate-800/80">
        <p className="text-xs text-slate-400">
          Ainda não tem conta?{' '}
          <Link href="/cadastro" className="text-emerald-400 hover:text-emerald-300 font-medium">
            Cadastre-se gratuitamente
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
            <Calendar className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Acessar Conta</h1>
          <p className="text-sm text-slate-400">
            Entre para gerenciar seus agendamentos ou sua agenda médica
          </p>
        </div>

        <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Carregando...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
