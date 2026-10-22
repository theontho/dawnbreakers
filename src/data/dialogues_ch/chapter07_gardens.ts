import type { DialogueTree, FlagState } from '../../dialogue/types';

/**
 * Badasht, the three gardens, summer 1848. Before the proclamation the
 * player visits each garden; the assembly then witnesses Ṭáhirih unveiled;
 * afterward Ṭáhirih and Quddús each explain themselves, and the friends are
 * reconciled. Bahá'u'lláh is never a speaker: He is the unseen Host behind
 * the lamplit tent, told of by the Narrator and by a messenger.
 */

/** Gardens visited before the assembly: Quddús's, Ṭáhirih's, and the Host's. */
export function gardensVisited(f: FlagState): number {
  return ['ch7MetQuddus', 'ch7HeardCurtain', 'ch7SawTent'].filter(flag => !!f[flag]).length;
}

export const ch7TahirihCurtain: DialogueTree = {
  id: 'ch7-tahirih-curtain',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'A curtain of plum-coloured cloth hangs before the pavilion, lit from behind. A woman\'s voice is speaking within, clear and unhurried, to a few listeners seated on the grass.',
      choices: [{ text: '(Sit with the listeners.)', next: 'voice' }],
    },
    voice: {
      speaker: 'Ṭáhirih',
      text: 'Come closer, traveller; the grass is free. We were speaking of the Day of Resurrection. Some of the friends are waiting for graves to open. Look around you, I tell them. The graves that are opening are hearts.',
      choices: [
        { text: '"Who are you, lady?"', next: 'who' },
        { text: '"You speak as one who expects something soon."', next: 'soon' },
      ],
    },
    who: {
      speaker: 'Ṭáhirih',
      text: 'In Qazvín they called me the Crown of Gold. In Karbilá they called me worse. Here in this garden they have begun to call me Ṭáhirih, the Pure One. I am still deciding whether I deserve it.',
      choices: [{ text: '"And what do you expect?"', next: 'soon' }],
    },
    soon: {
      speaker: 'Ṭáhirih',
      onEnter: { set: { ch7HeardCurtain: true } },
      text: 'What was promised. A promise carried for a thousand years grows heavy, friend. Someone must set it down where all can see it. Come to the assembly when it gathers. Bring your courage, and leave your expectations at the gate.',
    },
  },
};

export const ch7QuddusGarden: DialogueTree = {
  id: 'ch7-quddus-garden',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Quddús',
      text: 'Peace be with you. Sit, please. Every traveller who comes into these gardens carries some word of Chihríq. What have you heard of Him there?',
      choices: [
        { text: '"That He is steadfast, and writes day and night."', next: 'news' },
        { text: '"I kept watch beneath His window. The lamp still burns."', next: 'watch',
          requires: f => !!f.bayanComplete },
      ],
    },
    news: {
      speaker: 'Quddús',
      text: 'Then all is well, whatever else is not. (He looks toward the east garden.) You will hear that Ṭáhirih and I disagree. Hear it. A disagreement aired in a garden does less harm than one whispered in a tent.',
      choices: [{ text: '"What do you disagree about?"', next: 'end' }],
    },
    watch: {
      speaker: 'Quddús',
      text: 'Then you have done what I could not, these months. Thank you. (He is quiet a long moment.) You will hear that Ṭáhirih and I disagree. Hear it. Everyone should.',
      choices: [{ text: '"What do you disagree about?"', next: 'end' }],
    },
    end: {
      speaker: 'Quddús',
      onEnter: { set: { ch7MetQuddus: true } },
      text: 'She says the old law is ended and the friends must hear it now. I say the friends are new to their feet. We are both right, and that is the difficulty. Listen at her curtain, if you have not. Then judge us both.',
    },
  },
};

export const ch7HostTent: DialogueTree = {
  id: 'ch7-host-tent',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'A tent of blue cloth stands beside the stream, its door-flap lifted. Lamplight spills onto a carpet. Within, unseen, is the Host of Badasht, Bahá\'u\'lláh. Those who come out of the tent come out quieter than they went in.',
      choices: [
        { text: '(Wait at the threshold.)', next: 'wait' },
        { text: '(Ask a servant how the Host is.)', next: 'servant' },
      ],
    },
    wait: {
      speaker: 'Narrator',
      text: 'You do not go in; you were not called. From the threshold you hear a quiet voice within, and then the laughter of the friend who sits with Him, the laughter of someone taken by surprise by joy.',
      choices: [{ text: '(Stay a while longer.)', next: 'names' }],
    },
    servant: {
      speaker: 'Narrator',
      text: 'A servant tells you softly that the Host has been unwell and keeps to His tent. Yet each day some friend is called in, and each day comes out bearing a new name.',
      choices: [{ text: '(Stay a while longer.)', next: 'names' }],
    },
    names: {
      speaker: 'Narrator',
      onEnter: { set: { ch7SawTent: true } },
      text: 'So it has gone, day after day: a name given here, a custom of the old law laid aside there. Quddús has been named. Ṭáhirih has been named. And the Host Himself is called now by a single word: Bahá.',
    },
  },
};

