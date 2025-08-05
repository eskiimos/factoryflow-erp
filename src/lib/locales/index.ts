import { ru } from './ru';

export const locales = {
  ru
};

export type Locale = keyof typeof locales;
export type Translation = typeof ru;

export const defaultLocale: Locale = 'ru';

export const localeNames: Record<Locale, string> = {
  ru: 'Русский'
};
