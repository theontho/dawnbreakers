import * as THREE from 'three';
import { computeRenderStars } from './astronomy';
import { clamp } from './math';
import type { GeographicLocation, Star } from './types';

const SKY_RADIUS = 140;
const MAX_STAR_COUNT = 120000;

export interface SkyRenderState {
  date: Date;
  location: GeographicLocation;
  cinematicStrength: number;
}

export class SkyRewindRenderer {
  readonly canvas: HTMLCanvasElement;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(62, 1, 0.1, 500);
  private readonly positions = new Float32Array(MAX_STAR_COUNT * 3);
  private readonly colors = new Float32Array(MAX_STAR_COUNT * 3);
  private readonly sizes = new Float32Array(MAX_STAR_COUNT);
  private readonly positionAttribute = new THREE.BufferAttribute(this.positions, 3);
  private readonly colorAttribute = new THREE.BufferAttribute(this.colors, 3);
  private readonly sizeAttribute = new THREE.BufferAttribute(this.sizes, 1);
  private readonly starGeometry = new THREE.BufferGeometry();
  private readonly trailGeometry = new THREE.BufferGeometry();
  private readonly trailPositions = new Float32Array(MAX_STAR_COUNT * 6);
  private readonly trailPositionAttribute = new THREE.BufferAttribute(this.trailPositions, 3);
  private readonly catalog: readonly Star[];
  private readonly onResize = (): void => this.resize();
  private readonly onPointerDown = (event: PointerEvent): void => this.startDrag(event);
  private readonly onPointerMove = (event: PointerEvent): void => this.drag(event);
  private readonly onPointerUp = (): void => this.stopDrag();
  private readonly onWheel = (event: WheelEvent): void => this.zoom(event);
  private lastPositions = new Float32Array(MAX_STAR_COUNT * 3);
  private disposed = false;
  private dragging = false;
  private pointerX = 0;
  private pointerY = 0;
  private yaw = 0;
  private pitch = 0.35;

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

    const stars = computeRenderStars(this.catalog, state.date, state.location, SKY_RADIUS);
    const starCount = Math.min(stars.length, MAX_STAR_COUNT);
    this.lastPositions.set(this.positions);

    for (let i = 0; i < starCount; i += 1) {
      const star = stars[i];
      if (!star) continue;

      const offset = i * 3;
      this.positions[offset] = star.position.x;
      this.positions[offset + 1] = star.position.y;
      this.positions[offset + 2] = star.position.z;

      const brightness = clamp(1 - (star.magnitude + 1.4) / 8.2, 0.08, 1);
      const blue = clamp(0.74 + state.cinematicStrength * 0.2 + brightness * 0.18, 0, 1);
      this.colors[offset] = clamp(0.68 + brightness * 0.32, 0, 1);
      this.colors[offset + 1] = clamp(0.78 + brightness * 0.22, 0, 1);
      this.colors[offset + 2] = blue;
      this.sizes[i] = 5 + brightness * 9 + state.cinematicStrength * 7;

      const trailOffset = i * 6;
      this.trailPositions[trailOffset] = this.lastPositions[offset] || star.position.x;
      this.trailPositions[trailOffset + 1] = this.lastPositions[offset + 1] || star.position.y;
      this.trailPositions[trailOffset + 2] = this.lastPositions[offset + 2] || star.position.z;
      this.trailPositions[trailOffset + 3] = star.position.x;
      this.trailPositions[trailOffset + 4] = star.position.y;
      this.trailPositions[trailOffset + 5] = star.position.z;
    }

    this.starGeometry.setDrawRange(0, starCount);
    this.trailGeometry.setDrawRange(0, starCount * 2);
    this.positionAttribute.needsUpdate = true;
    this.colorAttribute.needsUpdate = true;
    this.sizeAttribute.needsUpdate = true;
    this.trailPositionAttribute.needsUpdate = true;
    this.renderer.render(this.scene, this.camera);
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

  private resize(): void {
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / Math.max(1, height);
    this.camera.updateProjectionMatrix();
  }

  private addStars(): void {
    this.starGeometry.setAttribute('position', this.positionAttribute);
    this.starGeometry.setAttribute('starColor', this.colorAttribute);
    this.starGeometry.setAttribute('starSize', this.sizeAttribute);
    this.starGeometry.setDrawRange(0, 0);

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute vec3 starColor;
        attribute float starSize;
        varying vec3 vColor;
        void main() {
          vColor = starColor;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = starSize * (180.0 / max(12.0, -mvPosition.z));
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          float dist = distance(gl_PointCoord, vec2(0.5));
          float alpha = smoothstep(0.5, 0.08, dist);
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
    });

    this.scene.add(new THREE.Points(this.starGeometry, material));
  }

  private addTrails(): void {
    this.trailGeometry.setAttribute('position', this.trailPositionAttribute);
    this.trailGeometry.setDrawRange(0, 0);
    const material = new THREE.LineBasicMaterial({
      color: 0x83d6ff,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.scene.add(new THREE.LineSegments(this.trailGeometry, material));
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
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
    this.scene.add(new THREE.Mesh(geometry, material));
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
    this.pitch = clamp(this.pitch + dy * 0.003, -0.35, 1.35);
    this.updateCamera();
  }

  private stopDrag(): void {
    this.dragging = false;
  }

  private zoom(event: WheelEvent): void {
    event.preventDefault();
    this.camera.fov = clamp(this.camera.fov + event.deltaY * 0.02, 36, 88);
    this.camera.updateProjectionMatrix();
  }

  private updateCamera(): void {
    const target = new THREE.Vector3(
      Math.cos(this.pitch) * Math.sin(this.yaw),
      Math.sin(this.pitch),
      -Math.cos(this.pitch) * Math.cos(this.yaw),
    );
    this.camera.lookAt(target);
  }
}
