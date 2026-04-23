import { Component, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CreateCharacterHeroForm } from '../../../../../core/types/forms/create-character-form.types';

@Component({
  selector: 'app-step-hero',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextModule, ButtonModule],
  template: `
    <div [formGroup]="form()" class="mg-form flex-col gap-md w-100">
      <h2 class="mg-section__title mg-section__title--xs mb-sm">Name your hero</h2>

      <div class="flex-col gap-xs">
        <label for="characterName">Hero Name</label>
        <input id="characterName" type="text" formControlName="characterName" pInputText />
      </div>

      <div class="flex-row-end-center gap-sm mt-xl">
        <p-button type="button" label="Back" severity="secondary" (click)="back.emit()" />
        <p-button type="button" label="Next" (click)="next.emit()" />
      </div>
    </div>
  `,
})
export class StepHero {
  readonly form = input.required<CreateCharacterHeroForm>();
  readonly back = output<void>();
  readonly next = output<void>();
}
