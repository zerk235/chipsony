import { Group, Header } from '@vkontakte/vkui';
import { EventCard } from './EventCard';

export function Catalog({ events, cart, platform, onAdd, onInc, onDec }) {
  return (
    <Group header={<Header mode="secondary">Афиша</Header>}>
      {events.map((e) => (
        <EventCard
          key={e.id}
          event={e}
          count={cart[e.id] || 0}
          platform={platform}
          onAdd={onAdd}
          onInc={onInc}
          onDec={onDec}
        />
      ))}
    </Group>
  );
}
