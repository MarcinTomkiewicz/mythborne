import { Component, inject, viewChild } from '@angular/core';
import { LoginPageFacade } from '../../../core/services/auth/login-page.facade';
import { LoginForm } from '../../components/login-form/login-form';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [LoginForm],
  providers: [LoginPageFacade],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage {
  private readonly page = inject(LoginPageFacade);
  private readonly form = viewChild(LoginForm);

  handleLogin({ email, password }: { email: string; password: string }) {
    this.page.login({ email, password }, (message) => this.form()?.setError(message));
  }
}
