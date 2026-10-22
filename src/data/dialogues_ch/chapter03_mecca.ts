import type { DialogueTree } from '../../dialogue/types';
import { chapter03ShipDialogues } from './chapter03_ship';

/**
 * Chapter 3, Dhu'l-Ḥijjah 1260 (December 1844): Mecca. Quddús walked from
 * Jidda holding the bridle of the Báb's camel; at Muná nineteen lambs were
 * offered; near the Kaʿba the Báb declared His station, and challenged
 * Mírzá Muḥíṭ-i-Kirmání to submit or deny, who deferred his answer to
 * Medina and never gave it. The Báb is told only through narration.
 */

export const quddusMecca: DialogueTree = {
  id: 'ch3-quddus-mecca',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Quddús sits in the shade of the colonnade with his feet bound in strips of cloth. He walked every step of the way from Jidda.',
      choices: [{ text: '"Quddús. Your feet."', next: 'feet' }],
    },
    feet: {
      speaker: 'Quddús',
      text: 'From Jidda to Mecca He rode, and I held the bridle of His camel and walked. They offered me a mount. How could I ride, when I could walk beside Him? The feet will heal.',
      choices: [
        { text: '"What happens now that we are here?"', next: 'now' },
        { text: '"Has He written to anyone in Mecca?"', next: 'sharif' },
      ],
    },
    sharif: {
      speaker: 'Quddús',
      onEnter: { set: { ch3HeardSharif: true } },
      text: 'To the Sharíf of Mecca, guardian of the House. I carried the letter myself. The Sharíf was busy with the affairs of the season. He took it and set it aside unopened while I stood there. Perhaps one day he will remember it.',
      choices: [{ text: '"And now?"', next: 'now' }],
    },
    now: {
      speaker: 'Quddús',
      onEnter: { set: { ch3QuddusMecca: true } },
      text: 'He has performed the rites as any pilgrim does. But He has not crossed the sea only to circle the House. Stand near the Kaʿba this afternoon, by the door. And mark Mírzá Muḥíṭ of Kirmán, the Shaykhí scholar under the north colonnade, who wears his learning like a cloak of office.',
      choices: [{ text: '"I will be there."' }],
    },
  },
};

/** Mubárak in the courtyard: the sacrifice at Muná. */
export const mubarakMecca: DialogueTree = {
  id: 'ch3-mubarak-mecca',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mubárak, the Household Servant',
      text: '(He is washing a hem stained dark at the edge, and does not look up at once.) Forgive me. I have not been able to stop weeping since Muná.',
      choices: [{ text: '"What happened at Muná?"', next: 'muna' }],
    },
    muna: {
      speaker: 'Mubárak, the Household Servant',
      onEnter: { set: { ch3HeardSacrifice: true } },
      text: 'On the day of sacrifice my Master offered nineteen lambs. Nine in His own name. Seven in the name of Quddús. And three in mine. Three, for a servant! The meat was given to the poor of Muná. I held the knife-cloth and could not see for tears.',
      choices: [
        { text: '"You have come a long way from trimming the lamp."', next: 'lamp', requires: f => !!f.vigilKept },
        { text: '"He honours those who serve."', next: 'serve' },
      ],
    },
    lamp: {
      speaker: 'Mubárak, the Household Servant',
      text: 'From the lamp in Shíráz to the House of God. (He wrings out the hem.) And it is the same lamp, friend. I think it was always the same lamp.',
      choices: [{ text: '(Help him spread the cloth to dry.)' }],
    },
    serve: {
      speaker: 'Mubárak, the Household Servant',
      text: 'He honours everyone. That is the difficulty. A servant knows what to do with orders. I do not know what to do with honour, except weep.',
      choices: [{ text: '(Sit with him a while.)' }],
    },
  },
};

/** A Meccan seller of Zamzam water. */
export const zamzamSeller: DialogueTree = {
  id: 'ch3-zamzam-seller',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Water-Seller',
      text: 'Zamzam! Zamzam, cold from the well of Hagar! My father carried it, and his father. A hundred years my family has filled pilgrims\' cups. Drink, Persian, you look like a man who crossed the sea.',
      choices: [
        { text: '(Drink.)', next: 'drink' },
        { text: '"Have you served many Persians this year?"', next: 'persians' },
      ],
    },
    drink: {
      speaker: 'A Water-Seller',
      onEnter: { set: { ch3Zamzam: true } },
      text: 'Heavy, yes? And a little salt. Colder than it has any right to be. My grandmother said it tastes of whatever you were praying for. (He grins.) Mine tastes of rent.',
      choices: [{ text: '"Have you served many Persians this year?"', next: 'persians' }],
    },
    persians: {
      speaker: 'A Water-Seller',
      onEnter: { set: { ch3Zamzam: true } },
      text: 'Hundreds. They argue about the price and then overpay. One young Siyyid in a green turban thanked me in Arabic finer than the imam\'s, and asked how my children were, as if He had time. In Mecca, in the season, nobody has time.',
      choices: [{ text: '"Peace be on your house."' }],
    },
  },
};

