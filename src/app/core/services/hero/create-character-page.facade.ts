import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { finalize, of, switchMap } from 'rxjs';
import { MessageService } from 'primeng/api';
import { Origin } from '../../domain/origin/origin.model';
import { StartFlowServerAvailability } from '../../domain/start-flow/start-flow.model';
import { CreateCharacterFormFactory } from '../../factories/forms/create-character-form.factory';
import { trimText } from '../../utils/normalize-text';
import { Auth } from '../auth/auth';
import { AuthState } from '../auth/auth-state';
import { ActiveServer } from '../server/active-server';
import { StartFlow } from '../start-flow/start-flow';
import { CreateHero } from './create-hero';

@Injectable()
export class CreateCharacterPageFacade {
  private readonly auth = inject(Auth);
  private readonly authState = inject(AuthState);
  private readonly activeServer = inject(ActiveServer);
  private readonly createHero = inject(CreateHero);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formFactory = inject(CreateCharacterFormFactory);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly startFlow = inject(StartFlow);

  readonly step = signal(1);
  readonly selectedOrigin = signal<Origin | null>(null);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly serverAvailability = signal<StartFlowServerAvailability[]>([]);
  readonly serverAvailabilityError = signal<string | null>(null);
  readonly user = this.authState.user;
  readonly hasExistingAccount = computed(() => !!this.user());
  readonly form = this.formFactory.createForm();
  readonly selectedServerAvailability = computed(() => {
    const serverId = this.activeServer.selectedServer()?.id ?? null;

    return serverId
      ? this.serverAvailability().find((server) => server.serverId === serverId) ?? null
      : null;
  });

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

    effect(() => {
      if (!this.user()) {
        this.serverAvailability.set([]);
        this.serverAvailabilityError.set(null);
        return;
      }

      this.loadServerAvailability();
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

    const availability = this.selectedServerAvailability();
    if (availability && !availability.canCreateHero) {
      const message =
        availability.blockReason || 'Selected server is not available for hero creation.';
      this.errorMessage.set(message);
      this.showToast('error', 'Hero creation blocked', message);
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
    const originId = this.form.controls.originId.getRawValue();
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
        switchMap(() =>
          this.createHero.createHero(trimText(hero.characterName), originId)
        ),
        finalize(() => this.isSubmitting.set(false))
      )
      .subscribe({
        next: (result) => {
          const route = this.routeForNextAction(result.routeNextAction);

          if (!route) {
            const message = `Unsupported start-flow route action returned by DB: ${result.routeNextAction || 'empty'}.`;
            this.errorMessage.set(message);
            this.showToast('error', 'Character creation route blocked', message);
            return;
          }

          this.showToast(
            'success',
            'Character created',
            'Character creation finished. Redirecting to attribute assignment.'
          );
          void this.router.navigateByUrl(route);
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

  private loadServerAvailability() {
    this.startFlow
      .getServerAvailability()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (availability) => {
          this.serverAvailability.set(availability);
          this.serverAvailabilityError.set(null);
        },
        error: (error: unknown) => {
          this.serverAvailability.set([]);
          this.serverAvailabilityError.set(
            error instanceof Error
              ? error.message
              : 'Failed to load start-flow server availability.',
          );
        },
      });
  }

  private routeForNextAction(nextAction: string): string | null {
    switch (nextAction) {
      case 'stat_allocation':
        return '/hero/attributes';
      case 'dashboard':
      case 'game_shell':
        return '/hero/dashboard';
      default:
        return null;
    }
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

