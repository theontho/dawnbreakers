import type { DialogueTree, FlagState } from '../../dialogue/types';
import { chapter02TravellerDialogues } from './chapter02_travellers';

/**
 * Chapter 2, summer 1844: outside the Qur'án Gate of Shíráz the Letters of
 * the Living set out in every direction. Mullá Ḥusayn carries the charge
 * the Báb gave them: proclaim that the Gate has opened, but do not yet speak
 * His name. The Báb is never a speaker; He is reached through testimony.
 */

/** Flags set by bidding farewell to the travellers around the caravanserai. */
const FAREWELL_FLAGS = [
  'ch2AliFarewell',
  'ch2WardenBlessing',
  'ch2KeeperTally',
  'ch2FalTaken',
  'ch2MubarakNews',
  'roadHeardDervish',
  'roadMetMuleteer',
] as const;

/** Farewells needed before Mullá Ḥusayn waits at the milestone. */
export const FAREWELLS_NEEDED = 3;

export function farewellCount(flags: FlagState): number {
  return FAREWELL_FLAGS.filter(flag => !!flags[flag]).length;
}

/** True once the player has done enough for the parting at the milestone. */
export function readyToPart(flags: FlagState): boolean {
  return !!flags.ch2SeekerAnswered && farewellCount(flags) >= FAREWELLS_NEEDED;
}

/** First meeting: Mullá Ḥusayn recounts the farewell charge. */
export const husaynCharge: DialogueTree = {
  id: 'ch2-husayn-charge',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá Ḥusayn',
      text: 'You came. I hoped you would. Look at them, friend: a handful of souls who found one door, and now every road out of Shíráz is leaving with one of them.',
      choices: [
        { text: '"What did He say to you all, at the last?"', next: 'charge' },
        { text: '"I still do not know what I believe. Why did you send for me?"', next: 'why',
          requires: f => f.recognised !== true },
        { text: '"Since that dawn I have thought of nothing else. Tell me everything."', next: 'charge',
          requires: f => f.recognised === true },
      ],
    },
    why: {
      speaker: 'Mullá Ḥusayn',
      text: 'Because a seeker who has not decided is still a seeker. I did not send for a believer. I sent for a friend with good ears.',
      choices: [{ text: '"Then tell me what He said to you all."', next: 'charge' }],
    },
    charge: {
      speaker: 'Mullá Ḥusayn',
      text: 'He gathered us as a father gathers sons before a long errand. He spoke of the disciples of Christ, who went out poor and changed the world by the purity of their lives. Scatter through the land, He said, with steadfast feet and sanctified hearts, and prepare the way.',
      choices: [{ text: '(Wait for him to go on.)', next: 'name' }],
    },
    name: {
      speaker: 'Mullá Ḥusayn',
      text: 'And one command above the others. We are to say that the Gate has opened and the verses are flowing. We are not yet to speak His name, not until He gives leave.',
      choices: [
        { text: '"Why hide the name of the very One you proclaim?"', next: 'seed' },
        { text: '"Where are you sent?"', next: 'where' },
      ],
    },
    seed: {
      speaker: 'Mullá Ḥusayn',
      text: 'A seed is covered with earth before it is asked to rise. The ʿulamá would tear at a name before a single heart had weighed the verses. Let them meet the light first. Then they may ask whose lamp it is.',
      choices: [{ text: '"And where are you sent?"', next: 'where' }],
    },
    where: {
      speaker: 'Mullá Ḥusayn',
      text: 'To Iṣfahán, then Káshán, then Ṭihrán. He told me that in Ṭihrán lies a mystery hidden, greater than anything in Ḥijáz or Shíráz. I do not know what He meant. I know only that I must go and find it.',
      choices: [{ text: '"And He Himself?"', next: 'pilgrimage' }],
    },
    pilgrimage: {
      speaker: 'Mullá Ḥusayn',
      text: 'He goes on pilgrimage to Mecca, by sea from Búshihr. Quddús goes with Him, the youngest of us and the last to find Him, and Mubárak to serve them both.',
      choices: [{ text: '"What would you have me do?"', next: 'task' }],
    },
    task: {
      speaker: 'Mullá Ḥusayn',
      onEnter: { set: { ch2HeardCharge: true } },
      text: 'My caravan leaves within the hour. Until then, walk among those setting out. Mullá ʿAlí waits by the gate, the muleteers are loading, and Mubárak is bargaining for mules. Bid them God-speed for me. Then find me where the road climbs north, by the milestone.',
      choices: [{ text: '"I will see them off, and then I will find you."' }],
    },
  },
};

/** Mullá Ḥusayn at the caravanserai once the charge is given. */
export const husaynWaiting: DialogueTree = {
  id: 'ch2-husayn-waiting',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá Ḥusayn',
      text: 'Not yet, friend. Go and see the others off. And if a traveller stops you on the road with questions, answer him as we were bidden.',
      choices: [
        { text: '"Tell me again what we must not say."', next: 'again' },
        { text: '"I am going."' },
      ],
    },
    again: {
      speaker: 'Mullá Ḥusayn',
      text: 'Say that the Gate has opened. Say that the verses are flowing like a river in spring. Do not say His name. A thirsty man does not need the name of the spring to drink.',
      choices: [{ text: '(Nod.)' }],
    },
  },
};

