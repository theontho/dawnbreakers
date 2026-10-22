import type { DialogueTree } from '../../dialogue/types';

/**
 * Chapter 4, the lane of the uncle's house. After the Vakíl Mosque the Báb
 * is confined to His uncle's house. Vaḥíd comes to investigate for the
 * Sháh and is himself won. The chapter closes at the shut door, through
 * the cholera summer of 1846, toward Iṣfahán.
 */

/** Mubárak, the household servant from the first chapter. */
export const ch4Mubarak: DialogueTree = {
  id: 'ch4-mubarak',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mubárak, the Household Servant',
      text: 'Peace, traveller. This is the house of Ḥájí Mírzá Siyyid ʿAlí. I came up from Búshihr with my Master, and here I wait, as I always wait: at a door.',
      choices: [
        { text: '"Do you remember me? I kept vigil on your Master\'s step."', next: 'remember',
          requires: f => f.vigilKept === true },
        { text: '"How is He?"', next: 'how', requires: f => !!f.vakilAddressHeard },
        { text: '"Where is your Master now?"', next: 'where', requires: f => !f.vakilAddressHeard },
        { text: '"Tell me of Búshihr."', next: 'bushihr' },
      ],
    },
    remember: {
      speaker: 'Mubárak, the Household Servant',
      onEnter: { set: { mubarakMet: true } },
      text: '(His face opens.) The one who sat all night beneath the window and asked for nothing! I trimmed that lamp. In the morning I told the Master that a stranger had kept watch with it. He answered only that such a watcher was no stranger to that house.',
    },
    where: {
      speaker: 'Mubárak, the Household Servant',
      onEnter: { set: { mubarakMet: true } },
      text: 'They have taken Him to the Vakíl Mosque, east along the street, to speak before the congregation. I was not allowed to follow. Go, if you can. Come back and tell me how He looked.',
    },
    how: {
      speaker: 'Mubárak, the Household Servant',
      onEnter: { set: { mubarakMet: true } },
      text: 'The same as always. He rises before dawn. He writes. He asks after the family of the man posted to watch Him. It is the rest of us who have changed. I hear His voice through the wall at night and I sleep like a child.',
    },
    bushihr: {
      speaker: 'Mubárak, the Household Servant',
      onEnter: { set: { mubarakMet: true } },
      text: 'Heat, and the smell of the sea, and trade in indigo. He worked as a merchant there, honestly, and the merchants still speak of His honesty. When the horsemen came, He did not wait to be found. He went out to meet them.',
    },
  },
};

/** Siyyid Yaḥyá of Dáráb, the Sháh's investigator, called Vaḥíd. */
export const ch4Vahid: DialogueTree = {
  id: 'ch4-vahid',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Vaḥíd',
      text: '(A man in the fine cloak of a court divine watches the uncle\'s door as one rereads a page.) You are watching the door too. Good. I have been watching it for days.',
      choices: [{ text: '"Who are you?"', next: 'who' }],
    },
    who: {
      speaker: 'Vaḥíd',
      text: 'Siyyid Yaḥyá of Dáráb. Muḥammad Sháh sent me to examine this claim. He trusts my learning, and so did I. I have thirty thousand traditions by heart. I came to question a merchant\'s son, write my report, and go home.',
      choices: [{ text: '"And did you question Him?"', next: 'first' }],
    },
    first: {
      speaker: 'Vaḥíd',
      text: 'At our first meeting I put to Him the hardest points of the Qur\'án and the traditions. He answered as a master answers a pupil, briefly and kindly. I went away humbled and blamed the heat. At the second meeting I found I had forgotten my questions.',
      choices: [{ text: '"And the third?"', next: 'third' }],
    },
    third: {
      speaker: 'Vaḥíd',
      text: 'Before the third, I resolved in my heart: if He reveals, unasked, a commentary on the Súrih of Kawthar, I will know. I told no one. When I came in, He turned to me and began.',
      choices: [
        { text: '"Mullá Ḥusayn told me the same, of the Súrih of Joseph."', next: 'joseph',
          requires: f => f.heardTestimony === true },
        { text: '(Wait for him to go on.)', next: 'kawthar' },
      ],
    },
    joseph: {
      speaker: 'Vaḥíd',
      text: 'Did he? (He is silent a long while.) Then the same door has been opened twice by the same unspoken question. I thought myself the first to be answered so. I find I am glad to be the second.',
      choices: [{ text: '"What did He write for you?"', next: 'kawthar' }],
    },
    kawthar: {
      speaker: 'Vaḥíd',
      text: 'Verses, faster than the scribe could set them down. I sat until I could not sit. I wept until I was ashamed, and then I was not ashamed. I have written to the Sháh\'s minister and told him what I found.',
      choices: [
        { text: '"What will the court say?"', next: 'court' },
        { text: '"What will you do now?"', next: 'you' },
      ],
    },
    court: {
      speaker: 'Vaḥíd',
      text: 'Ḥájí Mírzá Áqásí will be displeased. Let him be. I was sent to bring back the truth, and I am bringing it. Only it is not the kind of truth he ordered.',
      choices: [{ text: '(Wait.)', next: 'title' }],
    },
    you: {
      speaker: 'Vaḥíd',
      text: 'Ride out, and say what I have seen. Yazd, Nayríz, wherever there are ears. My learning was a lamp I carried about in daylight for forty years. I may set it down now.',
      choices: [{ text: '(Wait.)', next: 'title' }],
    },
    title: {
      speaker: 'Vaḥíd',
      onEnter: { set: { vahidTestimony: true } },
      text: 'He has given me a name: Vaḥíd, the Peerless. Princes have called me many flattering things. None of them frightened me as this does. Go and stand at the door, if you like. The guards let a man stand there. They cannot stop him listening.',
    },
  },
};

