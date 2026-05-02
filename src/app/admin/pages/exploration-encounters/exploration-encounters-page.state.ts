import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { finalize } from 'rxjs';
import {
  COMBAT_CANDIDATE_KIND,
  ENCOUNTER_KIND,
  ENCOUNTER_KIND_FALLBACKS,
  EXPLORATION_EFFECT_KIND_FALLBACKS,
} from '../../../core/constants/encounter-runtime-keys.const';
import {
  ENCOUNTER_REWARD_OUTCOME_KIND_FALLBACKS,
  REWARD_AMOUNT_MODE_PVE_FALLBACKS,
  REWARD_ASSIGNMENT_MATCH_KIND_FALLBACKS,
  REWARD_SOURCE_KIND,
} from '../../../core/constants/reward-runtime-keys.const';
import { ExplorationEncounterAdminData } from '../../../core/domain/exploration/exploration-encounter-admin.model';
import { ExplorationEncounterAdmin } from '../../../core/services/exploration/exploration-encounter-admin';
import {
  dictionaryHelp,
  dictionaryOptions,
  labelFromKey,
  optionsFromValues,
} from '../../../core/utils/dictionary-options';
import { getErrorMessage } from '../../../core/utils/error-message';
import {
  toEncounterCombatCandidateAdminViews,
  toEncounterDefinitionAdminView,
  toEncounterRewardAssignmentAdminViews,
} from '../../../core/utils/exploration-encounter-admin-mappers';
import {
  toEncounterEffectPayloadAdminViews,
  toEncounterResourcePayloadAdminViews,
  toExplorationEffectDefinitionAdminViews,
} from '../../../core/utils/exploration-encounter-payload-admin-mappers';
import { RequestToken } from '../../../core/utils/request-token';
import {
  resourceTypeDescription,
  toResourceTypeOptions,
} from '../../../core/utils/resource-type-options';
import { isExplorationPayloadFormulaScope } from '../../../core/utils/reward-formula-options';

@Injectable()
export class ExplorationEncountersPageState {
  private readonly admin = inject(ExplorationEncounterAdmin);
  private readonly destroyRef = inject(DestroyRef);
  private readonly loadToken = new RequestToken();

  readonly encounterKind = ENCOUNTER_KIND;
  readonly rewardAmountModeOptions = optionsFromValues(REWARD_AMOUNT_MODE_PVE_FALLBACKS);
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
  readonly resourcePayloads = computed(() => {
    const data = this.data();
    const encounterId = this.selectedEncounterId();

    return data && encounterId ? toEncounterResourcePayloadAdminViews(data, encounterId) : [];
  });
  readonly effectPayloads = computed(() => {
    const data = this.data();
    const encounterId = this.selectedEncounterId();

    return data && encounterId ? toEncounterEffectPayloadAdminViews(data, encounterId) : [];
  });
  readonly effectDefinitions = computed(() => {
    const data = this.data();
    const encounterKind = this.selectedEncounter()?.encounter.encounterKind ?? null;
    const kind = encounterKind === ENCOUNTER_KIND.buff || encounterKind === ENCOUNTER_KIND.debuff
      ? encounterKind
      : null;

    return data ? toExplorationEffectDefinitionAdminViews(data, kind) : [];
  });
  readonly hasEncounters = computed(() => (this.data()?.encounters.length ?? 0) > 0);
  readonly canEditCombatCandidates = computed(
    () => this.selectedEncounter()?.isCombatEncounter ?? false,
  );
  readonly encounterKindOptions = computed(() => {
    const existing = new Set((this.data()?.encounters ?? []).map((entry) => entry.encounterKind));
    ENCOUNTER_KIND_FALLBACKS.forEach((kind) => existing.add(kind));

    return Array.from(existing).sort().map((kind) => ({
      label: labelFromKey(kind),
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
  readonly rewardMatchKindOptions = computed(() =>
    dictionaryOptions(
      this.data()?.rewardAssignmentMatchKinds ?? [],
      REWARD_ASSIGNMENT_MATCH_KIND_FALLBACKS,
    ),
  );
  readonly hasRewardMatchKindDictionary = computed(() =>
    (this.data()?.rewardAssignmentMatchKinds ?? []).some((entry) => entry.isActive),
  );
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
  readonly hasRewardProfiles = computed(() => this.requiredRewardProfileOptions().length > 0);
  readonly hasDbEncounterOutcomeKinds = computed(() =>
    (this.data()?.rewardOutcomeKinds ?? []).some(
      (entry) => entry.sourceKind === REWARD_SOURCE_KIND.encounter && entry.isActive,
    ),
  );
  readonly outcomeKindOptions = computed(() => {
    const options = (this.data()?.rewardOutcomeKinds ?? [])
      .filter((entry) => entry.sourceKind === REWARD_SOURCE_KIND.encounter && entry.isActive)
      .map((entry) => ({
        label: `${entry.label} (${entry.key})`,
        value: entry.key,
      }));

    return options.length > 0
      ? options
      : ENCOUNTER_REWARD_OUTCOME_KIND_FALLBACKS.map((kind) => ({
        label: `${labelFromKey(kind)} (${kind})`,
        value: kind,
      }));
  });
  readonly candidateKindOptions = [
    { label: 'Concrete opponent', value: COMBAT_CANDIDATE_KIND.opponent },
    { label: 'Opponent family', value: COMBAT_CANDIDATE_KIND.family },
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
  readonly payloadFormulaOptions = computed(() => [
    { label: 'No formula', value: null },
    ...(this.data()?.formulas ?? [])
      .filter((entry) => isExplorationPayloadFormulaScope(entry.scopeKey))
      .map((entry) => ({
      label: `${entry.label} (${entry.key})${entry.isEnabled ? '' : ' - disabled'}`,
      value: entry.id,
    })),
  ]);
  readonly bonusTemplateOptions = computed(() => [
    { label: 'No bonus template', value: null },
    ...(this.data()?.bonusTemplates ?? []).map((entry) => ({
      label: `${entry.label} (${entry.key})${entry.isActive ? '' : ' - inactive'}`,
      value: entry.id,
    })),
  ]);
  readonly effectDefinitionOptions = computed(() => {
    const encounterKind = this.selectedEncounter()?.encounter.encounterKind;
    const effects = this.data()?.effectDefinitions ?? [];

    return effects
      .filter((entry) => entry.effectKind === encounterKind)
      .map((entry) => ({
        label: `${entry.label} (${entry.key})${entry.isActive ? '' : ' - inactive'}`,
        value: entry.id,
      }));
  });
  readonly amountModeOptions = this.rewardAmountModeOptions;
  readonly effectKindOptions = optionsFromValues(EXPLORATION_EFFECT_KIND_FALLBACKS);
  readonly hasResourceTypeDictionary = computed(() => (this.data()?.resourceTypes.length ?? 0) > 0);
  readonly resourceTypeOptions = computed(() => {
    const data = this.data();
    const referenced = (data?.resourcePayloads ?? []).map((entry) => entry.resourceType);

    return toResourceTypeOptions(data?.resourceTypes ?? [], referenced);
  });

  rewardMatchKindHelp(matchKind: string | null): string | null {
    return dictionaryHelp(this.data()?.rewardAssignmentMatchKinds ?? [], matchKind);
  }

  resourceTypeHelp(resourceType: string | null): string | null {
    return resourceType
      ? resourceTypeDescription(this.data()?.resourceTypes ?? [], resourceType)
      : null;
  }

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
