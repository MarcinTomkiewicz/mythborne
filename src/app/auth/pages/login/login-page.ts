import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { LoginPageFacade } from '../../../core/services/auth/login-page.facade';
import { LoginForm } from '../../components/login-form/login-form';

@Component({
  selector: 'app-login-page',
  standalone: true,
  host: {
    class: 'd-block w-100 min-h-full',
  },
  imports: [ButtonModule, LoginForm, RouterLink],
  providers: [LoginPageFacade],
  templateUrl: './login-page.html',
})
export class LoginPage {
  readonly page = inject(LoginPageFacade);

  handleLogin({ email, password }: { email: string; password: string }) {
    this.page.login({ email, password });
  }
}
