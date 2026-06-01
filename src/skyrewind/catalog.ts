import { DEG_TO_RAD, MAS_TO_RAD } from './math';
import type { Star, StarCatalogSource } from './types';

export const DEFAULT_STAR_CATALOG: StarCatalogSource = {
  id: 'hipparcos',
  name: 'Hipparcos Main Catalogue',
  url: './sky/hipparcos.csv',
};

export async function loadStarCatalog(source = DEFAULT_STAR_CATALOG): Promise<Star[]> {
  const response = await fetch(source.url);
  if (!response.ok) {
    throw new Error(`Unable to load star catalog ${source.url}: ${response.status} ${response.statusText}`);
  }

  return parseStarCatalogCsv(await response.text());
}

export function parseStarCatalogCsv(csv: string): Star[] {
  const lines = csv.split(/\r?\n/).filter(line => line.trim().length > 0 && !line.trim().startsWith('#'));
  const header = lines.shift()?.split(',').map(value => value.trim());
  if (!header) throw new Error('Star catalog is empty.');

  const indexes = {
    id: requiredIndex(header, 'id'),
    name: requiredIndex(header, 'name'),
    raDeg: requiredIndex(header, 'raDeg'),
    decDeg: requiredIndex(header, 'decDeg'),
    pmRaMasYr: requiredIndex(header, 'pmRaMasYr'),
    pmDecMasYr: requiredIndex(header, 'pmDecMasYr'),
    parallaxMas: requiredIndex(header, 'parallaxMas'),
    mag: requiredIndex(header, 'mag'),
    bv: header.indexOf('bv'),
  };

  return lines.map((line, index) => {
    const columns = splitCsvLine(line);
    const id = Number.parseInt(valueAt(columns, indexes.id, index), 10);
    const magnitude = Number.parseFloat(valueAt(columns, indexes.mag, index));
    if (!Number.isFinite(id) || !Number.isFinite(magnitude)) {
      throw new Error(`Invalid numeric value in star catalog row ${index + 2}.`);
    }

    const colorIndex = indexes.bv === -1 ? undefined : optionalNumberAt(columns, indexes.bv);
    return {
      id,
      name: valueAt(columns, indexes.name, index),
      ra: numberAt(columns, indexes.raDeg, index) * DEG_TO_RAD,
      dec: numberAt(columns, indexes.decDeg, index) * DEG_TO_RAD,
      pmRa: numberAt(columns, indexes.pmRaMasYr, index) * MAS_TO_RAD,
      pmDec: numberAt(columns, indexes.pmDecMasYr, index) * MAS_TO_RAD,
      parallax: numberAt(columns, indexes.parallaxMas, index) / 1000,
      magnitude,
      ...(colorIndex === undefined ? {} : { colorIndex }),
    };
  });
}

function requiredIndex(header: readonly string[], name: string): number {
  const index = header.indexOf(name);
  if (index === -1) throw new Error(`Star catalog missing "${name}" column.`);
  return index;
}

function numberAt(columns: readonly string[], index: number, rowIndex: number): number {
  const value = Number.parseFloat(valueAt(columns, index, rowIndex));
  if (!Number.isFinite(value)) throw new Error(`Invalid number in star catalog row ${rowIndex + 2}.`);
  return value;
}

function optionalNumberAt(columns: readonly string[], index: number): number | undefined {
  const raw = columns[index]?.trim();
  if (!raw) return undefined;
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : undefined;
}

function valueAt(columns: readonly string[], index: number, rowIndex: number): string {
  const value = columns[index];
  if (value === undefined) throw new Error(`Missing column in star catalog row ${rowIndex + 2}.`);
  return value.trim();
}

function splitCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }
    if (char === ',' && !quoted) {
      values.push(current);
      current = '';
      continue;
    }
    current += char;
  }

  values.push(current);
  return values;
}
