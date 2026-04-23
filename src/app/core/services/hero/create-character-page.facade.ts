import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, map, of, switchMap } from 'rxjs';
import { MessageService } from 'primeng/api';
import { Origin } from '../../domain/origin/origin.model';
import { CreateCharacterFormFactory } from '../../factories/forms/create-character-form.factory';
import { trimText } from '../../utils/normalize-text';
import { Auth } from '../auth/auth';
import { AuthState } from '../auth/auth-state';
import { CreateHero } from './create-hero';

@Injectable()
export class CreateCharacterPageFacade {
  private readonly auth = inject(Auth);
  private readonly authState = inject(AuthState);
  private readonly createHero = inject(CreateHero);
  private readonly formFactory = inject(CreateCharacterFormFactory);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  readonly step = signal(1);
  readonly selectedOrigin = signal<Origin | null>(null);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly user = this.authState.user;
  readonly hasExistingAccount = computed(() => !!this.user());
  readonly form = this.formFactory.createForm();

  get accountForm() {
    return this.form.controls.account;
  }

  get heroForm() {
    return this.form.controls.hero;
  }

  get profileForm() {
    return this.form.controls.profile;
  }

  constructor() {
    effect(() => {
      const user = this.user();
      const emailControl = this.accountForm.controls.email;
      const passwordControl = this.accountForm.controls.password;

      if (user) {
        emailControl.setValue(user.email ?? '', { emitEvent: false });
        emailControl.disable({ emitEvent: false });
        passwordControl.disable({ emitEvent: false });
        return;
      }

      emailControl.enable({ emitEvent: false });
      passwordControl.enable({ emitEvent: false });
    });
  }

  onStepChange(step: number | undefined) {
    if (typeof step === 'number' && this.canOpenStep(step)) {
      this.step.set(step);
    }
  }

  nextFromAccount() {
    if (!this.hasExistingAccount() && this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
      this.showToast(
        'warn',
        'Account step incomplete',
        'Provide a valid email and password before continuing.'
      );
      return;
    }

    this.step.set(2);
  }

  nextFromHero() {
    if (this.heroForm.invalid) {
      this.heroForm.markAllAsTouched();
      this.showToast(
        'warn',
        'Hero step incomplete',
        'Choose a valid hero name before continuing.'
      );
      return;
    }

    this.step.set(3);
  }

  prevStep(step: number) {
    this.step.set(step);
  }

  onOriginNext(origin: Origin) {
    this.selectedOrigin.set(origin);
    this.form.controls.originId.setValue(origin.id);
    this.step.set(4);
  }

  canOpenStep(step: number): boolean {
    switch (step) {
      case 1:
        return true;
      case 2:
        return this.hasExistingAccount() || this.accountForm.valid;
      case 3:
        return this.canOpenStep(2) && this.heroForm.valid;
      case 4:
        return this.canOpenStep(3) && this.form.controls.originId.valid;
      default:
        return false;
    }
  }

  submit() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.showToast(
        'warn',
        'Profile step incomplete',
        'Complete the required profile fields before creating the character.'
      );
      return;
    }

    if (!this.form.controls.originId.valid) {
      this.errorMessage.set('Choose an origin before finishing character creation.');
      this.step.set(3);
      this.showToast(
        'warn',
        'Origin missing',
        'Choose an origin before finishing character creation.'
      );
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.messageService.clear('global');
    this.showToast(
      'info',
      'Creating character',
      'Account, hero, estate and starting records are being created.'
    );

    const account = this.accountForm.getRawValue();
    const hero = this.heroForm.getRawValue();
    const existingUser = this.user();
    const user$ = existingUser
      ? of(existingUser)
      : this.auth.register(account.email, account.password);

    user$
      .pipe(
        switchMap((user) =>
          this.auth.saveUserData(
            user.id,
            this.formFactory.buildUserData(this.form, user.email ?? account.email)
          )
        ),
        switchMap((heroId) =>
          this.createHero
            .createHero(
              heroId,
              trimText(hero.characterName),
              this.form.controls.originId.getRawValue()
            )
            .pipe(map(() => heroId))
        ),
        switchMap((heroId) => this.createHero.assignFreeEstate(heroId)),
        finalize(() => this.isSubmitting.set(false))
      )
      .subscribe({
        next: () => {
          this.showToast(
            'success',
            'Character created',
            'Character creation finished. Redirecting to attribute assignment.'
          );
          void this.router.navigateByUrl('/hero/attributes');
        },
        error: (error) => {
          console.error('[CreateCharacter] Error during hero creation:', error);
          this.errorMessage.set(
            error instanceof Error
              ? error.message
              : 'Character creation failed. Check the data and try again.'
          );
          this.showToast(
            'error',
            'Character creation failed',
            error?.message ?? 'Check the data and try again.'
          );
        },
      });
  }


  private showToast(
    severity: 'info' | 'success' | 'warn' | 'error',
    summary: string,
    detail: string
  ) {
    const severityClassMap = {
      info: 'mg-toast mg-toast--info',
      success: 'mg-toast mg-toast--success',
      warn: 'mg-toast mg-toast--arcane',
      error: 'mg-toast mg-toast--danger',
    } as const;

    this.messageService.add({
      key: 'global',
      severity,
      summary,
      detail,
      life: severity === 'info' ? 2500 : 4500,
      styleClass: severityClassMap[severity],
    });
  }
}

