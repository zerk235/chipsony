export const EVENTS = [
  {
    id: 'hack',
    title: 'Хакатон MAX 2026 — финал',
    place: 'VK, Ходынский бульвар 17А',
    date: '10 октября, 09:00',
    price: 0,
    seats: 300,
    emoji: '🍿',
    gradient: 'linear-gradient(120deg,#FFB800 0%,#FF6B00 55%,#2C2C2C 55%)',
    description:
      'Два дня кода, сон на подушках и финал на большой сцене: команды защищают прототипы перед жюри VK. Все участники получают мерч и доступ в закрытый чат с менторами.',
    bring: 'ноутбук, зарядка, паспорт',
    how_to_get: 'Метро «Белорусская», пешком 7 минут. Вход по билету на регистрации с 08:30.',
  },
  {
    id: 'picket',
    title: 'Фест «Чипсоны»: музыка и стендап',
    place: 'Парк Горького, летняя сцена',
    date: '18 октября, 14:00',
    price: 990,
    seats: 500,
    emoji: '🎤',
    gradient: 'linear-gradient(120deg,#8B9BFF 0%,#5B5BFF 55%,#1F1F2E 55%)',
    description:
      'Фестиваль уличной музыки и стендапа в Парке Горького: живой звук, локальные артисты и много-много чипсонов.',
    bring: 'плед, друзья',
    how_to_get: 'Метро «Октябрьская», главный вход парка, летняя сцена у пруда.',
  },
  {
    id: 'workshop',
    title: 'Воркшоп «Собираем прототип за вечер»',
    place: 'VK, коворкинг, 5 этаж',
    date: '24 октября, 18:00',
    price: 0,
    seats: 40,
    emoji: '💡',
    gradient: 'linear-gradient(120deg,#7BE495 0%,#2FA85C 55%,#0F2E1C 55%)',
    description:
      'За один вечер соберёте рабочий прототип Mini App: от идеи до запуска во VK. Разборы, шаблоны и опытные менторы рядом.',
    bring: 'ноутбук с зарядкой',
    how_to_get: 'VK, коворкинг 5 этаж: пропуск по билету у стойки рецепции.',
  },
  {
    id: 'night',
    title: 'Ночная экскурсия по офису VK',
    place: 'Ленинградский проспект, 39',
    date: '30 октября, 23:00',
    price: 790,
    seats: 30,
    emoji: '🌙',
    gradient: 'linear-gradient(120deg,#3EAAFF 0%,#234B9B 55%,#101426 55%)',
    description:
      'Когда офис пустеет — начинается магия: светящиеся локации, выход на смотровую и истории ВКонтакте из первых уст.',
    bring: 'удобная обувь',
    how_to_get: 'Ленинградский проспект 39, корпус А: сбор в 22:40 у главного входа.',
  },
  {
    id: 'demo',
    title: 'Демо-день: что построили команды',
    place: 'VK, конференц-зал',
    date: '7 ноября, 12:00',
    price: 0,
    seats: 150,
    emoji: '🚀',
    gradient: 'linear-gradient(120deg,#F2709C 0%,#FF9472 50%,#11122E 50%)',
    description:
      'Презентации команд после двух месяцев разработки: о чём мечтают, что собрали и как сэкономят время пользователям. Голосование зрителей влияет на приз.',
    bring: 'телефон для голосования',
    how_to_get: 'VK, конференц-зал 4 этаж. Вход по билету, регистрация с 11:30.',
  },
  {
    id: 'meetup',
    title: 'Митап «VK Mini Apps» для разработчиков',
    place: 'VK, амфитеатр',
    date: '14 ноября, 19:00',
    price: 0,
    seats: 200,
    emoji: '⚡',
    gradient: 'linear-gradient(120deg,#9B7BFF 0%,#5B3BFF 55%,#171227 55%)',
    description:
      'Для разработчиков и дизайнеров: лайфхаки платформы, разбор реальных кейсов из каталога и open Q&A с техлидами.',
    bring: 'только ваш аккаунт VK',
    how_to_get: 'VK, амфитеатр 1 этаж. Онлайн-трансляция по ссылке в чате события.',
  },
];

const EVENTS_KEY = 'chipsony:events';

/** Афиша с сервера: обновляем кэш, чтобы каталог работал и офлайн. */
export function saveEvents(events) {
  if (!Array.isArray(events) || !events.length) return;
  try {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  } catch {}
}

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