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
import { Auth } from '../../services/auth';
import { SupabaseService } from '../../../core/services/supabase/supabase';
import { HeroFactory } from '../../../core/services/hero-factory/hero-factory';
import { forkJoin, from, map, switchMap } from 'rxjs';
import { supabase } from '../../../core/supabase/supabase';

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

    const auth = inject(Auth);
    const supabaseService = inject(SupabaseService);
    const heroFactory = inject(HeroFactory);

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
    };

    auth
      .register(account.email, account.password, userData)
      .pipe(
        switchMap((userRow) => {
          const heroId = userRow.id;

          const heroPayload = {
            id: heroId,
            name: account.characterName,
            level: 1,
            xp: 0,
            hp: 1000,
            origin_id: origin.id,
            rank: 1,
            created_at: new Date().toISOString(),
            profile_picture: null,
          };

          return forkJoin([
            from(supabase.from('hero').insert([heroPayload])),
            from(
              supabase
                .from('hero_stats')
                .insert(heroFactory.createStats(heroId))
            ),
            from(
              supabase
                .from('hero_derived')
                .insert([heroFactory.createDerived(heroId)])
            ),
            from(
              supabase
                .from('hero_resources')
                .insert(heroFactory.createResources(heroId))
            ),
          ]).pipe(map(() => heroId));
        }),
        switchMap((heroId) =>
          supabaseService
            .getAll('estates', {
              filters: { hero_id: null, rank: 1 },
              range: { from: 0, to: 0 },
            })
            .pipe(
              switchMap(([estate]) => {
                if (!estate) throw new Error('No free estate available');
                return from(
                  supabase
                    .from('estates')
                    .update({ hero_id: heroId })
                    .eq('id', estate.id)
                );
              })
            )
        )
      )
      .subscribe({
        next: () => {
          console.log('🎉 Hero created successfully!');
        },
        error: (err) => {
          console.error('🚨 Error during hero creation:', err);
        },
      });
  }
}
