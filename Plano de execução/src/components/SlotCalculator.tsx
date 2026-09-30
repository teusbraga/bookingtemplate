import React, { useState } from 'react';
import { Clock, Calendar, Stethoscope, CheckCircle2, XCircle, Coffee, Terminal, Play } from 'lucide-react';
import { INITIAL_MEDICOS, INITIAL_MARCACOES, DEMO_DATE } from '../data/mockDatabase';

interface CalculatedSlot {
  start: string;
  end: string;
  isAvailable: boolean;
  reason?: string;
}

export const SlotCalculator: React.FC = () => {
  const [selectedMedicoId, setSelectedMedicoId] = useState<string>(INITIAL_MEDICOS[0].id);
  const [targetDate, setTargetDate] = useState<string>(DEMO_DATE);

  const currentMedico = INITIAL_MEDICOS.find((m) => m.id === selectedMedicoId) || INITIAL_MEDICOS[0];

  // Emulate get_horarios_disponiveis SQL function
  const calculateSlots = (): CalculatedSlot[] => {
    const slots: CalculatedSlot[] = [];
    const duration = currentMedico.duracao_padrao_minutos; // 30 mins

    // Assume 08:00 to 18:00, lunch 12:00 - 13:00
    const startHour = 8;
    const endHour = 18;
    const lunchStart = 12 * 60; // 720 mins
    const lunchEnd = 13 * 60; // 780 mins

    let currentMinutes = startHour * 60;
    const maxMinutes = endHour * 60;

    const activeBookings = INITIAL_MARCACOES.filter(
      (m) => m.medico_id === selectedMedicoId && m.status !== 'cancelado' && m.inicio.startsWith(targetDate)
    );

    while (currentMinutes + duration <= maxMinutes) {
      const slotStartMin = currentMinutes;
      const slotEndMin = currentMinutes + duration;

      const formatTime = (min: number) => {
        const h = Math.floor(min / 60).toString().padStart(2, '0');
        const m = (min % 60).toString().padStart(2, '0');
        return `${h}:${m}`;
      };

      const sTimeStr = formatTime(slotStartMin);
      const eTimeStr = formatTime(slotEndMin);

      // Check lunch
      const isLunch = slotStartMin < lunchEnd && slotEndMin > lunchStart;

      // Check booked
      const isBooked = activeBookings.some((b) => {
        const bStart = b.inicio.slice(11, 16);
        const bEnd = b.fim.slice(11, 16);
        return sTimeStr < bEnd && eTimeStr > bStart;
      });

      if (isLunch) {
        slots.push({
          start: sTimeStr,
          end: eTimeStr,
          isAvailable: false,
          reason: 'Intervalo de Almoço'
        });
      } else if (isBooked) {
        slots.push({
          start: sTimeStr,
          end: eTimeStr,
          isAvailable: false,
          reason: 'Consulta Ocupada'
        });
      } else {
        slots.push({
          start: sTimeStr,
          end: eTimeStr,
          isAvailable: true
        });
      }

      currentMinutes += duration;
    }

    return slots;
  };

  const calculatedSlots = calculateSlots();
  const availableCount = calculatedSlots.filter((s) => s.isAvailable).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Função SQL get_horarios_disponiveis (Demonstração Live)
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              O endpoint <code className="text-cyan-300 font-mono">GET /api/medicos/:id/horarios-disponiveis</code> (Fase 1)
              executa diretamente esta Stored Procedure em PostgreSQL, calculando slots de {currentMedico.duracao_padrao_minutos} min,
              respeitando horários de almoço e subtraindo marcações ativas sem transferir cálculos pesados para o servidor Node.js.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-mono">
              STABLE plpgsql
            </span>
          </div>
        </div>
      </div>

      {/* Doctor & Date Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <Stethoscope className="h-4 w-4 text-emerald-400" />
            <span className="text-slate-400 font-medium">Médico:</span>
            <select
              value={selectedMedicoId}
              onChange={(e) => setSelectedMedicoId(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-medium focus:border-cyan-500 focus:outline-none"
            >
              {INITIAL_MEDICOS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome} ({m.especialidade})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-cyan-400" />
            <span className="text-slate-400 font-medium">Data:</span>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="text-xs font-mono">
          <span className="text-slate-400">Slots Livres: </span>
          <span className="text-emerald-400 font-bold">{availableCount}</span>
          <span className="text-slate-500"> / {calculatedSlots.length} gerados</span>
        </div>
      </div>

      {/* Slots Visual Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Grade de Horários Calculada Dinamicamente pelo Postgres:
          </h3>
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="flex items-center space-x-1 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Disponível</span>
            </span>
            <span className="flex items-center space-x-1 text-rose-400">
              <span className="h-2 w-2 rounded-full bg-rose-400" />
              <span>Ocupado</span>
            </span>
            <span className="flex items-center space-x-1 text-slate-400">
              <span className="h-2 w-2 rounded-full bg-slate-600" />
              <span>Intervalo</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
          {calculatedSlots.map((slot, i) => (
            <div
              key={i}
              className={`p-3 rounded-xl border text-center transition-all ${
                slot.isAvailable
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/30'
                  : slot.reason === 'Intervalo de Almoço'
                  ? 'bg-slate-950/50 border-slate-800 text-slate-500'
                  : 'bg-rose-950/20 border-rose-500/30 text-rose-400'
              }`}
            >
              <div className="font-mono font-bold text-sm">
                {slot.start} - {slot.end}
              </div>
              <div className="text-[10px] mt-1 flex items-center justify-center space-x-1">
                {slot.isAvailable ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    <span>Livre para Agendar</span>
                  </>
                ) : slot.reason === 'Intervalo de Almoço' ? (
                  <>
                    <Coffee className="h-3 w-3 text-slate-500" />
                    <span>Almoço</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 text-rose-400" />
                    <span>Ocupado</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SQL Query Box */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
          <div className="flex items-center space-x-2">
            <Terminal className="h-4 w-4 text-cyan-400" />
            <span className="font-mono text-slate-300">Chamada SQL Executada pela API</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Retorno em &lt; 2ms</span>
        </div>
        <pre className="p-4 text-xs font-mono text-cyan-300 bg-slate-950 overflow-x-auto">
{`-- A API Vercel chama apenas esta consulta parametrizada:
SELECT slot_inicio, slot_fim, disponivel
FROM public.get_horarios_disponiveis(
  '${selectedMedicoId}'::UUID,
  '${targetDate}'::DATE
)
ORDER BY slot_inicio ASC;`}
        </pre>
      </div>
    </div>
  );
};
