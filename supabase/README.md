# Подключение Supabase к «Чипсонам»

Аутентификации в Supabase нет. Пользователя опознаём по подписанному `initData`
от VK: клиент отправляет его в Edge Function, функция проверяет подпись и только
после этого читает и пишет профиль от `service_role`.

Ни anon-ключ, ни service-ключ в клиент не попадают: в фронтенде есть только адрес
проекта в `VITE_SUPABASE_URL`.

## Схема файлов

| Файл | Назначение |
|---|---|
| `supabase/schema.sql` | таблицы `events`, `profiles`, `registrations`, бакет `avatars` |
| `supabase/functions/me/index.ts` | проверка initData, чтение и обновление профиля, загрузка аватара |
| `supabase/config.toml` | `verify_jwt = false` — Supabase Auth не используется |
| `src/Profile.js` | запросы к функции: `loadProfile`, `updateProfile`, `uploadAvatar` |
| `src/lib/vkUser.js` | достаёт `initData` из адреса или через мост VK |
| `src/components/ProfileStep.jsx` | экран «Мой профиль», вход из настроек |

## Развёртывание (делается руками, один раз на проект)

### 1. Создать два проекта

В <https://supabase.com/dashboard>: **dev** — общий рабочий, **prod** — отдельный
боевой. У каждого своя база, схема одинаковая.

### 2. Применить схему

В каждом проекте: **SQL Editor** → вставить содержимое `supabase/schema.sql` → Run.

### 3. Задеплоить функцию

Нужен [Supabase CLI](https://supabase.com/docs/guides/cli) и `supabase login`.

```bash
supabase link --project-ref <REF_ПРОЕКТА>
supabase secrets set VK_MINI_APP_ID=54788608 VK_MINI_APP_SECRET=<СЕКРЕТ_ПРИЛОЖЕНИЯ>
supabase functions deploy me
```

`VK_MINI_APP_SECRET` — «Секретный ключ приложения» в <https://dev.vk.com/apps/54788608>.
Это серверный секрет, в репозитории и в клиенте ему не место.

### 4. Прописать адрес проекта

В GitHub: **Settings → Secrets and variables → Actions → New repository secret**

- `VITE_SUPABASE_URL` — для `main` адрес боевого проекта;
- при желании другой `VITE_SUPABASE_URL` для `dev` нельзя задать на уровне ветки,
  поэтому деплой с тестовой базой делают вручную или отдельным workflow.

Локально для разработки: скопировать `.env.example` в `.env` и вписать адрес.

## Проверка

1. Открыть приложение в VK → Настройки → **Мой профиль**.
2. Должны подставиться имя и фото из профиля VK, изменить их и сохранить.
3. Заменить фото — файл должен лечь в бакет `avatars` и вернуться в профиле.

Если экран показывает «Ещё не подключено» — сборка сделана без `VITE_SUPABASE_URL`.
Если «подпись не совпала» — в секретах функции расходится `VK_MINI_APP_SECRET`
с секретом приложения в dev.vk.com.
