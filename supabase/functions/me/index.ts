// Проверка подписи initData по алгоритму VK:
//   secret = md5(vk_id + vk_secret)
//   hash   = hmac_sha256(initData без параметра hash, secret)
//
// Возвращает профиль пользователя, при первом обращении создаёт его.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.10';
import { createHash, createHmac } from 'node:crypto';

const VK_ID = Deno.env.get('VK_MINI_APP_ID') ?? '';
const VK_SECRET = Deno.env.get('VK_MINI_APP_SECRET') ?? '';

const db = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_FIELDS = ['display_name', 'phone', 'city'];

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'access-control-max-age': '86400',
    },
  });
}

function bad(message, status = 400) {
  return json({ error: message }, status);
}

function hmacHex(secret, message) {
  return createHmac('sha256', secret).update(message, 'utf8').digest('hex');
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

function verify(initData) {
  if (!initData) return { ok: false, reason: 'нет initData' };
  if (!VK_ID || !VK_SECRET) return { ok: false, reason: 'не заданы VK_MINI_APP_ID / VK_MINI_APP_SECRET' };

  // Подпись считается по исходной строке запроса без параметра hash,
  // поэтому режем строку, а не пересобираем через URLSearchParams.
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

function clean(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 200);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'access-control-allow-origin': '*',
        'access-control-allow-headers': 'content-type',
        'access-control-allow-methods': 'POST, OPTIONS',
      },
    });
  }
  if (req.method !== 'POST') return bad('нужен POST', 405);

  let payload = {};
  try {
    payload = await req.json();
  } catch {
    return bad('тело запроса не JSON');
  }

  const check = verify(String(payload.initData ?? ''));
  if (!check.ok) return bad(check.reason, 401);

  const { vkUserId, user, params } = check;
  const now = new Date().toISOString();

  const patch = {};
  for (const field of ALLOWED_FIELDS) {
    if (field in (payload.patch ?? {})) patch[field] = clean(payload.patch[field]) ?? '';
  }

  const { data: profile, error: readError } = await db
    .from('profiles')
    .select('*')
    .eq('vk_user_id', vkUserId)
    .maybeSingle();

  if (readError) return bad(`не удалось прочитать профиль: ${readError.message}`, 500);

  if (!profile) {
    const first = firstName(user, params);
    const last = lastName(user, params);
    const { data: created, error: createError } = await db
      .from('profiles')
      .insert({
        vk_user_id: vkUserId,
        display_name: [first, last].filter(Boolean).join(' ') || 'Гость',
        avatar_url: avatar(user, params),
        vk_first_name: first || null,
        vk_last_name: last || null,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (createError) return bad(`не удалось создать профиль: ${createError.message}`, 500);
    return json({ profile: created });
  }

  if (payload.avatarBase64) {
    const ext = clean(payload.avatarExt) || 'jpg';
    if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext.toLowerCase())) return bad('формат аватара не поддерживается');

    const buffer = Uint8Array.from(atob(payload.avatarBase64), (c) => c.charCodeAt(0));
    if (buffer.length > MAX_AVATAR_BYTES) return bad('аватар больше 2 МБ');

    const path = `${vkUserId}/avatar.${ext.toLowerCase()}`;
    const { error: uploadError } = await db.storage.from('avatars').upload(path, buffer, {
      upsert: true,
      contentType: `image/${ext.toLowerCase()}`,
    });
    if (uploadError) return bad(`не удалось загрузить аватар: ${uploadError.message}`, 500);

    const { data: urlData } = db.storage.from('avatars').getPublicUrl(path);
    patch.avatar_url = `${urlData.publicUrl}?t=${Date.now()}`;
  }

  if (Object.keys(patch).length === 0) return json({ profile });

  const { data: updated, error: updateError } = await db
    .from('profiles')
    .update({ ...patch, updated_at: now })
    .eq('vk_user_id', vkUserId)
    .select()
    .single();

  if (updateError) return bad(`не удалось сохранить профиль: ${updateError.message}`, 500);
  return json({ profile: updated });
});