export const ch7AssemblyWaiting: DialogueTree = {
  id: 'ch7-assembly-waiting',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Friends sit on carpets in the paved court, waiting, though none can say for what. "Not yet," one murmurs. "Have you been to all three gardens? Quddús\'s, the lady\'s, and the Host\'s? Go. Whatever is coming, you should know whom it comes from."',
    },
  },
};

export const ch7Assembly: DialogueTree = {
  id: 'ch7-assembly',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The friends sit on carpets beside the Host\'s tent. Quddús is among them. A message comes from Ṭáhirih asking him to her garden; he does not go. Then, without warning, she comes herself, through the gate and into the assembly.',
      choices: [{ text: '(Rise to your feet.)', next: 'face' }],
    },
    face: {
      speaker: 'Narrator',
      text: 'Her face is uncovered. She has laid aside the veil that no woman of her station has ever laid aside before men. She is adorned as if for a feast, and perfectly calm. The court goes utterly still.',
      choices: [
        { text: '(Look down, as you were taught.)', next: 'down' },
        { text: '(Look at her face.)', next: 'look' },
      ],
    },
    down: {
      speaker: 'Narrator',
      text: 'You stare at the carpet. Around you men are rising and crying out. One shrieks and flees the garden. Another hides his face in his robe. Somewhere, someone is weeping.',
      choices: [{ text: '(Listen.)', next: 'proclaim' }],
    },
    look: {
      speaker: 'Narrator',
      text: 'You look, and find no shame there, only a terrible serenity. Around you men are rising and crying out. One shrieks and flees the garden. Another hides his face in his robe.',
      choices: [{ text: '(Listen.)', next: 'proclaim' }],
    },
    proclaim: {
      speaker: 'Ṭáhirih',
      text: '(She lifts her voice above the noise.) I am the Word the Promised One was to speak, the Word that will scatter the proud of the earth! This is a day of festival. Today the fetters of the past are broken!',
      choices: [{ text: '(Turn to see what Quddús will do.)', next: 'quddus' }],
    },
    quddus: {
      speaker: 'Narrator',
      text: 'Quddús rises, his face hard, and answers her sharply, and they dispute before everyone. From the Host\'s tent comes word that a reciter should chant the Súrih of the Inevitable: when the Day that must come has come.',
      choices: [{ text: '(Stand in the noise and the chanting.)', next: 'after' }],
    },
    after: {
      speaker: 'Narrator',
      onEnter: { set: { ch7WitnessedUnveiling: true } },
      text: 'The assembly breaks like a startled flock. Some have fled the garden. Some sit as if struck. Some are laughing through tears. Whatever Badasht was yesterday, it is not that now.',
      choices: [{ text: '(Find Ṭáhirih and Quddús, and hear them both.)' }],
    },
  },
};

