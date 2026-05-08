import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable, finalize, forkJoin } from 'rxjs';
import { BonusAdminData, BonusTemplate } from '../../domain/bonus/bonus.model';
import {
  EditableItemGenerationBucketProfile,
  EditableItemGenerationQuality,
  ItemRequirementAggregationSettings,
  ItemQualityImpactPreview,
} from '../../domain/item/item-generation-admin.model';
import { ItemGenerationBalanceFormFactory } from '../../factories/forms/item-generation-balance-form.factory';
import { ItemGenerationBucketsFactory } from '../../factories/item-generation/item-generation-buckets.factory';
import {
  BonusTemplateEditorForm,
  BucketProfileEditorForm,
  QualityEditorForm,
} from '../../types/forms/item-generation-balance-form.types';
import { ItemGenerationQualityFormFactory } from '../../factories/forms/item-generation-quality-form.factory';
import { BalanceSelection } from '../../types/item-generation-balance-page.types';
import { createEntityEditorState } from '../../utils/entity-editor-state';
import { getErrorMessage } from '../../utils/error-message';
import { toSlug } from '../../utils/slug';
import { BonusTemplateAdminService } from '../bonus/bonus-template-admin';
import { FormulaService } from '../formula/formula';
import { ToastService } from '../ui/toast';
import { ItemGenerationAdminService } from './item-generation-admin';
import { ItemGenerationFormulaBalanceFacade } from './item-generation-formula-balance.facade';

@Injectable()
export class ItemGenerationBalancePageFacade {
  private readonly destroyRef = inject(DestroyRef);
  private readonly adminService = inject(ItemGenerationAdminService);
  private readonly bucketFactory = inject(ItemGenerationBucketsFactory);
  private readonly formFactory = inject(ItemGenerationBalanceFormFactory);
  private readonly qualityFormFactory = inject(ItemGenerationQualityFormFactory);
  private readonly formBuilder = inject(FormBuilder);
  private readonly formulaService = inject(FormulaService);
  private readonly toast = inject(ToastService);
  private readonly bonusTemplateService = inject(BonusTemplateAdminService);

  readonly formulas = inject(ItemGenerationFormulaBalanceFacade);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly isLoadingQualityImpactPreview = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly qualityImpactPreviewError = signal<string | null>(null);
  readonly qualityImpactPreview = signal<ItemQualityImpactPreview[]>([]);
  readonly requirementAggregationSettings =
    signal<ItemRequirementAggregationSettings | null>(null);
  readonly isBusy = computed(() => this.isSaving() || this.formulas.isSaving());
  readonly qualityImpactPreviewForm = this.formBuilder.group({
    baseValue: this.formBuilder.control<number | null>(100, [
      Validators.required,
      Validators.min(0),
    ]),
    bonusValue: this.formBuilder.control<number | null>(4, [Validators.required]),
  });
  readonly bonusAdminData = signal<BonusAdminData>({
    templates: [],
    targets: [],
    categories: [],
    types: [],
    scopes: [],
    targetCategories: [],
  });

  readonly quality = createEntityEditorState<
    EditableItemGenerationQuality,
    QualityEditorForm
  >({
    destroyRef: this.destroyRef,
    selectorForm: this.qualityFormFactory.createSelectorForm(),
    editorForm: this.qualityFormFactory.createEditorForm(),
    createDraft: () => this.qualityFormFactory.createDraft(),
    patch: (form, draft) => this.qualityFormFactory.patch(form, draft),
    toDraft: (form) => this.qualityFormFactory.toDraft(form),
    idOf: (item) => item.id,
    keyOf: (item) => item.key,
  });

