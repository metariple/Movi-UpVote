# 🎬 MoviUpVote

Топ фильмов и сериалов нашей тусовки. Логин через Google, голосуешь ▲, лучшее всплывает наверх.

Стек: Next.js (App Router) + Supabase (Postgres + Auth + RLS) + Vercel. Всё на free-тарифах.

## Запуск локально

```bash
npm install
cp .env.local.example .env.local   # впиши ключи Supabase (см. ниже)
npm run dev                         # http://localhost:3000
```

## Настройка Supabase (один раз)

1. Создай проект на https://supabase.com (free).
2. **SQL Editor** → вставь и выполни весь `supabase/seed.sql` (создаст таблицы, RLS, view).
3. **Project Settings → API** → скопируй `Project URL` и `anon public` ключ в `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Authentication → Providers → Google** → включи, вставь Client ID / Secret (из шага ниже).

## Настройка Google OAuth (один раз)

⚠️ Заложи ~15 минут — это самое муторное место.

1. https://console.cloud.google.com → новый проект.
2. **APIs & Services → OAuth consent screen** → External → заполни название/почту.
   - Пока приложение не verified, Google покажет друзьям экран «Google hasn't verified this app». В **Test users** добавь почты тусовки (лимит 100 — хватит).
3. **Credentials → Create OAuth client ID → Web application**:
   - **Authorized redirect URIs**: `https://<твой-проект>.supabase.co/auth/v1/callback`
   - (Supabase даёт точный URL на странице провайдера Google.)
4. Client ID / Secret → вставь в Supabase (шаг 4 выше).
5. В Supabase **Authentication → URL Configuration** добавь Site URL и redirect: `http://localhost:3000/**` и прод-URL Vercel.

## Деплой на Vercel

1. Запушь репозиторий на GitHub.
2. https://vercel.com → Import Project → выбери репо.
3. **Environment Variables**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `CRON_SECRET` (любая случайная строка).
4. Deploy → получишь живую ссылку. Кидай в чат тусовки.
5. Vercel Cron (`vercel.json`) раз в 2 дня дёргает `/api/ping`, чтобы Supabase не засыпал.

## После запуска

- Залогинься первым, добавь 5-10 стартовых тайтлов через форму.
- Дальше — TODOS.md (email-allowlist, TMDB-постеры, профили).

## Что где

```
supabase/seed.sql          схема + RLS + view titles_with_vote_counts
lib/supabase/{client,server}.ts   клиенты Supabase (browser / server)
middleware.ts              обновление сессии
app/page.tsx               топ-список (server component)
app/login/page.tsx         вход через Google
app/auth/callback/route.ts обмен OAuth-кода + upsert профиля
app/api/ping/route.ts      keepalive для Vercel Cron
components/VoteButton.tsx   голос ▲ (только залогиненным)
components/AddTitle.tsx     форма добавления тайтла
```
