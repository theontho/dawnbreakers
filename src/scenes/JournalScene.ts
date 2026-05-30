import Phaser from 'phaser';
import { getFlags } from '../dialogue/flags';
import { localizedStyle, rtl, t, textOriginX } from '../i18n';
import { buttonFont, responsiveFont, restartSceneOnResize, safeLayout } from '../ui/responsive';

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
    flag: 'rumourNeighbour',
    title: 'A Neighbour\'s Welcome',
    body: 'A woman in the Báb\'s own lane speaks gently of Him and His wife Khadíjih-Bagum. "Some come, and never leave the same."',
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
  private fromKey = 'City';

  constructor() {
    super('Journal');
  }

  init(data: { from?: string }): void {
    this.fromKey = data.from ?? 'City';
  }

  create(): void {
    restartSceneOnResize(this, () => ({ from: this.fromKey }));

    const { width, height } = this.scale;
    const size = { width, height };
    const safe = safeLayout(size);
    this.add.rectangle(0, 0, width, height, 0x000000, 0.6).setOrigin(0);

    const panelX = safe.x, panelY = safe.y;
    const panelW = safe.width, panelH = safe.height;
    const close = (): void => { this.scene.stop(); this.scene.resume(this.fromKey); };
    this.add.rectangle(panelX, panelY, panelW, panelH, 0x1a120a, 0.96)
      .setOrigin(0)
      .setStrokeStyle(2, 0xc9a55c, 1);

    const contentX = rtl ? panelX + panelW - 24 : panelX + 24;
    const contentOrigin = textOriginX(0);
    this.add.text(contentX, panelY + 18, t('Journal'), localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(32, size, 22), color: '#f3d98a',
    })).setOrigin(contentOrigin, 0);
    const closeButton = this.add.text(rtl ? panelX + 20 : panelX + panelW - 20, panelY + 14, t('Close'), localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: buttonFont(14, size), color: '#c9b07a',
      backgroundColor: '#1a120acc', padding: { x: 12, y: 14 },
    })).setOrigin(textOriginX(1), 0)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => closeButton.setColor('#fff1c0'))
      .on('pointerout',  () => closeButton.setColor('#c9b07a'))
      .on('pointerdown', close);
    this.add.text(rtl ? panelX + 24 : panelX + panelW - 24, panelY + 64, t('J / Esc'), localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(14, size), color: '#9c8458',
    })).setOrigin(textOriginX(1), 0);

    const flags = getFlags();
    const known = ENTRIES.filter(e => flags[e.flag] !== undefined && flags[e.flag] !== false);

    let y = panelY + 72;
    if (known.length === 0) {
      this.add.text(contentX, y, t('You have learned nothing yet. Speak with the people of Shíráz.'), localizedStyle({
        fontFamily: 'Georgia, serif', fontSize: responsiveFont(18, size, 13), color: '#c9b07a', fontStyle: 'italic',
        wordWrap: { width: panelW - 48 },
      })).setOrigin(contentOrigin, 0);
    } else {
      for (const e of known) {
        this.add.text(contentX, y, rtl ? `${t(e.title)} •` : `• ${t(e.title)}`, localizedStyle({
          fontFamily: 'Georgia, serif', fontSize: responsiveFont(20, size, 14), color: '#f3d98a',
          wordWrap: { width: panelW - 48 },
        })).setOrigin(contentOrigin, 0);
        const body = e.flag === 'ending'
          ? (flags.ending === 'firstLetter'
              ? t('You bore witness, and became the first of the Letters of the Living.')
              : t('You stepped back into the night, your decision deferred.'))
          : e.body;
        const bodyX = rtl ? panelX + panelW - 40 : panelX + 40;
        const bodyText = this.add.text(bodyX, y + 28, t(body), localizedStyle({
          fontFamily: 'Georgia, serif', fontSize: responsiveFont(16, size, 12), color: '#e8d9b0',
          wordWrap: { width: panelW - 80 }, lineSpacing: 3,
        })).setOrigin(contentOrigin, 0);
        y += 28 + bodyText.height + 18;
      }
    }

    this.input.keyboard?.once('keydown-J', close);
    this.input.keyboard?.once('keydown-ESC', close);
  }
}
