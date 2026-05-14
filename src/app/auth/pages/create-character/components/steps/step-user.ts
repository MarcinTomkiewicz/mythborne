import { Component, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CreateCharacterProfileForm } from '../../../../../core/types/forms/create-character-form.types';
import {
  CREATE_CHARACTER_PROFILE_MAIN_FIELDS,
  CREATE_CHARACTER_PROFILE_SOCIAL_FIELDS,
} from '../../../../../core/config/forms/auth-form.config';
import { FormFields } from '../../../../../shared/form-fields/form-fields';

@Component({
  selector: 'app-step-user',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, FormFields],
  template: `
    <div [formGroup]="form()" class="mg-form flex-col gap-md">
      <h2 class="mg-section__title mg-section__title--xs mb-sm">Opowiedz o sobie</h2>

      <app-form-fields [form]="form()" [fields]="mainFields" />

      <div class="mg-grid grid-cols-2 grid-cols-1-sm gap-md mt-lg">
        <app-form-fields [form]="form()" [fields]="socialFields" />
      </div>

      <div class="flex-row-end-center gap-sm mt-xl">
        <p-button type="button" label="Wstecz" (click)="back.emit()" severity="secondary" />
        <p-button
          type="submit"
          [label]="submitting() ? 'Tworzenie...' : 'Stwórz bohatera'"
          [disabled]="submitting()"
          (click)="submit.emit()"
          severity="success"
        />
      </div>
    </div>
  `,
})
export class StepUser {
  readonly form = input.required<CreateCharacterProfileForm>();
  readonly submitting = input(false);
  readonly mainFields = CREATE_CHARACTER_PROFILE_MAIN_FIELDS;
  readonly socialFields = CREATE_CHARACTER_PROFILE_SOCIAL_FIELDS;
  readonly back = output<void>();
  readonly submit = output<void>();
}
