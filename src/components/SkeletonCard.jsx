import { Card, Div, Spacing } from '@vkontakte/vkui';

export function SkeletonCard() {
  return (
    <Div>
      <Card mode="shadow" style={{ overflow: 'hidden' }}>
        <div className="chip-skeleton chip-skeleton--hero" />
        <Div>
          <div className="chip-skeleton chip-skeleton--title" />
          <Spacing size={8} />
          <div className="chip-skeleton chip-skeleton--meta" />
          <Spacing size={14} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: '40%' }}>
              <div className="chip-skeleton chip-skeleton--meta" />
            </div>
            <div className="chip-skeleton chip-skeleton--button" />
          </div>
        </Div>
      </Card>
    </Div>
  );
}

export function SkeletonList({ rows = 3 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </>
  );
}