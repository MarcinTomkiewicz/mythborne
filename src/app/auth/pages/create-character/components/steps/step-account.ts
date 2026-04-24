import { Component, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CreateCharacterAccountForm } from '../../../../../core/types/forms/create-character-form.types';
import { CREATE_CHARACTER_ACCOUNT_FIELDS } from '../../../../../core/config/forms/auth-form.config';
import { FormFields } from '../../../../../shared/form-fields/form-fields';

@Component({
  selector: 'app-step-account',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextModule, ButtonModule, FormFields],
  template: `
    <div [formGroup]="form()" class="mg-form flex-col gap-md w-100">
      <h2 class="mg-section__title mg-section__title--xs mb-sm">Create your account</h2>

      @if (isExistingAccount()) {
        <div class="mg-card bg-surface-secondary border-default flex-col gap-sm w-100">
          <p class="mb-0 text-sm text-muted">You are already signed in.</p>
          <div class="flex-col gap-xs">
            <label for="existingEmail">Account Email</label>
            <input id="existingEmail" type="email" [value]="existingEmail()" readonly pInputText />
          </div>
        </div>
      } @else {
        <app-form-fields [form]="form()" [fields]="fields" />
      }

      <p-button type="button" label="Next" (onClick)="next.emit()"></p-button>
    </div>
  `,
})
export class StepAccount {
  readonly form = input.required<CreateCharacterAccountForm>();
  readonly isExistingAccount = input(false);
  readonly existingEmail = input('');
  readonly fields = CREATE_CHARACTER_ACCOUNT_FIELDS;
  readonly next = output<void>();
}
