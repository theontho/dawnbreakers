import type { DialogueTree, FlagState } from '../../dialogue/types';

/**
 * Chihríq, the "Grievous Mountain", spring and summer 1848. The warden is
 * Yaḥyá Khán; the visitors keep coming. The chapter closes at the barred
 * window of the keep and turns toward the summer gathering at Badasht.
 */

/** Witnesses heard at Chihríq besides the warden; two open the final watch. */
export function chihriqWitnesses(f: FlagState): number {
  return ['ch6MetDayyan', 'ch6MetDervish', 'ch6HeardKurds', 'ch6CourierBadasht']
    .filter(flag => !!f[flag]).length;
}

export const ch6YahyaKhan: DialogueTree = {
  id: 'ch6-yahya-khan',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Yaḥyá Khán, Warden of Chihríq',
      text: 'Another one. My orders are as strict as any ʿAlí Khán ever had: keep the Siyyid apart, let no one near. Look around you, stranger, and tell me how I am doing.',
      choices: [
        { text: '"The hamlet below seems full of pilgrims."', next: 'full' },
        { text: '"You seem a fair man."', next: 'fair' },
      ],
    },
    full: {
      speaker: 'Yaḥyá Khán',
      text: 'Full! Kurds who never prayed twice in a week stand at my gate. Learned men from Khuy. A dervish from India, God help me. I turned some away. They came back. How does one shut a door against the whole of Ádhirbáyján?',
      choices: [{ text: '"Perhaps one does not."', next: 'leave' }],
    },
    fair: {
      speaker: 'Yaḥyá Khán',
      text: 'Fair. (He weighs the word.) My sister sits beside the Sháh. I was chosen because blood is meant to be harder than snow. But I have watched Him for weeks now, and I am not as hard as they hoped.',
      choices: [{ text: '"Few are, near Him."', next: 'leave' }],
    },
    leave: {
      speaker: 'Yaḥyá Khán',
      onEnter: { set: { ch6MetYahyaKhan: true } },
      text: 'Go in, then. Siyyid Ḥusayn has his corner by the keep. Do not crowd the window, and do not make me regret this. The Grand Vizier has long ears, and this mountain has very few trees to hide behind.',
      choices: [{ text: '(Thank him, and pass through the gate.)' }],
    },
  },
};

export const ch6Dayyan: DialogueTree = {
  id: 'ch6-dayyan',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mírzá Asadu\'lláh of Khuy',
      text: 'You wonder why a government scribe from Khuy sits on a frozen rock beside a brazier. So do I. I came here to expose a pretender. I had Hebrew, Syriac, and every argument in the books.',
      choices: [{ text: '"And what happened?"', next: 'happened' }],
    },
    happened: {
      speaker: 'Mírzá Asadu\'lláh of Khuy',
      text: 'I had a question hidden in my own mind, one I had told no one, meant as a trap. The reply that came down from the fortress answered it, though I had never asked it aloud. I read it three times. Then I climbed.',
      choices: [{ text: '"What did He say to you?"', next: 'name' }],
    },
    name: {
      speaker: 'Mírzá Asadu\'lláh of Khuy',
      onEnter: { set: { ch6MetDayyan: true } },
      text: 'He gave me a new name: Dayyán. (He turns it over like a coin.) I had a dozen titles in Khuy. This is the first I did not earn by flattering someone.',
      choices: [
        { text: '"I am still searching. I do not have your certainty."', next: 'search',
          requires: f => f.recognised !== true },
        { text: '"What will you do now?"', next: 'now' },
      ],
    },
    search: {
      speaker: 'Mírzá Asadu\'lláh of Khuy',
      text: 'Good. Neither did I, until I did. Let no one hurry you, least of all yourself. But do not stand at the gate forever. Gates are for passing through.',
    },
    now: {
      speaker: 'Mírzá Asadu\'lláh of Khuy',
      text: 'Go home to Khuy and lose my post, most likely. My friends will say I went mad on a mountain. (He smiles.) Let them. I have never been so sane.',
    },
  },
};

