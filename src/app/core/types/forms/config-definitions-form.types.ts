import { FormControl, FormGroup } from '@angular/forms';
import {
  ConfigGovernanceScope,
  ConfigManagedEntityType,
} from '../config-governance.types';

export type ConfigDefinitionFilterForm = FormGroup<{
  query: FormControl<string>;
  governanceScope: FormControl<ConfigGovernanceScope | ''>;
  managedEntityType: FormControl<ConfigManagedEntityType | ''>;
}>;
