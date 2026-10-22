/**
 * The shape of a glossary entry and the helpers the entry lists are written
 * with. Each entry lists the English spellings to match; the Farsi and
 * Chinese spellings live in `localeForms.ts`, and `title`/`body` are
 * translated through the catalogs like any other text.
 */

export type GlossaryKind = 'term' | 'person' | 'place' | 'region';

export interface GlossaryEntry {
  id: string;
  kind: GlossaryKind;
  title: string;
  body: string;
  /** English spellings to match, exactly as the text writes them. */
  match: readonly string[];
  /** Longitude and latitude, for places. */
  at?: readonly [number, number];
  /** Province outline id in `mapData.ts`, for regions. */
  region?: string;
}

export const term = (id: string, title: string, match: readonly string[], body: string): GlossaryEntry =>
  ({ id, kind: 'term', title, body, match });
export const person = (id: string, title: string, match: readonly string[], body: string): GlossaryEntry =>
  ({ id, kind: 'person', title, body, match });
export const place = (id: string, title: string, at: readonly [number, number], body: string, match: readonly string[] = [title]): GlossaryEntry =>
  ({ id, kind: 'place', title, body, match, at });
export const region = (id: string, title: string, body: string, match: readonly string[] = [title]): GlossaryEntry =>
  ({ id, kind: 'region', title, body, match, region: id });
