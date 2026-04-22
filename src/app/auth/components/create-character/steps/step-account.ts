import { Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';


@Component({
  selector: 'app-step-account',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextModule, ButtonModule],
  template: `
    <div [formGroup]="form()" class="mg-form flex-col gap-md w-100">
      <h2 class="mg-section__title mg-section__title--xs mb-sm">Create your account</h2>

      <div class="flex-col gap-xs">
        <label for="characterName">Hero Name</label>
        <input
          id="characterName"
          type="text"
          formControlName="characterName"
          pInputText
        />
      </div>

      <div class="flex-col gap-xs">
        <label for="email">Email</label>
        <input id="email" type="email" formControlName="email" pInputText />
      </div>

      <div class="flex-col gap-xs">
        <label for="password">Password</label>
        <input
          id="password"
          type="password"
          formControlName="password"
          pInputText
        />
      </div>

      <p-button type="button" label="Next" (onClick)="next.emit()"></p-button>
    </div>
  `,
})
export class StepAccount {
  form = input.required<FormGroup>();
  next = output<void>();
}