/** A pilgrim from Hindustán, before and after the proclamation. */
export const pilgrimQuestion: DialogueTree = {
  id: 'ch3-pilgrim-question',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Pilgrim',
      text: 'We have crossed half the world to stand where generations have turned in prayer. I came from Lucknow. Speak softly here; every heart carries its own supplication.',
      choices: [
        { text: '"Did you hear what was said by the Kaʿba this afternoon?"', next: 'after',
          requires: f => !!f.ch3HeardProclamation },
        { text: '"Have you heard of a young Siyyid from Shíráz?"', next: 'before',
          requires: f => !f.ch3HeardProclamation },
        { text: '(Offer a quiet greeting and step aside.)' },
      ],
    },
    before: {
      speaker: 'Pilgrim',
      onEnter: { set: { ch3AskedPilgrim: true } },
      text: 'There are a hundred thousand souls in Mecca, friend, and half of them are young, and some of them are from Shíráz. (He smiles.) What makes yours different?',
      choices: [{ text: '"Perhaps you will hear for yourself."' }],
    },
    after: {
      speaker: 'Pilgrim',
      onEnter: { set: { ch3AskedPilgrim: true } },
      text: 'A young man spoke of the Qá\'im, I think. There are always men saying things in Mecca. I was praying for my daughter, who is ill. (He pauses.) Should I have listened?',
      choices: [
        { text: '"There is still time to listen."' },
        { text: '"Pray for your daughter. God hears both."' },
      ],
    },
  },
};

/** The courtyard before Quddús has asked the player to come. */
export const hushWaiting: DialogueTree = {
  id: 'ch3-hush-waiting',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Pilgrims circle the Kaʿba in white, a slow river of murmured prayer. Nothing marks this place yet. Quddús, resting somewhere under the colonnade, may know why you have been drawn here.',
    },
  },
};

/** The proclamation by the Kaʿba, told entirely in narration. */
export const proclamation: DialogueTree = {
  id: 'ch3-proclamation',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Afternoon light lies gold on the pavement. Near the door of the House, among the circling pilgrims, a young man of Shíráz in a green turban stands still. Quddús is a step behind Him. Mubárak holds their sandals.',
      choices: [{ text: '(Draw closer.)', next: 'voice' }],
    },
    voice: {
      speaker: 'Narrator',
      text: 'Then He speaks, not loudly, yet every word carries. He declares that He is the One whose advent they have been awaiting, the Qá\'im promised to the House of Muḥammad, and that any who seek the truth of it may come and ask.',
      choices: [
        { text: '(Listen in awe.)', next: 'awe', effect: { set: { ch3ProclaimAwe: true } } },
        { text: '(Listen with cautious attention.)', next: 'caution', effect: { set: { ch3ProclaimCaution: true } } },
        { text: '(Listen as a student of sacred history.)', next: 'scholar', effect: { set: { ch3ProclaimScholar: true } } },
      ],
    },
    awe: {
      speaker: 'Narrator',
      text: 'The words reach you without ornament or spectacle: a call to God, to renewal, to the Day long awaited by searching hearts. Your eyes sting, and you do not know why.',
      choices: [{ text: '(Look around you.)', next: 'crowd' }],
    },
    caution: {
      speaker: 'Narrator',
      text: 'The words are clear, measured, and fearless. If your heart trembles, it is not coerced. It is invited, and left free.',
      choices: [{ text: '(Look around you.)', next: 'crowd' }],
    },
    scholar: {
      speaker: 'Narrator',
      text: 'You attend to phrase, station, and implication, and the moment outgrows your commentary. A claim has been made in the one place every Muslim turns toward in prayer.',
      choices: [{ text: '(Look around you.)', next: 'crowd' }],
    },
    crowd: {
      speaker: 'Narrator',
      text: 'And the river of pilgrims flows on. A few heads turn. A man nearby frowns and returns to his prayers. A hundred thousand souls are in Mecca this season, and almost none of them have heard.',
      choices: [{ text: '(Search the crowd.)', next: 'muhit' }],
    },
    muhit: {
      speaker: 'Narrator',
      onEnter: { set: { ch3HeardProclamation: true } },
      text: 'One face has gone pale: Mírzá Muḥíṭ-i-Kirmání, the Shaykhí scholar. He turns from the House and walks quickly toward the north colonnade, his prayer beads still in his fist.',
    },
  },
};

