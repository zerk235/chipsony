import { useEffect, useState } from 'react';
import { Button, Caption, Div, Group, Header, Headline, Placeholder, Spacing } from '@vkontakte/vkui';
import { Icon28TicketOutline } from '@vkontakte/icons';
import QRCode from 'react-qr-code';
import { plural } from '../lib/format';
import { request } from '../lib/api';
import { SkeletonList } from './SkeletonCard';

export function MyTickets() {
  const [tickets, setTickets] = useState(null);
  const [error, setError] = useState('');
  const [opened, setOpened] = useState({});

  const load = async () => {
    setError('');
    try {
      const res = await request('tickets');
      setTickets(res.tickets ?? []);
    } catch (err) {
      setError(err.message || 'Не получилось загрузить билеты');
      setTickets([]);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (tickets === null) {
    return (
      <Group>
        <SkeletonList rows={2} />
      </Group>
    );
  }

  if (!tickets.length) {
    return (
      <Group>
        <Placeholder icon={<Icon28TicketOutline width={64} height={64} />} header="Пока нет билетов">
          Зарегистрируйся на событие из афиши — билет появится здесь с QR-кодом.
        </Placeholder>
        {error && (
          <Div>
            <Caption style={{ color: 'var(--color-text-negative, #E64646)' }}>{error}</Caption>
          </Div>
        )}
      </Group>
    );
  }

  return (
    <>
      {error && (
        <Div>
          <Caption style={{ color: 'var(--color-text-negative, #E64646)' }}>{error}</Caption>
        </Div>
      )}
      {tickets.map((ticket) => {
        const event = ticket.events;
        const seats = Number(ticket.seats) || 1;
        const open = Boolean(opened[ticket.id]);
        return (
          <Group key={ticket.id} header={<Header mode="secondary">{event?.title || 'Событие'}</Header>}>
            <Div>
              <Headline level="2" weight="2" style={{ color: 'var(--vkui--color_text_accent)' }}>
                {event?.emoji} {event?.title}
              </Headline>
              <Spacing size={4} />
              <Caption className="vkui--ToneNeutral">
                {event?.date} · {event?.place}
              </Caption>
              <Spacing size={4} />
              <Caption className="vkui--ToneNeutral">
                {seats} {plural(seats, 'место', 'места', 'мест')}
              </Caption>
              <Spacing size={12} />
              {open ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'inline-block', padding: 12, background: '#fff', borderRadius: 16 }}>
                    <QRCode value={`chipsony:V1:${ticket.qr_token}`} size={200} />
                  </div>
                  <Spacing size={12} />
                  <Caption className="vkui--ToneNeutral" style={{ wordBreak: 'break-all' }}>
                    {ticket.qr_token}
                  </Caption>
                </div>
              ) : (
                <Button size="l" mode="secondary" stretched onClick={() => setOpened((o) => ({ ...o, [ticket.id]: true }))}>
                  Показать QR-билет
                </Button>
              )}
            </Div>
          </Group>
        );
      })}
    </>
  );
}