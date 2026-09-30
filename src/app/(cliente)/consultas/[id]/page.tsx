import { createClient } from '@/lib/supabase/server';
import { Calendar, Clock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ConsultaDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: marcacao } = await supabase
    .from('marcacoes')
    .select(`
      id, inicio, fim, status, origem, motivo_cancelamento, observacoes, created_at,
      medicos ( id, especialidade, crm, duracao_padrao_minutos, profiles ( nome, telefone ) )
    `)
    .eq('id', id)
    .single();

  if (!marcacao) notFound();

  const inicio = new Date(marcacao.inicio);
  const fim = new Date(marcacao.fim);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Link
        href="/cliente/consultas"
        className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Voltar para minhas consultas
      </Link>

      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded border border-blue-600/30 bg-blue-600/10 text-blue-600 font-semibold">
              {(marcacao.medicos as any)?.especialidade}
            </span>
            <h1 className="text-xl font-bold text-gray-900 mt-2">
              {(marcacao.medicos as any)?.profiles?.nome}
            </h1>
            <p className="text-xs text-gray-500 font-mono">{(marcacao.medicos as any)?.crm}</p>
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
              marcacao.status === 'confirmado'
                ? 'bg-blue-600/10 text-blue-600 border border-blue-600/20'
                : marcacao.status === 'cancelado'
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {marcacao.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 border-t border-gray-200 pt-4">
          <div className="space-y-1">
            <span className="text-gray-400 uppercase tracking-wider font-semibold text-[10px]">Data</span>
            <p className="font-mono font-bold text-gray-900">
              {inicio.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-gray-400 uppercase tracking-wider font-semibold text-[10px]">Horário</span>
            <p className="font-mono font-bold text-gray-900">
              {inicio.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} —{' '}
              {fim.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-gray-400 uppercase tracking-wider font-semibold text-[10px]">Canal</span>
            <p className="font-mono text-gray-700 uppercase">{marcacao.origem}</p>
          </div>
          <div className="space-y-1">
            <span className="text-gray-400 uppercase tracking-wider font-semibold text-[10px]">Duração</span>
            <p className="font-mono text-gray-700">
              {(marcacao.medicos as any)?.duracao_padrao_minutos} min
            </p>
          </div>
        </div>

        {marcacao.observacoes && (
          <div className="bg-white border border-gray-200 rounded-xl p-3 text-xs text-gray-600">
            <span className="block text-gray-400 uppercase tracking-wider font-semibold text-[10px] mb-1">
              Observações
            </span>
            {marcacao.observacoes}
          </div>
        )}

        {marcacao.motivo_cancelamento && (
          <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-400">
            <span className="block font-semibold mb-1">Motivo do cancelamento</span>
            {marcacao.motivo_cancelamento}
          </div>
        )}
      </div>
    </div>
  );
}