/** Muḥíṭ before the proclamation: aloof. */
export const muhitAloof: DialogueTree = {
  id: 'ch3-muhit-aloof',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mírzá Muḥíṭ-i-Kirmání',
      text: '(He does not lower his prayer beads.) I sat at the feet of Siyyid Káẓim for many years, and many of his students now look to me. If you are a student, find a teacher. If you are a pilgrim, pray. I am occupied.',
    },
  },
};

/** Muḥíṭ after the proclamation: the challenge, and his deferral to Medina. */
export const muhitChallenge: DialogueTree = {
  id: 'ch3-muhit',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mírzá Muḥíṭ-i-Kirmání',
      text: '(His beads have stopped.) You are one of His Persians? Then you will hear it soon enough. He found me by the Black Stone. He took my hand in His.',
      choices: [{ text: '"What did He say to you?"', next: 'said' }],
    },
    said: {
      speaker: 'Mírzá Muḥíṭ-i-Kirmání',
      text: 'That I, who am called an heir of Siyyid Káẓim, must now choose. Either I submit to His Cause without reserve, or I deny it before this House. He offered to answer any question I might bring, here or at the Prophet\'s tomb in Medina.',
      choices: [
        { text: '"What did you answer?"', next: 'answer' },
        { text: '"Our teacher told us the Promised One was near. Did you not hear him too?"', next: 'teacher',
          requires: f => f.recognised === true },
        { text: '"I am still weighing it myself. How do you weigh it?"', next: 'teacher',
          requires: f => f.recognised !== true },
      ],
    },
    teacher: {
      speaker: 'Mírzá Muḥíṭ-i-Kirmání',
      text: 'He told us many things. He told us the test would be severe. (His voice drops.) A man who has been called master for many years does not easily become a student again.',
      choices: [{ text: '"And what did you answer Him?"', next: 'answer' }],
    },
    answer: {
      speaker: 'Mírzá Muḥíṭ-i-Kirmání',
      text: 'That I would give my answer at Medina. I need time. (He looks toward the Kaʿba, and away again.) Such a claim cannot be weighed as common speech. If it is true, the age itself has turned, and I with it.',
      choices: [
        { text: '"Then may Medina find you ready."', next: 'leave' },
        { text: '"Time has a way of answering for us."', next: 'leave' },
      ],
    },
    leave: {
      speaker: 'Narrator',
      onEnter: { set: { ch3MuhitChallenge: true } },
      text: 'He gathers his cloak and his students and goes out through the colonnade. You will learn later that he never came to Medina to give his answer, and soon left the Ḥijáz altogether. On the road between the two holy cities, an epistle was written for him all the same.',
    },
  },
};

/** Quddús at the gate: the departure for Medina that closes the chapter. */
export const medinaRoad: DialogueTree = {
  id: 'ch3-medina-road',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Quddús',
      text: 'Mírzá Muḥíṭ has gone? Then the House has heard what it needed to hear. We leave for Medina in the morning, for the Prophet\'s tomb, and then home by sea.',
      choices: [
        { text: '"Will Muḥíṭ keep his word?"', next: 'muhit' },
        { text: '"What will be waiting for us at home?"', next: 'home' },
      ],
    },
    muhit: {
      speaker: 'Quddús',
      text: 'He said Medina. We will wait for him there. (A pause.) I think the waiting is for his sake, not ours.',
      choices: [{ text: '"And at home?"', next: 'home' }],
    },
    home: {
      speaker: 'Quddús',
      text: 'Letters have reached Him from Mullá Ḥusayn and the others. Where they went, the land is stirring, and the ʿulamá are waking. We will not come home quietly.',
      choices: [
        { text: '"Then I will come home with you."', next: 'end', requires: f => f.recognised === true },
        { text: '"I came to watch. I find I cannot stop."', next: 'end', requires: f => f.recognised !== true },
      ],
    },
    end: {
      speaker: 'Narrator',
      onEnter: { set: { meccaComplete: true } },
      text: 'The proclamation passes from voice into memory. No trumpet answers it; no marvel compels the crowd. Yet a seed has been entrusted to history before the most ancient House. In the spring of 1845 the ship turns again toward Búshihr, and toward a Shíráz where opposition is gathering.',
    },
  },
};

export const chapter03Dialogues: Record<string, DialogueTree> = {
  ...chapter03ShipDialogues,
  [quddusMecca.id]: quddusMecca,
  [mubarakMecca.id]: mubarakMecca,
  [zamzamSeller.id]: zamzamSeller,
  [pilgrimQuestion.id]: pilgrimQuestion,
  [hushWaiting.id]: hushWaiting,
  [proclamation.id]: proclamation,
  [muhitAloof.id]: muhitAloof,
  [muhitChallenge.id]: muhitChallenge,
  [medinaRoad.id]: medinaRoad,
};
