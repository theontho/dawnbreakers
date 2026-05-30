import type { TranslationCatalog } from './i18n/types';
import { names as faNames, text as fa } from './i18n/locales/fa';
import { names as esNames, text as es } from './i18n/locales/es';
import { names as frNames, text as fr } from './i18n/locales/fr';
import { names as heNames, text as he } from './i18n/locales/he';
import { names as zhNames, text as zh } from './i18n/locales/zh';
import { names as jaNames, text as ja } from './i18n/locales/ja';
import { names as koNames, text as ko } from './i18n/locales/ko';

export const SUPPORTED_LOCALES = ['en', 'fa', 'es', 'fr', 'he', 'zh', 'ja', 'ko'] as const;

export type Locale = typeof SUPPORTED_LOCALES[number];

const LOCALE_STORAGE_KEY = 'dawnbreakers.locale';
const DEFAULT_LOCALE: Locale = 'fa';

interface LocaleConfig {
  name: string;
  shortName: string;
  direction: 'ltr' | 'rtl';
  fontStack?: string;
  digits?: readonly string[];
}

const FARSI_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'] as const;
const ARABIC_SCRIPT_FONT_STACK = 'Tahoma, Arial, "Noto Naskh Arabic", "Noto Sans Arabic", sans-serif';
const HEBREW_FONT_STACK = 'Arial, "Noto Sans Hebrew", sans-serif';
const CJK_FONT_STACK = 'Arial, "Noto Sans CJK SC", "Noto Sans CJK JP", "Noto Sans CJK KR", sans-serif';

export const LOCALE_CONFIGS: Record<Locale, LocaleConfig> = {
  en: { name: 'English', shortName: 'EN', direction: 'ltr' },
  fa: { name: 'فارسی', shortName: 'FA', direction: 'rtl', fontStack: ARABIC_SCRIPT_FONT_STACK, digits: FARSI_DIGITS },
  es: { name: 'Español', shortName: 'ES', direction: 'ltr' },
  fr: { name: 'Français', shortName: 'FR', direction: 'ltr' },
  he: { name: 'עברית', shortName: 'HE', direction: 'rtl', fontStack: HEBREW_FONT_STACK },
  zh: { name: '中文', shortName: '中文', direction: 'ltr', fontStack: CJK_FONT_STACK },
  ja: { name: '日本語', shortName: '日本', direction: 'ltr', fontStack: CJK_FONT_STACK },
  ko: { name: '한국어', shortName: '한국', direction: 'ltr', fontStack: CJK_FONT_STACK },
};

const isLocale = (value: string | null): value is Locale =>
  SUPPORTED_LOCALES.includes(value as Locale);

function readInitialLocale(): Locale {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }

  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(stored) ? stored : DEFAULT_LOCALE;
  } catch (error) {
    console.warn('Unable to read locale preference.', error);
    return DEFAULT_LOCALE;
  }
}

const isRtlLocale = (locale: Locale) => LOCALE_CONFIGS[locale].direction === 'rtl';

export let activeLocale: Locale = readInitialLocale();
export let rtl = isRtlLocale(activeLocale);

export function setLocale(locale: Locale): Locale {
  activeLocale = locale;
  rtl = isRtlLocale(locale);

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch (error) {
      console.warn('Unable to save locale preference.', error);
    }
  }

  applyLocaleDocument();
  return activeLocale;
}

export function toggleLocale(): Locale {
  const index = SUPPORTED_LOCALES.indexOf(activeLocale);
  return setLocale(SUPPORTED_LOCALES[(index + 1) % SUPPORTED_LOCALES.length]);
}

export function languageButtonLabel(): string {
  const index = SUPPORTED_LOCALES.indexOf(activeLocale);
  const nextLocale = SUPPORTED_LOCALES[(index + 1) % SUPPORTED_LOCALES.length];
  return LOCALE_CONFIGS[nextLocale].shortName;
}

type Params = Record<string, string | number>;

const catalogs: Record<Locale, TranslationCatalog> = {
  en: {},
  fa,
  es,
  fr,
  he,
  zh,
  ja,
  ko,
};

const namesByLocale: Record<Locale, TranslationCatalog> = {
  en: {},
  fa: faNames,
  es: esNames,
  fr: frNames,
  he: heNames,
  zh: zhNames,
  ja: jaNames,
  ko: koNames,
};

const speakWithTemplates: Record<Locale, string> = {
  en: 'Speak with {name}  [E]',
  fa: 'با {name} صحبت کن  [E]',
  es: 'Hablar con {name}  [E]',
  fr: 'Parler avec {name}  [E]',
  he: 'דבר עם {name}  [E]',
  zh: '与{name}交谈  [E]',
  ja: '{name}と話す  [E]',
  ko: '{name}와 대화  [E]',
};

export function applyLocaleDocument(): void {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = activeLocale;
  document.documentElement.dir = rtl ? 'rtl' : 'ltr';
}

export function formatNumber(value: number | string): string {
  const digits = LOCALE_CONFIGS[activeLocale].digits;
  if (!digits) {
    return String(value);
  }
  return String(value).replace(/\d/g, digit => digits[Number(digit)] ?? digit);
}

function interpolate(value: string, params?: Params): string {
  if (!params) return value;
  return value.replace(/\{(\w+)\}/g, (_, key: string) => {
    const param = params[key];
    return typeof param === 'number' ? formatNumber(param) : String(param ?? '');
  });
}

export function t(key: string, params?: Params): string {
  if (activeLocale === 'en') return interpolate(key, params);

  const speakMatch = key.match(/^Speak with (.+?)\s+\[E\]$/);
  if (speakMatch) {
    return interpolate(speakWithTemplates[activeLocale], {
      ...params,
      name: tName(speakMatch[1]),
    });
  }

  const catalog = catalogs[activeLocale];
  const names = namesByLocale[activeLocale];
  return interpolate(catalog[key] ?? names[key] ?? key, params);
}

export function tName(name: string): string {
  if (activeLocale === 'en') {
    return name;
  }
  return namesByLocale[activeLocale][name] ?? catalogs[activeLocale][name] ?? name;
}

export function chapterLabel(number: number): string {
  return t('Chapter {number}', { number });
}

export function localizedFont(fallback = 'Georgia, serif'): string {
  return LOCALE_CONFIGS[activeLocale].fontStack ?? fallback;
}

export function localizedStyle<T extends { fontFamily?: string; align?: string; rtl?: boolean }>(
  style: T,
  align: 'left' | 'center' | 'right' = 'right',
): T {
  return {
    ...style,
    fontFamily: localizedFont(style.fontFamily),
    align: rtl ? align : style.align,
    rtl,
  };
}

export function textOriginX(ltrOrigin: number): number {
  return rtl ? 1 - ltrOrigin : ltrOrigin;
}
