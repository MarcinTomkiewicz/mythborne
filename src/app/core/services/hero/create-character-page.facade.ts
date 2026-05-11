import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { finalize, of, switchMap } from 'rxjs';
import { MessageService } from 'primeng/api';
import { Origin } from '../../domain/origin/origin.model';
import { StartFlowServerAvailability } from '../../domain/start-flow/start-flow.model';
import { CreateCharacterFormFactory } from '../../factories/forms/create-character-form.factory';
import { getErrorMessage } from '../../utils/error-message';
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
  private availabilityLoadToken = 0;

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
        this.availabilityLoadToken++;
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
        'Dane konta są niepełne',
        'Podaj poprawny email i hasło przed przejściem dalej.'
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
        'Nazwa bohatera jest niepełna',
        'Podaj poprawną nazwę bohatera przed przejściem dalej.'
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
        'Profil jest niepełny',
        'Uzupełnij wymagane pola profilu przed stworzeniem bohatera.'
      );
      return;
    }

    if (!this.form.controls.originId.valid) {
      this.errorMessage.set('Wybierz pochodzenie przed stworzeniem bohatera.');
      this.step.set(3);
      this.showToast(
        'warn',
        'Brak pochodzenia',
        'Wybierz pochodzenie przed stworzeniem bohatera.'
      );
      return;
    }

    const availability = this.selectedServerAvailability();
    const availabilityBlocker = this.creationAvailabilityBlocker(availability);

    if (availabilityBlocker) {
      this.errorMessage.set(availabilityBlocker);
      this.showToast('error', 'Tworzenie bohatera zablokowane', availabilityBlocker);
      return;
    }

    if (availability && (availability.blockReason || !availability.canCreateHero)) {
      const message =
        availability.blockReason || 'Na wybranym serwerze nie można teraz stworzyć bohatera.';
      this.errorMessage.set(message);
      this.showToast('error', 'Tworzenie bohatera zablokowane', message);
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.messageService.clear('global');
    this.showToast(
      'info',
      'Tworzenie bohatera',
      'DB tworzy bohatera, początkowe zasoby, punkty postaci i posiadłość.'
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
            this.showToast('error', 'Przekierowanie po stworzeniu zablokowane', message);
            return;
          }

          this.showToast(
            'success',
            'Bohater został stworzony',
            'Tworzenie bohatera zakończone. Przechodzisz do przydzielania atrybutów.'
          );
          void this.router.navigateByUrl(route);
        },
        error: (error) => {
          const message = toHeroCreationErrorMessage(error);
          this.errorMessage.set(message);
          this.showToast(
            'error',
            'Nie udało się stworzyć bohatera',
            message
          );
        },
      });
  }

  private loadServerAvailability() {
    const token = ++this.availabilityLoadToken;

    this.serverAvailability.set([]);
    this.serverAvailabilityError.set(null);

    this.startFlow
      .getServerAvailability()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (availability) => {
          if (token !== this.availabilityLoadToken) {
            return;
          }

          this.serverAvailability.set(availability);
          this.serverAvailabilityError.set(null);
        },
        error: (error: unknown) => {
          if (token !== this.availabilityLoadToken) {
            return;
          }

          this.serverAvailability.set([]);
          this.serverAvailabilityError.set(
            error instanceof Error
              ? error.message
              : 'Nie udało się wczytać dostępności serwerów start-flow.',
          );
        },
      });
  }

  private creationAvailabilityBlocker(
    availability: StartFlowServerAvailability | null,
  ): string | null {
    if (this.serverAvailabilityError()) {
      return this.serverAvailabilityError();
    }

    if (this.hasExistingAccount() && !availability) {
      return 'Nie udało się potwierdzić dostępności wybranego serwera.';
    }

    return null;
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

function toHeroCreationErrorMessage(error: unknown): string {
  const rawMessage = getErrorMessage(error, '');
  const message = rawMessage.toLowerCase();

  if (message.includes('duplicate') || message.includes('already exists') || message.includes('unique')) {
    return 'Ta nazwa bohatera jest już zajęta na wybranym serwerze.';
  }

  if (message.includes('district') && message.includes('full')) {
    return 'Dzielnica startowa na wybranym serwerze jest pełna.';
  }

  if (message.includes('server') && message.includes('full')) {
    return 'Wybrany serwer jest pełny.';
  }

  if (message.includes('origin')) {
    return 'Wybrane pochodzenie jest niedostępne. Wybierz inną opcję.';
  }

  if (
    message.includes('permission') ||
    message.includes('membership') ||
    message.includes('not allowed') ||
    message.includes('unauthorized')
  ) {
    return 'Nie masz uprawnień do stworzenia bohatera na wybranym serwerze.';
  }

  return rawMessage || 'Nie udało się stworzyć bohatera. Sprawdź dane i spróbuj ponownie.';
}

