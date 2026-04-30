import { DestroyRef, computed, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs';
import { AntiAbuseCaseReadModel } from '../../domain/anti-abuse/anti-abuse-case.model';
import { AntiAbuseSanctionTypeEntry } from '../../domain/anti-abuse/anti-abuse-dictionary.model';
import {
  CreatedSanctionWorkflowResult,
  CreateSanctionWorkflowRequest,
} from '../../domain/anti-abuse/anti-abuse-sanction-create.model';
import {
  ModerationHeroTarget,
  ModerationItemTarget,
} from '../../domain/moderation/moderation-action.model';
import { AntiAbuseCaseTargetSearchEvent } from '../../types/anti-abuse-case-target-search.types';
import { AntiAbuseSanctionCreateForm } from '../../types/forms/anti-abuse-sanction-create-form.types';
import {
  createAntiAbuseSanctionFormModel,
  requiredSanctionFormFieldKeys,
  visibleSanctionFormFields,
} from '../../utils/anti-abuse-sanction-form';
import { trimText, trimToNull } from '../../utils/normalize-text';
import { ModerationActions } from '../moderation/moderation-actions';
import { ModerationItemTargetSearchState } from '../moderation/moderation-item-target-search.state';
import { AntiAbuseCaseTargetSearchState } from './anti-abuse-case-target-search.state';
import { AntiAbuseSanctionCreateWorkflow } from './anti-abuse-sanction-create-workflow';

export class AntiAbuseCaseSanctionCreateState {
  private activeContextKey: string | null = null;
  private activeRequestContext: { caseId: string; serverId: string } | null = null;

  readonly isSaving = signal(false);
  readonly error = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly selectedSanctionType = signal<AntiAbuseSanctionTypeEntry | null>(null);
  readonly form: AntiAbuseSanctionCreateForm = new FormGroup({
    sanctionTypeKey: new FormControl<string | null>(null, Validators.required),
    reason: new FormControl<string | null>(null, Validators.required),
    targetHeroId: new FormControl<string | null>(null, Validators.required),
    targetUserId: new FormControl<string | null>(null, Validators.required),
    sourceHeroId: new FormControl<string | null>(null),
    durationDays: new FormControl<number | null>(null),
    amountCharacterPoints: new FormControl<number | null>(null),
    operatorNotes: new FormControl<string | null>(null),
  });
  readonly targetSearch: AntiAbuseCaseTargetSearchState;
  readonly sourceSearch: AntiAbuseCaseTargetSearchState;
  readonly itemSearch: ModerationItemTargetSearchState;
  readonly formModel = computed(() => {
    const sanctionType = this.selectedSanctionType();
    return sanctionType ? createAntiAbuseSanctionFormModel(sanctionType) : null;
  });
  readonly visibleFieldKeys = computed(() => {
    const model = this.formModel();
    return model ? visibleSanctionFormFields(model).map((field) => field.key) : [];
  });

  constructor(
    private readonly workflow: AntiAbuseSanctionCreateWorkflow,
    moderationActions: ModerationActions,
    private readonly destroyRef: DestroyRef,
    private readonly currentCase: () => AntiAbuseCaseReadModel,
    private readonly emitCreated: (result: CreatedSanctionWorkflowResult) => void,
  ) {
    this.targetSearch = new AntiAbuseCaseTargetSearchState(
      moderationActions,
      destroyRef,
      {
        setParticipantHeroId: (heroId) =>
          this.form.controls.targetHeroId.setValue(heroId),
        setParticipantUserId: (userId) =>
          this.form.controls.targetUserId.setValue(userId),
        setError: (message) => this.error.set(message),
      },
    );
    this.sourceSearch = new AntiAbuseCaseTargetSearchState(
      moderationActions,
      destroyRef,
      {
        setParticipantHeroId: (heroId) =>
          this.form.controls.sourceHeroId.setValue(heroId),
        setParticipantUserId: () => undefined,
        setError: (message) => this.error.set(message),
      },
    );
    this.itemSearch = new ModerationItemTargetSearchState(
      moderationActions,
      destroyRef,
      (message) => this.error.set(message),
    );
  }

  syncContext(
    caseItem: AntiAbuseCaseReadModel,
    sanctionTypes: readonly AntiAbuseSanctionTypeEntry[],
    canTriageAntiAbuse: boolean,
  ): void {
    const contextKey = `${caseItem.serverId}:${caseItem.id}:${canTriageAntiAbuse}`;

    if (contextKey !== this.activeContextKey) {
      this.activeContextKey = contextKey;
      this.resetForNewContext();
    }

    this.targetSearch.loadAccess(caseItem.serverId, canTriageAntiAbuse);
    this.sourceSearch.loadAccess(caseItem.serverId, canTriageAntiAbuse);
    this.syncSanctionType(sanctionTypes, false);
  }

  onSanctionTypeChange(sanctionTypes: readonly AntiAbuseSanctionTypeEntry[]): void {
    this.syncSanctionType(sanctionTypes, true);
  }

  searchTargetHeroes(event: AntiAbuseCaseTargetSearchEvent): void {
    const caseItem = this.currentCase();
    this.targetSearch.searchHeroTargets(
      event,
      caseItem.serverId,
      this.targetSearch.canSearchTargets(),
    );
  }

  searchSourceHeroes(event: AntiAbuseCaseTargetSearchEvent): void {
    const caseItem = this.currentCase();
    this.sourceSearch.searchHeroTargets(
      event,
      caseItem.serverId,
      this.sourceSearch.canSearchTargets(),
    );
  }

  searchItems(event: AntiAbuseCaseTargetSearchEvent): void {
    const caseItem = this.currentCase();
    this.itemSearch.searchItemTargets(
      event,
      caseItem.serverId,
      this.targetSearch.canSearchTargets(),
    );
  }

  selectTargetHero(target: ModerationHeroTarget): void {
    this.form.patchValue({
      targetHeroId: target.heroId,
      targetUserId: target.userId,
    });
  }

  clearTargetHero(): void {
    this.form.patchValue({
      targetHeroId: null,
      targetUserId: null,
    });
    this.targetSearch.clearHeroTarget();
  }

  selectSourceHero(target: ModerationHeroTarget): void {
    this.form.controls.sourceHeroId.setValue(target.heroId);
  }

  clearSourceHero(): void {
    this.form.controls.sourceHeroId.setValue(null);
    this.sourceSearch.clearHeroTarget();
  }

  selectItem(target: ModerationItemTarget): void {
    this.itemSearch.selectItemTarget(target);
  }

  removeItem(itemId: string): void {
    this.itemSearch.removeItemTarget(itemId);
  }

  submit(): void {
    const caseItem = this.currentCase();
    this.error.set(null);
    this.successMessage.set(null);

    const request = this.buildWorkflowRequest(caseItem);

    if (!request) {
      this.form.markAllAsTouched();
      return;
    }

    this.activeRequestContext = { caseId: caseItem.id, serverId: caseItem.serverId };
    this.isSaving.set(true);

    this.workflow
      .create(request)
      .pipe(
        finalize(() => this.isSaving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          if (!this.isCurrentRequestContext(caseItem)) {
            return;
          }

          this.successMessage.set(
            result.partialFailureMessage ?? 'Sanction created.',
          );
          this.resetAfterSuccess();
          this.emitCreated(result);
        },
        error: (error: unknown) => {
          if (!this.isCurrentRequestContext(caseItem)) {
            return;
          }

          this.error.set(
            error instanceof Error ? error.message : 'Failed to create sanction.',
          );
        },
      });
  }

  private syncSanctionType(
    sanctionTypes: readonly AntiAbuseSanctionTypeEntry[],
    clearIrrelevantFields: boolean,
  ): void {
    const currentKey = this.form.controls.sanctionTypeKey.value;
    const nextType =
      sanctionTypes.find((entry) => entry.key === currentKey) ?? sanctionTypes[0] ?? null;
    const previousType = this.selectedSanctionType();

    if (nextType && currentKey !== nextType.key) {
      this.form.controls.sanctionTypeKey.setValue(nextType.key, { emitEvent: false });
    }

    this.selectedSanctionType.set(nextType);
    this.syncRequiredFields(nextType);

    if (clearIrrelevantFields && previousType?.key !== nextType?.key) {
      this.clearIrrelevantDynamicFields(nextType);
    }
  }

  private syncRequiredFields(sanctionType: AntiAbuseSanctionTypeEntry | null): void {
    const required = sanctionType
      ? requiredSanctionFormFieldKeys(createAntiAbuseSanctionFormModel(sanctionType))
      : [];

    setRequired(this.form.controls.sourceHeroId, required.includes('sourceHeroId'));
    setRequired(this.form.controls.durationDays, required.includes('durationDays'));
    setRequired(
      this.form.controls.amountCharacterPoints,
      required.includes('amountCharacterPoints'),
    );
  }

  private buildWorkflowRequest(
    caseItem: AntiAbuseCaseReadModel,
  ): CreateSanctionWorkflowRequest | null {
    const sanctionType = this.selectedSanctionType();
    const reason = trimText(this.form.controls.reason.value);
    const targetHeroId = trimText(this.form.controls.targetHeroId.value);
    const targetUserId = trimText(this.form.controls.targetUserId.value);
    const operatorNotes = trimToNull(this.form.controls.operatorNotes.value);

    if (!sanctionType || !reason || !targetHeroId || !targetUserId) {
      this.error.set('Sanction type, reason and full hero/account target are required.');
      return null;
    }

    const durationDays = parseOptionalPositiveInteger(
      this.form.controls.durationDays.value,
      'Duration days',
    );
    const amountCharacterPoints = parseOptionalPositiveInteger(
      this.form.controls.amountCharacterPoints.value,
      'Character Points amount',
    );

    if (durationDays.error || amountCharacterPoints.error) {
      this.error.set(durationDays.error ?? amountCharacterPoints.error);
      return null;
    }

    if (sanctionType.requiresDurationDays && durationDays.value === null) {
      this.error.set('Duration in days is required for this sanction type.');
      return null;
    }

    if (
      sanctionType.requiresCharacterPointsAmount &&
      amountCharacterPoints.value === null
    ) {
      this.error.set('Character Points amount is required for this sanction type.');
      return null;
    }

    const sourceHeroId = sanctionType.requiresSourceHero
      ? trimToNull(this.form.controls.sourceHeroId.value)
      : null;

    if (sanctionType.requiresSourceHero && !sourceHeroId) {
      this.error.set('Source hero is required for this sanction type.');
      return null;
    }

    const itemIds = sanctionType.requiresItemSelection
      ? this.itemSearch.selectedItemIds()
      : [];

    if (sanctionType.requiresItemSelection && !itemIds.length) {
      this.error.set('At least one item must be selected for this sanction type.');
      return null;
    }

    return {
      caseId: caseItem.id,
      sanctionTypeKey: sanctionType.key,
      requiresCharacterPointPenalty: sanctionType.requiresCharacterPointsAmount,
      requiresItemLinks: sanctionType.requiresItemSelection,
      targetHeroId,
      targetUserId,
      reason,
      operatorNotes,
      sourceHeroId,
      amountCharacterPoints: sanctionType.requiresCharacterPointsAmount
        ? amountCharacterPoints.value
        : null,
      durationDays: sanctionType.requiresDurationDays ? durationDays.value : null,
      itemIds,
    };
  }

  private clearIrrelevantDynamicFields(
    sanctionType: AntiAbuseSanctionTypeEntry | null,
  ): void {
    if (!sanctionType?.requiresSourceHero) {
      this.clearSourceHero();
    }

    if (!sanctionType?.requiresDurationDays) {
      this.form.controls.durationDays.setValue(null);
    }

    if (!sanctionType?.requiresCharacterPointsAmount) {
      this.form.controls.amountCharacterPoints.setValue(null);
    }

    if (!sanctionType?.requiresItemSelection) {
      this.itemSearch.reset();
    }
  }

  private resetForNewContext(): void {
    this.form.patchValue({
      reason: null,
      targetHeroId: null,
      targetUserId: null,
      sourceHeroId: null,
      durationDays: null,
      amountCharacterPoints: null,
      operatorNotes: null,
    });
    this.targetSearch.reset();
    this.sourceSearch.reset();
    this.itemSearch.reset();
    this.error.set(null);
    this.successMessage.set(null);
    this.activeRequestContext = null;
  }

  private resetAfterSuccess(): void {
    this.form.patchValue({
      reason: null,
      sourceHeroId: null,
      durationDays: null,
      amountCharacterPoints: null,
      operatorNotes: null,
    });
    this.sourceSearch.reset();
    this.itemSearch.reset();
  }

  private isCurrentRequestContext(caseItem: AntiAbuseCaseReadModel): boolean {
    const current = this.currentCase();

    return (
      this.activeRequestContext?.caseId === caseItem.id &&
      this.activeRequestContext.serverId === caseItem.serverId &&
      current.id === caseItem.id &&
      current.serverId === caseItem.serverId
    );
  }
}

function setRequired(control: AbstractControl, required: boolean): void {
  control.setValidators(required ? Validators.required : null);
  control.updateValueAndValidity({ emitEvent: false });
}

function parseOptionalPositiveInteger(
  value: number | null | undefined,
  label: string,
): { value: number | null; error: string | null } {
  if (value === null || value === undefined) {
    return { value: null, error: null };
  }

  const normalized = Number(value);

  if (!Number.isInteger(normalized) || normalized <= 0) {
    return { value: null, error: `${label} must be a positive whole number.` };
  }

  return { value: normalized, error: null };
}
