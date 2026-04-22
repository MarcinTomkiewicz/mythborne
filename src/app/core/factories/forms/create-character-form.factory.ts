import { inject, Injectable } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';

export type CreateCharacterAccountForm = FormGroup<{
  email: FormControl<string>;
  password: FormControl<string>;
}>;

export type CreateCharacterHeroForm = FormGroup<{
  characterName: FormControl<string>;
}>;

export type CreateCharacterProfileForm = FormGroup<{
  name: FormControl<string>;
  birthday: FormControl<Date | null>;
  city: FormControl<string>;
  facebook: FormControl<string>;
  twitter: FormControl<string>;
  linkedin: FormControl<string>;
  instagram: FormControl<string>;
  bio: FormControl<string>;
}>;

export type CreateCharacterForm = FormGroup<{
  account: CreateCharacterAccountForm;
  hero: CreateCharacterHeroForm;
  originId: FormControl<string>;
  profile: CreateCharacterProfileForm;
}>;

@Injectable({ providedIn: 'root' })
export class CreateCharacterFormFactory {
  private readonly fb = inject(NonNullableFormBuilder);

  createForm(): CreateCharacterForm {
    return new FormGroup({
      account: this.fb.group({
        email: this.fb.control('', [Validators.required, Validators.email]),
        password: this.fb.control('', [
          Validators.required,
          Validators.minLength(6),
        ]),
      }),
      hero: this.fb.group({
        characterName: this.fb.control('', [
          Validators.required,
          Validators.minLength(3),
        ]),
      }),
      originId: this.fb.control('', Validators.required),
      profile: new FormGroup({
        name: this.fb.control('', Validators.required),
        birthday: new FormControl<Date | null>(null),
        city: this.fb.control(''),
        facebook: this.fb.control(''),
        twitter: this.fb.control(''),
        linkedin: this.fb.control(''),
        instagram: this.fb.control(''),
        bio: this.fb.control(''),
      }),
    });
  }
}
