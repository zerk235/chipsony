import bridge from '@vkontakte/vk-bridge';

export function haptic(hapticType = 'light') {
  try {
    bridge.send('VKWebAppHapticImpactOccurred', { hapticType }).then(() => {}, () => {});
  } catch {}
}

export function showVkSnackbar(text, duration = 2500) {
  try {
    bridge.send('VKWebAppShowSnackbar', { text, duration }).then(() => {}, () => {});
  } catch {}
}
