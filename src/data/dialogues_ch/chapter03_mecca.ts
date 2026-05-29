import type { DialogueTree } from '../../dialogue/types';

export const quddusShip: DialogueTree = {
  id: 'ch3-quddus-ship',
  startId: 'g',
  nodes: {
    g: {
      id: 'g',
      speaker: 'Quddús',
      text: 'The sea is wide, yet the heart may be wider. We journey toward the House raised for remembrance, and every wave counsels detachment.',
      choices: [
        { text: '"I feel awe at what may unfold."', next: 'awe', effect: { set: { ch3ShipAwe: true } } },
        { text: '"I fear that certainty asks more than I possess."', next: 'caution', effect: { set: { ch3ShipCaution: true } } },
        { text: '"I watch the signs and weigh them carefully."', next: 'scholar', effect: { set: { ch3ShipScholar: true } } },
      ],
    },
    awe: {
      id: 'awe',
      speaker: 'Quddús',
      text: 'Then keep that awe humble. The Cause is not made greater by our amazement; rather, our souls are made quieter before it.',
      choices: [{ text: '(Bow your head and listen to the sea.)' }],
    },
    caution: {
      id: 'caution',
      speaker: 'Quddús',
      text: 'Caution can be a lantern if it is not allowed to become a veil. Ask for steadfastness, and walk one faithful step at a time.',
      choices: [{ text: '(Let his words settle.)' }],
    },
    scholar: {
      id: 'scholar',
      speaker: 'Quddús',
      text: 'The learned eye has its station. Yet some truths are recognized only when learning kneels beside love.',
      choices: [{ text: '(Remember this counsel.)' }],
    },
  },
};

export const pilgrimQuestion: DialogueTree = {
  id: 'ch3-pilgrim-question',
  startId: 'g',
  nodes: {
    g: {
      id: 'g',
      speaker: 'Pilgrim',
      text: 'We have crossed hardship to stand where generations have turned in prayer. Speak softly here; every heart carries its own supplication.',
      choices: [
        { text: '"What have you heard of the young Siyyid?"', next: 'heard' },
        { text: '(Offer a quiet greeting and step aside.)' },
      ],
    },
    heard: {
      id: 'heard',
      speaker: 'Pilgrim',
      text: 'Only whispers: learning beyond His years, courage without display, and companions whose faces are changed by nearness to Him.',
      choices: [{ text: '(Thank the pilgrim.)', effect: { set: { ch3AskedPilgrim: true } } }],
    },
  },
};

export const proclamation: DialogueTree = {
  id: 'ch3-proclamation',
  startId: 'g',
  nodes: {
    g: {
      id: 'g',
      speaker: 'Narrator',
      text: 'In the sacred courtyard, before the Kaʿba, the Báb stands with composed majesty. The voices around you fall into a hush that seems to gather history into a single breath.',
      choices: [
        { text: '(Listen in awe.)', next: 'awe' },
        { text: '(Listen with cautious attention.)', next: 'caution' },
        { text: '(Observe as a student of sacred history.)', next: 'scholar' },
      ],
    },
    awe: {
      id: 'awe',
      speaker: 'The Báb',
      text: 'He proclaims His mission with no ornament of spectacle: a call to God, to renewal, and to the Day long awaited by searching hearts.',
      choices: [{ text: '(Receive the words in silence.)', next: 'muhit' }],
    },
    caution: {
      id: 'caution',
      speaker: 'The Báb',
      text: 'His words are clear, measured, and fearless. If your heart trembles, it is not coerced; it is invited to recognize truth with purity.',
      choices: [{ text: '(Continue listening.)', next: 'muhit' }],
    },
    scholar: {
      id: 'scholar',
      speaker: 'The Báb',
      text: 'You attend to phrase, station, and implication; yet the moment exceeds commentary. A proclamation is made where pilgrims turn their faces to God.',
      choices: [{ text: '(Let study become reverence.)', next: 'muhit' }],
    },
    muhit: {
      id: 'muhit',
      speaker: 'Mírzá Muḥíṭ-i-Kirmání',
      text: 'He lowers his gaze, troubled and moved. "Such a claim cannot be weighed as common speech. If it is true, the age itself has turned."',
      choices: [{ text: '(Stand quietly as the pilgrimage bears witness.)', next: 'end' }],
    },
    end: {
      id: 'end',
      speaker: 'Narrator',
      onEnter: { set: { meccaComplete: true } },
      text: 'The proclamation passes from voice into memory. No trumpet answers it, no outward marvel compels belief; yet a seed has been entrusted to history before the most sacred House.',
    },
  },
};

export const chapter03Dialogues: Record<string, DialogueTree> = {
  [quddusShip.id]: quddusShip,
  [pilgrimQuestion.id]: pilgrimQuestion,
  [proclamation.id]: proclamation,
};
