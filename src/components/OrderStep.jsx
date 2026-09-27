import { useState } from 'react';
import { Button, Caption, Div, Group, Header, Headline, Separator, Spacing, Title } from '@vkontakte/vkui';
import { BRAND_COLOR, money, primaryStyle } from '../lib/format';

export function OrderStep({ items, totalCount, total, platform, onDone }) {
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
        <Button size="l" stretched height={56} mode="primary" loading={busy} onClick={submit} style={primaryStyle(platform)}>
          <span style={{ fontSize: 18, fontWeight: 600 }}>Оплатить {money(total)}</span>
        </Button>
      </Div>
    </>
  );
}
