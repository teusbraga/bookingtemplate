import { MockProfile, MockMedico, MockDisponibilidade, MockMarcacao, BookingStatus, BookingOrigin } from '../types/schema';

export const INITIAL_PROFILES: MockProfile[] = [
  {
    id: 'f1a9b2c3-0001-4000-8000-000000000001',
    nome: 'Dr. Lucas Silva',
    telefone: '+5511988881111',
    email: 'lucas.silva@clinicavita.com.br',
    tipo: 'medico'
  },
  {
    id: 'f1a9b2c3-0002-4000-8000-000000000002',
    nome: 'Dra. Mariana Santos',
    telefone: '+5511988882222',
    email: 'mariana.santos@clinicavita.com.br',
    tipo: 'medico'
  },
  {
    id: 'f1a9b2c3-0003-4000-8000-000000000003',
    nome: 'Carlos Eduardo Ferreira',
    telefone: '+5511977773333',
    email: 'carlos.ferreira@gmail.com',
    tipo: 'cliente'
  },
  {
    id: 'f1a9b2c3-0004-4000-8000-000000000004',
    nome: 'Ana Beatriz Lima',
    telefone: '+5511977774444',
    email: 'ana.beatriz@gmail.com',
    tipo: 'cliente'
  },
  {
    id: 'f1a9b2c3-0005-4000-8000-000000000005',
    nome: 'Roberto Antunes (Admin)',
    telefone: '+5511966665555',
    email: 'admin@clinicavita.com.br',
    tipo: 'admin'
  }
];

export const INITIAL_MEDICOS: MockMedico[] = [
  {
    id: 'm1111111-0001-4000-8000-000000000001',
    profile_id: 'f1a9b2c3-0001-4000-8000-000000000001',
    nome: 'Dr. Lucas Silva',
    crm: 'CRM/SP 145892',
    especialidade: 'Cardiologia',
    duracao_padrao_minutos: 30,
    ativo: true
  },
  {
    id: 'm2222222-0002-4000-8000-000000000002',
    profile_id: 'f1a9b2c3-0002-4000-8000-000000000002',
    nome: 'Dra. Mariana Santos',
    crm: 'CRM/SP 198304',
    especialidade: 'Dermatologia',
    duracao_padrao_minutos: 30,
    ativo: true
  }
];

export const INITIAL_DISPONIBILIDADES: MockDisponibilidade[] = [
  // Dr. Lucas: Seg a Sex 08:00 - 18:00 (almoço 12:00 - 13:00)
  ...[1, 2, 3, 4, 5].map((dia, idx) => ({
    id: `disp-lucas-${idx}`,
    medico_id: 'm1111111-0001-4000-8000-000000000001',
    dia_semana: dia,
    hora_inicio: '08:00',
    hora_fim: '18:00',
    pausa_inicio: '12:00',
    pausa_fim: '13:00'
  })),
  // Dra. Mariana: Seg a Sex 09:00 - 17:00 (almoço 12:30 - 13:30)
  ...[1, 2, 3, 4, 5].map((dia, idx) => ({
    id: `disp-mariana-${idx}`,
    medico_id: 'm2222222-0002-4000-8000-000000000002',
    dia_semana: dia,
    hora_inicio: '09:00',
    hora_fim: '17:00',
    pausa_inicio: '12:30',
    pausa_fim: '13:30'
  }))
];

// Reference date for demo: Tomorrow / target date
export const DEMO_DATE = '2026-09-24';

export const INITIAL_MARCACOES: MockMarcacao[] = [
  {
    id: 'marc-001',
    cliente_id: 'f1a9b2c3-0003-4000-8000-000000000003',
    cliente_nome: 'Carlos Eduardo Ferreira',
    medico_id: 'm1111111-0001-4000-8000-000000000001',
    medico_nome: 'Dr. Lucas Silva',
    inicio: `${DEMO_DATE}T14:00:00Z`,
    fim: `${DEMO_DATE}T14:30:00Z`,
    status: 'confirmado',
    origem: 'whatsapp',
    observacoes: 'Check-up de rotina e eletrocardiograma',
    created_at: '2026-09-23T10:00:00Z'
  },
  {
    id: 'marc-002',
    cliente_id: 'f1a9b2c3-0004-4000-8000-000000000004',
    cliente_nome: 'Ana Beatriz Lima',
    medico_id: 'm1111111-0001-4000-8000-000000000001',
    medico_nome: 'Dr. Lucas Silva',
    inicio: `${DEMO_DATE}T15:00:00Z`,
    fim: `${DEMO_DATE}T15:30:00Z`,
    status: 'confirmado',
    origem: 'site',
    observacoes: 'Avaliação de hipertensão arterial',
    created_at: '2026-09-23T10:15:00Z'
  },
  {
    id: 'marc-003',
    cliente_id: 'f1a9b2c3-0003-4000-8000-000000000003',
    cliente_nome: 'Carlos Eduardo Ferreira',
    medico_id: 'm1111111-0001-4000-8000-000000000001',
    medico_nome: 'Dr. Lucas Silva',
    inicio: `${DEMO_DATE}T16:00:00Z`,
    fim: `${DEMO_DATE}T16:30:00Z`,
    status: 'cancelado', // cancelado não bloqueia o horário devido ao WHERE (status != 'cancelado')!
    origem: 'site',
    observacoes: 'Paciente avisou que precisou viajar a trabalho',
    created_at: '2026-09-23T08:00:00Z'
  }
];

