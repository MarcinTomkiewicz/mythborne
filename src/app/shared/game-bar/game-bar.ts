import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-game-bar',
  imports: [],
  templateUrl: './game-bar.html',
})
export class GameBar {
  label = input('XP');
  value = input(0);
  max = input(100);
  type = input<'hp' | 'xp'>('hp');
  segments = input(10);
  compact = input(false);
  showLabel = input(true);
  showValue = input(true);

  readonly safeMax = computed(() => Math.max(this.max(), 0));
  readonly safeSegments = computed(() => Math.max(this.segments(), 1));
  readonly steps = computed(() => Array.from({ length: this.safeSegments() }));
  readonly percent = computed(() =>
    this.safeMax() <= 0 ? 0 : Math.min(Math.max(this.value() / this.safeMax(), 0), 1)
  );
  readonly fillColor = computed(() =>
    this.type() === 'hp' ? 'var(--mg-color-success)' : 'var(--mg-color-info)'
  );

  getStepFill(index: number): number {
    const progress = this.percent() * this.safeSegments();
    return Math.max(0, Math.min(progress - index, 1)) * 100;
  }

  getStepHeight(): string {
    return this.compact() ? '10px' : '12px';
  }
}
