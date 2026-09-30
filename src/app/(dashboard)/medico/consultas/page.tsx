import { createClient } from '@/lib/supabase/server';
import { Calendar, Clock, Phone, AlertCircle } from 'lucide-react';

export default async function TodasConsultasMedicoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: medico } = await supabase
    .from('medicos')
    .select('id')
    .eq('profile_id', user?.id || '')
    .single();

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
      profiles (
        id,
        nome,
        telefone,
        email
      )
    `)
    .eq('medico_id', medico?.id || '')
    .order('inicio', { ascending: false });

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
        <h1 className="text-xl sm:text-2xl font-bold text-white">Todas as Consultas</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Registro completo de todos os agendamentos registrados no sistema
        </p>
      </div>

      {(!marcacoes || marcacoes.length === 0) ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-2">
          <Calendar className="h-10 w-10 mx-auto text-slate-500" />
          <p className="text-sm font-medium">Nenhum registro encontrado.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Paciente</th>
                  <th className="py-3 px-4">Contato</th>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Horário</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Origem</th>
                  <th className="py-3 px-4">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {marcacoes.map((m: any) => {
                  const dt = formatDateTime(m.inicio);
                  const pacienteNome = m.profiles?.nome || 'Paciente';
                  const pacienteTelefone = m.profiles?.telefone || '-';

                  return (
                    <tr key={m.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">{pacienteNome}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">{pacienteTelefone}</td>
                      <td className="py-3.5 px-4 font-mono">{dt.data}</td>
                      <td className="py-3.5 px-4 font-mono text-purple-300">{dt.hora}</td>
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 capitalize">
                          {m.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 uppercase">
                          {m.origem}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                        {m.observacoes || '-'}
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
