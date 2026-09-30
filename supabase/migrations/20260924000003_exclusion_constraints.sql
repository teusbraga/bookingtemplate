-- ============================================================
-- BOOKING TEMPLATE — MIGRATION 3/5
-- EXCLUDE USING gist — impede sobreposição de consultas (ACID)
-- ============================================================

-- Sobreposição de horário para o mesmo médico
ALTER TABLE public.marcacoes
  ADD CONSTRAINT marcacoes_sem_sobreposicao_medico
    EXCLUDE USING gist (
      medico_id WITH =,
      tstzrange(inicio, fim, '[)') WITH &&
    )
    WHERE (status != 'cancelado');

-- Sobreposição de horário para o mesmo paciente
ALTER TABLE public.marcacoes
  ADD CONSTRAINT marcacoes_sem_sobreposicao_cliente
    EXCLUDE USING gist (
      cliente_id WITH =,
      tstzrange(inicio, fim, '[)') WITH &&
    )
    WHERE (status != 'cancelado');
