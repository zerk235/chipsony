const CART_KEY = 'chipsony:cart';
const THEME_KEY = 'chipsony:theme';

export function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch {}
  return {};
}

export function saveCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {}
}

export function loadThemePref() {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (raw === 'auto' || raw === 'light' || raw === 'dark') return raw;
  } catch {}
  return 'auto';
}

export function saveThemePref(pref) {
  try {
    localStorage.setItem(THEME_KEY, pref);
  } catch {}
}
