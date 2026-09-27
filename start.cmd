@echo off
chcp 65001 >nul
title Чипсоны - локальный запуск
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  Нужен Node.js. Скачай LTS с https://nodejs.org и запусти этот файл ещё раз.
  echo.
  pause
  exit /b 1
)

if not exist node_modules (
  echo  Первый запуск: ставлю зависимости, это 1-2 минуты...
  call npm install || goto fail
)

echo.
echo  Запускаю локально. Открой http://localhost:3000 в браузере.
echo  Остановить: Ctrl+C в этом окне.
echo.
call npm run dev || goto fail
exit /b 0

:fail
echo.
echo  Что-то пошло не так. Скопируй текст ошибки и скинь лиду.
pause
exit /b 1
