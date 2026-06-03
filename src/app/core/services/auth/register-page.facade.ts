import { Injectable, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ACCOUNT_REGISTRATION_FIELDS } from '../../config/forms/auth-form.config';
import { AccountRegistrationForm } from '../../types/forms/account-registration-form.types';
import { matchingControlsValidator } from '../../validators/form.validators';
import { Auth } from './auth';

@Injectable()
export class RegisterPageFacade {
  private readonly auth = inject(Auth);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);

  readonly fields = ACCOUNT_REGISTRATION_FIELDS;
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly isSubmitting = signal(false);
  readonly form: AccountRegistrationForm = this.fb.group(
    {
      email: this.fb.control('', [Validators.required, Validators.email]),
      password: this.fb.control('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: this.fb.control('', [Validators.required]),
    },
    {
      validators: matchingControlsValidator('password', 'confirmPassword', 'passwordMismatch'),
    },
  );

  register(): void {
    if (this.isSubmitting()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();

    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.isSubmitting.set(true);

    this.auth.registerAccount(email, password).pipe(
      finalize(() => this.isSubmitting.set(false)),
    ).subscribe({
      next: (result) => {
        if (result.isSignedIn) {
          void this.router.navigateByUrl('/auth/server-entry');
          return;
        }

        this.successMessage.set(
          result.requiresEmailConfirmation
            ? 'Konto zostało utworzone. Sprawdź email i potwierdź rejestrację, a potem zaloguj się.'
            : 'Konto zostało utworzone. Możesz się teraz zalogować.',
        );
        this.form.reset();
      },
      error: () => {
        this.errorMessage.set('Nie udało się założyć konta. Sprawdź dane i spróbuj ponownie.');
      },
    });
  }

  hasPasswordMismatch(): boolean {
    return this.form.hasError('passwordMismatch') &&
      this.form.controls.confirmPassword.touched;
  }
}
