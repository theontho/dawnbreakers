import Phaser from 'phaser';
import { playSfx } from '../audio';
import {
  claimById, claimsWithKnowledge, confKey, pageOptions, recKey, sealed, sureAllowed, written,
  type Claim, type Confidence, type PageOption, type Provenance,
} from '../data/record';
import { applyEffect, getFlags } from '../dialogue/flags';
import type { FlagState } from '../dialogue/types';
import { VOICE_STYLE } from '../dialogue/voices';
import { formatNumber, localizedStyle, rtl, t, textOriginX, tName } from '../i18n';
import { buttonFont, MIN_TOUCH_TARGET, responsiveFont, restartSceneOnResize, safeLayout } from '../ui/responsive';

export interface RecordLaunch {
  /** Claim ids to page through; every claim the player knows something of when omitted. */
  claims?: string[];
  /** Called when the player closes the record. */
  onFinish?: () => void;
  /** The page to open on. */
  page?: number;
}

const GOLD = '#f3d98a';
const INK = '#e8d9b0';
const DIM = '#9c8458';
const PICKED = 0xf3d98a;

/**
 * The chronicler's record (docs/design/chronicler.md): one question a page.
 * For each, the player chooses whose account to write, or both, or (where
 * silence is a real choice) to leave it unwritten, and how sure they are.
 * Sealed once the chapter ends.
 */
export class RecordScene extends Phaser.Scene {
  private claims: string[] = [];
  private page = 0;
  private onFinish?: () => void;

  constructor() {
    super('Record');
  }

  init(data: RecordLaunch): void {
    this.claims = data.claims && data.claims.length > 0 ? data.claims : claimsWithKnowledge(getFlags());
    this.onFinish = data.onFinish;
    this.page = Math.min(data.page ?? 0, Math.max(0, this.claims.length - 1));
  }

  create(): void {
    playSfx('journal');
    restartSceneOnResize(this, () => ({ claims: this.claims, onFinish: this.onFinish, page: this.page }));
    this.draw();
    this.input.keyboard?.on('keydown-ESC', () => this.close());
    this.input.keyboard?.on('keydown-RIGHT', () => this.turn(1));
    this.input.keyboard?.on('keydown-LEFT', () => this.turn(-1));
  }

  private turn(by: number): void {
    const next = this.page + by;
    if (next < 0 || next >= this.claims.length) return;
    this.page = next;
    playSfx('uiHover');
    this.draw();
  }

  private close(): void {
    const cb = this.onFinish;
    this.scene.stop();
    if (cb) cb();
  }

  private draw(): void {
    for (const child of this.children.getAll()) child.destroy();
    const { width, height } = this.scale;
    const size = { width, height };
    const safe = safeLayout(size);
    const flags = getFlags();
    this.add.rectangle(0, 0, width, height, 0x000000, 0.65).setOrigin(0);
    this.add.rectangle(safe.x, safe.y, safe.width, safe.height, 0x1a120a, 0.97).setOrigin(0).setStrokeStyle(2, 0xc9a55c, 1);

    const pad = width <= 480 ? 14 : 24;
    const left = safe.x + pad;
    const right = safe.right - pad;
    const textW = right - left;
    const x = rtl ? right : left;
    const origin = textOriginX(0);
    const text = (y: number, value: string, size_: number, color: string, extra: object = {}) =>
      this.add.text(x, y, value, localizedStyle({
        fontFamily: 'Georgia, serif', fontSize: responsiveFont(size_, size, Math.min(size_, 12)), color,
        wordWrap: { width: textW }, lineSpacing: 3, ...extra,
      })).setOrigin(origin, 0);

    let y = safe.y + 14;
    text(y, t('Your record'), 26, GOLD);
    this.button(rtl ? safe.x + pad : right, y, t('Close'), () => this.close(), rtl ? 0 : 1, size);
    y += 44;

    if (this.claims.length === 0) {
      text(y, t('You have written nothing yet. Listen first.'), 17, DIM, { fontStyle: 'italic' });
      return;
    }
    const claim = claimById(this.claims[this.page]!);
    const isSealed = sealed(claim, flags);
    text(y, t('{n} of {total}', { n: formatNumber(this.page + 1), total: formatNumber(this.claims.length) })
      + (isSealed ? `  ·  ${t('Sealed when the chapter ended')}` : ''), 13, DIM, { fontStyle: 'italic' });
    y += 24;
    y += text(y, t(claim.title), 21, GOLD).height + 12;

    const options = pageOptions(claim, flags);
    const entry = written(flags, claim.id);
    if (options.length === 0) {
      y += text(y, t(claim.unheard.text), 17, DIM, { fontStyle: 'italic' }).height + 12;
    }
    for (const option of options) {
      y = this.optionRow(claim, option, entry?.choice === option.choice, isSealed, left, y, textW, size) + 8;
    }

    if (entry && entry.choice !== 'withheld') {
      this.confidenceRow(claim, entry.choice, entry.confidence, isSealed, flags, left, y + 6, textW, size);
    }

    const navY = safe.bottom - 54;
    if (this.page > 0) this.button(rtl ? right : left, navY, `‹ ${t('Previous')}`, () => this.turn(-1), rtl ? 1 : 0, size);
    const last = this.page >= this.claims.length - 1;
    this.button(rtl ? left : right, navY, last ? t('Done') : `${t('Next')} ›`, () => (last ? this.close() : this.turn(1)), rtl ? 0 : 1, size);
  }

