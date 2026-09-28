import bridge from '@vkontakte/vk-bridge';

let cached = null;

/**
 * initData — подписанный VK стартовый параметр. В нём есть user_id и hash,
 * по которому сервер проверяет, что запрос действительно от VK.
 */
export async function getInitData() {
  if (cached) return cached;

  try {
    const fromUrl = new URLSearchParams(window.location.search).get('initData');
    if (fromUrl) {
      cached = fromUrl;
      return cached;
    }
  } catch {}

  try {
    const params = await bridge.send('VKWebAppGetLaunchParams');
    const fromBridge = params?.launchParams?.initData;
    if (fromBridge) {
      cached = fromBridge;
      return cached;
    }
  } catch {}

  return null;
}

export function resetInitDataCache() {
  cached = null;
}
