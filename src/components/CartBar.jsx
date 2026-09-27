import { createPortal } from 'react-dom';
import { Button, IconButton } from '@vkontakte/vkui';
import { Icon28SettingsOutline, Icon28ShoppingCartOutline } from '@vkontakte/icons';
import { money, plural, primaryStyle } from '../lib/format';

export function CartBar({ theme, platform, cartCount, cartTotal, ring, bumpKey, cartBtnRef, onCart, onSettings }) {
  const barBg = theme === 'dark' ? 'rgba(30,32,34,0.96)' : 'rgba(255,255,255,0.96)';
  const barShadow = theme === 'dark' ? '0 -6px 20px rgba(0,0,0,0.55)' : '0 -6px 20px rgba(0,0,0,0.1)';

  return createPortal(
    <div
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 900,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 12px calc(12px + env(safe-area-inset-bottom, 0px))',
        background: barBg,
        backdropFilter: 'blur(10px)',
        boxShadow: barShadow,
      }}
    >
      <div style={{ flex: '0 0 auto' }}>
        <IconButton aria-label="Настройки" mode="secondary" size="l" onClick={onSettings} style={{ width: 56, height: 56 }}>
          <Icon28SettingsOutline />
        </IconButton>
      </div>
      <div
        key={bumpKey}
        ref={cartBtnRef}
        className={bumpKey ? 'cart-bump' : undefined}
        style={{ flex: '1 1 auto', position: 'relative' }}
      >
        {ring && <span className="cart-ring" />}
        <Button
          size="l"
          stretched
          height={56}
          mode="primary"
          before={<Icon28ShoppingCartOutline />}
          onClick={onCart}
          style={primaryStyle(platform)}
        >
          <span style={{ fontSize: 17, fontWeight: 600 }}>
            {cartCount === 0
              ? 'Корзина'
              : `В корзину · ${cartCount} ${plural(cartCount, 'билет', 'билета', 'билетов')} · ${money(cartTotal)}`}
          </span>
        </Button>
      </div>
    </div>,
    document.body,
  );
}
