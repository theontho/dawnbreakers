import Phaser from 'phaser';
import type { DialogueTree, DialogueNode, DialogueChoice } from '../dialogue/types';
import { applyEffect, getFlags } from '../dialogue/flags';
import { buttonFont, clamp, MIN_TOUCH_TARGET, responsiveFont, responsiveMargin } from '../ui/responsive';

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
    const margin = responsiveMargin(size);

    this.children.removeAll(true);
    this.choiceObjects = [];

    this.add.rectangle(0, 0, width, height, 0x000000, 0.35).setOrigin(0);

    const panelH = clamp(height * 0.42, 240, Math.min(360, height - margin * 2));
    const panelY = height - panelH - margin;
    this.add.rectangle(margin, panelY, width - margin * 2, panelH, 0x1a120a, 0.94)
      .setOrigin(0)
      .setStrokeStyle(2, 0xc9a55c, 1);

    this.speakerText = this.add.text(margin + 20, panelY + 16, '', {
      fontFamily: 'Georgia, serif',
      fontSize: responsiveFont(22, size, 15),
      color: '#f3d98a',
      fontStyle: 'italic',
    });

    this.bodyText = this.add.text(margin + 20, panelY + 52, '', {
      fontFamily: 'Georgia, serif',
      fontSize: responsiveFont(20, size, 15),
      color: '#f0e4c8',
      wordWrap: { width: width - margin * 2 - 40 },
      lineSpacing: 4,
    });

    this.renderNode(this.tree.nodes[this.currentId], applyOnEnter);
  }

  private renderNode(node: DialogueNode, applyOnEnter = true): void {
    if (applyOnEnter && node.onEnter) applyEffect(node.onEnter);

    this.speakerText.setText(node.speaker);
    this.bodyText.setText(node.text);

    this.choiceObjects.forEach(t => t.destroy());
    this.choiceObjects = [];

    const flags = getFlags();
    const choices: DialogueChoice[] = node.choices && node.choices.length > 0
      ? node.choices.filter(c => !c.requires || c.requires(flags))
      : [{ text: '(Continue)', next: undefined }];

    const startY = this.bodyText.y + this.bodyText.height + 18;
    const rowW = this.scale.width - this.bodyText.x * 2;
    const rowH = MIN_TOUCH_TARGET;
    const rowGap = 6;

    choices.forEach((choice, i) => {
      const label = `${i + 1}. ${choice.text}`;
      const rowY = startY + i * (rowH + rowGap);
      const bg = this.add.rectangle(this.bodyText.x, rowY, rowW, rowH, 0x2a1c10, 0.45)
        .setOrigin(0)
        .setStrokeStyle(1, 0x4a3a22, 0.75)
        .setInteractive({ useHandCursor: true });
      const t = this.add.text(this.bodyText.x + 12, rowY + rowH / 2, label, {
        fontFamily: 'Georgia, serif',
        fontSize: buttonFont(18, this.scale),
        color: '#c9b07a',
        wordWrap: { width: rowW - 24 },
      }).setOrigin(0, 0.5);
      bg
        .on('pointerover', () => {
          bg.setStrokeStyle(1, 0xf3d98a, 1);
          t.setColor('#fff1c0');
        })
        .on('pointerout',  () => {
          bg.setStrokeStyle(1, 0x4a3a22, 0.75);
          t.setColor('#c9b07a');
        })
        .on('pointerdown', () => this.choose(choice));
      this.choiceObjects.push(bg, t);
    });

    // keyboard 1-9
    this.input.keyboard?.removeAllListeners('keydown');
    this.input.keyboard?.on('keydown', (e: KeyboardEvent) => {
      const n = parseInt(e.key, 10);
      if (!isNaN(n) && n >= 1 && n <= choices.length) {
        this.choose(choices[n - 1]);
      }
    });
  }

  private choose(choice: DialogueChoice): void {
    if (choice.effect) applyEffect(choice.effect);

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
    this.currentId = nextNode.id;
    this.renderNode(nextNode);
  }

  private finish(): void {
    const cb = this.onComplete;
    this.scene.stop();
    if (cb) cb();
  }
}
