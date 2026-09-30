import { createClient } from '@/lib/supabase/server';
import { Database } from 'lucide-react';

export default async function LogsPage() {
  const supabase = await createClient();

  const { data: logs } = await supabase
    .from('mensagens_log')
    .select('id, message_id, telefone, direcao, tipo, conteudo, status, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Logs de Mensagens</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Auditoria bruta de mensagens e webhooks recebidos pelo sistema
        </p>
      </div>

      {!logs || logs.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 text-center text-gray-500 space-y-2">
          <Database className="h-10 w-10 mx-auto text-gray-400" />
          <p className="text-sm font-medium">Nenhum log registrado ainda.</p>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-white text-gray-500 uppercase text-[10px] font-semibold tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Telefone</th>
                  <th className="py-3 px-4">Direção</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Conteúdo</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-100/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-800">{l.telefone}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                          l.direcao === 'entrada'
                            ? 'bg-blue-600/10 text-blue-600 border border-blue-600/20'
                            : 'bg-gray-100 text-gray-500 border border-gray-200'
                        }`}
                      >
                        {l.direcao}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-500">{l.tipo}</td>
                    <td className="py-3.5 px-4 text-gray-600 max-w-xs truncate">{l.conteudo || '—'}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-500 uppercase">
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-400">
                      {new Date(l.created_at).toLocaleString('pt-BR')}
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
