/**
 * The playhead for the title's sunrise, driven like a film: play, pause,
 * seek and change speed. The scene ticks it each frame and renders whatever
 * moment it points at, so every frame of the dawn can be reached in any order.
 */

export const SUNRISE_SPEEDS = [0.5, 1, 2, 4, 8, 16] as const;

type Listener = (clock: SunriseClock) => void;

export class SunriseClock {
  private positionMs = 0;
  private speedIndex = SUNRISE_SPEEDS.indexOf(1);
  private playing = true;
  private readonly listeners = new Set<Listener>();

  constructor(readonly durationMs: number) {}

  get position(): number {
    return this.positionMs;
  }

  get progress(): number {
    return this.positionMs / this.durationMs;
  }

  get speed(): number {
    return SUNRISE_SPEEDS[this.speedIndex] ?? 1;
  }

  get isPlaying(): boolean {
    return this.playing;
  }

  get atEnd(): boolean {
    return this.positionMs >= this.durationMs;
  }

  onChange(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Advances by a frame's real time; stops at the end like a film would. */
  tick(deltaMs: number): void {
    if (!this.playing) return;
    this.positionMs = Math.min(this.durationMs, this.positionMs + deltaMs * this.speed);
    if (this.atEnd) this.playing = false;
    this.emit();
  }

  seek(positionMs: number): void {
    this.positionMs = Math.max(0, Math.min(this.durationMs, positionMs));
    this.emit();
  }

  seekBy(deltaMs: number): void {
    this.seek(this.positionMs + deltaMs);
  }

  /** Playing from the last frame starts the dawn over. */
  togglePlay(): void {
    if (!this.playing && this.atEnd) this.positionMs = 0;
    this.playing = !this.playing;
    this.emit();
  }

  /** One speed slower or faster, holding at either end. */
  stepSpeed(direction: 1 | -1): void {
    this.speedIndex = Math.max(0, Math.min(SUNRISE_SPEEDS.length - 1, this.speedIndex + direction));
    this.emit();
  }

  /** One speed faster, wrapping from the fastest back to the slowest. */
  cycleSpeed(): void {
    this.speedIndex = (this.speedIndex + 1) % SUNRISE_SPEEDS.length;
    this.emit();
  }

  private emit(): void {
    this.listeners.forEach((listener) => listener(this));
  }
}
