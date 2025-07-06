import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { StepAccount } from './steps/step-account';
import { StepUser } from './steps/step-user';
import { StepOrigin } from './steps/step-origin';
import { Origin } from '../../../core/domain/origin/origin.model';

@Component({
  selector: 'app-create-character',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    StepAccount,
    StepUser,
    StepOrigin,
  ],
  templateUrl: './create-character.html',
})
export class CreateCharacter {
  private readonly fb = inject(FormBuilder);

  readonly step = signal(0);
  readonly selectedOrigin = signal<Origin | null>(null);

  readonly form = signal(
    this.fb.group({
      account: this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        characterName: ['', [Validators.required, Validators.minLength(3)]],
      }),
      user: this.fb.group({
        name: ['', Validators.required],
        birthday: ['', Validators.required],
        city: [''],
        facebook: [''],
        twitter: [''],
        linkedin: [''],
        instagram: [''],
        bio: [''],
      }),
    })
  );

  get accountForm(): FormGroup {
    return this.form().get('account') as FormGroup;
  }

  get userForm(): FormGroup {
    return this.form().get('user') as FormGroup;
  }

  nextStep() {
    this.step.update((s) => s + 1);
  }

  prevStep() {
    this.step.update((s) => s - 1);
  }

  onOriginNext(origin: Origin) {
    this.selectedOrigin.set(origin);
    this.nextStep();
  }

  submit() {
    const account = this.accountForm.value;
    const user = this.userForm.value;
    const origin = this.selectedOrigin();

    if (!origin) {
      console.error('No origin selected!');
      return;
    }

    const payload = {
      ...account,
      ...user,
      originId: origin.id,
    };

    console.log('🚀 Final payload to submit:', payload);
    // TODO: submit to Supabase
  }
}
