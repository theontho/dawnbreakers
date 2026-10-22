import type { DialogueTree } from '../../dialogue/types';

/**
 * The court of the fort of ʿAlí-Mardán Khán: Muḥsin the muezzin and the
 * names of God cried through the night; the women who baked, sewed,
 * carried water and nursed the wounded, among them the mother of Ashraf,
 * who bore her son in the fort; and Mihr-ʿAlí, one of the nine children
 * sent out with the sealed Qur'án, who in old age told Nabíl what befell
 * them (Nabíl, chapter XXIV).
 */

/** Muḥsin at the foot of the wall, in summer and the truce. */
export const muhsin: DialogueTree = {
  id: 'zj-muhsin',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Muḥsin',
      text: 'You heard us as you came in? Every night the watch cries five names of God, nineteen times each, all along the walls: Alláh-u-Akbar, Alláh-u-Aʿẓam, Alláh-u-Ajmal, Alláh-u-Abhá, Alláh-u-Aṭhar. The Báb Himself bade it.',
      choices: [
        { text: '"What do the soldiers make of it?"', next: 'soldiers' },
        { text: '"And the call to prayer?"', next: 'adhan' },
      ],
    },
    soldiers: {
      speaker: 'Muḥsin',
      text: 'The first nights their camp fell into confusion; they thought we were coming over the walls. Now they post marksmen to fire at the voices. (He shrugs.) A voice is a hard thing to hit.',
      choices: [{ text: '"And the call to prayer?"', next: 'adhan' }],
    },
    adhan: {
      speaker: 'Muḥsin',
      onEnter: { set: { zjHeardInvocations: true } },
      text: 'That is my part. At dawn I climb this ladder and give the call from the wall. On a still morning they hear it in the villages. (He smiles.) My mother always said I was born too loud for a quiet life.',
    },
  },
};

/** Muḥsin's prayer rug, after he is killed. */
export const muhsinPlace: DialogueTree = {
  id: 'zj-muhsin-place',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'A prayer rug lies folded at the foot of the ladder, a stone on it against the wind. No one has taken it up.',
      choices: [{ text: '(Ask the women at the ovens.)', next: 'told' }],
    },
    told: {
      speaker: 'Narrator',
      text: 'Muḥsin\'s voice carried to the villages, and a siyyid of the town who could not bear it sent the Amír-Tumán a hundred tumans to have it silenced. One dawn, as Muḥsin gave the call from the wall, a marksman\'s bullet found him.',
      choices: [{ text: '(Look up at the wall.)', next: 'after' }],
    },
    after: {
      speaker: 'Narrator',
      onEnter: { set: { zjMournedMuhsin: true } },
      text: 'The fort still keeps the hours. Someone else climbs the ladder now. His voice is thinner, and every dawn the whole court holds its breath until it begins.',
    },
  },
};

/** The woman at the ovens, in summer and the truce: the women's work. */
export const womanOvens: DialogueTree = {
  id: 'zj-woman-ovens',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Woman of the Quarter',
      text: 'Sit if you like, but your hands will not stay idle long. (She slaps a round of dough against the hot wall of the oven.) We bake for the barricades. We sew, we nurse the wounded, we mend the sacks where the shot has torn them.',
      choices: [
        { text: '"Let me help."', next: 'help' },
        { text: '"Where does the water come from?"', next: 'water' },
      ],
    },
    water: {
      speaker: 'A Woman of the Quarter',
      text: 'From wherever it can be got, in skins on our backs, by night. (She nods at the swollen goatskins.) The men are needed on the barricades. We are needed everywhere.',
      choices: [{ text: '"Let me help."', next: 'help' }],
    },
    help: {
      speaker: 'Narrator',
      text: 'You carry flour from the hand-mill and water from the skins, and for an hour you are the least skilful person in the women\'s corner and the most gladly put to work. A boy goes by with a basket, gathering the shot from the court.',
      choices: [{ text: '(Rest a moment beside her.)', next: 'child' }],
    },
    child: {
      speaker: 'A Woman of the Quarter',
      onEnter: { set: { zjHelpedWomen: true } },
      text: '(She rests a floury hand on her belly, briefly.) This one will be born in here, God willing, under the guns. If it is a boy I will call him Ashraf, the noble. Let them hear that name from their lines.',
    },
  },
};

