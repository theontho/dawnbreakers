import { mountSkyRewindApp } from './app';

const host = document.getElementById('sky-rewind');
if (!host) throw new Error('Missing sky-rewind host element.');

await mountSkyRewindApp(host);
