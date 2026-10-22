import type { DialogueTree, FlagState } from '../../dialogue/types';
import { chapter10RoadDialogues } from './chapter10_exile_road';
import { chapter10StreetDialogues } from './chapter10_street';

/**
 * The Síyáh-Chál, August to December 1852. Bahá'u'lláh is chained here in
 * Qará-Guhar, but He is never a speaker or a sprite: the player knows Him
 * through the prisoners' testimony, the chain, the shaft of light, and the
 * narrator's reverent recollection of His own later account. The chant is
 * the one Nabíl and Bahá'u'lláh record: one row calls, the other answers.
 */

const PIT_COMPANY_FLAGS = [
  'ch10JoinedChant',
  'heardPrisonerHope',
  'ch10HeardSulayman',
  'ch10MetRida',
  'sawChains',
  'ch10HeardTahirih',
] as const;

/** How many of the pit's people and stories the player has kept company with. */
export function pitCompanyCount(flags: FlagState): number {
  return PIT_COMPANY_FLAGS.filter(flag => !!flags[flag]).length;
}

/** The two rows of chained men and their call and response. */
export const ch10Chant: DialogueTree = {
  id: 'ch10-chant',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Night, or what passes for night here. The prisoners sit in two rows facing each other, feet in the stocks, the chain running from neck to neck. A murmur begins, low as water under stone. They were taught a verse to keep them through the dark.',
      choices: [{ text: '(Listen.)', next: 'call' }],
    },
    call: {
      speaker: 'The First Row',
      text: '"God is sufficient unto me; He verily is the All-Sufficing!"',
      choices: [
        { text: '(Keep silent, and let the answer come.)', next: 'answer' },
        { text: '(Answer with the second row.)', next: 'answer', effect: { set: { ch10SangChant: true } } },
      ],
    },
    answer: {
      speaker: 'The Second Row',
      text: '"In Him let the trusting trust."',
      choices: [{ text: '(Again.)', next: 'again' }],
    },
    again: {
      speaker: 'The First Row',
      text: '"God is sufficient unto me; He verily is the All-Sufficing!"',
      choices: [{ text: '"In Him let the trusting trust."', next: 'night', effect: { set: { ch10SangChant: true } } }],
    },
    night: {
      speaker: 'Narrator',
      onEnter: { set: { ch10JoinedChant: true } },
      text: 'Back and forth it goes until the small hours, the chains keeping a rough time. The sound climbs three flights of stair, slips past the guard, and goes out over the sleeping roofs toward the palace, not far off.',
    },
  },
};

/** A cobbler chained in the row nearest the place where Bahá'u'lláh sits. */
export const ch10Prisoner: DialogueTree = {
  id: 'ch10-prisoner',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Fellow Prisoner',
      text: 'Mind the chain; it bites whenever a man turns in his sleep. I was a cobbler in the Sar-Chashmih quarter. They took me at my last, with a slipper in my hand. Yet when He who wears the heaviest chain lifts His head, this place forgets its own name for a moment.',
      choices: [
        { text: '"Are you not afraid?"', next: 'afraid' },
        { text: '"What is He like, here in the dark?"', next: 'words' },
        { text: '"I was at Shíráz, on the night it began."', next: 'kept',
          requires: f => f.recognised === true },
        { text: '"I kept vigil at a door in Shíráz once, and asked for time."', next: 'asked',
          requires: f => f.recognised === false },
        { text: '"How does a man bear the hours down here?"', next: 'hours',
          requires: f => f.recognised !== false },
        { text: '(Sit beside him without speaking.)', next: 'beside' },
      ],
    },
    afraid: {
      speaker: 'Fellow Prisoner',
      onEnter: { set: { heardPrisonerHope: true } },
      text: 'I am afraid. Every dawn the jailer calls a name. But hope is not the absence of fear. It is the lamp that makes fear cast a smaller shadow.',
    },
    words: {
      speaker: 'Fellow Prisoner',
      text: 'He speaks little. No boast, no word of vengeance. When a man weeps, He asks the man\'s name and his trade. When the jailer calls a name at dawn, the man called goes up the stair lighter than he came down.',
      choices: [{ text: '"And He watches them go?"', next: 'watch' }],
    },
    watch: {
      speaker: 'Fellow Prisoner',
      onEnter: { set: { heardPrisonerHope: true } },
      text: 'As a father watches a son ride out on a journey. It was He who taught us the verse we sing. I think He knew that men who are singing cannot be wholly made into prisoners.',
    },
    kept: {
      speaker: 'Fellow Prisoner',
      text: 'Shíráz! Then you saw the morning star rise, and you have watched it all these years as it was hunted across the sky. Tell me, is it hard to be down here, after that?',
      choices: [{ text: '"No. It feels like the same night, still going on."', next: 'same' }],
    },
    asked: {
      speaker: 'Fellow Prisoner',
      text: 'Asked for time! Well, you have plenty of it now. There is nothing in this pit but time. Do you still need it?',
      choices: [{ text: '"Less than I did. I am not sure yet how much less."', next: 'same' }],
    },
    hours: {
      speaker: 'Fellow Prisoner',
      text: 'Hours! There is nothing in this pit but hours. A man finds out down here what he believes, because there is nothing left to take his mind off it. Have you found out yet?',
      choices: [{ text: '"I am finding out."', next: 'same' }],
    },
    same: {
      speaker: 'Fellow Prisoner',
      onEnter: { set: { heardPrisonerHope: true } },
      text: 'Stay near the light, then, when you can. Something keeps watch there. I do not have a better word for it.',
    },
    beside: {
      speaker: 'Narrator',
      onEnter: { set: { heardPrisonerHope: true, satWithPrisoner: true } },
      text: 'Your silence joins his. Somewhere in the pit a chain settles, and the sound passes like a question through the dark. After a while he leans his shoulder against yours, as men do on a long road.',
    },
  },
};

