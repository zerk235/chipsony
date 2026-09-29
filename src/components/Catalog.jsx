import { Group, Header, IconButton, Div, Caption, Button } from '@vkontakte/vkui';
import { Icon28RefreshOutline } from '@vkontakte/icons';
import { EventCard } from './EventCard';
import { SkeletonList } from './SkeletonCard';

export function Catalog({
  events,
  cart,
  platform,
  registeredIds,
  loading,
  refreshFailed,
  onAdd,
  onInc,
  onDec,
  onOpen,
  onRefresh,
}) {
  if (loading && !events.length) {
    return (
      <Group>
        <SkeletonList rows={3} />
      </Group>
    );
  }

  return (
    <Group
      header={
        <Header
          mode="secondary"
          subtitle={refreshFailed ? 'не удалось обновить афишу' : undefined}
          after={
            <IconButton aria-label="Обновить афишу" onClick={onRefresh}>
              <Icon28RefreshOutline />
            </IconButton>
          }
        >
          Афиша
        </Header>
      }
    >
      {refreshFailed && (
        <Div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <Caption className="vkui--ToneNeutral">Показываем сохранённую афишу</Caption>
            <Button size="s" mode="secondary" before={<Icon28RefreshOutline />} onClick={onRefresh}>
              Обновить
            </Button>
          </div>
        </Div>
      )}
      {events.map((e) => (
        <EventCard
          key={e.id}
          event={e}
          count={cart[e.id] || 0}
          isGoing={registeredIds.has(e.id)}
          platform={platform}
          onAdd={onAdd}
          onInc={onInc}
          onDec={onDec}
          onOpen={() => onOpen(e.id)}
        />
      ))}
    </Group>
  );
}