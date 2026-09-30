import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function ConfirmarPage() {
 return (
 <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center p-4">
 <div className="w-full max-w-md bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center space-y-5 shadow-none">
 <div className="mx-auto h-16 w-16 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center border border-blue-600/20">
 <CheckCircle2 className="h-8 w-8" />
 </div>

 <div className="space-y-2">
 <h1 className="text-2xl font-bold text-gray-900">Cadastro Realizado!</h1>
 <p className="text-sm text-gray-500 leading-relaxed">
 Seu cadastro foi concluído com sucesso. Se a confirmação por e-mail estiver ativa no seu projeto Supabase, verifique sua caixa de entrada.
 </p>
 </div>

 <div className="pt-3">
 <Link
 href="/login"
 className="inline-flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-slate-950 font-semibold py-2.5 px-4 rounded-xl text-sm transition-all shadow-none"
 >
 Fazer Login Agora
 <ArrowRight className="h-4 w-4" />
 </Link>
 </div>
 </div>
 </div>
 );
}
