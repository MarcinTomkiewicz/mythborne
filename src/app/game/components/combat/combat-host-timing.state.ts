import { Injectable, signal } from '@angular/core';
import { walkingDeadTimingFrameAt } from '../../../core/utils/combat-walking-dead';

@Injectable()
export class CombatHostTimingState {
  private animationFrame: number | null = null;
  private manifestId: string | null = null;
  private speedMultiplier: number | null = null;
  private animationStartedAtMs: number | null = null;

  readonly frame = signal({
    manifestId: null as string | null,
    positionPercent: 0,
  });

  start(manifestId: string, speed: number): void {
    if (!canUseAnimationFrame()) {
      this.frame.set({
        manifestId,
        positionPercent: 0,
      });
      return;
    }

    if (
      this.animationFrame !== null &&
      this.manifestId === manifestId &&
      this.speedMultiplier === speed
    ) {
      return;
    }

    this.stop();
    this.manifestId = manifestId;
    this.speedMultiplier = speed;
    this.animationStartedAtMs = null;
    this.frame.set({
      manifestId,
      positionPercent: 0,
    });
    this.animationFrame = window.requestAnimationFrame((timestamp) =>
      this.runFrame(timestamp),
    );
  }

  stop(): void {
    if (this.animationFrame !== null && canUseAnimationFrame()) {
      window.cancelAnimationFrame(this.animationFrame);
    }

    this.animationFrame = null;
    this.manifestId = null;
    this.speedMultiplier = null;
    this.animationStartedAtMs = null;
  }

  resetFrame(): void {
    this.frame.set({
      manifestId: null,
      positionPercent: 0,
    });
  }

  private runFrame(timestamp: number): void {
    if (!canUseAnimationFrame()) {
      this.stop();
      return;
    }

    const manifestId = this.manifestId;
    const speed = this.speedMultiplier;

    if (!manifestId || speed === null) {
      return;
    }

    if (this.animationStartedAtMs === null) {
      this.animationStartedAtMs = timestamp;
    }

    const elapsedMs = Math.max(0, timestamp - this.animationStartedAtMs);
    const frame = walkingDeadTimingFrameAt(elapsedMs, speed);

    this.frame.set({
      manifestId,
      positionPercent: frame.position,
    });
    this.animationFrame = window.requestAnimationFrame((nextTimestamp) =>
      this.runFrame(nextTimestamp),
    );
  }
}

function canUseAnimationFrame(): boolean {
  return typeof window !== 'undefined' &&
    typeof window.requestAnimationFrame === 'function' &&
    typeof window.cancelAnimationFrame === 'function';
}
