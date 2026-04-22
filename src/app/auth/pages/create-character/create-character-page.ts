import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { map, switchMap } from 'rxjs';
import { Origin } from '../../../core/domain/origin/origin.model';
import { Auth } from '../../../core/services/auth/auth';
import { CreateHero } from '../../../core/services/hero/create-hero';
import { StepAccount } from './components/steps/step-account';
import { StepOrigin } from './components/steps/step-origin';
import { StepUser } from './components/steps/step-user';

@Component({
  selector: 'app-create-character-page',
  standalone: true,
  imports: [ReactiveFormsModule, StepAccount, StepUser, StepOrigin],
  templateUrl: './create-character-page.html',
  styleUrl: './create-character-page.scss',
})
export class CreateCharacterPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(Auth);
  private readonly createHero = inject(CreateHero);
  private readonly router = inject(Router);

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
    this.step.update((step) => step + 1);
  }

  prevStep() {
    this.step.update((step) => step - 1);
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
      console.error('[CreateCharacter] No origin selected.');
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
      role_id: 3,
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
          void this.router.navigateByUrl('/hero/dashboard');
        },
        error: (error) => {
          console.error('[CreateCharacter] Error during hero creation:', error);
        },
      });
  }
}
