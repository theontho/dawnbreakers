import type { DialogueTree } from '../../dialogue/types';

export const unveiling: DialogueTree = {
  id: 'ch7-unveiling',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Ṭáhirih',
      text: 'Friend, the garden has grown still because a sign has been made plain. I have not come to be gazed upon; I have come to summon hearts from imitation to recognition.',
      choices: [
        { text: '"This shocks me, yet I will listen before I judge."', next: 'shock', effect: { set: { badashtResponse: 'shock' } } },
        { text: '"You speak with the courage of one who knows her hour."', next: 'defence', effect: { set: { badashtResponse: 'defence' } } },
        { text: '(Remain silent, weighing what has changed.)', next: 'silence', effect: { set: { badashtResponse: 'silence' } } },
        { text: '"Teach me what this sign means."', next: 'explain', effect: { set: { badashtResponse: 'seeking' } } },
      ],
    },
    shock: {
      speaker: 'Ṭáhirih',
      text: 'Then let your shock become a doorway, not a chain. The old order taught fear before truth; the new summons conscience, learning, and courage before God.',
      choices: [
        { text: '"I will carry my unease honestly, and still listen."', next: 'call' },
      ],
    },
    defence: {
      speaker: 'Ṭáhirih',
      text: 'Courage belongs to the Cause, not to me alone. If a woman must speak so the sleepers awaken, then let my voice be clear and accountable.',
      choices: [
        { text: '"May clarity prevail over fear."', next: 'call' },
      ],
    },
    silence: {
      speaker: 'Ṭáhirih',
      text: 'Silence can be reverence, or it can be retreat. Search your heart, and let it become witness rather than hiding place.',
      choices: [
        { text: '(Lift your eyes and attend.)', next: 'call' },
      ],
    },
    explain: {
      speaker: 'Ṭáhirih',
      text: 'Badasht is not a camp of novelty. It is the place where what was hidden is declared: the Primal Point has opened a new day, and borrowed veils cannot govern its sun.',
      choices: [
        { text: '"Then this is proclamation, not provocation."', next: 'call' },
      ],
    },
    call: {
      speaker: 'Ṭáhirih',
      text: 'Go now among the tents. Some hearts tremble; some resist; some are already aflame. Let them hear that dignity and truth have walked together in this garden.',
      choices: [
        { text: '(Seek Bahá\'u\'lláh, whose tent gathers the divided friends.)', next: 'reconciliation' },
      ],
    },
    reconciliation: {
      speaker: 'Narrator',
      onEnter: { set: { badashtComplete: true } },
      text: 'As the evening lamps are lit, Bahá\'u\'lláh names the new dispensation, gives new names, steadies wounded hearts, and draws the camps back into one purpose. Badasht has made visible the break between yesterday and the dawn now rising.',
    },
  },
};

export const quddusTension: DialogueTree = {
  id: 'ch7-quddus-tension',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Quddús',
      text: 'The friends whisper as though the garden itself has been overturned. A new Revelation must be proclaimed, yet proclamation can wound those who have only just learned to stand.',
      choices: [
        { text: '"Is caution now a form of mercy?"', next: 'caution' },
        { text: '"Is boldness now required of everyone?"', next: 'boldness' },
      ],
    },
    caution: {
      speaker: 'Quddús',
      text: 'Mercy is not delay for its own sake. It is the art of guiding a soul to the threshold without breaking what must be strengthened.',
      choices: [
        { text: '"Then the friends need both firmness and tenderness."', next: 'end' },
      ],
    },
    boldness: {
      speaker: 'Quddús',
      text: 'Boldness is required, yes — but not vanity. The Cause asks for obedience to truth, and truth is larger than any one temperament in this camp.',
      choices: [
        { text: '"I will remember that courage must remain humble."', next: 'end' },
      ],
    },
    end: {
      speaker: 'Narrator',
      text: 'Quddús turns toward the central path. Around him the conference breathes with tension: a necessary wound, awaiting the hand that will bind it.',
    },
  },
};

export const bahaullahReconcile: DialogueTree = {
  id: 'ch7-bahaullah-reconcile',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Messenger at the Central Tent',
      text: 'Come in peace. Counsel from the central tent is passing through the camp: no soul gathered here is served by scorn — not the one who trembles, not the one who proclaims, not the one who has misunderstood both.',
      choices: [
        { text: '"How can the friends be made one again?"', next: 'names' },
        { text: '"I fear this day will scatter them."', next: 'fear' },
      ],
    },
    fear: {
      speaker: 'Messenger at the Central Tent',
      text: 'The reply is carried gently: a storm may scatter dry leaves, but it also clears the air. Let this day be remembered not for confusion, but for the meanings it forced into the open.',
      choices: [
        { text: '"Then reconciliation must tell the truth plainly."', next: 'names' },
      ],
    },
    names: {
      speaker: 'Narrator',
      text: 'Within the central tent, new names are given, and with them a charge: to arise as servants of a new Day. Ṭáhirih has spoken with agency; Quddús has guarded the friends; now unity must deepen, not erase, what has been revealed.',
      choices: [
        { text: '(Let the gathering settle beneath the lamps.)', next: 'complete' },
      ],
    },
    complete: {
      speaker: 'Narrator',
      onEnter: { set: { badashtComplete: true } },
      text: 'By nightfall, the three camps are no longer merely separate places on the garden paths. They have become witnesses to one turning point: the old dispensation has been left behind, and the believers must learn how to walk forward together.',
    },
  },
};

export const shakenBeliever: DialogueTree = {
  id: 'ch7-shaken-believer',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Shaken Believer',
      text: 'I came to Badasht seeking counsel, and now the very ground beneath counsel has moved. Was this unveiling a rupture, or a mercy I am too frightened to understand?',
      choices: [
        { text: '"Let us not answer fear with accusation."', next: 'steady' },
        { text: '"Go to the central tent; the friends are being reconciled there."', next: 'steady' },
      ],
    },
    steady: {
      speaker: 'A Shaken Believer',
      text: 'Then I will breathe, and listen. If this is truly a new Day, perhaps my first service is not to master it, but to cease speaking against the light before I have seen it clearly.',
    },
  },
};

export const chapter07Dialogues: Record<string, DialogueTree> = {
  [unveiling.id]: unveiling,
  [quddusTension.id]: quddusTension,
  [bahaullahReconcile.id]: bahaullahReconcile,
  [shakenBeliever.id]: shakenBeliever,
};
