#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "Нужен Node.js. Скачай LTS: https://nodejs.org и запусти скрипт ещё раз."
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Первый запуск: ставлю зависимости, это 1-2 минуты..."
  npm install
fi

echo ""
echo "Запускаю локально. Открой http://localhost:3000 в браузере."
echo "Остановить: Ctrl+C"
echo ""
exec npm run dev
