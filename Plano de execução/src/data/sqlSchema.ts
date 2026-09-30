import { TableDefinition } from '../types/schema';

export const FULL_POSTGRES_SQL = `-- ==============================================================================
-- SISTEMA DE AGENDAMENTO MÉDICO COM SUPABASE / POSTGRESQL
-- Modelagem de Dados (Fase 0) com Constraint Nativa de Exclusão (btree_gist)
-- ==============================================================================

-- 1. EXTENSÕES NECESSÁRIAS
-- A extensão 'btree_gist' é FUNDAMENTAL: o PostgreSQL padrão não permite
-- combinar operadores de igualdade (= em UUID) com operadores de sobreposição (&& em range)
-- dentro de uma constraint EXCLUDE sem essa extensão.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- ==============================================================================
-- 2. TIPOS CUSTOMIZADOS (ENUMS)
-- ==============================================================================
DO $$ BEGIN
  CREATE TYPE tipo_usuario AS ENUM ('cliente', 'medico', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE status_marcacao AS ENUM ('pendente', 'confirmado', 'cancelado', 'concluido');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE origem_marcacao AS ENUM ('site', 'whatsapp', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE direcao_mensagem AS ENUM ('entrada', 'saida');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- 3. TABELA: PROFILES (Estende auth.users do Supabase)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT,
  tipo tipo_usuario NOT NULL DEFAULT 'cliente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_profiles_telefone UNIQUE (telefone)
);

CREATE INDEX IF NOT EXISTS idx_profiles_telefone ON public.profiles(telefone);
CREATE INDEX IF NOT EXISTS idx_profiles_tipo ON public.profiles(tipo);

-- ==============================================================================
-- 4. TABELA: MEDICOS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.medicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  crm TEXT NOT NULL,
  especialidade TEXT NOT NULL,
  duracao_padrao_minutos INTEGER NOT NULL DEFAULT 30,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_medicos_profile UNIQUE (profile_id),
  CONSTRAINT uq_medicos_crm UNIQUE (crm),
  CONSTRAINT chk_duracao_positiva CHECK (duracao_padrao_minutos >= 10 AND duracao_padrao_minutos <= 240)
);

CREATE INDEX IF NOT EXISTS idx_medicos_especialidade ON public.medicos(especialidade) WHERE ativo = true;

-- ==============================================================================
-- 5. TABELA: DISPONIBILIDADES (Regras de expediente do médico)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.disponibilidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medico_id UUID NOT NULL REFERENCES public.medicos(id) ON DELETE CASCADE,
  dia_semana SMALLINT NOT NULL, -- 0 = Domingo, 1 = Segunda, 2 = Terça, ..., 6 = Sábado
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  pausa_inicio TIME,
  pausa_fim TIME,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_dia_semana_valido CHECK (dia_semana BETWEEN 0 AND 6),
  CONSTRAINT chk_horario_expediente CHECK (hora_inicio < hora_fim),
  CONSTRAINT chk_pausa_consistente CHECK (
    (pausa_inicio IS NULL AND pausa_fim IS NULL) OR
    (pausa_inicio IS NOT NULL AND pausa_fim IS NOT NULL AND pausa_inicio < pausa_fim AND pausa_inicio >= hora_inicio AND pausa_fim <= hora_fim)
  )
);

CREATE INDEX IF NOT EXISTS idx_disponibilidades_medico_dia 
  ON public.disponibilidades(medico_id, dia_semana) 
  WHERE ativo = true;

-- ==============================================================================
-- 6. TABELA: MARCACOES (Núcleo com Constraint de Não-Sobreposição de Horários)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.marcacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  medico_id UUID NOT NULL REFERENCES public.medicos(id) ON DELETE RESTRICT,
  inicio TIMESTAMPTZ NOT NULL,
  fim TIMESTAMPTZ NOT NULL,
  status status_marcacao NOT NULL DEFAULT 'pendente',
  origem origem_marcacao NOT NULL DEFAULT 'site',
  motivo_cancelamento TEXT,
  observacoes TEXT,
  google_event_id_medico TEXT,
  google_event_id_cliente TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Regra 1: O início deve ser estritamente anterior ao fim
  CONSTRAINT chk_marcacao_inicio_antes_fim CHECK (inicio < fim),

  -- Regra 2: A REGRA DE OURO - Impedir sobreposição de consultas para o mesmo médico!
  -- [) = Intervalo semi-aberto [inicio, fim):
  -- Uma consulta das 14:00 às 14:30 NÃO conflita com uma das 14:30 às 15:00.
  -- WHERE (status != 'cancelado') garante que consultas canceladas liberam o horário imediatamente!
  CONSTRAINT marcacoes_sem_sobreposicao_medico
    EXCLUDE USING gist (
      medico_id WITH =,
      tstzrange(inicio, fim, '[)') WITH &&
    )
    WHERE (status != 'cancelado'),

  -- Regra 3 (Opcional, altamente recomendada): Impedir que o mesmo paciente marque 2 consultas simultâneas
  CONSTRAINT marcacoes_sem_sobreposicao_cliente
    EXCLUDE USING gist (
      cliente_id WITH =,
      tstzrange(inicio, fim, '[)') WITH &&
    )
    WHERE (status != 'cancelado')
);

CREATE INDEX IF NOT EXISTS idx_marcacoes_medico_data ON public.marcacoes(medico_id, inicio, fim);
CREATE INDEX IF NOT EXISTS idx_marcacoes_cliente ON public.marcacoes(cliente_id, inicio);
CREATE INDEX IF NOT EXISTS idx_marcacoes_status ON public.marcacoes(status);

-- ==============================================================================
-- 7. TABELA: CONVERSAS (Máquina de estados do Bot de WhatsApp)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.conversas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telefone TEXT NOT NULL,
  cliente_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  etapa_atual TEXT NOT NULL DEFAULT 'inicio',
  contexto_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  ultima_interacao TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_conversas_telefone UNIQUE (telefone)
);

CREATE INDEX IF NOT EXISTS idx_conversas_telefone ON public.conversas(telefone);
CREATE INDEX IF NOT EXISTS idx_conversas_ultima_interacao ON public.conversas(ultima_interacao DESC);

-- ==============================================================================
-- 8. TABELA: MENSAGENS_LOG (Histórico bruto + Idempotência do WhatsApp)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.mensagens_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT NOT NULL, -- ID original da mensagem enviado pela Meta/WhatsApp
  telefone TEXT NOT NULL,
  direcao direcao_mensagem NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'text',
  conteudo TEXT,
  raw_payload JSONB,
  status TEXT NOT NULL DEFAULT 'processado',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Idempotência: impede que re-tentativas automáticas do webhook da Meta dupliquem o processamento
  CONSTRAINT uq_mensagens_log_message_id UNIQUE (message_id)
);

CREATE INDEX IF NOT EXISTS idx_mensagens_log_telefone ON public.mensagens_log(telefone, created_at DESC);

-- ==============================================================================
-- 9. TABELA: INTEGRACOES_GOOGLE_CALENDAR
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.integracoes_google_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  calendar_id TEXT NOT NULL DEFAULT 'primary',
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL, -- Recomenda-se criptografar via Supabase Vault ou chave KMS
  expira_em TIMESTAMPTZ NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  sincronizar_automaticamente BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_google_calendar_user UNIQUE (user_id)
);

-- ==============================================================================
-- 10. FUNÇÃO E TRIGGERS PARA ATUALIZAR 'updated_at'
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.fn_atualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.fn_atualizar_updated_at();

DROP TRIGGER IF EXISTS trg_medicos_updated_at ON public.medicos;
CREATE TRIGGER trg_medicos_updated_at BEFORE UPDATE ON public.medicos FOR EACH ROW EXECUTE FUNCTION public.fn_atualizar_updated_at();

DROP TRIGGER IF EXISTS trg_disponibilidades_updated_at ON public.disponibilidades;
CREATE TRIGGER trg_disponibilidades_updated_at BEFORE UPDATE ON public.disponibilidades FOR EACH ROW EXECUTE FUNCTION public.fn_atualizar_updated_at();

DROP TRIGGER IF EXISTS trg_marcacoes_updated_at ON public.marcacoes;
CREATE TRIGGER trg_marcacoes_updated_at BEFORE UPDATE ON public.marcacoes FOR EACH ROW EXECUTE FUNCTION public.fn_atualizar_updated_at();

DROP TRIGGER IF EXISTS trg_conversas_updated_at ON public.conversas;
CREATE TRIGGER trg_conversas_updated_at BEFORE UPDATE ON public.conversas FOR EACH ROW EXECUTE FUNCTION public.fn_atualizar_updated_at();

DROP TRIGGER IF EXISTS trg_google_calendar_updated_at ON public.integracoes_google_calendar;
CREATE TRIGGER trg_google_calendar_updated_at BEFORE UPDATE ON public.integracoes_google_calendar FOR EACH ROW EXECUTE FUNCTION public.fn_atualizar_updated_at();

-- ==============================================================================
-- 11. FUNÇÃO: get_horarios_disponiveis (Gera slots livres sem conflito)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_horarios_disponiveis(
  p_medico_id UUID,
  p_data DATE
)
RETURNS TABLE (
  slot_inicio TIMESTAMPTZ,
  slot_fim TIMESTAMPTZ,
  disponivel BOOLEAN
) AS $$
DECLARE
  v_dia_semana SMALLINT;
  v_duracao INT;
  v_disp RECORD;
  v_slot_inicio TIMESTAMPTZ;
  v_slot_fim TIMESTAMPTZ;
  v_ocupado BOOLEAN;
BEGIN
  -- 0 = Domingo, 1 = Segunda, etc.
  v_dia_semana := EXTRACT(DOW FROM p_data)::SMALLINT;

  SELECT duracao_padrao_minutos INTO v_duracao
  FROM public.medicos
  WHERE id = p_medico_id AND ativo = true;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  FOR v_disp IN
    SELECT hora_inicio, hora_fim, pausa_inicio, pausa_fim
    FROM public.disponibilidades
    WHERE medico_id = p_medico_id
      AND dia_semana = v_dia_semana
      AND ativo = true
  LOOP
    v_slot_inicio := (p_data || ' ' || v_disp.hora_inicio)::TIMESTAMPTZ;

    WHILE (v_slot_inicio + (v_duracao || ' minutes')::INTERVAL) <= (p_data || ' ' || v_disp.hora_fim)::TIMESTAMPTZ LOOP
      v_slot_fim := v_slot_inicio + (v_duracao || ' minutes')::INTERVAL;

      -- Verificar se está no intervalo de pausa (almoço)
      IF v_disp.pausa_inicio IS NOT NULL AND
         NOT (v_slot_fim <= (p_data || ' ' || v_disp.pausa_inicio)::TIMESTAMPTZ OR 
              v_slot_inicio >= (p_data || ' ' || v_disp.pausa_fim)::TIMESTAMPTZ) THEN
        v_slot_inicio := v_slot_inicio + (v_duracao || ' minutes')::INTERVAL;
        CONTINUE;
      END IF;

      -- Verificar se colide com marcação ativa usando range intersection
      SELECT EXISTS (
        SELECT 1 FROM public.marcacoes m
        WHERE m.medico_id = p_medico_id
          AND m.status != 'cancelado'
          AND tstzrange(m.inicio, m.fim, '[)') && tstzrange(v_slot_inicio, v_slot_fim, '[)')
      ) INTO v_ocupado;

      slot_inicio := v_slot_inicio;
      slot_fim := v_slot_fim;
      disponivel := NOT v_ocupado;
      RETURN NEXT;

      v_slot_inicio := v_slot_fim;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql STABLE;

-- ==============================================================================
-- 12. ROW LEVEL SECURITY (RLS) - Práticas Recomendadas do Supabase
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disponibilidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marcacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integracoes_google_calendar ENABLE ROW LEVEL SECURITY;

-- Profiles: Cada usuário lê e atualiza seu próprio perfil; Admins leem todos
CREATE POLICY "Profiles são visíveis pelo próprio usuário ou admin"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tipo = 'admin'));

CREATE POLICY "Usuário pode atualizar seu próprio profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Médicos & Disponibilidades: Leitura pública para agendamento online
CREATE POLICY "Médicos visíveis publicamente"
  ON public.medicos FOR SELECT USING (true);

CREATE POLICY "Disponibilidades visíveis publicamente"
  ON public.disponibilidades FOR SELECT USING (true);

-- Marcações:
CREATE POLICY "Clientes veem apenas suas próprias consultas"
  ON public.marcacoes FOR SELECT
  USING (
    cliente_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.medicos WHERE id = marcacoes.medico_id AND profile_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tipo = 'admin')
  );

CREATE POLICY "Clientes autenticados podem solicitar agendamento"
  ON public.marcacoes FOR INSERT
  WITH CHECK (cliente_id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY "Clientes e médicos podem atualizar/cancelar suas marcações"
  ON public.marcacoes FOR UPDATE
  USING (
    cliente_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.medicos WHERE id = marcacoes.medico_id AND profile_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tipo = 'admin') OR
    auth.role() = 'service_role'
  );

-- Google Calendar: Privado ao próprio usuário
CREATE POLICY "Usuário gerencia sua própria conexão do Google Calendar"
  ON public.integracoes_google_calendar FOR ALL
  USING (user_id = auth.uid());
`;

