# 📅 Booking Template

> **Template open-source de sistema de agendamento** com zero race conditions, pronto para fork.  
> Stack: **Next.js 14 · TypeScript · Supabase · Vercel**

---

## ✨ Features

- 🔒 **Zero overbooking** — constraint `EXCLUDE USING gist (btree_gist + tstzrange)` no Postgres garante atomicidade ACID
- 👤 **Multi-role** — cliente, médico e admin com RLS granular no Supabase
- 📅 **Slots dinâmicos** — função `get_horarios_disponiveis` calcula horários livres direto no banco
- 📱 **WhatsApp-ready** — tabelas `conversas` e `mensagens_log` para bot com idempotência por `message_id`
- 🗓️ **Google Calendar** — sync assíncrono via OAuth2 com renovação automática de token
- 🚀 **Deploy one-click** — Vercel + Supabase + GitHub Actions

---

## 🏗️ Stack

| Camada | Tecnologia |
|---|---|
| Frontend + API | Next.js 14 (App Router) + TypeScript |
| Banco de dados | Supabase (PostgreSQL 15+) |
| Auth | Supabase Auth (email/OTP) |
| Deploy | Vercel |
| CI/CD | GitHub Actions |

---

## 🚀 Quick Start

### Pré-requisitos

- Node.js 18+
- Conta Supabase (gratuita)
- Conta Vercel (gratuita)

### 1. Fork e clone

```bash
git clone https://github.com/SEU_USER/booking-template.git
cd booking-template
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais Supabase.

### 3. Aplicar schema no Supabase

No **SQL Editor** do Supabase, execute o arquivo:

```
supabase/migrations/001_initial_schema.sql
```

### 4. Rodar localmente

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

---

## 📁 Estrutura

```
booking-template/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Páginas de login/cadastro
│   ├── (dashboard)/        # Área autenticada
│   │   ├── cliente/        # Portal do paciente
│   │   ├── medico/         # Portal do médico
│   │   └── admin/          # Painel administrativo
│   └── api/                # Route Handlers (API)
│       ├── marcacoes/      # CRUD de agendamentos
│       ├── medicos/        # Listagem e horários
│       └── webhooks/       # WhatsApp Meta API
├── components/             # Componentes React compartilhados
├── lib/                    # Supabase client, utils, types
├── supabase/
│   └── migrations/         # SQL do schema completo
└── Plano de execução/      # App interativa de referência (Vite/React)
```

---

## 🗺️ Roadmap

- [x] **Fase 0** — Schema Supabase com constraints btree_gist
- [ ] **Fase 1** — API Next.js (Route Handlers)
- [ ] **Fase 2** — Frontend (Portal Cliente + Médico)
- [ ] **Fase 3** — Bot WhatsApp (Meta Cloud API + LLM)
- [ ] **Fase 4** — Sync Google Calendar

---

## 📄 Licença

MIT — Fork à vontade!
