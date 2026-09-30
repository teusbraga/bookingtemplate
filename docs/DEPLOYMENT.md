# 🚀 Guia de Deploy na Vercel

Este guia detalha o passo a passo para colocar o **Booking Template** em produção na **Vercel** conectado ao seu projeto **Supabase**.

---

## Opção A: Deploy Automático em 1-Clique (Recomendado)

Clique no botão abaixo para criar o repositório e o banco Supabase automaticamente:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fteusbraga%2Fbookingtemplate&env=NEXT_PUBLIC_APP_URL&integration-ids=oac_V3JyConsumersAS)

> 💡 **Como funciona:** Este botão aciona a integração oficial do Supabase na Vercel. Você poderá criar um novo projeto no Supabase ou selecionar um existente durante o fluxo, e a Vercel preencherá as chaves `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` de forma automática!

---

## Opção B: Importar Repositório Manualmente

1. Acesse o painel da [Vercel](https://vercel.com/dashboard) e clique em **Add New...** > **Project**.
2. Conecte sua conta do GitHub e selecione o repositório:
   ```
   teusbraga/bookingtemplate
   ```
3. O framework será detectado automaticamente como **Next.js**.

---

## 2. Configurar Variáveis de Ambiente no Painel Vercel

Na seção **Environment Variables** antes do deploy (ou em *Project Settings* > *Environment Variables*), adicione obrigatoriamente:

| Nome da Variável | Onde Obter no Supabase | Exemplo |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | *Project Settings* > *API* > *Project URL* | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *Project Settings* > *API* > *Project API keys* (`anon` / `public`) | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | *Project Settings* > *API* > *Project API keys* (`service_role` / `secret`) | `eyJhbGciOi...` |
| `NEXT_PUBLIC_APP_URL` | Domínio gerado pela Vercel após criar o projeto | `https://seu-app.vercel.app` |

> ⚠️ **IMPORTANTE:** A variável `SUPABASE_SERVICE_ROLE_KEY` é secreta e tem privilégios de bypass de RLS no backend. **Nunca** a exponha com o prefixo `NEXT_PUBLIC_`.

### Variáveis Opcionais (WhatsApp & Google Calendar)
Se for utilizar os webhooks da Meta ou Google Calendar:
```
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_VERIFY_TOKEN=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GEMINI_API_KEY=
```

---

## 3. Configurações de Build & Output

As configurações padrão do Next.js funcionam out-of-the-box:

* **Build Command:** `npm run build`
* **Output Directory:** `.next`
* **Install Command:** `npm install`
* **Node.js Version:** `20.x` ou `22.x`

O arquivo [`vercel.json`](../vercel.json) já está configurado na raiz com a região mais próxima (`gru1` - São Paulo/Brasil) e headers otimizados para rotas de API e Webhooks.

---

## 4. Configurar URLs de Redirecionamento no Supabase

Para que a autenticação e convites por e-mail funcionem corretamente em produção:

1. No painel do **Supabase**, acesse: **Authentication** > **URL Configuration**.
2. Em **Site URL**, preencha com a URL da Vercel:
   ```
   https://seu-app.vercel.app
   ```
3. Em **Redirect URLs**, adicione:
   ```
   https://seu-app.vercel.app/**
   http://localhost:3000/**
   ```

---

## 5. Deploy Contínuo (CI/CD)

A partir da conexão, qualquer commit ou merge na branch `main` disparará um deploy automático em produção na Vercel!
