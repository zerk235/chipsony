import { Button, Caption, Group, Placeholder, Spacing, Title } from '@vkontakte/vkui';
import { Icon28CheckCircleOutline } from '@vkontakte/icons';
import { BRAND_COLOR, money, primaryStyle } from '../lib/format';

export function SuccessStep({ totalCount, total, platform, onReset }) {
  const orderId = 'CHIPS-' + String(Math.floor(100000 + Math.random() * 900000));

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
        <div style={{ textAlign: 'center' }}>
          <Title level="3" weight="2">{orderId}</Title>
          <Spacing size={8} />
          <Caption className="vkui--ToneNeutral">
            {totalCount} билета · {money(total)}
          </Caption>
        </div>
      </Placeholder>
    </Group>
  );
}
