import type { DialogueTree } from '../../dialogue/types';

/**
 * The Masjid of Kúfih, late January to March 1844 (Nabíl, chapter II and the
 * opening of III): forty days of prayer and fasting with Mullá Ḥusayn, his
 * brother and his nephew; the keeper of the masjid; other students of the
 * late Siyyid keeping their own vigil; and on the fortieth day, the road to
 * Najaf, the Gulf and Persia.
 */

/** Mullá Ḥusayn's brother, by the cells. */
export const brother: DialogueTree = {
  id: 'fr-kufih-brother',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá Ḥusayn\'s Brother',
      text: '(He is sitting outside the cells with a bowl of dates covered by a cloth.) Day eleven. He eats once a day, at sunset, a little bread and a few of these. Then he prays until the dawn call, and sleeps an hour, and begins again.',
      choices: [
        { text: '"Has he said anything?"', next: 'said' },
        { text: '"And you? Are you fasting too?"', next: 'you' },
      ],
    },
    said: {
      speaker: 'Mullá Ḥusayn\'s Brother',
      text: 'To me? "God is enough." (He smiles.) He was like this as a boy in Bushrúyih, when he wanted a thing badly. He goes very quiet, and then one morning he gets up and walks out of the door and does not stop.',
      choices: [{ text: '(Sit with him a while.)', next: 'end' }],
    },
    you: {
      speaker: 'Mullá Ḥusayn\'s Brother',
      text: 'As far as I can. Someone has to fetch the bread from the village, and someone has to be awake when he comes out. (He uncovers the bowl.) Take one. You look as if you have been counting the days, too.',
      choices: [{ text: '(Take a date, and sit with him.)', next: 'end' }],
    },
    end: {
      speaker: 'Narrator',
      onEnter: { set: { frKufihBrother: true } },
      text: 'From behind the curtain of the third cell, Mullá Ḥusayn\'s voice rises and falls, too low to make out the words. His brother listens to it the way you would listen to a river.',
    },
  },
};

/** The nephew, at the well. */
export const nephew: DialogueTree = {
  id: 'fr-kufih-nephew',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá Ḥusayn\'s Nephew',
      text: '(A youth not yet twenty, hauling up the well-bucket hand over hand.) Day twenty-six. Or twenty-seven. I scratch them on the wall of my cell, but I think I scratched one twice.',
      choices: [
        { text: '"Do you know where he will go, after?"', next: 'where' },
        { text: '"Do you miss home?"', next: 'home' },
      ],
    },
    where: {
      speaker: 'Mullá Ḥusayn\'s Nephew',
      text: 'He has not said. Only that we will not go back to Karbilá. (He sets down the bucket.) Uncle never says where until he is already walking. You just have to keep your sandals by the door.',
      choices: [{ text: '"Then we will keep them there."', next: 'end' }],
    },
    home: {
      speaker: 'Mullá Ḥusayn\'s Nephew',
      text: 'Bushrúyih? Sometimes. My mother\'s bread. (He shrugs, embarrassed.) But I would rather be here when it happens, whatever it is, than hear of it from a traveller at home.',
      choices: [{ text: '"So would I."', next: 'end' }],
    },
    end: {
      speaker: 'Narrator',
      onEnter: { set: { frKufihNephew: true } },
      text: 'He fills your water-jar before his own, and carries both across the court.',
    },
  },
};

/** The keeper of the masjid, at the gate. */
export const keeper: DialogueTree = {
  id: 'fr-kufih-keeper',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'The Keeper of the Masjid',
      text: '(An old Arab of Kúfih with a broom of palm-ribs.) This is the oldest masjid in ʿIráq, Persian. The Imám ʿAlí prayed here, and here he was struck down at the dawn prayer. People come to it to pray who want to be left alone with God.',
      choices: [{ text: '"There are others here besides us?"', next: 'others' }],
    },
    others: {
      speaker: 'The Keeper of the Masjid',
      text: 'Another company of your Siyyid\'s students came after you, a dozen of them, with a man of Basṭám at their head. They keep their own vigil in the far cells. They fast as your Mullá fasts. (He leans on the broom.) What are you all waiting for?',
      choices: [
        { text: '"For a sign of where to look."', next: 'sign' },
        { text: '"I do not know yet."', next: 'sign' },
      ],
    },
    sign: {
      speaker: 'The Keeper of the Masjid',
      onEnter: { set: { frKufihKeeper: true } },
      text: 'Hm. (He sweeps a little.) In my experience, men who fast forty days in this place do not stay in it afterwards. Whatever you are looking for, it is not here. That is perhaps the sign.',
    },
  },
};

