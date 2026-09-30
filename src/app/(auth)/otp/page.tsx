import Link from 'next/link';
import { CheckCircle2, ArrowRight, MessageSquare } from 'lucide-react';

export default function OtpPage() {
  return (
    <div className="w-full max-w-md bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center space-y-5 shadow-none">
      <div className="mx-auto h-16 w-16 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center border border-blue-600/20">
        <MessageSquare className="h-8 w-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Verifique seu WhatsApp</h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          Enviamos um código de verificação para o telefone cadastrado.
          Insira o código abaixo para ativar sua conta.
        </p>
      </div>

      {/* TODO: Wire up OTP input + /api/auth/verify */}
      <div className="bg-blue-600/5 border border-blue-600/20 rounded-xl p-4 text-xs text-blue-600">
        OTP input estará disponível após integração com a Meta WhatsApp Cloud API (Fase 3).
      </div>

      <div className="pt-3">
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-slate-950 font-semibold py-2.5 px-4 rounded-xl text-sm transition-all shadow-none"
        >
          Ir para o Login
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
