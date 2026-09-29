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
 * Короткая сводка для диагностики, если initData нет.
 * Возвращается в тексте ошибки экрана, чтобы сразу было видно, где искать.
 */
export function initDataDiagnostics() {
  const searchQ = new URLSearchParams(window.location.search);
  const hashQ = window.location.hash ? new URLSearchParams(window.location.hash.replace(/^[#\\/]*/, '')) : null;
  return (
    `query: «${window.location.search ? searchQ.get('initData') ? 'есть' : 'нет' : 'пусто'}», ` +
    `hash: «${window.location.hash ? hashQ?.get('initData') ? 'есть' : 'нет' : 'пусто'}»`
  );
}

export function resetInitDataCache() {
  cached = null;
}