/** Mullá Ḥusayn at the milestone: the parting that closes the chapter. */
export const husaynParting: DialogueTree = {
  id: 'ch2-husayn-parting',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The Iṣfahán caravan is already a line of dust on the slope above. Mullá Ḥusayn has let it go ahead. He stands by the milestone with his staff, as if waiting for one more word.',
      choices: [{ text: '"You let them go without you?"', next: 'empty' }],
    },
    empty: {
      speaker: 'Mullá Ḥusayn',
      text: 'I walk faster than mules. You saw the others off? Then the gathering in Shíráz is ended. Strange. I have never felt less alone.',
      choices: [
        { text: '"Send me somewhere. I will go where I am needed."', next: 'send',
          requires: f => f.recognised === true },
        { text: '"I have not your certainty. But I cannot go back to Karbilá as though nothing happened."', next: 'forward',
          requires: f => f.recognised !== true },
        { text: '"A traveller asked me His name on the road. I did not give it."', next: 'seeker' },
      ],
    },
    seeker: {
      speaker: 'Mullá Ḥusayn',
      text: 'Then you have already begun the work. It is harder to keep a treasure quiet than to shout it. Now, where will your road go?',
      choices: [
        { text: '"Wherever I am needed."', next: 'send', requires: f => f.recognised === true },
        { text: '"I cannot go back as though nothing happened."', next: 'forward', requires: f => f.recognised !== true },
      ],
    },
    send: {
      speaker: 'Mullá Ḥusayn',
      text: 'I cannot send you. That was not given to me. But you are a seeker with a free road. Pilgrim ships sail for Jidda from Búshihr this season. Who knows what a pilgrim might witness at the House of God this year?',
      choices: [{ text: '(Understand him.)', next: 'embrace' }],
    },
    forward: {
      speaker: 'Mullá Ḥusayn',
      text: 'Then do not go back. Go forward, as a pilgrim if not yet as a believer. Pilgrim ships sail for Jidda from Búshihr this season. Watch, and listen, and let the House of God settle your heart.',
      choices: [{ text: '(Understand him.)', next: 'embrace' }],
    },
    embrace: {
      speaker: 'Narrator',
      text: 'He embraces you. His cloak smells of road dust and lamp oil. "Pray for me in Ṭihrán," he says, "and I will pray for you at sea."',
      choices: [
        { text: '"Go with God, Mullá Ḥusayn."', next: 'end', effect: { set: { ch2ChoseSea: true } } },
        { text: '(Say nothing. Hold on a moment longer.)', next: 'end', effect: { set: { ch2ChoseSea: true } } },
      ],
    },
    end: {
      speaker: 'Narrator',
      onEnter: { set: { roadComplete: true } },
      text: 'He climbs into the pass and does not look back. You watch until he is no larger than a letter on a page. Then you turn, pass once more beneath the Book above the gate, and take the long road south to Búshihr, where the ships wait for the wind to the Ḥijáz.',
    },
  },
};

/** A seeker walking toward Shíráz: the test of the instruction not to name Him. */
export const roadEncounter: DialogueTree = {
  id: 'road-encounter',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Another Seeker',
      text: 'Peace upon you! I have walked from Yazd on a rumour. They say that in Shíráz someone... (He catches his breath.) Is it true? Has the Promised One appeared? Who is He?',
      choices: [
        { text: '"It is true. The Gate has opened. I believe it with my whole heart."',
          next: 'certain', requires: f => f.recognised === true,
          effect: { set: { sharedNews: true, roadCertaintyShared: true } } },
        { text: '"Something happened in Shíráz. I sat outside the door all night. I am still trying to understand it."',
          next: 'uncertain', requires: f => f.recognised !== true,
          effect: { set: { sharedNews: true, roadUncertainWitness: true } } },
        { text: '(Speak His name.)', next: 'nearly', effect: { set: { ch2NearlyNamed: true } } },
      ],
    },
    nearly: {
      speaker: 'Narrator',
      text: 'The name rises to your lips like water to the brim of a jar. Then you remember Mullá Ḥusayn\'s quiet voice: say that the Gate has opened; do not say His name.',
      choices: [{ text: '(Close your lips on it.)', next: 'withheld' }],
    },
    withheld: {
      speaker: 'Another Seeker',
      text: 'You hesitate. Is the name dangerous, or only precious?',
      choices: [
        { text: '"Both. Go to Shíráz and search. If it is true, you will not need me to tell you."',
          next: 'counsel', effect: { set: { directionsGiven: true } } },
      ],
    },
    certain: {
      speaker: 'Another Seeker',
      text: '(His hand goes to his breast.) Then tell me His name, and where He lives, and I will run the whole way.',
      choices: [
        { text: '"I may not tell you His name yet. But the verses are flowing in Shíráz. Search with a pure heart and you will be found."',
          next: 'counsel', effect: { set: { directionsGiven: true } } },
      ],
    },
    uncertain: {
      speaker: 'Another Seeker',
      text: 'There is honesty in trembling. A borrowed flame gutters; a hidden ember may yet kindle. But tell me at least where I should knock.',
      choices: [
        { text: '"I may not say whose door. Ask in Shíráz for those whose faces have changed. They will know you are searching."',
          next: 'counsel', effect: { set: { directionsGiven: true } } },
      ],
    },
    counsel: {
      speaker: 'Another Seeker',
      text: 'A Gate without a name. (He laughs softly.) Very well. If a nameless light can make you guard it like this, it is worth the walk. I will search until I am found.',
      choices: [{ text: '"May your search be accepted."', next: 'farewell' }],
    },
    farewell: {
      speaker: 'Narrator',
      onEnter: { set: { ch2SeekerAnswered: true } },
      text: 'He shoulders his bundle and goes down toward the Qur\'án Gate, against the stream of those leaving. You wonder how many more like him are already on the roads, walking toward a name that no one will speak.',
    },
  },
};

export const chapter02Dialogues: Record<string, DialogueTree> = {
  [husaynCharge.id]: husaynCharge,
  [husaynWaiting.id]: husaynWaiting,
  [husaynParting.id]: husaynParting,
  [roadEncounter.id]: roadEncounter,
  ...chapter02TravellerDialogues,
};
