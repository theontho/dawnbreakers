import Phaser from 'phaser';
import type { DialogueTree, DialogueNode, DialogueChoice } from '../dialogue/types';
import { applyEffect, getFlags } from '../dialogue/flags';

export interface DialogueLaunch {
  tree: DialogueTree;
  onComplete?: () => void;
}

export class DialogueScene extends Phaser.Scene {
  private tree!: DialogueTree;
  private onComplete?: () => void;
  private currentId!: string;

  private speakerText!: Phaser.GameObjects.Text;
  private bodyText!: Phaser.GameObjects.Text;
  private choiceTexts: Phaser.GameObjects.Text[] = [];

  constructor() {
    super('Dialogue');
  }

  init(data: DialogueLaunch): void {
    this.tree = data.tree;
    this.onComplete = data.onComplete;
    this.currentId = data.tree.startId;
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, 0x000000, 0.35).setOrigin(0);

    const panelH = 260;
    const panelY = height - panelH - 20;
    this.add.rectangle(20, panelY, width - 40, panelH, 0x1a120a, 0.94)
      .setOrigin(0)
      .setStrokeStyle(2, 0xc9a55c, 1);

    this.speakerText = this.add.text(40, panelY + 16, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '22px',
      color: '#f3d98a',
      fontStyle: 'italic',
    });

    this.bodyText = this.add.text(40, panelY + 52, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '20px',
      color: '#f0e4c8',
      wordWrap: { width: width - 80 },
      lineSpacing: 4,
    });

    this.renderNode(this.tree.nodes[this.currentId]);
  }

  private renderNode(node: DialogueNode): void {
    if (node.onEnter) applyEffect(node.onEnter);

    this.speakerText.setText(node.speaker);
    this.bodyText.setText(node.text);

    this.choiceTexts.forEach(t => t.destroy());
    this.choiceTexts = [];

    const flags = getFlags();
    const choices: DialogueChoice[] = node.choices && node.choices.length > 0
      ? node.choices.filter(c => !c.requires || c.requires(flags))
      : [{ text: '(Continue)', next: undefined }];

    const startY = this.bodyText.y + this.bodyText.height + 18;

    choices.forEach((choice, i) => {
      const label = `${i + 1}. ${choice.text}`;
      const t = this.add.text(48, startY + i * 28, label, {
        fontFamily: 'Georgia, serif',
        fontSize: '18px',
        color: '#c9b07a',
        wordWrap: { width: this.scale.width - 100 },
      })
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => t.setColor('#fff1c0'))
        .on('pointerout',  () => t.setColor('#c9b07a'))
        .on('pointerdown', () => this.choose(choice));
      this.choiceTexts.push(t);
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
