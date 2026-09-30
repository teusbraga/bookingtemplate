import Link from 'next/link';
import { ArrowLeft, Stethoscope } from 'lucide-react';

/**
 * Formulário de credenciamento de novo médico.
 * TODO: Implementar server action para criar profile + registro em medicos.
 */
export default function NovoMedicoPage() {
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Link
        href="/admin/medicos"
        className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Voltar ao corpo clínico
      </Link>

      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Credenciar Novo Médico</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Preencha os dados para cadastrar um novo profissional no sistema
        </p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
          <Stethoscope className="h-4 w-4 shrink-0" />
          Formulário de credenciamento em desenvolvimento. Use o Supabase Dashboard ou a seed.sql para cadastrar médicos durante os testes.
        </div>
      </div>
    </div>
  );
}
