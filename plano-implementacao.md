# 📅 Plano de Implementação — Booking Template

> Stack: **Next.js 14 · TypeScript · Supabase · Vercel · GitHub Actions**  
> Objetivo: template público forkável para web apps de agendamento

---

## Estado Atual do Repositório ✅

O repositório local git já foi inicializado com:
- `README.md` — documentação pública do template
- `.gitignore` — ignora `node_modules`, `.env`, `.next/`, etc.
- `.env.example` — variáveis necessárias documentadas
- `supabase/migrations/001_initial_schema.sql` — schema completo com 7 tabelas + RLS
- `Plano de execução/` — app Vite/React de referência (visualizador interativo do schema)

---

## Arquitetura Alvo

```
GitHub (repo público)
  │
  ├── Vercel (deploy automático em push para main)
  │     ├── Next.js App Router (frontend + API Route Handlers)
  │     └── Variáveis de ambiente injetadas
  │
  └── Supabase
        ├── PostgreSQL 15+ (7 tabelas, btree_gist, RLS)
        ├── Auth (email/magic-link/OTP)
        └── Realtime (subscriptions opcionais)
```

---

## Melhorias Propostas ao Template Original

> Além da migração Vite → Next.js, estas melhorias tornam o template mais útil para fork:

| # | Melhoria | Justificativa |
|---|---|---|
| 1 | **`supabase/seed.sql`** | Dados de exemplo para quem fizer fork conseguir testar sem criar dados manualmente |
| 2 | **`lib/supabase/types.ts` gerado automaticamente** | `supabase gen types typescript` gera tipos TS exatos do banco — elimina erros de tipagem |
| 3 | **Middleware de auth no Next.js** | Protege rotas server-side com `@supabase/ssr` — padrão atual do Supabase para Next.js 14 |
| 4 | **`GET /api/medicos/[id]/slots`** | Wrapper da stored procedure `get_horarios_disponiveis` — chave do template |
| 5 | **UI de agendamento reutilizável** | Componente `<BookingCalendar />` agnóstico de domínio — fácil de adaptar para clínica, salão, etc. |
| 6 | **GitHub Actions para migrations** | CI aplica migrations automaticamente no Supabase ao fazer merge na `main` |
| 7 | **`CONTRIBUTING.md`** | Instruções de fork e customização para outros devs |

---

## Passos de Implementação (Lineares)

> Execute **um passo por vez**, nesta ordem exata.

---

### Passo 1 — Criar projeto Next.js na raiz ✦ `PRÓXIMO`

**O que fazer:**
```bash
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-git
```

**Resultado esperado:**
- `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`
- Pasta `src/app/` com `layout.tsx` e `page.tsx` padrão
- A pasta `Plano de execução/` permanece intacta (referência)

**Commit:** `feat: bootstrap Next.js 14 App Router`

---

### Passo 2 — Instalar e configurar Supabase SSR

**O que fazer:**
```bash
npm install @supabase/supabase-js @supabase/ssr
```

Criar os arquivos:
- `src/lib/supabase/client.ts` — cliente browser (componentes cliente)
- `src/lib/supabase/server.ts` — cliente server (Server Components, Route Handlers)
- `src/middleware.ts` — refresh automático de sessão em todas as rotas

**Resultado esperado:**
- Auth funciona em Server e Client Components sem duplicar lógica

**Commit:** `feat: configure supabase ssr client + middleware`

---

### Passo 3 — Gerar tipos TypeScript do banco

**O que fazer:**
```bash
npx supabase login
npx supabase gen types typescript \
  --project-id SEU_PROJECT_ID > src/lib/supabase/types.ts
```

**Resultado esperado:**
- `src/lib/supabase/types.ts` com tipos exatos de todas as tabelas
- `Database['public']['Tables']['marcacoes']['Row']` etc.

> [!TIP] Sempre regenerar este arquivo após adicionar ou alterar colunas no Supabase.

**Commit:** `feat: add auto-generated supabase types`

---

### Passo 4 — Criar rotas de API (Route Handlers)

**Arquivos a criar em `src/app/api/`:**

| Arquivo | Método | Descrição |
|---|---|---|
| `medicos/route.ts` | `GET` | Lista médicos ativos com especialidades |
| `medicos/[id]/slots/route.ts` | `GET` | Chama `get_horarios_disponiveis(?data=)` |
| `marcacoes/route.ts` | `POST` | Cria marcação; trata erro `23P01` → `409 Conflict` |
| `marcacoes/[id]/route.ts` | `PATCH`, `DELETE` | Atualiza status / cancela |
| `webhooks/whatsapp/route.ts` | `GET`, `POST` | Verificação + recebimento de mensagens Meta |

**Regra crítica no POST /api/marcacoes:**
```typescript
// Erro Postgres 23P01 = exclusion violation (sobreposição de horário)
if (error?.code === '23P01') {
  return NextResponse.json(
    { error: 'Horário já ocupado' },
    { status: 409 }
  );
}
```

**Commit:** `feat: add api route handlers (medicos, marcacoes, webhooks)`

---

### Passo 5 — Criar páginas de autenticação

**Arquivos a criar:**
- `src/app/(auth)/login/page.tsx` — formulário email + senha
- `src/app/(auth)/cadastro/page.tsx` — cadastro com nome e telefone
- `src/app/(auth)/confirmar/page.tsx` — página após magic link / OTP

