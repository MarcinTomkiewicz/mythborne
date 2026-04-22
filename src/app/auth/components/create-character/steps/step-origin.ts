import {
  Component,
  computed,
  inject,
  input,
  output,
  signal,
  OnInit,
} from '@angular/core';

import { ButtonModule } from 'primeng/button';

import { Carousel } from '../../../../shared/carousel/carousel';
import { Origins } from '../../../../core/services/origins/origins';
import { StatsService } from '../../../../core/services/stats/stats';

import {
  Origin,
  OriginBonus,
} from '../../../../core/domain/origin/origin.model';

@Component({
  selector: 'app-step-origin',
  standalone: true,
  imports: [Carousel, ButtonModule],
  template: `
    @if (origins().length > 0) {
    <section class="flex-col gap-lg">
      <app-carousel
        [origins]="origins()"
        [bonuses]="currentBonuses()"
        [statLabels]="statLabels()"
        [indexInput]="selectedIndex()"
        (indexChange)="onIndexChange($event)"
      />

      <div class="flex-row-end-center gap-sm mt-xl">
        <p-button
          type="button"
          label="Back"
          severity="secondary"
          (click)="back.emit()"
        />
        <p-button
          type="button"
          label="Next"
          severity="success"
          (click)="next.emit(origins()[selectedIndex()])"
        />
      </div>
    </section>
    } @else {
    <p class="mb-0 muted-text">Loading origins...</p>
    }
  `,
})
export class StepOrigin implements OnInit {
  private readonly originService = inject(Origins);
  private readonly statsService = inject(StatsService);

  readonly selectedOrigin = input<Origin | null>(null);

  readonly origins = signal<Origin[]>([]);
  readonly bonusesMap = signal<Record<string, OriginBonus[]>>({});
  readonly selectedIndex = signal(0);
  readonly statLabels = signal<Record<string, string>>({});

  readonly next = output<Origin>();
  readonly back = output<void>();

  readonly currentBonuses = computed(() => {
    const originId = this.origins()[this.selectedIndex()]?.id;
    return originId ? this.bonusesMap()[originId] ?? [] : [];
  });

  ngOnInit(): void {
    this.originService.getOrigins().subscribe((list) => {
      this.origins.set(list);

      const originId = this.selectedOrigin()?.id;
      if (originId) {
        const index = list.findIndex((o) => o.id === originId);
        if (index >= 0) this.selectedIndex.set(index);
      }

      // załaduj bonusy
      for (const origin of list) {
        this.originService
          .getBonusesForOrigin(origin.id)
          .subscribe((bonuses) => {
            this.bonusesMap.update((prev) => ({
              ...prev,
              [origin.id]: bonuses,
            }));
          });
      }
    });

    this.statsService.getAllStatLabels().subscribe((labels) => {
      this.statLabels.set(labels);
    });
  }

  onIndexChange(index: number) {
    this.selectedIndex.set(index);
  }
}