/** Ḥájí Muḥsin: a merchant of the cloth bazaar who has lost everything. */
export const ch10RuinedBeliever: DialogueTree = {
  id: 'ch10-ruined-believer',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Ḥájí Muḥsin',
      text: 'Forgive me if I do not rise. I am Ḥájí Muḥsin, of the cloth bazaar. Last month I had forty bolts of Kashmir shawl and a house with a pool. Now I have this chain, and a name the jailer has not yet called.',
      choices: [
        { text: '"What became of your house?"', next: 'loss' },
        { text: '"How do you bear it?"', next: 'bear' },
        { text: '"Is there news from above?"', next: 'news' },
      ],
    },
    loss: {
      speaker: 'Ḥájí Muḥsin',
      text: 'Men came the day after the Sháh was wounded. They took the shawls, the carpets, the very door from its hinges. My sons have fled to kin in Qazvín, God willing. My wife I do not know.',
      choices: [{ text: '"How do you bear it?"', next: 'bear' }],
    },
    bear: {
      speaker: 'Ḥájí Muḥsin',
      text: 'I am a merchant. I know what a thing is worth. I have been robbed of everything I could put a price on, and I find I am not poorer. Write that in no ledger; the tax men would want their share.',
      choices: [{ text: '"Is there news from above?"', next: 'news' }],
    },
    news: {
      speaker: 'Ḥájí Muḥsin',
      text: 'The jailer told us of Sulaymán Khán. They cut wounds in his flesh and set lighted candles in them, and led him through the bazaar to the sound of drums. He walked as a bridegroom walks, reciting verses as he went.',
      choices: [{ text: '(Bow your head.)', next: 'after' }],
    },
    after: {
      speaker: 'Ḥájí Muḥsin',
      onEnter: { set: { ch10HeardSulayman: true } },
      text: 'I was at his wedding, twenty years ago. He walked the same way then. Some men have only the one way of walking.',
    },
  },
};

