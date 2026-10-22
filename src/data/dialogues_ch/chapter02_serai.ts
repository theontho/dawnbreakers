import type { DialogueTree } from '../../dialogue/types';

/**
 * Chapter 2: inside the caravanserai court beyond the Qur'án Gate, at dawn,
 * as the Letters of the Living leave by every road. The people here only
 * glimpsed them: a merchant who shared a room, a cameleer at the fire, and a
 * room swept clean by a guest already gone.
 */

/** A cloth merchant packing for home, who shared a room with a young man from Qazvín. */
export const seraiMerchant: DialogueTree = {
  id: 'ch2-serai-merchant',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Cloth Merchant from Káshán',
      text: '(He is counting bolts of velvet into a saddlebag, lips moving.) Forty-one, forty-two. Peace be with you. Do not stand on the green one; it is worth more than your shoes.',
      choices: [
        { text: '"You are setting out too?"', next: 'leaving' },
        { text: '"Has it been a good season?"', next: 'season' },
      ],
    },
    leaving: {
      speaker: 'A Cloth Merchant from Káshán',
      text: 'Home to Káshán, God willing, before the heat closes the road. But I will be a week telling my wife about my neighbour in this place. A young man from Qazvín.',
      choices: [{ text: '"Tell me about him."', next: 'qazvin' }],
    },
    season: {
      speaker: 'A Cloth Merchant from Káshán',
      text: 'For velvet? Middling. For strange guests? Remarkable. I shared a room this month with a young man from Qazvín who never sold a thing, never bought a thing, and wrote letters until the lamp gave up.',
      choices: [{ text: '"Tell me about him."', next: 'qazvin' }],
    },
    qazvin: {
      speaker: 'A Cloth Merchant from Káshán',
      text: 'He came carrying a sealed letter from a kinswoman, a woman of great learning in Qazvín who has never set foot in Shíráz. He would not say what was in it. Only that it had been received, and that she is counted among the first, though she never left her own house.',
      choices: [{ text: '"Counted among the first?"', next: 'first' }],
    },
    first: {
      speaker: 'A Cloth Merchant from Káshán',
      onEnter: { set: { ch2SeraiMerchant: true } },
      text: 'That is what he said, and then he would say no more, which in a merchant would be bad for business. He left yesterday on the Qazvín road. Thirty years I have carried silk across Persia, friend, and I never saw a man walk so light without a load.',
      choices: [
        { text: '"God-speed to Káshán."' },
        { text: '"Perhaps his load was not one you could see."' },
      ],
    },
  },
};

/** An old cameleer brewing tea at the court fire. */
export const seraiCameleer: DialogueTree = {
  id: 'ch2-serai-cameleer',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'An Old Cameleer',
      text: '(He is feeding thorn twigs to the fire under a blackened kettle.) Sit. The tea is nearly bad enough to drink. You have the look of the men who left before dawn.',
      choices: [
        { text: '"Which men?"', next: 'men' },
        { text: '"I will take the tea, gladly."', next: 'tea' },
      ],
    },
    tea: {
      speaker: 'An Old Cameleer',
      text: '(He pours it from a height, so that it foams.) Forty years I have led camels between Shíráz and Yazd. Tea and stars: that is all the learning I have. But I know a hurry when I see one.',
      choices: [{ text: '"Who was in a hurry?"', next: 'men' }],
    },
    men: {
      speaker: 'An Old Cameleer',
      text: 'Three went out by the north road, two toward Yazd. One set off on foot for Khurásán with a staff and a water skin, and he was singing. (He sips.) A man does not sing walking into Khurásán. It is too far.',
      choices: [
        { text: '"Perhaps he carried good news."', next: 'news' },
        { text: '"Did they say why they were going?"', next: 'why' },
      ],
    },
    news: {
      speaker: 'An Old Cameleer',
      text: 'Good news is heavy, friend, heavier than salt. I have seen men run with bad news and walk with good, because good news must be set down carefully, in the right house, or it breaks.',
      choices: [{ text: '(Drink your tea.)', next: 'end' }],
    },
    why: {
      speaker: 'An Old Cameleer',
      text: 'They said very little. They paid for their fodder twice, by mistake, and would not take the change. (He laughs into his beard.) I have prayed for more such guests all my life.',
      choices: [{ text: '(Drink your tea.)', next: 'end' }],
    },
    end: {
      speaker: 'An Old Cameleer',
      onEnter: { set: { ch2CameleerTea: true } },
      text: 'When your own road comes, go before dawn as they did, and walk while the stars are out. By noon this country will cook anyone fool enough to be on it.',
      choices: [{ text: '"Thank you, father."' }],
    },
  },
};

/** The threshold of a room whose guest has already gone. */
export const sweptRoom: DialogueTree = {
  id: 'ch2-swept-room',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The room behind this arch is empty. Its last guest swept it before dawn, rolled the reed mat, leaned the broom by the door, and filled the clay lamp with oil for whoever comes next.',
      choices: [
        { text: '(Look inside.)', next: 'inside' },
        { text: '(Leave it as he left it.)', next: 'leave' },
      ],
    },
    inside: {
      speaker: 'Narrator',
      onEnter: { set: { ch2SweptRoom: true } },
      text: 'Bare plaster, a niche for a lamp, a nail for a cloak. On the wall, at the height of a seated man\'s eyes, a few words were written in charcoal and then carefully rubbed out. Only the first can still be read: Rejoice.',
    },
    leave: {
      speaker: 'Narrator',
      onEnter: { set: { ch2SweptRoom: true } },
      text: 'You leave it as he left it. Of all the farewells this morning, this one asks nothing of you but that.',
    },
  },
};

export const chapter02SeraiDialogues: Record<string, DialogueTree> = {
  [seraiMerchant.id]: seraiMerchant,
  [seraiCameleer.id]: seraiCameleer,
  [sweptRoom.id]: sweptRoom,
};
