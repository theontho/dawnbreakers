import Phaser from 'phaser';
import { chapterById, type ChapterId } from '../data/chapters';
import type { FlagState, MiniGameId } from '../dialogue/types';
import { hdrGlowDiagnosis, hdrGpu, type HdrDiagnosis } from '../hdr/hdrSupport';
import { showHdrSwatch } from '../hdr/hdrSwatch';
import { localizedStyle, t } from '../i18n';
import { buttonFont, isNarrowLayout, responsiveFont, restartSceneOnResize, safeLayout } from '../ui/responsive';
import type { MiniGameLaunch, MiniGameScene } from './minigames/MiniGameScene';
import { activateTitleTextButton } from './titleControls';

/** Each chapter's game, in story order, and how to say what its result was. */
const GAMES: Array<{ id: MiniGameId; chapter: ChapterId; outcome: (r: FlagState) => string }> = [
  { id: 'LanesGame', chapter: 'tehran-nur',
    outcome: r => t('The watch stopped you {n} times.', { n: Number(r.nurLanesNoticed) }) },
  { id: 'LampGame', chapter: 'mecca',
    outcome: r => t('The flame went out {n} times.', { n: Number(r.ch3LanternOuts) }) },
  { id: 'InkGame', chapter: 'mountain-prisons',
    outcome: r => (r.ch6CopiedLine === 'whole' ? t('You copied the whole line.') : t('You copied part of the line.')) },
  { id: 'CurtainGame', chapter: 'tahirih',
    outcome: r => (r.qzListened === 'clear' ? t('You heard nearly every word.') : t('You heard pieces of it.')) },
  { id: 'CoffeeGame', chapter: 'tabriz-trial',
    outcome: r => t('You caught {n} of the 6 moments at the doors.', { n: Number(r.trialOverheard) }) },
  { id: 'RationGame', chapter: 'tabarsi', outcome: r => rationOutcome(String(r.ch8RationFavoured)) },
];

function rationOutcome(favoured: string): string {
  switch (favoured) {
    case 'wounded': return t('Most went to the wounded.');
    case 'watch': return t('Most went to the watch on the walls.');
    case 'young': return t('Most went to the youngest.');
    default: return t('You shared it out evenly.');
  }
}

function hdrLine(diagnosis: HdrDiagnosis): string {
  switch (diagnosis) {
    case 'on': return t('HDR is on. The right half of the patch should be clearly brighter than the left.');
    case 'off': return t('HDR is available but turned off in Settings.');
    case 'sdr-screen': return t('This screen reports standard range, so the glow stays off. If the right half of the patch is brighter anyway, the browser is wrong about the screen.');
    case 'no-extended': return t('This browser has WebGPU but cannot draw brighter than white on a canvas.');
    case 'no-adapter': return t('This browser has WebGPU but found no graphics adapter for it.');
    case 'no-webgpu': return t('This browser offers no WebGPU here. HDR needs Chrome or Edge 131 or later, on https or localhost.');
  }
}

/**
 * The title's "Mini-games" screen: every chapter's game, to play on its own
 * as practice (the result is shown, not kept), and a check of whether this
 * screen and browser can show the HDR sun and moon.
 */
export class MiniGamePickerScene extends Phaser.Scene {
  private resultText!: Phaser.GameObjects.Text;
  private removeSwatch?: () => void;
  private swatchRect?: { x: number; y: number; width: number; height: number };

  constructor() {
    super('MiniGamePicker');
  }

