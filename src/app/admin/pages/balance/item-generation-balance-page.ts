import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin, startWith, take } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import {
  BalanceFormula,
  EditableBalanceFormula,
  FormulaAdminData,
  FormulaTarget,
} from '../../../core/domain/formula/formula.model';
import {
  EditableItemGenerationBucketProfile,
  EditableItemGenerationQuality,
} from '../../../core/domain/item/item-generation-admin.model';
import { ItemGenerationBucketsFactory } from '../../../core/factories/item-generation/item-generation-buckets.factory';
import {
  BucketProfileEditorForm,
  BucketProfileSelectorForm,
  ItemGenerationBalanceFormFactory,
  QualityEditorForm,
  QualitySelectorForm,
} from '../../../core/factories/forms/item-generation-balance-form.factory';
import { FormulaService } from '../../../core/services/formula/formula';
import { ItemGenerationAdminService } from '../../../core/services/items/item-generation-admin';
import { FormulaRuntimeService } from '../../../core/services/progression/formula-runtime';
import { ToastService } from '../../../core/services/ui/toast';
import { getErrorMessage } from '../../../core/utils/error-message';

@Component({
  selector: 'app-item-generation-balance-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonModule, InputTextModule],
  templateUrl: './item-generation-balance-page.html',
})
export class ItemGenerationBalancePage implements OnInit {
  private readonly adminService = inject(ItemGenerationAdminService);
  private readonly bucketFactory = inject(ItemGenerationBucketsFactory);
  private readonly formFactory = inject(ItemGenerationBalanceFormFactory);
  private readonly formulaService = inject(FormulaService);
  private readonly formulaRuntime = inject(FormulaRuntimeService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly loadError = signal<string | null>(null);

  readonly qualities = signal<EditableItemGenerationQuality[]>([]);
  readonly bucketProfiles = signal<EditableItemGenerationBucketProfile[]>([]);
  readonly formulaAdminData = signal<FormulaAdminData>({
    targets: [],
    formulas: [],
    assignments: [],
  });
  readonly testerContext = signal<Record<string, number>>({});

  readonly qualitySelectorForm: QualitySelectorForm =
    this.formFactory.createQualitySelectorForm();
  readonly qualityEditorForm: QualityEditorForm =
    this.formFactory.createQualityEditorForm();
  readonly profileSelectorForm: BucketProfileSelectorForm =
    this.formFactory.createBucketProfileSelectorForm();
  readonly profileEditorForm: BucketProfileEditorForm =
    this.formFactory.createBucketProfileEditorForm();
  readonly formulaSelectorForm = this.fb.nonNullable.group({
    selectedId: this.fb.nonNullable.control(''),
  });
  readonly formulaEditorForm = this.fb.nonNullable.group({
    id: this.fb.nonNullable.control(''),
    key: this.fb.nonNullable.control(''),
    scopeKey: this.fb.nonNullable.control('hero_progression'),
    label: this.fb.nonNullable.control(''),
    expression: this.fb.nonNullable.control(''),
    description: this.fb.nonNullable.control(''),
    isEnabled: this.fb.nonNullable.control(true),
  });
  readonly formulaAssignmentForm = this.fb.nonNullable.group({
    targetId: this.fb.nonNullable.control(''),
    formulaId: this.fb.nonNullable.control(''),
  });
  readonly formulaEditorValue = toSignal(
    this.formulaEditorForm.valueChanges.pipe(
      startWith(this.formulaEditorForm.getRawValue())
    ),
    {
      initialValue: this.formulaEditorForm.getRawValue(),
    }
  );
  readonly formulaAssignmentValue = toSignal(
    this.formulaAssignmentForm.valueChanges.pipe(
      startWith(this.formulaAssignmentForm.getRawValue())
    ),
    {
      initialValue: this.formulaAssignmentForm.getRawValue(),
    }
  );

  readonly bucketPreview = computed(() => {
    const profile = this.formFactory.toBucketProfile(this.profileEditorForm);

    if (profile.bucketCount <= 0 || profile.baseValue <= 0 || profile.roundingStep <= 0) {
      return [];
    }

    return this.bucketFactory.buildBuckets(profile);
  });

  readonly selectedTarget = computed(() => {
    const targetId = this.formulaAssignmentValue().targetId;
    return this.formulaAdminData().targets.find((target) => target.id === targetId) ?? null;
  });

  readonly selectedAssignedFormula = computed(() => {
    const formulaId = this.formulaAssignmentValue().formulaId;
    return this.formulaAdminData().formulas.find((formula) => formula.id === formulaId) ?? null;
  });

  readonly availableFormulaScopes = computed(() =>
    Array.from(new Set(this.formulaAdminData().targets.map((target) => target.scopeKey)))
  );

  readonly formulasForSelectedTarget = computed(() => {
    const target = this.selectedTarget();

    if (!target) {
      return this.formulaAdminData().formulas;
    }

    return this.formulaAdminData().formulas.filter(
      (formula) => formula.scopeKey === target.scopeKey
    );
  });

  readonly formulaPreview = computed(() => {
    const target = this.selectedTarget();
    const editorValue = this.formulaEditorValue();

    if (!target) {
      return {
        value: null,
        error: 'Choose a predefined target to test this formula.',
      };
    }

    const context = target.allowedVariables.reduce((acc, variable) => {
      acc[variable] = Number(this.testerContext()[variable] ?? 0);
      return acc;
    }, {} as Record<string, number>);

    return this.formulaRuntime.evaluate(editorValue.expression ?? '', context);
  });

  constructor() {
    this.qualitySelectorForm.controls.selectedId.valueChanges.subscribe((id) => {
      const selected =
        this.qualities().find((quality) => quality.id === id) ?? this.createQualityDraft();
      this.formFactory.patchQuality(this.qualityEditorForm, selected);
    });

    this.profileSelectorForm.controls.selectedId.valueChanges.subscribe((id) => {
      const selected =
        this.bucketProfiles().find((profile) => profile.id === id) ??
        this.createBucketProfileDraft();
      this.formFactory.patchBucketProfile(this.profileEditorForm, selected);
    });

    this.formulaSelectorForm.controls.selectedId.valueChanges.subscribe((id) => {
      const selected = this.formulaAdminData().formulas.find((formula) => formula.id === id);

      if (selected) {
        this.patchFormulaEditor(selected);
        return;
      }

      this.patchFormulaEditor(this.createFormulaDraft(this.selectedTarget()?.scopeKey));
    });

    this.formulaAssignmentForm.controls.targetId.valueChanges.subscribe((targetId) => {
      this.applyTargetSelection(targetId);
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(preferred?: {
    qualityKey?: string;
    profileKey?: string;
    formulaKey?: string;
    targetKey?: string;
  }) {
    this.isLoading.set(true);
    this.loadError.set(null);

    forkJoin({
      balanceData: this.adminService.getBalanceData(),
      formulaData: this.formulaService.getAdminData(),
    })
      .pipe(
        take(1),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: ({ balanceData, formulaData }) => {
          this.qualities.set(balanceData.qualities);
          this.bucketProfiles.set(balanceData.bucketProfiles);
          this.formulaAdminData.set(formulaData);

          const nextQuality =
            balanceData.qualities.find((quality) => quality.key === preferred?.qualityKey) ??
            balanceData.qualities[0] ??
            this.createQualityDraft();
          const nextProfile =
            balanceData.bucketProfiles.find(
              (profile) => profile.key === preferred?.profileKey
            ) ??
            balanceData.bucketProfiles[0] ??
            this.createBucketProfileDraft();

          this.qualitySelectorForm.controls.selectedId.setValue(nextQuality.id ?? '', {
            emitEvent: false,
          });
          this.profileSelectorForm.controls.selectedId.setValue(nextProfile.id ?? '', {
            emitEvent: false,
          });
          this.formFactory.patchQuality(this.qualityEditorForm, nextQuality);
          this.formFactory.patchBucketProfile(this.profileEditorForm, nextProfile);

          const nextTarget =
            formulaData.targets.find((target) => target.key === preferred?.targetKey) ??
            formulaData.targets[0] ??
            null;
          const nextFormula =
            formulaData.formulas.find((formula) => formula.key === preferred?.formulaKey) ??
            formulaData.formulas[0] ??
            null;

          this.formulaAssignmentForm.controls.targetId.setValue(nextTarget?.id ?? '', {
            emitEvent: false,
          });
          this.formulaSelectorForm.controls.selectedId.setValue(nextFormula?.id ?? '', {
            emitEvent: false,
          });

          this.applyTargetSelection(nextTarget?.id ?? '');
          this.patchFormulaEditor(
            nextFormula ?? this.createFormulaDraft(nextTarget?.scopeKey)
          );
        },
        error: (error: unknown) => {
          console.error('[ItemGenerationBalancePage] loadData failed', error);
          const message = getErrorMessage(error, 'Failed to load balance data.');
          this.loadError.set(message);
          this.toast.show('error', 'Balance panel unavailable', message);
        },
      });
  }

  newQuality() {
    const draft = this.createQualityDraft();
    this.qualitySelectorForm.controls.selectedId.setValue('', { emitEvent: false });
    this.formFactory.patchQuality(this.qualityEditorForm, draft);
  }

  newProfile() {
    const draft = this.createBucketProfileDraft();
    this.profileSelectorForm.controls.selectedId.setValue('', { emitEvent: false });
    this.formFactory.patchBucketProfile(this.profileEditorForm, draft);
  }

  newFormula() {
    const target = this.selectedTarget();
    this.formulaSelectorForm.controls.selectedId.setValue('', { emitEvent: false });
    this.patchFormulaEditor(this.createFormulaDraft(target?.scopeKey));
  }

  saveQuality() {
    const draft = this.formFactory.toQuality(this.qualityEditorForm);

    this.isSaving.set(true);

    this.adminService
      .saveQuality(draft)
      .pipe(
        take(1),
        finalize(() => this.isSaving.set(false))
      )
      .subscribe({
        next: () => {
          this.toast.show('success', 'Quality saved', `${draft.label} was saved.`);
          this.loadData({
            qualityKey: draft.key,
            profileKey: this.formFactory.toBucketProfile(this.profileEditorForm).key,
            formulaKey: this.currentFormulaDraft().key,
            targetKey: this.selectedTarget()?.key,
          });
        },
        error: (error: unknown) => {
          this.toast.show(
            'error',
            'Save failed',
            getErrorMessage(error, 'Failed to save quality.')
          );
        },
      });
  }

  deleteQuality() {
    const id = this.qualityEditorForm.controls.id.value;

    if (!id) {
      this.newQuality();
      return;
    }

    this.isSaving.set(true);

    this.adminService
      .deleteQuality(id)
      .pipe(
        take(1),
        finalize(() => this.isSaving.set(false))
      )
      .subscribe({
        next: () => {
          this.toast.show('success', 'Quality deleted', 'The quality tier was deleted.');
          this.loadData({
            profileKey: this.formFactory.toBucketProfile(this.profileEditorForm).key,
            formulaKey: this.currentFormulaDraft().key,
            targetKey: this.selectedTarget()?.key,
          });
        },
        error: (error: unknown) => {
          this.toast.show(
            'error',
            'Delete failed',
            getErrorMessage(error, 'Failed to delete quality.')
          );
        },
      });
  }

  saveProfile() {
    const draft = this.formFactory.toBucketProfile(this.profileEditorForm);

    this.isSaving.set(true);

    this.adminService
      .saveBucketProfile(draft)
      .pipe(
        take(1),
        finalize(() => this.isSaving.set(false))
      )
      .subscribe({
        next: () => {
          this.toast.show(
            'success',
            'Bucket profile saved',
            `${draft.name || draft.key} was saved.`
          );
          this.loadData({
            qualityKey: this.formFactory.toQuality(this.qualityEditorForm).key,
            profileKey: draft.key,
            formulaKey: this.currentFormulaDraft().key,
            targetKey: this.selectedTarget()?.key,
          });
        },
        error: (error: unknown) => {
          this.toast.show(
            'error',
            'Save failed',
            getErrorMessage(error, 'Failed to save bucket profile.')
          );
        },
      });
  }

  deleteProfile() {
    const id = this.profileEditorForm.controls.id.value;

    if (!id) {
      this.newProfile();
      return;
    }

    this.isSaving.set(true);

    this.adminService
      .deleteBucketProfile(id)
      .pipe(
        take(1),
        finalize(() => this.isSaving.set(false))
      )
      .subscribe({
        next: () => {
          this.toast.show('success', 'Bucket profile deleted', 'The bucket profile was deleted.');
          this.loadData({
            qualityKey: this.formFactory.toQuality(this.qualityEditorForm).key,
            formulaKey: this.currentFormulaDraft().key,
            targetKey: this.selectedTarget()?.key,
          });
        },
        error: (error: unknown) => {
          this.toast.show(
            'error',
            'Delete failed',
            getErrorMessage(error, 'Failed to delete bucket profile.')
          );
        },
      });
  }

  saveFormula() {
    const draft = this.currentFormulaDraft();

    this.isSaving.set(true);

    this.formulaService
      .saveFormula(draft)
      .pipe(
        take(1),
        finalize(() => this.isSaving.set(false))
      )
      .subscribe({
        next: () => {
          this.toast.show('success', 'Formula saved', `${draft.label} was saved.`);
          this.loadData({
            qualityKey: this.formFactory.toQuality(this.qualityEditorForm).key,
            profileKey: this.formFactory.toBucketProfile(this.profileEditorForm).key,
            formulaKey: draft.key,
            targetKey: this.selectedTarget()?.key,
          });
        },
        error: (error: unknown) => {
          this.toast.show(
            'error',
            'Save failed',
            getErrorMessage(error, 'Failed to save formula.')
          );
        },
      });
  }

  deleteFormula() {
    const id = this.formulaEditorForm.controls.id.value;

    if (!id) {
      this.newFormula();
      return;
    }

    this.isSaving.set(true);

    this.formulaService
      .deleteFormula(id)
      .pipe(
        take(1),
        finalize(() => this.isSaving.set(false))
      )
      .subscribe({
        next: () => {
          this.toast.show('success', 'Formula deleted', 'The formula was deleted.');
          this.loadData({
            qualityKey: this.formFactory.toQuality(this.qualityEditorForm).key,
            profileKey: this.formFactory.toBucketProfile(this.profileEditorForm).key,
            targetKey: this.selectedTarget()?.key,
          });
        },
        error: (error: unknown) => {
          this.toast.show(
            'error',
            'Delete failed',
            getErrorMessage(error, 'Failed to delete formula.')
          );
        },
      });
  }

  applyFormulaAssignment() {
    const target = this.selectedTarget();
    const formula = this.selectedAssignedFormula();

    if (!target || !formula) {
      return;
    }

    this.isSaving.set(true);

    this.formulaService
      .assignFormula(target.id, formula.id)
      .pipe(
        take(1),
        finalize(() => this.isSaving.set(false))
      )
      .subscribe({
        next: () => {
          this.toast.show(
            'success',
            'Formula applied',
            `${formula.label} is now assigned to ${target.label}.`
          );
          this.loadData({
            qualityKey: this.formFactory.toQuality(this.qualityEditorForm).key,
            profileKey: this.formFactory.toBucketProfile(this.profileEditorForm).key,
            formulaKey: this.currentFormulaDraft().key,
            targetKey: target.key,
          });
        },
        error: (error: unknown) => {
          this.toast.show(
            'error',
            'Assignment failed',
            getErrorMessage(error, 'Failed to assign formula.')
          );
        },
      });
  }

  updateTesterContext(variable: string, value: string) {
    const numericValue = Number(value);

    this.testerContext.update((previous) => ({
      ...previous,
      [variable]: Number.isFinite(numericValue) ? numericValue : 0,
    }));
  }

  humanizeScope(scopeKey: string): string {
    return scopeKey
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  getTesterValue(variable: string): number {
    return this.testerContext()[variable] || 0;
  }

  private applyTargetSelection(targetId: string) {
    const target = this.formulaAdminData().targets.find((entry) => entry.id === targetId) ?? null;
    const assignment = target
      ? this.formulaAdminData().assignments.find((entry) => entry.targetId === target.id)
      : null;
    const scopedFormulaId =
      assignment?.formulaId &&
      this.formulaAdminData().formulas.some((formula) => formula.id === assignment.formulaId)
        ? assignment.formulaId
        : this.formulasForTarget(target).find((formula) => formula.isEnabled)?.id ?? '';

    this.formulaAssignmentForm.controls.formulaId.setValue(scopedFormulaId, {
      emitEvent: false,
    });
    this.testerContext.set({
      ...(target?.defaultTestContext ?? {}),
    });
  }

  private formulasForTarget(target: FormulaTarget | null): BalanceFormula[] {
    if (!target) {
      return this.formulaAdminData().formulas;
    }

    return this.formulaAdminData().formulas.filter(
      (formula) => formula.scopeKey === target.scopeKey
    );
  }

  private patchFormulaEditor(draft: EditableBalanceFormula | BalanceFormula) {
    this.formulaEditorForm.reset({
      id: draft.id ?? '',
      key: draft.key,
      scopeKey: draft.scopeKey,
      label: draft.label,
      expression: draft.expression,
      description: draft.description ?? '',
      isEnabled: draft.isEnabled,
    });
  }

  private currentFormulaDraft(): EditableBalanceFormula {
    const value = this.formulaEditorForm.getRawValue();

    return {
      id: value.id || null,
      key: value.key.trim(),
      scopeKey: value.scopeKey.trim(),
      label: value.label.trim(),
      expression: value.expression.trim(),
      description: value.description.trim(),
      isEnabled: value.isEnabled,
    };
  }

  private createFormulaDraft(scopeKey = 'hero_progression'): EditableBalanceFormula {
    return {
      id: null,
      key: '',
      scopeKey,
      label: '',
      expression: '',
      description: '',
      isEnabled: true,
    };
  }

  private createQualityDraft(): EditableItemGenerationQuality {
    return {
      id: null,
      key: 'normal',
      label: 'Normal',
      multiplier: 1,
      weight: 10,
      sortOrder: 10,
      isEnabled: true,
    };
  }

  private createBucketProfileDraft(): EditableItemGenerationBucketProfile {
    return {
      id: null,
      key: '',
      name: '',
      description: '',
      bucketCount: 6,
      baseValue: 300,
      linearGrowth: 120,
      growthFactor: 1.43,
      roundingStep: 50,
      minIncrement: 50,
      isActive: false,
    };
  }
}