export interface PostgresSimulationResult {
  success: boolean;
  sqlCommand: string;
  errorMessage?: string;
  errorDetail?: string;
  sqlState?: string;
  constraintViolated?: string;
  bookingCreated?: MockMarcacao;
}

/**
 * Interval overlap rule in PostgreSQL tsrange/tstzrange with '[)' (half-open):
 * Two intervals [A, B) and [C, D) overlap if and only if:
 * A < D AND B > C
 */
export function checkRangeOverlap(
  startA: string | Date,
  endA: string | Date,
  startB: string | Date,
  endB: string | Date
): boolean {
  const tA = new Date(startA).getTime();
  const tB = new Date(endA).getTime();
  const tC = new Date(startB).getTime();
  const tD = new Date(endB).getTime();

  return tA < tD && tB > tC;
}

export function simulateInsertMarcacao(
  currentMarcacoes: MockMarcacao[],
  newBooking: {
    cliente_id: string;
    cliente_nome: string;
    medico_id: string;
    medico_nome: string;
    inicio: string;
    fim: string;
    status: BookingStatus;
    origem: BookingOrigin;
    observacoes?: string;
  }
): PostgresSimulationResult {
  const sqlCommand = `INSERT INTO public.marcacoes (
  cliente_id,
  medico_id,
  inicio,
  fim,
  status,
  origem,
  observacoes
) VALUES (
  '${newBooking.cliente_id}',
  '${newBooking.medico_id}',
  '${newBooking.inicio}',
  '${newBooking.fim}',
  '${newBooking.status}',
  '${newBooking.origem}',
  '${newBooking.observacoes || ''}'
);`;

  const startMs = new Date(newBooking.inicio).getTime();
  const endMs = new Date(newBooking.fim).getTime();

  // 1. Check Constraint: chk_marcacao_inicio_antes_fim
  if (startMs >= endMs) {
    return {
      success: false,
      sqlCommand,
      sqlState: '23514 (check_violation)',
      constraintViolated: 'chk_marcacao_inicio_antes_fim',
      errorMessage: 'ERROR: new row for relation "marcacoes" violates check constraint "chk_marcacao_inicio_antes_fim"',
      errorDetail: `Failing row contains (${newBooking.medico_id}, ${newBooking.inicio}, ${newBooking.fim}). O horário de início deve ser estritamente anterior ao fim.`
    };
  }

  // If status is 'cancelado', exclusion constraint doesn't apply because of WHERE (status != 'cancelado')
  if (newBooking.status !== 'cancelado') {
    // 2. Exclusion Constraint: marcacoes_sem_sobreposicao_medico
    const doctorConflict = currentMarcacoes.find(
      (m) =>
        m.medico_id === newBooking.medico_id &&
        m.status !== 'cancelado' &&
        checkRangeOverlap(newBooking.inicio, newBooking.fim, m.inicio, m.fim)
    );

    if (doctorConflict) {
      const formattedInput = `["${newBooking.inicio.replace('T', ' ').replace('Z', '+00')}", "${newBooking.fim.replace('T', ' ').replace('Z', '+00')}")`;
      const formattedConflict = `["${doctorConflict.inicio.replace('T', ' ').replace('Z', '+00')}", "${doctorConflict.fim.replace('T', ' ').replace('Z', '+00')}")`;

      return {
        success: false,
        sqlCommand,
        sqlState: '23P01 (exclusion_violation)',
        constraintViolated: 'marcacoes_sem_sobreposicao_medico',
        errorMessage: 'ERROR: conflicting key value violates exclusion constraint "marcacoes_sem_sobreposicao_medico"',
        errorDetail: `Key (medico_id, tstzrange(inicio, fim, '[)'))=(${newBooking.medico_id}, ${formattedInput}) conflicts with existing key (medico_id, tstzrange(inicio, fim, '[)'))=(${doctorConflict.medico_id}, ${formattedConflict}).`
      };
    }

    // 3. Exclusion Constraint: marcacoes_sem_sobreposicao_cliente
    const clientConflict = currentMarcacoes.find(
      (m) =>
        m.cliente_id === newBooking.cliente_id &&
        m.status !== 'cancelado' &&
        checkRangeOverlap(newBooking.inicio, newBooking.fim, m.inicio, m.fim)
    );

    if (clientConflict) {
      return {
        success: false,
        sqlCommand,
        sqlState: '23P01 (exclusion_violation)',
        constraintViolated: 'marcacoes_sem_sobreposicao_cliente',
        errorMessage: 'ERROR: conflicting key value violates exclusion constraint "marcacoes_sem_sobreposicao_cliente"',
        errorDetail: `O paciente já possui uma consulta agendada com ${clientConflict.medico_nome} que sobrepõe este mesmo horário.`
      };
    }
  }

  // All constraints passed!
  const created: MockMarcacao = {
    id: `marc-${Date.now().toString().slice(-4)}`,
    ...newBooking,
    created_at: new Date().toISOString()
  };

  return {
    success: true,
    sqlCommand,
    bookingCreated: created
  };
}
