// Приём гостя по QR-билету. Организатор (любой авторизованный пользователь)
// считывает код и отмечает регистрацию: первый вызов помечает used_at,
// повторные — возвращают того же гостя с признаком alreadyUsed.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.10';
import { bad, handleOptions, json } from '../_shared/tools.ts';
import { verifyAuth } from '../_shared/auth.ts';

const db = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  { auth: { persistSession: false, autoRefreshToken: false } },
);

// Из QR-кода вида chipsony:V1:<token> берём последний сегмент.
// Поддерживаем и голый токен (для ввода вручную).
function extractToken(raw) {
  const value = typeof raw === 'string' ? raw.trim() : '';
  if (!value) return '';
  const parts = value.split(':');
  return parts[parts.length - 1];
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

  const token = extractToken(payload.qr ?? payload.token);
  if (!token) return bad('пустой QR-код');

  const { data: ticket, error: readError } = await db
    .from('registrations')
    .select('*, events(id, title, place, date, emoji, gradient)')
    .eq('qr_token', token)
    .maybeSingle();

  if (readError) return bad(`не удалось прочитать билет: ${readError.message}`, 500);
  if (!ticket) return bad('билет не найден', 404);

  const { data: holder, error: holderError } = await db
    .from('profiles')
    .select('vk_user_id, display_name, avatar_url')
    .eq('vk_user_id', ticket.vk_user_id)
    .maybeSingle();

  if (holderError) return bad(`не удалось прочитать гостя: ${holderError.message}`, 500);

  if (ticket.used_at) {
    return json({
      ticket,
      event: ticket.events,
      holder,
      alreadyUsed: true,
      usedAt: ticket.used_at,
      scannedBy: ticket.scanned_by,
    });
  }

  const now = new Date().toISOString();
  const { data: updated, error: updateError } = await db
    .from('registrations')
    .update({ used_at: now, scanned_by: auth.vkUserId })
    .eq('id', ticket.id)
    .select('*, events(id, title, place, date, emoji, gradient)')
    .single();

  if (updateError) return bad(`не удалось отметить прибытие: ${updateError.message}`, 500);

  return json({
    ticket: updated,
    event: updated.events,
    holder,
    alreadyUsed: false,
    usedAt: now,
    scannedBy: auth.vkUserId,
  });
});