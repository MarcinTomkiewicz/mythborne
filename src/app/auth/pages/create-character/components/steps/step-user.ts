import { Component, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { CreateCharacterProfileForm } from '../../../../../core/types/forms/create-character-form.types';

@Component({
  selector: 'app-step-user',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    DatePickerModule,
    ButtonModule,
  ],
  template: `
    <div [formGroup]="form()" class="mg-form flex-col gap-md">
      <h2 class="mg-section__title mg-section__title--xs mb-sm">Tell us about yourself</h2>

      <div class="flex-col gap-xs">
        <label for="name">Name</label>
        <input id="name" pInputText type="text" formControlName="name" />
      </div>

      <div class="flex-col gap-xs">
        <label for="birthday">Birthday (optional)</label>
        <p-datepicker id="birthday" formControlName="birthday" dateFormat="yy-mm-dd" showIcon />
      </div>

      <div class="flex-col gap-xs">
        <label for="city">City</label>
        <input id="city" pInputText type="text" formControlName="city" />
      </div>

      <div class="flex-col gap-xs">
        <label for="bio">Bio</label>
        <textarea id="bio" pInputText formControlName="bio" rows="3"></textarea>
      </div>

      <div class="mg-grid grid-cols-2 grid-cols-1-sm gap-md mt-lg">
        <div class="flex-col gap-xs">
          <label for="facebook">Facebook</label>
          <input id="facebook" pInputText type="text" formControlName="facebook" />
        </div>
        <div class="flex-col gap-xs">
          <label for="twitter">Twitter</label>
          <input id="twitter" pInputText type="text" formControlName="twitter" />
        </div>
        <div class="flex-col gap-xs">
          <label for="linkedin">LinkedIn</label>
          <input id="linkedin" pInputText type="text" formControlName="linkedin" />
        </div>
        <div class="flex-col gap-xs">
          <label for="instagram">Instagram</label>
          <input id="instagram" pInputText type="text" formControlName="instagram" />
        </div>
      </div>

      <div class="flex-row-end-center gap-sm mt-xl">
        <p-button type="button" label="Back" (click)="back.emit()" severity="secondary" />
        <p-button
          type="submit"
          [label]="submitting() ? 'Creating...' : 'Create character'"
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
  readonly back = output<void>();
  readonly submit = output<void>();
}
