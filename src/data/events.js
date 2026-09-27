export const EVENTS = [
  {
    id: 'hack',
    title: 'Хакатон MAX — финал',
    place: 'VK, Москва',
    date: '28 сентября, 17:00',
    price: 490,
    seats: 150,
    emoji: '🍿',
    gradient: 'linear-gradient(120deg,#FFB800 0%,#FF6B00 55%,#2C2C2C 55%)',
  },
  {
    id: 'picket',
    title: 'Пикет «Чипсоны в городе»',
    place: 'Арбат, сцена',
    date: '29 сентября, 19:00',
    price: 790,
    seats: 60,
    emoji: '🥁',
    gradient: 'linear-gradient(120deg,#8B9BFF 0%,#5B5BFF 55%,#1F1F2E 55%)',
  },
  {
    id: 'night',
    title: 'Ночная экскурсия по офису VK',
    place: 'Ленинградский проспект 39',
    date: '2 октября, 23:00',
    price: 990,
    seats: 40,
    emoji: '🌙',
    gradient: 'linear-gradient(120deg,#3EAAFF 0%,#234B9B 55%,#101426 55%)',
  },
  {
    id: 'workshop',
    title: 'Воркшоп «Креатив в 2 часа ночи»',
    place: 'Онлайн',
    date: '4 октября, 00:00',
    price: 0,
    seats: 500,
    emoji: '💡',
    gradient: 'linear-gradient(120deg,#7BE495 0%,#2FA85C 55%,#0F2E1C 55%)',
  },
];

const EVENTS_KEY = 'chipsony:events';

export function loadEvents() {
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch {}
  try {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(EVENTS));
  } catch {}
  return EVENTS;
}