  readonly profile = createEntityEditorState<
    EditableItemGenerationBucketProfile,
    BucketProfileEditorForm
  >({
    destroyRef: this.destroyRef,
    selectorForm: this.formFactory.createBucketProfileSelectorForm(),
    editorForm: this.formFactory.createBucketProfileEditorForm(),
    createDraft: () => this.formFactory.createBucketProfileDraft(),
    patch: (form, draft) => this.formFactory.patchBucketProfile(form, draft),
    toDraft: (form) => this.formFactory.toBucketProfile(form),
    idOf: (item) => item.id,
    keyOf: (item) => item.key,
  });
  readonly bonusTemplate = createEntityEditorState<
    BonusTemplate,
    BonusTemplateEditorForm
  >({
    destroyRef: this.destroyRef,
    selectorForm: this.formFactory.createBonusTemplateSelectorForm(),
    editorForm: this.formFactory.createBonusTemplateEditorForm(),
    createDraft: () => this.formFactory.createBonusTemplateDraft(),
    patch: (form, draft) => this.formFactory.patchBonusTemplate(form, draft),
    toDraft: (form) => this.formFactory.toBonusTemplate(form),
    idOf: (item) => item.id,
    keyOf: (item) => item.key,
  });

  readonly bucketPreview = computed(() => {
    const profile = this.profile.draft();

    return profile.bucketCount > 0 && profile.baseValue > 0 && profile.roundingStep > 0
      ? this.bucketFactory.buildBuckets(profile)
      : [];
  });
  readonly qualityWeightState = computed(() => {
    const draft = this.quality.draft();
    const currentId = this.quality.id();
    const mergedQualities = this.quality
      .items()
      .filter((item) => item.id !== currentId && item.key !== draft.key);

    mergedQualities.push(draft);

    const activeWeights = mergedQualities
      .filter((quality) => quality.isEnabled)
      .reduce((sum, quality) => sum + quality.weight, 0);

    return {
      total: activeWeights,
      remaining: 100 - activeWeights,
      isValid: activeWeights === 100,
    };
  });

  constructor() {
    this.profile.editorForm.controls.name.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((name) => {
        const nextKey = toSlug(name);

        if (this.profile.editorForm.controls.key.value !== nextKey) {
          this.profile.editorForm.controls.key.setValue(nextKey, { emitEvent: false });
        }
      });

    this.bonusTemplate.editorForm.controls.label.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((label) => {
        const nextKey = toSlug(label);

        if (this.bonusTemplate.editorForm.controls.key.value !== nextKey) {
          this.bonusTemplate.editorForm.controls.key.setValue(nextKey, { emitEvent: false });
        }
      });
  }

  loadData(preferred?: BalanceSelection) {
    this.isLoading.set(true);
    this.loadError.set(null);

    forkJoin({
      balanceData: this.adminService.getBalanceData(),
      formulaData: this.formulaService.refreshAdminData(),
      bonusData: this.bonusTemplateService.getAdminData(),
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: ({ balanceData, formulaData, bonusData }) => {
          this.quality.setItems(balanceData.qualities, preferred?.qualityKey);
          this.profile.setItems(balanceData.bucketProfiles, preferred?.profileKey);
          this.requirementAggregationSettings.set(
            balanceData.requirementAggregationSettings,
          );
          this.formulas.setData(formulaData, preferred);
          this.bonusAdminData.set(bonusData);
          this.bonusTemplate.setItems(bonusData.templates);
          this.loadQualityImpactPreview();
        },
        error: (error: unknown) => {
          const message = getErrorMessage(error, 'Failed to load balance data.');
          console.error('[ItemGenerationBalancePage] loadData failed', error);
          this.loadError.set(message);
          this.toast.show('error', 'Balance panel unavailable', message);
        },
      });
  }

