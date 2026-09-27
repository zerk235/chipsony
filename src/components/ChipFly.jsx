import { createPortal } from 'react-dom';

export function ChipFly({ fly }) {
  if (!fly) return null;

  return createPortal(
    <span
      key={fly.id}
      className="chip-fly"
      style={{ left: fly.x, top: fly.y, '--dx': `${fly.dx}px`, '--dy': `${fly.dy}px` }}
    >
      {fly.emoji}
    </span>,
    document.body,
  );
}