/** Riḍá, Zahrá's brother, nineteen and newly chained. */
export const ch10YoungPrisoner: DialogueTree = {
  id: 'ch10-young-prisoner',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Riḍá',
      text: 'Who is that? You have not the jailer\'s step. Sit, if you can find room. My name is Riḍá.',
      choices: [
        { text: '"Your sister Zahrá sends bread."', next: 'bread', requires: f => !!f.ch10CarriedBread },
        { text: '"How did you come to be here?"', next: 'how' },
        { text: '"Are you hurt?"', next: 'hurt' },
      ],
    },
    bread: {
      speaker: 'Riḍá',
      onEnter: { set: { ch10GaveBread: true, ch10MetRida: true } },
      text: 'He holds the cloth to his face before he opens it. "She folds the corners like our mother did." He breaks the bread in two and, without asking, passes half along the row to the old merchant beside him.',
    },
    how: {
      speaker: 'Riḍá',
      onEnter: { set: { ch10MetRida: true } },
      text: 'I went to hear them speak of justice. I liked how they spoke. When the farrásh asked if I was a Bábí, I found I could not say no. I am still not sure I could say yes. Is that strange?',
      choices: [{ text: '"It is where every one of us began."' }],
    },
    hurt: {
      speaker: 'Riḍá',
      onEnter: { set: { ch10MetRida: true } },
      text: 'The ankle, where the stocks rub. And the cold, though it is summer above. Tell me something of outside. Is the mulberry by the bath-house still in fruit?',
      choices: [{ text: '"It is. The children are purple to the elbows."' }],
    },
  },
};

/** The chain Qará-Guhar, coiled against the far pillar. */
export const ch10Chain: DialogueTree = {
  id: 'ch10-chain',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'A chain lies coiled against the pillar, links as thick as a man\'s thumb. The prisoners have a name for it, as men name a cruel animal: Qará-Guhar. Its sister, Salásil, is hardly lighter.',
      choices: [
        { text: '(Try to lift it.)', next: 'lift' },
        { text: '(Leave it be.)', next: 'leave' },
      ],
    },
    lift: {
      speaker: 'Narrator',
      onEnter: { set: { sawChains: true } },
      text: 'You raise it a hand\'s breadth before your arms shake. This weight was locked about one neck, day and night, for four months. The marks it left would stay with Him to the end of His life.',
    },
    leave: {
      speaker: 'Narrator',
      onEnter: { set: { sawChains: true } },
      text: 'You do not touch it. Some things are not yours to handle, even to measure their cruelty.',
    },
  },
};

/** The jailer in August: he calls a name each dawn. */
export const ch10Jailer: DialogueTree = {
  id: 'ch10-jailer',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'The Jailer',
      text: 'Each morning I come down with the lamp and call a name. Do not look at me like that. I do not choose the names.',
      choices: [
        { text: '"Who does?"', next: 'names' },
        { text: '"What news is there of the city?"', next: 'tahirih' },
        { text: '"Do they hear the singing, up above?"', next: 'song' },
      ],
    },
    names: {
      speaker: 'The Jailer',
      text: 'The court. And the court is clever: it hands the Bábís out among the guilds and the household. The bakers take one, the gunners another, the stewards a third. So the blood is on every sleeve, and no sleeve can point at another.',
    },
    tahirih: {
      speaker: 'The Jailer',
      text: 'The poetess of Qazvín, the one they call Ṭáhirih, was taken by night to the Ílkhání garden. They say she had dressed as for a wedding, and had her silk kerchief ready for them. They lowered her into a well.',
      choices: [{ text: '(Close your eyes.)', next: 'after' }],
    },
    after: {
      speaker: 'The Jailer',
      onEnter: { set: { ch10HeardTahirih: true } },
      text: 'The man who did it was drunk. He had to be. Nobody sober could have looked at her face. That is what they say in the guardroom, and then they stop saying anything.',
    },
    song: {
      speaker: 'The Jailer',
      text: 'Hear it? I hear it in my sleep. My wife asked me last week what the words meant. I told her I did not know. That was a lie.',
    },
  },
};

/** The jailer in December: the player's name is called, for release. */
export const ch10JailerRelease: DialogueTree = {
  id: 'ch10-jailer-release',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Weeks pass, then months. The cold comes down the stair before the jailer does. One morning in December the lamp descends, and the jailer calls a name, and every head in the rows turns. It is yours.',
      choices: [{ text: '(Rise.)', next: 'rise' }],
    },
    rise: {
      speaker: 'The Jailer',
      text: 'Up. Not that way: up the stair. Your name is on a paper with the Grand Vizier\'s seal, among men whose guilt could not be proved. Do not thank me.',
      choices: [
        { text: '"And He who wore the heaviest chain?"', next: 'him' },
        { text: '(Look back along the rows.)', next: 'rows' },
      ],
    },
    him: {
      speaker: 'The Jailer',
      text: 'Gone up before you. The man who plotted the madness swore He had no part in it, and the Russian envoy would not let the matter rest. Four months He sat down here. Now He must leave Persia within the month, they say, for Baghdád.',
      choices: [{ text: '(Look back along the rows.)', next: 'rows' }],
    },
    rows: {
      speaker: 'Narrator',
      onEnter: { set: { ch10Released: true } },
      text: 'Riḍá lifts his chained hand: "Tell Zahrá I am singing." Ḥájí Muḥsin\'s lips move with the verse. The place by the pillar where the light falls is empty now. You climb the three flights of stair into a light so white it hurts.',
    },
  },
};

