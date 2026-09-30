import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function ConfirmarPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-5 shadow-xl">
        <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Cadastro Realizado!</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Seu cadastro foi concluído com sucesso. Se a confirmação por e-mail estiver ativa no seu projeto Supabase, verifique sua caixa de entrada.
          </p>
        </div>

        <div className="pt-3">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold py-2.5 px-4 rounded-xl text-sm transition-all shadow-md"
          >
            Fazer Login Agora
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
