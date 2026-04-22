import { Injectable, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
} from '@angular/forms';
import {
  EditableItemGenerationBucketProfile,
  EditableItemGenerationQuality,
} from '../../domain/item/item-generation-admin.model';
import { ItemQualityKey } from '../../domain/item/item-generation.model';

export type QualitySelectorForm = FormGroup<{
  selectedId: FormControl<string>;
}>;

export type QualityEditorForm = FormGroup<{
  id: FormControl<string>;
  key: FormControl<ItemQualityKey>;
  label: FormControl<string>;
  multiplier: FormControl<number>;
  weight: FormControl<number>;
  sortOrder: FormControl<number>;
  isEnabled: FormControl<boolean>;
}>;

export type BucketProfileSelectorForm = FormGroup<{
  selectedId: FormControl<string>;
}>;

export type BucketProfileEditorForm = FormGroup<{
  id: FormControl<string>;
  key: FormControl<string>;
  name: FormControl<string>;
  description: FormControl<string>;
  bucketCount: FormControl<number>;
  baseValue: FormControl<number>;
  linearGrowth: FormControl<number>;
  growthFactor: FormControl<number>;
  roundingStep: FormControl<number>;
  minIncrement: FormControl<number>;
  isActive: FormControl<boolean>;
}>;

@Injectable({ providedIn: 'root' })
export class ItemGenerationBalanceFormFactory {
  private readonly fb = inject(NonNullableFormBuilder);

  createQualitySelectorForm(): QualitySelectorForm {
    return this.fb.group({
      selectedId: this.fb.control(''),
    });
  }

  createQualityEditorForm(
    draft?: EditableItemGenerationQuality
  ): QualityEditorForm {
    return this.fb.group({
      id: this.fb.control(draft?.id ?? ''),
      key: this.fb.control<ItemQualityKey>(draft?.key ?? 'normal'),
      label: this.fb.control(draft?.label ?? 'Normal'),
      multiplier: this.fb.control(draft?.multiplier ?? 1),
      weight: this.fb.control(draft?.weight ?? 10),
      sortOrder: this.fb.control(draft?.sortOrder ?? 10),
      isEnabled: this.fb.control(draft?.isEnabled ?? true),
    });
  }

  createBucketProfileSelectorForm(): BucketProfileSelectorForm {
    return this.fb.group({
      selectedId: this.fb.control(''),
    });
  }

  createBucketProfileEditorForm(
    draft?: EditableItemGenerationBucketProfile
  ): BucketProfileEditorForm {
    return this.fb.group({
      id: this.fb.control(draft?.id ?? ''),
      key: this.fb.control(draft?.key ?? ''),
      name: this.fb.control(draft?.name ?? ''),
      description: this.fb.control(draft?.description ?? ''),
      bucketCount: this.fb.control(draft?.bucketCount ?? 6),
      baseValue: this.fb.control(draft?.baseValue ?? 300),
      linearGrowth: this.fb.control(draft?.linearGrowth ?? 120),
      growthFactor: this.fb.control(draft?.growthFactor ?? 1.43),
      roundingStep: this.fb.control(draft?.roundingStep ?? 50),
      minIncrement: this.fb.control(draft?.minIncrement ?? 50),
      isActive: this.fb.control(draft?.isActive ?? false),
    });
  }

  toQuality(form: QualityEditorForm): EditableItemGenerationQuality {
    const value = form.getRawValue();

    return {
      id: value.id || null,
      key: value.key,
      label: value.label.trim(),
      multiplier: Number(value.multiplier),
      weight: Math.max(0, Math.round(Number(value.weight))),
      sortOrder: Math.round(Number(value.sortOrder)),
      isEnabled: value.isEnabled,
    };
  }

  toBucketProfile(
    form: BucketProfileEditorForm
  ): EditableItemGenerationBucketProfile {
    const value = form.getRawValue();

    return {
      id: value.id || null,
      key: value.key.trim(),
      name: value.name.trim(),
      description: value.description.trim(),
      bucketCount: Math.max(1, Math.round(Number(value.bucketCount))),
      baseValue: Math.max(1, Math.round(Number(value.baseValue))),
      linearGrowth: Math.max(0, Math.round(Number(value.linearGrowth))),
      growthFactor: Math.max(1, Number(value.growthFactor)),
      roundingStep: Math.max(1, Math.round(Number(value.roundingStep))),
      minIncrement: Math.max(1, Math.round(Number(value.minIncrement))),
      isActive: value.isActive,
    };
  }

  patchQuality(form: QualityEditorForm, draft: EditableItemGenerationQuality) {
    form.reset({
      id: draft.id ?? '',
      key: draft.key,
      label: draft.label,
      multiplier: draft.multiplier,
      weight: draft.weight,
      sortOrder: draft.sortOrder,
      isEnabled: draft.isEnabled,
    });
  }

  patchBucketProfile(
    form: BucketProfileEditorForm,
    draft: EditableItemGenerationBucketProfile
  ) {
    form.reset({
      id: draft.id ?? '',
      key: draft.key,
      name: draft.name,
      description: draft.description ?? '',
      bucketCount: draft.bucketCount,
      baseValue: draft.baseValue,
      linearGrowth: draft.linearGrowth,
      growthFactor: draft.growthFactor,
      roundingStep: draft.roundingStep,
      minIncrement: draft.minIncrement,
      isActive: draft.isActive,
    });
  }
}
