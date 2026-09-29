// Регистрация на событие. Для каждого регистра генерируется qr_token,
// по которому потом примут гостя. Свободные места считаются по сумме
// registrations.seats, финальный щит от перепродажи — триггер
// check_registration_seats в схеме.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.10';
import { bad, handleOptions, json } from '../_shared/tools.ts';
import { verifyAuth } from '../_shared/auth.ts';

const db = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const MAX_SEATS_PER_ORDER = 10;

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

  const eventId = typeof payload.eventId === 'string' ? payload.eventId.trim() : '';
  const seats = Number(payload.seats);
  if (!eventId) return bad('не указано событие');
  if (!Number.isInteger(seats) || seats < 1 || seats > MAX_SEATS_PER_ORDER) {
    return bad(`количество мест должно быть от 1 до ${MAX_SEATS_PER_ORDER}`);
  }

  const { data: event, error: eventError } = await db
    .from('events')
    .select('id, title, place, date, price, seats, emoji, gradient')
    .eq('id', eventId)
    .eq('status', 'published')
    .maybeSingle();

  if (eventError) return bad(`не удалось прочитать событие: ${eventError.message}`, 500);
  if (!event) return bad('событие не найдено или ещё не опубликовано', 404);

  const { count, error: sumError } = await db
    .from('registrations')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId);

  // точно занятых мест у нас в кэше нет — считаем по строкам: каждой строке один билет,
  // поэтому сперва возьмём сумму через запрос ниже.
  void count;
  if (sumError) return bad(`не удалось посчитать места: ${sumError.message}`, 500);

  const { data: agg, error: aggError } = await db
    .from('registrations')
    .select('event_id, seats')
    .eq('event_id', eventId);

  if (aggError) return bad(`не удалось посчитать места: ${aggError.message}`, 500);
  const taken = (agg ?? []).reduce((s, r) => s + (Number(r.seats) || 0), 0);
  if (taken + seats > Number(event.seats)) {
    return bad(`свободных мест осталось только ${Math.max(0, Number(event.seats) - taken)}`, 409);
  }

  const qrToken = crypto.randomUUID();
  const { data: registration, error: insertError } = await db
    .from('registrations')
    .insert({
      event_id: eventId,
      vk_user_id: auth.vkUserId,
      seats,
      qr_token: qrToken,
    })
    .select()
    .single();

  if (insertError) {
    if (String(insertError.message).includes('OVERSOLD')) {
      return bad('свободных мест больше нет', 409);
    }
    return bad(`не удалось зарегистрировать: ${insertError.message}`, 500);
  }

  return json({ registration, event });
});