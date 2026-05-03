import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { finalize } from 'rxjs';
import {
  CombatOpponentAdminData,
  CombatOpponentEquipmentModeReadModel,
} from '../../../core/domain/combat/combat-opponent.model';
import { CombatOpponentAdmin } from '../../../core/services/combat/combat-opponent-admin';
import {
  combatOpponentDefinitionOptions,
  combatOpponentEquipmentEntryModeOptions,
  combatOpponentEquipmentModeOptions,
  combatOpponentFamilyOptions,
  combatOpponentScalingFormulaOptions,
} from '../../../core/utils/combat-opponent-admin-options';
import { toCombatOpponentStatGridRows } from '../../../core/utils/combat-opponent-admin-mappers';
import { getErrorMessage } from '../../../core/utils/error-message';
import { RequestToken } from '../../../core/utils/request-token';
import { CombatOpponentsUiMetadata } from './combat-opponents-ui-metadata';

@Injectable()
export class CombatOpponentsPageState {
  private readonly admin = inject(CombatOpponentAdmin);
  private readonly destroyRef = inject(DestroyRef);
  private readonly loadToken = new RequestToken();

  readonly data = signal<CombatOpponentAdminData | null>(null);
  readonly selectedOpponentId = signal<string | null>(null);
  readonly selectedFamilyKey = signal<string | null>(null);
  readonly selectedAttackSourceId = signal<string | null>(null);
  readonly selectedEquipmentEntryId = signal<string | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  readonly opponentSelector = new FormControl<string | null>(null);
  readonly familySelector = new FormControl<string | null>(null);
  readonly attackSelector = new FormControl<string | null>(null);
  readonly equipmentSelector = new FormControl<string | null>(null);

  readonly uiMetadata = new CombatOpponentsUiMetadata(
    () => this.data()?.uiMetadataEntries ?? [],
    () => this.selectedOpponentView()?.opponent.label ?? null,
  );

  readonly selectedOpponentView = computed(() =>
    this.data()?.opponentViews.find((entry) =>
      entry.opponent.id === this.selectedOpponentId()
    ) ?? null
  );
  readonly selectedFamily = computed(() =>
    this.data()?.families.find((entry) => entry.key === this.selectedFamilyKey()) ?? null
  );
  readonly selectedAttackSource = computed(() =>
    this.selectedOpponentView()?.naturalAttacks.find((entry) =>
      entry.attack.id === this.selectedAttackSourceId()
    ) ?? null
  );
  readonly selectedEquipmentEntry = computed(() =>
    this.selectedOpponentView()?.equipmentEntries.find((entry) =>
      entry.entry.id === this.selectedEquipmentEntryId()
    ) ?? null
  );
  readonly statGridRows = computed(() => {
    const data = this.data();

    return data
      ? toCombatOpponentStatGridRows(data, this.selectedOpponentId())
      : [];
  });

  readonly familyOptions = computed(() => combatOpponentFamilyOptions(this.data()));
  readonly opponentOptions = computed(() => combatOpponentDefinitionOptions(this.data()));
  readonly equipmentModeOptions = computed(() => combatOpponentEquipmentModeOptions(this.data()));
  readonly equipmentEntryModeOptions = computed(() =>
    combatOpponentEquipmentEntryModeOptions(this.data()),
  );
  readonly formulaOptions = computed(() => combatOpponentScalingFormulaOptions(this.data()));
  readonly attackRowOptions = computed(() =>
    this.selectedOpponentView()?.naturalAttacks.map((entry) => ({
      label: `${entry.attack.label} (${entry.attack.key})`,
      value: entry.attack.id,
    })) ?? [],
  );
  readonly equipmentRowOptions = computed(() =>
    this.selectedOpponentView()?.equipmentEntries.map((entry) => ({
      label: `${entry.slotLabel}; ${entry.entryModeLabel}`,
      value: entry.entry.id,
    })) ?? [],
  );
  readonly missingUiMetadataGaps = computed(() => this.uiMetadata.missingGaps());
  readonly equipmentModeHelp = computed(() =>
    equipmentModeHelp(this.data()?.equipmentModes ?? [], this.selectedOpponentView()?.opponent.equipmentMode ?? null),
  );

  constructor() {
    this.opponentSelector.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((id) => this.selectOpponent(id));
    this.familySelector.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((key) => this.selectFamily(key));
    this.attackSelector.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((id) => this.selectAttack(id));
    this.equipmentSelector.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((id) => this.selectEquipment(id));
  }

  loadInitialData(): void {
    const token = this.loadToken.next();

    this.isLoading.set(true);
    this.error.set(null);
    this.admin.getAdminData()
      .pipe(
        finalize(() => {
          if (this.loadToken.isCurrent(token)) {
            this.isLoading.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (data) => {
          if (!this.loadToken.isCurrent(token)) {
            return;
          }

          this.data.set(data);
          this.syncSelection(data);
        },
        error: (error: unknown) => {
          if (this.loadToken.isCurrent(token)) {
            this.error.set(getErrorMessage(error, 'Failed to load combat opponents.'));
          }
        },
      });
  }

  selectOpponent(opponentId: string | null): void {
    this.selectedOpponentId.set(opponentId);
    this.setControlValue(this.opponentSelector, opponentId);
    this.selectAttack(this.selectedOpponentView()?.naturalAttacks[0]?.attack.id ?? null);
    this.selectEquipment(this.selectedOpponentView()?.equipmentEntries[0]?.entry.id ?? null);
  }

  selectFamily(familyKey: string | null): void {
    this.selectedFamilyKey.set(familyKey);
    this.setControlValue(this.familySelector, familyKey);
  }

  selectAttack(attackSourceId: string | null): void {
    this.selectedAttackSourceId.set(attackSourceId);
    this.setControlValue(this.attackSelector, attackSourceId);
  }

  selectEquipment(equipmentEntryId: string | null): void {
    this.selectedEquipmentEntryId.set(equipmentEntryId);
    this.setControlValue(this.equipmentSelector, equipmentEntryId);
  }

  setError(message: string | null): void {
    this.error.set(message);
  }

  private syncSelection(data: CombatOpponentAdminData): void {
    const selectedOpponentId = this.selectedOpponentId();
    const nextOpponentId =
      selectedOpponentId && data.opponents.some((entry) => entry.id === selectedOpponentId)
        ? selectedOpponentId
        : data.opponents[0]?.id ?? null;

    this.selectFamily(this.selectedFamilyKey() ?? data.families[0]?.key ?? null);
    this.selectOpponent(nextOpponentId);
  }

  private setControlValue(control: FormControl<string | null>, value: string | null): void {
    if (control.value !== value) {
      control.setValue(value, { emitEvent: false });
    }
  }
}

export function equipmentModeHelp(
  rows: CombatOpponentEquipmentModeReadModel[],
  key: string | null,
): string | null {
  const entry = rows.find((row) => row.key === key);

  return entry?.description ?? entry?.helperText ?? entry?.adminDescription ?? null;
}
