import type { DialogueTree } from '../../dialogue/types';

/**
 * The residence courtyard during the examination, and days afterwards. The
 * hall is never entered while the Báb is in it: the Valí-ʿAhd's page and
 * the Niẓámu'l-ʿUlamá's secretary come out and tell what passed, after
 * Nabíl's account. Mullá Muḥammad of Mamaqán comes out angry. Days later,
 * Dr Cormick, the physician who treated the Prisoner, gives his own
 * witness, after his letter.
 */

/** The page before the Prisoner is brought in. */
export const trialPageBefore: DialogueTree = {
  id: 'trial-page-before',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'The Valí-ʿAhd\'s Page',
      text: '(A boy of fifteen or so in a blue coat, twisting his cap in his hands.) You are the steward\'s new man? Good. Take a tray from the coffee-maker and stand by the steps. No one goes up unless he is called.',
      choices: [{ text: '"Who is inside?"', next: 'who' }],
    },
    who: {
      speaker: 'The Valí-ʿAhd\'s Page',
      text: 'Everyone. The Niẓámu\'l-ʿUlamá presides; he was the Valí-ʿAhd\'s tutor. Mullá Muḥammad of Mamaqán, the Shaykhu\'l-Islám, the Imám-Jumʿih, shaykhs and doctors along every wall. And the Valí-ʿAhd himself.',
      choices: [{ text: '"And the Prisoner?"', next: 'seat' }],
    },
    seat: {
      speaker: 'The Valí-ʿAhd\'s Page',
      onEnter: { set: { trialPageBriefed: true } },
      text: 'They are fetching Him now. (He glances up at the hall.) There is not a cushion free in that room but one: the seat kept for the Valí-ʿAhd. Everyone is very careful not to look at it.',
    },
  },
};

/** The page comes out after the declaration. */
export const trialPageDeclaration: DialogueTree = {
  id: 'trial-page-declaration',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'The Valí-ʿAhd\'s Page',
      text: '(The page slips out between the doors, white to the lips, and drinks from a cup on your tray.) You will not believe me.',
      choices: [{ text: '"Tell me."', next: 'seat' }],
    },
    seat: {
      speaker: 'The Valí-ʿAhd\'s Page',
      text: 'He came in and greeted them all. There was one seat empty, the Valí-ʿAhd\'s. He walked to it and sat down, and nobody stopped Him. Nobody said a word. I have served in that hall two years and never heard it so quiet.',
      choices: [{ text: '"What did they ask Him?"', next: 'claim' }],
    },
    claim: {
      speaker: 'The Valí-ʿAhd\'s Page',
      text: 'The Niẓámu\'l-ʿUlamá asked Him whom He claimed to be, and what message He had brought. He answered three times over. He said He was the Promised One, the One whose name they had called upon for a thousand years, whom the peoples of East and West must obey.',
      choices: [{ text: '"And they?"', next: 'mamaqani' }],
    },
    mamaqani: {
      speaker: 'The Valí-ʿAhd\'s Page',
      onEnter: { set: { trialHeardDeclaration: true } },
      text: 'Mullá Muḥammad of Mamaqán went red. He called Him a wretched lad of Shíráz, and asked if He meant to set Ádhirbáyján alight as He had ʿIráq. He answered that He had not come of His own will. He had been summoned. (The page looks at the doors.) I must go back in.',
    },
  },
};

/** The page after the Prisoner has gone, before the house of the Shaykhu'l-Islám. */
export const trialPageAfter: DialogueTree = {
  id: 'trial-page-after',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'The Valí-ʿAhd\'s Page',
      text: '(The page sits on the lowest step with his cap in his lap.) Some of them wanted Him beaten in the hall, before the whole assembly, for sitting in that seat. The Valí-ʿAhd would not have it. He said no. Just that: no.',
      choices: [{ text: '"Then it is over?"', next: 'shaykh' }],
    },
    shaykh: {
      speaker: 'The Valí-ʿAhd\'s Page',
      onEnter: { set: { trialToShaykh: true } },
      text: 'No. They have taken Him across the city to the house of the Shaykhu\'l-Islám, and the governor\'s bodyguard with Him. (He looks at you properly for the first time.) You are not the steward\'s man at all, are you. Go, if you must. Nobody here will miss a tray.',
    },
  },
};

