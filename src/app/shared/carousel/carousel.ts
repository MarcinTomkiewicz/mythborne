import {
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { Origin, OriginBonus } from '../../core/domain/origin/origin.model';

@Component({
  selector: 'app-carousel',
  imports: [],
  templateUrl: './carousel.html',
  styleUrl: './carousel.scss',
})
export class Carousel {
  origins = input.required<Origin[]>();
  indexInput = input(0);
  bonuses = input<OriginBonus[]>([]);
  bonusSummaryText = input<string | null>(null);
  statLabels = input<Partial<Record<string, string>>>({});

  indexChange = output<number>();

  private selectedIndex = signal(this.indexInput());

  index = computed(() => this.selectedIndex());

  constructor() {
    effect(() => {
      this.selectedIndex.set(this.indexInput());
    });
  }

  prev() {
    this.select(this.selectedIndex() - 1);
  }

  next() {
    this.select(this.selectedIndex() + 1);
  }

  select(index: number): void {
    const count = this.origins().length;

    if (count === 0) {
      return;
    }

    const newIndex = (index + count) % count;
    this.selectedIndex.set(newIndex);
    this.indexChange.emit(newIndex);
  }

  getLeftIndex(): number {
    return (
      (this.selectedIndex() - 1 + this.origins().length) % this.origins().length
    );
  }

  getRightIndex(): number {
    return (this.selectedIndex() + 1) % this.origins().length;
  }

  isVisible(i: number): boolean {
    return (
      i === this.selectedIndex() ||
      i === this.getLeftIndex() ||
      i === this.getRightIndex()
    );
  }
}
