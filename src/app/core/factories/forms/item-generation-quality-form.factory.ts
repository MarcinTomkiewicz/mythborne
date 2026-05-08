import { Injectable, inject } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { EditableItemGenerationQuality } from '../../domain/item/item-generation-admin.model';
import { ItemQualityKey } from '../../domain/item/item-generation.model';
import {
  QualityEditorForm,
  QualitySelectorForm,
} from '../../types/forms/item-generation-balance-form.types';
import { nonNegativeInteger, roundedNumber } from '../../utils/number';
import { trimText } from '../../utils/normalize-text';

@Injectable({ providedIn: 'root' })
export class ItemGenerationQualityFormFactory {
  private readonly fb = inject(NonNullableFormBuilder);

  createSelectorForm(): QualitySelectorForm {
    return this.fb.group({
      selectedId: this.fb.control(''),
    });
  }

  createEditorForm(draft?: EditableItemGenerationQuality): QualityEditorForm {
    return this.fb.group({
      id: this.fb.control(draft?.id ?? ''),
      key: this.fb.control<ItemQualityKey>(draft?.key ?? 'normal'),
      label: this.fb.control(draft?.label ?? 'Normal'),
      multiplier: this.fb.control(draft?.multiplier ?? 1),
      requirementMultiplier: this.fb.control(draft?.requirementMultiplier ?? 1),
      weight: this.fb.control(draft?.weight ?? 10),
      sortOrder: this.fb.control(draft?.sortOrder ?? 10),
      isEnabled: this.fb.control(draft?.isEnabled ?? true),
    });
  }

  createDraft(): EditableItemGenerationQuality {
    return {
      id: null,
      key: 'normal',
      label: 'Normal',
      multiplier: 1,
      requirementMultiplier: 1,
      weight: 10,
      sortOrder: 10,
      isEnabled: true,
    };
  }

  toDraft(form: QualityEditorForm): EditableItemGenerationQuality {
    const value = form.getRawValue();

    return {
      id: value.id || null,
      key: value.key,
      label: trimText(value.label),
      multiplier: Number(value.multiplier),
      requirementMultiplier: Number(value.requirementMultiplier),
      weight: nonNegativeInteger(value.weight),
      sortOrder: roundedNumber(value.sortOrder),
      isEnabled: value.isEnabled,
    };
  }

  patch(form: QualityEditorForm, draft: EditableItemGenerationQuality): void {
    form.reset({
      id: draft.id ?? '',
      key: draft.key,
      label: draft.label,
      multiplier: draft.multiplier,
      requirementMultiplier: draft.requirementMultiplier,
      weight: draft.weight,
      sortOrder: draft.sortOrder,
      isEnabled: draft.isEnabled,
    });
  }
}
