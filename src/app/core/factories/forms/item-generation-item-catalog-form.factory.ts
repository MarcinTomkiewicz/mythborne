import { Injectable, inject } from '@angular/core';
import { FormArray, NonNullableFormBuilder } from '@angular/forms';
import {
  EditableItemGenerationAffix,
  EditableItemGenerationBase,
  EditableItemGenerationBonus,
  CatalogSection,
} from '../../domain/item/item-generation-admin.model';
import {
  AffixEditorForm,
  BaseEditorForm,
  BonusForm,
  CatalogEntitySelectorForm,
} from '../../types/forms/item-generation-item-catalog-form.types';
import { replaceFormArray } from '../../utils/form-controls';
import { normalizeBonusScope, normalizeBonusTarget, normalizeBonusType } from '../../utils/bonus';
import { integerAtLeast, nonNegativeInteger, roundedNumber } from '../../utils/number';
import { trimText } from '../../utils/normalize-text';
import { toSlug } from '../../utils/slug';

@Injectable({ providedIn: 'root' })
export class ItemGenerationItemCatalogFormFactory {
  private readonly fb = inject(NonNullableFormBuilder);

  createSelectorForm(): CatalogEntitySelectorForm {
    return this.fb.group({
      selectedId: this.fb.control(''),
    });
  }

  createBonusForm(draft?: EditableItemGenerationBonus): BonusForm {
    return this.fb.group({
      templateId: this.fb.control<string | null>(draft?.templateId ?? null),
      category: this.fb.control(draft?.category ?? ''),
      templateLabel: this.fb.control(draft?.templateLabel ?? ''),
      target: this.fb.control(draft?.target ?? ''),
      type: this.fb.control(normalizeBonusType(draft?.type)),
      scope: this.fb.control(normalizeBonusScope(draft?.scope)),
      baseValue: this.fb.control(draft?.baseValue ?? 1),
      levelsStep: this.fb.control<number | null>(draft?.levelsStep ?? null),
      sourceStat: this.fb.control<string | null>(draft?.sourceStat ?? null),
      scalingFactor: this.fb.control<number | null>(draft?.scalingFactor ?? null),
      description: this.fb.control(draft?.description ?? ''),
      qualityScalesValue: this.fb.control(draft?.qualityScalesValue ?? false),
    });
  }

  createBaseEditorForm(draft?: EditableItemGenerationBase): BaseEditorForm {
    return this.fb.group({
      id: this.fb.control(draft?.id ?? ''),
      key: this.fb.control(draft?.key ?? ''),
      name: this.fb.control(draft?.name ?? ''),
      baseTypeKey: this.fb.control(draft?.baseTypeKey ?? ''),
      baseValue: this.fb.control(draft?.baseValue ?? 100),
      description: this.fb.control(draft?.description ?? ''),
      bonuses: this.fb.array(
        (draft?.bonuses ?? []).map((bonus) => this.createBonusForm(bonus))
      ),
    });
  }

  createAffixEditorForm(draft?: EditableItemGenerationAffix): AffixEditorForm {
    return this.fb.group({
      id: this.fb.control(draft?.id ?? ''),
      key: this.fb.control(draft?.key ?? ''),
      kind: this.fb.control<'prefix' | 'suffix'>(draft?.kind ?? 'prefix'),
      name: this.fb.control(draft?.name ?? ''),
      goldValue: this.fb.control(draft?.goldValue ?? 100),
      description: this.fb.control(draft?.description ?? ''),
      bonuses: this.fb.array(
        (draft?.bonuses ?? []).map((bonus) => this.createBonusForm(bonus))
      ),
    });
  }

  createBaseDraft(): EditableItemGenerationBase {
    return {
      id: null,
      key: '',
      name: '',
      baseTypeKey: '',
      baseTypeLabel: '',
      equipmentSlotGroup: '',
      handUsage: '',
      baseValue: 100,
      description: '',
      bonuses: [],
    };
  }

  createAffixDraft(kind: Extract<CatalogSection, 'prefix' | 'suffix'>): EditableItemGenerationAffix {
    return {
      id: null,
      key: '',
      kind,
      name: '',
      goldValue: 100,
      description: '',
      bonuses: [],
    };
  }

  replaceBonuses(
    target: FormArray<BonusForm>,
    bonuses: EditableItemGenerationBonus[]
  ) {
    replaceFormArray(
      target,
      bonuses.map((bonus) => this.createBonusForm(bonus))
    );
  }

  patchBase(form: BaseEditorForm, draft: EditableItemGenerationBase) {
    form.patchValue({
      id: draft.id ?? '',
      key: draft.key,
      name: draft.name,
      baseTypeKey: draft.baseTypeKey,
      baseValue: draft.baseValue,
      description: draft.description,
    });
    this.replaceBonuses(form.controls.bonuses, draft.bonuses);
  }

  patchAffix(form: AffixEditorForm, draft: EditableItemGenerationAffix) {
    form.patchValue({
      id: draft.id ?? '',
      key: draft.key,
      kind: draft.kind,
      name: draft.name,
      goldValue: draft.goldValue,
      description: draft.description,
    });
    this.replaceBonuses(form.controls.bonuses, draft.bonuses);
  }

  toBase(form: BaseEditorForm): EditableItemGenerationBase {
    const value = form.getRawValue();

    return {
      id: value.id || null,
      key: toSlug(value.key || value.name),
      name: trimText(value.name),
      baseTypeKey: trimText(value.baseTypeKey),
      baseTypeLabel: '',
      equipmentSlotGroup: '',
      handUsage: '',
      baseValue: integerAtLeast(value.baseValue, 1),
      description: trimText(value.description),
      bonuses: value.bonuses
        .map((bonus) => this.normalizeBonus(bonus))
        .filter((bonus) => bonus.target.length > 0),
    };
  }

  toAffix(form: AffixEditorForm): EditableItemGenerationAffix {
    const value = form.getRawValue();

    return {
      id: value.id || null,
      key: toSlug(value.key || value.name),
      kind: value.kind,
      name: trimText(value.name),
      goldValue: nonNegativeInteger(value.goldValue),
      description: trimText(value.description),
      bonuses: value.bonuses
        .map((bonus) => this.normalizeBonus(bonus))
        .filter((bonus) => bonus.target.length > 0),
    };
  }

  private normalizeBonus(
    bonus: EditableItemGenerationBonus
  ): EditableItemGenerationBonus {
    const scope = normalizeBonusScope(bonus.scope);

    return {
      templateId: bonus.templateId || null,
      category: trimText(bonus.category),
      templateLabel: trimText(bonus.templateLabel),
      target: normalizeBonusTarget(trimText(bonus.target)),
      type: normalizeBonusType(bonus.type),
      scope,
      baseValue: roundedNumber(bonus.baseValue),
      levelsStep: bonus.levelsStep === null ? null : roundedNumber(bonus.levelsStep),
      sourceStat: bonus.sourceStat,
      scalingFactor:
        bonus.scalingFactor === null ? null : roundedNumber(bonus.scalingFactor),
      description: trimText(bonus.description),
      qualityScalesValue: bonus.qualityScalesValue ?? false,
    };
  }
}