/** The uncle at home, once his nephew is returned to his keeping. */
export const ch4KhalHome: DialogueTree = {
  id: 'ch4-khal-home',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Ḥájí Mírzá Siyyid ʿAlí',
      text: 'You were in the mosque? Then you saw more than I could bear to. He is home. The man at the corner counts the visitors. I count the hours.',
      choices: [
        { text: '"How does the household bear it?"', next: 'household' },
        { text: '"Is there anything I can do?"', next: 'do' },
      ],
    },
    household: {
      speaker: 'Ḥájí Mírzá Siyyid ʿAlí',
      text: 'His mother prays and says little. His wife, Khadíjih-Bagum, keeps the house as though nothing has changed, which is the bravest thing I have ever watched. The friends come at night, one at a time, and leave before the call to prayer.',
      choices: [{ text: '"And you?"', next: 'you' }],
    },
    do: {
      speaker: 'Ḥájí Mírzá Siyyid ʿAlí',
      text: 'Stand where you can be seen standing. A city that sees one honest face at a door is a little less sure of its own story. And speak with the learned man by the lamp. The Sháh sent him, and something has happened to him here.',
      choices: [{ text: '"And you?"', next: 'you' }],
    },
    you: {
      speaker: 'Ḥájí Mírzá Siyyid ʿAlí',
      onEnter: { set: { khalHome: true } },
      text: 'I raised Him after His father died. I taught Him to keep accounts, and He kept them better than I did. Now I find I am the one being taught. It is a strange thing, at my age, to become a pupil in your own house.',
    },
  },
};

/** Before the city has spoken, the uncle's door is only a door. */
export const ch4UncleDoorLocked: DialogueTree = {
  id: 'ch4-uncle-door-locked',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The door of the uncle\'s house is shut and barred from within. Whatever this house is to hold has not yet begun, or is not yet yours to keep watch over. Listen first to the city: the Vakíl Mosque to the east, and whoever waits in this lane.',
    },
  },
};

/** The confinement, the cholera summer, and the departure for Iṣfahán. */
export const ch4UncleDoor: DialogueTree = {
  id: 'ch4-uncle-door',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'You stand at the uncle\'s door. Within, the Báb lives as a prisoner in His own family\'s house. Friends come by night and are turned away by day. Through the shutters, now and then, you hear a voice chanting, and the whisper of a pen.',
      choices: [{ text: '(Keep watch, as you have learned to.)', next: 'months' }],
    },
    months: {
      speaker: 'Narrator',
      text: 'Spring turns to summer. Vaḥíd rides away to tell what he has seen. Then, in the late summer of 1846, cholera comes to Shíráz. Shops close. Carts move at night. The city\'s fear, which once had a face, becomes a fever without one.',
      choices: [{ text: '(Stay.)', next: 'raid' }],
    },
    raid: {
      speaker: 'Narrator',
      text: 'One night the chief constable, ʿAbdu\'l-Ḥamíd Khán, comes over the wall with his men and seizes the prisoner. But the governor has fled the plague, and in the constable\'s own house his son lies stricken. He returns to his Captive in tears, begging Him to pray for the boy.',
      choices: [{ text: '(Hold your breath.)', next: 'release' }],
    },
    release: {
      speaker: 'Narrator',
      text: 'Nabíl records that the boy recovered. The constable would hold such a prisoner no longer, and the governor, fearing the sickness more than the Siyyid, let Him go, on condition that He leave Shíráz. Before dawn He sets out north, toward Iṣfahán. He will not see His city again.',
      choices: [
        { text: '"Quddús said compassion is a cloak. I will wear it on the road."', next: 'end',
          requires: f => f.ch4Response === 'compassion' },
        { text: '"I have held my tongue a long year. Now let my feet speak."', next: 'end',
          requires: f => f.ch4Response === 'restraint' },
        { text: '"My anger has had a year to cool. What is left is resolve."', next: 'end',
          requires: f => f.ch4Response === 'anger' },
        { text: '"I will follow Him to Iṣfahán."', next: 'end' },
      ],
    },
    end: {
      speaker: 'Narrator',
      onEnter: { set: { houseArrestComplete: true } },
      text: 'You take the northern road a day behind Him, and then two. Behind you, Shíráz shuts its gates against the plague. Ahead, beyond the mountains, lies Iṣfahán, called half the world, where a governor waits to learn what kind of prisoner is coming.',
    },
  },
};
