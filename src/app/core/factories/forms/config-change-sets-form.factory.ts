import { Injectable, inject } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { ConfigChangeSetFilterForm } from '../../types/forms/config-change-sets-form.types';

@Injectable({ providedIn: 'root' })
export class ConfigChangeSetsFormFactory {
  private readonly fb = inject(NonNullableFormBuilder);

  createFilterForm(): ConfigChangeSetFilterForm {
    return this.fb.group({
      query: this.fb.control(''),
      status: this.fb.control<ConfigChangeSetFilterForm['controls']['status']['value']>(''),
      changelogVisibility:
        this.fb.control<ConfigChangeSetFilterForm['controls']['changelogVisibility']['value']>(''),
    });
  }
}
