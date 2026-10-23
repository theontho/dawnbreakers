import * as THREE from 'three';
import { clamp } from './math';
import { computeProjectionState, projectStar, type ProjectionState } from './projection';
import type { GeographicLocation, Star, Vec3 } from './types';

const SKY_RADIUS = 140;
const MAX_STAR_COUNT = 120000;
const MOVING_SKY_UPDATE_INTERVAL_MS = 80;
const SETTLED_SKY_UPDATE_INTERVAL_MS = 160;
const HALF_PI = Math.PI / 2;

export interface SkyRenderState {
  date: Date;
  location: GeographicLocation;
  cinematicStrength: number;
  nowMs?: number;
}

export class SkyRewindRenderer {
  readonly canvas: HTMLCanvasElement;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(62, 1, 0.1, 500);
  private readonly starGeometry = new THREE.BufferGeometry();
  private readonly starUniforms = {
    uYearsSinceCatalog: { value: 0 },
    uZeta: { value: 0 },
    uZ: { value: 0 },
    uCosTheta: { value: 1 },
    uSinTheta: { value: 0 },
    uLocalSiderealTime: { value: 0 },
    uSinLat: { value: 0 },
    uCosLat: { value: 1 },
    uSkyRadius: { value: SKY_RADIUS },
    uMaxVisibleMagnitude: { value: 12.5 },
    uCinematicStrength: { value: 0 },
  };
  private readonly trailGeometry = new THREE.BufferGeometry();
  private readonly trailPositions = new Float32Array(MAX_STAR_COUNT * 6);
  private readonly trailPositionAttribute = new THREE.BufferAttribute(this.trailPositions, 3);
  private readonly trailMaterial = new THREE.LineBasicMaterial({
    color: 0x83d6ff,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  private readonly catalog: readonly Star[];
  private readonly onResize = (): void => this.resize();
  private readonly onPointerDown = (event: PointerEvent): void => this.startDrag(event);
  private readonly onPointerMove = (event: PointerEvent): void => this.drag(event);
  private readonly onPointerUp = (): void => this.stopDrag();
  private readonly onWheel = (event: WheelEvent): void => this.zoom(event);
  private previousTrailPositions = new Map<number, Vec3>();
  private disposed = false;
  private dragging = false;
  private pointerX = 0;
  private pointerY = 0;
  private yaw = 0;
  private pitch = 0.35;
  private skyDirty = true;
  private lastSkyUpdateAtMs = Number.NEGATIVE_INFINITY;
  private lastDateMs = Number.NaN;
  private lastLatitude = Number.NaN;
  private lastLongitude = Number.NaN;
  private lastCinematicStrength = Number.NaN;

  constructor(canvas: HTMLCanvasElement, catalog: readonly Star[]) {
    this.canvas = canvas;
    this.catalog = catalog;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    this.camera.position.set(0, 0, 0);

    this.addSkyDome();
    this.addHorizon();
    this.addStars();
    this.addTrails();
    this.addLowerSkyVeil();
    this.updateCamera();
    this.resize();

    window.addEventListener('resize', this.onResize);
    canvas.addEventListener('pointerdown', this.onPointerDown);
    canvas.addEventListener('pointermove', this.onPointerMove);
    canvas.addEventListener('pointerup', this.onPointerUp);
    canvas.addEventListener('pointercancel', this.onPointerUp);
    canvas.addEventListener('wheel', this.onWheel, { passive: false });
  }

  render(state: SkyRenderState): void {
    if (this.disposed) return;

    const maxVisibleMagnitude = maxMagnitudeForSpeed(state.cinematicStrength);
    const nowMs = state.nowMs ?? performance.now();
    const projection = computeProjectionState(state.date, state.location);
    this.updateStarUniforms(projection, maxVisibleMagnitude, state.cinematicStrength);
    const shouldUpdateTrails = this.shouldUpdateTrails(state, nowMs);

    if (shouldUpdateTrails) {
      this.updateTrailBuffers(state, projection);
      this.lastSkyUpdateAtMs = performance.now();
      this.lastDateMs = state.date.getTime();
      this.lastLatitude = state.location.latitude;
      this.lastLongitude = state.location.longitude;
      this.lastCinematicStrength = state.cinematicStrength;
      this.skyDirty = false;
    }

    this.renderer.render(this.scene, this.camera);
  }

  invalidate(): void {
    this.skyDirty = true;
  }

  dispose(): void {
    this.disposed = true;
    window.removeEventListener('resize', this.onResize);
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('pointerup', this.onPointerUp);
    this.canvas.removeEventListener('pointercancel', this.onPointerUp);
    this.canvas.removeEventListener('wheel', this.onWheel);
    this.renderer.dispose();
  }

  private shouldUpdateTrails(state: SkyRenderState, nowMs: number): boolean {
    if (this.skyDirty) return true;
    if (state.location.latitude !== this.lastLatitude || state.location.longitude !== this.lastLongitude) return true;

    const interval = state.cinematicStrength > 0.04
      ? MOVING_SKY_UPDATE_INTERVAL_MS
      : SETTLED_SKY_UPDATE_INTERVAL_MS;
    if (nowMs - this.lastSkyUpdateAtMs < interval) return false;

    const dateChanged = state.date.getTime() !== this.lastDateMs;
    const visualChanged = Math.abs(state.cinematicStrength - this.lastCinematicStrength) > 0.025;
    return dateChanged || visualChanged;
  }

  private updateStarUniforms(
    projection: ProjectionState,
    maxVisibleMagnitude: number,
    cinematicStrength: number,
  ): void {
    this.starUniforms.uYearsSinceCatalog.value = projection.yearsSinceCatalog;
    this.starUniforms.uZeta.value = projection.zeta;
    this.starUniforms.uZ.value = projection.z;
    this.starUniforms.uCosTheta.value = projection.cosTheta;
    this.starUniforms.uSinTheta.value = projection.sinTheta;
    this.starUniforms.uLocalSiderealTime.value = projection.localSiderealTime;
    this.starUniforms.uSinLat.value = projection.sinLat;
    this.starUniforms.uCosLat.value = projection.cosLat;
    this.starUniforms.uMaxVisibleMagnitude.value = maxVisibleMagnitude;
    this.starUniforms.uCinematicStrength.value = cinematicStrength;
  }

  private updateTrailBuffers(state: SkyRenderState, projection: ProjectionState): void {
    const trailStrength = clamp((state.cinematicStrength - 0.18) / 0.72, 0, 1);
    const maxTrailMagnitude = 3.1 - trailStrength * 0.75;
    const nextTrailPositions = new Map<number, Vec3>();
    let trailCount = 0;

    for (const star of this.catalog) {
      if (star.magnitude > 3.2) continue;

      const direction = projectStar(star, projection);
      const position = { x: direction.x * SKY_RADIUS, y: direction.y * SKY_RADIUS, z: direction.z * SKY_RADIUS };
      const previous = this.previousTrailPositions.get(star.id);
      nextTrailPositions.set(star.id, position);
      if (previous && trailStrength > 0 && star.magnitude <= maxTrailMagnitude) {
        const trailOffset = trailCount * 6;
        const lengthMultiplier = 2.5 + trailStrength * 7;
        this.trailPositions[trailOffset] = position.x + (previous.x - position.x) * lengthMultiplier;
        this.trailPositions[trailOffset + 1] = position.y + (previous.y - position.y) * lengthMultiplier;
        this.trailPositions[trailOffset + 2] = position.z + (previous.z - position.z) * lengthMultiplier;
        this.trailPositions[trailOffset + 3] = position.x;
        this.trailPositions[trailOffset + 4] = position.y;
        this.trailPositions[trailOffset + 5] = position.z;
        trailCount += 1;
      }
    }

    this.previousTrailPositions = nextTrailPositions;
    this.trailGeometry.setDrawRange(0, trailCount * 2);
    this.trailMaterial.opacity = trailStrength === 0 ? 0 : 0.045 + trailStrength * 0.105;
    this.trailPositionAttribute.needsUpdate = true;
  }

  private resize(): void {
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / Math.max(1, height);
    this.camera.updateProjectionMatrix();
  }

  private startDrag(event: PointerEvent): void {
    this.dragging = true;
    this.pointerX = event.clientX;
    this.pointerY = event.clientY;
    this.canvas.setPointerCapture(event.pointerId);
  }

  private drag(event: PointerEvent): void {
    if (!this.dragging) return;
    const dx = event.clientX - this.pointerX;
    const dy = event.clientY - this.pointerY;
    this.pointerX = event.clientX;
    this.pointerY = event.clientY;
    this.yaw -= dx * 0.004;
    this.pitch = clamp(this.pitch - dy * 0.004, -1.45, 1.45);
    this.updateCamera();
  }

  private stopDrag(): void {
    this.dragging = false;
  }

  private zoom(event: WheelEvent): void {
    event.preventDefault();
    this.camera.fov = clamp(this.camera.fov + event.deltaY * 0.025, 34, 92);
    this.camera.updateProjectionMatrix();
  }

  private updateCamera(): void {
    const direction = new THREE.Vector3(
      Math.cos(this.pitch) * Math.sin(this.yaw),
      Math.sin(this.pitch),
      -Math.cos(this.pitch) * Math.cos(this.yaw),
    );
    this.camera.lookAt(direction);
  }

  private addStars(): void {
    const starCount = Math.min(this.catalog.length, MAX_STAR_COUNT);
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const ra = new Float32Array(starCount);
    const dec = new Float32Array(starCount);
    const pmRa = new Float32Array(starCount);
    const pmDec = new Float32Array(starCount);
    const magnitude = new Float32Array(starCount);

    for (let i = 0; i < starCount; i += 1) {
      const star = this.catalog[i];
      if (!star) continue;
      const color = starColor(star.colorIndex);
      const colorOffset = i * 3;
      colors[colorOffset] = color.r;
      colors[colorOffset + 1] = color.g;
      colors[colorOffset + 2] = color.b;
      ra[i] = star.ra;
      dec[i] = star.dec;
      pmRa[i] = star.pmRa;
      pmDec[i] = star.pmDec;
      magnitude[i] = star.magnitude;
    }

    this.starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.starGeometry.setAttribute('starColor', new THREE.BufferAttribute(colors, 3));
    this.starGeometry.setAttribute('starRa', new THREE.BufferAttribute(ra, 1));
    this.starGeometry.setAttribute('starDec', new THREE.BufferAttribute(dec, 1));
    this.starGeometry.setAttribute('starPmRa', new THREE.BufferAttribute(pmRa, 1));
    this.starGeometry.setAttribute('starPmDec', new THREE.BufferAttribute(pmDec, 1));
    this.starGeometry.setAttribute('starMagnitude', new THREE.BufferAttribute(magnitude, 1));
    this.starGeometry.setDrawRange(0, starCount);

    const material = new THREE.ShaderMaterial({
      uniforms: this.starUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute vec3 starColor;
        attribute float starRa;
        attribute float starDec;
        attribute float starPmRa;
        attribute float starPmDec;
        attribute float starMagnitude;
        uniform float uYearsSinceCatalog;
        uniform float uZeta;
        uniform float uZ;
        uniform float uCosTheta;
        uniform float uSinTheta;
        uniform float uLocalSiderealTime;
        uniform float uSinLat;
        uniform float uCosLat;
        uniform float uSkyRadius;
        uniform float uMaxVisibleMagnitude;
        uniform float uCinematicStrength;
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          float visible = step(starMagnitude, uMaxVisibleMagnitude);
          float currentDec = clamp(starDec + starPmDec * uYearsSinceCatalog, ${(-HALF_PI).toFixed(8)}, ${HALF_PI.toFixed(8)});
          float cosDec = cos(currentDec);
          float sinDec = sin(currentDec);
          float raZeta = starRa + starPmRa * uYearsSinceCatalog + uZeta;
          float a = cosDec * sin(raZeta);
          float b = uCosTheta * cosDec * cos(raZeta) - uSinTheta * sinDec;
          float c = clamp(uSinTheta * cosDec * cos(raZeta) + uCosTheta * sinDec, -1.0, 1.0);
          float precessedRa = atan(a, b) + uZ;
          float precessedCosDec = sqrt(max(0.0, 1.0 - c * c));
          float hourAngle = uLocalSiderealTime - precessedRa;
          float x = -precessedCosDec * sin(hourAngle) * uSkyRadius;
          float y = (c * uSinLat + precessedCosDec * uCosLat * cos(hourAngle)) * uSkyRadius;
          float north = c * uCosLat - precessedCosDec * uSinLat * cos(hourAngle);
          float zPosition = -north * uSkyRadius;
          float brightness = clamp(1.0 - (starMagnitude + 1.4) / 10.4, 0.035, 1.0);
          float thresholdFade = clamp((uMaxVisibleMagnitude - starMagnitude) / 0.8, 0.1, 1.0);
          float lowerSkyDimming = y < 0.0 ? clamp(1.0 + (y / uSkyRadius) * 0.82, 0.18, 1.0) : 1.0;
          float intensity = clamp((pow(brightness, 1.45) + uCinematicStrength * 0.09) * lowerSkyDimming * thresholdFade, 0.018, 1.0);
          vColor = vec3(
            clamp(intensity * starColor.r, 0.0, 1.0),
            clamp(intensity * starColor.g, 0.0, 1.0),
            clamp(intensity * (starColor.b + uCinematicStrength * 0.16), 0.0, 1.0)
          );
          vAlpha = visible;
          vec4 mvPosition = modelViewMatrix * vec4(x, y, zPosition, 1.0);
          float starSize = 2.4 + sqrt(brightness) * 7.8 + uCinematicStrength * 5.5;
          gl_PointSize = visible * starSize * (180.0 / max(12.0, -mvPosition.z));
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          if (vAlpha <= 0.0) discard;
          float dist = distance(gl_PointCoord, vec2(0.5));
          float alpha = smoothstep(0.5, 0.08, dist);
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
    });

    const stars = new THREE.Points(this.starGeometry, material);
    stars.renderOrder = 2;
    this.scene.add(stars);
  }

  private addTrails(): void {
    this.trailGeometry.setAttribute('position', this.trailPositionAttribute);
    this.trailGeometry.setDrawRange(0, 0);
    const trails = new THREE.LineSegments(this.trailGeometry, this.trailMaterial);
    trails.renderOrder = 3;
    this.scene.add(trails);
  }

  private addSkyDome(): void {
    const geometry = new THREE.SphereGeometry(SKY_RADIUS * 1.08, 48, 24);
    const material = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      vertexShader: `
        varying vec3 vWorld;
        void main() {
          vec4 world = modelMatrix * vec4(position, 1.0);
          vWorld = normalize(world.xyz);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vWorld;
        void main() {
          float up = clamp(vWorld.y * 0.5 + 0.5, 0.0, 1.0);
          vec3 horizon = vec3(0.035, 0.045, 0.085);
          vec3 zenith = vec3(0.004, 0.009, 0.035);
          vec3 color = mix(horizon, zenith, smoothstep(0.18, 0.92, up));
          float lower = smoothstep(0.02, -0.7, vWorld.y);
          color = mix(color, vec3(0.0, 0.002, 0.012), lower * 0.72);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
    this.scene.add(new THREE.Mesh(geometry, material));
  }

  private addLowerSkyVeil(): void {
    const geometry = new THREE.SphereGeometry(SKY_RADIUS * 1.02, 48, 24);
    const material = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      vertexShader: `
        varying vec3 vWorld;
        void main() {
          vec4 world = modelMatrix * vec4(position, 1.0);
          vWorld = normalize(world.xyz);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vWorld;
        void main() {
          float alpha = smoothstep(0.02, -0.58, vWorld.y) * 0.46;
          gl_FragColor = vec4(0.0, 0.003, 0.014, alpha);
        }
      `,
    });
    const veil = new THREE.Mesh(geometry, material);
    veil.renderOrder = 6;
    this.scene.add(veil);
  }

  private addHorizon(): void {
    const points: THREE.Vector3[] = [];
    const segments = 160;
    for (let i = 0; i <= segments; i += 1) {
      const angle = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.sin(angle) * SKY_RADIUS, 0, -Math.cos(angle) * SKY_RADIUS));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    this.scene.add(new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0x3f7894, transparent: true, opacity: 0.55 })));
  }

}

function starColor(colorIndex: number | undefined): { r: number; g: number; b: number } {
  if (colorIndex === undefined) return { r: 0.88, g: 0.93, b: 1.04 };

  const t = clamp((colorIndex + 0.35) / 2.35, 0, 1);
  return {
    r: 0.72 + t * 0.48,
    g: 0.82 + Math.sin(t * Math.PI) * 0.16,
    b: 1.16 - t * 0.58,
  };
}

function maxMagnitudeForSpeed(cinematicStrength: number): number {
  const speed = clamp(cinematicStrength, 0, 1);
  const brightStarOnly = Math.pow(speed, 0.62);
  return 12.5 - brightStarOnly * 10.9;
}
