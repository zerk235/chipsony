import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Avatar,
  Button,
  Caption,
  Div,
  FormItem,
  Group,
  Header,
  Input,
  Spinner,
  Text,
} from '@vkontakte/vkui';
import { Icon28CameraOutline, Icon28RefreshOutline } from '@vkontakte/icons';
import { isProfileConfigured, loadProfile, updateProfile, uploadAvatar } from '../Profile';
import '../Profile.css';

export function ProfileStep() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ display_name: '', phone: '', city: '' });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const configured = isProfileConfigured();

  const apply = (next) => {
    setProfile(next);
    if (next) {
      setForm({
        display_name: next.display_name || '',
        phone: next.phone || '',
        city: next.city || '',
      });
    }
  };

  const fetchProfile = async () => {
    if (!configured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      apply(await loadProfile());
    } catch (err) {
      setStatus({ kind: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured]);

  const save = async () => {
    setSaving(true);
    setStatus(null);
    try {
      apply(await updateProfile(form));
      setStatus({ kind: 'success', text: 'Сохранено' });
    } catch (err) {
      setStatus({ kind: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const pickAvatar = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setUploading(true);
    setStatus(null);
    try {
      apply(await uploadAvatar(file));
      setStatus({ kind: 'success', text: 'Аватар обновлён' });
    } catch (err) {
      setStatus({ kind: 'error', text: err.message });
    } finally {
      setUploading(false);
    }
  };

  if (!configured) {
    return (
      <Group header={<Header mode="secondary">Профиль</Header>}>
        <Alert mode="info" header="Ещё не подключено">
          Профиль заработает, как только в настройках сборки появится адрес Supabase-проекта
          (VITE_SUPABASE_URL). Данные и код для этого уже готовы.
        </Alert>
      </Group>
    );
  }

  return (
    <div className="profile">
      <Group header={<Header mode="secondary">Профиль</Header>}>
        {loading && (
          <Div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
            <Spinner size="m" />
          </Div>
        )}

        {!loading && profile && (
          <>
            <div className="profile__avatar">
              <Avatar
                size={80}
                src={profile.avatar_url || undefined}
                aria-label="Аватар"
                className="profile__avatar-img"
              />
              <div>
                <Text weight="semibold" style={{ display: 'block' }}>
                  {profile.display_name || 'Гость'}
                </Text>
                <Caption className="vkui--ToneSecondary" style={{ display: 'block', marginTop: 4 }}>
                  VK ID {profile.vk_user_id}
                </Caption>
                <Button
                  size="s"
                  mode="secondary"
                  className="profile__avatar-upload"
                  before={<Icon28CameraOutline />}
                  loading={uploading}
                  onClick={() => fileRef.current?.click()}
                >
                  Сменить фото
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={pickAvatar}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          </>
        )}

        {!loading && !profile && (
          <Alert mode="warning" header="Профиль не загрузился">
            {status?.text || 'Проверь подключение Supabase и попробуй ещё раз.'}
            <div style={{ marginTop: 12 }}>
              <Button size="s" mode="secondary" before={<Icon28RefreshOutline />} onClick={fetchProfile}>
                Повторить
              </Button>
            </div>
          </Alert>
        )}
      </Group>

      {profile && (
        <Group header={<Header mode="secondary">О себе</Header>}>
          <div className="profile__form">
            <div className="field">
              <label className="field__label" htmlFor="profile-name">
                Имя
              </label>
              <FormItem id="profile-name">
                <Input
                  value={form.display_name}
                  maxLength={60}
                  onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
                />
              </FormItem>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="profile-phone">
                Телефон
              </label>
              <FormItem id="profile-phone">
                <Input
                  value={form.phone}
                  type="tel"
                  maxLength={30}
                  placeholder="+7 900 000-00-00"
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </FormItem>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="profile-city">
                Город
              </label>
              <FormItem id="profile-city">
                <Input
                  value={form.city}
                  maxLength={60}
                  placeholder="Москва"
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                />
              </FormItem>
            </div>

            <div className="profile__actions">
              <Button size="l" mode="primary" stretched loading={saving} onClick={save}>
                Сохранить
              </Button>
            </div>
          </div>
        </Group>
      )}

      {status && profile && (
        <div className={`profile__status vkui--Tone${status.kind === 'error' ? 'Negative' : 'Positive'}`}>
          {status.text}
        </div>
      )}

      {profile?.created_at && (
        <Caption className="vkui--ToneSecondary" style={{ display: 'block', marginTop: 12 }}>
          В проекте с {new Date(profile.created_at).toLocaleDateString('ru-RU')}
        </Caption>
      )}
    </div>
  );
}
