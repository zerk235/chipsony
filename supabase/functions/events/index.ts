// Афиша событий из БД. Статус «черновик» не отдаём.
// Возвращает { events: [...] } — публикованные события, старшие — раньше.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.10';
import { bad, handleOptions, json } from '../_shared/tools.ts';
import { verifyAuth } from '../_shared/auth.ts';

const db = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  { auth: { persistSession: false, autoRefreshToken: false } },
);

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

  const { data: events, error } = await db
    .from('events')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: true });

  if (error) return bad(`не удалось получить афишу: ${error.message}`, 500);
  return json({ events: events ?? [] });
});