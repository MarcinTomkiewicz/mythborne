import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { finalize, Observable, of, switchMap } from 'rxjs';
import { MessageService } from 'primeng/api';
import { Origin } from '../../domain/origin/origin.model';
import { StartFlowServerAvailability } from '../../domain/start-flow/start-flow.model';
import { CreateCharacterFormFactory } from '../../factories/forms/create-character-form.factory';
import { trimText } from '../../utils/normalize-text';
import { Auth } from '../auth/auth';
import { AuthState } from '../auth/auth-state';
import { ActiveHero } from './active-hero';
import { ActiveServer } from '../server/active-server';
import { StartFlow } from '../start-flow/start-flow';
import { CreateHero } from './create-hero';
import {
  CreateCharacterCreationGate,
  CreateCharacterServerDetails,
  CreateCharacterServerOption,
} from '../../interfaces/hero/create-character-server-options.interface';
import {
  mapCreateCharacterServerDetails,
  mapCreateCharacterServerOptions,
  resolveCreateCharacterCreationGate,
} from './create-character-server-options';
import {
  routeForHeroCreationNextAction,
  toHeroCreationErrorMessage,
} from './create-character-result-routing';
import { addCreateCharacterToast } from './create-character-toast';

export type ExistingAccountCreateStage = 'server_select' | 'hero_creation';

interface HeroCreationSubmitContext {
  token: number;
  serverId: string;
  originId: string;
  heroName: string;
}

@Injectable()
export class CreateCharacterPageFacade {
  private readonly auth = inject(Auth);
  private readonly authState = inject(AuthState);
  private readonly activeServer = inject(ActiveServer);
  private readonly activeHero = inject(ActiveHero);
  private readonly createHero = inject(CreateHero);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formFactory = inject(CreateCharacterFormFactory);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly startFlow = inject(StartFlow);
  private availabilityLoadToken = 0;
  private heroCreationSubmitToken = 0;