/** The Niẓámu'l-ʿUlamá's secretary, out for fresh ink. */
export const trialSecretary: DialogueTree = {
  id: 'trial-secretary',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'The Niẓámu\'l-ʿUlamá\'s Secretary',
      text: '(A thin scribe with ink to the wrist comes down the steps shaking his reed pen.) My master wants a fresh inkwell, and I want air. I am meant to be taking it all down. Who could take it down?',
      choices: [{ text: '"What has passed since His claim?"', next: 'proof' }],
    },
    proof: {
      speaker: 'The Niẓámu\'l-ʿUlamá\'s Secretary',
      text: 'My master said that such a claim needs proof beyond dispute. The Prisoner answered that the mightiest proof is His own Word, and that in two days and two nights He could reveal verses equal to the whole of the Qur\'án.',
      choices: [{ text: '"Did they ask Him to?"', next: 'verses' }],
    },
    verses: {
      speaker: 'The Niẓámu\'l-ʿUlamá\'s Secretary',
      text: 'My master asked Him to describe this very gathering, there and then, in the language of the verses. He began with the praise of God. And Mullá Muḥammad cut in to find fault with His grammar.',
      choices: [{ text: '"What did He answer?"', next: 'grammar' }],
    },
    grammar: {
      speaker: 'The Niẓámu\'l-ʿUlamá\'s Secretary',
      text: 'That the rules of grammar were drawn from the Word of God, and not the Word from the rules; that the Qur\'án itself does not keep the grammarians\' rules. (He rubs his eyes.) My master was less pleased with the questions, I think, than with the answers.',
      choices: [{ text: '"And then?"', next: 'verse' }],
    },
    verse: {
      speaker: 'The Niẓámu\'l-ʿUlamá\'s Secretary',
      onEnter: { set: { trialHeardQuestions: true } },
      text: 'Then a man by the door asked Him the tense of a single word, as you would test a schoolboy. He answered with a verse of the Qur\'án: far be the glory of thy Lord, the Lord of all greatness, from what they impute to Him. And He rose. (The secretary looks up at the doors.) They will be bringing Him out.',
    },
  },
};

/** Mullá Muḥammad of Mamaqán, the Shaykhí divine, after the Prisoner has gone. */
export const trialMamaqani: DialogueTree = {
  id: 'trial-mamaqani',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá Muḥammad of Mamaqán',
      text: '(An old divine comes down the steps on his staff and stops to let his anger cool before the servants.) Water. (He drinks.) You saw Him go out. Without leave, without a word to the chair. Did they tell you where He sat?',
      choices: [
        { text: '"In the Valí-ʿAhd\'s seat, they say."', next: 'seat' },
        { text: '"Why are you so angry?"', next: 'angry' },
      ],
    },
    seat: {
      speaker: 'Mullá Muḥammad of Mamaqán',
      text: 'In the seat of the heir to the throne, before every learned man of Ádhirbáyján. And the heir let it pass, as boys let things pass.',
      choices: [{ text: '"Why are you so angry?"', next: 'angry' }],
    },
    angry: {
      speaker: 'Mullá Muḥammad of Mamaqán',
      text: 'You think me a hard old man. I know the books. I know what they promise, and I know how men run after a voice that sounds like the promise. (He grips the staff.) Mark me: let this go on, and the people will drive the ʿulamá out of Tabríz.',
      choices: [{ text: '"What will you do?"', next: 'punish' }],
    },
    punish: {
      speaker: 'Mullá Muḥammad of Mamaqán',
      onEnter: { set: { trialMetMamaqani: true } },
      text: 'He took the prince\'s place without the chairman\'s leave. For that alone He should be punished, here, before the same assembly. We shall see if the Valí-ʿAhd has the stomach for it. (He goes in again without waiting for an answer.)',
    },
  },
};

