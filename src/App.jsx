import { useState } from 'react';
import bridge from '@vkontakte/vk-bridge';
import {
  AdaptivityProvider,
  AppRoot,
  Button,
  Caption,
  Card,
  ConfigProvider,
  Div,
  Group,
  Header,
  Headline,
  IconButton,
  Panel,
  PanelHeader,
  Placeholder,
  Separator,
  Snackbar,
  Spacing,
  Title,
  usePlatform,
  View,
} from '@vkontakte/vkui';
import {
  Icon28AddOutline,
  Icon28ArrowLeftOutline,
  Icon28CheckCircleOutline,
  Icon28DeleteOutline,
  Icon28MinusOutline,
  Icon28ShoppingCartOutline,
} from '@vkontakte/icons';
import '@vkontakte/vkui/dist/vkui.css';

const BRAND_COLOR = '#FFB800';

const EVENTS = [
  {
    id: 'hack',
    title: 'Хакатон MAX — финал',
    place: 'VK, Москва',
    date: '28 сентября, 17:00',
    price: 490,
    emoji: '🍿',
    gradient: 'linear-gradient(120deg,#FFB800 0%,#FF6B00 55%,#2C2C2C 55%)',
  },
  {
    id: 'picket',
    title: 'Пикет «Чипсоны в городе»',
    place: 'Арбат, сцена',
    date: '29 сентября, 19:00',
    price: 790,
    emoji: '🥁',
    gradient: 'linear-gradient(120deg,#8B9BFF 0%,#5B5BFF 55%,#1F1F2E 55%)',
  },
  {
    id: 'night',
    title: 'Ночная экскурсия по офису VK',
    place: 'Ленинградский проспект 39',
    date: '2 октября, 23:00',
    price: 990,
    emoji: '🌙',
    gradient: 'linear-gradient(120deg,#3EAAFF 0%,#234B9B 55%,#101426 55%)',
  },
  {
    id: 'workshop',
    title: 'Воркшоп «Креатив в 2 часа ночи»',
    place: 'Онлайн',
    date: '4 октября, 00:00',
    price: 0,
    emoji: '💡',
    gradient: 'linear-gradient(120deg,#7BE495 0%,#2FA85C 55%,#0F2E1C 55%)',
  },
];

function money(n) {
  return n === 0 ? 'Бесплатно' : `${n.toLocaleString('ru-RU')} ₽`;
}

function primaryStyle(platform) {
  return {
    background: platform === 'ios' ? 'linear-gradient(90deg,#FFB800,#FF6B00)' : BRAND_COLOR,
    boxShadow: '0 10px 24px rgba(255,184,0,0.35)',
    borderRadius: 14,
  };
}

function EventCard({ event, count, platform, onAdd, onInc, onDec }) {
  return (
    <Div>
      <Card mode="shadow">
        <div
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
            <Headline level="1" weight="2" style={{ color: BRAND_COLOR }}>
              {money(event.price)}
            </Headline>
            {count === 0 ? (
              <Button
                size="l"
                mode="primary"
                before={<Icon28AddOutline />}
                onClick={onAdd}
                style={primaryStyle(platform)}
              >
                В корзину
              </Button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Button size="l" mode="secondary" width={44} onClick={onDec} before={<Icon28MinusOutline />} />
                <Title level="3" weight="2" style={{ minWidth: 28, textAlign: 'center' }}>{count}</Title>
                <Button size="l" mode="secondary" width={44} onClick={onInc} before={<Icon28AddOutline />} />
              </div>
            )}
          </div>
        </Div>
      </Card>
    </Div>
  );
}

function Catalog({ cart, platform, onAdd, onInc, onDec }) {
  return (
    <Group header={<Header mode="secondary">Афиша</Header>}>
      {EVENTS.map((e) => (
        <EventCard
          key={e.id}
          event={e}
          count={cart[e.id] || 0}
          platform={platform}
          onAdd={() => onAdd(e.id)}
          onInc={() => onInc(e.id)}
          onDec={() => onDec(e.id)}
        />
      ))}
    </Group>
  );
}

function CartStep({ cart, platform, onDec, onInc, onRemove, onClear, onOrder }) {
  const items = EVENTS.filter((e) => (cart[e.id] || 0) > 0);
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
                <Button size="l" mode="secondary" width={40} onClick={() => onDec(e.id)} before={<Icon28MinusOutline />} />
                <Title level="3" weight="2" style={{ minWidth: 28, textAlign: 'center' }}>{cart[e.id]}</Title>
                <Button size="l" mode="secondary" width={40} onClick={() => onInc(e.id)} before={<Icon28AddOutline />} />
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

function OrderStep({ items, totalCount, total, platform, onDone }) {
  const [busy, setBusy] = useState(false);

  const submit = () => {
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      onDone(totalCount, total);
    }, 1200);
  };

  return (
    <>
      <Group header={<Header mode="secondary">Оплата</Header>}>
        <Div>
          {items.map((e) => (
            <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <Caption className="vkui--ToneNeutral">{e.title} × {e.count}</Caption>
              <Caption className="vkui--ToneNeutral">{money(e.subtotal)}</Caption>
            </div>
          ))}
          <Separator className="vkui--Separator" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 }}>
            <Headline weight="3">К оплате</Headline>
            <Title level="2" weight="2" style={{ color: BRAND_COLOR }}>{money(total)}</Title>
          </div>
        </Div>
      </Group>
      <Spacing size={16} />
      <Div>
        <Button
          size="l"
          stretched
          height={56}
          mode="primary"
          loading={busy}
          onClick={submit}
          style={primaryStyle(platform)}
        >
          <span style={{ fontSize: 18, fontWeight: 600 }}>Оплатить {money(total)}</span>
        </Button>
      </Div>
    </>
  );
}

