-- ============================================================
-- BOOKING TEMPLATE — MIGRATION 1/5
-- Extensions e Enums
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

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
