import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StepAccount } from './steps/step-account';
import { StepUser } from './steps/step-user';

@Component({
  selector: 'app-create-character',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StepAccount, StepUser],
  templateUrl: './create-character.html',
})
export class CreateCharacter {
  private fb = inject(FormBuilder);

  readonly step = signal(0);

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

  submit() {
    const fullForm = this.form().value;
    console.log('🚀 Submit payload:', fullForm);

    // TODO: handle register + insert to Supabase
  }
}
