import { FormControl, FormGroup } from '@angular/forms';
import { ConfigChangeValueTarget } from '../../enums/config-governance.enum';
import {
  ConfigChangeStatus,
  ConfigChangeVisibility,
} from '../config-governance.types';

export type ConfigChangeSetFilterForm = FormGroup<{
  query: FormControl<string>;
  status: FormControl<ConfigChangeStatus | ''>;
  changelogVisibility: FormControl<ConfigChangeVisibility | ''>;
}>;

export type ConfigChangeSetDraftForm = FormGroup<{
  title: FormControl<string>;
  reason: FormControl<string>;
  changelogVisibility: FormControl<ConfigChangeVisibility>;
  changelogTitle: FormControl<string>;
  changelogBody: FormControl<string>;
}>;

export type ConfigChangeEntryDraftForm = FormGroup<{
  configDefinitionId: FormControl<string>;
  valueTarget: FormControl<ConfigChangeValueTarget>;
  newValue: FormControl<string>;
}>;

export type ConfigChangeSetCancelForm = FormGroup<{
  cancelledReason: FormControl<string>;
}>;
