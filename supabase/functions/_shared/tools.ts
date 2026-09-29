// Общие утилиты для Edge Functions: CORS-заголовки и ответы.
// В iframe VK запрос делается «простым» POST без content-type, поэтому
// preflight OPTIONS не требуется, но держим обработчик для совместимости.

export const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'content-type',
  'access-control-allow-methods': 'POST, OPTIONS',
};

export function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'access-control-max-age': '86400',
    },
  });
}

export function bad(message, status = 400) {
  return json({ error: message }, status);
}

export function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}