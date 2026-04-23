import { Component, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CreateCharacterAccountForm } from '../../../../../core/types/forms/create-character-form.types';

@Component({
  selector: 'app-step-account',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextModule, ButtonModule],
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
        <div class="flex-col gap-xs">
          <label for="email">Email</label>
          <input id="email" type="email" formControlName="email" pInputText />
        </div>

        <div class="flex-col gap-xs">
          <label for="password">Password</label>
          <input id="password" type="password" formControlName="password" pInputText />
        </div>
      }

      <p-button type="button" label="Next" (onClick)="next.emit()"></p-button>
    </div>
  `,
})
export class StepAccount {
  readonly form = input.required<CreateCharacterAccountForm>();
  readonly isExistingAccount = input(false);
  readonly existingEmail = input('');
  readonly next = output<void>();
}
