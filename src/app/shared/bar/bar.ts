import { CommonModule } from '@angular/common';
import { Component, computed, input, Input } from '@angular/core';

@Component({
  selector: 'app-bar',
  imports: [CommonModule],
  templateUrl: './bar.html',
  styleUrl: './bar.scss',
})
export class Bar {
  label = input('XP');
  value = input(0);
  max = input(100);
  type = input<'hp' | 'xp'>('hp');

  readonly steps = Array.from({ length: 10 });

  readonly percent = computed(() => this.value() / this.max());
  readonly filledSteps = computed(() => Math.floor(this.percent() * 10));
  readonly partialFill = computed(() => +(this.percent() * 10 - this.filledSteps()).toFixed(2));

  readonly fillColor = computed(() => this.type() === 'hp' ? '#4ade80' : '#60a5fa');
}
