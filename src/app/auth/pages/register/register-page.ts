import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RegisterPageFacade } from '../../../core/services/auth/register-page.facade';
import { FormFields } from '../../../shared/form-fields/form-fields';

@Component({
  selector: 'app-register-page',
  standalone: true,
  host: {
    class: 'd-block w-100 min-h-full',
  },
  imports: [ButtonModule, FormFields, ReactiveFormsModule, RouterLink],
  providers: [RegisterPageFacade],
  templateUrl: './register-page.html',
})
export class RegisterPage {
  readonly page = inject(RegisterPageFacade);
}
