-- ============================================================
-- BOOKING TEMPLATE — MIGRATION 5/5
-- Row Level Security (RLS) policies por perfil
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disponibilidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marcacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integracoes_google_calendar ENABLE ROW LEVEL SECURITY;

-- Profiles: dono lê e edita; admin lê todos
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT
  USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tipo = 'admin'
  ));
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Médicos e Disponibilidades: leitura pública
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

-- Conversas e Logs: admin e service_role
CREATE POLICY "conversas_admin" ON public.conversas FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tipo = 'admin') OR
    auth.role() = 'service_role'
  );
CREATE POLICY "mensagens_log_admin" ON public.mensagens_log FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tipo = 'admin') OR
    auth.role() = 'service_role'
  );
