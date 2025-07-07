import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { map, switchMap } from 'rxjs';
import { Origin } from '../../../core/domain/origin/origin.model';
import { Auth } from '../../services/auth';
import { createHero } from '../../services/create-hero';
import { StepAccount } from './steps/step-account';
import { StepOrigin } from './steps/step-origin';
import { StepUser } from './steps/step-user';

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
  private readonly auth = inject(Auth);
private readonly createHero = inject(createHero);

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
    console.error('[submit] ❌ No origin selected!');
    return;
  }

  const userData = {
    email: account.email,
    name: user.name,
    birthday: user.birthday,
    city: user.city,
    facebook: user.facebook,
    twitter: user.twitter,
    linkedin: user.linkedin,
    instagram: user.instagram,
    bio: user.bio,
    role_id: 3
  };

  this.auth
    .register(account.email, account.password, userData)
    .pipe(
      switchMap((userRow) => {
        const heroId = userRow.id;

        return this.createHero
          .createHero(heroId, account.characterName, origin.id)
          .pipe(map(() => heroId));
      }),
      switchMap((heroId) => this.createHero.assignFreeEstate(heroId))
    )
    .subscribe({
      next: () => {
        console.log('🎉 Hero created and estate assigned!');
        // this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('🚨 Error during hero creation:', err);
      },
    });
}
}