export const unveiling: DialogueTree = {
  id: 'ch7-unveiling',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Ṭáhirih',
      text: 'Friend, the garden has gone still because a sign has been made plain. I have not come to be gazed upon. I have come to summon hearts from imitation to recognition.',
      choices: [
        { text: '"This shocks me, yet I will listen before I judge."', next: 'shock', effect: { set: { badashtResponse: 'shock' } } },
        { text: '"You speak with the courage of one who knows her hour."', next: 'defence', effect: { set: { badashtResponse: 'defence' } } },
        { text: '(Remain silent, weighing what has changed.)', next: 'silence', effect: { set: { badashtResponse: 'silence' } } },
        { text: '"Teach me what this sign means."', next: 'explain', effect: { set: { badashtResponse: 'seeking' } } },
      ],
    },
    shock: {
      speaker: 'Ṭáhirih',
      text: 'Then let your shock become a doorway, not a chain. The old order taught fear before truth. The new one summons conscience, learning, and courage before God.',
      choices: [{ text: '"I will carry my unease honestly, and still listen."', next: 'fled' }],
    },
    defence: {
      speaker: 'Ṭáhirih',
      text: 'Courage belongs to the Cause, not to me. If a woman must speak so that the sleepers wake, then let her voice be clear, and let her answer for it.',
      choices: [{ text: '"May clarity prevail over fear."', next: 'fled' }],
    },
    silence: {
      speaker: 'Ṭáhirih',
      text: 'Silence can be reverence, or it can be retreat. Search your heart, and let it become a witness rather than a hiding place.',
      choices: [{ text: '(Lift your eyes and attend.)', next: 'fled' }],
    },
    explain: {
      speaker: 'Ṭáhirih',
      text: 'Badasht is not a camp of novelty. It is the place where what was hidden is declared. A new Day has opened, and the veils of a past age cannot govern its sun.',
      choices: [{ text: '"Then this is proclamation, not provocation."', next: 'fled' }],
    },
    fled: {
      speaker: 'Ṭáhirih',
      text: 'Some fled the garden today. I do not blame them; I grieve for them. A door flung open lets in the wind as well as the light. Those who stay will learn to stand in both.',
      choices: [{ text: '"What should I do now?"', next: 'call' }],
    },
    call: {
      speaker: 'Ṭáhirih',
      onEnter: { set: { ch7HeardTahirih: true } },
      text: 'Go among the friends. Some hearts tremble, some resist, some are already aflame. Tell them that dignity and truth walked together in this garden today. And hear Quddús. He will tell you more than he said aloud.',
    },
  },
};

export const quddusTension: DialogueTree = {
  id: 'ch7-quddus-tension',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Quddús',
      text: 'The friends whisper as though the garden itself had been overturned. A new Day must be proclaimed. Yet proclamation can wound those who have only just learned to stand.',
      choices: [
        { text: '"Is caution now a form of mercy?"', next: 'caution' },
        { text: '"Is boldness now required of everyone?"', next: 'boldness' },
        { text: '"Your quarrel with her. Was it real?"', next: 'quarrel' },
      ],
    },
    caution: {
      speaker: 'Quddús',
      text: 'Mercy is not delay for its own sake. It is the art of guiding a soul to the threshold without breaking what must be strengthened.',
      choices: [{ text: '"And your quarrel with her?"', next: 'quarrel' }],
    },
    boldness: {
      speaker: 'Quddús',
      text: 'Boldness, yes; vanity, no. The Cause asks obedience to truth, and truth is larger than any one temperament in this garden.',
      choices: [{ text: '"And your quarrel with her?"', next: 'quarrel' }],
    },
    quarrel: {
      speaker: 'Quddús',
      text: '(For a moment, something like a smile.) A physician does not hand a frightened man every remedy at once. If I stand against her, the frightened can stand with me, and stay. Later they will find she and I were on one road.',
      choices: [{ text: '"I will keep that to myself."', next: 'end' }],
    },
    end: {
      speaker: 'Narrator',
      onEnter: { set: { ch7QuddusAfter: true } },
      text: 'Quddús turns toward the Host\'s garden. Around him the conference breathes with tension: a necessary wound, waiting for the hand that will bind it.',
    },
  },
};

export const ch7MessengerWait: DialogueTree = {
  id: 'ch7-messenger-wait',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Messenger at the Central Tent',
      text: 'Peace, friend. The Host has asked that before anyone speaks a word of judgement, those who saw today should hear both voices, Ṭáhirih\'s and Quddús\'s. Go to them both, and then come back to the tent.',
    },
  },
};

export const bahaullahReconcile: DialogueTree = {
  id: 'ch7-bahaullah-reconcile',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Messenger at the Central Tent',
      text: 'Come in peace. Counsel is passing out from the tent through the gardens: no soul gathered here is served by scorn. Not the one who trembles, not the one who proclaims, not the one who has misunderstood both.',
      choices: [
        { text: '"How can the friends be made one again?"', next: 'names' },
        { text: '"I fear this day will scatter them."', next: 'fear' },
      ],
    },
    fear: {
      speaker: 'Messenger at the Central Tent',
      text: 'The answer comes back gently: a storm may scatter dry leaves, but it also clears the air. Let this day be remembered not for its confusion, but for what it forced into the open.',
      choices: [{ text: '"Then reconciliation must tell the truth plainly."', next: 'names' }],
    },
    names: {
      speaker: 'Narrator',
      text: 'In the lamplit tent Bahá\'u\'lláh receives the friends one by one: the shaken, the angry, Quddús, Ṭáhirih. He steadies wounded hearts and draws them back to one purpose. What was revealed is not taken back. It is made bearable.',
      choices: [{ text: '(Let the gathering settle beneath the lamps.)', next: 'complete' }],
    },
    complete: {
      speaker: 'Narrator',
      text: 'By nightfall the three gardens are no longer three camps. They have witnessed one turning point: the old dispensation has been left behind, and the friends must learn to walk forward together.',
      choices: [{ text: '(Rest, for the last time, in the gardens of Badasht.)', next: 'road' }],
    },
    road: {
      speaker: 'Narrator',
      onEnter: { set: { badashtComplete: true } },
      text: 'Within days the gathering breaks up, and most of the friends ride toward Mázindarán. You turn west instead, toward the mountain where He is held, and on the road you hear that He has been brought down to Tabríz. Far to the east, in Khurásán, Mullá Ḥusayn has raised a black standard and set out on the road west, toward the green hills he spoke of at Mákú.',
    },
  },
};

