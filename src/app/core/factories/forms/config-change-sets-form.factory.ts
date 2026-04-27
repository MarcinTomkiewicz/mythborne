import { Injectable, inject } from '@angular/core';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import {
  ConfigChangeValueTarget,
  ConfigChangeVisibilityKey,
} from '../../enums/config-governance.enum';
import {
  ConfigChangeEntryDraftForm,
  ConfigChangeSetDraftForm,
  ConfigChangeSetFilterForm,
} from '../../types/forms/config-change-sets-form.types';
import { ConfigChangeVisibility } from '../../types/config-governance.types';
import {
  publicChangelogValidator,
  trimRequiredValidator,
} from '../../validators/form.validators';

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

  createDraftForm(): ConfigChangeSetDraftForm {
    return this.fb.group(
      {
        title: this.fb.control('', trimRequiredValidator()),
        reason: this.fb.control('', trimRequiredValidator()),
        changelogVisibility: this.fb.control<ConfigChangeVisibility>(
          ConfigChangeVisibilityKey.None,
        ),
        changelogTitle: this.fb.control(''),
        changelogBody: this.fb.control(''),
      },
      {
        validators: publicChangelogValidator(
          'changelogVisibility',
          'changelogTitle',
          'changelogBody',
        ),
      },
    );
  }

  createEntryDraftForm(): ConfigChangeEntryDraftForm {
    return this.fb.group({
      configDefinitionId: this.fb.control('', Validators.required),
      valueTarget: this.fb.control(ConfigChangeValueTarget.Global),
      newValue: this.fb.control('', trimRequiredValidator()),
    });
  }
}