  readonly step = signal(1);
  readonly existingAccountCreateStage = signal<ExistingAccountCreateStage>('server_select');
  readonly selectedOrigin = signal<Origin | null>(null);
  readonly isSubmitting = signal(false);
  readonly isServerAvailabilityLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly serverAvailability = signal<StartFlowServerAvailability[]>([]);
  readonly serverAvailabilityError = signal<string | null>(null);
  readonly user = this.authState.user;
  readonly selectedServer = this.activeServer.selectedServer;
  readonly hasExistingAccount = computed(() => !!this.user());
  readonly form = this.formFactory.createForm();
  readonly selectedServerAvailability = computed(() => {
    const serverId = this.activeServer.selectedServer()?.id ?? null;

    return serverId
      ? this.serverAvailability().find((server) => server.serverId === serverId) ?? null
      : null;
  });
  readonly creationServerOptions = computed<CreateCharacterServerOption[]>(() =>
    mapCreateCharacterServerOptions(this.serverAvailability()),
  );
  readonly selectedCreationGate = computed<CreateCharacterCreationGate>(() =>
    resolveCreateCharacterCreationGate(
      this.selectedServerAvailability(),
      this.serverAvailabilityError(),
      this.hasExistingAccount(),
    ),
  );
  readonly selectedServerDetails = computed<CreateCharacterServerDetails | null>(() =>
    mapCreateCharacterServerDetails(
      this.selectedServerAvailability(),
      this.selectedCreationGate(),
    ),
  );
  readonly canSubmitHeroCreation = computed(() =>
    !!this.selectedServerAvailability() && this.selectedCreationGate().canCreate,
  );

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
        this.isServerAvailabilityLoading.set(false);
        return;
      }

      this.loadServerAvailability();
    });

    this.heroForm.controls.characterName.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.invalidateActiveHeroCreationSubmit());

    this.form.controls.originId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.invalidateActiveHeroCreationSubmit());
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

    this.step.set(this.hasExistingAccount() ? 2 : 3);
  }

  prevStep(step: number) {
    this.step.set(step);
  }

  onOriginNext(origin: Origin) {
    this.selectedOrigin.set(origin);
    this.form.controls.originId.setValue(origin.id);

    if (this.hasExistingAccount()) {
      this.submit();
      return;
    }

    this.step.set(4);
  }

  canOpenStep(step: number): boolean {
    if (this.hasExistingAccount()) {
      return this.canOpenExistingAccountStep(step);
    }

    switch (step) {
      case 1:
        return true;
      case 2:
        return this.accountForm.valid;
      case 3:
        return this.canOpenStep(2) && this.heroForm.valid;
      case 4:
        return this.canOpenStep(3) && this.form.controls.originId.valid;
      default:
        return false;
    }
  }

  selectCreationServer(serverId: string | null): void {
    if (!serverId || this.activeServer.selectedServer()?.id === serverId) {
      return;
    }

    const selected = this.activeServer.selectServer(serverId);

    if (!selected) {
      this.errorMessage.set('Wybrany świat nie jest dostępny dla tego konta.');
      this.showToast(
        'error',
        'Nie można wybrać świata',
        'Wybrany świat nie jest dostępny dla tego konta.',
      );
      return;
    }

    this.errorMessage.set(null);
    if (this.hasExistingAccount()) {
      this.invalidateActiveHeroCreationSubmit();
      this.existingAccountCreateStage.set('server_select');
      this.selectedOrigin.set(null);
      this.form.controls.originId.setValue('', { emitEvent: false });
    }
  }

  continueToHeroCreation(): void {
    const gate = this.selectedCreationGate();

    if (!gate.canCreate) {
      const message = gate.blocker ?? 'Na wybranym świecie nie można teraz stworzyć bohatera.';
      this.errorMessage.set(message);
      this.showToast('error', 'Tworzenie bohatera zablokowane', message);
      return;
    }

    this.errorMessage.set(null);
    this.existingAccountCreateStage.set('hero_creation');
  }

  submit() {
    if (this.hasExistingAccount() && this.existingAccountCreateStage() !== 'hero_creation') {
      this.errorMessage.set('Najpierw wybierz świat dostępny do stworzenia bohatera.');
      this.showToast(
        'warn',
        'Wybierz świat',
        'Najpierw wybierz świat dostępny do stworzenia bohatera.',
      );
      return;
    }

    if (this.hasExistingAccount()) {
      const gate = this.selectedCreationGate();

      if (!gate.canCreate) {
        const message = gate.blocker ?? 'Na wybranym świecie nie można teraz stworzyć bohatera.';
        this.errorMessage.set(message);
        this.showToast('error', 'Tworzenie bohatera zablokowane', message);
        return;
      }
    }

    if (!this.canSubmitHeroCreation()) {
      const message = 'Wybierz dostępny świat przed stworzeniem bohatera.';
      this.errorMessage.set(message);
      this.showToast('warn', 'Brak świata', message);
      return;
    }

    if (this.heroForm.invalid) {
      this.heroForm.markAllAsTouched();
      this.errorMessage.set('Podaj poprawną nazwę bohatera przed stworzeniem postaci.');
      this.showToast(
        'warn',
        'Nazwa bohatera jest niepełna',
        'Podaj poprawną nazwę bohatera przed stworzeniem postaci.'
      );
      return;
    }

    if (!this.hasExistingAccount() && this.profileForm.invalid) {
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

    this.startHeroCreation();
  }

  private startHeroCreation(): void {
    const hero = this.heroForm.getRawValue();
    const originId = this.form.controls.originId.getRawValue();
    const selectedAvailability = this.selectedServerAvailability();

    if (!selectedAvailability) {
      const message = 'Wybierz dostępny świat przed stworzeniem bohatera.';
      this.errorMessage.set(message);
      this.showToast('warn', 'Brak świata', message);
      return;
    }

    const submitContext: HeroCreationSubmitContext = {
      token: ++this.heroCreationSubmitToken,
      serverId: selectedAvailability.serverId,
      originId,
      heroName: trimText(hero.characterName),
    };

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.messageService.clear('global');
    this.showToast(
      'info',
      'Tworzenie bohatera',
      'Gra tworzy bohatera, przydziela punkty postaci, zasoby startowe i pierwszą posiadłość.'
    );

    const account = this.accountForm.getRawValue();
    const existingUser = this.user();
    const accountReady$: Observable<unknown> = existingUser
      ? of(existingUser)
      : this.auth.register(account.email, account.password).pipe(
          switchMap((user) =>
            this.auth.saveUserData(
              user.id,
              this.formFactory.buildUserData(this.form, user.email ?? account.email)
            )
          ),
        );

    accountReady$
      .pipe(
        switchMap(() =>
          this.createHero.createHero(
            submitContext.heroName,
            submitContext.originId,
            submitContext.serverId,
          )
        ),
        finalize(() => {
          if (this.isActiveHeroCreationSubmit(submitContext)) {
            this.isSubmitting.set(false);
          }
        })
      )
      .subscribe({
        next: (result) => {
          if (!this.isActiveHeroCreationSubmit(submitContext)) {
            return;
          }

          const route = routeForHeroCreationNextAction(result.routeNextAction);

          if (!route) {
            const message = `Nieobsługiwane przekierowanie po utworzeniu bohatera: ${result.routeNextAction || 'brak'}.`;
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
          if (!this.isActiveHeroCreationSubmit(submitContext)) {
            return;
          }

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

  private invalidateActiveHeroCreationSubmit(): void {
    if (!this.isSubmitting()) {
      return;
    }

    this.heroCreationSubmitToken++;
    this.isSubmitting.set(false);
    this.errorMessage.set(null);
  }

  private isActiveHeroCreationSubmit(context: HeroCreationSubmitContext): boolean {
    return this.heroCreationSubmitToken === context.token &&
      this.selectedServerAvailability()?.serverId === context.serverId &&
      this.form.controls.originId.getRawValue() === context.originId &&
      trimText(this.heroForm.getRawValue().characterName) === context.heroName;
  }

  private loadServerAvailability() {
    const token = ++this.availabilityLoadToken;

    this.serverAvailability.set([]);
    this.serverAvailabilityError.set(null);
    this.isServerAvailabilityLoading.set(true);

    this.startFlow.getServerAvailability()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (availability) => {
          if (token !== this.availabilityLoadToken) {
            return;
          }

          this.activeServer.loadAccessibleServersFromStartFlowAvailability(availability);
          if (!this.activeServer.selectedServer()) {
            this.activeHero.clear();
          }
          this.serverAvailability.set(availability);
          this.serverAvailabilityError.set(null);
          this.isServerAvailabilityLoading.set(false);
        },
        error: (error: unknown) => {
          if (token !== this.availabilityLoadToken) {
            return;
          }

          this.serverAvailability.set([]);
          this.serverAvailabilityError.set(
            error instanceof Error
              ? error.message
              : 'Nie udało się wczytać dostępności serwerów dla tworzenia bohatera.',
          );
          this.isServerAvailabilityLoading.set(false);
        },
      });
  }

  private canOpenExistingAccountStep(step: number): boolean {
    switch (step) {
      case 1:
        return true;
      case 2:
        return this.selectedCreationGate().canCreate;
      default:
        return false;
    }
  }

  private showToast(severity: 'info' | 'success' | 'warn' | 'error', summary: string, detail: string) {
    addCreateCharacterToast(this.messageService, severity, summary, detail);
  }
}

