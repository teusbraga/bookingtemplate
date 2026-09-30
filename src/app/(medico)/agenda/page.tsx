import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Calendar, Clock, Phone, Settings, AlertCircle } from 'lucide-react';

export default async function AgendaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: medico } = await supabase
    .from('medicos')
    .select('id, crm, especialidade, duracao_padrao_minutos, profiles ( nome, email, telefone )')
    .eq('profile_id', user?.id || '')
    .single();

  if (!medico) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center space-y-3">
        <AlertCircle className="h-10 w-10 text-amber-400 mx-auto" />
        <h2 className="text-lg font-bold text-gray-900">Perfil Médico não encontrado</h2>
        <p className="text-xs text-gray-500">
          Sua conta não possui um registro vinculado na tabela de médicos ou aguarda aprovação.
        </p>
      </div>
    );
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: consultas } = await supabase
    .from('marcacoes')
    .select(`
      id, inicio, fim, status, origem, observacoes,
      profiles ( id, nome, telefone, email )
    `)
    .eq('medico_id', medico.id)
    .gte('inicio', todayStart.toISOString())
    .order('inicio', { ascending: true })
    .limit(20);

  const perfil = (medico.profiles as any);

  function formatTime(iso: string) {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch { return ''; }
  }

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch { return iso; }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50 border border-gray-200 rounded-2xl p-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
              {medico.especialidade}
            </span>
            <span className="text-xs text-gray-500 font-mono">{medico.crm}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
            Agenda: {perfil?.nome}
          </h1>
        </div>
        <Link
          href="/medico/disponibilidade"
          className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-gray-300 transition-colors shadow-none shrink-0"
        >
          <Settings className="h-4 w-4" />
          Configurar Expediente
        </Link>
      </div>

      <div className="space-y-4">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-600" />
          Próximos Atendimentos
        </h2>

        {!consultas || consultas.length === 0 ? (
          <div className="bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl p-12 text-center text-gray-500 space-y-2">
            <Clock className="h-10 w-10 text-slate-400 mx-auto" />
            <p className="text-sm font-medium">Nenhum atendimento agendado a partir de hoje.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {consultas.map((c: any) => {
              const isCancelado = c.status === 'cancelado';
              return (
                <div
                  key={c.id}
                  className={`bg-gray-50 border rounded-2xl p-5 space-y-4 transition-colors ${
                    isCancelado ? 'border-gray-200/40 opacity-60' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-500 uppercase">
                        {c.origem}
                      </span>
                      <h3 className="text-base font-bold text-gray-900 mt-1.5">
                        {c.profiles?.nome || 'Paciente'}
                      </h3>
                      {c.profiles?.telefone && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span>{c.profiles.telefone}</span>
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                        isCancelado
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-blue-600/10 text-blue-600 border border-blue-600/20'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-600 border-t border-gray-200/80 pt-3">
                    <div className="flex items-center gap-1.5 font-mono font-semibold">
                      <Clock className="h-3.5 w-3.5 text-blue-600" />
                      <span>
                        {formatTime(c.inicio)} — {formatTime(c.fim)}
                      </span>
                    </div>
                    <span className="text-gray-500">{formatDate(c.inicio)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
