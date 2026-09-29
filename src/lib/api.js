// Общий доступ к Edge Functions Supabase.
//
// Никакого anon/service-ключа: пользователь опознаётся по параметрам запуска
// VK (подпись sign), которую проверяет функция. Запрос отправляется «простым»
// POST без заголовка content-type, чтобы не возникал preflight OPTIONS.
import { getLaunchQuery, getVkUserInfo } from './vkUser';

const BASE = (import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');

export function isBackendConfigured() {
  return Boolean(BASE);
}

/**
 * POST к Edge Function.
 * @param {string} name имя функции, например 'events' или 'register'
 * @param {object} body дополнительные поля запроса
 * @returns {Promise<object>} распарсенный JSON-ответ
 */
export async function request(name, body = {}) {
  if (!BASE) {
    throw new Error('Бэкенд пока не подключён: не задан VITE_SUPABASE_URL');
  }

  const launchQuery = getLaunchQuery();
  if (!launchQuery) {
    throw new Error('Не удалось получить данные запуска от VK');
  }

  const userInfo = await getVkUserInfo();

  let response;
  try {
    response = await fetch(`${BASE}/functions/v1/${name}`, {
      method: 'POST',
      body: JSON.stringify({ launchQuery, userInfo, ...body }),
    });
  } catch (err) {
    console.error('[chipsony] fetch до функции не прошёл:', name, err);
    throw new Error('Сервер недоступен. Проверь соединение и попробуй ещё раз');
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {}

  if (!response.ok) {
    throw new Error(payload?.error || `Сервер ответил ${response.status}`);
  }

  return payload;
}