export const TABLES_DEFINITIONS: TableDefinition[] = [
  {
    name: 'profiles',
    tag: 'Autenticação & Usuários',
    description: 'Estende auth.users do Supabase com nome, telefone formatado e tipo de papel (cliente, medico, admin).',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, description: 'Chave primária referenciando auth.users(id).' },
      { name: 'nome', type: 'TEXT', isNullable: false, description: 'Nome completo do usuário.' },
      { name: 'telefone', type: 'TEXT', isNullable: false, isUnique: true, description: 'Telefone com DDI e DDD (ex: +5511999998888).' },
      { name: 'email', type: 'TEXT', isNullable: true, description: 'E-mail do usuário.' },
      { name: 'tipo', type: 'tipo_usuario', isNullable: false, defaultValue: "'cliente'", description: 'Perfil: cliente | medico | admin.' },
      { name: 'created_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'now()', description: 'Data de criação.' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'now()', description: 'Data de última alteração.' }
    ],
    constraints: [
      { name: 'pk_profiles', type: 'CHECK', definition: 'PRIMARY KEY (id)', purpose: 'Garante unicidade vinculada ao auth do Supabase.' },
      { name: 'uq_profiles_telefone', type: 'UNIQUE', definition: 'UNIQUE (telefone)', purpose: 'Evita perfis duplicados para o mesmo número de WhatsApp.' }
    ],
    indexes: ['idx_profiles_telefone (telefone)', 'idx_profiles_tipo (tipo)'],
    rlsPolicies: [
      'SELECT: Usuário visualiza seu próprio perfil ou admin visualiza todos',
      'UPDATE: Usuário edita apenas seu próprio perfil'
    ]
  },
  {
    name: 'medicos',
    tag: 'Corpo Clínico',
    description: 'Informações profissionais dos médicos, CRM, especialidade e duração de consulta padrão.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, defaultValue: 'gen_random_uuid()', description: 'Identificador do médico.' },
      { name: 'profile_id', type: 'UUID', isForeign: true, foreignTable: 'profiles.id', isUnique: true, description: 'Perfil associado.' },
      { name: 'crm', type: 'TEXT', isNullable: false, isUnique: true, description: 'Registro no Conselho Regional de Medicina.' },
      { name: 'especialidade', type: 'TEXT', isNullable: false, description: 'Ex: Cardiologia, Dermatologia, Ortopedia.' },
      { name: 'duracao_padrao_minutos', type: 'INTEGER', isNullable: false, defaultValue: '30', description: 'Duração padrão do atendimento em minutos.' },
      { name: 'ativo', type: 'BOOLEAN', isNullable: false, defaultValue: 'true', description: 'Flag para ativar ou suspender agenda.' },
      { name: 'created_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'now()', description: 'Criação do registro.' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'now()', description: 'Última atualização.' }
    ],
    constraints: [
      { name: 'chk_duracao_positiva', type: 'CHECK', definition: 'duracao_padrao_minutos >= 10 AND duracao_padrao_minutos <= 240', purpose: 'Consulta deve durar entre 10 e 240 minutos.' }
    ],
    indexes: ['idx_medicos_especialidade (especialidade WHERE ativo = true)'],
    rlsPolicies: ['SELECT: Leitura pública para busca no site e bot', 'UPDATE: Médico dono ou admin']
  },
  {
    name: 'disponibilidades',
    tag: 'Agenda & Expediente',
    description: 'Regras de trabalho por dia da semana com horário de expediente e intervalo de almoço/pausa.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, defaultValue: 'gen_random_uuid()', description: 'ID da regra de disponibilidade.' },
      { name: 'medico_id', type: 'UUID', isForeign: true, foreignTable: 'medicos.id', isNullable: false, description: 'Médico vinculado.' },
      { name: 'dia_semana', type: 'SMALLINT', isNullable: false, description: '0 (Domingo) a 6 (Sábado).' },
      { name: 'hora_inicio', type: 'TIME', isNullable: false, description: 'Início do expediente (ex: 08:00).' },
      { name: 'hora_fim', type: 'TIME', isNullable: false, description: 'Fim do expediente (ex: 18:00).' },
      { name: 'pausa_inicio', type: 'TIME', isNullable: true, description: 'Início do almoço (ex: 12:00).' },
      { name: 'pausa_fim', type: 'TIME', isNullable: true, description: 'Fim do almoço (ex: 13:00).' },
      { name: 'ativo', type: 'BOOLEAN', isNullable: false, defaultValue: 'true', description: 'Dia da semana ativo na agenda.' },
      { name: 'created_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'now()', description: 'Data de criação.' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'now()', description: 'Data de modificação.' }
    ],
    constraints: [
      { name: 'chk_dia_semana_valido', type: 'CHECK', definition: 'dia_semana BETWEEN 0 AND 6', purpose: 'Dias válidos de domingo a sábado.' },
      { name: 'chk_horario_expediente', type: 'CHECK', definition: 'hora_inicio < hora_fim', purpose: 'Expediente deve iniciar antes de terminar.' },
      { name: 'chk_pausa_consistente', type: 'CHECK', definition: 'pausa_inicio < pausa_fim AND dentro do expediente', purpose: 'Intervalo deve estar contido no horário de trabalho.' }
    ],
    indexes: ['idx_disponibilidades_medico_dia (medico_id, dia_semana WHERE ativo = true)'],
    rlsPolicies: ['SELECT: Aberto a todos para consulta de agenda', 'ALL: Médico responsável ou admin']
  },
  {
    name: 'marcacoes',
    tag: 'Núcleo de Agendamento',
    description: 'Armazena consultas com a constraint de exclusão btree_gist tstzrange que impede atomicamente conflitos de horários.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, defaultValue: 'gen_random_uuid()', description: 'ID da consulta.' },
      { name: 'cliente_id', type: 'UUID', isForeign: true, foreignTable: 'profiles.id', isNullable: false, description: 'Paciente atendido.' },
      { name: 'medico_id', type: 'UUID', isForeign: true, foreignTable: 'medicos.id', isNullable: false, description: 'Médico responsável.' },
      { name: 'inicio', type: 'TIMESTAMPTZ', isNullable: false, description: 'Timestamp de início da consulta.' },
      { name: 'fim', type: 'TIMESTAMPTZ', isNullable: false, description: 'Timestamp de fim da consulta.' },
      { name: 'status', type: 'status_marcacao', isNullable: false, defaultValue: "'pendente'", description: 'pendente | confirmado | cancelado | concluido.' },
      { name: 'origem', type: 'origem_marcacao', isNullable: false, defaultValue: "'site'", description: 'site | whatsapp | admin.' },
      { name: 'motivo_cancelamento', type: 'TEXT', isNullable: true, description: 'Justificativa se cancelado.' },
      { name: 'observacoes', type: 'TEXT', isNullable: true, description: 'Sintomas ou notas clínicas.' },
      { name: 'google_event_id_medico', type: 'TEXT', isNullable: true, description: 'ID do evento no Google Calendar do médico.' },
      { name: 'google_event_id_cliente', type: 'TEXT', isNullable: true, description: 'ID do evento no Google Calendar do paciente.' },
      { name: 'created_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'now()', description: 'Data de criação.' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'now()', description: 'Data de alteração.' }
    ],
    constraints: [
      { name: 'chk_marcacao_inicio_antes_fim', type: 'CHECK', definition: 'inicio < fim', purpose: 'O início deve ser estritamente antes do fim.' },
      {
        name: 'marcacoes_sem_sobreposicao_medico',
        type: 'EXCLUSION',
        definition: "EXCLUDE USING gist (medico_id WITH =, tstzrange(inicio, fim, '[)') WITH &&) WHERE (status != 'cancelado')",
        purpose: 'IMPEDE colisão de horários no médico a nível de banco de dados (ACID), ignorando consultas canceladas.'
      },
      {
        name: 'marcacoes_sem_sobreposicao_cliente',
        type: 'EXCLUSION',
        definition: "EXCLUDE USING gist (cliente_id WITH =, tstzrange(inicio, fim, '[)') WITH &&) WHERE (status != 'cancelado')",
        purpose: 'Impede que o mesmo paciente agende duas consultas que colidem no mesmo horário.'
      }
    ],
    indexes: [
      'idx_marcacoes_medico_data (medico_id, inicio, fim)',
      'idx_marcacoes_cliente (cliente_id, inicio)',
      'idx_marcacoes_status (status)'
    ],
    rlsPolicies: [
      'SELECT: Paciente vê suas consultas, médico vê sua agenda, admin vê tudo',
      'INSERT: Pacientes autenticados ou service_role (API/Bot WhatsApp)',
      'UPDATE: Atualização permitida para dono, médico ou service_role'
    ]
  },
  {
    name: 'conversas',
    tag: 'Agente WhatsApp',
    description: 'Armazena a máquina de estados por número de WhatsApp, etapa atual do funil e payload de contexto.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, defaultValue: 'gen_random_uuid()', description: 'Identificador da sessão.' },
      { name: 'telefone', type: 'TEXT', isNullable: false, isUnique: true, description: 'Número de WhatsApp do paciente.' },
      { name: 'cliente_id', type: 'UUID', isForeign: true, foreignTable: 'profiles.id', isNullable: true, description: 'Vínculo com perfil se identificado.' },
      { name: 'etapa_atual', type: 'TEXT', isNullable: false, defaultValue: "'inicio'", description: 'Etapa na máquina de estados (ex: aguardando_horario).' },
      { name: 'contexto_json', type: 'JSONB', isNullable: false, defaultValue: "'{}'::jsonb", description: 'Dados coletados na conversa (médico escolhido, data temporária, etc).' },
      { name: 'ultima_interacao', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'now()', description: 'Momento da última mensagem para expiração de sessão.' },
      { name: 'created_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'now()', description: 'Data de início.' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'now()', description: 'Data de atualização.' }
    ],
    constraints: [
      { name: 'uq_conversas_telefone', type: 'UNIQUE', definition: 'UNIQUE (telefone)', purpose: 'Garante exatamente um registro de estado por número.' }
    ],
    indexes: ['idx_conversas_telefone (telefone)', 'idx_conversas_ultima_interacao (ultima_interacao DESC)'],
    rlsPolicies: ['Acesso restrito via Service Role (Webhook / Backend API)']
  },
  {
    name: 'mensagens_log',
    tag: 'Auditoria & Idempotência',
    description: 'Armazena mensagens recebidas e enviadas. UNIQUE em message_id garante idempotência nos webhooks da Meta.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, defaultValue: 'gen_random_uuid()', description: 'ID de auditoria.' },
      { name: 'message_id', type: 'TEXT', isNullable: false, isUnique: true, description: 'ID único fornecido pelo WhatsApp/Meta (idempotência).' },
      { name: 'telefone', type: 'TEXT', isNullable: false, description: 'Número do remetente/destinatário.' },
      { name: 'direcao', type: 'direcao_mensagem', isNullable: false, description: 'entrada | saida.' },
      { name: 'tipo', type: 'TEXT', isNullable: false, defaultValue: "'text'", description: 'text, interactive, audio, location.' },
      { name: 'conteudo', type: 'TEXT', isNullable: true, description: 'Texto da mensagem.' },
      { name: 'raw_payload', type: 'JSONB', isNullable: true, description: 'Payload JSON bruto para auditoria completa.' },
      { name: 'status', type: 'TEXT', isNullable: false, defaultValue: "'processado'", description: 'Status de processamento.' },
      { name: 'created_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'now()', description: 'Data/hora de recebimento.' }
    ],
    constraints: [
      { name: 'uq_mensagens_log_message_id', type: 'UNIQUE', definition: 'UNIQUE (message_id)', purpose: 'Idempotência contra retentativas do webhook.' }
    ],
    indexes: ['idx_mensagens_log_telefone (telefone, created_at DESC)'],
    rlsPolicies: ['Acesso via Service Role ou Admin']
  },
  {
    name: 'integracoes_google_calendar',
    tag: 'Sincronização Calendário',
    description: 'Credenciais OAuth2 para sincronizar consultas nos calendários do médico e do paciente.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, defaultValue: 'gen_random_uuid()', description: 'ID da integração.' },
      { name: 'user_id', type: 'UUID', isForeign: true, foreignTable: 'profiles.id', isNullable: false, isUnique: true, description: 'Usuário proprietário da credencial.' },
      { name: 'calendar_id', type: 'TEXT', isNullable: false, defaultValue: "'primary'", description: 'ID da agenda no Google Calendar.' },
      { name: 'access_token', type: 'TEXT', isNullable: false, description: 'Token de acesso temporário.' },
      { name: 'refresh_token', type: 'TEXT', isNullable: false, description: 'Token para renovação contínua (criptografado).' },
      { name: 'expira_em', type: 'TIMESTAMPTZ', isNullable: false, description: 'Timestamp de expiração do access_token.' },
      { name: 'ativo', type: 'BOOLEAN', isNullable: false, defaultValue: 'true', description: 'Se a sincronização está ligada.' },
      { name: 'sincronizar_automaticamente', type: 'BOOLEAN', isNullable: false, defaultValue: 'true', description: 'Criar eventos automaticamente em novas marcações.' },
      { name: 'created_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'now()', description: 'Criação.' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', isNullable: false, defaultValue: 'now()', description: 'Atualização.' }
    ],
    constraints: [
      { name: 'uq_google_calendar_user', type: 'UNIQUE', definition: 'UNIQUE (user_id)', purpose: 'Uma integração ativa por usuário.' }
    ],
    indexes: ['idx_google_calendar_user (user_id)'],
    rlsPolicies: ['SELECT, UPDATE, DELETE: O próprio usuário (auth.uid() = user_id)']
  }
];
