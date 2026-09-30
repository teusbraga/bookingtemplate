import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';

export default async function ConversasPage() {
  const supabase = await createClient();

  const { data: conversas } = await supabase
    .from('conversas')
    .select('id, telefone, etapa_atual, ultima_interacao, cliente_id, profiles ( nome )')
    .order('ultima_interacao', { ascending: false })
    .limit(50);

  function timeAgo(isoString: string) {
    const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
    if (diff < 1) return 'agora';
    if (diff < 60) return `${diff} min atrás`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h atrás`;
    return new Date(isoString).toLocaleDateString('pt-BR');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Painel Bot WhatsApp</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Estado em tempo real das conversas ativas no agente conversacional
        </p>
      </div>

      {!conversas || conversas.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 text-center text-gray-500 space-y-2">
          <MessageSquare className="h-10 w-10 mx-auto text-gray-400" />
          <p className="text-sm font-medium">Nenhuma conversa ativa.</p>
          <p className="text-xs text-gray-400">
            As conversas aparecerão aqui quando o webhook do WhatsApp receber mensagens.
          </p>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-white text-gray-500 uppercase text-[10px] font-semibold tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Telefone</th>
                  <th className="py-3 px-4">Paciente</th>
                  <th className="py-3 px-4">Etapa Atual</th>
                  <th className="py-3 px-4">Última Interação</th>
                  <th className="py-3 px-4">Auditoria</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {conversas.map((c: any) => (
                  <tr key={c.id} className="hover:bg-gray-100/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{c.telefone}</td>
                    <td className="py-3.5 px-4 text-gray-700">{c.profiles?.nome || '—'}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-600/10 text-blue-600 border border-blue-600/20 uppercase font-semibold">
                        {c.etapa_atual}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-400 font-mono">{timeAgo(c.ultima_interacao)}</td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/admin/conversas/${encodeURIComponent(c.telefone)}`}
                        className="text-blue-600 hover:underline text-[11px] font-semibold"
                      >
                        Ver detalhes →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
