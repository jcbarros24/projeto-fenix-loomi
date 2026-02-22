# Projeto Fenix Loomi

Sistema de gestão com autenticação fictícia, dashboard de KPIs, gestão de tickets, chat com IA, simulador de planos e mapa interativo de clientes.

---

## Índice

- [Stack e tecnologias](#stack-e-tecnologias)
- [Uso de IA](#uso-de-ia)
- [Estratégias de UX para API legacy](#estratégias-de-ux-para-api-legacy)
- [Arquitetura](#arquitetura)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Autenticação](#autenticação)
- [Internacionalização (i18n)](#internacionalização-i18n)
- [Funcionalidades por tela](#funcionalidades-por-tela)
- [Integração com API](#integração-com-api)
- [Como rodar o projeto](#como-rodar-o-projeto)
- [Variáveis de ambiente](#variáveis-de-ambiente)

---

## Stack e tecnologias

| Categoria | Tecnologia | Uso |
|-----------|------------|-----|
| **Framework** | Next.js 15 (App Router) | SSR, roteamento, API |
| **Linguagem** | TypeScript | Tipagem estática |
| **UI** | React 19 | Componentes |
| **Estilização** | Tailwind CSS | Utility-first CSS |
| **Estado** | Zustand | Auth store (global) |
| **Server state** | TanStack Query (React Query) | Cache e fetching (dashboard, tickets, chat) |
| **Formulários** | React Hook Form + Zod | Login, create ticket |
| **i18n** | next-intl | pt, en, es |
| **Mapa** | OpenLayers (ol) | Mapa interativo de clientes |
| **Gráficos** | ApexCharts | KPIs no dashboard |
| **Toasts** | Sonner | Feedback de ações |
| **Ícones** | Lucide React + MUI Icons | UI |
| **UI primitives** | Radix UI | Select, Dialog, Dropdown, etc. |

**Sobre Next.js 15:** O enunciado exige Next.js v12+. Optei pela v15 por ser a versão atual estável e porque o App Router permite organizar rotas públicas/privadas com route groups (`(public)` e `(authenticated)`), simplificando o fluxo de autenticação.

---

## Uso de IA

**Ferramentas:** Cursor e ChatGPT, usadas como suporte para acelerar implementação e validar decisões. O código foi compreendido e ajustado manualmente.

**Onde usei IA:**
- Estrutura de pastas e organização (index barrels, remoção de componentes não utilizados)
- Refator de autenticação (fluxo de cookies + localStorage)
- `apiFetch` e handler de 401
- i18n (estrutura de namespaces, mapCategoryLabel)
- Padrões de componentes (AuthBlocker, AuthHydrator)
- Revisão de tipos e validações Zod

**Exemplos de prompts:**
1. "Quero colocar o cookie HttpOnly e verificar ao entrar na plataforma"
2. "Prune componentes não utilizados e organize como um dev senior"
3. "Como fazemos pra pular validações do HTML e usar só Zod?"
4. "Adicione tradução para map.category.entertainment"
5. "O middleware não está rodando, os console.logs não aparecem"

**O que ajustei manualmente depois:**
- Reverti a abordagem HttpOnly porque o desafio exige explicitamente token em cookies + usuário em LocalStorage
- Corrigi o matcher do middleware (regex não disparava; mudei para matcher explícito e `src/middleware.ts`)
- Tweak de `getMapCategoryLabel` para fallback em categorias desconhecidas (evitar crash em `entertainment`)
- Decisão de usar `noValidate` no form de login para priorizar erros do Zod
- Estrutura final dos namespaces de i18n e chaves de tradução

**Decisões técnicas com justificativa:**
- **Middleware vs guards no cliente:** Middleware roda no Edge antes da página; protege todas as rotas e redireciona sem flash de conteúdo. Guards client-side (ex. AuthBlocker) complementam, mas o middleware é a linha de defesa principal.
- **React Query vs SWR:** React Query (TanStack Query) por cache por chave, invalidação explícita após create ticket e integração com mutations.
- **useDeferredValue para busca:** Em vez de debounce manual, uso `useDeferredValue` para não bloquear input enquanto filtra listas grandes (tickets, clientes).

---

## Estratégias de UX para API legacy

O briefing cita problemas típicos de API legada: listas grandes, busca lenta, ações sem feedback, necessidade de F5. Abaixo, como o front mitiga isso.

| Problema | Estratégia | Implementação |
|----------|------------|---------------|
| **Lista grande / lentidão** | Cache + stale-while-revalidate | React Query: dados em cache, `refetchOnWindowFocus: false`, `retry: 1` |
| **Busca lenta** | Debounce / deferred | `useDeferredValue(searchTerm)` nos DataTables (tickets e clientes) para não travar o input |
| **Ação sem feedback** | Optimistic UI + toasts | Após create ticket: `invalidateQueries`, toast de sucesso; em erro: toast de erro |
| **Tela vazia durante load** | Loading skeleton | `DataTableSkeleton` em tickets e clientes; `ChatSkeleton` no chat |
| **Erro silencioso** | Error states + retry | `ApiError` com mensagem amigável; 401 dispara logout; React Query faz retry automático |
| **F5 para ver mudanças** | Invalidação de cache | `queryClient.invalidateQueries({ queryKey: ['tickets'] })` após criar ticket |
| **Backend lento** | Feedback visual | `isFetching` + indicador "Atualizando dados..." nos DataTables |

**Stale-while-revalidate:** React Query, por padrão, mostra cache imediatamente e revalida em background. Isso torna a navegação mais rápida mesmo com API lenta.

---

## Arquitetura

### Visão geral

```
                    ┌─────────────────────────────────────────────┐
                    │                   Next.js App                │
                    ├─────────────────────────────────────────────┤
                    │  Middleware (rotas, auth, redirect)          │
                    ├───────────────────┬─────────────────────────┤
                    │   (public)        │      (authenticated)     │
                    │   /, /login       │  /dashboard, /tickets... │
                    ├───────────────────┼─────────────────────────┤
                    │                   │  AuthBlocker → verifica  │
                    │                   │  cookie antes de render  │
                    ├───────────────────┴─────────────────────────┤
                    │  Layout raiz: QueryProvider, AuthHydrator,   │
                    │  NextIntlClientProvider, Toaster             │
                    └─────────────────────────────────────────────┘
                                        │
                                        ▼
                    ┌─────────────────────────────────────────────┐
                    │           API Externa (NEXT_PUBLIC_API_URL)  │
                    │  /auth/login, /users, /tickets, /nortus-v1/* │
                    └─────────────────────────────────────────────┘
```

### Fluxo de autenticação

1. **Login** → POST na API externa → token em cookie + usuário em `localStorage` (ou `sessionStorage`)
2. **AuthHydrator** → na carga da app, lê cookie e storage → popula o Zustand store
3. **Middleware** → em cada request, lê cookie → redireciona `/` e `/login` para `/dashboard` se autenticado, ou para `/login` se rota protegida sem token
4. **AuthBlocker** → em rotas autenticadas, bloqueia o conteúdo até confirmar o cookie no cliente
5. **401** → handler global chama `logout()` (limpa cookie e storage, redireciona)

### Padrão de componentes

- **Atoms**: Input, Button, Label, FormError, InputMask, InputCurrency
- **Molecules**: InputField (com react-hook-form)
- **Organisms**: Sidebar, TicketsDataTable, ActiveClientsDataTable, ChatPanel, CreateTicketModal
- **UI**: componentes base (Radix) – Select, Dialog, Checkbox, Table, etc.
- **Shared**: AuthBlocker, AuthHydrator, QueryProvider

---

## Estrutura de pastas

```
src/
├── app/
│   ├── (authenticated)/          # Rotas protegidas
│   │   ├── layout.tsx            # Shell: Sidebar, header, CreateTicketModal
│   │   ├── dashboard/page.tsx
│   │   ├── tickets/page.tsx
│   │   ├── chat/page.tsx
│   │   ├── simulator/page.tsx
│   │   └── profile/page.tsx
│   ├── (public)/
│   │   ├── layout.tsx
│   │   └── login/page.tsx
│   ├── layout.tsx                # Root: providers, fonts, Toaster
│   ├── page.tsx                  # Redireciona para LoginPage
│   ├── not-found.tsx             # 404 com redirect em 5s
│   └── globals.css
├── components/
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   └── ui/
├── contexts/
│   └── SidebarContext.tsx
├── i18n/
│   ├── request.ts                # next-intl config, locale via cookie
│   └── messages/
│       ├── pt.json
│       ├── en.json
│       └── es.json
├── lib/
│   ├── cookies.ts                # getCookie, setCookie, removeCookie
│   ├── mapCategoryLabel.ts       # Tradução de categorias do mapa
│   └── utils.ts
├── services/
│   ├── api.ts                    # apiFetch, ApiError, setUnauthorizedHandler
│   └── tickets/
│       └── normalizeTickets.ts
├── shared/
│   └── components/
│       ├── auth-blocker.tsx
│       ├── auth-hydrator.tsx
│       └── query-provider.tsx
├── stores/
│   └── auth.store.ts
├── types/
│   ├── auth.ts
│   ├── chat.ts
│   ├── dashboard.ts
│   ├── map.ts
│   ├── simulator.ts
│   └── ticket.ts
└── validations/
    ├── email.ts
    ├── password.ts
    ├── signUp.ts
    └── ticket.ts

middleware.ts                     # src/middleware.ts – proteção de rotas, redirects
next.config.ts
tailwind.config.js
```

---

## Autenticação

### Requisitos (conforme desafio)

- **Token** armazenado em **cookies**
- **Dados do usuário** armazenados em **LocalStorage** (ou SessionStorage se não marcar “Lembrar de mim”)

### Implementação

| Conceito | Implementação |
|----------|---------------|
| Token | Cookie `access_token` (Path=/, SameSite=Lax). Com “Lembrar de mim”: Max-Age 30 dias. Sem: cookie de sessão. |
| Usuário | `localStorage` (remember) ou `sessionStorage` (não remember) com chave `user` |
| Persistência | `lib/cookies.ts` define `Expires` e `Max-Age` para compatibilidade |
| Hydration | `AuthHydrator` chama `hydrateSession()` no mount; lê cookie e storage e popula o store |

### Middleware

- **Arquivo:** `src/middleware.ts` (Next.js detecta automaticamente)
- **Matcher explícito:** rotas `/`, `/login`, `/dashboard/*`, `/tickets/*`, etc. (evita problemas com regex)
- Regras:
  - `/` ou `/login` com token → redirect `/dashboard`
  - Rota protegida sem token → redirect `/login?redirect=<path>`
  - Demais casos → `NextResponse.next()`

### AuthBlocker

- Usado no layout autenticado
- Exibe loading até confirmar presença do cookie no cliente
- Se não houver cookie → redirect `/login`

---

## Internacionalização (i18n)

### Configuração

- **next-intl** com plugin no `next.config.ts`
- Locale lido do cookie `NEXT_LOCALE` (`pt`, `en`, `es`)
- Mensagens carregadas em `src/i18n/request.ts`

### Namespaces

| Namespace | Uso |
|-----------|-----|
| `login` | Tela de login |
| `dashboard` | KPIs, mapa, clientes |
| `tickets` | Lista e filtros de tickets |
| `clients` | DataTable de clientes ativos |
| `simulator` | Simulador de planos |
| `chat` | Chat e sugestões da IA |
| `map` | Categorias do mapa (sports, transport, etc.) |
| `language` | Nomes dos idiomas |

### Uso nos componentes

```tsx
const t = useTranslations('tickets')
<h1>{t('listTitle')}</h1>
```

### Mapa de categorias

- `lib/mapCategoryLabel.ts` traduz categorias vindas da API
- Categorias conhecidas: sports, transport, heritage, education, tourism, health, park, food, commerce, entertainment
- Categorias desconhecidas usam a chave `map.others`

---

## Funcionalidades por tela

### Login (`/login`)

- Formulário com React Hook Form + Zod (SignUpFormSchema)
- `noValidate` no form para usar apenas validação do Zod
- Checkbox “Lembrar de mim” controla persistência (cookie + storage)
- Dropdown de idioma (PT/EN/ES)
- Redirect para `/dashboard` após sucesso

### Dashboard (`/dashboard`)

- KPIs: Retenção, Conversão, Churn, ARPU (ApexCharts)
- Mapa de clientes (OpenLayers) com marcadores por região
- DataTable de clientes ativos com filtros (status, tipo, região)
- Tradução de categorias do mapa via i18n

### Tickets (`/tickets`)

- DataTable com busca e filtros (status, prioridade, responsável)
- Botão “Novo Ticket” no header
- Modal de criação com Select de prioridade e validação (CreateTicketSchema)
- Skeleton durante loading

### Chat (`/chat`)

- Integração com API `/nortus-v1/chat`
- Painel de conversa com sugestões da IA
- Estados de loading e erro

### Simulador (`/simulator`)

- Cards de planos (Básico, Intermediário, Premium)
- Sliders para valor do veículo e idade
- Checkboxes de coberturas
- Indicadores (conversão, ROI)

### 404

- Mensagem de erro
- Countdown de 5s
- Redirect para `/dashboard` (autenticado) ou `/login` (não autenticado)

---

## Integração com API

### apiFetch (`services/api.ts`)

- Base URL: `NEXT_PUBLIC_API_URL`
- Headers: `Authorization: Bearer <token>` quando não é `skipAuth`
- Token lido de `getCookie('access_token')`
- Em 401: chama `onUnauthorized` (logout)
- Em erro: lança `ApiError` com status e dados

### Endpoints utilizados

| Endpoint | Uso |
|----------|-----|
| `POST /auth/login` | Login |
| `GET /users/:id` | Dados do usuário |
| `GET /tickets` | Lista de tickets |
| `POST /tickets` | Criar ticket |
| `GET /nortus-v1/dashboard` | KPIs do dashboard |
| `GET /map/locations` | Locais do mapa |
| `GET /nortus-v1/chat` | Chat e sugestões da IA |
| `GET /nortus-v1/simulador-planos` | Planos do simulador |

---

## Como rodar o projeto

```bash
# Instalar dependências
pnpm install

# Rodar em desenvolvimento
pnpm dev

# Build
pnpm build

# Produção
pnpm start

# Checagem de tipos
pnpm typecheck

# Lint
pnpm lint
```

---

## Variáveis de ambiente

Crie um arquivo `.env.local` na raiz:

```env
NEXT_PUBLIC_API_URL="https://sua-api.exemplo.com"
```

- Usada em `services/api.ts` para montar as URLs das chamadas.
- Em produção (ex.: Vercel), defina a variável no painel do provedor.

---

## Observações

- **localhost vs 127.0.0.1**: cookies não são compartilhados entre domínios diferentes; use sempre o mesmo.
- **Lembrar de mim**: requer cookie com `Max-Age`; `sessionStorage` é usado quando não está marcado.
- **API externa**: CORS deve permitir o domínio da aplicação; em rede local (ex.: 192.168.x.x), verifique se a API aceita essa origem.
