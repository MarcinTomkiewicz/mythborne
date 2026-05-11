import {
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { OriginBonus } from '../../core/domain/origin/origin.model';

@Component({
  selector: 'app-carousel',
  imports: [],
  templateUrl: './carousel.html',
  styleUrl: './carousel.scss',
})
export class Carousel {
  origins = input.required<any[]>();
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
    const newIndex =
      (this.selectedIndex() - 1 + this.origins().length) %
      this.origins().length;
    this.selectedIndex.set(newIndex);
    this.indexChange.emit(newIndex);
  }

  next() {
    const newIndex = (this.selectedIndex() + 1) % this.origins().length;
    this.selectedIndex.set(newIndex);
    this.indexChange.emit(newIndex);
  }

  getLeftIndex(): number {
    return (this.selectedIndex() + 1) % this.origins().length;
  }

  getRightIndex(): number {
    return (
      (this.selectedIndex() - 1 + this.origins().length) % this.origins().length
    );
  }

  isVisible(i: number): boolean {
    return (
      i === this.selectedIndex() ||
      i === this.getLeftIndex() ||
      i === this.getRightIndex()
    );
  }
}
