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
import {
  CREATE_CHARACTER_ORIGIN_CREATION_SUMMARY_ROWS,
  CREATE_CHARACTER_ORIGIN_SELECTED_SUMMARY_ROWS,
  CREATE_CHARACTER_STARTING_CHARACTER_POINTS,
} from '../../../../../core/config/create-character-server-options.config';
import { Origin } from '../../../../../core/domain/origin/origin.model';
import { AccountEntrySummaryRow } from '../../../../../core/interfaces/account-entry-summary-row.interface';
import {
  CreateCharacterOriginCreationSummaryRowKey,
  CreateCharacterOriginSelectedSummaryRowKey,
} from '../../../../../core/interfaces/hero/create-character-origin-summary.interface';
import {
  StartFlowOriginOption,
  StartFlowServerAvailability,
} from '../../../../../core/domain/start-flow/start-flow.model';
import { StartFlow } from '../../../../../core/services/start-flow/start-flow';
import { Carousel } from '../../../../../shared/carousel/carousel';
import { LoadingOverlay } from '../../../../../shared/loading-overlay/loading-overlay';
import { AccountEntrySummaryRows } from '../../account-entry-summary-rows';

@Component({
  selector: 'app-step-origin',
  standalone: true,
  imports: [Carousel, ButtonModule, AccountEntrySummaryRows, LoadingOverlay],
  template: `
    @if (origins().length > 0) {
      <section class="flex-col gap-lg w-100" aria-label="Wybór pochodzenia">
        <div class="flex-col gap-xs">
          <h2 class="color-heading text-lg m-0">Wybierz pochodzenie bohatera</h2>
          <p class="m-0 color-muted">
            Pochodzenie wybierasz raz. Nazwy, opisy i bonusy są częścią zasad wybranego świata.
          </p>
        </div>

        <app-carousel
          [origins]="origins()"
          [bonusSummaryText]="currentBonusSummaryText()"
          [indexInput]="selectedIndex()"
          (indexChange)="onIndexChange($event)"
        />

        <section class="mg-grid-2 gap-md w-100" aria-label="Podsumowanie tworzenia">
          <article class="mg-card p-lg flex-col gap-sm h-100 w-100">
            <h3 class="color-heading m-0">Podsumowanie tworzenia</h3>
            <app-account-entry-summary-rows [rows]="creationSummaryRows()" />
          </article>

          <article class="mg-card p-lg flex-col gap-sm h-100 w-100">
            <h3 class="color-heading m-0">Wybrane pochodzenie</h3>
            <app-account-entry-summary-rows [rows]="selectedOriginRows()" />
            <p class="m-0 color-muted">
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
      <app-loading-overlay
        [visible]="true"
        label="Wczytywanie pochodzeń..."
        description="Pobieramy dostępne pochodzenia bohatera."
      />
    } @else if (errorMessage()) {
      <p class="m-0 text-danger">{{ errorMessage() }}</p>
    } @else {
      <p class="m-0 text-danger">Brak dostępnych pochodzeń dla tworzenia bohatera.</p>
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
  readonly creationSummaryRows = computed<AccountEntrySummaryRow[]>(() => [
    ...CREATE_CHARACTER_ORIGIN_CREATION_SUMMARY_ROWS.map((row) => {
      const { key, ...display } = row;

      return {
        ...display,
        value: this.creationSummaryValue(key),
      };
    }),
  ]);
  readonly selectedOriginRows = computed<AccountEntrySummaryRow[]>(() => [
    ...CREATE_CHARACTER_ORIGIN_SELECTED_SUMMARY_ROWS.map((row) => {
      const { key, ...display } = row;

      return {
        ...display,
        value: this.selectedOriginSummaryValue(key),
      };
    }),
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

  private creationSummaryValue(key: CreateCharacterOriginCreationSummaryRowKey): string {
    switch (key) {
      case 'server':
        return this.serverAvailability()?.serverName ?? 'Wybrany serwer';
      case 'heroName':
        return this.heroNamePreview();
      case 'origin':
        return this.currentOrigin()?.name ?? 'Wybierz pochodzenie';
      case 'characterPoints':
        return String(CREATE_CHARACTER_STARTING_CHARACTER_POINTS);
      case 'estate':
        return 'Adres zostanie przydzielony automatycznie';
    }
  }

  private selectedOriginSummaryValue(key: CreateCharacterOriginSelectedSummaryRowKey): string {
    switch (key) {
      case 'origin':
        return this.currentOrigin()?.name ?? 'Wybierz pochodzenie';
      case 'bonuses':
        return this.currentBonusSummaryText() || 'Bonusy zostaną zastosowane przy utworzeniu bohatera';
    }
  }
}
