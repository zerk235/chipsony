import bridge from '@vkontakte/vk-bridge';

let userInfoCache = null;

/**
 * Сырые параметры запуска — ровно то, что VK положил в URL iframe.
 * В современных мини-приложениях VK передаёт vk_* параметры и подпись sign,
 * а не initData, поэтому берём query как есть (строка, без знака «?»).
 */
export function getLaunchQuery() {
  const raw = window.location.search;
  return raw.startsWith('?') ? raw.slice(1) : raw;
}

/** Имя и фото пользователя из VK — для красивого создания профиля по умолчанию. */
export async function getVkUserInfo() {
  if (userInfoCache) return userInfoCache;
  try {
    const response = await bridge.send('VKWebAppGetUserInfo', undefined, 1500);
    if (!response) return null;
    userInfoCache = {
      first_name: response.first_name || null,
      last_name: response.last_name || null,
      photo_200: response.photo_200 || null,
    };
    return userInfoCache;
  } catch {
    return null;
  }
}

/**
 * Диагностика, если параметры запуска не пришли. По тексту ошибки понятно,
 * что именно VK положил в URL.
 */
export async function launchDiagnostics() {
  const parts = [];
  parts.push(`url=${window.location.href}`);
  const searchQ = new URLSearchParams(window.location.search);
  parts.push(`searchKeys=${[...searchQ.keys()].join(',') || '(пусто)'}`);
  parts.push(`hash=${window.location.hash || '(пусто)'}`);
  return parts.join(' | ');
}

export function resetUserInfoCache() {
  userInfoCache = null;
}