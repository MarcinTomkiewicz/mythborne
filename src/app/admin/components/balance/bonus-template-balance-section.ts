import { Component, computed, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormFields } from '../../../shared/form-fields/form-fields';
import { ItemGenerationBalancePageFacade } from '../../../core/services/items/item-generation-balance-page.facade';
import {
  createBonusTemplateEditorFields,
  createBonusTemplateSelectorFields,
} from '../../../core/config/forms/balance-form.config';

@Component({
  selector: 'app-bonus-template-balance-section',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, FormFields],
  templateUrl: './bonus-template-balance-section.html',
  host: { class: 'd-block w-100' },
})
export class BonusTemplateBalanceSection {
  readonly page = inject(ItemGenerationBalancePageFacade);
  readonly selectorFields = computed(() =>
    createBonusTemplateSelectorFields(this.page.bonusAdminData().templates)
  );
  readonly editorFields = computed(() =>
    createBonusTemplateEditorFields(
      this.page.bonusAdminData().targets,
      this.page.bonusAdminData().categories
    )
  );
}
