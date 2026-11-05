import type { FlagState } from '../../dialogue/types';
import { t } from '../../i18n';

/** One table at a siege's ovens or cauldron, and how fast hunger tells on it. */
export interface RationTable {
  /** Stored as the result when this table is given most. */
  id: string;
  name: () => string;
  /** Strength lost each week. */
  need: number;
  /** Strength at the start, 0..1. */
  strength: number;
}

/** A week: how many portions there are, and what is in the pot. */
export interface RationWeek {
  portions: (flags: FlagState) => number;
  pot: () => string;
}

/** One siege's stores: its scene key, the flag its result is kept in, its tables and its weeks. */
export interface RationStores {
  key: 'TabarsiRationGame' | 'ZanjanRationGame';
  resultFlag: string;
  tables: readonly RationTable[];
  weeks: readonly RationWeek[];
}

/**
 * Ṭabarsí, after Mullá Ḥusayn's death (chapter 8): Quddús asks the player to
 * share out what there is. What there was to eat, week by week, after
 * Nabíl: rice, the horses, saddles, grass, bones.
 */
export const TABARSI_STORES: RationStores = {
  key: 'TabarsiRationGame',
  resultFlag: 'ch8RationFavoured',
  tables: [
    { id: 'wounded', name: () => t('The wounded'), need: 0.24, strength: 0.45 },
    { id: 'watch', name: () => t('The watch on the walls'), need: 0.2, strength: 0.7 },
    { id: 'young', name: () => t('The youngest'), need: 0.16, strength: 0.6 },
  ],
  weeks: [
    { portions: f => (f.ch8GaveRice ? 11 : 8),
      pot: () => t('The last of the rice. A few grains in every pot.') },
    { portions: () => 8, pot: () => t('The horses, one by one.') },
    { portions: () => 6, pot: () => t('Saddles and harness, boiled until the leather can be chewed.') },
    { portions: () => 5, pot: () => t('Grass, gathered in the field when the guns fall quiet, and boiled.') },
    { portions: () => 4, pot: () => t('Bones, churned and boiled. Quddús calls them his meat.') },
  ],
};

/**
 * Zanján in the winter of 1850 (the fort of ʿAlí-Mardán Khán): Umm-i-Ashraf
 * and the women at the ovens share out the bread. After Nabíl (chapter
 * XXIV): Ḥujjat had the stores carried into the fort with the women and
 * children; as the siege went on the only food from outside came from a few
 * women who slipped up to the walls and sold what they had at a ruinous
 * price; the women baked the bread and nursed the sick and wounded; and the
 * last month of assaults was fought in great hunger. Women and children
 * were inside with the men, so the tables are the barricades, the sick and
 * wounded, and the children.
 */
export const ZANJAN_STORES: RationStores = {
  key: 'ZanjanRationGame',
  resultFlag: 'zjRationFavoured',
  tables: [
    { id: 'barricades', name: () => t('The barricades'), need: 0.2, strength: 0.7 },
    { id: 'wounded', name: () => t('The sick and wounded'), need: 0.24, strength: 0.4 },
    { id: 'children', name: () => t('The children'), need: 0.18, strength: 0.6 },
  ],
  weeks: [
    { portions: f => (f.zjHelpedWomen ? 10 : 8),
      pot: () => t('The wheat carried into the fort in the summer, ground at the hand-mill. Bread from the oven every morning.') },
    { portions: () => 7, pot: () => t('Less wheat. The mill turns slower, and the loaves come out thin.') },
    { portions: () => 6,
      pot: () => t('A woman slipped up to the wall by night and sold a sack of flour, at a price that would once have bought a house.') },
    { portions: () => 4, pot: () => t('Nothing came through the lines this week. Flour swept from the corners of the sacks.') },
    { portions: () => 4, pot: () => t('Snow on the barricades, and the guns day and night. What is left, baked thin and shared by the oven.') },
  ],
};
