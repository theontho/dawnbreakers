import type { DialogueTree } from '../../dialogue/types';

/**
 * The forest beyond Bárfurúsh (Nabíl, EN ch. XIX). Khusraw of Qádí-Kalá
 * takes the companions off the open road into the woods, and long past
 * noon his horsemen fall on them. Mullá Ḥusayn gets down to pray and does
 * not answer the demand for his sword and horse; Mírzá Muḥammad-Taqíy-i-
 * Juvayní carries Khusraw his water-pipe and strikes him with his own
 * dagger. The attendant who lit the pipe is spared and sent back with it.
 * The night by the fire, and at dawn "our Karbilá" and the last maydán to
 * the shrine of Shaykh Ṭabarsí, which completes the chapter.
 */

/** Mullá Ḥusayn on the road out of Bárfurúsh. */
export const mullaHusaynRide: DialogueTree = {
  id: 'bf-mh-ride',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá Ḥusayn',
      text: '(He rides with his eyes on the horsemen ahead.) They swore on the Book. I have taken their oath as it was given. What is in their hearts God sees, and before long, so shall we.',
    },
  },
};

/** Khusraw at the edge of the wood; the turn, and the ambush. */
export const khusrawForest: DialogueTree = {
  id: 'bf-khusraw-forest',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Khusraw of Qádí-Kalá',
      text: '(He waits at the edge of the trees, his horse blowing.) The open road goes the long way round by the fields. This way is shorter, through the woods. Trust Khusraw; I was born under these trees.',
      choices: [
        { text: '"Mullá Ḥusayn meant to be at Shír-Gáh by noon."', next: 'noon' },
        { text: '(Say nothing, and follow him.)', next: 'into' },
      ],
    },
    noon: {
      speaker: 'Khusraw of Qádí-Kalá',
      text: 'And so he shall, God willing, God willing. (He turns his horse in under the trees.) Come, come.',
      choices: [{ text: '(Follow.)', next: 'into' }],
    },
    into: {
      speaker: 'Narrator',
      text: 'The trees close over the track. It is past noon, and then long past noon, and Shír-Gáh does not come. The horsemen of the escort are no longer riding ahead of you but among you, alongside the horses.',
      choices: [{ text: '(Keep close to Riḍá.)', next: 'ambush' }],
    },
    ambush: {
      speaker: 'Narrator',
      text: 'Then it happens all at once. The escort fall on the companions, dragging at bridles and sword-belts and saddlecloths. Those who hold on are cut down on the track; among them is the brother of Mullá Ṣádiq. Others are pulled from the saddle and bound.',
      choices: [{ text: '(Look for Mullá Ḥusayn.)', next: 'halt' }],
    },
    halt: {
      speaker: 'Narrator',
      onEnter: { set: { bfAmbush: true } },
      text: 'He has ridden on into a clearing and got down from his horse. Midday is long past, he says, and he will go no further with this man. He calls Qambar-ʿAlí, his servant, to spread his prayer-mat.',
    },
  },
};

/** Mullá Ḥusayn on his prayer-mat, and the demand. */
export const mullaHusaynHalt: DialogueTree = {
  id: 'bf-mh-halt',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'He has made his ablutions from a water-skin and stands on the mat facing the qiblih. Khusraw\'s attendant, a boy in a leather apron, comes across the clearing and stops a little way off.',
      choices: [{ text: '(Stand behind Mullá Ḥusayn.)', next: 'demand' }],
    },
    demand: {
      speaker: 'Khusraw\'s Attendant',
      text: '(Loudly, so that the horsemen behind him hear.) My master says: give him your sword and your horse, and the rest of you may go on your way in safety.',
      choices: [{ text: '(Wait for the answer.)', next: 'silence' }],
    },
    silence: {
      speaker: 'Narrator',
      onEnter: { set: { bfSawPrayer: true } },
      text: 'Mullá Ḥusayn does not turn his head. He lifts his hands and begins to pray. The boy waits, shifts from foot to foot, and goes back to Khusraw, who sits down on a fallen log and calls for his water-pipe. Mírzá Muḥammad-Taqí of Juvayn is watching him from the edge of the clearing.',
    },
  },
};

export const mullaHusaynPraying: DialogueTree = {
  id: 'bf-mh-praying',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'He is still at prayer, bowing and rising, as if there were no one in the forest but himself and God.',
    },
  },
};

/** Khusraw on his log, waiting. */
export const khusrawWaiting: DialogueTree = {
  id: 'bf-khusraw-waiting',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Khusraw of Qádí-Kalá',
      text: '(He sits on the log with his legs stretched out, as if in his own garden.) Tell your scholar he may pray as long as he likes. The sword and the horse will still be here when he has finished. So will I.',
    },
  },
};

