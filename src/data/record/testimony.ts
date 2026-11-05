import type { FlagState } from '../../dialogue/types';
import { ALL_CLAIMS, accountOf, claimById, heardAccounts, written } from './keys';
import type { Confidence, Line } from './types';

/**
 * The record read back as testimony on the exile road (chapter 10): the
 * player chooses up to three things to tell, each said as it was written.
 */

const CONFIDENCE: Record<Confidence, Line> = {
  sure: { text: 'I am sure of it.' },
  likely: { text: 'So I believe.' },
  unsure: { text: 'I could not settle it.' },
};

/** At most this many things are told before the road. */
export const TESTIMONY_MAX = 3;

export const toldKey = (claim: string): string => `told:${claim}`;

export const toldCount = (f: FlagState): number => ALL_CLAIMS.filter(c => !!f[toldKey(c.id)]).length;

/** The claim is written down and not yet told. */
export const canTell = (claim: string) => (f: FlagState): boolean =>
  !!written(f, claim) && !f[toldKey(claim)] && toldCount(f) < TESTIMONY_MAX;

export const anyToTell = (f: FlagState): boolean => ALL_CLAIMS.some(c => canTell(c.id)(f));

/** The written sentence for a claim, then how sure the player was. */
export function recordLines(claimId: string, f: FlagState): string[] {
  const claim = claimById(claimId);
  const entry = written(f, claimId);
  if (!entry) return [claim.unheard.text];
  if (entry.choice === 'withheld') return [claim.withheld?.text ?? claim.unheard.text];
  const first = entry.choice === 'both' ? claim.both.text : accountOf(claimId, entry.choice).text;
  return entry.confidence ? [first, CONFIDENCE[entry.confidence].text] : [first];
}

export const confidenceLine = (c: Confidence): string => CONFIDENCE[c].text;

const KEPT: Line = { text: 'One thing you do not say. Quddús asked it, and you kept it.' };
const GAPS: Line = { text: 'Some of it you did not see. You say so, and leave room for those who did.' };
const FULL: Line = { text: 'What you saw, you say. What you were told, you say who told it.' };

/** 'kept' if anything was withheld, 'gaps' if two or more questions went unheard, else 'full'. */
export function testimonyState(f: FlagState): 'kept' | 'gaps' | 'full' {
  if (ALL_CLAIMS.some(c => written(f, c.id)?.choice === 'withheld')) return 'kept';
  const unheard = ALL_CLAIMS.filter(c => heardAccounts(f, c).length === 0).length;
  return unheard >= 2 ? 'gaps' : 'full';
}

export function closingLines(f: FlagState): string[] {
  const state = testimonyState(f);
  const unheard = ALL_CLAIMS.filter(c => heardAccounts(f, c).length === 0).length;
  if (state === 'kept') return unheard >= 2 ? [KEPT.text, GAPS.text] : [KEPT.text];
  return [state === 'gaps' ? GAPS.text : FULL.text];
}
