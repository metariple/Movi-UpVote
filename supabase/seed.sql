-- MoviUpVote — схема БД (v1)
-- Запускать в Supabase SQL Editor (или через supabase db push).
-- Кодирует решения eng-review: RLS на всех таблицах, один голос на юзера,
-- view для топа, профиль без триггера (создаётся client-side upsert).

-- ─────────────────────────────────────────────────────────────
-- profiles: одна строка на пользователя. Создаётся client-side
-- upsert при первом заходе (НЕ триггером на auth.users — тот футган).
-- ─────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at   timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- titles: фильм или сериал. added_by = кто добавил (видимое авторство).
-- ─────────────────────────────────────────────────────────────
create table if not exists public.titles (
  id         bigint generated always as identity primary key,
  name       text not null,
  kind       text not null default 'movie' check (kind in ('movie','series')),
  year       int,
  added_by   uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- votes: существование строки = +1 (без колонки value, даунвотов нет).
-- UNIQUE(user_id, title_id) → один голос на юзера на тайтл.
-- Ретрактируемый: снять голос = delete строки.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.votes (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  title_id   bigint not null references public.titles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, title_id)   -- защита от накрутки по одному тайтлу
);

-- ─────────────────────────────────────────────────────────────
-- View топа: агрегирует голоса одним запросом (DRY, без N+1).
-- security_invoker = RLS нижележащих таблиц уважается при чтении view.
-- Тай-брейк при равных голосах — по created_at (стабильный порядок).
-- ─────────────────────────────────────────────────────────────
create or replace view public.titles_with_vote_counts
with (security_invoker = on) as
select
  t.id,
  t.name,
  t.kind,
  t.year,
  t.added_by,
  p.display_name as added_by_name,
  t.created_at,
  count(v.user_id) as vote_count
from public.titles t
join public.profiles p on p.id = t.added_by
left join public.votes v on v.title_id = t.id
group by t.id, p.display_name
order by vote_count desc, t.created_at asc;

-- ═════════════════════════════════════════════════════════════
-- RLS — КРИТИЧЕСКИЙ must-do. Без него база открыта наружу через
-- публичный anon-ключ. Включаем на КАЖДОЙ таблице.
-- v1: аноним не читает и не пишет; залогиненный читает всё,
-- пишет только своё. (email-allowlist — v2, см. TODOS.md.)
-- ═════════════════════════════════════════════════════════════
alter table public.profiles enable row level security;
alter table public.titles   enable row level security;
alter table public.votes    enable row level security;

-- profiles: залогиненные видят всех; каждый управляет только своей строкой.
create policy "profiles readable by authenticated"
  on public.profiles for select to authenticated using (true);
create policy "user manages own profile (insert)"
  on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "user manages own profile (update)"
  on public.profiles for update to authenticated using (id = auth.uid());

-- titles: залогиненные читают все и добавляют от своего имени.
create policy "titles readable by authenticated"
  on public.titles for select to authenticated using (true);
create policy "authenticated can add titles as self"
  on public.titles for insert to authenticated with check (added_by = auth.uid());

-- votes: залогиненные видят все голоса; голосуют/снимают только свои.
create policy "votes readable by authenticated"
  on public.votes for select to authenticated using (true);
create policy "user votes as self"
  on public.votes for insert to authenticated with check (user_id = auth.uid());
create policy "user removes own vote"
  on public.votes for delete to authenticated using (user_id = auth.uid());

-- ═════════════════════════════════════════════════════════════
-- Round 2a (2026-07-10): анонимный читает топ, не голосует.
-- ВАЖНО — этот блок НЕ перезапускать вместе с остальным seed.sql
-- (политики authenticated выше уже применены на живой базе).
-- Применить отдельно через Supabase SQL Editor.
--
-- titles_with_vote_counts — security_invoker VIEW с INNER JOIN на
-- profiles. Если из трёх грантов ниже забыть хотя бы один — анон
-- тихо получит 0 строк (JOIN отфильтрует), БЕЗ ошибки. Проверять
-- анон-доступ к titles/votes/profiles по ОТДЕЛЬНОСТИ, не только
-- через сам view.
-- ═════════════════════════════════════════════════════════════
create policy "titles readable by anon"
  on public.titles for select to anon using (true);

create policy "votes readable by anon"
  on public.votes for select to anon using (true);

-- profiles: RLS-политика гейтит СТРОКИ (какие профили видны анониму),
-- а не КОЛОНКИ. Чтобы анон видел только display_name (не расширялось
-- бы само, добавь profiles новую чувствительную колонку) — колоночный
-- GRANT поверх RLS-политики, а не "урезанная" политика (RLS не умеет
-- отдавать одну колонку).
create policy "profiles readable by anon"
  on public.profiles for select to anon using (true);
revoke select on public.profiles from anon;
grant select (id, display_name) on public.profiles to anon;

-- ═════════════════════════════════════════════════════════════
-- Round 2b (2026-07-10): редактирование своих тайтлов.
-- Применить отдельно через Supabase SQL Editor (см. примечание
-- к блоку Round 2a выше — не перезапускать весь файл).
--
-- USING и WITH CHECK на одном и том же предикате — USING одно
-- гейтит, какие строки видны для UPDATE, но не то, чем они могут
-- стать в результате. Без WITH CHECK ничто не мешает через тот же
-- UPDATE переписать added_by на чужой id.
-- ═════════════════════════════════════════════════════════════
create policy "user edits own title"
  on public.titles for update to authenticated
  using (added_by = auth.uid())
  with check (added_by = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- Стартовые тайтлы засеваются после первого логина автора
-- (нужен реальный added_by = profiles.id). Пример вставки:
--   insert into public.titles (name, kind, year, added_by)
--   values ('Твин Пикс', 'series', 1990, '<твой-profile-id>');
-- ─────────────────────────────────────────────────────────────
