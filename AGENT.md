# AGENT.md — правила работы над проектом

## Что это
VK Mini App «Чипсоны» — афиша событий, корзина, оформление.
Прототип: афиша в коде (`src/data/events.js`), оплата имитация, базы данных нет.
Цель — релиз MVP: бэкенд + регистрация с QR-билетом.

## Если ты тут впервые (5 минут)
1. Установи [Node.js LTS](https://nodejs.org) (если ещё нет)
2. Открой терминал в папке проекта
3. Windows: двойной клик по `start.cmd`. Mac/Linux: `./start.sh`
4. Открой http://localhost:3000 — приложение работает
5. Изменил файл → страница обновится сама (перезапускать ничего не нужно)

Если хочешь через терминал: `npm install` (один раз), потом `npm run dev`.

## Стек
Vite 8 + React 18 + VKUI 8 + `@vkontakte/vk-bridge`. Сборка — Vite.

## Команды
- `npm run dev` — локальный сервер http://localhost:3000
- `npm run check` — проверка сборки (обязательно перед коммитом)
- `npm run build` — собрать в `dist/`
- `npm run deploy` — залить на VK-хостинг (нужен доступ; в обычной работе не требуется, деплой сам запускает GitHub Actions)

## Публикация
- Приложение: https://vk.com/app54788608 (id 54788608) — ссылка постоянная
- Прод-хостинг меняет адрес при каждом релизе, актуальный — в dev.vk.com или в логе деплоя
- Пуш в `dev` → автодеплой **тестовой** версии (`.github/workflows/deploy-dev.yml`)
- Мерж в `main` → автодеплой **прода** (`.github/workflows/deploy.yml`)
- Ручной `npm run deploy` в работе не используем

### Если деплой в GitHub упал
Почти всегда истёк токен доступа VK: он живёт недолго и **отзывается** при каждом новом
`npm run deploy` на компьютере. Лечится обновлением секрета:
`Settings → Secrets and variables → Actions → VK_DEPLOY_TOKEN`, значение — поле `access_token`
из файла `~/.config/configstore/@vkontakte/vk-miniapps-deploy.json`.
Текст ошибки деплоя пишется в отчёт прогона (вкладка Summary) — смотри его первым делом.

## Ветки и работа вдвоём
Схема: своя ветка → PR в `dev` → проверка → мержат в `main` → прод.
```
feature/qr        твоя работа
      ↓ PR
dev               тестовая версия, можно гонять и показывать
      ↓ PR (когда проверено)
main              прод
```
1. `git checkout -b feat/что-делаю` — своя ветка от `dev`
2. Пишешь код, `npm run check` проходит
3. `git add .` → `git commit -m "что сделал"` → `git push -u origin feat/что-делаю`
4. Открываешь Pull Request в `dev` (шаблон `.github/pull_request_template.md`)
5. В `main` мержат только проверенное

## Структура
```
src/
  App.jsx                  оркестратор: состояние, шаги, переходы
  data/events.js           афиша (сейчас захардкожена, потом заменим на БД)
  lib/format.js            money, склонения, стили кнопок
  lib/storage.js           localStorage: корзина и тема
  lib/theme + useColorScheme.js  определение и применение темы
  lib/vk.js                мост VK: вибрация, снакбар
  hooks/useFlyToCart.js    анимация «улетело в корзину»
  components/              EventCard, Catalog, CartStep, OrderStep, SuccessStep, SettingsStep, CartBar, ChipFly
  styles.css               свои стили и анимации
supabase/schema.sql        черновик схемы БД (для бэкендера)
ROADMAP.md                 доска задач к релизу
vk-hosting-config.json     конфигурация деплоя
```

## Правила
- `main` защищён: работаем в ветках от `dev`, в `main` мержат только проверенное
- Перед коммитом `npm run check` должен проходить
- Задачу берём из `ROADMAP.md`, в PR пишем её номер (шаблон `.github/pull_request_template.md`)
- Не трогаем чужие файлы без нужды — так меньше конфликтов
- Деплой делает GitHub Actions сам, вручную `npm run deploy` не зовём
- Файлы `.ps1` с кириллицей хранить в UTF-8 с BOM

## Аутентификация и профиль
- Supabase Auth не используем. Пользователя опознаём по подписанному `initData` от VK.
- Проверка подписи и работа с профилем — в Edge Function `supabase/functions/me/index.ts`.
- В клиенте нет ни anon-, ни service-ключа: только `VITE_SUPABASE_URL` в `.env`.
- Таблицы `profiles` и `registrations` закрыты от anon-ключа, доступ даёт только функция.
- Подробности развёртывания и список ручных шагов — в `supabase/README.md`.
