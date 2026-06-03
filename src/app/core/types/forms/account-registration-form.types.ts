import { FormControl, FormGroup } from '@angular/forms';

export type AccountRegistrationForm = FormGroup<{
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
}>;
