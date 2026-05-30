import type { DialogueTree } from '../../dialogue/types';

export const ch4QuddusWitness: DialogueTree = {
  id: 'ch4-quddus-witness',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Quddús',
      text: 'The street is loud with judgment, yet the heart may remain quiet. What was done before the crowd need not be repeated in cruel detail; remember only that dignity can survive disgrace.',
      choices: [
        { text: '"Let me walk beside you, if only in silence."', next: 'compassion',
          effect: { set: { quddusWitnessed: true, ch4Response: 'compassion' } } },
        { text: '"I will hold my tongue and bear witness."', next: 'restraint',
          effect: { set: { quddusWitnessed: true, ch4Response: 'restraint' } } },
        { text: '"My anger rises at this injustice."', next: 'anger',
          effect: { set: { quddusWitnessed: true, ch4Response: 'anger' } } },
      ],
    },
    compassion: {
      speaker: 'Quddús',
      text: 'Compassion is a cloak no officer can strip away. Keep it close; others will need its warmth before this chapter closes.',
    },
    restraint: {
      speaker: 'Quddús',
      text: 'Restraint is not surrender. It is a lamp guarded from the wind until a darker room requires it.',
    },
    anger: {
      speaker: 'Quddús',
      text: 'Let anger become courage, not harm. The Cause is not served by mirroring the hardness that opposes it.',
    },
  },
};

export const ch4OfficerWarning: DialogueTree = {
  id: 'ch4-officer-warning',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Officer of Ḥusayn Khán',
      text: 'By order of the governor, gatherings are watched and tongues weighed. The young Siyyid is to be kept within bounds, and those who stir the bazaar will answer for it.',
      choices: [
        { text: '"We seek only to understand what has happened."', next: 'end',
          effect: { set: { officerWarningHeard: true } } },
        { text: '(Lower your eyes and pass without argument.)', next: 'end',
          effect: { set: { officerWarningHeard: true } } },
      ],
    },
    end: {
      speaker: 'Narrator',
      text: 'The officer watches the street as though silence itself were an offense. Closed doors answer him from every side.',
    },
  },
};

export const ch4HouseArrest: DialogueTree = {
  id: 'ch4-house-arrest',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mosque Witness',
      text: 'Within the Vakíl Mosque, officials pressed for submission. The Báb stood composed, neither defiant in manner nor diminished in spirit, while the city learned how fear dresses itself as authority.',
      choices: [
        { text: '"After Quddús, I choose compassion over bitterness."', next: 'compassion',
          requires: f => f.ch4Response === 'compassion' },
        { text: '"I will watch carefully and remember truthfully."', next: 'restraint',
          requires: f => f.ch4Response === 'restraint' },
        { text: '"Let my anger be turned into steadfast courage."', next: 'anger',
          requires: f => f.ch4Response === 'anger' },
        { text: '"What restraint He shows before those who confine Him."', next: 'restraint' },
      ],
    },
    compassion: {
      speaker: 'Mosque Witness',
      text: 'Then carry compassion into the alleys. Many are frightened; some have mocked what they did not dare to understand.',
      choices: [{ text: '(Remain until the order is given.)', next: 'final' }],
    },
    restraint: {
      speaker: 'Mosque Witness',
      text: 'Remember this plainly: no sword was drawn here by the believers. The wound was public shame, and the answer was composure.',
      choices: [{ text: '(Remain until the order is given.)', next: 'final' }],
    },
    anger: {
      speaker: 'Mosque Witness',
      text: 'Courage will be needed, but not cruelty. The Báb answers constraint with serenity, and the room grows smaller around those who command it.',
      choices: [{ text: '(Remain until the order is given.)', next: 'final' }],
    },
    final: {
      speaker: 'Narrator',
      onEnter: { set: { houseArrestComplete: true } },
      text: 'The decree settles over Shíráz: the Báb is confined under watch, yet the word already spoken cannot be recalled. The chapter closes not in spectacle, but in a city holding its breath.',
    },
  },
};

export const chapter04Dialogues: Record<string, DialogueTree> = {
  [ch4HouseArrest.id]: ch4HouseArrest,
  [ch4QuddusWitness.id]: ch4QuddusWitness,
  [ch4OfficerWarning.id]: ch4OfficerWarning,
};
