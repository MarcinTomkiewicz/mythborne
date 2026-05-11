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
import { Origin } from '../../../../../core/domain/origin/origin.model';
import { StartFlowOriginOption } from '../../../../../core/domain/start-flow/start-flow.model';
import { StartFlow } from '../../../../../core/services/start-flow/start-flow';
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
          [bonusSummaryText]="currentBonusSummaryText()"
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
    } @else if (isLoading()) {
      <p class="mb-0 muted-text">Loading origins...</p>
    } @else if (errorMessage()) {
      <p class="mb-0 text-danger">{{ errorMessage() }}</p>
    } @else {
      <p class="mb-0 text-danger">No origin options are available for character creation.</p>
    }
  `,
})
export class StepOrigin implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly startFlow = inject(StartFlow);

  readonly selectedOrigin = input<Origin | null>(null);
  readonly showBack = input(true);
  readonly origins = signal<StartFlowOriginOption[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly selectedIndex = signal(0);
  readonly next = output<Origin>();
  readonly back = output<void>();

  readonly currentBonusSummaryText = computed(
    () => this.origins()[this.selectedIndex()]?.bonusSummaryText ?? null,
  );

  ngOnInit(): void {
    this.startFlow.getOriginOptions().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (list) => {
        this.origins.set(list);
        this.errorMessage.set(null);
        this.isLoading.set(false);

        const originId = this.selectedOrigin()?.id;
        if (originId) {
          const index = list.findIndex((origin) => origin.id === originId);
          if (index >= 0) {
            this.selectedIndex.set(index);
          }
        }
      },
      error: (error: unknown) => {
        this.origins.set([]);
        this.errorMessage.set(
          error instanceof Error
            ? error.message
            : 'Failed to load start-flow origin options.',
        );
        this.isLoading.set(false);
      },
    });
  }

  onIndexChange(index: number) {
    this.selectedIndex.set(index);
  }
}