  /** One choice: whose account, both, or silence. Returns the y below it. */
  private optionRow(claim: Claim, option: PageOption, picked: boolean, isSealed: boolean,
    left: number, y: number, w: number, size: { width: number; height: number }): number {
    const style = (px: number, color: string, extra: object = {}) => localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(px, size, 12), color,
      wordWrap: { width: w - 24 }, lineSpacing: 3, ...extra,
    });
    const head = option.account
      ? `${tName(option.account.speaker)}  ·  ${provenanceLabel(option.account.provenance)}`
      : option.choice === 'both' ? t('Write down the disagreement') : t('Leave it unwritten');
    const body = option.account ? t(option.account.text)
      : option.choice === 'both' ? t(claim.both.text) : t(claim.withheld!.text);
    const tx = rtl ? left + w - 12 : left + 12;
    const headText = this.add.text(tx, y + 8, head, style(13, picked ? GOLD : DIM, { fontStyle: 'italic' })).setOrigin(textOriginX(0), 0);
    const bodyText = this.add.text(tx, headText.y + headText.height + 2, body, style(16, picked ? '#fff1c0' : INK)).setOrigin(textOriginX(0), 0);
    const h = Math.max(MIN_TOUCH_TARGET, headText.height + bodyText.height + 18);
    const bg = this.add.rectangle(left, y, w, h, picked ? 0x3a2a14 : 0x2a1c10, picked ? 0.9 : 0.45)
      .setOrigin(0).setStrokeStyle(picked ? 2 : 1, picked ? PICKED : 0x4a3a22, picked ? 1 : 0.75);
    headText.setDepth(1);
    bodyText.setDepth(1);
    if (!isSealed) {
      bg.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
        const f = getFlags();
        const previous = written(f, claim.id)?.confidence;
        const confidence: Confidence | undefined = option.choice === 'withheld' ? undefined
          : previous === 'sure' && !sureAllowed(claim, option.choice, f) ? 'likely' : previous ?? 'likely';
        applyEffect({ set: { [recKey(claim.id)]: option.choice, ...(confidence ? { [confKey(claim.id)]: confidence } : {}) } });
        playSfx('choice');
        this.draw();
      });
    }
    return y + h;
  }

  /** Sure, likely, unsure; "sure" may be closed by doubt. Returns the y below it. */
  private confidenceRow(claim: Claim, choice: string, current: Confidence | undefined, isSealed: boolean,
    flags: FlagState, left: number, y: number, w: number, size: { width: number; height: number }): number {
    const levels: [Confidence, string][] = [['sure', t('Sure')], ['likely', t('Likely')], ['unsure', t('Unsure')]];
    const cellW = (w - 16) / 3;
    const sureOk = sureAllowed(claim, choice, flags);
    levels.forEach(([level, label], i) => {
      const cx = rtl ? left + w - (i + 0.5) * cellW - i * 8 : left + (i + 0.5) * cellW + i * 8;
      const on = current === level;
      const open = !isSealed && (level !== 'sure' || sureOk);
      const bg = this.add.rectangle(cx, y + MIN_TOUCH_TARGET / 2, cellW, MIN_TOUCH_TARGET, on ? 0x3a2a14 : 0x2a1c10, open || on ? 0.9 : 0.3)
        .setStrokeStyle(on ? 2 : 1, on ? PICKED : 0x4a3a22, 1);
      this.add.text(cx, y + MIN_TOUCH_TARGET / 2, label, localizedStyle({
        fontFamily: 'Georgia, serif', fontSize: buttonFont(16, size), color: on ? GOLD : open ? INK : '#5a4a32',
      }, 'center')).setOrigin(0.5);
      if (open) {
        bg.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
          applyEffect({ set: { [confKey(claim.id)]: level } });
          playSfx('choice');
          this.draw();
        });
      }
    });
    y += MIN_TOUCH_TARGET + 8;
    if (!sureOk && !isSealed) {
      const doubt = VOICE_STYLE.doubt;
      const note = this.add.text(rtl ? left + w : left, y, `${doubt.name()}: ${t('One voice is not enough to be sure.')}`, localizedStyle({
        fontFamily: 'Georgia, serif', fontSize: responsiveFont(15, size, 12), color: doubt.color, fontStyle: 'italic',
        wordWrap: { width: w },
      })).setOrigin(textOriginX(0), 0);
      y += note.height + 6;
    }
    return y;
  }

  private button(x: number, y: number, label: string, onClick: () => void, originX: number, size: { width: number; height: number }): void {
    const button = this.add.text(x, y, label, localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: buttonFont(16, size), color: '#c9b07a',
      backgroundColor: '#2a1c10', padding: { x: 14, y: 12 },
    })).setOrigin(originX, 0).setInteractive({ useHandCursor: true });
    button.on('pointerover', () => button.setColor('#fff1c0'))
      .on('pointerout', () => button.setColor('#c9b07a'))
      .on('pointerdown', onClick);
  }
}

function provenanceLabel(p: Provenance): string {
  if (p === 'saw') return t('You saw it');
  if (p === 'told') return t('Told by one who was there');
  return t('Rumour');
}