export const ch6Dervish: DialogueTree = {
  id: 'ch6-dervish',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Dervish from India',
      text: '(He sits wrapped in a patched cloak, his feet bound in rags.) Peace, traveller. I have walked from India. Do not ask how many months. I stopped counting when the mountains began.',
      choices: [{ text: '"What brought you so far?"', next: 'why' }],
    },
    why: {
      speaker: 'A Dervish from India',
      text: 'Something called me westward. In my country we say a true call does not explain itself; it only pulls. I did not know a name. I knew a direction. At the end of the direction was this mountain.',
      choices: [{ text: '"And now that you are here?"', next: 'named' }],
    },
    named: {
      speaker: 'A Dervish from India',
      onEnter: { set: { ch6MetDervish: true } },
      text: 'He has named me Qahru\'lláh, and bidden me go home. On foot, alone, the way I came. (He laughs softly.) Back across all those mountains. I have never been given a gift so heavy, or so light.',
      choices: [
        { text: '"Take my bread for the road."', next: 'bread', effect: { set: { ch6GaveBread: true } } },
        { text: '(Bow to him.)' },
      ],
    },
    bread: {
      speaker: 'A Dervish from India',
      text: '(He takes it as though it were gold.) You see? Already the road provides. Go up and keep watch for me, friend. I will be keeping watch from much further away.',
    },
  },
};

export const ch6KurdishShepherd: DialogueTree = {
  id: 'ch6-kurdish-shepherd',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Kurdish Shepherd',
      text: 'Mind where you step, city man. (He grins.) You have come for the Siyyid. Everyone comes for the Siyyid. My father says that before Him, nobody climbed to Chihríq but goats and tax-collectors.',
      choices: [
        { text: '"Do the Kurds here honour Him?"', next: 'honour' },
        { text: '"What is life like up here?"', next: 'life' },
      ],
    },
    honour: {
      speaker: 'A Kurdish Shepherd',
      text: 'We are Sunni folk; we do not run after every Siyyid. But I carried water up to that gate, and He thanked me as if I had brought Him a horse. My mother sends bread up now. She will not tell my father.',
      choices: [{ text: '(Smile.)', next: 'lonely' }],
    },
    life: {
      speaker: 'A Kurdish Shepherd',
      text: 'Cold. Then less cold. Then cold again. Only the river is in a hurry. (He shrugs.) It is a good place to be forgotten. That is why they sent Him. It is not working.',
      choices: [{ text: '"No. It is not."', next: 'lonely' }],
    },
    lonely: {
      speaker: 'A Kurdish Shepherd',
      onEnter: { set: { ch6HeardKurds: true } },
      text: 'When they move Him on, and men like that are always moved on, the mountain will be emptier than before He came. I did not think a mountain could be lonely.',
    },
  },
};

export const ch6CourierBadasht: DialogueTree = {
  id: 'ch6-courier-badasht',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Mountain Courier',
      text: 'You made it! The road from Mákú nearly killed my mule. I leave again tomorrow, east this time, all the way toward Khurásán.',
      choices: [{ text: '"What news do you carry?"', next: 'news' }],
    },
    news: {
      speaker: 'A Mountain Courier',
      onEnter: { set: { ch6CourierBadasht: true } },
      text: 'Strange news. The friends are to gather this summer at a hamlet called Badasht, between Mázindarán and Khurásán. Ṭáhirih is coming from Qazvín, Quddús from Mashhad, and Bahá\'u\'lláh of Núr has rented gardens there for them all.',
      choices: [{ text: '"What is the gathering for?"', next: 'why' }],
    },
    why: {
      speaker: 'A Mountain Courier',
      text: 'Some say to find a way to free Him from this mountain. Some say something larger: that the friends must decide what kind of people they now are. I would give a great deal to be there.',
      choices: [
        { text: '"Perhaps I will be."' },
        { text: '(Say nothing, and look east.)' },
      ],
    },
  },
};

