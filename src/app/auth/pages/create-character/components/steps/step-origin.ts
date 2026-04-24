import {
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { Origin, OriginBonus } from '../../../../../core/domain/origin/origin.model';
import { Origins } from '../../../../../core/services/origins/origins';
import { StatsService } from '../../../../../core/services/stats/stats';
import { Carousel } from '../../../../../shared/carousel/carousel';

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
          @if (showBack()) {
            <p-button type="button" label="Back" severity="secondary" (click)="back.emit()" />
          }
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
  private readonly destroyRef = inject(DestroyRef);
  private readonly originService = inject(Origins);
  private readonly statsService = inject(StatsService);

  readonly selectedOrigin = input<Origin | null>(null);
  readonly showBack = input(true);
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
    this.originService.getOrigins().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((list) => {
      this.origins.set(list);

      const originId = this.selectedOrigin()?.id;
      if (originId) {
        const index = list.findIndex((origin) => origin.id === originId);
        if (index >= 0) {
          this.selectedIndex.set(index);
        }
      }

      for (const origin of list) {
        this.originService
          .getBonusesForOrigin(origin.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((bonuses) => {
            this.bonusesMap.update((previous) => ({
              ...previous,
              [origin.id]: bonuses,
            }));
          });
      }
    });

    this.statsService.getAllStatLabels().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((labels) => {
      this.statLabels.set(labels);
    });
  }

  onIndexChange(index: number) {
    this.selectedIndex.set(index);
  }
}
