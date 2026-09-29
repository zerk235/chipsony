// Профиль пользователя: чтение, создание при первом обращении, обновление,
// загрузка аватара. Аутентификация — только VK ID (см. _shared/auth.ts).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.10';
import { bad, handleOptions, json } from '../_shared/tools.ts';
import { verifyAuth } from '../_shared/auth.ts';

const db = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_FIELDS = ['display_name', 'phone', 'city'];

function clean(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 200);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return handleOptions();
  if (req.method !== 'POST') return bad('нужен POST', 405);

  let payload = {};
  try {
    payload = await req.json();
  } catch {
    return bad('тело запроса не JSON');
  }

  const auth = verifyAuth(payload);
  if (!auth.ok) return bad(auth.reason, 401);

  const vkUserId = auth.vkUserId;
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
    const first = auth.firstName;
    const last = auth.lastName;
    const photo = auth.photo;
    const { data: created, error: createError } = await db
      .from('profiles')
      .insert({
        vk_user_id: vkUserId,
        display_name: [first, last].filter(Boolean).join(' ') || 'Гость',
        avatar_url: photo,
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