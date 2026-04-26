import { Injectable, inject } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { ConfigDefinitionFilterForm } from '../../types/forms/config-definitions-form.types';

@Injectable({ providedIn: 'root' })
export class ConfigDefinitionsFormFactory {
  private readonly fb = inject(NonNullableFormBuilder);

  createFilterForm(): ConfigDefinitionFilterForm {
    return this.fb.group({
      query: this.fb.control(''),
      governanceScope: this.fb.control<ConfigDefinitionFilterForm['controls']['governanceScope']['value']>(''),
      managedEntityType: this.fb.control<ConfigDefinitionFilterForm['controls']['managedEntityType']['value']>(''),
    });
  }
}
