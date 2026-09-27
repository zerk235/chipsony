import { useEffect, useRef, useState } from 'react';
import {
  AdaptivityProvider,
  AppRoot,
  Button,
  ConfigProvider,
  Div,
  IconButton,
  Panel,
  PanelHeader,
  Snackbar,
  usePlatform,
  View,
} from '@vkontakte/vkui';
import { Icon28ArrowLeftOutline, Icon28RefreshOutline } from '@vkontakte/icons';
import '@vkontakte/vkui/dist/vkui.css';
import './styles.css';
import { loadEvents } from './data/events';
import { loadCart, loadThemePref, saveCart } from './lib/storage';
import { useColorScheme } from './lib/useColorScheme';
import { showVkSnackbar } from './lib/vk';
import { useFlyToCart } from './hooks/useFlyToCart';
import { Catalog } from './components/Catalog';
import { CartStep } from './components/CartStep';
import { OrderStep } from './components/OrderStep';
import { SuccessStep } from './components/SuccessStep';
import { SettingsStep } from './components/SettingsStep';
import { CartBar } from './components/CartBar';
import { ChipFly } from './components/ChipFly';

export function App() {
  const platform = usePlatform();
  const [themePref, setThemePref] = useState(loadThemePref);
  const theme = useColorScheme(themePref, platform);

  const [events, setEvents] = useState(loadEvents);
  const [step, setStep] = useState('catalog');
  const [prev, setPrev] = useState('catalog');
  const [cart, setCart] = useState(loadCart);
  const [result, setResult] = useState({ count: 1, total: 0 });
  const [snackbar, setSnackbar] = useState(null);
  const [online, setOnline] = useState(() => navigator.onLine !== false);

  const cartBtnRef = useRef(null);
  const { fly, ring, bumpKey, pulse, flyFrom } = useFlyToCart(cartBtnRef);

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const sourceEl = (id, ev) => {
    if (ev && ev.currentTarget && ev.currentTarget.getBoundingClientRect) {
      const rect = ev.currentTarget.getBoundingClientRect();
      if (rect.width && rect.height) return ev.currentTarget;
    }
    return document.querySelector(`[data-chip="${id}"]`);
  };

  const add = (id, ev) => {
    const item = events.find((x) => x.id === id);
    if (!item) return;
    if ((cart[id] || 0) >= item.seats) return;
    setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
    pulse();
    flyFrom(sourceEl(id, ev), item.emoji);
  };

  const inc = (id, ev) => add(id, ev);

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

  const cartItems = events.filter((e) => (cart[e.id] || 0) > 0);
  const cartCount = cartItems.reduce((s, e) => s + cart[e.id], 0);
  const cartTotal = cartItems.reduce((s, e) => s + cart[e.id] * e.price, 0);

  const goCatalog = () => { setStep('catalog'); setPrev('catalog'); setSnackbar(null); };
  const goCart = () => { setPrev('catalog'); setStep('cart'); };
  const goSettings = () => { setPrev(step); setStep('settings'); };
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
        Заказ {count} билетов оформлен
      </Snackbar>,
    );
    showVkSnackbar('Заказ оформлен');
  };

  const retry = () => {
    setEvents(loadEvents());
    setOnline(navigator.onLine !== false);
  };

  const showCartBar = step === 'catalog';
  const showBack = step === 'cart' || step === 'order' || step === 'settings';
  const noticeBg = theme === 'dark' ? '#3A2E12' : '#FFF4D6';
  const noticeFg = theme === 'dark' ? '#FFD479' : '#7A5B00';

  return (
    <ConfigProvider colorScheme={theme}>
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
              >
                Чипсоны
              </PanelHeader>

              {!online && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '10px 12px',
                    background: noticeBg,
                    color: noticeFg,
                    fontSize: 13,
                  }}
                >
                  <span>Нет соединения — показываем сохранённую афишу</span>
                  <Button size="s" mode="secondary" before={<Icon28RefreshOutline />} onClick={retry}>
                    Обновить
                  </Button>
                </div>
              )}

              <Div style={showCartBar ? { paddingBottom: 104 } : undefined}>
                {step === 'catalog' && (
                  <Catalog events={events} cart={cart} platform={platform} onAdd={add} onInc={inc} onDec={dec} />
                )}

                {step === 'cart' && (
                  <CartStep
                    events={events}
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

                {step === 'settings' && (
                  <SettingsStep
                    themePref={themePref}
                    onTheme={setThemePref}
                    cartCount={cartCount}
                    onResetCart={() => {
                      clearCart();
                      setSnackbar(
                        <Snackbar onClose={() => setSnackbar(null)} duration={2000}>
                          Корзина очищена
                        </Snackbar>,
                      );
                    }}
                  />
                )}
              </Div>

              <ChipFly fly={fly} />

              {showCartBar && (
                <CartBar
                  theme={theme}
                  platform={platform}
                  cartCount={cartCount}
                  cartTotal={cartTotal}
                  ring={ring}
                  bumpKey={bumpKey}
                  cartBtnRef={cartBtnRef}
                  onCart={goCart}
                  onSettings={goSettings}
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
