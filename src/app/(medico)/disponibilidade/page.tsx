import { createClient } from '@/lib/supabase/server';
import { Clock } from 'lucide-react';

const DIAS_SEMANA = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
  'Quinta-feira', 'Sexta-feira', 'Sábado',
];

export default async function DisponibilidadePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: medico } = await supabase
    .from('medicos')
    .select('id, duracao_padrao_minutos')
    .eq('profile_id', user?.id || '')
    .single();

  const { data: disponibilidades } = await supabase
    .from('disponibilidades')
    .select('*')
    .eq('medico_id', medico?.id || '')
    .order('dia_semana', { ascending: true });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Regras de Expediente</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Defina seu horário de atendimento e intervalo de almoço por dia da semana.
          A função SQL do Supabase gera automaticamente os slots livres a partir destas regras.
        </p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-500">Duração padrão da consulta:</span>
          <div className="text-base font-bold text-gray-900 mt-0.5">
            {medico?.duracao_padrao_minutos || 30} minutos
          </div>
        </div>
        <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 font-semibold">
          Fórmula SQL STABLE
        </span>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden shadow-none">
        <div className="divide-y divide-gray-200">
          {DIAS_SEMANA.map((diaNome, diaIndex) => {
            const regra = disponibilidades?.find((d) => d.dia_semana === diaIndex);
            const isAtivo = regra ? regra.ativo : false;
            return (
              <div
                key={diaIndex}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-100/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      isAtivo ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{diaNome}</h3>
                    <span className="text-xs text-gray-500">
                      {isAtivo ? 'Atendimento ativo' : 'Folga / Sem expediente'}
                    </span>
                  </div>
                </div>

                {isAtivo && regra ? (
                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-gray-600">
                    <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                      <Clock className="h-3.5 w-3.5 text-blue-600" />
                      <span>
                        {regra.hora_inicio.slice(0, 5)} — {regra.hora_fim.slice(0, 5)}
                      </span>
                    </div>
                    {regra.pausa_inicio && regra.pausa_fim && (
                      <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500">
                        <span>
                          Almoço: {regra.pausa_inicio.slice(0, 5)} — {regra.pausa_fim.slice(0, 5)}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-gray-400 italic">Fechado</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
