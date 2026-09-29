import { Button, Caption, Div, Group, Headline, Placeholder, Spacing, Title } from '@vkontakte/vkui';
import {
  Icon28AddOutline,
  Icon28CalendarOutline,
  Icon28PlaceOutline,
  Icon28MinusOutline,
  Icon28TicketOutline,
} from '@vkontakte/icons';
import { money, placesWord, primaryStyle } from '../lib/format';

export function EventStep({ event, count, isGoing, platform, onAdd, onInc, onDec, onGoCart, onOpenTickets }) {
  if (!event) {
    return (
      <Group>
        <Placeholder header="Событие не найдено">Вернись в афишу и выбери другое событие.</Placeholder>
      </Group>
    );
  }

  const left = Math.max(0, event.seats - count);

  return (
    <Group>
      <Div>
        <div
          data-chip={event.id}
          style={{
            height: 168,
            borderRadius: 16,
            background: event.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Title level="1" style={{ color: '#fff', fontSize: 64, lineHeight: 1 }}>
            {event.emoji}
          </Title>
        </div>
        <Spacing size={12} />
        <Headline level="1" weight="2">
          {event.title}
        </Headline>
        <Spacing size={6} />
        <Caption className="vkui--ToneNeutral" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon28CalendarOutline width={18} height={18} /> {event.date}
        </Caption>
        <Spacing size={4} />
        <Caption className="vkui--ToneNeutral" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon28PlaceOutline width={18} height={18} /> {event.place}
        </Caption>
        <Spacing size={4} />
        <Caption className="vkui--ToneNeutral">{money(event.price)}</Caption>
        <Spacing size={14} />
        {isGoing && (
          <>
            <BadgeGoing />
            <Spacing size={12} />
          </>
        )}
        {onGoCart && count > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button size="l" mode="secondary" width={44} onClick={() => onDec(event.id)} before={<Icon28MinusOutline />} />
            <Title level="3" weight="2" style={{ minWidth: 28, textAlign: 'center' }}>
              {count}
            </Title>
            <Button
              size="l"
              mode="secondary"
              width={44}
              disabled={left === 0}
              onClick={(ev) => onInc(event.id, ev)}
              before={<Icon28AddOutline />}
            />
            <Button size="l" mode="primary" stretched onClick={onGoCart} style={primaryStyle(platform)}>
              К оформлению
            </Button>
          </div>
        ) : left === 0 ? (
          <Button size="l" mode="secondary" stretched disabled>
            Мест нет
          </Button>
        ) : isGoing ? (
          <Button size="l" mode="secondary" stretched before={<Icon28TicketOutline />} onClick={onOpenTickets}>
            Мои билеты
          </Button>
        ) : (
          <Button
            size="l"
            mode="primary"
            stretched
            before={<Icon28AddOutline />}
            onClick={(ev) => {
              onAdd(event.id, ev);
              onGoCart();
            }}
            style={primaryStyle(platform)}
          >
            {event.price === 0 ? 'Зарегистрироваться' : 'Купить билет'}
          </Button>
        )}
        {left > 0 && !isGoing && (
          <Caption className="vkui--ToneNeutral" style={{ display: 'block', textAlign: 'center', marginTop: 8 }}>
            Осталось {left} {placesWord(left)}
          </Caption>
        )}
        {event.description && (
          <>
            <Spacing size={20} />
            <Headline level="3" weight="2">
              О событии
            </Headline>
            <Spacing size={6} />
            <Caption className="vkui--ToneNeutral" style={{ fontSize: 15, lineHeight: '20px', whiteSpace: 'pre-line' }}>
              {event.description}
            </Caption>
          </>
        )}
        {event.bring && (
          <>
            <Spacing size={16} />
            <Headline level="3" weight="2">
              Что взять с собой
            </Headline>
            <Spacing size={6} />
            <Caption className="vkui--ToneNeutral" style={{ fontSize: 15, lineHeight: '20px' }}>
              {event.bring}
            </Caption>
          </>
        )}
        {event.how_to_get && (
          <>
            <Spacing size={16} />
            <Headline level="3" weight="2">
              Как добраться
            </Headline>
            <Spacing size={6} />
            <Caption className="vkui--ToneNeutral" style={{ fontSize: 15, lineHeight: '20px' }}>
              {event.how_to_get}
            </Caption>
          </>
        )}
        {!isGoing && count === 0 && (
          <>
            <Spacing size={16} />
            <Caption className="vkui--ToneNeutral">
              После регистрации на нём появится QR-билет — его нужно показать на входе. Место можно занимать и на друзей.
            </Caption>
          </>
        )}
        <Spacing size={6} />
      </Div>
    </Group>
  );
}

function BadgeGoing() {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        borderRadius: 20,
        background: 'var(--vkui--color_background_positive, rgba(55,178,77,.15))',
        color: 'var(--vkui--color_text_positive, #26A354)',
        fontWeight: 600,
        fontSize: 14,
      }}
    >
      Я иду ✓
    </div>
  );
}