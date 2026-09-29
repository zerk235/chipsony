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
  seats int not null default 100 check (seats >= 0),
  emoji text not null default '🍿',
  gradient text not null default '',
  description text not null default '',
  bring text not null default '',
  how_to_get text not null default '',
  status text not null default 'published',
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;

-- Для баз, где таблица уже создана без этих колонок.
alter table public.events add column if not exists seats int not null default 100 check (seats >= 0);
alter table public.events add column if not exists description text not null default '';
alter table public.events add column if not exists bring text not null default '';
alter table public.events add column if not exists how_to_get text not null default '';

-- Афиша публичная: любому читателю отдаются опубликованные события.
drop policy if exists events_read on public.events;
create policy events_read on public.events for select using (status = 'published');

-- Стартовые события для каталога (id совпадают с прошлыми прототипными,
-- чтобы ранние регистрации остались валидными).
insert into public.events (id, title, place, date, price, seats, emoji, gradient, description, bring, how_to_get)
values
  ('hack', 'Хакатон MAX 2026 — финал', 'VK, Ходынский бульвар 17А', '10 октября, 09:00', 0, 300, '🍿', 'linear-gradient(120deg,#FFB800 0%,#FF6B00 55%,#2C2C2C 55%)', 'Два дня кода, сон на подушках и финал на большой сцене: команды защищают прототипы перед жюри VK. Все участники получают мерч и доступ в закрытый чат с менторами.', 'ноутбук, зарядка, паспорт', 'Метро «Белорусская», пешком 7 минут. Вход по билету на регистрации с 08:30.'),
  ('picket', 'Фест «Чипсоны»: музыка и стендап', 'Парк Горького, летняя сцена', '18 октября, 14:00', 990, 500, '🎤', 'linear-gradient(120deg,#8B9BFF 0%,#5B5BFF 55%,#1F1F2E 55%)', 'Фестиваль уличной музыки и стендапа в Парке Горького: живой звук, локальные артисты и много-много чипсонов.', 'плед, друзья', 'Метро «Октябрьская», главный вход парка, летняя сцена у пруда.'),
  ('workshop', 'Воркшоп «Собираем прототип за вечер»', 'VK, коворкинг, 5 этаж', '24 октября, 18:00', 0, 40, '💡', 'linear-gradient(120deg,#7BE495 0%,#2FA85C 55%,#0F2E1C 55%)', 'За один вечер соберёте рабочий прототип Mini App: от идеи до запуска во VK. Разборы, шаблоны и опытные менторы рядом.', 'ноутбук с зарядкой', 'VK, коворкинг 5 этаж: пропуск по билету у стойки рецепции.'),
  ('night', 'Ночная экскурсия по офису VK', 'Ленинградский проспект, 39', '30 октября, 23:00', 790, 30, '🌙', 'linear-gradient(120deg,#3EAAFF 0%,#234B9B 55%,#101426 55%)', 'Когда офис пустеет — начинается магия: светящиеся локации, выход на смотровую и истории ВКонтакте из первых уст.', 'удобная обувь', 'Ленинградский проспект 39, корпус А: сбор в 22:40 у главного входа.'),
  ('demo', 'Демо-день: что построили команды', 'VK, конференц-зал', '7 ноября, 12:00', 0, 150, '🚀', 'linear-gradient(120deg,#F2709C 0%,#FF9472 50%,#11122E 50%)', 'Презентации команд после двух месяцев разработки: о чём мечтают, что собрали и как сэкономят время пользователям. Голосование зрителей влияет на приз.', 'телефон для голосования', 'VK, конференц-зал 4 этаж. Вход по билету, регистрация с 11:30.'),
  ('meetup', 'Митап «VK Mini Apps» для разработчиков', 'VK, амфитеатр', '14 ноября, 19:00', 0, 200, '⚡', 'linear-gradient(120deg,#9B7BFF 0%,#5B3BFF 55%,#171227 55%)', 'Для разработчиков и дизайнеров: лайфхаки платформы, разбор реальных кейсов из каталога и open Q&A с техлидами.', 'только ваш аккаунт VK', 'VK, амфитеатр 1 этаж. Онлайн-трансляция по ссылке в чате события.')
on conflict (id) do update set
  title = excluded.title,
  place = excluded.place,
  date = excluded.date,
  price = excluded.price,
  seats = excluded.seats,
  emoji = excluded.emoji,
  gradient = excluded.gradient,
  description = excluded.description,
  bring = excluded.bring,
  how_to_get = excluded.how_to_get,
  status = 'published';

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
  used_at timestamptz,
  scanned_by text,
  created_at timestamptz not null default now()
);

-- Для баз, где таблица уже создана без полей отметки входа.
alter table public.registrations add column if not exists used_at timestamptz;
alter table public.registrations add column if not exists scanned_by text;

alter table public.registrations enable row level security;

-- Как и profiles — только через Edge Function.
drop policy if exists registrations_read_own on public.registrations;
drop policy if exists registrations_insert_own on public.registrations;

create index if not exists registrations_vk_user_idx on public.registrations (vk_user_id);
create index if not exists registrations_event_idx on public.registrations (event_id);

-- ---------------------------------------------------- oversell (защита)
-- Финальный щит от перепродажи на уровне базы: сумма мест по всем
-- регистрациям события не должна превысить events.seats. Триггер даёт
-- ОДНУ гарантию даже при гонке двух одновременных запросов (операция
-- атомарна). Сообщение начинается с OVERSOLD — его ловит функция register.
create or replace function public.check_registration_seats()
returns trigger
language plpgsql
as $$
declare
  _seats int;
  _taken int;
  _room int;
begin
  if tg_op = 'UPDATE' and new.event_id = old.event_id and new.seats = old.seats then
    return new;
  end if;

  select seats into _seats from public.events where id = new.event_id;
  if _seats is null then
    raise exception 'нет события %', new.event_id;
  end if;

  select coalesce(sum(seats), 0) into _taken
  from public.registrations
  where event_id = new.event_id
    and id is distinct from new.id;

  _room := _seats - _taken;
  if new.seats > _room then
    raise exception 'OVERSOLD: событие %, запрошено %, свободно %', new.event_id, new.seats, _room;
  end if;

  return new;
end
$$;

drop trigger if exists registrations_check_seats on public.registrations;
create trigger registrations_check_seats
  before insert or update of seats, event_id on public.registrations
  for each row execute function public.check_registration_seats();

-- -------------------------------------------------------------- storage
-- Публичный бакет для аватаров: файлы и так несекретные, а ссылку
-- нужно отдавать в клиент без подписи.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;
