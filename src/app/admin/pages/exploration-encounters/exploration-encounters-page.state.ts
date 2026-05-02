import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { finalize } from 'rxjs';
import {
  ENCOUNTER_KIND,
} from '../../../core/constants/encounter-runtime-keys.const';
import {
  REWARD_ASSIGNMENT_MATCH_KIND_FALLBACKS,
  REWARD_SOURCE_KIND,
} from '../../../core/constants/reward-runtime-keys.const';
import { ExplorationEncounterAdminData } from '../../../core/domain/exploration/exploration-encounter-admin.model';
import { ExplorationEncounterAdmin } from '../../../core/services/exploration/exploration-encounter-admin';
import {
  dictionaryHelp,
  dictionaryOptions,
} from '../../../core/utils/dictionary-options';
import { getErrorMessage } from '../../../core/utils/error-message';
import {
  toEncounterCombatCandidateAdminViews,
  toEncounterDefinitionAdminView,
  toGlobalEncounterRewardAssignmentAdminViews,
  toEncounterRewardAssignmentAdminViews,
} from '../../../core/utils/exploration-encounter-admin-mappers';
import {
  toEncounterEffectPayloadAdminViews,
  toEncounterResourcePayloadAdminViews,
  toExplorationEffectDefinitionAdminViews,
} from '../../../core/utils/exploration-encounter-payload-admin-mappers';
import {
  amountModeOptions,
  bonusTemplateOptions,
  districtOptions,
  encounterKindOptions,
  encounterOutcomeKindOptions,
  encounterSelectorOptions,
  ENCOUNTER_CANDIDATE_KIND_OPTIONS,
  EXPLORATION_EFFECT_KIND_OPTIONS,
  familyOptions,
  formulaOptions,
  minigameOptions,
  opponentOptions,
  payloadFormulaOptions,
  requiredRewardProfileOptions,
  rewardProfileOptions,
  difficultyOptions,
} from '../../../core/utils/exploration-encounter-admin-options';
import { RequestToken } from '../../../core/utils/request-token';
import {
  resourceTypeDescription,
  toResourceTypeOptions,
} from '../../../core/utils/resource-type-options';
import { ExplorationEncounterUiMetadata } from './exploration-encounter-ui-metadata';

@Injectable()
export class ExplorationEncountersPageState {
  private readonly admin = inject(ExplorationEncounterAdmin);
  private readonly destroyRef = inject(DestroyRef);
  private readonly loadToken = new RequestToken();

  readonly encounterKind = ENCOUNTER_KIND;
  readonly data = signal<ExplorationEncounterAdminData | null>(null);
  readonly selectedEncounterId = signal<string | null>(null);
  readonly encounterSelector = new FormControl<string | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly uiMetadata = new ExplorationEncounterUiMetadata(
    () => this.data()?.uiMetadataEntries ?? [],
    () => this.selectedEncounter()?.encounter.label ?? null,
  );

  readonly encounterOptions = computed(() => encounterSelectorOptions(this.data()));
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
  readonly globalRewardAssignments = computed(() => {
    const data = this.data();

    return data ? toGlobalEncounterRewardAssignmentAdminViews(data) : [];
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
  readonly encounterKindOptions = computed(() => encounterKindOptions(this.data()));
  readonly minigameOptions = computed(() => minigameOptions(this.data()));
  readonly difficultyOptions = computed(() => difficultyOptions(this.data()));
  readonly rewardMatchKindOptions = computed(() =>
    dictionaryOptions(
      this.data()?.rewardAssignmentMatchKinds ?? [],
      REWARD_ASSIGNMENT_MATCH_KIND_FALLBACKS,
    ),
  );
  readonly hasRewardMatchKindDictionary = computed(() =>
    (this.data()?.rewardAssignmentMatchKinds ?? []).some((entry) => entry.isActive),
  );
  readonly hasRewardEntryDictionaries = computed(() =>
    (this.data()?.rewardEntryKinds ?? []).some((entry) => entry.isActive) &&
    (this.data()?.rewardEntryAmountModes ?? []).some((entry) => entry.isActive),
  );
  readonly encounterRewardSourceHelp = computed(() => {
    const sourceKind = (this.data()?.rewardSourceKinds ?? []).find(
      (entry) => entry.key === REWARD_SOURCE_KIND.encounter,
    );

    return sourceKind?.description ?? sourceKind?.helperText ?? sourceKind?.adminDescription ?? null;
  });
  readonly districtOptions = computed(() => districtOptions(this.data()));
  readonly rewardProfileOptions = computed(() => rewardProfileOptions(this.data()));
  readonly requiredRewardProfileOptions = computed(() => requiredRewardProfileOptions(this.data()));
  readonly hasRewardProfiles = computed(() => this.requiredRewardProfileOptions().length > 0);
  readonly hasDbEncounterOutcomeKinds = computed(() =>
    (this.data()?.rewardOutcomeKinds ?? []).some(
      (entry) => entry.sourceKind === REWARD_SOURCE_KIND.encounter && entry.isActive,
    ),
  );
  readonly outcomeKindOptions = computed(() => encounterOutcomeKindOptions(this.data()));
  readonly candidateKindOptions = ENCOUNTER_CANDIDATE_KIND_OPTIONS;
  readonly opponentOptions = computed(() => opponentOptions(this.data()));
  readonly familyOptions = computed(() => familyOptions(this.data()));
  readonly formulaOptions = computed(() => formulaOptions(this.data()));
  readonly payloadFormulaOptions = computed(() => payloadFormulaOptions(this.data()));
  readonly bonusTemplateOptions = computed(() => bonusTemplateOptions(this.data()));
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
  readonly amountModeOptions = computed(() => amountModeOptions(this.data()));
  readonly effectKindOptions = EXPLORATION_EFFECT_KIND_OPTIONS;
  readonly hasResourceTypeDictionary = computed(() => (this.data()?.resourceTypes.length ?? 0) > 0);
  readonly resourceTypeOptions = computed(() => {
    const data = this.data();
    const referenced = (data?.resourcePayloads ?? []).map((entry) => entry.resourceType);

    return toResourceTypeOptions(data?.resourceTypes ?? [], referenced);
  });
  readonly missingUiMetadataGaps = computed(() => this.uiMetadata.missingGaps());

  rewardMatchKindHelp(matchKind: string | null): string | null {
    return dictionaryHelp(this.data()?.rewardAssignmentMatchKinds ?? [], matchKind);
  }

  outcomeKindHelp(outcomeKind: string | null): string | null {
    const data = this.data();
    const entry = (data?.rewardOutcomeKinds ?? []).find(
      (row) => row.sourceKind === REWARD_SOURCE_KIND.encounter && row.key === outcomeKind,
    );

    return entry?.description ?? entry?.helperText ?? entry?.adminDescription ?? null;
  }

  amountModeHelp(amountMode: string | null): string | null {
    return dictionaryHelp(this.data()?.rewardEntryAmountModes ?? [], amountMode);
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
