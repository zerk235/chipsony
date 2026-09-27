import { Button, Caption, Div, Group, Header, Radio, RadioGroup, Spacing } from '@vkontakte/vkui';
import { plural } from '../lib/format';

const THEME_OPTIONS = [
  { value: 'auto', label: 'Как в ВК / системе' },
  { value: 'light', label: 'Светлая тема' },
  { value: 'dark', label: 'Тёмная тема' },
];

export function SettingsStep({ themePref, onTheme, cartCount, onResetCart }) {
  return (
    <>
      <Group header={<Header mode="secondary">Оформление</Header>}>
        <RadioGroup>
          {THEME_OPTIONS.map((opt) => (
            <Div key={opt.value}>
              <Radio value={opt.value} checked={themePref === opt.value} onChange={() => onTheme(opt.value)}>
                {opt.label}
              </Radio>
            </Div>
          ))}
        </RadioGroup>
      </Group>

      <Group header={<Header mode="secondary">Корзина</Header>}>
        <Div>
          <Caption className="vkui--ToneNeutral" style={{ display: 'block' }}>
            Сейчас в корзине: {cartCount} {plural(cartCount, 'билет', 'билета', 'билетов')}
          </Caption>
          <Spacing size={12} />
          <Button size="l" mode="secondary" stretched disabled={cartCount === 0} onClick={onResetCart}>
            Очистить корзину
          </Button>
        </Div>
      </Group>

      <Group header={<Header mode="secondary">О приложении</Header>}>
        <Div>
          <Caption className="vkui--ToneNeutral" style={{ display: 'block' }}>
            Чипсоны — афиша событий. Билеты пока демонстрационные: настоящие QR-билеты появятся после
            подключения базы данных.
          </Caption>
        </Div>
      </Group>
    </>
  );
}
