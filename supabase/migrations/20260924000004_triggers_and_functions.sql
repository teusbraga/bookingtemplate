-- ============================================================
-- BOOKING TEMPLATE — MIGRATION 4/5
-- Triggers (updated_at) e RPC get_horarios_disponiveis()
-- ============================================================

-- Trigger de updated_at
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
    EXECUTE format(
      'CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON public.%s FOR EACH ROW EXECUTE FUNCTION public.fn_atualizar_updated_at()',
      t, t
    );
  END LOOP;
END $$;

-- RPC: get_horarios_disponiveis(p_medico_id, p_data)
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
