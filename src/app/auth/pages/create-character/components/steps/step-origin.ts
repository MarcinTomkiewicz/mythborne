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
import { CreateCharacterSummaryRow } from '../../../../../core/interfaces/hero/create-character-server-options.interface';
import {
  StartFlowOriginOption,
  StartFlowServerAvailability,
} from '../../../../../core/domain/start-flow/start-flow.model';
import { StartFlow } from '../../../../../core/services/start-flow/start-flow';
import { Carousel } from '../../../../../shared/carousel/carousel';
import { AccountEntrySummaryRows } from '../../account-entry-summary-rows';

@Component({
  selector: 'app-step-origin',
  standalone: true,
  imports: [Carousel, ButtonModule, AccountEntrySummaryRows],
  template: `
    @if (origins().length > 0) {
      <section class="flex-col gap-lg" aria-label="Wybór pochodzenia">
        <div class="flex-col gap-xs">
          <h2 class="color-heading text-lg mb-0">Wybierz pochodzenie bohatera</h2>
          <p class="mb-0 muted-text">
            Pochodzenie wybierasz raz. Nazwy, opisy i bonusy pochodzą z konfiguracji świata.
          </p>
        </div>

        <app-carousel
          [origins]="origins()"
          [bonusSummaryText]="currentBonusSummaryText()"
          [indexInput]="selectedIndex()"
          (indexChange)="onIndexChange($event)"
        />

        <section class="mg-grid-2 gap-md" aria-label="Podsumowanie tworzenia">
          <article class="mg-card p-lg flex-col gap-sm h-100">
            <h3 class="color-heading mb-0">Podsumowanie tworzenia</h3>
            <app-account-entry-summary-rows [rows]="creationSummaryRows()" />
          </article>

          <article class="mg-card p-lg flex-col gap-sm h-100">
            <h3 class="color-heading mb-0">Wybrane pochodzenie</h3>
            <app-account-entry-summary-rows [rows]="selectedOriginRows()" />
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
              [disabled]="submitDisabled() || !currentOrigin()"
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
  readonly submitDisabled = input(false);
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
  readonly creationSummaryRows = computed<CreateCharacterSummaryRow[]>(() => [
    {
      label: 'Serwer',
      value: this.serverAvailability()?.serverName ?? 'Wybrany serwer',
      primary: true,
    },
    {
      label: 'Imię bohatera',
      value: this.heroNamePreview(),
    },
    {
      label: 'Pochodzenie',
      value: this.currentOrigin()?.name ?? 'Wybierz pochodzenie',
    },
    {
      label: 'Punkty postaci',
      value: '1000',
    },
    {
      label: 'Posiadłość',
      value: 'Adres zostanie przydzielony automatycznie',
      multiline: true,
    },
  ]);
  readonly selectedOriginRows = computed<CreateCharacterSummaryRow[]>(() => [
    {
      label: 'Pochodzenie',
      value: this.currentOrigin()?.name ?? 'Wybierz pochodzenie',
      primary: true,
    },
    {
      label: 'Bonusy',
      value: this.currentBonusSummaryText() || 'Bonusy zostaną zastosowane przy utworzeniu bohatera',
      multiline: true,
    },
  ]);

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
