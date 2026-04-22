import { Component, inject, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../../core/services/auth/auth';
import { AuthState } from '../../../core/services/auth/auth-state';
import { LoginForm } from '../../components/login-form/login-form';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [LoginForm],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage {
  private readonly auth = inject(Auth);
  private readonly authState = inject(AuthState);
  private readonly router = inject(Router);
  private readonly form = viewChild(LoginForm);

  handleLogin({ email, password }: { email: string; password: string }) {
    this.auth.login(email, password).subscribe({
      next: () => {
        void this.router.navigateByUrl(
          this.authState.hero() ? '/hero/dashboard' : '/auth/create-character'
        );
      },
      error: () => {
        this.form()?.setError('Login failed. Check your credentials and try again.');
      },
    });
  }
}
