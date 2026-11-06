import type { DialogueTree, FlagState } from '../../dialogue/types';
import { heed, heededAt, resist } from '../../dialogue/voices';

/**
 * Niyálá, Mázindarán, summer 1848 (Nabíl, ch. XVI). Days out of Badasht the
 * company camped at the foot of a mountain below the village of Niyálá. At
 * dawn the villagers stoned the camp from the hilltop and most of the
 * friends fled; Bahá'u'lláh put His own garments on Quddús and sent him to
 * safety. Only Ṭáhirih, her maid and Mírzá ʿAbdu'lláh of Shíráz stayed in
 * the camp; the young man stood over the baggage with a sword, was wounded,
 * and was bidden to stop. Afterwards Bahá'u'lláh spoke with the villagers of
 * their cruelty and recovered part of what was taken, and took Ṭáhirih on
 * to Núr. He is never a speaker here: the believers and the narrator tell
 * what He did.
 */

/** The pilgrim's help in the plundered camp: wounds bound, ledger, odes, the villager's saddlebag. */
export function niyalaHelped(f: FlagState): number {
  return ['ch7BoundWounds', 'ch7GatheredLedger', 'ch7GatheredOdes', 'ch7NiyalaVillager'].filter(flag => !!f[flag]).length;
}

export const NIYALA_TASKS = 4;

const FEAR_MOMENT = 'ch7-niyala';

export const ch7NiyalaShelter: DialogueTree = {
  id: 'ch7-niyala-shelter',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Believer from Khurásán',
      onEnter: { set: { ch7NiyalaArrived: true } },
      text: 'Down! Get down behind the rock! (He drags you by the sleeve into the lee of the boulders.) They are throwing from the top of the hill. Stones the size of a fist.',
      voice: { voice: 'fear', text: 'The road west is open. The others are already running.' },
      choices: [
        { text: 'Run, as the others are running.', next: 'ran', voice: 'fear', effect: { set: heed(FEAR_MOMENT, 'fear') } },
        { text: '(Stay down beside him.)', next: 'stay', effect: { set: resist(FEAR_MOMENT) } },
      ],
    },
    ran: {
      speaker: 'Narrator',
      text: 'You get three steps onto the road before a stone takes you on the shoulder and puts you in the dust. The man from Khurásán hauls you back behind the rocks. Neither of you says anything about it.',
      choices: [{ text: '(Look back at the camp.)', next: 'watch' }],
    },
    stay: {
      speaker: 'Narrator',
      text: 'You press yourself against the cold flank of the rock. Stones crack off it above your head and roll on down into the stream.',
      choices: [{ text: '(Look back at the camp.)', next: 'watch' }],
    },
    watch: {
      speaker: 'Narrator',
      text: 'From the boulders you see the camp break apart. Men run down the valley half-dressed, leaving tents and horses. On the brow of the hill the people of Niyálá are shouting, and the stones keep coming.',
      choices: [{ text: '"Where is Quddús?"', next: 'quddus' }],
    },
    quddus: {
      speaker: 'A Believer from Khurásán',
      text: 'Gone, God be thanked. I saw it. Bahá\'u\'lláh put His own garments on Quddús and sent him off to a place of safety, meaning to follow after. Whoever is hunting Quddús this morning is hunting a man in another\'s clothes.',
      choices: [{ text: '"And Ṭáhirih?"', next: 'tahirih' }],
    },
    tahirih: {
      speaker: 'A Believer from Khurásán',
      text: 'Still in the camp, with her maid. And one other: the young man from Shíráz, Mírzá ʿAbdu\'lláh. Everyone else has run. (He looks at his own hands.) So have I, it seems, as far as this rock.',
      choices: [{ text: '(Keep your head down, and watch.)', next: 'plunder' }],
    },
    plunder: {
      speaker: 'Narrator',
      text: 'Then the stones stop, and the villagers come running down the slope for the tents. In the camp a young man has drawn a sword and stands over the baggage alone. He is struck, and stands again.',
      choices: [{ text: '(Watch.)', next: 'stop' }],
    },
    stop: {
      speaker: 'Narrator',
      onEnter: { set: { ch7NiyalaSheltered: true } },
      text: 'Word reaches him from Bahá\'u\'lláh, and he lowers the sword. The villagers carry off what they can and climb back to their houses. The valley goes quiet. Somewhere a horse that has slipped its tether is drinking from the stream.',
    },
  },
};

