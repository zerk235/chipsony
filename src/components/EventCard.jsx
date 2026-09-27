import { Button, Caption, Card, Div, Headline, Spacing, Title } from '@vkontakte/vkui';
import { Icon28AddOutline, Icon28MinusOutline } from '@vkontakte/icons';
import { BRAND_COLOR, money, placesWord, primaryStyle } from '../lib/format';

export function EventCard({ event, count, platform, onAdd, onInc, onDec }) {
  const left = Math.max(0, event.seats - count);

  return (
    <Div>
      <Card mode="shadow">
        <div
          data-chip={event.id}
          style={{
            height: 120,
            borderRadius: '14px 14px 0 0',
            background: event.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Title level="2" style={{ color: '#fff' }}>{event.emoji}</Title>
        </div>
        <Div>
          <Title level="3" weight="2">{event.title}</Title>
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
                onClick={(ev) => onAdd(event.id, ev)}
                style={left === 0 ? undefined : primaryStyle(platform)}
              >
                В корзину
              </Button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
