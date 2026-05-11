import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { Auth } from '../../core/services/auth/auth';
import { getErrorMessage } from '../../core/utils/error-message';

@Component({
  selector: 'app-session-logout-button',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './session-logout-button.html',
})
export class SessionLogoutButton {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  readonly errorMessage = signal<string | null>(null);
  readonly isLoggingOut = signal(false);

  logout(): void {
    if (this.isLoggingOut()) {
      return;
    }

    this.errorMessage.set(null);
    this.isLoggingOut.set(true);

    this.auth.logout()
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.isLoggingOut.set(false);
          void this.router.navigateByUrl('/auth/login');
        },
        error: (error: unknown) => {
          this.errorMessage.set(getErrorMessage(error, 'Nie udało się wylogować.'));
          this.isLoggingOut.set(false);
        },
      });
  }
}
