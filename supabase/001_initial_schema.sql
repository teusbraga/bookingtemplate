-- ==============================================================================
-- BOOKING TEMPLATE — SCHEMA INICIAL
-- Sistema de Agendamento com Supabase / PostgreSQL 15+
-- Constraint Nativa de Exclusão (btree_gist) para zero race conditions
-- ==============================================================================

-- 1. EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- ==============================================================================
-- 2. TIPOS CUSTOMIZADOS (ENUMS)
-- ==============================================================================
DO $$ BEGIN
  CREATE TYPE tipo_usuario AS ENUM ('cliente', 'medico', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE status_marcacao AS ENUM ('pendente', 'confirmado', 'cancelado', 'concluido');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE origem_marcacao AS ENUM ('site', 'whatsapp', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE direcao_mensagem AS ENUM ('entrada', 'saida');
EXCEPTION WHEN duplicate_object THEN null; END $$;

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
-- 5. TABELA: DISPONIBILIDADES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.disponibilidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medico_id UUID NOT NULL REFERENCES public.medicos(id) ON DELETE CASCADE,
  dia_semana SMALLINT NOT NULL,
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
    (pausa_inicio IS NOT NULL AND pausa_fim IS NOT NULL AND pausa_inicio < pausa_fim
     AND pausa_inicio >= hora_inicio AND pausa_fim <= hora_fim)
  )
);

CREATE INDEX IF NOT EXISTS idx_disponibilidades_medico_dia
  ON public.disponibilidades(medico_id, dia_semana)
  WHERE ativo = true;

-- ==============================================================================
-- 6. TABELA: MARCACOES — A REGRA DE OURO (zero race conditions)
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

  -- Início deve ser estritamente antes do fim
  CONSTRAINT chk_marcacao_inicio_antes_fim CHECK (inicio < fim),

  -- IMPEDE sobreposição de consultas para o mesmo médico (ACID, no-lock)
  -- Intervalo semi-aberto [): 14:00-14:30 e 14:30-15:00 NÃO colidem
  -- WHERE (status != 'cancelado'): cancelamento libera o horário imediatamente
  CONSTRAINT marcacoes_sem_sobreposicao_medico
    EXCLUDE USING gist (
      medico_id WITH =,
      tstzrange(inicio, fim, '[)') WITH &&
    )
    WHERE (status != 'cancelado'),

  -- Impede que o mesmo paciente agende duas consultas simultâneas
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
-- 7. TABELA: CONVERSAS (Máquina de estados para Bot WhatsApp)
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
-- 8. TABELA: MENSAGENS_LOG (Histórico + Idempotência WhatsApp)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.mensagens_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT NOT NULL,
  telefone TEXT NOT NULL,
  direcao direcao_mensagem NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'text',
  conteudo TEXT,
  raw_payload JSONB,
  status TEXT NOT NULL DEFAULT 'processado',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
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
  refresh_token TEXT NOT NULL,
  expira_em TIMESTAMPTZ NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  sincronizar_automaticamente BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_google_calendar_user UNIQUE (user_id)
);

-- ==============================================================================
-- 10. TRIGGER: updated_at automático
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.fn_atualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'profiles','medicos','disponibilidades','marcacoes',
    'conversas','integracoes_google_calendar'
  ]) LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%s_updated_at ON public.%s', t, t);
    EXECUTE format('CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON public.%s FOR EACH ROW EXECUTE FUNCTION public.fn_atualizar_updated_at()', t, t);
  END LOOP;
END $$;

-- ==============================================================================
-- 11. FUNÇÃO: get_horarios_disponiveis
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
  v_dia_semana := EXTRACT(DOW FROM p_data)::SMALLINT;

  SELECT duracao_padrao_minutos INTO v_duracao
  FROM public.medicos WHERE id = p_medico_id AND ativo = true;

  IF NOT FOUND THEN RETURN; END IF;

  FOR v_disp IN
    SELECT hora_inicio, hora_fim, pausa_inicio, pausa_fim
    FROM public.disponibilidades
    WHERE medico_id = p_medico_id AND dia_semana = v_dia_semana AND ativo = true
  LOOP
    v_slot_inicio := (p_data || ' ' || v_disp.hora_inicio)::TIMESTAMPTZ;

    WHILE (v_slot_inicio + (v_duracao || ' minutes')::INTERVAL) <= (p_data || ' ' || v_disp.hora_fim)::TIMESTAMPTZ LOOP
      v_slot_fim := v_slot_inicio + (v_duracao || ' minutes')::INTERVAL;

      IF v_disp.pausa_inicio IS NOT NULL AND
         NOT (v_slot_fim <= (p_data || ' ' || v_disp.pausa_inicio)::TIMESTAMPTZ OR
              v_slot_inicio >= (p_data || ' ' || v_disp.pausa_fim)::TIMESTAMPTZ) THEN
        v_slot_inicio := v_slot_inicio + (v_duracao || ' minutes')::INTERVAL;
        CONTINUE;
      END IF;

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
-- 12. ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disponibilidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marcacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integracoes_google_calendar ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT
  USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tipo = 'admin'));

CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Médicos & Disponibilidades: leitura pública
CREATE POLICY "medicos_select_public" ON public.medicos FOR SELECT USING (true);
CREATE POLICY "disponibilidades_select_public" ON public.disponibilidades FOR SELECT USING (true);

-- Marcações
CREATE POLICY "marcacoes_select" ON public.marcacoes FOR SELECT
  USING (
    cliente_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.medicos WHERE id = marcacoes.medico_id AND profile_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tipo = 'admin')
  );

CREATE POLICY "marcacoes_insert" ON public.marcacoes FOR INSERT
  WITH CHECK (cliente_id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY "marcacoes_update" ON public.marcacoes FOR UPDATE
  USING (
    cliente_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.medicos WHERE id = marcacoes.medico_id AND profile_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tipo = 'admin') OR
    auth.role() = 'service_role'
  );

-- Google Calendar: privado ao dono
CREATE POLICY "google_calendar_owner" ON public.integracoes_google_calendar FOR ALL
  USING (user_id = auth.uid());
