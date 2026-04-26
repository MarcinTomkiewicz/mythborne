import { Component, computed, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FormFields } from '../../../shared/form-fields/form-fields';
import { ItemGenerationBalancePageFacade } from '../../../core/services/items/item-generation-balance-page.facade';
import {
  BUCKET_PROFILE_EDITOR_FIELDS,
  createBucketProfileSelectorFields,
} from '../../../core/config/forms/balance-form.config';

@Component({
  selector: 'app-bucket-profile-balance-section',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, FormFields],
  templateUrl: './bucket-profile-balance-section.html',
  host: { class: 'd-block w-100' },
})
export class BucketProfileBalanceSection {
  readonly page = inject(ItemGenerationBalancePageFacade);
  readonly selectorFields = computed(() =>
    createBucketProfileSelectorFields(this.page.profile.items())
  );
  readonly editorFields = BUCKET_PROFILE_EDITOR_FIELDS;
}
