import Phaser from 'phaser';
import { resetFlags } from '../dialogue/flags';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, 0x0a0806).setOrigin(0);

    // Faint sunrise gradient using a few stacked rectangles
    const bands = [0x1a0f08, 0x2a1810, 0x3a2418, 0x4a2e1a];
    bands.forEach((c, i) => {
      this.add.rectangle(0, height - (i + 1) * 60, width, 60, c, 0.6).setOrigin(0);
    });

    this.add.text(width / 2, height * 0.32, 'The Dawn-Breakers', {
      fontFamily: 'Georgia, serif',
      fontSize: '72px',
      color: '#f3e2b5',
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.42, 'Shíráz, the eve of 23 May 1844', {
      fontFamily: 'Georgia, serif',
      fontSize: '22px',
      color: '#c9b07a',
      fontStyle: 'italic',
    }).setOrigin(0.5);

    const prompt = this.add.text(width / 2, height * 0.7, 'Press SPACE or click to begin', {
      fontFamily: 'Georgia, serif',
      fontSize: '20px',
      color: '#e8d9b0',
    }).setOrigin(0.5);

    this.tweens.add({ targets: prompt, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });

    const start = () => this.scene.start('City');
    this.input.keyboard?.once('keydown-SPACE', start);
    this.input.once('pointerdown', start);

    const reset = this.add.text(width - 20, height - 20, 'Reset story', {
      fontFamily: 'Georgia, serif', fontSize: '14px', color: '#9c8458',
      backgroundColor: '#1a120acc', padding: { x: 8, y: 4 },
    }).setOrigin(1, 1)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => reset.setColor('#f3d98a'))
      .on('pointerout',  () => reset.setColor('#9c8458'))
      .on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, ev: { stopPropagation: () => void }) => {
        ev.stopPropagation();
        resetFlags();
        reset.setText('Reset ✓');
      });
  }
}
