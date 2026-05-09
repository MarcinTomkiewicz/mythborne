import { FormControl } from '@angular/forms';

export interface EditableVariableView {
  key: string;
  control: FormControl<number>;
  label: string;
  helpText: string;
}
