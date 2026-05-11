import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from './auth';

@Injectable()
export class LoginPageFacade {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  login(
    credentials: { email: string; password: string },
    onError: (message: string) => void
  ) {
    this.auth.login(credentials.email, credentials.password).subscribe({
      next: () => {
        void this.router.navigateByUrl('/auth/server-entry');
      },
      error: () => {
        onError('Login failed. Check your credentials and try again.');
      },
    });
  }
}
