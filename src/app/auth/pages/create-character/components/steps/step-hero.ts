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
      <h2 class="mg-section__title mg-section__title--xs m-0">Nazwij bohatera</h2>
      <p class="m-0 color-muted">
        Nazwa musi być unikalna na wybranym serwerze. Sprawdzimy ją podczas tworzenia bohatera.
      </p>

      <app-form-fields [form]="form()" [fields]="fields" />

      <div class="flex-row-end-center gap-sm mt-xl">
        @if (showBack()) {
          <p-button type="button" label="Wstecz" severity="secondary" (click)="back.emit()" />
        }
        <p-button type="button" label="Dalej" (click)="next.emit()" />
      </div>
    </div>
  `,
})
export class StepHero {
  readonly form = input.required<CreateCharacterHeroForm>();
  readonly showBack = input(true);
  readonly fields = CREATE_CHARACTER_HERO_FIELDS;
  readonly back = output<void>();
  readonly next = output<void>();
}
