import type { DialogueTree } from '../../dialogue/types';

/**
 * Kulayn, spring 1847, after Nabíl's chapter on the Báb's journey from
 * Káshán to Tabríz: the escort kept clear of Qum, a night at Qumrúd, the
 * Grand Vizier's messenger at Kinár-Gird, the Vizier's own tent pitched on
 * a hillside among orchards and streams; the companions who came to camp
 * near Him; the sealed letter and gifts from Bahá'u'lláh brought by Mullá
 * Mihdíy-i-Kandí, and the joy it brought; the moonlit night the tent was
 * found empty; the Sháh's letter sending Him to Mákú. The tent is never
 * entered and the Báb never speaks.
 */

/** Muḥammad Big, as his men pitch the tent. */
export const kulaynBigArrival: DialogueTree = {
  id: 'kulayn-big-arrival',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Muḥammad Big',
      text: '(Muḥammad Big watches his men drive tent pegs into the hillside.) So. Not Ṭihrán after all, or not yet. Near Qum my men offered to take Him through the city to the shrine, orders or no. He thanked them and chose the open country.',
      choices: [{ text: '"Where are we?"', next: 'where' }],
    },
    where: {
      speaker: 'Muḥammad Big',
      text: 'Kulayn. We spent a night at Qumrúd, a village of my own kin; the headman begged Him to stay, and He blessed the place. Two days on we reached the fort of Kinár-Gird, half a day from the capital, and a rider met us there from the Grand Vizier. Turn aside, he said. Take Him to Kulayn.',
      choices: [{ text: '"Why here?"', next: 'why' }],
    },
    why: {
      speaker: 'Muḥammad Big',
      onEnter: { set: { kulaynCampArrived: true } },
      text: 'The village is the Vizier\'s own, and its houses are not fit, so he has lent his own tent. That one, on the slope. (He shrugs.) The Sháh wishes to see Him, they say. The Vizier wishes Him to wait. So we wait, in an orchard, with the almonds in flower. There are worse orders.',
    },
  },
};

/** Muḥammad Big through the waiting days. */
export const kulaynBigWaiting: DialogueTree = {
  id: 'kulayn-big-waiting',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Muḥammad Big',
      text: 'No word yet from the capital. (He runs a hand down a horse\'s neck.) The men are growing fat on village bread. Your friends have come out to camp near Him; sit with them, and with the village. They have more to tell you than I have.',
    },
  },
};

/** The Sháh's letter. */
export const kulaynBigOrder: DialogueTree = {
  id: 'kulayn-big-order',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Muḥammad Big',
      text: '(A courier\'s horse stands lathered at the picket line. Muḥammad Big holds a letter with its royal seal broken, and does not look happy with it.) It has come. In the Sháh\'s own name, though I would wager the Vizier held the pen.',
      choices: [{ text: '"What does it say?"', next: 'letter' }],
    },
    letter: {
      speaker: 'Muḥammad Big',
      text: 'That His Majesty is leaving the capital and cannot receive Him as he would wish. That He is to be taken to Mákú, in Ádhirbáyján, where ʿAlí Khán the warden is to treat Him with respect. That He will be sent for when the Sháh returns.',
      choices: [{ text: '"Mákú. That is the edge of the kingdom."', next: 'edge' }],
    },
    edge: {
      speaker: 'Muḥammad Big',
      text: 'That is the point of it. (He folds the letter.) A man the Sháh listens to is a danger to the man the Sháh listens to now. So: a fortress on a rock in the far corner of the realm. We ride by Qazvín to Tabríz, and I am to take Him myself.',
      choices: [{ text: '"And you?"', next: 'you' }],
    },
    you: {
      speaker: 'Muḥammad Big',
      onEnter: { set: { kulaynOrder: true } },
      text: '(He is quiet a moment.) In Iṣfahán they gave me a prisoner. I do not know what I have now. Go and stand by the tent, if you want to take leave of this place. We strike it at first light.',
    },
  },
};

/** Muḥammad Big after the order. */
export const kulaynBigDawn: DialogueTree = {
  id: 'kulayn-big-dawn',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Muḥammad Big',
      text: 'First light. The men are saddling. Go and stand by the tent while it is still standing.',
    },
  },
};

/** A woman of the village by the stream. */
export const kulaynVillager: DialogueTree = {
  id: 'kulayn-villager',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Woman of Kulayn',
      text: '(A village woman is rinsing a copper bowl in the stream.) You are with the soldiers? No, you have not got the face for it. This is the Vizier\'s village, did you know? Everything here is his: the orchards, the water, us.',
      choices: [
        { text: '"Who lies in the shrine across the stream?"', next: 'shrine' },
        { text: '"What do you make of the Guest in the red tent?"', next: 'guest' },
      ],
    },
    shrine: {
      speaker: 'A Woman of Kulayn',
      text: 'Shaykh Kulayní, who gathered the sayings of the Imáms into a great book. He was born here, and they buried him here. Scholars ride out from Ṭihrán to pray at his tomb and complain about our road.',
      choices: [{ text: '"And the Guest in the red tent?"', next: 'guest' }],
    },
    guest: {
      speaker: 'A Woman of Kulayn',
      text: 'I take curds up to the tent in the mornings, and the soldiers let me leave them on the carpet. (She turns the bowl over and over.) At night, when the camp is asleep, you can hear Him from the stream. Not loud. Like someone calling to a friend who has gone a long way off. Some nights I stop my ears.',
      choices: [{ text: '(Rinse the bowl for her.)', next: 'end' }],
    },
    end: {
      speaker: 'A Woman of Kulayn',
      onEnter: { set: { kulaynHeardVillager: true } },
      text: 'Thank you. (She takes it back.) The almonds came out the week He came. My mother says that means something. My mother says that about everything.',
    },
  },
};

