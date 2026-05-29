import Phaser from 'phaser';
import { getFlags } from '../dialogue/flags';

interface JournalEntry {
  flag: string;
  title: string;
  body: string;
}

const ENTRIES: JournalEntry[] = [
  {
    flag: 'rumourTraveller',
    title: 'A Traveller at the Gate',
    body: 'A fellow seeker from Karbilá speaks of a young Siyyid of this city — modest, of the Prophet\'s line — who has returned from pilgrimage speaking with strange certainty.',
  },
  {
    flag: 'rumourMerchant',
    title: 'The Cloth Merchant\'s Hint',
    body: 'A merchant in the bazaar names Him: Siyyid ʿAlí-Muḥammad. His house lies in the quarter north of the mosque. The merchant warns that not all in Shíráz wish Him well.',
  },
  {
    flag: 'rumourMulla',
    title: 'The Mullá\'s Warning',
    body: 'The mullá of the great mosque speaks bitterly of the youth — a merchant turned mystic, stirring the foolish with hidden meanings. He counsels you to leave the city.',
  },
  {
    flag: 'enteredHouse',
    title: 'Across the Threshold',
    body: 'You accepted the Young Host\'s invitation and crossed His threshold. He asked you the sign of the Promised One.',
  },
  {
    flag: 'ending',
    title: 'Outcome',
    body: '',
  },
];

export class JournalScene extends Phaser.Scene {
  constructor() {
    super('Journal');
  }

  create(): void {
    const { width, height } = this.scale;
    this.add.rectangle(0, 0, width, height, 0x000000, 0.6).setOrigin(0);

    const panelX = 80, panelY = 60;
    const panelW = width - 160, panelH = height - 120;
    this.add.rectangle(panelX, panelY, panelW, panelH, 0x1a120a, 0.96)
      .setOrigin(0)
      .setStrokeStyle(2, 0xc9a55c, 1);

    this.add.text(panelX + 24, panelY + 18, 'Journal', {
      fontFamily: 'Georgia, serif', fontSize: '32px', color: '#f3d98a',
    });
    this.add.text(panelX + panelW - 24, panelY + 28, 'Press J or Esc to close', {
      fontFamily: 'Georgia, serif', fontSize: '14px', color: '#9c8458',
    }).setOrigin(1, 0);

    const flags = getFlags();
    const known = ENTRIES.filter(e => flags[e.flag] !== undefined && flags[e.flag] !== false);

    let y = panelY + 72;
    if (known.length === 0) {
      this.add.text(panelX + 24, y, 'You have learned nothing yet. Speak with the people of Shíráz.', {
        fontFamily: 'Georgia, serif', fontSize: '18px', color: '#c9b07a', fontStyle: 'italic',
      });
    } else {
      for (const e of known) {
        this.add.text(panelX + 24, y, '• ' + e.title, {
          fontFamily: 'Georgia, serif', fontSize: '20px', color: '#f3d98a',
        });
        const body = e.flag === 'ending'
          ? (flags.ending === 'firstLetter'
              ? 'You bore witness, and became the first of the Letters of the Living.'
              : 'You stepped back into the night, your decision deferred.')
          : e.body;
        const t = this.add.text(panelX + 40, y + 28, body, {
          fontFamily: 'Georgia, serif', fontSize: '16px', color: '#e8d9b0',
          wordWrap: { width: panelW - 80 }, lineSpacing: 3,
        });
        y += 28 + t.height + 18;
      }
    }

    const close = (): void => { this.scene.stop(); this.scene.resume('Shiraz'); };
    this.input.keyboard?.once('keydown-J', close);
    this.input.keyboard?.once('keydown-ESC', close);
  }
}
