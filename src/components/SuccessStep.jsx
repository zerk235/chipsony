import { Button, Caption, Div, Group, Headline, Placeholder, Separator, Spacing, Title } from '@vkontakte/vkui';
import { Icon28CheckCircleOutline } from '@vkontakte/icons';
import QRCode from 'react-qr-code';
import { BRAND_COLOR, plural, primaryStyle } from '../lib/format';

export function SuccessStep({ tickets, platform, onReset }) {
  const totalCount = tickets.reduce((s, t) => s + (Number(t.registration?.seats) || 0), 0);

  return (
    <Group>
      <Placeholder
        icon={<Icon28CheckCircleOutline width={72} height={72} style={{ color: BRAND_COLOR }} />}
        header="Билеты оформлены!"
        action={
          <Button size="l" mode="primary" stretched onClick={onReset} style={primaryStyle(platform)}>
            К афише
          </Button>
        }
      >
        <Caption className="vkui--ToneNeutral">
          {totalCount} {plural(totalCount, 'билет', 'билета', 'билетов')} — покажи QR-код на входе.
        </Caption>
      </Placeholder>

      {tickets.map(({ registration, event }) => (
        <Div key={registration.id}>
          <Group mode="plain">
            <Div style={{ textAlign: 'center' }}>
              <Title level="2" style={{ color: BRAND_COLOR }}>{event?.emoji}</Title>
              <Headline level="2" weight="2">{event?.title || 'Событие'}</Headline>
              <Spacing size={2} />
              <Caption className="vkui--ToneNeutral">
                {event?.date} · {event?.place}
              </Caption>
              <Caption className="vkui--ToneNeutral">
                {Number(registration.seats) || 1} {plural(Number(registration.seats) || 1, 'место', 'места', 'мест')}
              </Caption>
              <Spacing size={20} />
              <div style={{ display: 'inline-block', padding: 12, background: '#fff', borderRadius: 16 }}>
                <QRCode value={`chipsony:V1:${registration.qr_token}`} size={200} />
              </div>
              <Spacing size={12} />
              <Caption className="vkui--ToneNeutral" style={{ wordBreak: 'break-all' }}>
                {registration.qr_token}
              </Caption>
            </Div>
          </Group>
          <Separator />
        </Div>
      ))}
    </Group>
  );
}