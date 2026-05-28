import { Component, DestroyRef, OnInit, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { PVP_TARGETING_SECTION_METADATA_NAMESPACE } from '../../../core/constants/pvp-ui-metadata.const';
import { UiMetadataEntryReadModel } from '../../../core/domain/admin-ui-metadata.model';
import { PvpUiMetadata } from '../../../core/services/pvp/pvp-ui-metadata';
import { getErrorMessage } from '../../../core/utils/error-message';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { VicinityPageState } from './vicinity-page.state';
import {
  durationLabel,
  levelLabel,
  playerSafeReason,
  protectionLabel,
  rowDetailLabel,
  toVicinityListRow,
  vicinityAddressKey,
} from './vicinity-list-row';
import {
  VicinityListRow,
  VicinityRowAction,
  VicinityRowActionKind,
} from '../../../core/types/vicinity.types';
import { VicinityRelocationRunner } from './vicinity-relocation-runner';
import {
  normalizeVicinitySearch,
  parseVicinityAddressSearch,
} from './vicinity-search';
import { VicinityTargetCandidatesState } from './vicinity-target-candidates.state';

@Component({
  selector: 'app-vicinity-page',
  standalone: true,
  host: {
    class: 'd-contents min-w-0',
  },
  imports: [
    ButtonModule,
    ConfirmDialogModule,
    InputTextModule,
    LoadingOverlay,
    PaginatorModule,
    ReactiveFormsModule,
    SelectModule,
  ],
  providers: [
    VicinityPageState,
    VicinityRelocationRunner,
    VicinityTargetCandidatesState,
  ],
  templateUrl: './vicinity-page.html',
})
export class VicinityPage implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly pvpUiMetadata = inject(PvpUiMetadata);

  readonly page = inject(VicinityPageState);
  readonly pvpTargets = inject(VicinityTargetCandidatesState);
  readonly pvpTargetingMetadata = signal<UiMetadataEntryReadModel[]>([]);
  readonly pvpTargetingMetadataError = signal<string | null>(null);
  readonly searchFeedback = signal<string | null>(null);
  readonly selectedDistrictControl = new FormControl<string | null>(null);
  readonly pvpSearchControl = new FormControl<string>('', { nonNullable: true });
  readonly selectedRowKey = signal<string | null>(null);
  readonly pvpTargetingMetadataLoaded = signal(false);
  readonly durationLabel = durationLabel;
  readonly levelLabel = levelLabel;
  readonly playerSafeReason = playerSafeReason;
  readonly rowDetailLabel = rowDetailLabel;
  readonly protectionLabel = protectionLabel;
  readonly districtOptions = computed(() =>
    this.page.districts().map((district) => ({
      label: `${district.label} (${district.districtCode})`,
      value: district.districtCode,
    })),
  );
  readonly rows = computed(() => {
    const candidatesByAddress = new Map(
      this.pvpTargets.visibleTargets().map((candidate) => [
        vicinityAddressKey(
          candidate.targetAddress.districtCode,
          candidate.targetAddress.addressNumber,
        ),
        candidate,
      ]),
    );
    const metadataEntries = this.pvpTargetingMetadata();

    return this.page.visibleRows().map((row) =>
      toVicinityListRow(
        row,
        candidatesByAddress.get(vicinityAddressKey(row.districtCode, row.addressNumber)) ?? null,
        metadataEntries,
        this.page.currentHeroName(),
      ),
    );
  });
  readonly selectedRow = computed(() => {
    const selectedKey = this.selectedRowKey();
    return this.rows().find((row) => row.key === selectedKey)
      ?? this.rows().find((row) => row.kind === 'occupied' && row.candidate)
      ?? this.rows().find((row) => row.kind === 'self')
      ?? null;
  });
  readonly isScreenLoading = computed(() =>
    this.page.error() === null
    && (
      this.page.isLoading()
      || this.page.isDailyAttackLoading()
      || this.page.isEstateRuntimeLoading()
      || this.pvpTargets.isVisibleOverlayLoading()
      || !this.pvpTargets.visibleOverlayLoaded()
      || !this.pvpTargetingMetadataLoaded()
    ),
  );

  constructor() {
    this.bindControlsToState();
    this.syncControlsFromState();
    this.syncVisibleOverlayFromRange();
  }

  ngOnInit(): void {
    this.page.loadData();
    this.page.loadDailyAttackState();
    this.page.loadEstateRuntimeState();
    this.loadPvpTargetingMetadata();
  }

  selectRow(row: VicinityListRow): void {
    this.selectedRowKey.set(row.key);

    if (row.kind === 'empty') {
      this.page.selectRow({
        districtCode: row.districtCode,
        addressNumber: row.addressNumber,
        addressLabel: row.addressLabel,
        kind: 'empty',
        isSelectable: true,
        occupantLabel: row.occupantLabel,
      });
      return;
    }

    this.page.setDestructiveConfirmed(false);
  }

  canStartAttack(row: VicinityListRow | null): boolean {
    const candidate = row?.candidate;

    return !!candidate
      && candidate.attackEligibility.canStart
      && !this.pvpTargets.isStartingAction()
      && !this.pvpTargets.isAttackPending(candidate.targetHeroId);
  }

  canStartSpy(row: VicinityListRow | null): boolean {
    const candidate = row?.candidate;

    return !!candidate
      && candidate.spyEligibility.canStart
      && !this.pvpTargets.isStartingAction()
      && !this.pvpTargets.isSpyPending(candidate.targetHeroId);
  }

  startAttack(row: VicinityListRow | null): void {
    if (row?.candidate && this.canStartAttack(row)) {
      this.pvpTargets.startAttack(row.candidate);
    }
  }

  startSpy(row: VicinityListRow | null): void {
    if (row?.candidate && this.canStartSpy(row)) {
      this.pvpTargets.startSpy(row.candidate);
    }
  }

  isRowActionDisabled(row: VicinityListRow, action: VicinityRowAction): boolean {
    if (action.disabled || !row.candidate) {
      return true;
    }

    if (action.kind === 'attack') {
      return !this.canStartAttack(row);
    }

    if (action.kind === 'spy') {
      return !this.canStartSpy(row);
    }

    return true;
  }

  isRowActionPrimary(row: VicinityListRow, action: VicinityRowAction): boolean {
    return action.primary && !this.isRowActionDisabled(row, action);
  }

  startRowAction(row: VicinityListRow, actionKind: VicinityRowActionKind): void {
    if (actionKind === 'attack') {
      this.startAttack(row);
      return;
    }

    if (actionKind === 'spy') {
      this.startSpy(row);
    }
  }

  isRowActionPending(row: VicinityListRow, action: VicinityRowAction): boolean {
    const targetHeroId = row.candidate?.targetHeroId;

    if (!targetHeroId) {
      return false;
    }

    if (action.kind === 'attack') {
      return this.pvpTargets.isAttackPending(targetHeroId);
    }

    if (action.kind === 'spy') {
      return this.pvpTargets.isSpyPending(targetHeroId);
    }

    return false;
  }

  confirmRelocation(): void {
    const selected = this.selectedRow();

    if (selected?.kind !== 'empty' || !this.page.selectedTarget()) {
      return;
    }

    this.confirmationService.confirm({
      header: 'Potwierdź przeprowadzkę',
      message: (
        'Przeniesiesz się na wybrany pusty adres. Stara posiadłość zostanie ' +
        'całkowicie zniszczona i zresetowana: aktywne poziomy, prace oraz postęp ' +
        'posiadłości nie zostaną zachowane. Nowa posiadłość powstanie w domyślnym ' +
        'stanie dla wskazanego adresu.'
      ),
      acceptLabel: 'Przeprowadź się',
      rejectLabel: 'Anuluj',
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.page.setDestructiveConfirmed(true);
        this.page.relocate();
      },
    });
  }

  private loadPvpTargetingMetadata(): void {
    this.pvpTargetingMetadataError.set(null);
    this.pvpTargetingMetadataLoaded.set(false);

    this.pvpUiMetadata.getNamespaceEntries(PVP_TARGETING_SECTION_METADATA_NAMESPACE)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (entries) => {
          this.pvpTargetingMetadata.set(entries);
          this.pvpTargetingMetadataLoaded.set(true);
        },
        error: (error: unknown) => {
          this.pvpTargetingMetadata.set([]);
          this.pvpTargetingMetadataError.set(
            getErrorMessage(error, 'Nie udało się wczytać opisów dostępności PvP.'),
          );
          this.pvpTargetingMetadataLoaded.set(true);
        },
      });
  }

  private bindControlsToState(): void {
    this.selectedDistrictControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        if (value) {
          this.searchFeedback.set(null);
          this.page.setSelectedDistrictCode(value);
          this.pvpTargets.setDistrictCode(value);
        }
      });

  }

  private syncControlsFromState(): void {
    effect(() => {
      this.syncDisabled(this.selectedDistrictControl, this.page.isLoading() || this.page.isRelocating());
    });

    effect(() => {
      const selectedDistrictCode = this.page.selectedDistrictCode();
      this.syncControl(this.selectedDistrictControl, selectedDistrictCode);

      if (selectedDistrictCode && this.pvpTargets.districtCode() !== selectedDistrictCode) {
        queueMicrotask(() => {
          if (
            this.page.selectedDistrictCode() === selectedDistrictCode
            && this.pvpTargets.districtCode() !== selectedDistrictCode
          ) {
            this.pvpTargets.setDistrictCode(selectedDistrictCode);
          }
        });
      }
    });
  }

  applySearch(): void {
    const search = normalizeVicinitySearch(this.pvpSearchControl.value);
    const addressSearch = parseVicinityAddressSearch(search);

    this.pvpTargets.setSearch(search);

    if (!search) {
      this.searchFeedback.set(null);
      return;
    }

    if (addressSearch) {
      this.applyAddressSearch(addressSearch);
      return;
    }

    this.pvpTargets.loadCandidates((candidates) => {
      if (normalizeVicinitySearch(this.pvpSearchControl.value) !== search) {
        return;
      }

      const target = candidates[0];

      if (!target) {
        this.searchFeedback.set('Nie znaleziono bohatera dla tej frazy.');
        return;
      }

      this.searchFeedback.set(null);
      this.page.focusAddress({
        districtCode: target.targetAddress.districtCode,
        addressNumber: target.targetAddress.addressNumber,
      });
      this.pvpTargets.setDistrictCode(target.targetAddress.districtCode);
    });
  }

  private applyAddressSearch(addressSearch: { districtCode: string; addressNumber: number }): void {
    const focused = this.page.focusAddress(addressSearch);

    if (!focused) {
      this.searchFeedback.set('Nie znaleziono takiego adresu w aktywnych dzielnicach.');
      return;
    }

    this.searchFeedback.set(null);
    this.pvpTargets.setDistrictCode(addressSearch.districtCode);
  }

  private syncVisibleOverlayFromRange(): void {
    effect(() => {
      const range = this.page.vicinityRange();

      if (!range) {
        return;
      }

      this.pvpTargets.loadVisibleAddressTargetOverlay({
        districtCode: range.district.districtCode,
        fromAddressNumber: range.fromAddressNumber,
        toAddressNumber: range.toAddressNumber,
      });
    });
  }

  private syncControl<T>(control: FormControl<T>, value: T): void {
    if (control.value === value) {
      return;
    }

    control.setValue(value, { emitEvent: false });
  }

  private syncDisabled<T>(control: FormControl<T>, shouldDisable: boolean): void {
    if (shouldDisable && control.enabled) {
      control.disable({ emitEvent: false });
      return;
    }

    if (!shouldDisable && control.disabled) {
      control.enable({ emitEvent: false });
    }
  }
}