/** Mírzá Muḥammad-Taqíy-i-Juvayní, before Mullá Ḥusayn has been answered. */
export const juvayniEarly: DialogueTree = {
  id: 'bf-juvayni-early',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mírzá Muḥammad-Taqí',
      text: '(A companion from Sabzivár, his eyes on Khusraw.) Keep back from the horsemen, friend. Not now. Wait.',
    },
  },
};

/** The water-pipe, and Khusraw's end. */
export const juvayni: DialogueTree = {
  id: 'bf-juvayni',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mírzá Muḥammad-Taqí',
      text: '(He has been watching the attendant kneel to light Khusraw\'s water-pipe.) He calls for his qalyán while the man he has robbed is at prayer. I will carry it to him.',
      choices: [
        { text: '"Why you?"', next: 'why' },
        { text: '(Watch him go.)', next: 'go' },
      ],
    },
    why: {
      speaker: 'Mírzá Muḥammad-Taqí',
      text: 'Someone must serve the guest. (He does not smile.) Stay here by the fallen.',
      choices: [{ text: '(Watch him go.)', next: 'go' }],
    },
    go: {
      speaker: 'Narrator',
      text: 'He walks across the clearing and takes the qalyán from the kneeling boy with a little bow, as a servant would. Khusraw holds out his hand for it without looking up.',
      choices: [{ text: '(Watch.)', next: 'strike' }],
    },
    strike: {
      speaker: 'Narrator',
      text: 'Then Mírzá Muḥammad-Taqí\'s hand is inside Khusraw\'s robe, and out again with Khusraw\'s own dagger, and Khusraw is down in the leaves.',
      choices: [{ text: '(Get down.)', next: 'rout' }],
    },
    rout: {
      speaker: 'Narrator',
      onEnter: { set: { bfKhusrawDead: true } },
      text: 'After that the forest is shouting and hooves. The companions who were bound an hour ago are loose, and the escort is broken. You see little of it, crouched beside the fallen with your arms over your head; when you look up the horsemen are gone, and the light is going.',
    },
  },
};

/** The attendant, before Khusraw dies. */
export const attendantKindling: DialogueTree = {
  id: 'bf-attendant-kindling',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Khusraw\'s Attendant',
      text: '(He is blowing on the coals for the water-pipe and will not look up.) I only light his pipe. I only light his pipe.',
    },
  },
};

/** The attendant spared, and sent back with the qalyán. */
export const attendantSpared: DialogueTree = {
  id: 'bf-attendant-spared',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Khusraw\'s Attendant',
      text: '(He is still holding the qalyán, jewelled and smoking, as if he does not know how to put it down.) They are gone, all of them. Everyone but me. Why not me?',
      choices: [{ text: '(Stay with him.)', next: 'mh' }],
    },
    mh: {
      speaker: 'Narrator',
      text: 'Mullá Ḥusayn comes across the clearing. The boy flinches. Mullá Ḥusayn only closes his own hands round the boy\'s hands on the qalyán, so that he holds it fast.',
      choices: [{ text: '(Listen.)', next: 'message' }],
    },
    message: {
      speaker: 'Mullá Ḥusayn',
      text: 'Take this to ʿAbbás-Qulí Khán, and tell him how Khusraw carried out the charge he was given. Khusraw thought his work with us was finished. Tell the Khán it has only just begun.',
      choices: [{ text: '(Watch the boy go.)', next: 'gone' }],
    },
    gone: {
      speaker: 'Narrator',
      onEnter: { set: { bfAttendantSent: true } },
      text: 'The boy runs, the qalyán held against his chest, back down the track toward Bárfurúsh. Then it is dark under the trees, except for the fire.',
    },
  },
};

/** The fallen of the forest. */
export const fallenForest: DialogueTree = {
  id: 'bf-fallen-forest',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Those the escort killed are laid in a row under the trees with their cloaks over them. One of them is the brother of Mullá Ṣádiq. The others you knew by their faces on the road, and not by their names.',
      choices: [{ text: '(Kneel by them.)', next: 'kneel' }],
    },
    kneel: {
      speaker: 'Narrator',
      onEnter: { set: { bfMournedForest: true } },
      text: 'Three in the caravanserai, and the siyyid of Yazd on the road, and now these. You have stopped counting on your fingers. You find you are counting anyway.',
    },
  },
};

/** Mullá Ḥusayn in the night. */
export const mullaHusaynNight: DialogueTree = {
  id: 'bf-mh-night',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Mullá Ḥusayn sits on his prayer-mat at the edge of the firelight with his sword across his knees, awake. He nods to you, and says nothing, and you leave him to it.',
    },
  },
};

