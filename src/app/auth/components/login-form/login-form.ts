import { Component, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { LOGIN_FIELDS } from '../../../core/config/forms/auth-form.config';
import { FormFields } from '../../../shared/form-fields/form-fields';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, FormFields],
  templateUrl: './login-form.html',
  host: { class: 'd-block w-100' },
})
export class LoginForm {
  showHeader = input<boolean>(true);
  submitting = input(false);
  errorMessage = input<string | null>(null);
  readonly login = output<{ email: string; password: string }>();

  private readonly fb = new FormBuilder();
  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  readonly fields = LOGIN_FIELDS;

  submit() {
    if (this.submitting()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.value;
    this.login.emit({ email: email!, password: password! });
  }
}
