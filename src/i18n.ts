import type { TranslationCatalog } from './i18n/types';

/**
 * Three languages chosen to exercise the interface's hard cases: a Latin
 * script, a right-to-left joined script with its own digits (Persian), and
 * a CJK script with no spaces between words (Chinese).
 */
export const SUPPORTED_LOCALES = ['en', 'fa', 'zh'] as const;

export type Locale = typeof SUPPORTED_LOCALES[number];

const LOCALE_STORAGE_KEY = 'dawnbreakers.locale';
const DEFAULT_LOCALE: Locale = 'en';

interface LocaleConfig {
  name: string;
  shortName: string;
  direction: 'ltr' | 'rtl';
  fontStack?: string;
  digits?: readonly string[];
}

const FARSI_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'] as const;
const ARABIC_SCRIPT_FONT_STACK = 'Tahoma, Arial, "Noto Naskh Arabic", "Noto Sans Arabic", sans-serif';
const CJK_FONT_STACK = 'Arial, "Noto Sans CJK SC", "PingFang SC", "Microsoft YaHei", sans-serif';
const MAX_TEXT_RESOLUTION = 2;

export const LOCALE_CONFIGS: Record<Locale, LocaleConfig> = {
  en: { name: 'English', shortName: 'EN', direction: 'ltr' },
  fa: { name: 'فارسی', shortName: 'FA', direction: 'rtl', fontStack: ARABIC_SCRIPT_FONT_STACK, digits: FARSI_DIGITS },
  zh: { name: '中文', shortName: '中文', direction: 'ltr', fontStack: CJK_FONT_STACK },
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

/**
 * Switches language once its catalog has loaded, so nothing repaints in the
 * English fallback while the catalog is still on its way.
 */
export async function setLocale(locale: Locale): Promise<Locale> {
  await loadLocale(locale);
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

export function languageButtonLabel(): string {
  const index = SUPPORTED_LOCALES.indexOf(activeLocale);
  const nextLocale = SUPPORTED_LOCALES[(index + 1) % SUPPORTED_LOCALES.length]!;
  return LOCALE_CONFIGS[nextLocale].shortName;
}

type Params = Record<string, string | number>;

const EMPTY_CATALOG: TranslationCatalog = {};
const catalogs: Record<Locale, TranslationCatalog> = { en: EMPTY_CATALOG, fa: EMPTY_CATALOG, zh: EMPTY_CATALOG };
const namesByLocale: Record<Locale, TranslationCatalog> = { en: EMPTY_CATALOG, fa: EMPTY_CATALOG, zh: EMPTY_CATALOG };

const localeLoaders: Record<Exclude<Locale, 'en'>, () => Promise<{ text: TranslationCatalog; names: TranslationCatalog }>> = {
  fa: () => import('./i18n/locales/fa'),
  zh: () => import('./i18n/locales/zh'),
};

const inFlight = new Map<Locale, Promise<void>>();

/**
 * Lazy-load a locale catalog. Idempotent: subsequent calls reuse the same
 * Promise. English is a no-op (the catalog is the identity).
 *
 * Boot must `await loadLocale(activeLocale)` before any scene calls `t()`,
 * otherwise non-english locales render their english keys until the import
 * resolves.
 */
export async function loadLocale(locale: Locale): Promise<void> {
  if (locale === 'en' || catalogs[locale] !== EMPTY_CATALOG) return;
  const existing = inFlight.get(locale);
  if (existing) return existing;
  const loader = localeLoaders[locale];
  const promise = loader().then(mod => {
    catalogs[locale] = mod.text;
    namesByLocale[locale] = mod.names;
  });
  inFlight.set(locale, promise);
  return promise;
}

const speakWithTemplates: Record<Locale, string> = {
  en: 'Speak with {name}  [E]',
  fa: 'با {name} صحبت کن  [E]',
  zh: '与{name}交谈  [E]',
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
      name: tName(speakMatch[1]!),
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

function textResolution(): number {
  if (typeof window === 'undefined') return 1;
  return Math.min(MAX_TEXT_RESOLUTION, Math.max(1, window.devicePixelRatio || 1));
}

/**
 * True for a script with no spaces between words (Chinese), where wrapped
 * text must break between characters: pass it as `setWordWrapWidth`'s
 * second argument, which otherwise turns that off.
 */
export function wrapsBetweenCharacters(): boolean {
  return activeLocale === 'zh';
}

export function localizedStyle<T extends { fontFamily?: string; align?: string; rtl?: boolean; resolution?: number; wordWrap?: { width?: number; useAdvancedWrap?: boolean } }>(
  style: T,
  align: 'left' | 'center' | 'right' = 'right',
): T {
  return {
    ...style,
    fontFamily: localizedFont(style.fontFamily),
    align: rtl ? align : style.align,
    rtl,
    resolution: style.resolution ?? textResolution(),
    // Chinese has no spaces to break at: Phaser's advanced wrap breaks a
    // line between characters once it runs out of spaces.
    ...(style.wordWrap && wrapsBetweenCharacters() ? { wordWrap: { ...style.wordWrap, useAdvancedWrap: true } } : {}),
  };
}

export function textOriginX(ltrOrigin: number): number {
  return rtl ? 1 - ltrOrigin : ltrOrigin;
}