  loadQualityImpactPreview(): void {
    const input = this.qualityImpactPreviewForm.getRawValue();

    this.qualityImpactPreviewForm.markAllAsTouched();

    if (this.qualityImpactPreviewForm.invalid) {
      this.qualityImpactPreviewError.set(this.qualityImpactPreviewValidationMessage());
      return;
    }

    this.isLoadingQualityImpactPreview.set(true);
    this.qualityImpactPreviewError.set(null);

    this.adminService
      .getQualityImpactPreview(input)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoadingQualityImpactPreview.set(false)),
      )
      .subscribe({
        next: (preview) => this.qualityImpactPreview.set(preview),
        error: (error: unknown) => {
          const message = getErrorMessage(error, 'Failed to load quality impact preview.');
          this.qualityImpactPreviewError.set(message);
          this.toast.show('error', 'Quality preview unavailable', message);
        },
      });
  }

  qualityImpactPreviewValidationMessage(
    field?: keyof typeof this.qualityImpactPreviewForm.controls,
  ): string {
    const base = this.qualityImpactPreviewForm.controls.baseValue;
    const bonus = this.qualityImpactPreviewForm.controls.bonusValue;

    if (!field || field === 'baseValue') {
      if (base.hasError('required')) {
        return 'Sample base value is required.';
      }

      if (base.hasError('min')) {
        return 'Sample base value must be zero or greater.';
      }
    }

    if (!field || field === 'bonusValue') {
      if (bonus.hasError('required')) {
        return 'Sample bonus value is required.';
      }
    }

    return 'Sample preview values are invalid.';
  }

  saveQuality() {
    const draft = this.quality.draft();

    if (!this.qualityWeightState().isValid) {
      this.toast.show(
        'error',
        'Weight total invalid',
        'Active quality tier weights must sum to exactly 100.'
      );
      return;
    }

    this.persist(
      this.adminService.saveQuality(draft),
      'Quality saved',
      `${draft.label} was saved.`,
      this.selection({ qualityKey: draft.key })
    );
  }

  deleteQuality() {
    const id = this.quality.id();

    if (!id) {
      this.quality.new();
      return;
    }

    this.persist(
      this.adminService.deleteQuality(id),
      'Quality deleted',
      'The quality tier was deleted.',
      this.selection({ qualityKey: undefined })
    );
  }

  saveProfile() {
    const draft = this.profile.draft();
    this.persist(
      this.adminService.saveBucketProfile(draft),
      'Bucket profile saved',
      `${draft.name || draft.key} was saved.`,
      this.selection({ profileKey: draft.key })
    );
  }

  deleteProfile() {
    const id = this.profile.id();

    if (!id) {
      this.profile.new();
      return;
    }

    this.persist(
      this.adminService.deleteBucketProfile(id),
      'Bucket profile deleted',
      'The bucket profile was deleted.',
      this.selection({ profileKey: undefined })
    );
  }

  saveBonusTemplate() {
    const draft = this.bonusTemplate.draft();
    this.persist(
      this.bonusTemplateService.saveTemplate(draft),
      'Bonus template saved',
      `${draft.label} was saved.`,
      this.selection()
    );
  }

  deleteBonusTemplate() {
    const id = this.bonusTemplate.id();

    if (!id) {
      this.bonusTemplate.new();
      return;
    }

    this.persist(
      this.bonusTemplateService.deleteTemplate(id),
      'Bonus template deleted',
      'The bonus template was deleted.',
      this.selection()
    );
  }

  private persist(
    operation: Observable<void>,
    title: string,
    message: string,
    preferred: BalanceSelection
  ) {
    this.isSaving.set(true);
    operation
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSaving.set(false))
      )
      .subscribe({
        next: () => {
          this.toast.show('success', title, message);
          this.loadData(preferred);
        },
        error: (error: unknown) => {
          this.toast.show('error', 'Save failed', getErrorMessage(error, message));
        },
      });
  }

  private selection(overrides: Partial<BalanceSelection> = {}): BalanceSelection {
    return {
      qualityKey: this.quality.draft().key,
      profileKey: this.profile.draft().key,
      formulaKey: this.formulas.currentFormulaKey(),
      targetKey: this.formulas.selectedTargetKey(),
      ...overrides,
    };
  }
}
