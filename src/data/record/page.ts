import type { FlagState } from '../../dialogue/types';
import { heededCount } from '../../dialogue/voices';
import { CHAPTER_COMPLETION_FLAGS } from '../chapters';
import { ALL_CLAIMS, claimById, hasHeard, heardAccounts, written } from './keys';
import type { Account, Claim } from './types';

/** What the record page offers for one claim, worked out from the flags. */
export interface PageOption {
  /** An account id, 'both' or 'withheld'. */
  choice: string;
  account?: Account;
}

export function pageOptions(claim: Claim, f: FlagState): PageOption[] {
  const heard = heardAccounts(f, claim);
  const options: PageOption[] = heard.map(account => ({ choice: account.id, account }));
  if (heard.length >= 2) options.push({ choice: 'both' });
  if (claim.withheld && heard.length >= 1) options.push({ choice: 'withheld' });
  return options;
}

/** The record is sealed once its chapter is complete. */
export const sealed = (claim: Claim, f: FlagState): boolean => !!f[CHAPTER_COMPLETION_FLAGS[claim.chapter]];

/**
 * Whether "sure" may be written. Once the pilgrim has heeded doubt, one
 * voice is not enough: only what they saw, or an account another heard
 * account bears out, may be written as sure. Recording the disagreement
 * itself is always sure-able: the disagreement is a fact.
 */
export function sureAllowed(claim: Claim, choice: string, f: FlagState): boolean {
  if (heededCount(f, 'doubt') === 0 || choice === 'both') return true;
  const account = claim.accounts.find(a => a.id === choice);
  if (!account) return false;
  if (account.provenance === 'saw') return true;
  return (account.agrees ?? []).some(id => hasHeard(f, claim.id, id));
}

/** Claims worth a page in the journal: anything heard or written, current chapters first. */
export function claimsWithKnowledge(f: FlagState): string[] {
  return ALL_CLAIMS.filter(c => heardAccounts(f, c).length > 0 || !!written(f, c.id)).map(c => c.id);
}

/** The claims of a chapter the player has started gathering for. */
export const chapterClaims = (chapter: Claim['chapter']): string[] =>
  ALL_CLAIMS.filter(c => c.chapter === chapter).map(c => c.id);

export { claimById };