export const ch7NiyalaKhurasaniAfter: DialogueTree = {
  id: 'ch7-niyala-khurasani-after',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Believer from Khurásán',
      text: 'I keep thinking of the road from Badasht. We chanted her odes behind the howdah all day, and the mountains sang them back. It was glorious. (A pause.) It was also loud, and not all of us were singing for God.',
      choices: [
        { text: '"What do you mean?"', next: 'excess' },
        { text: '"You think we brought this on ourselves?"', next: 'excess' },
      ],
    },
    excess: {
      speaker: 'A Believer from Khurásán',
      text: 'Some of the friends heard that the old law was laid aside and took it for leave to do as they pleased. Freedom from a law is not freedom from God. The villagers did not know the difference. I think a few of us did not either.',
      choices: [{ text: '"What will you do now?"', next: 'end' }],
    },
    end: {
      speaker: 'A Believer from Khurásán',
      onEnter: { set: { ch7HeardExcess: true } },
      text: 'Go down the valley and find the ones who ran. Somebody must tell them what happened here, before they make it into a worse story.',
    },
  },
};

export const ch7NiyalaAbdullah: DialogueTree = {
  id: 'ch7-niyala-abdullah',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mírzá ʿAbdu\'lláh',
      text: '(A young man sits against a saddle, blood through his sleeve and at his temple, a sword in the grass beside him.) Is it over? They took the copper pots. I could not stop them taking the pots.',
      choices: [
        { text: '"Let me see your arm."', next: 'bind' },
        { text: '"You stood alone against all of them?"', next: 'alone' },
      ],
    },
    alone: {
      speaker: 'Mírzá ʿAbdu\'lláh',
      text: 'Not against them. In front of the baggage. Someone had to. (He winces.) And then word came that I should put the sword down, and let them take it. So I did.',
      choices: [{ text: '"Let me see to your wounds."', next: 'bind' }],
    },
    bind: {
      speaker: 'Narrator',
      text: 'You tear strips from your own sash and wash the cuts with water from the stream: three along the arm, and one on the scalp that bleeds more than it should. He watches the hill while you work.',
      choices: [{ text: '(Tie off the last bandage.)', next: 'why' }],
    },
    why: {
      speaker: 'Mírzá ʿAbdu\'lláh',
      text: 'I did not understand it. Our friends\' things carried up the hill, and He bade me stand aside. (He is quiet a while.) Perhaps a heap of baggage is not worth a man\'s blood. Perhaps He knew some of it would come back.',
      choices: [
        { text: '"Rest now. You kept what could be kept."', next: 'end' },
        { text: '"You were brave. That is not nothing."', next: 'end' },
      ],
    },
    end: {
      speaker: 'Mírzá ʿAbdu\'lláh',
      onEnter: { set: { ch7BoundWounds: true } },
      text: 'Brave, and told to stop. I will be thinking about that for a long time. (He closes his eyes.) Thank you, friend. Shíráz is very far from here.',
    },
  },
};

export const ch7NiyalaAbdullahAfter: DialogueTree = {
  id: 'ch7-niyala-abdullah-after',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mírzá ʿAbdu\'lláh',
      text: 'The bandages are holding. Go and see to Ṭáhirih. She has not sat down since the first stone.',
    },
  },
};

export const ch7NiyalaLedger: DialogueTree = {
  id: 'ch7-niyala-ledger',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'In the trampled grass lies a ledger with its spine split: the Keeper of Names\' list, every day of Badasht and every name given there. A hoofprint runs across one page.',
      choices: [{ text: '(Gather it up, and smooth the pages.)', next: 'end' }],
    },
    end: {
      speaker: 'Narrator',
      onEnter: { set: { ch7GatheredLedger: true } },
      text: 'Most of the pages are whole. You find the day the veil fell, and close the book over it.',
    },
  },
};

export const ch7NiyalaOdes: DialogueTree = {
  id: 'ch7-niyala-odes',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Sheets of paper have blown against the rocks below Ṭáhirih\'s tent: her odes, copied out fair by the friends who chanted them on the road. One has a boot-print across its last verse.',
      choices: [{ text: '(Gather every sheet you can find.)', next: 'end' }],
    },
    end: {
      speaker: 'Narrator',
      onEnter: { set: { ch7GatheredOdes: true } },
      text: 'You count them twice. One is missing. Perhaps it went up the hill in someone\'s arms. Perhaps someone up there will read it.',
    },
  },
};

