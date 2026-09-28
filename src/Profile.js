// src/profile.js
// Модуль личного профиля пользователя (Supabase)
import { createClient } from '@supabase/supabase-js';

// Клиент Supabase. В проекте, скорее всего, уже есть свой — тогда
// импортируйте его отсюда вместо создания нового.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Возвращает текущего авторизованного пользователя или null.
 */
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.warn('[profile] getCurrentUser:', error.message);
    return null;
  }
  return data?.user ?? null;
}

/**
 * Загружает профиль из таблицы `profiles`.
 * Если записи нет — создаёт её на основе данных auth-пользователя.
 */
export async function loadProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) throw new Error(`Не удалось загрузить профиль: ${error.message}`);
  if (data) return data;

  // Профиля ещё нет — создаём
  return createProfile(user);
}

/**
 * Создаёт запись профиля для пользователя.
 */
export async function createProfile(user) {
  const fallbackName =
    user.user_metadata?.full_name ||
    user.email?.split('@')[0] ||
    'Гость';

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      display_name: fallbackName,
      avatar_url: user.user_metadata?.avatar_url ?? null,
      phone: null,
      city: null,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(`Не удалось создать профиль: ${error.message}`);
  return data;
}

/**
 * Обновляет поля профиля.
 * @param {object} patch — например { display_name, phone, city }
 */
export async function updateProfile(patch) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Пользователь не авторизован');

  const { data, error } = await supabase
    .from('profiles')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw new Error(`Не удалось сохранить профиль: ${error.message}`);
  return data;
}

/**
 * Загружает аватар в бакет `avatars` и обновляет профиль.
 * @param {File} file
 */
export async function uploadAvatar(file) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Пользователь не авторизован');
  if (!file) throw new Error('Файл не выбран');
  if (file.size > 2 * 1024 * 1024) throw new Error('Аватар не больше 2 МБ');

  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
  const path = `${user.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, cacheControl: '3600' });

  if (uploadError) throw new Error(`Ошибка загрузки: ${uploadError.message}`);

  const { data: publicUrlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(path);

  const avatarUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;
  await updateProfile({ avatar_url: avatarUrl });
  return avatarUrl;
}

/**
 * Выход из аккаунта.
 */
export async function signOut() {
  await supabase.auth.signOut();
}