import { activeLocale } from '../../i18n';
import { GLOSSARY, type GlossaryEntry } from './entries';
import { LOCALE_FORMS, LOCALE_NOT_TERMS } from './localeForms';

export { GLOSSARY, type GlossaryEntry, type GlossaryKind } from './entries';

export interface GlossaryHit {
  start: number;
  end: number;
  entry: GlossaryEntry;
}

let cached: { locale: string; forms: Array<{ form: string; entry: GlossaryEntry }> } | undefined;

/** Every spelling to look for in the active language, longest first so "Mullá" never splits "Mullás". */
function forms(): Array<{ form: string; entry: GlossaryEntry }> {
  if (cached?.locale === activeLocale) return cached.forms;
  const out: Array<{ form: string; entry: GlossaryEntry }> = [];
  for (const entry of GLOSSARY) {
    const spellings = activeLocale === 'en' ? entry.match : LOCALE_FORMS[entry.id]?.[activeLocale as 'fa' | 'zh'] ?? [];
    for (const form of spellings) if (form) out.push({ form, entry });
  }
  out.sort((a, b) => b.form.length - a.form.length);
  cached = { locale: activeLocale, forms: out };
  return out;
}

const LETTER = /[\p{L}\p{M}]/u;

/**
 * Glossary words in one line of text. English and Farsi match whole words
 * only; Chinese has no spaces between words, so any occurrence counts.
 */
export function findGlossaryTerms(line: string): GlossaryHit[] {
  const wholeWords = activeLocale !== 'zh';
  const taken: boolean[] = [];
  /** Claims each free whole-word occurrence of `form`, calling `found` with its span. */
  const claim = (form: string, found: (start: number, end: number) => void): void => {
    let from = 0;
    for (;;) {
      const start = line.indexOf(form, from);
      if (start < 0) break;
      const end = start + form.length;
      from = end;
      if (wholeWords && (LETTER.test(line[start - 1] ?? '') || LETTER.test(line[end] ?? ''))) continue;
      let free = true;
      for (let i = start; i < end; i++) if (taken[i]) free = false;
      if (!free) continue;
      for (let i = start; i < end; i++) taken[i] = true;
      found(start, end);
    }
  };
  if (activeLocale !== 'en') for (const phrase of LOCALE_NOT_TERMS[activeLocale as 'fa' | 'zh'] ?? []) claim(phrase, () => {});
  const hits: GlossaryHit[] = [];
  for (const { form, entry } of forms()) claim(form, (start, end) => hits.push({ start, end, entry }));
  return hits.sort((a, b) => a.start - b.start);
}
