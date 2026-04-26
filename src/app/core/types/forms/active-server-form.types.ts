import { FormControl, FormGroup } from '@angular/forms';

export type ActiveServerSelectorForm = FormGroup<{
  selectedServerId: FormControl<string>;
}>;
