import {
  Button,
  Caption,
  Div,
  Group,
  Header,
  Headline,
  IconButton,
  Placeholder,
  Separator,
  Spacing,
  Title,
} from '@vkontakte/vkui';
import { Icon28DeleteOutline, Icon28MinusOutline, Icon28AddOutline, Icon28ShoppingCartOutline } from '@vkontakte/icons';
import { BRAND_COLOR, money, primaryStyle } from '../lib/format';

export function CartStep({ events, cart, platform, onDec, onInc, onRemove, onClear, onOrder }) {
  const items = events.filter((e) => (cart[e.id] || 0) > 0);
  const totalCount = items.reduce((s, e) => s + cart[e.id], 0);
  const total = items.reduce((s, e) => s + cart[e.id] * e.price, 0);

  if (items.length === 0) {
    return (
      <Group>
        <Placeholder
          icon={<Icon28ShoppingCartOutline width={56} height={56} style={{ color: BRAND_COLOR }} />}
          header="Корзина пуста"
          action={
            <Button size="l" mode="secondary" onClick={onClear}>
              К афише
            </Button>
          }
        >
          Добавь билеты на события из афиши
        </Placeholder>
      </Group>
    );
  }

  return (
    <>
      <Group header={<Header mode="secondary">Корзина · {totalCount} билета</Header>}>
        {items.map((e) => (
          <Div key={e.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Title level="3" weight="2" style={{ overflowWrap: 'anywhere' }}>{e.title}</Title>
                <Spacing size={4} />
                <Caption className="vkui--ToneNeutral">{e.date}</Caption>
              </div>
              <IconButton aria-label="Убрать" onClick={() => onRemove(e.id)}>
                <Icon28DeleteOutline />
              </IconButton>
            </div>
            <Spacing size={10} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Button
                  size="l"
                  mode="secondary"
                  width={40}
                  onClick={() => onDec(e.id)}
                  before={<Icon28MinusOutline />}
                />
                <Title level="3" weight="2" style={{ minWidth: 28, textAlign: 'center' }}>{cart[e.id]}</Title>
                <Button
                  size="l"
                  mode="secondary"
                  width={40}
                  disabled={cart[e.id] >= e.seats}
                  onClick={() => onInc(e.id)}
                  before={<Icon28AddOutline />}
                />
              </div>
              <Headline weight="3" style={{ color: BRAND_COLOR }}>
                {money(cart[e.id] * e.price)}
              </Headline>
            </div>
          </Div>
        ))}
        <Separator />
        <Div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Headline weight="3">Итого</Headline>
            <Title level="2" weight="2" style={{ color: BRAND_COLOR }}>{money(total)}</Title>
          </div>
          <Caption className="vkui--ToneNeutral">{totalCount} билета · вход по QR на входе</Caption>
        </Div>
      </Group>
      <Div>
        <Button
          size="l"
          stretched
          height={56}
          mode="primary"
          before={<Icon28ShoppingCartOutline />}
          onClick={() => onOrder(totalCount, total)}
          style={primaryStyle(platform)}
        >
          <span style={{ fontSize: 18, fontWeight: 600 }}>Оформить заказ · {money(total)}</span>
        </Button>
      </Div>
    </>
  );
}
