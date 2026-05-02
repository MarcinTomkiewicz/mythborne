import {
  DestroyRef,
  Injectable,
  WritableSignal,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { finalize } from 'rxjs';
import {
  RewardOutcomeKindReadModel,
  RewardProfileAdminData,
} from '../../../core/domain/exploration/exploration-reward.model';
import {
  REWARD_AMOUNT_MODE,
  REWARD_AMOUNT_MODE_NON_NUMERIC_FALLBACKS,
  REWARD_AMOUNT_MODE_NUMERIC_FALLBACKS,
  REWARD_AMOUNT_MODE_PVE_FALLBACKS,
  REWARD_ENTRY_KIND,
  REWARD_ENTRY_KIND_FALLBACKS,
  REWARD_SOURCE_KIND_FALLBACKS,
} from '../../../core/constants/reward-runtime-keys.const';
import { RewardProfileAdmin } from '../../../core/services/exploration/reward-profile-admin';
import {
  dictionaryHelp,
  dictionaryOptions,
  optionsFromValues,
} from '../../../core/utils/dictionary-options';
import { getErrorMessage } from '../../../core/utils/error-message';
import { trimText } from '../../../core/utils/normalize-text';
import { RequestToken } from '../../../core/utils/request-token';
import {
  resourceTypeDisplayLabel,
  resourceTypeDescription,
  toResourceTypeOptions,
} from '../../../core/utils/resource-type-options';
import { isRewardAmountFormulaScope } from '../../../core/utils/reward-formula-options';
import { toSlug } from '../../../core/utils/slug';
import { markReasonInvalid } from '../../../core/utils/admin-form-helpers';
import {
  createRewardEntryForm,
  createRewardOutcomeKindForm,
  createRewardProfileForm,
  entryFormValue,
  outcomeKindFormValue,
  profileFormValue,
} from './reward-profiles-forms';

@Injectable()
export class RewardProfilesPageState {
  private readonly admin = inject(RewardProfileAdmin);
  private readonly destroyRef = inject(DestroyRef);
  private readonly loadToken = new RequestToken();

  readonly rewardEntryKind = REWARD_ENTRY_KIND;
  readonly rewardAmountMode = REWARD_AMOUNT_MODE;
  readonly data = signal<RewardProfileAdminData | null>(null);
  readonly selectedProfileId = signal<string | null>(null);
  readonly selectedEntryId = signal<string | null>(null);
  readonly selectedOutcome = signal<{ sourceKind: string; key: string } | null>(null);
  readonly profileSelector = new FormControl<string | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  readonly profileForm = createRewardProfileForm();
  readonly entryForm = createRewardEntryForm();
  readonly outcomeForm = createRewardOutcomeKindForm();

  readonly profileOptions = computed(() =>
    (this.data()?.profiles ?? []).map((profile) => ({
      label: `${profile.label} (${profile.key})${profile.isActive ? '' : ' - inactive'}`,
      value: profile.id,
    })),
  );
  readonly selectedProfile = computed(() =>
    (this.data()?.profiles ?? []).find((profile) => profile.id === this.selectedProfileId()) ?? null,
  );
  readonly entriesForSelectedProfile = computed(() => {
    const profileId = this.selectedProfileId();

    return (this.data()?.entries ?? []).filter((entry) => entry.rewardProfileId === profileId);
  });
  readonly selectedEntry = computed(() =>
    this.entriesForSelectedProfile().find((entry) => entry.id === this.selectedEntryId()) ?? null,
  );
  readonly selectedOutcomeKind = computed(() => {
    const selected = this.selectedOutcome();

    return selected
      ? (this.data()?.outcomeKinds ?? []).find(
        (entry) => entry.sourceKind === selected.sourceKind && entry.key === selected.key,
      ) ?? null
      : null;
  });
  readonly categoryOptions = computed(() =>
    optionsFromValues([
      ...REWARD_SOURCE_KIND_FALLBACKS,
      ...(this.data()?.profiles ?? []).map((profile) => profile.category),
    ]),
  );
  readonly sourceKindOptions = computed(() =>
    dictionaryOptions(
      this.data()?.sourceKinds ?? [],
      [
        ...REWARD_SOURCE_KIND_FALLBACKS,
        ...(this.data()?.outcomeKinds ?? []).map((outcome) => outcome.sourceKind),
      ],
    ),
  );
  readonly qualityOptions = computed(() =>
    (this.data()?.qualities ?? []).map((quality) => ({
      label: `${quality.label} (${quality.key})${quality.isEnabled ? '' : ' - disabled'}`,
      value: quality.key,
    })),
  );
  readonly bucketProfileOptions = computed(() =>
    (this.data()?.bucketProfiles ?? []).map((profile) => ({
      label: `${profile.name} (${profile.key})${profile.isActive ? '' : ' - inactive'}`,
      value: profile.id,
    })),
  );
  readonly effectDefinitionOptions = computed(() =>
    (this.data()?.effectDefinitions ?? []).map((effect) => ({
      label: `${effect.label} (${effect.key}, ${effect.effectKind})${effect.isActive ? '' : ' - inactive'}`,
      value: effect.id,
    })),
  );
  readonly formulaOptions = computed(() => [
    { label: 'No formula', value: null },
    ...(this.data()?.formulas ?? [])
      .filter((formula) => isRewardAmountFormulaScope(formula.scopeKey))
      .map((formula) => ({
        label: `${formula.label} (${formula.key})${formula.isEnabled ? '' : ' - disabled'}`,
        value: formula.id,
      })),
  ]);
  readonly resourceTypeOptions = computed(() => {
    const data = this.data();
    const referenced = (data?.entries ?? [])
      .map((entry) => entry.resourceType)
      .filter((value): value is string => !!value);

    return toResourceTypeOptions(data?.resourceTypes ?? [], referenced);
  });
  readonly hasResourceTypeDictionary = computed(() => (this.data()?.resourceTypes.length ?? 0) > 0);
  readonly entryKindOptions = computed(() =>
    dictionaryOptions(this.data()?.entryKinds ?? [], REWARD_ENTRY_KIND_FALLBACKS),
  );
  readonly amountModeOptions = computed(() =>
    dictionaryOptions(
      (this.data()?.amountModes ?? []).filter((mode) =>
        mode.key !== REWARD_AMOUNT_MODE.transferFormula &&
        mode.key !== REWARD_AMOUNT_MODE.none,
      ),
      REWARD_AMOUNT_MODE_PVE_FALLBACKS,
    ),
  );
  readonly hasEntryKindDictionary = computed(() => (this.data()?.entryKinds.length ?? 0) > 0);
  readonly hasAmountModeDictionary = computed(() => (this.data()?.amountModes.length ?? 0) > 0);
  readonly hasSourceKindDictionary = computed(() => (this.data()?.sourceKinds.length ?? 0) > 0);

  constructor() {
    this.profileSelector.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((profileId) => this.selectProfile(profileId));

    this.profileForm.controls.label.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((label) => this.syncKeyFromLabel(this.profileForm, label));

    this.entryForm.controls.entryKind.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((entryKind) => this.syncAmountModeForEntryKind(entryKind));
  }

  loadInitialData(): void {
    const token = this.loadToken.next();

    this.isLoading.set(true);
    this.error.set(null);
    this.admin.getAdminData()
      .pipe(finalize(() => this.loadToken.isCurrent(token) && this.isLoading.set(false)))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          if (this.loadToken.isCurrent(token)) {
            this.data.set(data);
            this.syncSelectedProfile(data);
          }
        },
        error: (error: unknown) => {
          if (this.loadToken.isCurrent(token)) {
            this.error.set(getErrorMessage(error, 'Failed to load reward profile data.'));
          }
        },
      });
  }

  selectProfile(profileId: string | null): void {
    this.selectedProfileId.set(profileId);
    this.selectedEntryId.set(null);
    this.profileForm.patchValue(profileFormValue(this.selectedProfile()), { emitEvent: false });
    this.entryForm.patchValue(entryFormValue(null), { emitEvent: false });

    if (this.profileSelector.value !== profileId) {
      this.profileSelector.setValue(profileId, { emitEvent: false });
    }
  }

  selectEntry(entryId: string | null): void {
    this.selectedEntryId.set(entryId);
    this.entryForm.patchValue(entryFormValue(this.selectedEntry()), { emitEvent: false });
  }

  selectOutcome(row: RewardOutcomeKindReadModel): void {
    this.selectedOutcome.set({ sourceKind: row.sourceKind, key: row.key });
    this.outcomeForm.patchValue(outcomeKindFormValue(row), { emitEvent: false });
  }

  markInvalidProfile(
    reasonError: WritableSignal<string | null>,
    form: typeof this.profileForm | typeof this.outcomeForm,
  ): boolean {
    const controls = form.controls;
    const invalidReason = markReasonInvalid(reasonError, controls.reason);

    controls.key.markAsTouched();
    controls.label.markAsTouched();
    controls.description.markAsTouched();

    return invalidReason || controls.key.invalid || controls.label.invalid || controls.description.invalid;
  }

  resourceTypeLabel(resourceType: string | null): string {
    return resourceType
      ? resourceTypeDisplayLabel(this.data()?.resourceTypes ?? [], resourceType)
      : '-';
  }

  resourceTypeHelp(resourceType: string | null): string | null {
    return resourceType
      ? resourceTypeDescription(this.data()?.resourceTypes ?? [], resourceType)
      : null;
  }

  entryKindHelp(entryKind: string | null): string | null {
    return dictionaryHelp(this.data()?.entryKinds ?? [], entryKind);
  }

  amountModeHelp(amountMode: string | null): string | null {
    return dictionaryHelp(this.data()?.amountModes ?? [], amountMode);
  }

  amountModeOptionsForEntryKind(entryKind: string | null) {
    const modes = (this.data()?.amountModes ?? []).filter(
      (mode) => mode.key !== REWARD_AMOUNT_MODE.transferFormula,
    );

    return this.isNumericEntryKind(entryKind)
      ? dictionaryOptions(
        modes.filter((mode) => mode.key !== REWARD_AMOUNT_MODE.none),
        REWARD_AMOUNT_MODE_NUMERIC_FALLBACKS,
      )
      : dictionaryOptions(
        modes.filter((mode) => mode.key === REWARD_AMOUNT_MODE.none),
        REWARD_AMOUNT_MODE_NON_NUMERIC_FALLBACKS,
      );
  }

  isNumericEntryKind(entryKind: string | null): boolean {
    return entryKind === REWARD_ENTRY_KIND.experience ||
      entryKind === REWARD_ENTRY_KIND.characterPoints ||
      entryKind === REWARD_ENTRY_KIND.resource;
  }

  sourceKindHelp(sourceKind: string | null): string | null {
    return dictionaryHelp(this.data()?.sourceKinds ?? [], sourceKind);
  }

  private syncKeyFromLabel(
    form: typeof this.profileForm | typeof this.outcomeForm,
    label: string,
  ): void {
    const isExisting = form === this.profileForm
      ? !!form.controls.rewardProfileId.value
      : !!this.selectedOutcome();

    if (isExisting || form.controls.allowKeyOverride.value || !trimText(label)) {
      return;
    }

    form.controls.key.setValue(toSlug(label), { emitEvent: false });
  }

  private syncSelectedProfile(data: RewardProfileAdminData): void {
    const selected = this.selectedProfileId();

    if (selected && data.profiles.some((profile) => profile.id === selected)) {
      this.selectProfile(selected);
      return;
    }

    this.selectProfile(data.profiles[0]?.id ?? null);
  }

  private syncAmountModeForEntryKind(entryKind: string): void {
    const nextMode = this.isNumericEntryKind(entryKind)
      ? this.entryForm.controls.amountMode.value === REWARD_AMOUNT_MODE.none
        ? REWARD_AMOUNT_MODE.fixed
        : this.entryForm.controls.amountMode.value
      : REWARD_AMOUNT_MODE.none;

    if (this.entryForm.controls.amountMode.value !== nextMode) {
      this.entryForm.controls.amountMode.setValue(nextMode, { emitEvent: false });
    }
  }
}
