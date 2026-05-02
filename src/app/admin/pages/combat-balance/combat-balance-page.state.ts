import { Injectable, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import {
  CombatAdminBalanceData,
  CombatInitiativePreviewResult,
} from '../../../core/domain/combat/combat-admin-balance.model';
import { CombatInitiativeSlot } from '../../../core/domain/combat/combat-attack-plan.model';
import { CombatAdminBalanceService } from '../../../core/services/combat/combat-admin-balance';
import { getErrorMessage } from '../../../core/utils/error-message';

const EMPTY_DATA: CombatAdminBalanceData = {
  opponents: {
    families: [],
    opponents: [],
    statValues: [],
    attackSources: [],
    equipmentEntries: [],
    equipmentModes: [],
    equipmentSlots: [],
    stats: [],
    dictionaries: {
      sourceTypes: [],
      sides: [],
      outcomes: [],
      participantKinds: [],
      attackSourceKinds: [],
      candidateKinds: [],
    },
    opponentViews: [],
    emptyState: null,
  },
  trialCandidates: [],
  encounterCandidates: [],
  dictionaries: {
    sourceTypes: [],
    sides: [],
    outcomes: [],
    participantKinds: [],
    attackSourceKinds: [],
    candidateKinds: [],
    equipmentModes: [],
    equipmentSlots: [],
  },
};

@Injectable()
export class CombatBalancePageState {
  private readonly service = inject(CombatAdminBalanceService);

  readonly data = signal<CombatAdminBalanceData>(EMPTY_DATA);
  readonly isLoading = signal(false);
  readonly isPreviewLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly previewError = signal<string | null>(null);
  readonly initiativePreview = signal<CombatInitiativePreviewResult | null>(null);

  readonly form = new FormGroup({
    initiatorIntelligence: new FormControl(12, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    initiatorAgility: new FormControl(8, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    initiatorAttackCount: new FormControl(2, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
    defenderIntelligence: new FormControl(8, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    defenderAgility: new FormControl(10, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    defenderAttackCount: new FormControl(1, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
  });

  readonly initiativeRows = computed(() =>
    this.initiativePreview()?.plan.slots.map((slot) => ({
      ...slot,
      sideLabel: this.dictionaryLabel('sides', slot.side),
      sourceKindLabel: this.dictionaryLabel('attackSourceKinds', slot.source.kind),
    })) ?? [],
  );

  load(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.service.getData()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.data.set(data);
          this.previewInitiative();
        },
        error: (error: unknown) => {
          this.error.set(getErrorMessage(error, 'Failed to load combat balance data.'));
        },
      });
  }

  previewInitiative(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.previewError.set('Enter non-negative stats and at least one attack for each side.');
      return;
    }

    this.isPreviewLoading.set(true);
    this.previewError.set(null);

    this.service.previewInitiative(this.form.getRawValue())
      .pipe(finalize(() => this.isPreviewLoading.set(false)))
      .subscribe({
        next: (preview) => this.initiativePreview.set(preview),
        error: (error: unknown) => {
          this.previewError.set(getErrorMessage(error, 'Failed to preview initiative order.'));
        },
      });
  }

  sideLabel(slot: CombatInitiativeSlot): string {
    return this.dictionaryLabel('sides', slot.side);
  }

  dictionaryLabel(
    dictionary: keyof CombatAdminBalanceData['dictionaries'],
    key: string,
  ): string {
    const entry = this.data().dictionaries[dictionary].find((row) => row.key === key);
    return entry ? `${entry.label} (${entry.key})` : key;
  }
}