function SuccessStep({ totalCount, total, platform, onReset }) {
  const orderId = 'CHIPS-' + String(Math.floor(100000 + Math.random() * 900000));
  return (
    <Group>
      <Placeholder
        icon={<Icon28CheckCircleOutline width={72} height={72} style={{ color: BRAND_COLOR }} />}
        header="Билеты куплены!"
        action={
          <Button size="l" mode="primary" stretched onClick={onReset} style={primaryStyle(platform)}>
            К афише
          </Button>
        }
      >
        <div style={{ textAlign: 'center' }}>
          <Title level="3" weight="2">{orderId}</Title>
          <Spacing size={8} />
          <Caption className="vkui--ToneNeutral">
            {totalCount} билета · {money(total)}
            <br />
            QR-билеты придут в VK на почту
          </Caption>
        </div>
      </Placeholder>
    </Group>
  );
}

export function App() {
  const platform = usePlatform();
  const [step, setStep] = useState('catalog');
  const [prev, setPrev] = useState('catalog');
  const [cart, setCart] = useState({});
  const [result, setResult] = useState({ count: 1, total: 0 });
  const [snackbar, setSnackbar] = useState(null);

  const add = (id) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const inc = (id) => add(id);
  const dec = (id) =>
    setCart((c) => {
      const n = (c[id] || 0) - 1;
      const next = { ...c };
      if (n <= 0) delete next[id];
      else next[id] = n;
      return next;
    });
  const remove = (id) =>
    setCart((c) => {
      const next = { ...c };
      delete next[id];
      return next;
    });
  const clearCart = () => setCart({});

  const cartCount = Object.values(cart).reduce((s, n) => s + n, 0);
  const cartItems = EVENTS.filter((e) => (cart[e.id] || 0) > 0);

  const goCatalog = () => { setStep('catalog'); setPrev('catalog'); setSnackbar(null); };
  const goCart = () => { setPrev('catalog'); setStep('cart'); };
  const goBack = () => setStep(prev);

  const goOrder = (count, total) => {
    setPrev(step === 'cart' ? 'cart' : 'catalog');
    setResult({ count, total });
    setStep('order');
  };

  const finishOrder = (count, total) => {
    setResult({ count, total });
    clearCart();
    setStep('success');
    setSnackbar(
      <Snackbar onClose={() => setSnackbar(null)} duration={2500}>
        Заказ {count} билетов оформлен ✓
      </Snackbar>,
    );
    try {
      bridge.send('VKWebAppShowSnackbar', { text: 'Заказ оформлен', duration: 2500 }).then(() => {}, () => {});
    } catch {}
  };

  const showCartBtn = step === 'catalog' || step === 'cart';
  const showBack = step === 'cart' || step === 'order';

  return (
    <ConfigProvider appearance="light">
      <AdaptivityProvider>
        <AppRoot>
          <View activePanel="main" platform={platform}>
            <Panel id="main">
              <PanelHeader
                separator={false}
                before={
                  showBack ? (
                    <IconButton aria-label="Назад" onClick={goBack}>
                      <Icon28ArrowLeftOutline />
                    </IconButton>
                  ) : null
                }
                after={
                  showCartBtn ? (
                    <IconButton aria-label="Корзина" onClick={goCart}>
                      <span style={{ position: 'relative', display: 'inline-block', lineHeight: 0 }}>
                        <Icon28ShoppingCartOutline />
                        {cartCount > 0 && (
                          <span
                            style={{
                              position: 'absolute',
                              top: -6,
                              right: -10,
                              minWidth: 18,
                              height: 18,
                              padding: '0 5px',
                              borderRadius: 9,
                              background: BRAND_COLOR,
                              color: '#000',
                              fontSize: 12,
                              fontWeight: 600,
                              lineHeight: '18px',
                              textAlign: 'center',
                              boxSizing: 'border-box',
                            }}
                          >
                            {cartCount > 9 ? '9+' : cartCount}
                          </span>
                        )}
                      </span>
                    </IconButton>
                  ) : null
                }
              >
                🍿 Чипсоны
              </PanelHeader>

              {step === 'catalog' && (
                <Catalog cart={cart} platform={platform} onAdd={add} onInc={inc} onDec={dec} />
              )}

              {step === 'cart' && (
                <CartStep
                  cart={cart}
                  platform={platform}
                  onDec={dec}
                  onInc={inc}
                  onRemove={remove}
                  onClear={goCatalog}
                  onOrder={goOrder}
                />
              )}

              {step === 'order' && (
                <OrderStep
                  items={cartItems.map((e) => ({
                    id: e.id,
                    title: e.title,
                    count: cart[e.id],
                    subtotal: cart[e.id] * e.price,
                  }))}
                  totalCount={result.count}
                  total={result.total}
                  platform={platform}
                  onDone={finishOrder}
                />
              )}

              {step === 'success' && (
                <SuccessStep
                  totalCount={result.count}
                  total={result.total}
                  platform={platform}
                  onReset={goCatalog}
                />
              )}

              {snackbar}
            </Panel>
          </View>
        </AppRoot>
      </AdaptivityProvider>
    </ConfigProvider>
  );
}