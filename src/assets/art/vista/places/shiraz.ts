import { paintDawnCity } from '../../dawnCity';
import { dawnLayout } from '../../dawnLayout';
import type { Vista } from '../types';

/** Shíráz from outside its walls, the tiled shrine dome against the sunrise (see `dawnCity`). */
export const SHIRAZ: Vista = {
  id: 'shiraz',
  latitude: 29.61,
  longitude: 52.54,
  reach: 150,
  paint: (ctx, mode, frame) => paintDawnCity(ctx, mode, dawnLayout(frame)),
};