/** Mullá ʿAbdu'l-Karím of Qazvín, before the letter. */
export const kulaynAbdulKarim: DialogueTree = {
  id: 'kulayn-abdul-karim',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá ʿAbdu\'l-Karím',
      text: '(A believer from Qazvín sits outside a small green tent, trimming a reed pen.) Peace be upon you. We came out two days after Him: Siyyid Ḥusayn of Yazd and his brother Siyyid Ḥasan, Shaykh Ḥasan of Zunúz, and I. The officer lets us camp here, within call.',
      choices: [{ text: '"How is He?"', next: 'how' }],
    },
    how: {
      speaker: 'Mullá ʿAbdu\'l-Karím',
      onEnter: { set: { kulaynCompanions: true } },
      text: 'He receives us. He dictates; we copy. (He tests the nib on his thumbnail.) But He has wept, these weeks. Since Shíráz, they tell me, since they took Him from His house. One does not ask why. One only sits nearby.',
    },
  },
};

/** Mullá ʿAbdu'l-Karím, after the letter: the moonlit night. */
export const kulaynAbdulKarimMoonlit: DialogueTree = {
  id: 'kulayn-abdul-karim-moonlit',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá ʿAbdu\'l-Karím',
      text: 'Sit. I will tell you something, and you may do with it what you like. (He lays down the pen.) One night, while we slept, the soldiers found His tent empty.',
      choices: [{ text: '"Empty?"', next: 'empty' }],
    },
    empty: {
      speaker: 'Mullá ʿAbdu\'l-Karím',
      text: 'Horsemen ran about the hillside. Muḥammad Big told them to be still: He has not fled, he said, He would never put us in danger, He will come back. Then he set off on foot down the road toward Ṭihrán, and we went after him. The moon was very bright.',
      choices: [{ text: '"And then?"', next: 'dawn' }],
    },
    dawn: {
      speaker: 'Mullá ʿAbdu\'l-Karím',
      onEnter: { set: { kulaynHeardMoonlit: true } },
      text: 'At dawn we saw Him coming up the road from the direction of Ṭihrán, walking. Muḥammad Big went to meet Him. (He is quiet a moment.) There was such majesty about Him that morning that none of us dared ask where He had been. None of us has asked since.',
    },
  },
};

/** Mullá Mihdíy-i-Kandí, arriving with the letter. */
export const kulaynKandi: DialogueTree = {
  id: 'kulayn-kandi',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá Mihdíy-i-Kandí',
      text: '(Two riders come up from the Ṭihrán road, dusty and in haste. The elder gets down stiffly and asks for the Siyyid\'s tent.) I am Mullá Mihdí, of Kand. My companion is Mullá Mihdí of Khuy. Between us we are a great many Mihdís.',
      choices: [{ text: '"You have come from the capital?"', next: 'letter' }],
    },
    letter: {
      speaker: 'Mullá Mihdíy-i-Kandí',
      text: 'From Ṭihrán, from Bahá\'u\'lláh. (He touches the breast of his coat, where something flat is buttoned in.) A sealed letter, and some gifts. I have carried them as if they were live coals. I am not to open it and I am not to lose it, and I have not slept well for three nights.',
      choices: [{ text: '"The tent is there, on the slope."', next: 'go' }],
    },
    go: {
      speaker: 'Mullá Mihdíy-i-Kandí',
      onEnter: { set: { kulaynLetterBrought: true } },
      text: '(He straightens his turban, then straightens it again.) Will you walk with me as far as the carpet? My knees have turned to water, and it is not the ride.',
    },
  },
};

/** Mullá Mihdíy-i-Kandí, after he has given the letter. */
export const kulaynKandiAfter: DialogueTree = {
  id: 'kulayn-kandi-after',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá Mihdíy-i-Kandí',
      text: '(He sits on a stone by the companions\' tent, his hands loose in his lap.) I gave it into His hand. I do not know what was written. I only know what I saw.',
      choices: [{ text: '"What did you see?"', next: 'saw' }],
    },
    saw: {
      speaker: 'Mullá Mihdíy-i-Kandí',
      text: 'His face. When He read, His face shone, as if a lamp had been lit behind it. He thanked me as though I had done some great thing, I, who only rode a horse. (He laughs, unsteadily.) They say that since Shíráz He has wept. Tonight He was praising God.',
      choices: [{ text: '(Sit with him.)', next: 'end' }],
    },
    end: {
      speaker: 'Mullá Mihdíy-i-Kandí',
      onEnter: { set: { kulaynHeardKandi: true } },
      text: 'I have carried bales of wool in my life, and sacks of rice, and once, a letter. I know which I shall remember.',
    },
  },
};

export const kulaynCampDialogues: Record<string, DialogueTree> = {
  [kulaynBigArrival.id]: kulaynBigArrival,
  [kulaynBigWaiting.id]: kulaynBigWaiting,
  [kulaynBigOrder.id]: kulaynBigOrder,
  [kulaynBigDawn.id]: kulaynBigDawn,
  [kulaynVillager.id]: kulaynVillager,
  [kulaynAbdulKarim.id]: kulaynAbdulKarim,
  [kulaynAbdulKarimMoonlit.id]: kulaynAbdulKarimMoonlit,
  [kulaynKandi.id]: kulaynKandi,
  [kulaynKandiAfter.id]: kulaynKandiAfter,
};
