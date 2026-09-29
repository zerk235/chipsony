// Модуль личного профиля пользователя.
//
// Аутентификации в Supabase нет: пользователь опознаётся по подписанному
// initData от VK, его проверяет Edge Function supabase/functions/me.
// Поэтому здесь нет ни supabase.auth, ни anon-ключа — только HTTP-запросы
// к функции с initData внутри.
import { getInitData, initDataDiagnostics } from './lib/vkUser';

const BASE = (import.meta.env.VITE_PROFILE_ENDPOINT || '').trim()
  || (import.meta.env.VITE_SUPABASE_URL
    ? `${String(import.meta.env.VITE_SUPABASE_URL).replace(/\/+$/, '')}/functions/v1/me`
    : '');

export function isProfileConfigured() {
  return Boolean(BASE);
}

async function call(body) {
  if (!BASE) {
    throw new Error('Профиль пока не подключён: не задан VITE_SUPABASE_URL');
  }

  const initData = await getInitData();
  if (!initData) {
    throw new Error(`Не удалось получить данные запуска от VK (${initDataDiagnostics()})`);
  }

  const response = await fetch(BASE, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ initData, ...body }),
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {}

  if (!response.ok) {
    throw new Error(payload?.error || `Сервер профиля ответил ${response.status}`);
  }

  return payload?.profile ?? null;
}

/** Загружает профиль, при первом обращении создаёт его на сервере. */
export function loadProfile() {
  return call({});
}

/** Сохраняет поля профиля: display_name, phone, city. */
export function updateProfile(patch) {
  return call({ patch });
}

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const EXT_BY_TYPE = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function readAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
    reader.onload = () => {
      const result = String(reader.result || '');
      const comma = result.indexOf(',');
      resolve(comma === -1 ? result : result.slice(comma + 1));
    };
    reader.readAsDataURL(file);
  });
}

/** Загружает аватар и прикрепляет ссылку к профилю. */
export async function uploadAvatar(file) {
  if (!file) throw new Error('Файл не выбран');
  if (file.size > MAX_AVATAR_BYTES) throw new Error('Аватар не больше 2 МБ');

  const ext = EXT_BY_TYPE[file.type];
  if (!ext) throw new Error('Подойдёт только JPG, PNG или WEBP');

  const avatarBase64 = await readAsBase64(file);
  return call({ avatarBase64, avatarExt: ext });
}
