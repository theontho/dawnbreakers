import { journeyDeparture, type Journey } from '../data/journeys';
import type { JourneyClock } from './journeyClock';
import { roadCurve } from './roadCurve';

const DAY_MS = 86400000;

/**
 * The passage of a whole road, from its first evening to its last dawn: the
 * first night watched, the days between rolling by, the last night slowing
 * into dawn. The moon keeps its true course, so a long road shows the month
 * going by.
 */
export class JourneyPassage {
  private generation = 0;
  private running = false;

  constructor(private readonly clock: JourneyClock, private readonly journey: Journey) {}

  get active(): boolean {
    return this.running;
  }

  /** Plays the road from its first evening, the days between at `secondsPerDay`, and calls `onDone` at the last dawn. */
  start(onDone: () => void, secondsPerDay?: number): void {
    const generation = ++this.generation;
    this.running = true;
    this.clock.jumpTo(journeyDeparture(this.journey));
    this.clock.startPassage(roadCurve(this.journey.days, secondsPerDay), () => {
      if (generation !== this.generation) return;
      this.running = false;
      onDone();
    });
  }

  /** Lets go of the road, as when the viewer takes the clock back. */
  stop(): void {
    this.generation += 1;
    this.running = false;
  }
}

/** Which day of the road a moment falls in, counting the first from its evening until the next. */
export function dayOfJourney(journey: Journey, date: Date): number {
  const sinceEvening = date.getTime() - journeyDeparture(journey).getTime() + 3 * 3600000;
  return Math.floor(sinceEvening / DAY_MS) + 1;
}