**Lógica:**
- Após login, redirecionar por `tipo` do profile:
  - `cliente` → `/cliente`
  - `medico` → `/medico`
  - `admin` → `/admin`

**Commit:** `feat: auth pages (login, cadastro, confirm)`

---

### Passo 6 — Criar portal do cliente (agendamento)

**Arquivos a criar em `src/app/(dashboard)/cliente/`:**
- `page.tsx` — dashboard com próximas consultas
- `agendar/page.tsx` — fluxo de agendamento em 3 etapas:
  1. Escolher especialidade / médico
  2. Escolher data e slot disponível (consome `/api/medicos/[id]/slots`)
  3. Confirmar (chama `POST /api/marcacoes`)
- `historico/page.tsx` — todas as marcações passadas

**Componente reutilizável:**
- `src/components/booking/SlotPicker.tsx` — grade de horários disponíveis

**Commit:** `feat: cliente portal — booking flow + history`

---

### Passo 7 — Criar portal do médico (gestão de agenda)

**Arquivos a criar em `src/app/(dashboard)/medico/`:**
- `page.tsx` — visão semanal da agenda
- `expediente/page.tsx` — configurar horários por dia da semana
- `marcacoes/page.tsx` — aprovar/cancelar consultas pendentes

**Commit:** `feat: medico portal — schedule management`

---

### Passo 8 — Criar painel administrativo

**Arquivos a criar em `src/app/(dashboard)/admin/`:**
- `page.tsx` — overview geral (métricas simples)
- `medicos/page.tsx` — CRUD de médicos + ativar/desativar
- `marcacoes/page.tsx` — visão global de todos os agendamentos

**Commit:** `feat: admin panel`

---

### Passo 9 — Configurar deploy na Vercel

**O que fazer:**

1. Criar projeto na Vercel apontando para o repositório GitHub
2. Adicionar variáveis de ambiente no painel Vercel:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   NEXT_PUBLIC_APP_URL
   ```
3. Configurar `vercel.json` se necessário para headers de webhook

**Resultado esperado:**
- Push para `main` → deploy automático em produção
- Preview deployments em Pull Requests

**Commit:** `chore: add vercel.json + deployment docs`

---

### Passo 10 — GitHub Actions: CI + migrations automáticas

**Arquivo a criar:** `.github/workflows/ci.yml`

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:

jobs:
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run typecheck

  migrate:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    needs: typecheck
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
      - run: supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
```

**Commit:** `ci: add github actions for typecheck + migrations`

---

### Passo 11 — Seed data + CONTRIBUTING.md

**O que fazer:**
- Criar `supabase/seed.sql` com dados de exemplo (médicos, disponibilidades)
- Criar `CONTRIBUTING.md` com instruções de fork e customização
- Criar `docs/FORK_GUIDE.md` explicando como adaptar para outros domínios

**Commit:** `docs: seed data + contributing guide`

---

## Referência de Arquivos Existentes

A pasta [`Plano de execução/`](file:///c:/Users/Mateus/Desktop/Projetos/Booking%20Template/Plano%20de%20execu%C3%A7%C3%A3o) contém a app React/Vite de referência com:

| Arquivo | Uso no Next.js |
|---|---|
| [`src/types/schema.ts`](file:///c:/Users/Mateus/Desktop/Projetos/Booking%20Template/Plano%20de%20execu%C3%A7%C3%A3o/src/types/schema.ts) | Base para `src/lib/supabase/types.ts` |
| [`src/data/mockDatabase.ts`](file:///c:/Users/Mateus/Desktop/Projetos/Booking%20Template/Plano%20de%20execu%C3%A7%C3%A3o/src/data/mockDatabase.ts) | Lógica de overlap → testes unitários da API |
| [`src/data/sqlSchema.ts`](file:///c:/Users/Mateus/Desktop/Projetos/Booking%20Template/Plano%20de%20execu%C3%A7%C3%A3o/src/data/sqlSchema.ts) | `FULL_POSTGRES_SQL` já aplicado em `supabase/migrations/001` |
| [`src/components/ArchitecturePhases.tsx`](file:///c:/Users/Mateus/Desktop/Projetos/Booking%20Template/Plano%20de%20execu%C3%A7%C3%A3o/src/components/ArchitecturePhases.tsx) | Pode virar página `/docs` no template |

---

## Resumo do Progresso

| Passo | Descrição | Status |
|---|---|---|
| ✅ | Repositório git local inicializado | Feito |
| ✅ | Schema SQL em `supabase/migrations/001` | Feito |
| ✅ | `README.md`, `.gitignore`, `.env.example` | Feito |
| 1 | Bootstrap Next.js | **PRÓXIMO** |
| 2 | Supabase SSR + Middleware | Aguardando |
| 3 | Tipos TypeScript gerados | Aguardando |
| 4 | API Route Handlers | Aguardando |
| 5 | Páginas de Auth | Aguardando |
| 6 | Portal Cliente | Aguardando |
| 7 | Portal Médico | Aguardando |
| 8 | Painel Admin | Aguardando |
| 9 | Deploy Vercel | Aguardando |
| 10 | GitHub Actions CI | Aguardando |
| 11 | Seed + Docs | Aguardando |