/** The player's own place in the cells: keeping the fast. */
export const ownCell: DialogueTree = {
  id: 'fr-own-cell',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Your own cell: a mat, a water-jar, a lamp in a niche. The days have a shape now. Water and dates at sunset, prayer through the long cold nights, a little sleep before the dawn call.',
      choices: [
        { text: '(Pray as Siyyid Káẓim taught you: that you may know Him by Himself.)', next: 'pray' },
        { text: '(Recall his words: do not linger.)', next: 'recall' },
      ],
    },
    pray: {
      speaker: 'Narrator',
      text: 'You pray to be ready, and then, which is harder, not to be sure of what you are ready for: not to carry a picture of Him in your head, to be checked against every face.',
      choices: [{ text: '(Go on.)', next: 'end' }],
    },
    recall: {
      speaker: 'Narrator',
      text: 'Do not linger. Scatter. Seek. You think of the elder student keeping the door in Karbilá, and the boy from Khurásán walking east alone, and you wonder which of you has understood.',
      choices: [{ text: '(Go on.)', next: 'end' }],
    },
    end: {
      speaker: 'Narrator',
      onEnter: { set: { frKeptFast: true } },
      text: 'Hunger becomes a kind of quiet. One night you realise you can hear the Euphrates wind in the palms beyond the wall, and Mullá Ḥusayn\'s voice three cells away, and your own heart, and that they are keeping the same time.',
    },
  },
};

/** Mullá Ḥusayn's cell, while he keeps his retreat. */
export const husaynCell: DialogueTree = {
  id: 'fr-husayn-cell',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'A lamp burns in the doorway of the third cell, behind a curtain of plain wool. His voice comes through it, low and steady, saying the same prayer over and over. You do not go in. His brother has told you: when he is ready, he will come out.',
    },
  },
};

/** The fortieth day: Mullá Ḥusayn comes out, and the chapter's close. */
export const fortieth: DialogueTree = {
  id: 'fr-husayn-fortieth',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'On the fortieth morning the curtain of the third cell is drawn back. Mullá Ḥusayn stands in the court in the early light, thinner, and very calm, like a man who has set down a heavy load and found he did not need it.',
      choices: [{ text: '(Go to him.)', next: 'go' }],
    },
    go: {
      speaker: 'Mullá Ḥusayn',
      text: 'Forty days. (He looks up at the sky over the wall.) I asked to be shown the road, and I have not been shown it. I have only been made willing to walk it. Perhaps that is the same thing.',
      choices: [
        { text: '"Where will you go?"', next: 'where' },
        { text: '"Siyyid Káẓim said we would know Him by Himself."', next: 'himself' },
      ],
    },
    himself: {
      speaker: 'Mullá Ḥusayn',
      text: 'He did. So I will not go looking for a man who matches what I have been taught. I will go where I am drawn, and see who is there. (He almost smiles.) That is either faith or foolishness.',
      choices: [{ text: '"Where are you drawn?"', next: 'where' }],
    },
    where: {
      speaker: 'Mullá Ḥusayn',
      text: 'First to Najaf, to the Imám ʿAlí\'s shrine. Then down to the Gulf, and by sea to Búshihr, and into Persia. Something pulls me toward Persia, the way the needle pulls north. I cannot tell you more, because I do not know more.',
      choices: [{ text: '"I will come with you."', next: 'come' }],
    },
    come: {
      speaker: 'Mullá Ḥusayn',
      text: 'I hoped you would. (He turns to his brother and nephew, who are already rolling the bedding.) Then we are four. Fetch your things. We leave before the heat.',
      choices: [{ text: '(Fetch your things.)', next: 'end' }],
    },
    end: {
      speaker: 'Narrator',
      onEnter: { set: { forerunnersComplete: true } },
      text: 'You walk out of Kúfih with them that morning, toward Najaf and the Gulf and Persia, in the spring of 1844. Behind you, others of the Siyyid\'s students are rising from their own vigils, setting out by their own roads. None of you knows yet that the search will end in Shíráz, at a city gate, on an evening in May.',
    },
  },
};

export const forerunnersKufihDialogues: Record<string, DialogueTree> = {
  [brother.id]: brother,
  [nephew.id]: nephew,
  [keeper.id]: keeper,
  [ownCell.id]: ownCell,
  [husaynCell.id]: husaynCell,
  [fortieth.id]: fortieth,
};
