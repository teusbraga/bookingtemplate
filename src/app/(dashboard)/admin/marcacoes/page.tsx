import { createClient } from '@/lib/supabase/server';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';

export default async function AdminMarcacoesPage() {
  const supabase = await createClient();

  const { data: marcacoes } = await supabase
    .from('marcacoes')
    .select(`
      id,
      inicio,
      fim,
      status,
      origem,
      motivo_cancelamento,
      observacoes,
      created_at,
      medicos (
        id,
        especialidade,
        profiles ( nome )
      ),
      profiles (
        id,
        nome,
        telefone
      )
    `)
    .order('inicio', { ascending: false })
    .limit(50);

  function formatDateTime(isoString: string) {
    try {
      const d = new Date(isoString);
      return {
        data: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        hora: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      };
    } catch {
      return { data: isoString, hora: '' };
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Todas as Marcações do Sistema</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Visão global para auditoria de agendamentos, canais de origem e cancelamentos
        </p>
      </div>

      {(!marcacoes || marcacoes.length === 0) ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-2">
          <Calendar className="h-10 w-10 mx-auto text-slate-500" />
          <p className="text-sm font-medium">Nenhuma marcação no sistema.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Paciente</th>
                  <th className="py-3 px-4">Médico</th>
                  <th className="py-3 px-4">Especialidade</th>
                  <th className="py-3 px-4">Data/Hora</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Canal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {marcacoes.map((m: any) => {
                  const dt = formatDateTime(m.inicio);
                  const pacienteNome = m.profiles?.nome || 'Paciente';
                  const medicoNome = m.medicos?.profiles?.nome || 'Médico';
                  const especialidade = m.medicos?.especialidade || '-';

                  return (
                    <tr key={m.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">{pacienteNome}</td>
                      <td className="py-3.5 px-4 text-slate-200">{medicoNome}</td>
                      <td className="py-3.5 px-4 text-slate-400">{especialidade}</td>
                      <td className="py-3.5 px-4 font-mono text-emerald-300">
                        {dt.data} às {dt.hora}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 capitalize">
                          {m.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 uppercase font-semibold">
                          {m.origem}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
