import { useEffect, useState } from 'react';
import { saveThemePref } from './storage';

const TOKEN_CLASSES = [
  'vkui--vkBase--light',
  'vkui--vkBase--dark',
  'vkui--vkIOS--light',
  'vkui--vkIOS--dark',
  'vkui--vkCom--light',
  'vkui--vkCom--dark',
];

export function detectSystemTheme() {
  try {
    const query = (window.location.hash || '').replace(/^#\/?/, '') || window.location.search.replace(/^\?/, '');
    const found = new URLSearchParams(query).get('vk_appearance');
    if (found === 'dark' || found === 'light') return found;
  } catch {}
  try {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  } catch {}
  return 'light';
}

export function useColorScheme(pref, platform) {
  const [systemTheme, setSystemTheme] = useState(detectSystemTheme);
  const theme = pref === 'auto' ? systemTheme : pref;

  useEffect(() => {
    saveThemePref(pref);
  }, [pref]);

  useEffect(() => {
    let media = null;
    try {
      media = window.matchMedia('(prefers-color-scheme: dark)');
    } catch {}
    if (!media) return undefined;
    const onChange = (e) => setSystemTheme(e.matches ? 'dark' : 'light');
    if (media.addEventListener) media.addEventListener('change', onChange);
    else media.addListener(onChange);
    return () => {
      if (media.removeEventListener) media.removeEventListener('change', onChange);
      else media.removeListener(onChange);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(...TOKEN_CLASSES);
    root.classList.add(`vkui--vkBase--${theme}`);
    if (platform === 'ios') root.classList.add(`vkui--vkIOS--${theme}`);
    if (platform === 'vkcom') root.classList.add(`vkui--vkCom--${theme}`);
    root.setAttribute('data-chipsony-theme', theme);
  }, [theme, platform]);

  return theme;
}
