import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from './auth';
import { AuthState } from './auth-state';

@Injectable()
export class LoginPageFacade {
  private readonly auth = inject(Auth);
  private readonly authState = inject(AuthState);
  private readonly router = inject(Router);

  login(
    credentials: { email: string; password: string },
    onError: (message: string) => void
  ) {
    this.auth.login(credentials.email, credentials.password).subscribe({
      next: () => {
        void this.router.navigateByUrl(
          this.authState.hero() ? '/hero/dashboard' : '/auth/create-character'
        );
      },
      error: () => {
        onError('Login failed. Check your credentials and try again.');
      },
    });
  }
}
