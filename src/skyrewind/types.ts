export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Star {
  id: number;
  name: string;
  ra: number;
  dec: number;
  pmRa: number;
  pmDec: number;
  parallax: number;
  magnitude: number;
  colorIndex?: number;
}

export interface GeographicLocation {
  name: string;
  latitude: number;
  longitude: number;
}

export interface SkyMoment {
  caption: string;
  date: Date;
  location: GeographicLocation;
}

export interface StarCatalogSource {
  id: string;
  name: string;
  url: string;
}
