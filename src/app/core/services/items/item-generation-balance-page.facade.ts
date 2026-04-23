import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { Observable, finalize, forkJoin, take } from 'rxjs';
import {
  EditableItemGenerationBucketProfile,
  EditableItemGenerationQuality,
} from '../../domain/item/item-generation-admin.model';
import { ItemGenerationBucketsFactory } from '../../factories/item-generation/item-generation-buckets.factory';
import { ItemGenerationBalanceFormFactory } from '../../factories/forms/item-generation-balance-form.factory';
import {
  BucketProfileEditorForm,
  QualityEditorForm,
} from '../../types/forms/item-generation-balance-form.types';
import { createEntityEditorState } from '../../utils/entity-editor-state';
import { getErrorMessage } from '../../utils/error-message';
import { BalanceSelection } from '../../types/item-generation-balance-page.types';
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
  private readonly formulaService = inject(FormulaService);
  private readonly toast = inject(ToastService);

  readonly formulas = inject(ItemGenerationFormulaBalanceFacade);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly isBusy = computed(() => this.isSaving() || this.formulas.isSaving());

  readonly quality = createEntityEditorState<
    EditableItemGenerationQuality,
    QualityEditorForm
  >({
    destroyRef: this.destroyRef,
    selectorForm: this.formFactory.createQualitySelectorForm(),
    editorForm: this.formFactory.createQualityEditorForm(),
    createDraft: () => this.formFactory.createQualityDraft(),
    patch: (form, draft) => this.formFactory.patchQuality(form, draft),
    toDraft: (form) => this.formFactory.toQuality(form),
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

  readonly bucketPreview = computed(() => {
    const profile = this.profile.draft();

    return profile.bucketCount > 0 && profile.baseValue > 0 && profile.roundingStep > 0
      ? this.bucketFactory.buildBuckets(profile)
      : [];
  });

  loadData(preferred?: BalanceSelection) {
    this.isLoading.set(true);
    this.loadError.set(null);

    forkJoin({
      balanceData: this.adminService.getBalanceData(),
      formulaData: this.formulaService.refreshAdminData(),
    })
      .pipe(
        take(1),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: ({ balanceData, formulaData }) => {
          this.quality.setItems(balanceData.qualities, preferred?.qualityKey);
          this.profile.setItems(balanceData.bucketProfiles, preferred?.profileKey);
          this.formulas.setData(formulaData, preferred);
        },
        error: (error: unknown) => {
          const message = getErrorMessage(error, 'Failed to load balance data.');
          console.error('[ItemGenerationBalancePage] loadData failed', error);
          this.loadError.set(message);
          this.toast.show('error', 'Balance panel unavailable', message);
        },
      });
  }

  saveQuality() {
    const draft = this.quality.draft();
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

  private persist(
    operation: Observable<void>,
    title: string,
    message: string,
    preferred: BalanceSelection
  ) {
    this.isSaving.set(true);
    operation
      .pipe(
        take(1),
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
