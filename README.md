# Чипсоны — VK Mini App для мероприятий

Мини-приложение для VK: афиша событий, регистрация на мероприятие одним кликом
и **QR-билет с проверкой на входе** — без кассы, без лишних шагов.

> Реализовано на VK Mini Apps (VKUI) + Supabase Edge Functions.
> Демо: [vk.com/app54788608](https://vk.com/app54788608)

## Что умеет

- **Афиша** — события подгружаются из базы, доступны офлайн (кэш на устройстве) с кнопкой «Обновить».
- **Регистрация за один клик** — пользователь выбирает событие → добавляет билет → «Зарегистрироваться».
  Платёжные интеграции в MVP не подключены: регистрация бесплатна, цена события показывается в афише.
- **QR-билет** — после регистрации приложение показывает QR-код, который обновляется на
  телефоне участника и в разделе «Мои билеты».
- **Сканер для организатора** — «Настройки → Сканер QR-билетов»: камера (live) или ручной ввод кода.
  Билет отмечается в базе (`used_at`, `scanned_by`), повторный скан пишет «Уже отмечен».
- **Профиль** — имя, фото и контакты из учётной записи VK, без отдельной регистрации.
- **Защита от перепродажи** — на платных событиях лимит мест: триггер `OVERSOLD` не даёт
  занять больше, чем в `events.seats`.

## Архитектура

```
┌────────────┐   VK Telegram/iframe   ┌──────────────────┐
│  VK Mini App│ ───────────────────────▶ │  Edge Functions   │
│  React+VKUI │  POST {launchQuery,      │  /events          │
│             │   userInfo, ...}          │  /register        │
└─────┬──────┘                            │  /tickets         │
      │ vk-connect, VKID                   │  /scan            │
      └─ initData (sign) ──────────────▶ │  /me              │
                                          └────────┬─────────┘
                                                   ▼
                                   ┌────────────────────────────┐
                                   │  Supabase Postgres (postgres)│
                                   │  events / registrations     │
                                   │  RLS: только по VK sign     │
                                   └────────────────────────────┘
```

- **Аутентификация**: только по VK ID. Каждый запрос несёт `launchQuery` — VK подписывает
  параметры запуска ключом «Защитный ключ» приложения, edge-функции проверяют подпись
  (HMAC-SHA256 по отсортированным парам) через общий `_shared/auth.ts`.
- **Схема** — `supabase/schema.sql` (идентично dev/prod): триггер лимита мест,
  индексы, сидовая афиша (6 событий).
- **Деплой**: GitHub Actions — dev-версия с каждого PR, прод-версия при merge в `main`.
  Конфигурация функций (включая `verify_jwt = false`) в `supabase/config.toml`.

## Запуск локально

```bash
npm install
npm run dev          # Vite: локальный dev-сервер приложения
npm run check        # сборка + проверка (eslint + vite build)
```

Edge-функции деплоятся из каталога `supabase/`:

```bash
supabase functions deploy <name> --project-ref <prod-ref>
supabase db query --project-ref <prod-ref> --linked --file supabase/schema.sql
# <prod-ref> = foxkukzehjdbjzbdcbvn (прод), rmprmkjfcnhadhqudqix (dev)
```

Секрет подписи (тот же, что «Защитный ключ» в dev.vk.com):
`supabase secrets set VK_MINI_APP_SECRET=<value> --project-ref <ref>`

## Структура

```
src/components/        экраны: Catalog, Cart, OrderStep (регистрация),
                       SuccessStep (QR), MyTickets, ScanStep, Settings, Profile
src/lib/api.js         клиент edge-функций (sign + launchQuery)
src/data/events.js     офлайн-кэш афиши (fallback при недоступности сети)
supabase/functions/    me, events, register, tickets, scan + _shared/auth.ts
supabase/schema.sql    миграции и сид-события
QA.md                  чеклист на 3 платформы (VK Desktop / iOS / Android / m.vk.ru)
ROADMAP.md             статусы и план v2
```

## Тест на двух телефонах

1. Телефон A: открыть приложение, зарегистрироваться на событие — на экране QR-код.
2. Телефон B: «Сканер QR-билетов» → камера на телефон A → «Гость прибыл ✓».
3. Повторный скан того же кода — «Уже отмечен ранее».

## Статус

MVP собран и проверен в проде; контент-афиша, QR-приём гостей и двухустройственный сценарий
работают. Прод-версия собирается из `main` (вкладка Actions). Релизные шаги (иконка,
описание, тестовые группы) ожидают dev.vk.com.