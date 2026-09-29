import { useEffect, useRef, useState } from 'react';
import { Avatar, Button, Caption, Div, Group, Header, Headline, Input, Separator, Spacing } from '@vkontakte/vkui';
import { Icon28CameraOutline } from '@vkontakte/icons';
import QrScanner from 'qr-scanner';
import { request } from '../lib/api';
import { plural } from '../lib/format';

const canCamera = typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia);

export function ScanStep() {
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [camera, setCamera] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const busyRef = useRef(false);

  const doScan = async (qr) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const res = await request('scan', { qr });
      setResult(res);
    } catch (err) {
      setError(err.message || 'Не получилось считать билет');
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!camera || !videoRef.current) return;
    const scanner = new QrScanner(videoRef.current, (out) => {
      scanner.destroy();
      setCamera(false);
      doScan(out.data);
    }, { returnDetailedScanResult: true });
    scanner.start().catch(() => {
      setCamera(false);
      setError('Не получилось открыть камеру — попробуй ввести код вручную');
    });
    const prev = scannerRef.current;
    scannerRef.current = scanner;
    return () => {
      if (prev) prev.destroy();
      scanner.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera]);

  const holder = result?.holder;
  const event = result?.event;

  return (
    <>
      <Group header={<Header mode="secondary">Считать QR-билет</Header>}>
        <Div>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Код из QR-кода гостя"
          />
          <Spacing size={12} />
          <Button
            size="l"
            mode="primary"
            stretched
            loading={busy}
            disabled={!input.trim()}
            onClick={() => doScan(input.trim())}
          >
            Считать
          </Button>
          {canCamera && (
            <>
              <Spacing size={8} />
              <Button size="l" mode="secondary" stretched before={<Icon28CameraOutline />} onClick={() => setCamera(true)}>
                Открыть камеру
              </Button>
            </>
          )}
        </Div>
      </Group>

      {camera && (
        <Group>
          <Div style={{ textAlign: 'center' }}>
            <video ref={videoRef} muted playsInline style={{ width: '100%', maxWidth: 360, borderRadius: 16 }} />
            <Caption className="vkui--ToneNeutral">Наведи на QR-код гостя</Caption>
          </Div>
        </Group>
      )}

      {error && (
        <Div>
          <Caption style={{ color: 'var(--color-text-negative, #E64646)' }}>{error}</Caption>
        </Div>
      )}

      {result && (
        <Group header={<Header mode="secondary">Билет</Header>}>
          <Div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Avatar size={56} src={holder?.avatar_url} />
              <div>
                <Headline weight="2">{holder?.display_name || 'Гость'}</Headline>
                <Caption className="vkui--ToneNeutral">VK ID: {result.ticket?.vk_user_id}</Caption>
              </div>
            </div>
            <Spacing size={12} />
            <Separator />
            <Spacing size={12} />
            <Headline level="2" weight="2">{event?.emoji} {event?.title}</Headline>
            <Spacing size={2} />
            <Caption className="vkui--ToneNeutral">{event?.date} · {event?.place}</Caption>
            <Spacing size={2} />
            <Caption className="vkui--ToneNeutral">
              {(Number(result.ticket?.seats) || 1)} {plural(Number(result.ticket?.seats) || 1, 'место', 'места', 'мест')}
            </Caption>
            <Spacing size={12} />
            {result.alreadyUsed ? (
              <Caption style={{ color: 'var(--color-text-negative, #E64646)' }}>
                Уже отмечен ранее{result.usedAt ? ` (${new Date(result.usedAt).toLocaleString()})` : ''}
              </Caption>
            ) : (
              <Headline level="3" style={{ color: '#2FA85C' }}>Гость прибыл — билет принят ✓</Headline>
            )}
          </Div>
        </Group>
      )}
    </>
  );
}