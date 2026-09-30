# 📅 Booking Template

> **Template open-source de sistema de agendamento** com zero race conditions / zero overbooking, pronto para fork.  
> Stack: **Next.js 15+ · TypeScript · Tailwind CSS · Supabase · Vercel**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fteusbraga%2Fbookingtemplate&env=NEXT_PUBLIC_APP_URL&integration-ids=oac_V3JyConsumersAS)

---

## ✨ Features

- 🔒 **Zero Overbooking Garantido** — Constraint PostgreSQL `EXCLUDE USING gist (btree_gist + tstzrange)` impede concorrência a nível ACID no banco de dados.
- 👤 **Multi-Role & RLS** — Áreas dedicadas para Paciente (`/cliente`), Médico (`/medico`) e Administrador (`/admin`) com Row Level Security granular.
- 📅 **Slots Dinâmicos em Tempo Real** — Função `get_horarios_disponiveis` calcula horários livres e intervalos de pausa direto no PostgreSQL.
- 📱 **WhatsApp Meta Cloud API Ready** — Rotas de webhook com idempotência estrita via `UNIQUE(message_id)` e máquina de estados em `public.conversas`.
- 🚀 **Deploy One-Click na Vercel** — Configuração pronta com `vercel.json` e guia passo a passo.

---

## 🏗️ Stack

| Camada | Tecnologia |
|---|---|
| Frontend + API | Next.js 15 (App Router) + TypeScript |
| Estilização | Tailwind CSS v4 |
| Banco de dados | Supabase (PostgreSQL 15+) |
| Autenticação | Supabase Auth (SSR com cookies) |
| Deploy | Vercel |

---

## 🚀 Quick Start Local

### 1. Clonar o projeto

```bash
git clone https://github.com/teusbraga/bookingtemplate.git
cd bookingtemplate
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas chaves do Supabase.

### 3. Aplicar o Schema no Supabase

No **SQL Editor** do seu projeto no Supabase, execute o conteúdo do arquivo:
```
supabase/migrations/001_initial_schema.sql
```

### 4. Executar localmente

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## ⚡ Deploy na Vercel

Para colocar o projeto no ar em produção, siga o guia detalhado em:
📖 **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**

### Variáveis Obrigatórias no Painel da Vercel:

Adicione em **Project Settings** > **Environment Variables**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_publica
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_secreta
NEXT_PUBLIC_APP_URL=https://seu-app.vercel.app
```

---

## 📁 Estrutura do Projeto

```
bookingtemplate/
├── src/
│   ├── app/
│   │   ├── (auth)/             # Login, Cadastro e Confirmação
│   │   ├── (dashboard)/
│   │   │   ├── cliente/        # Portal do Paciente + Agendamento
│   │   │   ├── medico/         # Portal do Médico + Expediente
│   │   │   └── admin/          # Visão Geral + Auditoria de Marcações
│   │   └── api/                # Route Handlers (/api/medicos, /api/marcacoes, webhooks)
│   ├── components/             # Componentes reutilizáveis (SlotPicker, etc.)
│   └── lib/supabase/           # Clientes SSR (browser, server, admin) e tipos Database
├── supabase/migrations/        # Migração SQL com btree_gist e RLS
├── docs/                       # Documentação de deploy e arquitetura
├── vercel.json                 # Configurações de headers e região na Vercel
└── Plano de execução/          # App interativa de referência do schema
```

---

## 📄 Licença

MIT — Livre para fork, modificação e uso comercial.