export const ch7NiyalaVillager: DialogueTree = {
  id: 'ch7-niyala-villager',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Villager of Niyálá',
      text: '(A man comes down the hill path with a saddlebag in his arms, and stops when he sees you.) Peace. I have brought this back. It is not mine. It is not anybody\'s in my house.',
      choices: [
        { text: '"Why did you stone us?"', next: 'why' },
        { text: '"Who sent you down?"', next: 'sent' },
      ],
    },
    why: {
      speaker: 'A Villager of Niyálá',
      text: 'Men came through from Sháhrúd saying the guests at Badasht had thrown off the law, that a woman went among them unveiled. Then you came singing down our valley. We were told you were a danger to our wives. (He looks at the ground.) At dawn, from up there, it is easy to be brave with a stone.',
      choices: [{ text: '"And now?"', next: 'sent' }],
    },
    sent: {
      speaker: 'A Villager of Niyálá',
      text: 'The nobleman of Núr came up to the village. He did not shout. He sat with the headmen and spoke of what we had done, and asked if that is how Mázindarán treats a guest. Some of the old men wept. (He holds out the saddlebag.)',
      choices: [{ text: '(Take the saddlebag.)', next: 'end' }],
    },
    end: {
      speaker: 'Narrator',
      onEnter: { set: { ch7NiyalaVillager: true } },
      text: 'Inside are a copper bowl, a Qur\'án wrapped in cloth, and a pen-case with its pens still in it. The villager climbs back up the hill without looking round.',
    },
  },
};

export const ch7NiyalaTahirihWait: DialogueTree = {
  id: 'ch7-niyala-tahirih-wait',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Ṭáhirih',
      text: '(She is folding a torn cloak, very precisely.) You are unhurt? Good. Then see to ʿAbdu\'lláh first, and gather what can be gathered. We will speak before the company parts.',
    },
  },
};

export const ch7NiyalaTahirih: DialogueTree = {
  id: 'ch7-niyala-tahirih',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Ṭáhirih',
      text: 'You have been busy, friend. (She looks at the ledger and the odes in your arms.) The names and the songs. Of all things to save, I am glad it was those.',
      choices: [
        { text: '"You did not run."', next: 'stay' },
        { text: '"I ran. Only three steps, but I ran."', next: 'ran', requires: f => heededAt(f, FEAR_MOMENT, 'fear') },
        { text: '"Where will you go now?"', next: 'nur' },
      ],
    },
    ran: {
      speaker: 'Ṭáhirih',
      text: 'Three steps, and then you came back. I have known men run three hundred leagues from a truth and call it prudence. (Almost a smile.) Do not make too much of your three steps.',
      choices: [{ text: '"Where will you go now?"', next: 'nur' }],
    },
    stay: {
      speaker: 'Ṭáhirih',
      text: 'Where would I have run? (A short laugh.) No. I stayed where I was put. One does not leave a door one has just opened because the wind comes through it.',
      choices: [{ text: '"Where will you go now?"', next: 'nur' }],
    },
    nur: {
      speaker: 'Ṭáhirih',
      text: 'To Núr. Bahá\'u\'lláh will take me there, with my maid, and leave me in the keeping of a trusted friend. Quddús has gone ahead in borrowed clothes. The rest are scattered down every valley in Mázindarán.',
      choices: [{ text: '"Then Badasht is over."', next: 'over' }],
    },
    over: {
      speaker: 'Ṭáhirih',
      text: 'Badasht is not over. It is only no longer in one place. Every man who ran from this camp will tell the story somewhere tonight. Pray that they tell it truly.',
      choices: [{ text: '(Help load what is left onto the horses.)', next: 'parts' }],
    },
    parts: {
      speaker: 'Narrator',
      text: 'By noon the little company has gone on toward Núr, and you stand alone on the road with the stream and the stones. News follows you: Quddús has been seized and is held at Sárí, in the house of its leading divine.',
      choices: [{ text: '(Take the road west.)', next: 'road' }],
    },
    road: {
      speaker: 'Narrator',
      onEnter: { set: { badashtComplete: true } },
      text: 'You turn west, toward the mountain where the Báb is held, and on the road you hear that He has been brought down to Tabríz. Far to the east, in Khurásán, Mullá Ḥusayn has raised a black standard and set out on the road west, toward the green hills he spoke of at Mákú.',
    },
  },
};
