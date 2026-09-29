import { useState } from 'react';
import { Button, Caption, Div, Group, Header, Headline, Separator, Spacing } from '@vkontakte/vkui';
import { plural, primaryStyle } from '../lib/format';
import { request } from '../lib/api';

export function OrderStep({ items, platform, onDone }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const totalCount = items.reduce((s, e) => s + e.count, 0);

  const submit = async () => {
    setBusy(true);
    setError('');
    const tickets = [];
    for (const item of items) {
      try {
        const res = await request('register', { eventId: item.id, seats: item.count });
        tickets.push(res);
      } catch (err) {
        console.error('[chipsony] регистрация не удалась:', err);
        if (tickets.length) break;
        setError(err.message || 'Не получилось зарегистрироваться');
        break;
      }
    }
    setBusy(false);
    if (tickets.length) onDone(tickets);
  };

  return (
    <>
      <Group header={<Header mode="secondary">Регистрация</Header>}>
        <Div>
          {items.map((e) => (
            <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <Caption className="vkui--ToneNeutral">{e.title} × {e.count}</Caption>
              <Caption className="vkui--ToneNeutral">
                {e.count} {plural(e.count, 'билет', 'билета', 'билетов')}
              </Caption>
            </div>
          ))}
          <Separator className="vkui--Separator" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 }}>
            <Headline weight="3">Итого</Headline>
            <Headline weight="3">{totalCount} {plural(totalCount, 'билет', 'билета', 'билетов')}</Headline>
          </div>
          <Spacing size={4} />
          <Caption className="vkui--ToneNeutral">
            Оплата не нужна — на входе покажешь QR-билет из приложения.
          </Caption>
        </Div>
      </Group>
      {error && (
        <Div>
          <Caption style={{ color: 'var(--color-text-negative, #E64646)' }}>{error}</Caption>
        </Div>
      )}
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
          <span style={{ fontSize: 18, fontWeight: 600 }}>Зарегистрироваться</span>
        </Button>
      </Div>
    </>
  );
}