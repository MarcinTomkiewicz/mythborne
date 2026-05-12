import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-game-bar',
  imports: [],
  templateUrl: './game-bar.html',
  styleUrl: './game-bar.scss',
})
export class GameBar {
  label = input('XP');
  value = input(0);
  max = input(100);
  type = input<'hp' | 'xp'>('hp');
  compact = input(false);
  showLabel = input(true);
  showValue = input(true);

  readonly safeMax = computed(() => Math.max(this.max(), 0));
  readonly percent = computed(() =>
    this.safeMax() <= 0 ? 0 : Math.min(Math.max(this.value() / this.safeMax(), 0), 1)
  );
  readonly percentValue = computed(() => this.percent() * 100);
  readonly isHp = computed(() => this.type() === 'hp');
  readonly isXp = computed(() => this.type() === 'xp');
}
