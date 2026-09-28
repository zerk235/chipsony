-- Схема «Чипсоны». Аутентификация — только VK ID (initData), Supabase Auth не используется.
-- Клиент не ходит в базу напрямую: все операции с профилем и регистрациями
-- идут через Edge Function (см. supabase/functions/me/index.ts), которая
-- проверяет подпись initData и работает от service_role.

-- ---------------------------------------------------------------- events
create table if not exists public.events (
  id text primary key,
  title text not null,
  place text not null,
  date text not null,
  price int not null default 0,
  emoji text not null default '🍿',
  gradient text not null default '',
  status text not null default 'published',
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;

drop policy if exists events_read on public.events;
create policy events_read on public.events for select using (true);

-- -------------------------------------------------------------- profiles
-- Ключ — vk_user_id из initData. Уникальный, чтобы у пользователя
-- не появилось двух профилей.
create table if not exists public.profiles (
  vk_user_id text primary key,
  display_name text not null default 'Гость',
  avatar_url text,
  phone text,
  city text,
  vk_first_name text,
  vk_last_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Политик на чтение/запись нет намеренно: profiles закрыта от anon-ключа,
-- доступ даёт только Edge Function, которая проверила подпись initData.

-- --------------------------------------------------------- registrations
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references public.events(id) on delete cascade,
  vk_user_id text not null,
  seats int not null default 1 check (seats > 0 and seats <= 10),
  qr_token text not null unique,
  created_at timestamptz not null default now()
);

alter table public.registrations enable row level security;

-- Как и profiles — только через Edge Function.
drop policy if exists registrations_read_own on public.registrations;
drop policy if exists registrations_insert_own on public.registrations;

create index if not exists registrations_vk_user_idx on public.registrations (vk_user_id);
create index if not exists registrations_event_idx on public.registrations (event_id);

-- -------------------------------------------------------------- storage
-- Публичный бакет для аватаров: файлы и так несекретные, а ссылку
-- нужно отдавать в клиент без подписи.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;