  create(): void {
    restartSceneOnResize(this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.hideSwatch());
    const { width, height } = this.scale;
    const size = { width, height };
    const safe = safeLayout(size);
    const cx = safe.x + safe.width / 2;
    const narrow = isNarrowLayout(size);
    this.add.rectangle(0, 0, width, height, 0x0a0806).setOrigin(0);

    const heading = this.add.text(cx, safe.y, t('Mini-games'), localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(30, size, 20), color: '#f3d98a', fontStyle: 'italic', align: 'center',
    }, 'center')).setOrigin(0.5, 0);
    const note = this.add.text(cx, heading.y + heading.height + 6, t('Each chapter\'s game, to play on its own. What happens here is not kept in your story.'), localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(16, size, 13), color: '#c9b07a', align: 'center',
      wordWrap: { width: Math.min(safe.width, 720) },
    }, 'center')).setOrigin(0.5, 0);

    let y = note.y + note.height + (narrow ? 12 : 22);
    const rowW = Math.min(safe.width, 560);
    for (const game of GAMES) {
      const scene = this.scene.get(game.id) as MiniGameScene;
      const chapter = chapterById(game.chapter);
      const label = `${t(scene.heading)}\n${chapter ? t(chapter.title) : ''}`;
      const row = this.add.text(cx, y, label, localizedStyle({
        fontFamily: 'Georgia, serif', fontSize: buttonFont(18, size), color: '#e8d9b0', align: 'center',
        backgroundColor: '#1a120acc', padding: { x: 18, y: 8 }, fixedWidth: rowW, lineSpacing: 2,
      }, 'center')).setOrigin(0.5, 0);
      activateTitleTextButton(this, row, '#e8d9b0', '#fff1c0', () => this.play(game.id, game.outcome));
      y += row.height + 8;
    }

    this.resultText = this.add.text(cx, y + 4, '', localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(17, size, 14), color: '#f3d98a', fontStyle: 'italic', align: 'center',
      wordWrap: { width: rowW },
    }, 'center')).setOrigin(0.5, 0);

    const back = this.add.text(safe.x, safe.y, t('Back'), localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: buttonFont(16, size), color: '#c9b07a',
      backgroundColor: '#1a120acc', padding: { x: 12, y: 12 },
    })).setOrigin(0, 0);
    activateTitleTextButton(this, back, '#c9b07a', '#fff1c0', () => this.scene.start('Title'));
    this.input.keyboard?.on('keydown-ESC', () => {
      if (this.scene.isActive()) this.scene.start('Title');
    });

    this.addHdrCheck(cx, Math.max(y + 48, safe.bottom - 120), rowW, size);
  }

  private play(id: MiniGameId, outcome: (r: FlagState) => string): void {
    this.hideSwatch();
    this.resultText.setText('');
    this.scene.launch(id, {
      practice: true,
      onFinish: result => {
        this.scene.resume();
        this.resultText.setText(outcome(result));
        void this.showSwatch();
      },
    } as MiniGameLaunch);
    this.scene.pause();
  }

  /** What the browser says about HDR here, and a patch of plain white beside a brighter one to see for yourself. */
  private addHdrCheck(cx: number, top: number, width: number, size: { width: number; height: number }): void {
    const swatchW = Math.min(240, width * 0.6);
    const swatchH = 36;
    this.swatchRect = { x: cx - swatchW / 2, y: top, width: swatchW, height: swatchH };
    const style = localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(14, size, 12), color: '#9c8458', align: 'center',
    }, 'center');
    // The patch's place, outlined, so it reads as missing where the browser cannot draw it.
    this.add.rectangle(cx, top + swatchH / 2, swatchW + 4, swatchH + 4).setStrokeStyle(1, 0x6a5232);
    this.add.text(cx - swatchW / 4, top + swatchH + 4, t('White'), style).setOrigin(0.5, 0);
    this.add.text(cx + swatchW / 4, top + swatchH + 4, t('4× white'), style).setOrigin(0.5, 0);
    const line = this.add.text(cx, top - 8, t('Checking for HDR…'), { ...style, color: '#c9b07a', wordWrap: { width } })
      .setOrigin(0.5, 1);
    void hdrGlowDiagnosis().then(diagnosis => {
      if (!this.scene.isActive()) return;
      line.setText(hdrLine(diagnosis));
      void this.showSwatch();
    });
  }

  private async showSwatch(): Promise<void> {
    const gpu = await hdrGpu();
    if (!gpu || !this.swatchRect || this.removeSwatch || !this.scene.isActive()) return;
    this.removeSwatch = showHdrSwatch(gpu, this.game.canvas, this.swatchRect);
  }

  private hideSwatch(): void {
    this.removeSwatch?.();
    this.removeSwatch = undefined;
  }
}
