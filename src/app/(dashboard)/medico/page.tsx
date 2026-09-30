import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Calendar, Clock, User, Phone, CheckCircle, XCircle, Settings, AlertCircle } from 'lucide-react';

export default async function MedicoDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Identifica registro do médico vinculado ao auth.uid()
  const { data: medico } = await supabase
    .from('medicos')
    .select(`
      id,
      crm,
      especialidade,
      duracao_padrao_minutos,
      profiles ( nome, email, telefone )
    `)
    .eq('profile_id', user?.id || '')
    .single();

  if (!medico) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
        <AlertCircle className="h-10 w-10 text-amber-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Perfil Médico não encontrado</h2>
        <p className="text-xs text-slate-400">
          Sua conta não possui um registro vinculado na tabela de médicos ou aguarda aprovação de CRM.
        </p>
      </div>
    );
  }

  // 2. Busca consultas de hoje em diante
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: consultas } = await supabase
    .from('marcacoes')
    .select(`
      id,
      inicio,
      fim,
      status,
      origem,
      observacoes,
      profiles (
        id,
        nome,
        telefone,
        email
      )
    `)
    .eq('medico_id', medico.id)
    .gte('inicio', todayStart.toISOString())
    .order('inicio', { ascending: true })
    .limit(20);

  function formatTime(isoString: string) {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return '';
    }
  }

  function formatDate(isoString: string) {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return isoString;
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
              {medico.especialidade}
            </span>
            <span className="text-xs text-slate-400 font-mono">{medico.crm}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Agenda: {medico.profiles?.nome}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Consultas agendadas com garantia de zero sobreposição no banco de dados
          </p>
        </div>

        <Link
          href="/medico/expediente"
          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-700 transition-colors shadow-sm shrink-0"
        >
          <Settings className="h-4 w-4" />
          Configurar Expediente
        </Link>
      </div>

      {/* Grid de Consultas */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Calendar className="h-4 w-4 text-purple-400" />
          Próximos Atendimentos
        </h2>

        {(!consultas || consultas.length === 0) ? (
          <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-2">
            <Clock className="h-10 w-10 text-slate-600 mx-auto" />
            <p className="text-sm font-medium">Nenhum atendimento agendado a partir de hoje.</p>
            <p className="text-xs text-slate-500">
              Os horários livres continuam disponíveis para agendamento pelos pacientes.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {consultas.map((c: any) => {
              const pacienteNome = c.profiles?.nome || 'Paciente';
              const pacienteTelefone = c.profiles?.telefone || '';
              const horaInicio = formatTime(c.inicio);
              const horaFim = formatTime(c.fim);
              const dataConsulta = formatDate(c.inicio);
              const isCancelado = c.status === 'cancelado';

              return (
                <div
                  key={c.id}
                  className={`bg-slate-900 border rounded-2xl p-5 space-y-4 transition-colors ${
                    isCancelado
                      ? 'border-slate-800/40 opacity-60'
                      : 'border-slate-800 hover:border-slate-700 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                        Origem: {c.origem}
                      </span>
                      <h3 className="text-base font-bold text-white mt-1.5">{pacienteNome}</h3>
                      {pacienteTelefone && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                          <Phone className="h-3 w-3 text-slate-500" />
                          <span>{pacienteTelefone}</span>
                        </div>
                      )}
                    </div>

                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                        isCancelado
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  {c.observacoes && (
                    <p className="text-xs text-slate-400 italic bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                      &quot;{c.observacoes}&quot;
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-300 border-t border-slate-800/80 pt-3">
                    <div className="flex items-center gap-1.5 font-mono text-purple-300 font-semibold">
                      <Clock className="h-3.5 w-3.5 text-purple-400" />
                      <span>{horaInicio} - {horaFim}</span>
                    </div>
                    <span className="text-slate-400">{dataConsulta}</span>
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
