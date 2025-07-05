import { Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-step-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule],
  template: `
    <div [formGroup]="form()" class="flex flex-col gap-4 w-full">
      <h2 class="text-xl font-semibold mb-2">Create your account</h2>

      <div class="flex flex-col gap-1">
        <label for="email">Email</label>
        <input id="email" type="email" formControlName="email" pInputText />
      </div>

      <div class="flex flex-col gap-1">
        <label for="password">Password</label>
        <input
          id="password"
          type="password"
          formControlName="password"
          pInputText
        />
      </div>

      <div class="flex flex-col gap-1">
        <label for="characterName">Hero Name</label>
        <input
          id="characterName"
          type="text"
          formControlName="characterName"
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
