import { FormControl, FormGroup } from '@angular/forms';

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
