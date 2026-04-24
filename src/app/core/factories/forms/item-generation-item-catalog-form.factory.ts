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
import { normalizeBonusTarget, normalizeBonusType } from '../../utils/bonus';
import { integerAtLeast, nonNegativeInteger, roundedNumber } from '../../utils/number';
import { trimText } from '../../utils/normalize-text';

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
      templateId: this.fb.control(draft?.templateId ?? ''),
      target: this.fb.control(draft?.target ?? ''),
      type: this.fb.control(normalizeBonusType(draft?.type)),
      value: this.fb.control(draft?.value ?? 1),
      description: this.fb.control(draft?.description ?? ''),
    });
  }

  createBaseEditorForm(draft?: EditableItemGenerationBase): BaseEditorForm {
    return this.fb.group({
      id: this.fb.control(draft?.id ?? ''),
      key: this.fb.control(draft?.key ?? ''),
      name: this.fb.control(draft?.name ?? ''),
      slot: this.fb.control(draft?.slot ?? 'weapon'),
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
      slot: 'weapon',
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
      slot: draft.slot,
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
      key: trimText(value.key),
      name: trimText(value.name),
      slot: value.slot,
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
      key: trimText(value.key),
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
    return {
      templateId: bonus.templateId || null,
      target: normalizeBonusTarget(trimText(bonus.target)),
      type: normalizeBonusType(bonus.type),
      value: roundedNumber(bonus.value),
      description: trimText(bonus.description),
    };
  }
}
