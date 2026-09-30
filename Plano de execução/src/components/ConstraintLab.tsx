import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, XCircle, AlertTriangle, Play, RefreshCw, Calendar, Clock, User, Stethoscope, Trash2 } from 'lucide-react';
import {
  INITIAL_MEDICOS,
  INITIAL_PROFILES,
  INITIAL_MARCACOES,
  DEMO_DATE,
  simulateInsertMarcacao,
  PostgresSimulationResult
} from '../data/mockDatabase';
import { MockMarcacao, BookingStatus, BookingOrigin } from '../types/schema';

export const ConstraintLab: React.FC = () => {
  const [marcacoes, setMarcacoes] = useState<MockMarcacao[]>(INITIAL_MARCACOES);
  const [selectedMedicoId, setSelectedMedicoId] = useState<string>(INITIAL_MEDICOS[0].id);
  const [selectedClienteId, setSelectedClienteId] = useState<string>(INITIAL_PROFILES[2].id);

  // Form inputs
  const [startTime, setStartTime] = useState<string>('14:15');
  const [endTime, setEndTime] = useState<string>('14:45');
  const [status, setStatus] = useState<BookingStatus>('confirmado');
  const [origem, setOrigem] = useState<BookingOrigin>('site');
  const [observacoes, setObservacoes] = useState<string>('');

  // Simulation output
  const [lastResult, setLastResult] = useState<PostgresSimulationResult | null>(null);

  const currentMedico = INITIAL_MEDICOS.find((m) => m.id === selectedMedicoId) || INITIAL_MEDICOS[0];
  const currentCliente = INITIAL_PROFILES.find((p) => p.id === selectedClienteId) || INITIAL_PROFILES[2];

  // Filter appointments for the selected doctor
  const medicoMarcacoes = marcacoes
    .filter((m) => m.medico_id === selectedMedicoId)
    .sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime());

  const handleRunInsert = (customStart?: string, customEnd?: string, customStatus?: BookingStatus, customDoctorId?: string) => {
    const sTime = customStart || startTime;
    const eTime = customEnd || endTime;
    const st = customStatus || status;
    const mId = customDoctorId || selectedMedicoId;
    const medObj = INITIAL_MEDICOS.find((m) => m.id === mId) || currentMedico;

    const startIso = `${DEMO_DATE}T${sTime}:00Z`;
    const endIso = `${DEMO_DATE}T${eTime}:00Z`;

    const result = simulateInsertMarcacao(marcacoes, {
      cliente_id: selectedClienteId,
      cliente_nome: currentCliente.nome,
      medico_id: mId,
      medico_nome: medObj.nome,
      inicio: startIso,
      fim: endIso,
      status: st,
      origem,
      observacoes: observacoes || 'Agendamento de teste no simulador'
    });

    setLastResult(result);

    if (result.success && result.bookingCreated) {
      setMarcacoes((prev) => [...prev, result.bookingCreated!]);
    }
  };

  const handleCancelBooking = (id: string) => {
    setMarcacoes((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          return {
            ...m,
            status: 'cancelado' as BookingStatus,
            observacoes: (m.observacoes || '') + ' [Cancelado pelo usuário]'
          };
        }
        return m;
      })
    );

    setLastResult({
      success: true,
      sqlCommand: `UPDATE public.marcacoes SET status = 'cancelado', updated_at = now() WHERE id = '${id}';`,
      bookingCreated: undefined
    });
  };

  const handleReset = () => {
    setMarcacoes(INITIAL_MARCACOES);
    setLastResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Introduction Card */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="h-5 w-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Laboratório Interativo de Colisão (Postgres EXCLUDE Constraint)
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Teste na prática como o PostgreSQL reage com o erro <code className="text-amber-300 font-mono">23P01 (exclusion_violation)</code>{' '}
              quando dois agendamentos competem pelo mesmo horário do médico, como o intervalo semi-aberto{' '}
              <code className="text-emerald-400 font-mono">[)</code> permite consultas consecutivas e como cancelamentos liberam o slot.
            </p>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer self-start"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Resetar Estado Inicial</span>
          </button>
        </div>
      </div>

      {/* Preset Test Scenarios */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
          <span>⚡ Cenários de Teste Rápidos (Clique para Executar)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {/* Scenario 1: Conflict Overlap */}
          <button
            onClick={() => {
              setStartTime('14:15');
              setEndTime('14:45');
              handleRunInsert('14:15', '14:45', 'confirmado');
            }}
            className="text-left p-3 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 border border-rose-800/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-rose-300">
              <span className="flex items-center space-x-1">
                <XCircle className="h-3.5 w-3.5 text-rose-400" />
                <span>1. Tentar Sobreposição Parcial</span>
              </span>
              <span className="font-mono text-[10px] bg-rose-900/60 px-1.5 py-0.5 rounded">14:15 - 14:45</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Colide com a consulta existente das 14:00 às 14:30. Deve disparar erro <strong>23P01</strong>!
            </p>
          </button>

          {/* Scenario 2: Exact Duplicate */}
          <button
            onClick={() => {
              setStartTime('14:00');
              setEndTime('14:30');
              handleRunInsert('14:00', '14:30', 'confirmado');
            }}
            className="text-left p-3 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 border border-rose-800/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-rose-300">
              <span className="flex items-center space-x-1">
                <XCircle className="h-3.5 w-3.5 text-rose-400" />
                <span>2. Tentar Horário Idêntico</span>
              </span>
              <span className="font-mono text-[10px] bg-rose-900/60 px-1.5 py-0.5 rounded">14:00 - 14:30</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Colisão total no mesmo médico. Bloqueio imediato a nível de banco de dados.
            </p>
          </button>

          {/* Scenario 3: Adjacent boundary [) */}
          <button
            onClick={() => {
              setStartTime('14:30');
              setEndTime('15:00');
              handleRunInsert('14:30', '15:00', 'confirmado');
            }}
            className="text-left p-3 rounded-xl bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-800/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
              <span className="flex items-center space-x-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>3. Horário Adjacente [14:30, 15:00)</span>
              </span>
              <span className="font-mono text-[10px] bg-emerald-900/60 px-1.5 py-0.5 rounded">14:30 - 15:00</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Sucesso! Como o intervalo é semi-aberto <code className="text-emerald-300">[)</code>, o fim da anterior não colide com o início desta.
            </p>
          </button>

          {/* Scenario 4: Booking on Cancelled slot */}
          <button
            onClick={() => {
              setStartTime('16:00');
              setEndTime('16:30');
              handleRunInsert('16:00', '16:30', 'confirmado');
            }}
            className="text-left p-3 rounded-xl bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-800/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
              <span className="flex items-center space-x-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>4. Reocupar Horário Cancelado</span>
              </span>
              <span className="font-mono text-[10px] bg-emerald-900/60 px-1.5 py-0.5 rounded">16:00 - 16:30</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Sucesso! A consulta anterior das 16:00 está 'cancelada', logo o índice parcial <code className="text-emerald-300">WHERE != 'cancelado'</code> libera o slot.
            </p>
          </button>

          {/* Scenario 5: Another Doctor */}
          <button
            onClick={() => {
              const otherDoctor = INITIAL_MEDICOS[1];
              setSelectedMedicoId(otherDoctor.id);
              setStartTime('14:00');
              setEndTime('14:30');
              handleRunInsert('14:00', '14:30', 'confirmado', otherDoctor.id);
            }}
            className="text-left p-3 rounded-xl bg-indigo-950/30 hover:bg-indigo-900/40 border border-indigo-800/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
              <span className="flex items-center space-x-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
                <span>5. Mesmo Horário, Outro Médico</span>
              </span>
              <span className="font-mono text-[10px] bg-indigo-900/60 px-1.5 py-0.5 rounded">Dra. Mariana</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Sucesso! Como <code className="text-indigo-300">medico_id WITH =</code> exige igualdade, médicos diferentes atendem simultaneamente sem conflito.
            </p>
          </button>

          {/* Scenario 6: Start >= End */}
          <button
            onClick={() => {
              setStartTime('15:00');
              setEndTime('14:00');
              handleRunInsert('15:00', '14:00', 'confirmado');
            }}
            className="text-left p-3 rounded-xl bg-amber-950/30 hover:bg-amber-900/40 border border-amber-800/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-amber-300">
              <span className="flex items-center space-x-1">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                <span>6. Início Posterior ao Fim</span>
              </span>
              <span className="font-mono text-[10px] bg-amber-900/60 px-1.5 py-0.5 rounded">15:00 → 14:00</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Dispara a <code className="text-amber-300">CHECK constraint</code> (inicio &lt; fim), rejeitando entrada inválida.
            </p>
          </button>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & SQL Console */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Play className="h-4 w-4 text-emerald-400" />
              <span>Simular Nova Marcação (INSERT)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Doctor Picker */}
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Médico(a):</label>
                <div className="relative">
                  <select
                    value={selectedMedicoId}
                    onChange={(e) => setSelectedMedicoId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs focus:border-emerald-500 focus:outline-none"
                  >
                    {INITIAL_MEDICOS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nome} ({m.especialidade})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Patient Picker */}
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Paciente:</label>
                <select
                  value={selectedClienteId}
                  onChange={(e) => setSelectedClienteId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs focus:border-emerald-500 focus:outline-none"
                >
                  {INITIAL_PROFILES.filter((p) => p.tipo === 'cliente').map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Horário Início ({DEMO_DATE}):</label>
                <input
                  type="time"
                  step="900"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>

              {/* End Time */}
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Horário Fim ({DEMO_DATE}):</label>
                <input
                  type="time"
                  step="900"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Status Inicial:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as BookingStatus)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs focus:border-emerald-500 focus:outline-none"
                >
                  <option value="confirmado">confirmado</option>
                  <option value="pendente">pendente</option>
                  <option value="cancelado">cancelado</option>
                </select>
              </div>

              {/* Origem */}
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Origem do Agendamento:</label>
                <select
                  value={origem}
                  onChange={(e) => setOrigem(e.target.value as BookingOrigin)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs focus:border-emerald-500 focus:outline-none"
                >
                  <option value="site">site (Web App)</option>
                  <option value="whatsapp">whatsapp (Bot IA)</option>
                  <option value="admin">admin (Recepção)</option>
                </select>
              </div>
            </div>

            {/* Run Button */}
            <button
              onClick={() => handleRunInsert()}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs transition-all shadow-md shadow-emerald-900/30 cursor-pointer"
            >
              <Play className="h-4 w-4" />
              <span>Executar INSERT na Tabela marcacoes</span>
            </button>
          </div>

          {/* Live PostgreSQL Execution Console */}
          <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="font-mono text-slate-300 font-semibold">PostgreSQL Execution Console</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">localhost:5432 / postgres</span>
            </div>

            <div className="p-4 font-mono text-xs space-y-3">
              {lastResult ? (
                <>
                  <div>
                    <div className="text-slate-500 text-[11px]">// Comando SQL Executado:</div>
                    <pre className="text-slate-300 bg-slate-900/80 p-2.5 rounded-lg overflow-x-auto text-[11px]">
                      {lastResult.sqlCommand}
                    </pre>
                  </div>

                  {lastResult.success ? (
                    <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 space-y-1">
                      <div className="flex items-center space-x-2 font-bold">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span>INSERT 0 1 — COMMIT REALIZADO COM SUCESSO!</span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Nenhuma constraint violada. Intervalo registrado e garantido contra conflitos futuros.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 space-y-1.5">
                      <div className="flex items-center space-x-2 font-bold text-rose-200">
                        <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                        <span>{lastResult.errorMessage}</span>
                      </div>
                      <div className="text-[11px] text-slate-300 font-mono bg-rose-950/80 p-2 rounded border border-rose-900/50">
                        DETAIL: {lastResult.errorDetail}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-amber-400 pt-1">
                        <span>SQLSTATE: {lastResult.sqlState}</span>
                        <span>CONSTRAINT: {lastResult.constraintViolated}</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-slate-500 py-6 text-center italic">
                  Aguardando comando. Clique em um dos cenários rápidos acima ou preencha o formulário para disparar um INSERT.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Visual Doctor Timeline & Existing Bookings */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-emerald-400" />
                  <span>Agenda de {currentMedico.nome}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Data: <strong className="text-white">{DEMO_DATE}</strong> (Quinta-feira) • Duração padrão:{' '}
                  {currentMedico.duracao_padrao_minutos} min
                </p>
              </div>

              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {medicoMarcacoes.length} registros
              </span>
            </div>

            {/* Visual Timeline of 14:00 to 17:00 */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">
                Visualização de Intervalos tstzrange [inicio, fim)
              </span>

              <div className="space-y-2">
                {medicoMarcacoes.map((item) => {
                  const sTime = item.inicio.slice(11, 16);
                  const eTime = item.fim.slice(11, 16);
                  const isCancelled = item.status === 'cancelado';

                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border text-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                        isCancelled
                          ? 'bg-slate-900/60 border-dashed border-slate-700 text-slate-400 opacity-75'
                          : 'bg-emerald-950/30 border-emerald-500/40 text-white'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-sm text-emerald-300">
                            [{sTime} - {eTime})
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.2 rounded-full font-bold uppercase ${
                              isCancelled
                                ? 'bg-slate-800 text-slate-400 line-through'
                                : 'bg-emerald-500/20 text-emerald-300'
                            }`}
                          >
                            {item.status}
                          </span>
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-mono">
                            {item.origem}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-slate-300 text-[11px]">
                          <User className="h-3 w-3 text-slate-400" />
                          <span>Paciente: {item.cliente_nome}</span>
                        </div>
                        {item.observacoes && (
                          <div className="text-[11px] text-slate-400 italic">"{item.observacoes}"</div>
                        )}
                      </div>

                      {/* Cancel Action */}
                      {!isCancelled && (
                        <button
                          onClick={() => handleCancelBooking(item.id)}
                          className="flex items-center space-x-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-rose-950/60 hover:bg-rose-900/70 text-rose-300 border border-rose-800/50 transition-colors cursor-pointer self-start sm:self-center"
                          title="Cancelar consulta para liberar o slot no índice parcial"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Cancelar Consulta</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Explanation card */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 space-y-1.5">
              <span className="font-semibold text-white flex items-center space-x-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>O que você está vendo:</span>
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                As consultas com status <strong className="text-emerald-400">confirmado</strong> ocupam o índice GiST do PostgreSQL.
                A consulta das <strong className="text-slate-300">16:00</strong> está com status <strong className="text-slate-300">cancelado</strong>.
                Graças à cláusula <code className="text-amber-300 font-mono">WHERE (status != 'cancelado')</code>, o PostgreSQL permite que você agende novamente
                às 16:00 sem nenhum erro!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
