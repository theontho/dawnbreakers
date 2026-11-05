import Phaser from 'phaser';
import type { DialogueTree, DialogueChoice, DialogueNode, FlagState, NodeVoice } from '../dialogue/types';
import { VOICE_STYLE } from '../dialogue/voices';
import { hasHeard } from '../data/record';
import type { RecordLaunch } from './RecordScene';
import { applyEffect, getFlags } from '../dialogue/flags';
import { playSfx } from '../audio';
import type { MiniGameLaunch } from './minigames/MiniGameScene';
import { attachGlossary } from '../ui/glossary/glossaryText';
import { formatNumber, localizedStyle, rtl, t, tName } from '../i18n';
import { buttonFont, clamp, MIN_TOUCH_TARGET, responsiveFont, safeLayout } from '../ui/responsive';

export interface DialogueLaunch {
  tree: DialogueTree;
  onComplete?: () => void;
  currentId?: string;
}

export class DialogueScene extends Phaser.Scene {
  private tree!: DialogueTree;
  private onComplete?: () => void;
  private currentId!: string;

  private speakerText!: Phaser.GameObjects.Text;
  private bodyText!: Phaser.GameObjects.Text;
  private choiceObjects: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super('Dialogue');
  }

  init(data: DialogueLaunch): void {
    this.tree = data.tree;
    this.onComplete = data.onComplete;
    this.currentId = data.currentId ?? data.tree.startId;
  }

  create(): void {
    playSfx('dialogueOpen');
    this.rebuildLayout(true);
    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    });
  }

  private handleResize(): void {
    if (!this.scene.isActive(this.scene.key)) return;
    this.rebuildLayout(false);
  }

  private rebuildLayout(applyOnEnter: boolean): void {
    const { width, height } = this.scale;
    const size = { width, height };
    const safe = safeLayout(size);
    const node = this.tree.nodes[this.currentId];
    if (!node) {
      console.warn(`Dialogue node not found: ${this.currentId}`);
      this.finish();
      return;
    }
    if (applyOnEnter && node.onEnter) applyEffect(node.onEnter);

    // DisplayList.removeAll only detaches (its flag skips callbacks); destroy
    // instead, or old objects and their input zones live on unseen.
    for (const child of this.children.getAll()) child.destroy();
    this.choiceObjects = [];

    this.add.rectangle(0, 0, width, height, 0x000000, 0.35).setOrigin(0);

    const flags = getFlags();
    const choices: DialogueChoice[] = node.choices && node.choices.length > 0
      ? node.choices.filter(c => available(c, flags))
      : [{ text: '(Continue)', next: undefined }];
    const panelW = safe.width;
    const padX = width <= 480 ? 14 : 20;
    const topPad = width <= 480 ? 12 : 16;
    const bottomPad = width <= 480 ? 12 : 16;
    const contentW = panelW - padX * 2;
    const speakerBodyGap = 8;
    const bodyChoicesGap = 14;
    const rowGap = 6;
    const speakerValue = tName(node.speaker);
    const bodyValue = bodyText(node, flags);
    const interjection = speakingVoice(node, flags);
    const voiceValue = interjection ? `${VOICE_STYLE[interjection.voice].name()}: ${t(interjection.text)}` : '';
    const speakerStyle = localizedStyle({
      fontFamily: 'Georgia, serif',
      fontSize: responsiveFont(22, size, 15),
      color: '#f3d98a',
      fontStyle: 'italic',
      wordWrap: { width: contentW },
    });
    const bodyStyle = localizedStyle({
      fontFamily: 'Georgia, serif',
      fontSize: responsiveFont(20, size, 15),
      color: '#f0e4c8',
      wordWrap: { width: contentW },
      lineSpacing: 4,
    });
    const choiceStyle = localizedStyle({
      fontFamily: 'Georgia, serif',
      fontSize: buttonFont(18, size),
      color: '#c9b07a',
      wordWrap: { width: contentW - 24 },
    });
    const voiceStyle = interjection ? localizedStyle({
      fontFamily: 'Georgia, serif',
      fontSize: responsiveFont(18, size, 14),
      color: VOICE_STYLE[interjection.voice].color,
      fontStyle: 'italic',
      wordWrap: { width: contentW - 12 },
      lineSpacing: 3,
    }) : undefined;
    const speakerH = this.measureTextHeight(speakerValue, speakerStyle);
    const bodyH = this.measureTextHeight(bodyValue, bodyStyle);
    const voiceGap = 10;
    const voiceH = voiceStyle ? this.measureTextHeight(voiceValue, voiceStyle) + voiceGap : 0;
    const choiceLabels = choices.map((choice, i) => `${formatNumber(i + 1)}. ${choiceLabel(choice)}`);
    const choiceHeights = choiceLabels.map(label =>
      Math.max(MIN_TOUCH_TARGET, Math.ceil(this.measureTextHeight(label, choiceStyle) + 16)),
    );
    const choicesH = choiceHeights.reduce((sum, rowH) => sum + rowH, 0)
      + Math.max(0, choiceHeights.length - 1) * rowGap;
    const requiredH = Math.ceil(topPad + speakerH + speakerBodyGap + bodyH + voiceH + bodyChoicesGap + choicesH + bottomPad);
    const maxPanelH = Math.max(MIN_TOUCH_TARGET * 3, safe.height);
    const minPanelH = Math.min(240, maxPanelH);
    const panelH = clamp(requiredH, minPanelH, maxPanelH);
    const panelY = safe.bottom - panelH;
    this.add.rectangle(safe.x, panelY, panelW, panelH, 0x1a120a, 0.94)
      .setOrigin(0)
      .setStrokeStyle(2, 0xc9a55c, 1);

    const textX = rtl ? safe.right - padX : safe.x + padX;
    const textOrigin = rtl ? 1 : 0;
    this.speakerText = this.add.text(textX, panelY + topPad, speakerValue, speakerStyle).setOrigin(textOrigin, 0);

    this.bodyText = this.add.text(textX, this.speakerText.y + speakerH + speakerBodyGap, bodyValue, bodyStyle)
      .setOrigin(textOrigin, 0);
    attachGlossary(this, this.bodyText);

    if (interjection && voiceStyle) {
      const style = VOICE_STYLE[interjection.voice];
      const voiceY = this.bodyText.y + bodyH + voiceGap;
      const barX = rtl ? safe.right - padX + 4 : safe.x + padX - 6;
      this.add.rectangle(barX, voiceY, 3, voiceH - voiceGap, style.bar, 0.9).setOrigin(0.5, 0);
      this.add.text(rtl ? textX - 6 : textX + 6, voiceY, voiceValue, voiceStyle).setOrigin(textOrigin, 0);
    }

    let rowY = this.bodyText.y + bodyH + voiceH + bodyChoicesGap;
    const rowX = safe.x + padX;
    const rowW = contentW;

    choices.forEach((choice, i) => {
      const label = choiceLabels[i]!;
      const rowH = choiceHeights[i]!;
      const tint = choiceColor(choice);
      const bg = this.add.rectangle(rowX, rowY, rowW, rowH, 0x2a1c10, 0.45)
        .setOrigin(0)
        .setStrokeStyle(1, 0x4a3a22, 0.75)
        .setInteractive({ useHandCursor: true });
      if (choice.voice || choice.present) {
        // A coloured edge marks a voice speaking, or something brought from the record.
        const edge = choice.voice ? VOICE_STYLE[choice.voice].bar : PRESENT_EDGE;
        const edgeObj = this.add.rectangle(rtl ? rowX + rowW - 2 : rowX + 2, rowY + 4, 3, rowH - 8, edge, 0.95).setOrigin(0.5, 0);
        this.choiceObjects.push(edgeObj);
      }
      const choiceText = this.add.text(rtl ? rowX + rowW - 12 : rowX + 12, rowY + rowH / 2, label, { ...choiceStyle, color: tint })
        .setOrigin(rtl ? 1 : 0, 0.5);
      bg
        .on('pointerover', () => {
          playSfx('uiHover');
          bg.setStrokeStyle(1, 0xf3d98a, 1);
          choiceText.setColor('#fff1c0');
        })
        .on('pointerout',  () => {
          bg.setStrokeStyle(1, 0x4a3a22, 0.75);
          choiceText.setColor(tint);
        })
        .on('pointerdown', () => this.choose(choice));
      this.choiceObjects.push(bg, choiceText);
      rowY += rowH + rowGap;
    });

    if (applyOnEnter) {
      this.bodyText.setAlpha(0);
      this.tweens.add({ targets: this.bodyText, alpha: 1, duration: 260, ease: 'Sine.easeOut' });
      this.choiceObjects.forEach((object, i) => {
        const choiceObject = object as Phaser.GameObjects.Text | Phaser.GameObjects.Rectangle;
        const targetAlpha = choiceObject.alpha;
        choiceObject.setAlpha(0);
        this.tweens.add({ targets: choiceObject, alpha: targetAlpha, duration: 220, delay: 140 + Math.floor(i / 2) * 70 });
      });
    }

    // Keyboard: 1-9 pick a choice; Space or Enter take the only choice.
    this.input.keyboard?.removeAllListeners('keydown');
    this.input.keyboard?.on('keydown', (e: KeyboardEvent) => {
      const n = parseInt(e.key, 10);
      if (!isNaN(n) && n >= 1 && n <= choices.length) {
        this.choose(choices[n - 1]!);
      } else if ((e.key === ' ' || e.key === 'Enter') && choices.length === 1 && !e.repeat) {
        this.choose(choices[0]!);
      }
    });
  }

  private choose(choice: DialogueChoice): void {
    const node = this.tree.nodes[this.currentId];
    playSfx((node?.choices?.length ?? 0) > 1 ? 'choice' : 'dialogueAdvance');
    if (choice.effect) applyEffect(choice.effect);

    if (choice.play) {
      this.playMiniGame(choice);
      return;
    }
    if (choice.write) {
      this.writeRecord(choice);
      return;
    }
    this.goTo(choice);
  }

  /** Hides the dialogue while the player writes in the record, then goes on. */
  private writeRecord(choice: DialogueChoice): void {
    this.scene.setVisible(false);
    this.scene.launch('Record', {
      claims: choice.write,
      onFinish: () => {
        this.scene.resume();
        this.scene.setVisible(true);
        this.goTo(choice);
      },
    } as RecordLaunch);
    this.scene.pause();
  }

  /** Hides the dialogue while the mini-game plays over the map, then goes on. */
  private playMiniGame(choice: DialogueChoice): void {
    this.scene.setVisible(false);
    this.scene.launch(choice.play!, {
      onFinish: () => {
        this.scene.resume();
        this.scene.setVisible(true);
        this.goTo(choice);
      },
    } as MiniGameLaunch);
    this.scene.pause();
  }

  private goTo(choice: DialogueChoice): void {
    if (!choice.next) {
      this.finish();
      return;
    }
    const nextNode = this.tree.nodes[choice.next];
    if (!nextNode) {
      console.warn(`Dialogue node not found: ${choice.next}`);
      this.finish();
      return;
    }
    this.currentId = choice.next;
    this.rebuildLayout(true);
  }

  private measureTextHeight(text: string, style: Phaser.Types.GameObjects.Text.TextStyle): number {
    const measure = this.add.text(0, 0, text, style).setVisible(false);
    const height = measure.height;
    measure.destroy();
    return height;
  }

  private finish(): void {
    const cb = this.onComplete;
    this.scene.stop();
    if (cb) cb();
  }
}

