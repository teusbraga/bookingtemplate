-- ============================================================
-- BOOKING TEMPLATE — MIGRATION 2/5
-- Criação das 7 tabelas normalizadas
-- ============================================================

-- profiles
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

-- medicos
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

-- disponibilidades
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

-- marcacoes
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
  CONSTRAINT chk_marcacao_inicio_antes_fim CHECK (inicio < fim)
);
CREATE INDEX IF NOT EXISTS idx_marcacoes_medico_data ON public.marcacoes(medico_id, inicio, fim);
CREATE INDEX IF NOT EXISTS idx_marcacoes_cliente ON public.marcacoes(cliente_id, inicio);
CREATE INDEX IF NOT EXISTS idx_marcacoes_status ON public.marcacoes(status);

-- conversas
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

-- mensagens_log
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

-- integracoes_google_calendar
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
