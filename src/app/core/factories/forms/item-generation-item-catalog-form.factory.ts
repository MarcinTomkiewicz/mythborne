import { Injectable, inject } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
} from '@angular/forms';
import {
  EditableItemGenerationAffix,
  EditableItemGenerationBase,
  EditableItemGenerationBonus,
} from '../../domain/item/item-generation-admin.model';

export type CatalogEntitySelectorForm = FormGroup<{
  selectedId: FormControl<string>;
}>;

export type BonusForm = FormGroup<{
  templateId: FormControl<string>;
  target: FormControl<string>;
  type: FormControl<'flat' | 'percent'>;
  value: FormControl<number>;
  description: FormControl<string>;
}>;

export type BaseEditorForm = FormGroup<{
  id: FormControl<string>;
  key: FormControl<string>;
  name: FormControl<string>;
  slot: FormControl<'weapon' | 'trinket' | 'armor' | 'shield'>;
  baseValue: FormControl<number>;
  description: FormControl<string>;
  bonuses: FormArray<BonusForm>;
}>;

export type AffixEditorForm = FormGroup<{
  id: FormControl<string>;
  key: FormControl<string>;
  kind: FormControl<'prefix' | 'suffix'>;
  name: FormControl<string>;
  goldValue: FormControl<number>;
  description: FormControl<string>;
  bonuses: FormArray<BonusForm>;
}>;

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
      type: this.fb.control<'flat' | 'percent'>(draft?.type ?? 'flat'),
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

  replaceBonuses(
    target: FormArray<BonusForm>,
    bonuses: EditableItemGenerationBonus[]
  ) {
    while (target.length) {
      target.removeAt(0);
    }

    bonuses.forEach((bonus) => target.push(this.createBonusForm(bonus)));
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
      key: value.key.trim(),
      name: value.name.trim(),
      slot: value.slot,
      baseValue: Math.max(1, Math.round(Number(value.baseValue))),
      description: value.description.trim(),
      bonuses: value.bonuses
        .map((bonus) => this.normalizeBonus(bonus))
        .filter((bonus) => bonus.target.length > 0),
    };
  }

  toAffix(form: AffixEditorForm): EditableItemGenerationAffix {
    const value = form.getRawValue();

    return {
      id: value.id || null,
      key: value.key.trim(),
      kind: value.kind,
      name: value.name.trim(),
      goldValue: Math.max(0, Math.round(Number(value.goldValue))),
      description: value.description.trim(),
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
      target: bonus.target.trim(),
      type: bonus.type,
      value: Math.round(Number(bonus.value)),
      description: bonus.description.trim(),
    };
  }
}
