import { inject, Injectable } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { IUserData } from '../../interfaces/i-user-data/i-user-data';
import { CreateCharacterForm } from '../../types/forms/create-character-form.types';
import { trimText } from '../../utils/normalize-text';

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

  buildUserData(form: CreateCharacterForm, email: string): Omit<IUserData, 'id'> {
    const profile = form.controls.profile.getRawValue();

    return {
      email,
      name: trimText(profile.name),
      birthday: this.formatBirthday(profile.birthday),
      city: trimText(profile.city),
      facebook: trimText(profile.facebook),
      twitter: trimText(profile.twitter),
      linkedin: trimText(profile.linkedin),
      instagram: trimText(profile.instagram),
      bio: trimText(profile.bio),
      role_id: 3,
    };
  }

  private formatBirthday(value: Date | null): string | null {
    if (!value) {
      return null;
    }

    const year = value.getFullYear();
    const month = `${value.getMonth() + 1}`.padStart(2, '0');
    const day = `${value.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
