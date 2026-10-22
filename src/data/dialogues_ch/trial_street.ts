import type { DialogueTree, FlagState } from '../../dialogue/types';

/**
 * The square before the governor's residence in Tabríz, summer 1848. The
 * Báb has been brought down from Chihríq to be examined before the
 * Valí-ʿAhd and the divines. The crowd at the gate knows only rumour; ʿAẓím
 * knows what was said to him the night before. The gate guard takes the
 * player in as a servant for the day.
 */

const STREET_WITNESS_FLAGS = ['trialHeardMerchant', 'trialMetAzim'] as const;

/** How many of the square's people the player has heard before going in. */
export function streetWitnessCount(f: FlagState): number {
  return STREET_WITNESS_FLAGS.filter(flag => !!f[flag]).length;
}

/** A cloth merchant who has shut his shop to stand in the crowd. */
export const trialMerchant: DialogueTree = {
  id: 'trial-merchant',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Cloth Merchant',
      text: 'Silk from Gílán, cotton from Iṣfahán, nobody buying. (He nods at the crowd round the residence gate.) Half the bazaar has put up its shutters to stand in this square.',
      choices: [
        { text: '"Who are they waiting for?"', next: 'who' },
        { text: '"Why has the bazaar shut?"', next: 'who' },
      ],
    },
    who: {
      speaker: 'A Cloth Merchant',
      text: 'For the Siyyid from Chihríq, the one they call the Báb. They have brought Him down from the mountain to be examined by the Valí-ʿAhd, our Crown Prince, and by the divines.',
      choices: [{ text: '"Where have they kept Him?"', next: 'outside' }],
    },
    outside: {
      speaker: 'A Cloth Merchant',
      text: 'Outside the city gate. When He came, so many ran out to see Him that they dared not lodge Him inside the walls. Only those He asked for were let near Him.',
      choices: [{ text: '"Have you seen Him?"', next: 'urumiyyih' }],
    },
    urumiyyih: {
      speaker: 'A Cloth Merchant',
      text: 'No, but my cousin trades at Urúmíyyih, and he saw Him pass on the road. The prince there gave Him a horse no groom could ride, to try Him. It stood still under His hand like a lamb. After, the people carried away the water He had washed in, by the jarful.',
      choices: [{ text: '"And today?"', next: 'today' }],
    },
    today: {
      speaker: 'A Cloth Merchant',
      onEnter: { set: { trialHeardMerchant: true } },
      text: 'Today the Niẓámu\'l-ʿUlamá presides, the Valí-ʿAhd\'s own tutor, and every turban in Tabríz is inside. (He lowers his voice.) The Valí-ʿAhd is seventeen. My son is seventeen. I would not let my son judge a quarrel over a goat.',
    },
  },
};

/** ʿAẓím, who the night before heard the Báb declare that He is the Qáʾim, and doubted until dawn. */
export const trialAzim: DialogueTree = {
  id: 'trial-azim',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'ʿAẓím',
      text: '(A tall mullá stands apart from the crowd, hands folded, with the look of a man who has not slept.) You have the face of one who has climbed to Chihríq. I am Mullá Shaykh ʿAlí, of Khurásán. He calls me ʿAẓím.',
      choices: [
        { text: '"I climbed it in the snow, and stood below His window."', next: 'window',
          requires: f => f.recognised === true },
        { text: '"You look as if you have not slept."', next: 'night' },
      ],
    },
    window: {
      speaker: 'ʿAẓím',
      text: 'Then we are both pilgrims of that mountain. (He almost smiles.) But it is last night I must tell someone of, or burst.',
      choices: [{ text: '"Tell me."', next: 'night' }],
    },
    night: {
      speaker: 'ʿAẓím',
      text: 'He sent for me last night, there in the house outside the gate. He told me plainly that He is the Qáʾim, the One whose coming we have awaited all our lives, and that today, before the Valí-ʿAhd and all the divines, He would declare it openly.',
      choices: [{ text: '"And you?"', next: 'doubt' }],
    },
    doubt: {
      speaker: 'ʿAẓím',
      text: 'I have followed Him for years. I believed Him the Gate, and gladly. But the Qáʾim Himself? All night it turned in me like a millstone. I could not pray. I could not lie still.',
      choices: [
        { text: '"I know that stone. I have carried one since Shíráz."', next: 'stone',
          requires: f => f.recognised !== true },
        { text: '"What changed?"', next: 'dawn' },
      ],
    },
    stone: {
      speaker: 'ʿAẓím',
      text: 'Then do not be ashamed of your night. Only be faithful to your morning, when it comes. Mine came with the sun.',
      choices: [{ text: '"What changed?"', next: 'dawn' }],
    },
    dawn: {
      speaker: 'ʿAẓím',
      onEnter: { set: { trialMetAzim: true } },
      text: 'Nothing I can name. The sun rose, and the stone was bread. I went to Him and begged His forgiveness. He told me my faith would grow so firm that if I were torn apart it would not waver. (He looks at the gate.) Today He says it to all of them.',
    },
  },
};

/** The guard at the residence gate, before the player has heard the square. */
export const trialGateFarrashLocked: DialogueTree = {
  id: 'trial-gate-farrash-locked',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Gate Guard',
      text: 'Back! Back from the gate. No one passes today but turbans and the Valí-ʿAhd\'s own household. (He sizes you up.) And you are neither. Go and gawp with the rest.',
    },
  },
};

/** The guard takes the player in as a servant for the day. */
export const trialGateFarrash: DialogueTree = {
  id: 'trial-gate-farrash',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Gate Guard',
      text: 'You. Yes, you, the stranger who keeps asking questions. The steward is short of hands for the coffee and the water-pipes; half his boys have run off to the rooftops. Can you carry a tray without spilling it?',
      choices: [
        { text: '"I can."', next: 'in' },
        { text: '"What is happening inside?"', next: 'inside' },
      ],
    },
    inside: {
      speaker: 'A Gate Guard',
      text: 'What happens inside is no business of a gate. Carry the tray and keep your eyes on your feet, and you will see more than I will.',
      choices: [{ text: '"Then I will carry it."', next: 'in' }],
    },
    in: {
      speaker: 'A Gate Guard',
      onEnter: { set: { trialHired: true } },
      text: 'In with you, then. Find the Valí-ʿAhd\'s page by the hall steps, and do not speak unless you are spoken to. If anyone asks, you belong to the steward.',
    },
  },
};

export const trialStreetDialogues: Record<string, DialogueTree> = {
  [trialMerchant.id]: trialMerchant,
  [trialAzim.id]: trialAzim,
  [trialGateFarrashLocked.id]: trialGateFarrashLocked,
  [trialGateFarrash.id]: trialGateFarrash,
};
