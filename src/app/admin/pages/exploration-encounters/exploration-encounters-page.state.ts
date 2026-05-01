import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { finalize } from 'rxjs';
import { ExplorationEncounterAdminData } from '../../../core/domain/exploration/exploration-encounter-admin.model';
import { ExplorationEncounterAdmin } from '../../../core/services/exploration/exploration-encounter-admin';
import { getErrorMessage } from '../../../core/utils/error-message';
import {
  toEncounterCombatCandidateAdminViews,
  toEncounterDefinitionAdminView,
  toEncounterRewardAssignmentAdminViews,
} from '../../../core/utils/exploration-encounter-admin-mappers';
import { RequestToken } from '../../../core/utils/request-token';

@Injectable()
export class ExplorationEncountersPageState {
  private readonly admin = inject(ExplorationEncounterAdmin);
  private readonly destroyRef = inject(DestroyRef);
  private readonly loadToken = new RequestToken();

  readonly data = signal<ExplorationEncounterAdminData | null>(null);
  readonly selectedEncounterId = signal<string | null>(null);
  readonly encounterSelector = new FormControl<string | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  readonly encounterOptions = computed(() =>
    (this.data()?.encounters ?? []).map((encounter) => ({
      label: `${encounter.label} (${encounter.key})${encounter.isActive ? '' : ' - inactive'}`,
      value: encounter.id,
    })),
  );
  readonly selectedEncounter = computed(() => {
    const data = this.data();
    const encounterId = this.selectedEncounterId();

    return data && encounterId ? toEncounterDefinitionAdminView(data, encounterId) : null;
  });
  readonly combatCandidates = computed(() => {
    const data = this.data();
    const encounterId = this.selectedEncounterId();

    return data && encounterId ? toEncounterCombatCandidateAdminViews(data, encounterId) : [];
  });
  readonly rewardAssignments = computed(() => {
    const data = this.data();
    const encounterId = this.selectedEncounterId();

    return data && encounterId ? toEncounterRewardAssignmentAdminViews(data, encounterId) : [];
  });
  readonly hasEncounters = computed(() => (this.data()?.encounters.length ?? 0) > 0);
  readonly canEditCombatCandidates = computed(
    () => this.selectedEncounter()?.isCombatEncounter ?? false,
  );
  readonly encounterKindOptions = computed(() => {
    const existing = new Set((this.data()?.encounters ?? []).map((entry) => entry.encounterKind));
    ['combat', 'resource', 'buff', 'debuff'].forEach((kind) => existing.add(kind));

    return Array.from(existing).sort().map((kind) => ({
      label: kindLabel(kind),
      value: kind,
    }));
  });
  readonly minigameOptions = computed(() => [
    { label: 'No minigame', value: null },
    ...(this.data()?.minigames ?? []).map((entry) => ({
      label: `${entry.label} (${entry.key})${entry.isActive ? '' : ' - inactive'}`,
      value: entry.key,
    })),
  ]);
  readonly difficultyOptions = computed(() => [
    { label: 'Any difficulty', value: null },
    ...(this.data()?.difficulties ?? []).map((entry) => ({
      label: `${entry.label} (${entry.key})${entry.isActive ? '' : ' - inactive'}`,
      value: entry.key,
    })),
  ]);
  readonly districtOptions = computed(() => [
    { label: 'Any district', value: null },
    ...(this.data()?.districts ?? []).map((entry) => ({
      label: `${entry.name} (${entry.code})`,
      value: entry.code,
    })),
  ]);
  readonly rewardProfileOptions = computed(() => [
    { label: 'No direct reward profile', value: null },
    ...(this.data()?.rewardProfiles ?? []).map((entry) => ({
      label: `${entry.label} (${entry.key})${entry.isActive ? '' : ' - inactive'}`,
      value: entry.id,
    })),
  ]);
  readonly requiredRewardProfileOptions = computed(() =>
    (this.data()?.rewardProfiles ?? []).map((entry) => ({
      label: `${entry.label} (${entry.key})${entry.isActive ? '' : ' - inactive'}`,
      value: entry.id,
    })),
  );
  readonly candidateKindOptions = [
    { label: 'Concrete opponent', value: 'opponent' },
    { label: 'Opponent family', value: 'family' },
  ];
  readonly opponentOptions = computed(() =>
    (this.data()?.opponents ?? []).map((entry) => ({
      label: `${entry.label} (${entry.key})${entry.isActive ? '' : ' - inactive'}`,
      value: entry.id,
    })),
  );
  readonly familyOptions = computed(() =>
    (this.data()?.families ?? []).map((entry) => ({
      label: `${entry.label} (${entry.key})${entry.isActive ? '' : ' - inactive'}`,
      value: entry.key,
    })),
  );
  readonly formulaOptions = computed(() => [
    { label: 'Default combat scaling', value: null },
    ...(this.data()?.formulas ?? []).map((entry) => ({
      label: `${entry.label} (${entry.key})${entry.isEnabled ? '' : ' - disabled'}`,
      value: entry.id,
    })),
  ]);

  constructor() {
    this.encounterSelector.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((encounterId) => this.selectEncounter(encounterId));
  }

  loadInitialData(): void {
    const token = this.loadToken.next();

    this.isLoading.set(true);
    this.error.set(null);
    this.admin
      .getAdminData()
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
          this.syncSelectedEncounter(data);
        },
        error: (error: unknown) => {
          if (!this.loadToken.isCurrent(token)) {
            return;
          }

          this.error.set(getErrorMessage(error, 'Failed to load encounter definitions.'));
        },
      });
  }

  selectEncounter(encounterId: string | null): void {
    this.selectedEncounterId.set(encounterId);

    if (this.encounterSelector.value !== encounterId) {
      this.encounterSelector.setValue(encounterId, { emitEvent: false });
    }
  }

  private syncSelectedEncounter(data: ExplorationEncounterAdminData): void {
    const selected = this.selectedEncounterId();

    if (selected && data.encounters.some((encounter) => encounter.id === selected)) {
      this.selectEncounter(selected);
      return;
    }

    this.selectEncounter(data.encounters[0]?.id ?? null);
  }
}

function kindLabel(kind: string): string {
  return kind
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ') || kind;
}