export const ch6AmanuensisChihriq: DialogueTree = {
  id: 'ch6-amanuensis-chihriq',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Siyyid Ḥusayn, the Amanuensis',
      text: 'You followed us. (He rubs his hands over the lamp.) The Grievous Mountain, He calls this place. Mákú was the Open Mountain. You will feel the difference in your fingers by nightfall.',
      choices: [
        { text: '"Why grievous?"', next: 'grievous' },
        { text: '"Does He still write?"', next: 'write' },
      ],
    },
    grievous: {
      speaker: 'Siyyid Ḥusayn, the Amanuensis',
      text: 'The walls are thicker, and the warden\'s orders came with his family\'s honour tied to them. And word climbs up from Mázindarán and Khurásán of trouble gathering against the friends. He reads every letter. Some He reads twice.',
      choices: [{ text: '"And still He writes?"', next: 'write' }],
    },
    write: {
      speaker: 'Siyyid Ḥusayn, the Amanuensis',
      onEnter: { set: { ch6AmanuensisChihriq: true } },
      text: 'More than ever. Letters to the Sháh. Letters to learned men who condemned Him without reading Him. Prayers for the friends, by name. I have stopped sleeping in any regular way. I do not miss it.',
      choices: [{ text: '(Sit with him awhile as he copies.)', next: 'sit' }],
    },
    sit: {
      speaker: 'Siyyid Ḥusayn, the Amanuensis',
      text: 'When the light goes, keep watch at the window, if Yaḥyá Khán allows it. Many do. Nobody who has kept that watch has gone down the mountain the same.',
    },
  },
};

export const ch6ChihriqWindowClosed: DialogueTree = {
  id: 'ch6-chihriq-window-closed',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'A soldier by the keep shakes his head at you. You have only just come to the Grievous Mountain. Stand first before Yaḥyá Khán, who keeps the gate, and hear those who climbed here before you: on the road, on the ledge, in the hamlet below.',
    },
  },
};

export const ch6ChihriqWindow: DialogueTree = {
  id: 'ch6-chihriq-window',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Night on the Grievous Mountain. The snow has stopped. Behind the bars a lamp is burning, and you can just hear the reed pen moving, steady as breath. Below, in the hamlet, a dog barks once and is still.',
      choices: [
        { text: '(Keep watch, as you did in Shíráz.)', next: 'shiraz', requires: f => !!f.vigilKept },
        { text: '(Pray for the friends on the roads.)', next: 'friends' },
        { text: '(Think of everyone who has climbed this mountain.)', next: 'climbers' },
      ],
    },
    shiraz: {
      speaker: 'Narrator',
      text: 'Four years ago you sat outside a door in Shíráz until dawn. You are older now, and the door is iron. But the lamp is the same lamp, and you are the same seeker: still outside, still listening.',
      choices: [{ text: '(Keep watch until dawn.)', next: 'complete' }],
    },
    friends: {
      speaker: 'Narrator',
      text: 'You think of Mullá Ḥusayn walking toward the green hills of Mázindarán. Of the courier\'s mule. Of the dervish, already far down the eastern road. Of everyone who carries a page, or a word, or only the memory of this window.',
      choices: [{ text: '(Keep watch until dawn.)', next: 'complete' }],
    },
    climbers: {
      speaker: 'Narrator',
      text: 'A warden who asked forgiveness. A scribe who came to expose Him and left with a new name. A Kurdish mother\'s bread. A dervish from India. The mountain was meant to make Him alone. It has made Him a door.',
      choices: [{ text: '(Keep watch until dawn.)', next: 'complete' }],
    },
    complete: {
      speaker: 'Narrator',
      onEnter: { set: { bayanComplete: true } },
      text: 'Before dawn the lamp is lowered, and in the courtyard Siyyid Ḥusayn begins another copy. From Mákú to Chihríq, isolation has failed its purpose. This summer the friends gather at Badasht, and the world will hear what the Bayán has begun.',
    },
  },
};
