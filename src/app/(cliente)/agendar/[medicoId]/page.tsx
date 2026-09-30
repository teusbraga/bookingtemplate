import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ArrowLeft, Calendar } from 'lucide-react';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ medicoId: string }>;
}

/**
 * Página de agendamento por médico específico.
 * Exibe os dados do profissional e permite selecionar data + slot.
 * O fluxo interativo reutiliza o componente SlotPicker via /cliente/agendar.
 * Esta rota serve como deep-link (ex: /cliente/agendar/abc-123).
 */
export default async function AgendarMedicoPage({ params }: Props) {
  const { medicoId } = await params;
  const supabase = await createClient();

  const { data: medico } = await supabase
    .from('medicos')
    .select('id, crm, especialidade, duracao_padrao_minutos, profiles ( nome, telefone, email )')
    .eq('id', medicoId)
    .eq('ativo', true)
    .single();

  if (!medico) notFound();

  const perfil = (medico.profiles as any);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Link
        href="/cliente/agendar"
        className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Voltar ao catálogo
      </Link>

      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-3">
        <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-blue-600/10 text-blue-600 border border-blue-600/20">
          {medico.especialidade}
        </span>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">{perfil?.nome}</h1>
        <div className="flex gap-4 text-xs text-gray-500 font-mono">
          <span>CRM: {medico.crm}</span>
          <span>Consulta: {medico.duracao_padrao_minutos} min</span>
        </div>
      </div>

      <div className="bg-blue-600/5 border border-blue-600/20 rounded-xl p-4 text-sm text-blue-600 flex items-start gap-3">
        <Calendar className="h-5 w-5 shrink-0 mt-0.5" />
        <span>
          Use a{' '}
          <Link href="/cliente/agendar" className="font-bold underline">
            página de agendamento
          </Link>{' '}
          para selecionar data e horário para este profissional.
        </span>
      </div>
    </div>
  );
}
