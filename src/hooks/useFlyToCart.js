import { useCallback, useEffect, useRef, useState } from 'react';
import { haptic } from '../lib/vk';

export function useFlyToCart(targetRef) {
  const [fly, setFly] = useState(null);
  const [ring, setRing] = useState(false);
  const [bumpKey, setBumpKey] = useState(0);
  const timers = useRef([]);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    },
    [],
  );

  const pulse = useCallback(() => {
    haptic('light');
    setRing(true);
    setBumpKey((k) => k + 1);
    timers.current.push(setTimeout(() => setRing(false), 620));
    timers.current.push(setTimeout(() => haptic('light'), 480));
  }, []);

  const flyFrom = useCallback(
    (sourceEl, emoji) => {
      const target = targetRef.current;
      if (!sourceEl || !target || !emoji) return;
      const from = sourceEl.getBoundingClientRect();
      const to = target.getBoundingClientRect();
      if (!from.width || !to.width) return;
      setFly({
        id: Date.now(),
        emoji,
        x: from.left + from.width / 2 - 22,
        y: from.top + from.height / 2 - 22,
        dx: to.left + to.width / 2 - from.left - from.width / 2,
        dy: to.top + to.height / 2 - from.top - from.height / 2,
      });
      timers.current.push(setTimeout(() => setFly(null), 720));
    },
    [targetRef],
  );

  return { fly, ring, bumpKey, pulse, flyFrom };
}
