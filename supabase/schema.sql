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

create policy events_read on public.events for select using (true);

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references public.events(id) on delete cascade,
  vk_user_id text not null,
  seats int not null default 1,
  qr_token text not null unique,
  created_at timestamptz not null default now()
);

alter table public.registrations enable row level security;

create policy registrations_read_own on public.registrations for select using (vk_user_id = auth.jwt()->>'sub');
create policy registrations_insert_own on public.registrations for insert with check (vk_user_id = auth.jwt()->>'sub');

create index if not exists registrations_vk_user_idx on public.registrations (vk_user_id);
create index if not exists registrations_event_idx on public.registrations (event_id);