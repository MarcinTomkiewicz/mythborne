import { Component, computed, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FormFields } from '../../../shared/form-fields/form-fields';
import { ItemGenerationBalancePageFacade } from '../../../core/services/items/item-generation-balance-page.facade';
import {
  createQualitySelectorFields,
  QUALITY_EDITOR_FIELDS,
} from '../../../core/config/forms/balance-form.config';

@Component({
  selector: 'app-quality-balance-section',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, FormFields],
  templateUrl: './quality-balance-section.html',
  host: { style: 'display:block;width:100%;' },
})
export class QualityBalanceSection {
  readonly page = inject(ItemGenerationBalancePageFacade);
  readonly selectorFields = computed(() => createQualitySelectorFields(this.page.quality.items()));
  readonly editorFields = QUALITY_EDITOR_FIELDS;
}
