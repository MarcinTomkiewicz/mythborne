import { Injectable, inject } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import {
  EditableItemGenerationBucketProfile,
  EditableItemGenerationQuality,
} from '../../domain/item/item-generation-admin.model';
import { BonusTemplate } from '../../domain/bonus/bonus.model';
import { ItemQualityKey } from '../../domain/item/item-generation.model';
import {
  BalanceFormula,
  EditableBalanceFormula,
} from '../../domain/formula/formula.model';
import {
  BucketProfileEditorForm,
  BucketProfileSelectorForm,
  BonusTemplateEditorForm,
  BonusTemplateSelectorForm,
  FormulaAssignmentForm,
  FormulaEditorForm,
  FormulaSelectorForm,
  QualityEditorForm,
  QualitySelectorForm,
} from '../../types/forms/item-generation-balance-form.types';
import { integerAtLeast, nonNegativeInteger, roundedNumber } from '../../utils/number';
import { trimText } from '../../utils/normalize-text';
import { toSlug } from '../../utils/slug';
import { normalizeBonusContext, normalizeBonusTarget, normalizeBonusType } from '../../utils/bonus';

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

  createFormulaSelectorForm(): FormulaSelectorForm {
    return this.fb.group({
      selectedId: this.fb.control(''),
    });
  }

  createFormulaEditorForm(draft?: EditableBalanceFormula): FormulaEditorForm {
    return this.fb.group({
      id: this.fb.control(draft?.id ?? ''),
      key: this.fb.control(draft?.key ?? ''),
      scopeKey: this.fb.control(draft?.scopeKey ?? 'hero_progression'),
      label: this.fb.control(draft?.label ?? ''),
      expression: this.fb.control(draft?.expression ?? ''),
      description: this.fb.control(draft?.description ?? ''),
      isEnabled: this.fb.control(draft?.isEnabled ?? true),
    });
  }

  createFormulaAssignmentForm(): FormulaAssignmentForm {
    return this.fb.group({
      targetId: this.fb.control(''),
      formulaId: this.fb.control(''),
    });
  }

  createBonusTemplateSelectorForm(): BonusTemplateSelectorForm {
    return this.fb.group({
      selectedId: this.fb.control(''),
    });
  }

  createBonusTemplateEditorForm(draft?: BonusTemplate): BonusTemplateEditorForm {
    return this.fb.group({
      id: this.fb.control(draft?.id ?? ''),
      key: this.fb.control(draft?.key ?? ''),
      label: this.fb.control(draft?.label ?? ''),
      category: this.fb.control(draft?.category ?? 'general'),
      target: this.fb.control(draft?.target ?? ''),
      type: this.fb.control(normalizeBonusType(draft?.type)),
      context: this.fb.control(normalizeBonusContext(draft?.context)),
      description: this.fb.control(draft?.description ?? ''),
      baseValue: this.fb.control(draft?.baseValue ?? 0),
      levelsStep: this.fb.control<number | null>(draft?.levelsStep ?? null),
      sourceStat: this.fb.control<string | null>(draft?.sourceStat ?? null),
      scalingFactor: this.fb.control<number | null>(draft?.scalingFactor ?? null),
      sortOrder: this.fb.control(draft?.sortOrder ?? 0),
      isActive: this.fb.control(draft?.isActive ?? true),
    });
  }

  createQualityDraft(): EditableItemGenerationQuality {
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

  createBucketProfileDraft(): EditableItemGenerationBucketProfile {
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

  createFormulaDraft(scopeKey = 'hero_progression'): EditableBalanceFormula {
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

  createBonusTemplateDraft(): BonusTemplate {
    return {
      id: '',
      key: '',
      label: '',
      category: 'general',
      target: '',
      type: 'flat',
      context: 'global',
      description: '',
      baseValue: 0,
      levelsStep: null,
      sourceStat: null,
      scalingFactor: null,
      sortOrder: 0,
      isActive: true,
    };
  }

  toQuality(form: QualityEditorForm): EditableItemGenerationQuality {
    const value = form.getRawValue();

    return {
      id: value.id || null,
      key: value.key,
      label: trimText(value.label),
      multiplier: Number(value.multiplier),
      weight: nonNegativeInteger(value.weight),
      sortOrder: roundedNumber(value.sortOrder),
      isEnabled: value.isEnabled,
    };
  }

  toBucketProfile(
    form: BucketProfileEditorForm
  ): EditableItemGenerationBucketProfile {
    const value = form.getRawValue();

    return {
      id: value.id || null,
      key: toSlug(value.key),
      name: trimText(value.name),
      description: trimText(value.description),
      bucketCount: integerAtLeast(value.bucketCount, 1),
      baseValue: integerAtLeast(value.baseValue, 1),
      linearGrowth: nonNegativeInteger(value.linearGrowth),
      growthFactor: Math.max(1, Number(value.growthFactor)),
      roundingStep: integerAtLeast(value.roundingStep, 1),
      minIncrement: integerAtLeast(value.minIncrement, 1),
      isActive: value.isActive,
    };
  }

  toFormula(form: FormulaEditorForm): EditableBalanceFormula {
    const value = form.getRawValue();

    return {
      id: value.id || null,
      key: trimText(value.key),
      scopeKey: trimText(value.scopeKey),
      label: trimText(value.label),
      expression: trimText(value.expression),
      description: trimText(value.description),
      isEnabled: value.isEnabled,
    };
  }

  toBonusTemplate(form: BonusTemplateEditorForm): BonusTemplate {
    const value = form.getRawValue();

    return {
      id: value.id || '',
      key: toSlug(value.key || value.label),
      label: trimText(value.label),
      category: trimText(value.category),
      target: normalizeBonusTarget(trimText(value.target)),
      type: normalizeBonusType(value.type),
      context: normalizeBonusContext(value.context),
      description: trimText(value.description),
      baseValue: Number(value.baseValue ?? 0),
      levelsStep: value.levelsStep === null ? null : roundedNumber(value.levelsStep),
      sourceStat: value.sourceStat,
      scalingFactor:
        value.scalingFactor === null ? null : roundedNumber(value.scalingFactor),
      sortOrder: roundedNumber(value.sortOrder),
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

  patchFormula(
    form: FormulaEditorForm,
    draft: EditableBalanceFormula | BalanceFormula
  ) {
    form.reset({
      id: draft.id ?? '',
      key: draft.key,
      scopeKey: draft.scopeKey,
      label: draft.label,
      expression: draft.expression,
      description: draft.description ?? '',
      isEnabled: draft.isEnabled,
    });
  }

  patchBonusTemplate(form: BonusTemplateEditorForm, draft: BonusTemplate) {
    form.reset({
      id: draft.id ?? '',
      key: draft.key,
      label: draft.label,
      category: draft.category,
      target: draft.target,
      type: draft.type,
      context: draft.context,
      description: draft.description,
      baseValue: draft.baseValue,
      levelsStep: draft.levelsStep,
      sourceStat: draft.sourceStat,
      scalingFactor: draft.scalingFactor,
      sortOrder: draft.sortOrder,
      isActive: draft.isActive,
    });
  }
}