const PRESENT_EDGE = 0x6fb8a8;
const PRESENT_COLOR = '#9ed6c8';
const CHOICE_COLOR = '#c9b07a';

/** A choice shows when its condition holds and, if it brings something from the record, that was heard. */
function available(choice: DialogueChoice, flags: FlagState): boolean {
  if (choice.requires && !choice.requires(flags)) return false;
  if (choice.present && !hasHeard(flags, choice.present.claim, choice.present.account)) return false;
  return true;
}

function choiceLabel(choice: DialogueChoice): string {
  if (choice.voice) return `${VOICE_STYLE[choice.voice].name()}: ${t(choice.text)}`;
  return t(choice.text);
}

function choiceColor(choice: DialogueChoice): string {
  if (choice.voice) return VOICE_STYLE[choice.voice].color;
  if (choice.present) return PRESENT_COLOR;
  return CHOICE_COLOR;
}

/** The first of the node's voices whose condition holds. */
function speakingVoice(node: DialogueNode, flags: FlagState): NodeVoice | undefined {
  const voices = node.voice ? (Array.isArray(node.voice) ? node.voice : [node.voice]) : [];
  return voices.find(v => !v.requires || v.requires(flags));
}

/** The node's text, then any paragraphs worked out from the flags. */
function bodyText(node: DialogueNode, flags: FlagState): string {
  const extra = node.lines ? node.lines(flags).map(line => t(line)) : [];
  return [t(node.text), ...extra].join('\n\n');
}