/** Riḍá at the fire, before the boy has gone. */
export const ridaFireEarly: DialogueTree = {
  id: 'bf-rida-fire-early',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Young Companion',
      text: '(He is feeding the fire with shaking hands.) Not yet. Mullá Ḥusayn is still over there with that boy. Sit when he sits.',
    },
  },
};

/** The night by the fire: what was said in Bárfurúsh at midnight, and sleep. */
export const ridaFire: DialogueTree = {
  id: 'bf-rida-fire',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Young Companion',
      text: 'Sit. There is no bread to break, but there is a fire.',
      choices: [
        { text: '"You still have your mother\'s bread."', next: 'bread', requires: f => !!f.bfRidaShaken },
        { text: '(Sit with him.)', next: 'told' },
      ],
    },
    bread: {
      speaker: 'A Young Companion',
      text: 'For someone who needs it more. (He pats the sash.) Not you; you are too stubborn to starve. Some day I will know who it is for.',
      choices: [{ text: '(Sit with him.)', next: 'told' }],
    },
    told: {
      speaker: 'Narrator',
      onEnter: { set: { bfHeardMidnight: true } },
      text: 'Round the fire the companions are saying what will be told for years: that at midnight in Bárfurúsh the Saʿídu\'l-ʿUlamá sent for Khusraw, and bade him take all you had and kill you all, wherever he chose. That Khusraw asked: are these not Muslims, who let three men die rather than leave the call to prayer unfinished? And that the mujtahid laid his hand on his own neck, and said he would answer for it before God.',
      choices: [{ text: '(Look at the fire.)', next: 'sleep' }],
    },
    sleep: {
      speaker: 'A Young Companion',
      text: '(He lies down by the fire with his sash under his head.) Wake me when it is light. I want to see where we are going.',
      choices: [{ text: '(Lie down too.)', next: 'dark', effect: { set: { bfSlept: true } } }],
    },
    dark: {
      speaker: 'Narrator',
      text: 'You sleep on the floor of the forest among the living and the dead, and you do not dream.',
    },
  },
};

/** Dawn: our Karbilá, and the last maydán to the shrine. */
export const mullaHusaynKarbila: DialogueTree = {
  id: 'bf-mh-karbila',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Grey light between the trunks. The companions have said the dawn prayer. Mullá Ḥusayn stands among them, and his voice carries without his raising it.',
      choices: [{ text: '(Listen.)', next: 'karbila' }],
    },
    karbila: {
      speaker: 'Mullá Ḥusayn',
      text: 'We are drawing near to our Karbilá, the end of our journey. Leave here everything you took back from these men. Keep your swords and your horses, and nothing more.',
      choices: [{ text: '(Leave it.)', next: 'leave' }],
    },
    leave: {
      speaker: 'Narrator',
      text: 'The saddles and the rugs and the copper pans stay where they lie under the trees, the second heap you have left on this road. You walk a maydán through the woods behind the Standard.',
      choices: [{ text: '(Walk.)', next: 'shrine' }],
    },
    shrine: {
      speaker: 'Narrator',
      text: 'The trees open on a clearing and a small tomb under a plain dome: the shrine of Shaykh Ṭabarsí. Mullá Ḥusayn gets down at its door. You are near enough to hear him: O my Lord, bless Thou my arrival at this place, for Thou art the best of those who give a lodging.',
      choices: [{ text: '(Stand with the companions.)', next: 'end' }],
    },
    end: {
      speaker: 'Narrator',
      onEnter: { set: { barfurushComplete: true } },
      text: 'An old man with a broom stands in the shrine\'s doorway, staring at the black banner among the trees as though he has seen it somewhere before.',
    },
  },
};

export const barfurushForestDialogues: Record<string, DialogueTree> = {
  [mullaHusaynRide.id]: mullaHusaynRide,
  [khusrawForest.id]: khusrawForest,
  [mullaHusaynHalt.id]: mullaHusaynHalt,
  [mullaHusaynPraying.id]: mullaHusaynPraying,
  [khusrawWaiting.id]: khusrawWaiting,
  [juvayniEarly.id]: juvayniEarly,
  [juvayni.id]: juvayni,
  [attendantKindling.id]: attendantKindling,
  [attendantSpared.id]: attendantSpared,
  [fallenForest.id]: fallenForest,
  [mullaHusaynNight.id]: mullaHusaynNight,
  [ridaFireEarly.id]: ridaFireEarly,
  [ridaFire.id]: ridaFire,
  [mullaHusaynKarbila.id]: mullaHusaynKarbila,
};
