import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ telefone: string }>;
}

export default async function ConversaDetailPage({ params }: Props) {
  const { telefone } = await params;
  const telefoneDecoded = decodeURIComponent(telefone);
  const supabase = await createClient();

  const { data: conversa } = await supabase
    .from('conversas')
    .select('*')
    .eq('telefone', telefoneDecoded)
    .single();

  if (!conversa) notFound();

  const { data: mensagens } = await supabase
    .from('mensagens_log')
    .select('*')
    .eq('telefone', telefoneDecoded)
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/admin/conversas"
        className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Voltar ao painel de conversas
      </Link>

      <div>
        <h1 className="text-xl font-bold text-gray-900 font-mono">{telefoneDecoded}</h1>
        <span className="inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded bg-blue-600/10 text-blue-600 border border-blue-600/20 uppercase font-semibold">
          Etapa: {conversa.etapa_atual}
        </span>
      </div>

      {/* State Machine Context */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-2">
        <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Contexto JSON da Máquina de Estados</h2>
        <pre className="text-[11px] text-gray-600 overflow-x-auto bg-white border border-gray-200 rounded-xl p-3">
          {JSON.stringify(conversa.contexto_json, null, 2)}
        </pre>
      </div>

      {/* Messages Log */}
      <div className="space-y-2">
        <h2 className="text-sm font-bold text-gray-900">Log de Mensagens ({mensagens?.length || 0})</h2>
        {mensagens?.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.direcao === 'entrada' ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-sm p-3 rounded-xl text-xs space-y-1 ${
                m.direcao === 'entrada'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-blue-600/10 border border-blue-600/20 text-blue-800'
              }`}
            >
              <div className="font-semibold uppercase text-[10px] tracking-wider text-gray-400">
                {m.direcao} · {m.tipo}
              </div>
              <div>{m.conteudo || '—'}</div>
              <div className="text-[10px] text-gray-400 font-mono">
                {new Date(m.created_at).toLocaleTimeString('pt-BR')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