export const ch7Names: DialogueTree = {
  id: 'ch7-names',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'The Keeper of Names',
      text: 'Hush, I am counting. (A young man looks up from a list, ink to the wrists.) Each day of this gathering someone is given a new name, and some old custom is laid aside. I have made it my task to write them all down.',
      choices: [
        { text: '"Which names?"', next: 'which' },
        { text: '"Which customs?"', next: 'customs' },
      ],
    },
    which: {
      speaker: 'The Keeper of Names',
      text: 'Quddús, the Most Holy, for Mullá Muḥammad-ʿAlí of Bárfurúsh. Ṭáhirih, the Pure, for the lady of Qazvín. And for our Host, simply Bahá: Glory. And many smaller names, for men like me who never had a great one.',
      choices: [{ text: '"And the customs?"', next: 'customs' }],
    },
    customs: {
      speaker: 'The Keeper of Names',
      text: 'Small ones at first, then larger. If the Promised One has come, does the old law still bind us? Each day the answer comes a little plainer. (He taps the page.) I write the day, and what was laid aside on it.',
      choices: [{ text: '"Will you write my name?"', next: 'end' }],
    },
    end: {
      speaker: 'The Keeper of Names',
      onEnter: { set: { ch7HeardNames: true } },
      text: 'Gladly. Though perhaps you will be given a new one before we leave. Most of us are. (He smiles.) It feels like being born in public.',
    },
  },
};

export const shakenBeliever: DialogueTree = {
  id: 'ch7-shaken-believer',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Shaken Believer',
      text: 'I came to Badasht seeking counsel, and now the ground beneath counsel has moved. Was that unveiling a rupture, or a mercy I am too frightened to understand?',
      choices: [
        { text: '"Let us not answer fear with accusation."', next: 'steady' },
        { text: '"Go to the Host\'s tent. The friends are being received there."', next: 'steady' },
        { text: '"I am frightened too. I am still searching."', next: 'fellow',
          requires: f => f.recognised !== true },
      ],
    },
    fellow: {
      speaker: 'A Shaken Believer',
      text: 'Then we are two. (He laughs, unsteadily.) It helps a little, not to be the only one standing outside the door.',
      choices: [{ text: '"Then let us stand here together a while."', next: 'steady' }],
    },
    steady: {
      speaker: 'A Shaken Believer',
      onEnter: { set: { ch7SteadiedBeliever: true } },
      text: 'Then I will breathe, and listen. If this truly is a new Day, perhaps my first service is not to master it, but to stop speaking against the light before I have seen it clearly.',
    },
  },
};

export const ch7Leaver: DialogueTree = {
  id: 'ch7-leaver',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Departing Believer',
      text: '(He is buckling a saddlebag with shaking hands.) Do not try. I saw what I saw. A woman, unveiled, among men, in a garden of believers. I did not leave my home and my mosque for this.',
      choices: [
        { text: '"Stay one more night. Hear Quddús, and go to the Host\'s tent."', next: 'stay' },
        { text: '"What did you leave home for?"', next: 'why' },
      ],
    },
    stay: {
      speaker: 'A Departing Believer',
      text: 'Quddús quarrelled with her himself; you saw it. If even he... No. I cannot. Forgive me.',
      choices: [{ text: '(Let him go.)', next: 'go' }],
    },
    why: {
      speaker: 'A Departing Believer',
      text: 'For the Promised One! For the Day of God! For... (He stops.) For something that would look like what I expected, I suppose. Is that so wicked?',
      choices: [{ text: '"No. Only very human."', next: 'go' }],
    },
    go: {
      speaker: 'Narrator',
      onEnter: { set: { ch7SpokeToLeaver: true } },
      text: 'He shoulders the bag and walks down the lane toward the hamlet, not looking back. He is not the only one. Badasht will be remembered for those who stayed, and also, quietly, for those who could not.',
    },
  },
};
