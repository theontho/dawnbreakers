import { BADASHT } from './places/badasht';
import { BAGHDAD } from './places/baghdad';
import { ISFAHAN } from './places/isfahan';
import { KARBILA } from './places/karbila';
import { KASHAN } from './places/kashan';
import { MAKU } from './places/maku';
import { MECCA } from './places/mecca';
import { NAYRIZ } from './places/nayriz';
import { QAZVIN } from './places/qazvin';
import { QURAN_GATE } from './places/quranGate';
import { SHIRAZ } from './places/shiraz';
import { TABARSI } from './places/tabarsi';
import { TABRIZ } from './places/tabriz';
import { TEHRAN } from './places/tehran';
import { ZANJAN } from './places/zanjan';
import type { Vista, VistaId } from './types';

const VISTAS: Record<VistaId, Vista> = {
  karbila: KARBILA,
  shiraz: SHIRAZ,
  'quran-gate': QURAN_GATE,
  tehran: TEHRAN,
  mecca: MECCA,
  baghdad: BAGHDAD,
  isfahan: ISFAHAN,
  kashan: KASHAN,
  maku: MAKU,
  qazvin: QAZVIN,
  badasht: BADASHT,
  tabriz: TABRIZ,
  tabarsi: TABARSI,
  nayriz: NAYRIZ,
  zanjan: ZANJAN,
};

export function vistaFor(id: VistaId): Vista {
  return VISTAS[id];
}
