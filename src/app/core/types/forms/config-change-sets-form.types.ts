import { FormControl, FormGroup } from '@angular/forms';
import {
  ConfigChangeStatus,
  ConfigChangeVisibility,
} from '../config-governance.types';

export type ConfigChangeSetFilterForm = FormGroup<{
  query: FormControl<string>;
  status: FormControl<ConfigChangeStatus | ''>;
  changelogVisibility: FormControl<ConfigChangeVisibility | ''>;
}>;
