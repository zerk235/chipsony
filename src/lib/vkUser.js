import bridge from '@vkontakte/vk-bridge';

let cached = null;

function fromQuery() {
  try {
    return new URLSearchParams(window.location.search).get('initData') || null;
  } catch {
    return null;
  }
}

// Часть окружений VK передаёт параметры запуска не в query, а в решётке:
// например «#/…?initData=…» или «#?initData=…»
function fromHash() {
  try {
    let s = window.location.hash;
    if (!s) return null;
    s = s.replace(/^#[\\/]*/, '');
    if (s.startsWith('?')) s = s.slice(1);
    else if (!s.includes('=')) s = s.replace(/^[^?]*\?/, '');
    const value = new URLSearchParams(s).get('initData');
    return value || null;
  } catch {
    return null;
  }
}

async function fromBridge() {
  try {
    const response = await bridge.send('VKWebAppGetLaunchParams', undefined, 1500);
    return response?.launchParams?.initData || null;
  } catch {
    return null;
  }
}

/**
 * initData — подписанный VK стартовый параметр. В нём есть user_id и hash,
 * по которому сервер проверяет, что запрос действительно от VK.
 */
export async function getInitData() {
  if (cached) return cached;
  cached = fromQuery() || fromHash();
  if (cached) return cached;
  cached = await fromBridge();
  return cached;
}

/**
 * Развёрнутая диагностика, если initData не нашёлся заказным способом.
 * Позволяет по одному сообщению понять, что именно VK положил в URL.
 */
export async function initDataDiagnostics() {
  const parts = [];
  parts.push(`url=${window.location.href}`);
  const searchQ = new URLSearchParams(window.location.search);
  parts.push(`searchKeys=${[...searchQ.keys()].join(',') || '(пусто)'}`);
  parts.push(`hash=${window.location.hash || '(пусто)'}`);
  let bridgeInfo = 'мост не вызывался';
  try {
    const response = await bridge.send('VKWebAppGetLaunchParams', undefined, 1500);
    const lp = response?.launchParams;
    bridgeInfo = lp
      ? `lpKeys=${Object.keys(lp).join(',')}`
      : `ответ без launchParams (${JSON.stringify(response).slice(0, 140)})`;
  } catch (e) {
    bridgeInfo = `ошибка моста: ${(e && e.message) || e}`;
  }
  parts.push(bridgeInfo);
  return parts.join(' | ');
}

export function resetInitDataCache() {
  cached = null;
}