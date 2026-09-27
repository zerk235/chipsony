export const BRAND_COLOR = '#FFB800';

export function money(n) {
  return n === 0 ? 'Бесплатно' : `${n.toLocaleString('ru-RU')} ₽`;
}

export function placesWord(n) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'место';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'места';
  return 'мест';
}

export function plural(n, one, few, many) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

export function primaryStyle(platform) {
  return {
    background: platform === 'ios' ? 'linear-gradient(90deg,#FFB800,#FF6B00)' : BRAND_COLOR,
    boxShadow: '0 10px 24px rgba(255,184,0,0.35)',
    borderRadius: 14,
  };
}