/** Umm-i-Ashraf in winter, with her newborn son. */
export const ummAshraf: DialogueTree = {
  id: 'zj-umm-ashraf',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Umm-i-Ashraf',
      text: 'Come and see him. (A bundle in a sheepskin; a small, furious red face.) Ashraf. Born in the fort, the night the first snow came. They call me Umm-i-Ashraf now, his mother, as if I never had another name.',
      choices: [
        { text: '"He is beautiful."', next: 'vow' },
        { text: '"You kept your word: Ashraf."', next: 'vow', requires: f => !!f.zjHelpedWomen },
      ],
    },
    vow: {
      speaker: 'Umm-i-Ashraf',
      text: 'He is God\'s before he is mine. I told Him so the night he was born, with the guns going. Whatever comes, I will not take it back.',
      choices: [{ text: '(Touch the baby\'s hand.)', next: 'later' }],
    },
    later: {
      speaker: 'Narrator',
      onEnter: { set: { zjMetAshraf: true } },
      text: 'Years later, Ashraf will stand before his judges in this same town. His mother will go to him and tell him she will disown him if he recants. He will not, and she will say she rejoices to have kept her vow.',
    },
  },
};

/** Mihr-ʿAlí in summer, gathering shot. */
export const mihrAli: DialogueTree = {
  id: 'zj-mihr-ali',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mihr-ʿAlí',
      text: 'Mind your feet! (He rolls an iron ball into his basket.) We gather them from the courts and the roofs so no one turns an ankle. My mother says I am the richest boy in Zanján: a whole basket of iron.',
      choices: [{ text: '"What will you be when you are grown?"', next: 'smith' }],
    },
    smith: {
      speaker: 'Mihr-ʿAlí',
      onEnter: { set: { zjMetMihrAli: true } },
      text: 'A smith, like my uncle. (He frowns at the basket.) I will melt these down and make ploughshares out of them. Every one.',
    },
  },
};

/** Mihr-ʿAlí back from the Amír-Tumán's camp: the truce is broken. */
export const mihrAliReturn: DialogueTree = {
  id: 'zj-mihr-ali-return',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mihr-ʿAlí',
      text: '(He is shaking, and his good coat is torn at the shoulder.) We went in, like Ḥujjat said. Darvísh-Ṣaláḥ carried the Qur\'án in front of us, up high, so they could all see it.',
      choices: [{ text: '"What did the Amír-Tumán do?"', next: 'camp' }],
    },
    camp: {
      speaker: 'Mihr-ʿAlí',
      text: 'He would not look at the Book. He flew into a rage and had Darvísh-Ṣaláḥ seized by the beard, and the old men dragged away to a dungeon. We were so frightened we ran. (He wipes his face.) Some of the boys were caught. I got away.',
      choices: [{ text: '(Put your arm round him.)', next: 'guns' }],
    },
    guns: {
      speaker: 'Narrator',
      onEnter: { set: { zjTruceBroken: true } },
      text: 'Before evening the guns begin again, and do not stop. The Qur\'án that was sealed for peace does not come back. That year the winter comes down early from the mountains.',
      choices: [{ text: '(Remember his face.)', next: 'nabil' }],
    },
    nabil: {
      speaker: 'Narrator',
      text: 'Long afterwards, a grey-bearded smith of Zanján, Ustád Mihr-ʿAlí, will tell this story to Nabíl, who will write it down. He will remember that none of the nine was older than ten.',
    },
  },
};

/** Mihr-ʿAlí in winter. */
export const mihrAliWinter: DialogueTree = {
  id: 'zj-mihr-ali-winter',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mihr-ʿAlí',
      text: 'My basket is too heavy to carry now. They fire more every day. (He blows on his fingers.) Mother says I must not go near the east barricade any more. Nobody says why.',
      choices: [
        { text: '"Will you still make ploughshares?"', next: 'plough', requires: f => !!f.zjMetMihrAli },
        { text: '"Stay near the ovens, where it is warm."', next: 'warm' },
      ],
    },
    plough: {
      speaker: 'Mihr-ʿAlí',
      text: 'Every one. (He sets his jaw like a much older man.) Even the big ones.',
    },
    warm: {
      speaker: 'Mihr-ʿAlí',
      text: 'The ovens are cold too, mostly. There is not much flour. (He shrugs.) But I will.',
    },
  },
};

export const zanjanCourtDialogues: Record<string, DialogueTree> = {
  [muhsin.id]: muhsin,
  [muhsinPlace.id]: muhsinPlace,
  [womanOvens.id]: womanOvens,
  [ummAshraf.id]: ummAshraf,
  [mihrAli.id]: mihrAli,
  [mihrAliReturn.id]: mihrAliReturn,
  [mihrAliWinter.id]: mihrAliWinter,
};
