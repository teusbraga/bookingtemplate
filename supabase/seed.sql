-- ==============================================================================
-- seed.sql — Dados de teste para desenvolvimento local
-- Execute: supabase db seed  ou  supabase db reset
-- ==============================================================================

-- ATENÇÃO: Estas UUIDs são fictícias e não correspondem a usuários reais.
-- Para usar o seed, crie os usuários no Supabase Auth primeiro e
-- substitua as UUIDs abaixo pelos IDs reais gerados pelo auth.users.

-- Perfil do Médico 1
INSERT INTO public.profiles (id, nome, telefone, email, tipo) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Dra. Ana Oliveira', '+5511900000001', 'ana.oliveira@clinica.com', 'medico')
  ON CONFLICT (id) DO NOTHING;

-- Médico 1
INSERT INTO public.medicos (id, profile_id, crm, especialidade, duracao_padrao_minutos) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'CRM/SP 123456', 'Cardiologia', 30)
  ON CONFLICT (id) DO NOTHING;

-- Disponibilidade Médico 1 (Seg-Sex, 08:00-17:00, almoço 12:00-13:00)
INSERT INTO public.disponibilidades (medico_id, dia_semana, hora_inicio, hora_fim, pausa_inicio, pausa_fim, ativo)
SELECT '10000000-0000-0000-0000-000000000001', s, '08:00', '17:00', '12:00', '13:00', true
FROM generate_series(1, 5) AS s
ON CONFLICT DO NOTHING;

-- Perfil do Médico 2
INSERT INTO public.profiles (id, nome, telefone, email, tipo) VALUES
  ('00000000-0000-0000-0000-000000000002', 'Dr. Carlos Santos', '+5511900000002', 'carlos.santos@clinica.com', 'medico')
  ON CONFLICT (id) DO NOTHING;

-- Médico 2
INSERT INTO public.medicos (id, profile_id, crm, especialidade, duracao_padrao_minutos) VALUES
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'CRM/SP 654321', 'Clínica Geral', 20)
  ON CONFLICT (id) DO NOTHING;

-- Disponibilidade Médico 2 (Ter, Qui, Sáb, 09:00-15:00)
INSERT INTO public.disponibilidades (medico_id, dia_semana, hora_inicio, hora_fim, pausa_inicio, pausa_fim, ativo)
SELECT '10000000-0000-0000-0000-000000000002', s, '09:00', '15:00', NULL, NULL, true
FROM unnest(ARRAY[2, 4, 6]) AS s
ON CONFLICT DO NOTHING;

-- Perfil Admin
INSERT INTO public.profiles (id, nome, telefone, email, tipo) VALUES
  ('00000000-0000-0000-0000-000000000099', 'Admin Sistema', '+5511900000099', 'admin@clinica.com', 'admin')
  ON CONFLICT (id) DO NOTHING;
