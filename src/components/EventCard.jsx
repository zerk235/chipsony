import { Button, Caption, Card, Div, Headline, Spacing, Title } from '@vkontakte/vkui';
import { Icon16CheckCircleOutline, Icon28AddOutline, Icon28MinusOutline } from '@vkontakte/icons';
import { BRAND_COLOR, money, placesWord, primaryStyle } from '../lib/format';

const GOING_GREEN = '#2BB673';

export function EventCard({ event, count, isGoing, platform, onAdd, onInc, onDec, onOpen }) {
  const left = Math.max(0, event.seats - count);

  return (
    <Div>
      <Card
        mode="shadow"
        onClick={onOpen}
        style={{
          cursor: 'pointer',
          border: isGoing ? `2px solid ${GOING_GREEN}` : undefined,
          boxSizing: 'border-box',
        }}
      >
        <div
          data-chip={event.id}
          style={{
            height: 120,
            borderRadius: isGoing ? '12px 12px 0 0' : '14px 14px 0 0',
            background: event.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Title level="2" style={{ color: '#fff' }}>{event.emoji}</Title>
        </div>
        <Div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
            <Title level="3" weight="2">{event.title}</Title>
            {isGoing && (
              <Icon16CheckCircleOutline
                width={18}
                height={18}
                style={{ color: GOING_GREEN, flexShrink: 0, marginTop: 4 }}
              />
            )}
          </div>
          <Spacing size={4} />
          <Caption className="vkui--ToneNeutral">{event.date} · {event.place}</Caption>
          <Spacing size={10} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <Headline level="1" weight="2" style={{ color: BRAND_COLOR }}>
                {money(event.price)}
              </Headline>
              <Caption className="vkui--ToneNeutral" style={{ display: 'block' }}>
                {left > 0 ? `Осталось ${left} ${placesWord(left)}` : 'Мест нет'}
              </Caption>
            </div>
            {count === 0 ? (
              <Button
                size="l"
                mode="primary"
                disabled={left === 0}
                before={<Icon28AddOutline />}
                onClick={(ev) => {
                  ev.stopPropagation();
                  onAdd(event.id, ev);
                }}
                style={left === 0 ? undefined : primaryStyle(platform)}
              >
                В корзину
              </Button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} onClick={(ev) => ev.stopPropagation()}>
                <Button
                  size="l"
                  mode="secondary"
                  width={44}
                  onClick={() => onDec(event.id)}
                  before={<Icon28MinusOutline />}
                />
                <Title level="3" weight="2" style={{ minWidth: 28, textAlign: 'center' }}>{count}</Title>
                <Button
                  size="l"
                  mode="secondary"
                  width={44}
                  disabled={left === 0}
                  onClick={(ev) => onInc(event.id, ev)}
                  before={<Icon28AddOutline />}
                />
              </div>
            )}
          </div>
        </Div>
      </Card>
    </Div>
  );
}