/** Before the player has kept company with the rows. */
export const ch10VisionWaiting: DialogueTree = {
  id: 'ch10-vision-waiting',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'A grey thread of light falls through a crack in the vault onto the stones by the far pillar. Not yet. That place is no stage for a newcomer\'s curiosity. Sit first among the men in the rows, and let the dark make you one of them.',
    },
  },
};

/** The hidden dawn, told only through narration and testimony. */
export const ch10Vision: DialogueTree = {
  id: 'ch10-vision',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Here the vault is cracked, and a thread of grey light falls on the stones. Against the pillar, bowed under Qará-Guhar, sits the Prisoner the rows speak of in lowered voices. You keep your eyes on the floor. It is not a thing to stare at.',
      choices: [
        { text: '(Let your heart tremble for Him.)', next: 'compassion', effect: { set: { ch10Stance: 'compassion' } } },
        { text: '(Wonder how anything could be born in such a place.)', next: 'wonder', effect: { set: { ch10Stance: 'wonder' } } },
        { text: '(Attend only to the faint light.)', next: 'attend', effect: { set: { ch10Stance: 'silence' } } },
      ],
    },
    compassion: {
      speaker: 'Fellow Prisoner',
      text: 'He whispers from the row: "Do not weep where He can see it. I wept the first week. He looked at me as though I were the one in chains, and I was ashamed. And then, God knows why, I was not afraid."',
      choices: [{ text: '(Dry your eyes, and keep watch.)', next: 'light' }],
    },
    wonder: {
      speaker: 'Narrator',
      text: 'You ask the dark, and the dark does not answer. But you remember that the first night, too, was hidden: a closed door, a lamp behind a lattice, and you outside it, seeing nothing.',
      choices: [{ text: '(Keep watch, as you did then.)', next: 'light' }],
    },
    attend: {
      speaker: 'Narrator',
      text: 'The light is almost nothing. Still it gathers on the stone as if answering a summons too gentle for the ear.',
      choices: [{ text: '(Keep watch.)', next: 'light' }],
    },
    light: {
      speaker: 'Narrator',
      text: 'No spectacle breaks the pit. No voice you can hear. Only, toward dawn, a stillness so complete that even the chains fall quiet, and men in the rows lift their heads without knowing why.',
      choices: [{ text: '(Remain.)', next: 'testimony' }],
    },
    testimony: {
      speaker: 'Narrator',
      text: 'Years afterward He would write of these nights: that in the rare moments the chains allowed Him sleep, He felt something flow from the crown of His head over His breast, like a torrent rushing from a mountain onto the earth.',
      choices: [{ text: '(Remain.)', next: 'maiden' }],
    },
    maiden: {
      speaker: 'Narrator',
      onEnter: { set: { ch10WitnessedDawn: true } },
      text: 'He would write, too, of a Maiden who appeared to Him in that darkness, calling between earth and heaven, and of a summons to arise. Tonight you know none of this. You know only that the dark has changed, and that you were in it.',
    },
  },
};

export const chapter10Dialogues: Record<string, DialogueTree> = {
  ...chapter10StreetDialogues,
  [ch10Chant.id]: ch10Chant,
  [ch10Prisoner.id]: ch10Prisoner,
  [ch10RuinedBeliever.id]: ch10RuinedBeliever,
  [ch10YoungPrisoner.id]: ch10YoungPrisoner,
  [ch10Chain.id]: ch10Chain,
  [ch10Jailer.id]: ch10Jailer,
  [ch10JailerRelease.id]: ch10JailerRelease,
  [ch10VisionWaiting.id]: ch10VisionWaiting,
  [ch10Vision.id]: ch10Vision,
  ...chapter10RoadDialogues,
};
