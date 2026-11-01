import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, rename, rm, stat } from 'node:fs/promises';
import http from 'node:http';
import https from 'node:https';
import path from 'node:path';
import readline from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const HIPPARCOS_URL = 'https://cdsarc.cds.unistra.fr/ftp/I/239/hip_main.dat';
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..');
const RAW_PATH = path.join(REPO_ROOT, 'tmp', 'hip_main.dat');
const OUTPUT_PATH = path.join(REPO_ROOT, 'data', 'sky', 'hipparcos.csv');
const args = new Set(process.argv.slice(2));

await main();

async function main() {
  await mkdir(path.dirname(RAW_PATH), { recursive: true });
  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });

  if (args.has('--refresh') || !(await existsWithContent(RAW_PATH))) {
    await downloadFile(HIPPARCOS_URL, RAW_PATH);
  } else {
    console.log(`Using cached Hipparcos source at ${relativePath(RAW_PATH)}`);
  }

  const { converted, skipped } = await convertCatalog(RAW_PATH, OUTPUT_PATH);
  console.log(`Wrote ${converted.toLocaleString()} Hipparcos stars to ${relativePath(OUTPUT_PATH)}`);
  if (skipped > 0) {
    console.log(`Skipped ${skipped.toLocaleString()} records without usable RA, Dec, or magnitude.`);
  }
}

async function existsWithContent(filePath) {
  try {
    const fileStat = await stat(filePath);
    return fileStat.isFile() && fileStat.size > 0;
  } catch (error) {
    if (error?.code === 'ENOENT') return false;
    throw error;
  }
}

async function downloadFile(url, destination) {
  const tempPath = `${destination}.part`;
  await rm(tempPath, { force: true });
  console.log(`Downloading ${url} to ${relativePath(destination)}`);

  try {
    await downloadToTemp(url, tempPath);
    await rename(tempPath, destination);
  } catch (error) {
    await rm(tempPath, { force: true });
    throw error;
  }
}

async function downloadToTemp(url, tempPath, redirects = 0) {
  if (redirects > 5) {
    throw new Error(`Too many redirects while downloading ${url}`);
  }

  await new Promise((resolve, reject) => {
    const request = makeRequest(url, response => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume();
        const redirectedUrl = new URL(response.headers.location, url).toString();
        downloadToTemp(redirectedUrl, tempPath, redirects + 1).then(resolve, reject);
        return;
      }

      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`Download failed with HTTP ${response.statusCode}: ${url}`));
        return;
      }

      const output = createWriteStream(tempPath);
      response.pipe(output);
      output.on('finish', () => output.close(resolve));
      output.on('error', reject);
    });

    request.on('error', reject);
  });
}

function makeRequest(url, handler) {
  const client = url.startsWith('https:') ? https : http;
  return client.get(url, handler);
}

async function convertCatalog(inputPath, outputPath) {
  const tempPath = `${outputPath}.part`;
  const input = createReadStream(inputPath, { encoding: 'utf8' });
  const lines = readline.createInterface({ input, crlfDelay: Infinity });
  const output = createWriteStream(tempPath, { encoding: 'utf8' });

  output.write('# Hipparcos Main Catalogue converted from CDS I/239 hip_main.dat (ESA 1997).\n');
  output.write(`# Source kept locally at tmp/hip_main.dat; upstream: ${HIPPARCOS_URL}\n`);
  output.write('# Contains all Hipparcos records with usable RA, Dec, and magnitude.\n');
  output.write('# Columns: id,name,raDeg,decDeg,pmRaMasYr,pmDecMasYr,parallaxMas,mag,bv\n');
  output.write('id,name,raDeg,decDeg,pmRaMasYr,pmDecMasYr,parallaxMas,mag,bv\n');

  let converted = 0;
  let skipped = 0;
  try {
    for await (const line of lines) {
      const star = parseHipparcosLine(line);
      if (!star) {
        skipped += 1;
        continue;
      }

      output.write([
        star.id,
        csvValue(`HIP ${star.id}`),
        star.raDeg.toFixed(8),
        star.decDeg.toFixed(8),
        star.pmRaMasYr.toFixed(2),
        star.pmDecMasYr.toFixed(2),
        star.parallaxMas.toFixed(2),
        star.mag.toFixed(3),
        star.bv === undefined ? '' : star.bv.toFixed(3),
      ].join(','));
      output.write('\n');
      converted += 1;
    }
  } catch (error) {
    await rm(tempPath, { force: true });
    throw error;
  } finally {
    input.close();
    output.end();
  }

  await waitForStream(output);
  await rename(tempPath, outputPath);
  return { converted, skipped };
}

function parseHipparcosLine(line) {
  const id = parseRequiredInteger(field(line, 9, 14));
  const mag = parseOptionalNumber(field(line, 42, 46));
  const raDeg = parseOptionalNumber(field(line, 52, 63));
  const decDeg = parseOptionalNumber(field(line, 65, 76));
  if (id === undefined || mag === undefined || raDeg === undefined || decDeg === undefined) {
    return undefined;
  }

  return {
    id,
    raDeg,
    decDeg,
    pmRaMasYr: parseOptionalNumber(field(line, 88, 95)) ?? 0,
    pmDecMasYr: parseOptionalNumber(field(line, 97, 104)) ?? 0,
    parallaxMas: parseOptionalNumber(field(line, 80, 86)) ?? 0,
    mag,
    bv: parseOptionalNumber(field(line, 246, 251)),
  };
}

function field(line, startInclusive, endInclusive) {
  return line.slice(startInclusive - 1, endInclusive).trim();
}

function parseRequiredInteger(raw) {
  if (raw.length === 0) return undefined;
  const value = Number.parseInt(raw, 10);
  return Number.isInteger(value) ? value : undefined;
}

function parseOptionalNumber(raw) {
  if (raw.length === 0) return undefined;
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : undefined;
}

function csvValue(value) {
  if (!/[",\n\r]/.test(value)) return value;
  return `"${value.replaceAll('"', '""')}"`;
}

function waitForStream(stream) {
  return new Promise((resolve, reject) => {
    if (stream.closed) {
      resolve();
      return;
    }
    stream.on('close', resolve);
    stream.on('error', reject);
  });
}

function relativePath(filePath) {
  return path.relative(REPO_ROOT, filePath);
}
