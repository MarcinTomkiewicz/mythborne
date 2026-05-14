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
import {
  StartFlowOriginOption,
  StartFlowServerAvailability,
} from '../../../../../core/domain/start-flow/start-flow.model';
import { StartFlow } from '../../../../../core/services/start-flow/start-flow';
import { Carousel } from '../../../../../shared/carousel/carousel';

@Component({
  selector: 'app-step-origin',
  standalone: true,
  imports: [Carousel, ButtonModule],
  template: `
    @if (origins().length > 0) {
      <section class="flex-col gap-lg">
        <div class="flex-col gap-xs">
          <h2 class="mg-section__title mg-section__title--xs mb-0">Pochodzenie</h2>
          <p class="mb-0 muted-text">
            Pochodzenie jest wybierane raz przy tworzeniu bohatera. Nazwy, opisy i bonusy pochodzą z konfiguracji świata.
          </p>
        </div>

        <app-carousel
          [origins]="origins()"
          [bonusSummaryText]="currentBonusSummaryText()"
          [indexInput]="selectedIndex()"
          (indexChange)="onIndexChange($event)"
        />

        <div class="flex-row-center-center flex-wrap gap-sm">
          @for (origin of origins(); track origin.id; let index = $index) {
            <p-button
              type="button"
              [label]="origin.name"
              severity="secondary"
              [outlined]="index !== selectedIndex()"
              (onClick)="onIndexChange(index)"
            />
          }
        </div>

        <section class="mg-grid-2 gap-md">
          <article class="mg-card flex-col gap-sm">
            <h3 class="mg-section__title mg-section__title--xs mb-0">Podsumowanie tworzenia</h3>
            <div class="flex-col gap-xs">
              <div class="flex-row-between-center gap-md">
                <span class="muted-text">Serwer</span>
                <strong class="heading-color">{{ serverAvailability()?.serverName ?? 'Wybrany serwer' }}</strong>
              </div>
              <div class="flex-row-between-center gap-md">
                <span class="muted-text">Nazwa bohatera</span>
                <strong class="heading-color">{{ heroNamePreview() }}</strong>
              </div>
              <div class="flex-row-between-center gap-md">
                <span class="muted-text">Pochodzenie</span>
                <strong class="heading-color">{{ currentOrigin().name }}</strong>
              </div>
              <div class="flex-row-between-center gap-md">
                <span class="muted-text">Punkty postaci</span>
                <strong class="heading-color">Przydzielane po utworzeniu</strong>
              </div>
              <div class="flex-row-between-center gap-md">
                <span class="muted-text">Posiadłość</span>
                <strong class="heading-color">Adres zostanie przydzielony automatycznie</strong>
              </div>
            </div>
          </article>

          <article class="mg-card flex-col gap-sm">
            <h3 class="mg-section__title mg-section__title--xs mb-0">Wybrane pochodzenie</h3>
            <div class="flex-col gap-xs">
              <div class="flex-row-between-center gap-md">
                <span class="muted-text">Opis i bonusy</span>
                <strong class="heading-color">Z konfiguracji świata</strong>
              </div>
              <div class="flex-row-between-center gap-md">
                <span class="muted-text">Wygląd</span>
                <strong class="heading-color">{{ currentOrigin().name }}</strong>
              </div>
            </div>
            <p class="mb-0 muted-text">
              Po utworzeniu bohatera przejdziesz do pierwszego przydziału atrybutów.
            </p>
          </article>
        </section>

        <div class="flex-row-end-center gap-sm mt-md">
          @if (showBack()) {
            <p-button type="button" label="Wstecz" severity="secondary" (onClick)="back.emit()" />
          }
          @if (currentOrigin(); as origin) {
            <p-button
              type="button"
              [label]="nextLabel()"
              severity="success"
              (onClick)="next.emit(origin)"
            />
          }
        </div>
      </section>
    } @else if (isLoading()) {
      <p class="mb-0 muted-text">Wczytywanie pochodzeń...</p>
    } @else if (errorMessage()) {
      <p class="mb-0 text-danger">{{ errorMessage() }}</p>
    } @else {
      <p class="mb-0 text-danger">Brak dostępnych pochodzeń dla tworzenia bohatera.</p>
    }
  `,
})
export class StepOrigin implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly startFlow = inject(StartFlow);

  readonly selectedOrigin = input<Origin | null>(null);
  readonly serverAvailability = input<StartFlowServerAvailability | null>(null);
  readonly heroName = input('');
  readonly showBack = input(true);
  readonly nextLabel = input('Dalej');
  readonly origins = signal<StartFlowOriginOption[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly selectedIndex = signal(0);
  readonly next = output<Origin>();
  readonly back = output<void>();

  readonly currentBonusSummaryText = computed(
    () => this.origins()[this.selectedIndex()]?.bonusSummaryText ?? null,
  );
  readonly currentOrigin = computed(
    () => this.origins()[this.selectedIndex()] ?? null,
  );
  readonly heroNamePreview = computed(() => {
    const name = this.heroName().trim();

    return name || 'Jeszcze bez nazwy';
  });

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
            : 'Nie udało się wczytać dostępnych pochodzeń.',
        );
        this.isLoading.set(false);
      },
    });
  }

  onIndexChange(index: number): void {
    this.selectedIndex.set(index);
  }
}
