import { computed, Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { Auth } from './auth';
import { AuthState } from './auth-state';

@Injectable()
export class LoginPageFacade {
  private readonly auth = inject(Auth);
  private readonly authState = inject(AuthState);
  private readonly router = inject(Router);
  readonly errorMessage = signal<string | null>(null);
  readonly isSubmitting = signal(false);
  readonly isLoggedIn = computed(() => !!this.authState.user());

  login(credentials: { email: string; password: string }) {
    if (this.isSubmitting()) {
      return;
    }

    this.errorMessage.set(null);
    this.isSubmitting.set(true);

    this.auth.login(credentials.email, credentials.password).pipe(
      finalize(() => this.isSubmitting.set(false)),
    ).subscribe({
      next: () => {
        void this.router.navigateByUrl('/auth/server-entry');
      },
      error: () => {
        this.errorMessage.set('Nie udało się zalogować. Sprawdź email i hasło.');
      },
    });
  }
}