/** The coffee-maker at his hearth: the household's view of the day. */
export const trialCoffeeMaker: DialogueTree = {
  id: 'trial-coffee-maker',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'The Coffee-Maker',
      text: 'Coffee? Not for you, for them. Forty cups since the dawn prayer, and every one sent back half drunk. Divines do not drink while they are listening. They drink when they are talking.',
      choices: [
        { text: '"What do the servants say?"', next: 'servants' },
        { text: '(Help him rinse the cups.)', next: 'rinse' },
      ],
    },
    servants: {
      speaker: 'The Coffee-Maker',
      text: 'The grooms say He rode in from Chihríq as quiet as a dervish. The cook says the Valí-ʿAhd would sooner be out with his hawks. I say nothing. A coffee-maker who talks is soon a water-carrier.',
      choices: [{ text: '(Help him rinse the cups.)', next: 'rinse' }],
    },
    rinse: {
      speaker: 'The Coffee-Maker',
      onEnter: { set: { trialHeardCoffee: true } },
      text: '(He shows you how to turn a cup so the grounds slide out whole.) There. You have the hands for it. If they ever throw you out of wherever it is you belong, come to me.',
    },
  },
};

/** Dr Cormick, days later, after treating the Prisoner. */
export const trialCormick: DialogueTree = {
  id: 'trial-cormick',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Dr Cormick',
      text: '(A European in a dark frock coat, his case under his arm, stands in the shade writing in a small book.) Forgive me. I write things down before I forget them; it is a physician\'s vice. I am Cormick. I attend the Valí-ʿAhd\'s household. You were here the day of the examination?',
      choices: [{ text: '"I was. And you have seen Him since."', next: 'seen' }],
    },
    seen: {
      speaker: 'Dr Cormick',
      text: 'Twice. First they sent me with two Persian doctors to say whether He was in His right mind, for if He were mad they could not well put Him to death. He would scarcely answer us. He looked at us mildly and chanted something under His breath, very low.',
      choices: [{ text: '"Did He speak to you?"', next: 'spoke' }],
    },
    spoke: {
      speaker: 'Dr Cormick',
      text: 'Once. I told Him I was no Muslim and wished to learn of His religion. He looked at me a long while, and said He had no doubt the Europeans would come over to it. (He taps his pen on the book.) Our report spared His life. It did not spare His feet.',
      choices: [{ text: '"And the second time?"', next: 'wound' }],
    },
    wound: {
      speaker: 'Dr Cormick',
      text: 'After the bastinado. One of the farráshes struck Him across the face with the rod meant for His feet, by malice or clumsiness I cannot say. A great wound, and swelling. When they offered Him a Persian surgeon, He asked for me instead. I have dressed it these few days.',
      choices: [{ text: '"What is He like?"', next: 'like' }],
    },
    like: {
      speaker: 'Dr Cormick',
      text: 'A very mild and delicate-looking man, rather small, and fair for a Persian, with a soft, melodious voice that struck me very much. I could never speak with Him alone; some official was always in the room. I should have liked to.',
      choices: [{ text: '"What will become of Him?"', next: 'end' }],
    },
    end: {
      speaker: 'Dr Cormick',
      onEnter: { set: { trialHeardCormick: true } },
      text: 'They will take Him back to Chihríq as soon as the wound allows. (He closes the book and looks toward the hall.) They tell me He sat in the Valí-ʿAhd\'s own seat that day. I should have liked to see their faces.',
    },
  },
};

export const trialCourtDialogues: Record<string, DialogueTree> = {
  [trialPageBefore.id]: trialPageBefore,
  [trialPageDeclaration.id]: trialPageDeclaration,
  [trialPageAfter.id]: trialPageAfter,
  [trialSecretary.id]: trialSecretary,
  [trialMamaqani.id]: trialMamaqani,
  [trialCoffeeMaker.id]: trialCoffeeMaker,
  [trialCormick.id]: trialCormick,
};
