import type { FlagState } from '../../dialogue/types';
import { CH8_CLAIMS } from './claims08';
import type { Account, Claim, Confidence, Written } from './types';

/** Every chapter's claims, in story order. */
export const ALL_CLAIMS: readonly Claim[] = [...CH8_CLAIMS];

const byId = new Map(ALL_CLAIMS.map(c => [c.id, c]));

export function claimById(id: string): Claim {
  const claim = byId.get(id);
  if (!claim) throw new Error(`Unknown record claim: ${id}`);
  return claim;
}

export function accountOf(claimId: string, accountId: string): Account {
  const account = claimById(claimId).accounts.find(a => a.id === accountId);
  if (!account) throw new Error(`Unknown account '${accountId}' for record claim ${claimId}`);
  return account;
}

/**
 * The flag that says the player has heard `account` on `claim`. Throws on a
 * typo, so a dialogue naming a claim or account that does not exist fails
 * as soon as the game loads.
 */
export function heard(claim: string, account: string): string {
  accountOf(claim, account);
  return `heard:${claim}:${account}`;
}

export const recKey = (claim: string): string => `rec:${claim}`;
export const confKey = (claim: string): string => `conf:${claim}`;

export const hasHeard = (f: FlagState, claim: string, account: string): boolean =>
  f[`heard:${claim}:${account}`] === true;

export const heardAccounts = (f: FlagState, claim: Claim): Account[] =>
  claim.accounts.filter(a => hasHeard(f, claim.id, a.id));

export function written(f: FlagState, claimId: string): Written | undefined {
  const choice = f[recKey(claimId)];
  if (typeof choice !== 'string') return undefined;
  const confidence = f[confKey(claimId)];
  return { choice, confidence: typeof confidence === 'string' ? confidence as Confidence : undefined };
}
