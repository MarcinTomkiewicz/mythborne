import { Component, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CreateCharacterHeroForm } from '../../../../../core/types/forms/create-character-form.types';
import { CREATE_CHARACTER_HERO_FIELDS } from '../../../../../core/config/forms/auth-form.config';
import { FormFields } from '../../../../../shared/form-fields/form-fields';

@Component({
  selector: 'app-step-hero',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, FormFields],
  template: `
    <div [formGroup]="form()" class="mg-form flex-col gap-md w-100">
      <h2 class="mg-section__title mg-section__title--xs mb-sm">Name your hero</h2>

      <app-form-fields [form]="form()" [fields]="fields" />

      <div class="flex-row-end-center gap-sm mt-xl">
        <p-button type="button" label="Back" severity="secondary" (click)="back.emit()" />
        <p-button type="button" label="Next" (click)="next.emit()" />
      </div>
    </div>
  `,
})
export class StepHero {
  readonly form = input.required<CreateCharacterHeroForm>();
  readonly fields = CREATE_CHARACTER_HERO_FIELDS;
  readonly back = output<void>();
  readonly next = output<void>();
}
