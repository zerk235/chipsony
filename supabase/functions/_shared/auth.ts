// Проверка подлинности пользователя VK Mini Apps.
//
// Современный формат: VK кладёт в URL параметры запуска (vk_* и vk_user_id)
// и подпись sign. sign = base64url(hmac_sha256(secret, message)), где
//   message = отсортированные по алфавиту пары «ключ=значение» из query
//             (все параметры, кроме sign, в исходном URL-кодировании);
//   secret  = «Защитный ключ» приложения (VK_MINI_APP_SECRET).
//
// Legacy-формат initData (для старых контекстов) тоже поддерживается:
//   secret = md5(vk_id + vk_secret), hash = hmac_sha256(initData без hash).

import { createHash, createHmac } from 'node:crypto';

const VK_ID = Deno.env.get('VK_MINI_APP_ID') ?? '';
const VK_SECRET = Deno.env.get('VK_MINI_APP_SECRET') ?? '';
// Параметры запуска считаем валидными неделю.
const SIGN_MAX_AGE_SEC = 7 * 24 * 3600;

function hmacHex(secret, message) {
  return createHmac('sha256', secret).update(message, 'utf8').digest('hex');
}

// base64url без «=»: ровно такой формат у sign в параметрах запуска VK.
// Не используем Buffer — в Deno Edge Runtime глобального Buffer нет.
function base64url(bytes) {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Проверка подписи sign по параметрам запуска. */
function verifySign(launchQuery) {
  if (!launchQuery) return { ok: false, reason: 'нет параметров запуска' };
  if (!VK_ID || !VK_SECRET) return { ok: false, reason: 'не заданы VK_MINI_APP_ID / VK_MINI_APP_SECRET' };

  const params = new URLSearchParams(launchQuery);
  const signValue = params.get('sign');
  if (!signValue) return { ok: false, reason: 'нет параметра sign' };

  // Подпись считается по исходной строке query без параметра sign,
  // с сортировкой всех пар в алфавитном порядке.
  const pairs = launchQuery.split('&').filter(Boolean);
  const message = pairs.filter((p) => !/^sign=/i.test(p)).sort().join('&');
  const expected = base64url(createHmac('sha256', VK_SECRET).update(message, 'utf8').digest());
  if (!safeEqual(expected, signValue)) return { ok: false, reason: 'подпись не совпала' };

  const vkUserId = params.get('vk_user_id');
  if (!vkUserId) return { ok: false, reason: 'нет vk_user_id' };

  const ts = Number(params.get('vk_ts') || 0);
  if (ts && Math.abs(Date.now() / 1000 - ts) > SIGN_MAX_AGE_SEC) {
    return { ok: false, reason: 'устаревшие параметры запуска' };
  }

  return { ok: true, vkUserId: String(vkUserId), user: null, params };
}

// Ключ подписи initData по алгоритму VK: md5 от «id приложения + секрет».
function md5Hex(message) {
  return createHash('md5').update(message, 'utf8').digest('hex');
}

// Поле user в initData — base64 (иногда base64url и с %3D вместо «=»).
function decodeVkUser(raw) {
  try {
    if (!raw) return null;
    const normalized = decodeURIComponent(raw).replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

function firstName(user, params) {
  return user?.first_name || params.get('first_name') || '';
}

function lastName(user, params) {
  return user?.last_name || params.get('last_name') || '';
}

function avatar(user, params) {
  return user?.photo_200 || params.get('photo_200') || null;
}

/** Проверка старого формата initData. */
function verifyInitData(initData) {
  if (!initData) return { ok: false, reason: 'нет initData' };
  if (!VK_ID || !VK_SECRET) return { ok: false, reason: 'не заданы VK_MINI_APP_ID / VK_MINI_APP_SECRET' };

  const cut = initData.indexOf('&hash=');
  const dataCheckString = cut === -1 ? initData : initData.slice(0, cut);
  const hash = new URLSearchParams(cut === -1 ? initData : initData.slice(cut + 1)).get('hash');
  if (!hash) return { ok: false, reason: 'нет параметра hash' };

  const expected = hmacHex(md5Hex(`${VK_ID}${VK_SECRET}`), dataCheckString);
  if (expected !== hash.toLowerCase()) return { ok: false, reason: 'подпись не совпала' };

  const params = new URLSearchParams(initData);
  const user = decodeVkUser(params.get('user'));
  const vkUserId = String(user?.id ?? params.get('user_id') ?? '');
  if (!vkUserId) return { ok: false, reason: 'в initData нет user_id' };

  return { ok: true, vkUserId, user, params };
}

/**
 * Проверяет параметры запуска из тела запроса.
 * Возвращает { ok: false, reason } или { ok: true, vkUserId, user, params, ui,
 * firstName, lastName, photo }.
 */
export function verifyAuth(payload) {
  const check = payload?.launchQuery
    ? verifySign(String(payload.launchQuery))
    : verifyInitData(String(payload?.initData ?? ''));
  if (!check.ok) return { ok: false, reason: check.reason };

  const ui = payload?.userInfo && typeof payload.userInfo === 'object' ? payload.userInfo : {};
  const { vkUserId, user, params } = check;
  return {
    ok: true,
    vkUserId,
    user,
    params,
    ui,
    firstName: firstName(user, params) || ui.first_name || '',
    lastName: lastName(user, params) || ui.last_name || '',
    photo: avatar(user, params) || ui.photo_200 || null,
  };
}