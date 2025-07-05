import { Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-step-user',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    DatePickerModule,
    ButtonModule
  ],
  template: `
    <div [formGroup]="form()" class="form-section">
      <h2>Tell us about yourself</h2>

      <div class="p-field">
        <label for="name">Name</label>
        <input id="name" pInputText type="text" formControlName="name" />
      </div>

      <div class="p-field">
        <label for="birthday">Birthday</label>
        <p-datepicker id="birthday" formControlName="birthday" dateFormat="yy-mm-dd" showIcon />
      </div>

      <div class="p-field">
        <label for="city">City</label>
        <input id="city" pInputText type="text" formControlName="city" />
      </div>

      <div class="p-field">
        <label for="bio">Bio</label>
        <textarea id="bio" pInputText formControlName="bio" rows="3"></textarea>
      </div>

      <div class="socials grid grid-cols-2 gap-4 mt-4">
        <div class="p-field">
          <label for="facebook">Facebook</label>
          <input id="facebook" pInputText type="text" formControlName="facebook" />
        </div>
        <div class="p-field">
          <label for="twitter">Twitter</label>
          <input id="twitter" pInputText type="text" formControlName="twitter" />
        </div>
        <div class="p-field">
          <label for="linkedin">LinkedIn</label>
          <input id="linkedin" pInputText type="text" formControlName="linkedin" />
        </div>
        <div class="p-field">
          <label for="instagram">Instagram</label>
          <input id="instagram" pInputText type="text" formControlName="instagram" />
        </div>
      </div>

      <div class="actions mt-6 flex gap-2 justify-end">
        <p-button pButton type="button" label="Back" (click)="back.emit()" severity="secondary"></p-button>
        <p-button pButton type="submit" label="Submit" (click)="submit.emit()" severity="success"></p-button>
      </div>
    </div>
  `
})
export class StepUser {
  form = input.required<FormGroup>();
  back = output<void>();
  submit = output<void>();
}
