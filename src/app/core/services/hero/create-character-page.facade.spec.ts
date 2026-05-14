import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of, Subject, throwError } from 'rxjs';
import {
  StartFlowHeroCreationResult,
  StartFlowServerAvailability,
} from '../../domain/start-flow/start-flow.model';
import { Origin } from '../../domain/origin/origin.model';
import { Auth } from '../auth/auth';
import { AuthState } from '../auth/auth-state';
import { ActiveServer } from '../server/active-server';
import { StartFlow } from '../start-flow/start-flow';
import { CreateHero } from './create-hero';
import { CreateCharacterPageFacade } from './create-character-page.facade';

describe('CreateCharacterPageFacade', () => {
  let auth: jasmine.SpyObj<Auth>;
  let authState: AuthState;
  let activeServer: jasmine.SpyObj<ActiveServer>;
  let createHero: jasmine.SpyObj<CreateHero>;
  let messageService: jasmine.SpyObj<MessageService>;
  let router: jasmine.SpyObj<Router>;
  let startFlow: jasmine.SpyObj<StartFlow>;
  let facade: CreateCharacterPageFacade;

  beforeEach(() => {
    auth = jasmine.createSpyObj<Auth>('Auth', ['register', 'saveUserData']);
    activeServer = jasmine.createSpyObj<ActiveServer>('ActiveServer', [
      'loadAccessibleServers',
      'selectServer',
      'selectedServer',
    ]);
    createHero = jasmine.createSpyObj<CreateHero>('CreateHero', ['createHero']);
    messageService = jasmine.createSpyObj<MessageService>('MessageService', ['add', 'clear']);
    router = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);
    startFlow = jasmine.createSpyObj<StartFlow>('StartFlow', ['getServerAvailability']);

    activeServer.selectedServer.and.returnValue({ id: 'server-1' } as ReturnType<ActiveServer['selectedServer']>);
    activeServer.loadAccessibleServers.and.returnValue(of([{ id: 'server-1' } as never]));
    activeServer.selectServer.and.returnValue(true);
    auth.saveUserData.and.returnValue(of('user-1'));
    createHero.createHero.and.returnValue(of(heroCreationResult({
      routeNextAction: 'unexpected_action',
    })));
    startFlow.getServerAvailability.and.returnValue(of([availability({
      canCreateHero: true,
      nextAction: 'create_hero',
    })]));

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        CreateCharacterPageFacade,
        AuthState,
        { provide: Auth, useValue: auth },
        { provide: ActiveServer, useValue: activeServer },
        { provide: CreateHero, useValue: createHero },
        { provide: MessageService, useValue: messageService },
        { provide: Router, useValue: router },
        { provide: StartFlow, useValue: startFlow },
      ],
    });

    authState = TestBed.inject(AuthState);
    authState.setUser({ id: 'user-1', email: 'hero@example.com' } as ReturnType<AuthState['user']>);
    facade = TestBed.inject(CreateCharacterPageFacade);
    TestBed.flushEffects();
  });

  it('blocks unknown DB route_next_action instead of silently routing to dashboard', () => {
    openExistingAccountCreationStage(facade);
    facade.heroForm.controls.characterName.setValue('Hero Name');
    facade.form.controls.originId.setValue('origin-1');
    facade.profileForm.controls.name.setValue('Player Name');

    facade.submit();

    expect(createHero.createHero).toHaveBeenCalled();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(facade.errorMessage()).toBe(
      'Nieobsługiwane przekierowanie po utworzeniu bohatera: unexpected_action.',
    );
    expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'error',
      summary: 'Przekierowanie po stworzeniu zablokowane',
    }));
  });

  it('routes a freshly created hero to in-game stat allocation when DB returns stat_allocation', () => {
    createHero.createHero.and.returnValue(of(heroCreationResult({
      routeNextAction: 'stat_allocation',
    })));
    openExistingAccountCreationStage(facade);
    fillValidCreationForm(facade);

    facade.submit();

    expect(createHero.createHero).toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/hero/attributes');
    expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'success',
      summary: 'Bohater został stworzony',
    }));
  });

  it('creates another hero for an existing account without requiring profile data again', () => {
    createHero.createHero.and.returnValue(of(heroCreationResult({
      routeNextAction: 'stat_allocation',
    })));
    openExistingAccountCreationStage(facade);
    facade.heroForm.controls.characterName.setValue('Sandbox Hero');
    facade.form.controls.originId.setValue('origin-1');

    facade.submit();

    expect(auth.register).not.toHaveBeenCalled();
    expect(auth.saveUserData).not.toHaveBeenCalled();
    expect(createHero.createHero).toHaveBeenCalledOnceWith('Sandbox Hero', 'origin-1');
    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/hero/attributes');
  });

  it('blocks submit when hero name is missing on the combined creation screen', () => {
    openExistingAccountCreationStage(facade);
    facade.form.controls.originId.setValue('origin-1');

    facade.submit();

    expect(createHero.createHero).not.toHaveBeenCalled();
    expect(facade.errorMessage()).toBe(
      'Podaj poprawną nazwę bohatera przed stworzeniem postaci.',
    );
    expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'warn',
      summary: 'Nazwa bohatera jest niepełna',
    }));
  });

  it('blocks submit from the server selector stage before the creation form is opened', () => {
    facade.heroForm.controls.characterName.setValue('Hero Name');
    facade.form.controls.originId.setValue('origin-1');

    facade.submit();

    expect(createHero.createHero).not.toHaveBeenCalled();
    expect(facade.errorMessage()).toBe(
      'Najpierw wybierz świat dostępny do stworzenia bohatera.',
    );
  });

  it('moves existing-account hero creation from Hero to Origin and submits after origin selection', () => {
    createHero.createHero.and.returnValue(of(heroCreationResult({
      routeNextAction: 'stat_allocation',
    })));
    openExistingAccountCreationStage(facade);
    facade.heroForm.controls.characterName.setValue('Sandbox Hero');

    facade.onOriginNext(origin());

    expect(facade.form.controls.originId.value).toBe('origin-1');
    expect(createHero.createHero).toHaveBeenCalledOnceWith('Sandbox Hero', 'origin-1');
    expect(auth.saveUserData).not.toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/hero/attributes');
  });

  it('keeps profile data required for the unauthenticated new account flow', () => {
    authState.setUser(null);
    TestBed.flushEffects();
    facade.accountForm.controls.email.setValue('new@example.com');
    facade.accountForm.controls.password.setValue('secret1');
    facade.heroForm.controls.characterName.setValue('New Hero');
    facade.form.controls.originId.setValue('origin-1');

    facade.submit();

    expect(auth.register).not.toHaveBeenCalled();
    expect(auth.saveUserData).not.toHaveBeenCalled();
    expect(createHero.createHero).not.toHaveBeenCalled();
    expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'warn',
      summary: 'Profil jest niepełny',
    }));
  });

  it('shows a player-readable duplicate hero name error from the DB/RPC workflow', () => {
    createHero.createHero.and.returnValue(
      throwError(() => new Error('duplicate key value violates unique constraint')),
    );
    openExistingAccountCreationStage(facade);
    fillValidCreationForm(facade);

    facade.submit();

    expect(createHero.createHero).toHaveBeenCalled();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(facade.errorMessage()).toBe(
      'Ta nazwa bohatera jest już zajęta na wybranym serwerze.',
    );
    expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'error',
      summary: 'Nie udało się stworzyć bohatera',
      detail: 'Ta nazwa bohatera jest już zajęta na wybranym serwerze.',
    }));
  });

  it('maps DB/RPC hero creation blockers to player-readable copy', () => {
    const cases: Array<[unknown, string]> = [
      [
        new Error('District A is full.'),
        'Dzielnica startowa na wybranym serwerze jest pełna.',
      ],
      [
        new Error('Server is full.'),
        'Wybrany serwer jest pełny.',
      ],
      [
        new Error('Invalid origin selected.'),
        'Wybrane pochodzenie jest niedostępne. Wybierz inną opcję.',
      ],
      [
        new Error('Permission denied for this server.'),
        'Nie masz uprawnień do stworzenia bohatera na wybranym serwerze.',
      ],
      [
        new Error('Membership is not active.'),
        'Nie masz uprawnień do stworzenia bohatera na wybranym serwerze.',
      ],
      [
        { code: 'P0001' },
        'Nie udało się stworzyć bohatera. Sprawdź dane i spróbuj ponownie.',
      ],
    ];

    openExistingAccountCreationStage(facade);
    fillValidCreationForm(facade);

    for (const [error, message] of cases) {
      createHero.createHero.and.returnValue(throwError(() => error));
      messageService.add.calls.reset();
      facade.errorMessage.set(null);

      facade.submit();

      expect(router.navigateByUrl).not.toHaveBeenCalled();
      expect(facade.errorMessage()).toBe(message);
      expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
        severity: 'error',
        summary: 'Nie udało się stworzyć bohatera',
        detail: message,
      }));
    }
  });

  it('blocks creation with the DB server availability reason before submitting the RPC', () => {
    facade.serverAvailability.set([{
      serverId: 'server-1',
      canCreateHero: false,
      nextAction: 'blocked',
      blockReason: 'Dzielnica startowa na tym serwerze jest pełna.',
    } as StartFlowServerAvailability]);

    facade.continueToHeroCreation();

    expect(createHero.createHero).not.toHaveBeenCalled();
    expect(facade.errorMessage()).toBe('Dzielnica startowa na tym serwerze jest pełna.');
    expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'error',
      summary: 'Tworzenie bohatera zablokowane',
    }));
  });

  it('blocks creation when DB availability returns a blocker even if canCreateHero is true', () => {
    facade.serverAvailability.set([{
      serverId: 'server-1',
      canCreateHero: true,
      nextAction: 'create_hero',
      blockReason: 'Sandbox creation is temporarily blocked.',
    } as StartFlowServerAvailability]);

    facade.continueToHeroCreation();

    expect(createHero.createHero).not.toHaveBeenCalled();
    expect(facade.errorMessage()).toBe('Sandbox creation is temporarily blocked.');
    expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'error',
      summary: 'Tworzenie bohatera zablokowane',
    }));
  });

  it('blocks creation for a full standard server even if canCreateHero is inconsistent', () => {
    facade.serverAvailability.set([availability({
      canCreateHero: true,
      canEnterGame: true,
      isStandard: true,
      isSandbox: false,
      isStaffContext: false,
      nextAction: 'create_hero',
      isDistrictAFull: true,
      districtACapacity: 5000,
      districtAFree: 0,
      districtAOccupied: 5000,
    })]);

    facade.continueToHeroCreation();

    expect(createHero.createHero).not.toHaveBeenCalled();
    expect(facade.errorMessage()).toBe('Brak wolnych posiadłości startowych w District A.');
    expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'error',
      summary: 'Tworzenie bohatera zablokowane',
    }));
  });

  it('blocks creation for a standard server with an existing hero even if canCreateHero is inconsistent', () => {
    facade.serverAvailability.set([availability({
      canCreateHero: true,
      canEnterGame: true,
      isStandard: true,
      isSandbox: false,
      isStaffContext: false,
      nextAction: 'dashboard',
      userHeroCount: 1,
      defaultHeroName: 'Ariadne',
      districtACapacity: 5000,
      districtAFree: 4615,
      districtAOccupied: 385,
    })]);

    facade.continueToHeroCreation();

    expect(createHero.createHero).not.toHaveBeenCalled();
    expect(facade.errorMessage()).toBe(
      'Na świecie standardowym możesz mieć tylko jednego bohatera. Wejdź do gry istniejącym bohaterem.',
    );
    expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'error',
      summary: 'Tworzenie bohatera zablokowane',
    }));
  });

  it('allows sandbox staff creation when start-flow entry action is existing hero dashboard and DB allows creation', () => {
    createHero.createHero.and.returnValue(of(heroCreationResult({
      routeNextAction: 'stat_allocation',
    })));
    facade.serverAvailability.set([availability({
      canCreateHero: true,
      canEnterGame: true,
      nextAction: 'dashboard',
      userHeroCount: 1,
      defaultHeroName: 'Ariadne',
    })]);
    openExistingAccountCreationStage(facade);
    fillValidCreationForm(facade);

    facade.submit();

    expect(createHero.createHero).toHaveBeenCalledOnceWith('Hero Name', 'origin-1');
    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/hero/attributes');
  });

  it('allows sandbox staff creation when start-flow entry action is hero selection and DB allows creation', () => {
    createHero.createHero.and.returnValue(of(heroCreationResult({
      routeNextAction: 'stat_allocation',
    })));
    facade.serverAvailability.set([availability({
      canCreateHero: true,
      canEnterGame: true,
      nextAction: 'hero_selection',
      userHeroCount: 2,
    })]);
    openExistingAccountCreationStage(facade);
    fillValidCreationForm(facade);

    facade.submit();

    expect(createHero.createHero).toHaveBeenCalledOnceWith('Hero Name', 'origin-1');
    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/hero/attributes');
  });

  it('allows sandbox staff creation when start-flow entry action is enter_game and DB allows creation', () => {
    createHero.createHero.and.returnValue(of(heroCreationResult({
      routeNextAction: 'stat_allocation',
    })));
    facade.serverAvailability.set([availability({
      canCreateHero: true,
      canEnterGame: true,
      nextAction: 'enter_game',
      userHeroCount: 1,
      defaultHeroName: 'Vlad',
    })]);
    openExistingAccountCreationStage(facade);
    fillValidCreationForm(facade);

    facade.submit();

    expect(createHero.createHero).toHaveBeenCalledOnceWith('Hero Name', 'origin-1');
    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/hero/attributes');
  });

  it('does not block creation only because start-flow next action is unsupported', () => {
    facade.serverAvailability.set([availability({
      canCreateHero: true,
      nextAction: 'unexpected_action',
    })]);

    facade.continueToHeroCreation();

    expect(facade.existingAccountCreateStage()).toBe('hero_creation');
    expect(facade.errorMessage()).toBeNull();
  });

  it('shows backend sandbox creation blocker when DB blocks creation', () => {
    facade.serverAvailability.set([availability({
      canCreateHero: false,
      blockReason: 'Sandbox creation is blocked by backend.',
      nextAction: 'enter_game',
      userHeroCount: 1,
      defaultHeroName: 'Vlad',
    })]);

    facade.continueToHeroCreation();

    expect(createHero.createHero).not.toHaveBeenCalled();
    expect(facade.errorMessage()).toBe('Sandbox creation is blocked by backend.');
  });

  it('selects another creation server through active server state', () => {
    activeServer.selectedServer.and.returnValue({ id: 'server-1' } as ReturnType<ActiveServer['selectedServer']>);

    facade.selectCreationServer('server-2');

    expect(activeServer.selectServer).toHaveBeenCalledOnceWith('server-2');
    expect(facade.errorMessage()).toBeNull();
  });

  it('blocks existing-account creation when selected server availability is missing', () => {
    facade.serverAvailability.set([]);

    facade.continueToHeroCreation();

    expect(createHero.createHero).not.toHaveBeenCalled();
    expect(facade.errorMessage()).toBe(
      'Nie udało się potwierdzić dostępności wybranego serwera.',
    );
  });

  it('blocks creation while server availability has a load error', () => {
    facade.serverAvailabilityError.set('Start-flow availability failed.');

    facade.continueToHeroCreation();

    expect(createHero.createHero).not.toHaveBeenCalled();
    expect(facade.errorMessage()).toBe('Start-flow availability failed.');
  });

  it('ignores stale availability responses after the user context is cleared', () => {
    const pendingAvailability = new Subject<StartFlowServerAvailability[]>();
    startFlow.getServerAvailability.and.returnValue(pendingAvailability.asObservable());

    authState.setUser({ id: 'user-2', email: 'next@example.com' } as ReturnType<AuthState['user']>);
    TestBed.flushEffects();
    authState.setUser(null);
    TestBed.flushEffects();
    facade.serverAvailabilityError.set('Current context error.');

    pendingAvailability.next([{
      serverId: 'server-1',
      canCreateHero: true,
      nextAction: 'create_hero',
      blockReason: null,
    } as StartFlowServerAvailability]);
    pendingAvailability.complete();

    expect(facade.serverAvailability()).toEqual([]);
    expect(facade.serverAvailabilityError()).toBe('Current context error.');

    authState.setUser({ id: 'user-3', email: 'third@example.com' } as ReturnType<AuthState['user']>);
    TestBed.flushEffects();

    facade.continueToHeroCreation();

    expect(createHero.createHero).not.toHaveBeenCalled();
    expect(facade.errorMessage()).toBe(
      'Nie udało się potwierdzić dostępności wybranego serwera.',
    );
  });

  it('blocks submit after direct user change until the new availability response arrives', () => {
    const userBAvailability = new Subject<StartFlowServerAvailability[]>();

    expect(facade.serverAvailability()[0]).toEqual(jasmine.objectContaining({
      serverId: 'server-1',
      canCreateHero: true,
    }));

    startFlow.getServerAvailability.and.returnValue(userBAvailability.asObservable());
    authState.setUser({ id: 'user-2', email: 'next@example.com' } as ReturnType<AuthState['user']>);
    TestBed.flushEffects();

    facade.continueToHeroCreation();

    expect(createHero.createHero).not.toHaveBeenCalled();
    expect(facade.serverAvailability()).toEqual([]);
    expect(facade.errorMessage()).toBe(
      'Nie udało się potwierdzić dostępności wybranego serwera.',
    );

    userBAvailability.next([{
      serverId: 'server-1',
      canCreateHero: true,
      nextAction: 'create_hero',
      blockReason: null,
    } as StartFlowServerAvailability]);
    userBAvailability.complete();

    expect(facade.serverAvailability()[0]).toEqual(jasmine.objectContaining({
      serverId: 'server-1',
      canCreateHero: true,
    }));
  });
});

function fillValidCreationForm(facade: CreateCharacterPageFacade): void {
  facade.heroForm.controls.characterName.setValue('Hero Name');
  facade.form.controls.originId.setValue('origin-1');
  facade.profileForm.controls.name.setValue('Player Name');
}

function openExistingAccountCreationStage(facade: CreateCharacterPageFacade): void {
  facade.continueToHeroCreation();
  expect(facade.existingAccountCreateStage()).toBe('hero_creation');
}

function heroCreationResult(
  patch: Partial<StartFlowHeroCreationResult> = {},
): StartFlowHeroCreationResult {
  return {
    heroId: 'hero-1',
    serverId: 'server-1',
    heroName: 'Hero',
    originId: 'origin-1',
    originKey: 'nomad',
    originLabel: 'Nomad',
    estateId: 'estate-1',
    districtCode: 'A',
    addressNumber: 42,
    address: 'A-42',
    characterPointsBalance: 1000,
    characterPointLedgerId: 'ledger-1',
    prestigeRankNumber: 1,
    prestigeRankName: 'Unproven',
    resourcesJson: [],
    heroStatsJson: [],
    routeNextAction: 'stat_allocation',
    createdNewHero: true,
    auditLogId: 'audit-1',
    ...patch,
  };
}

function availability(
  patch: Partial<StartFlowServerAvailability> = {},
): StartFlowServerAvailability {
  return {
    serverId: 'server-1',
    serverKey: 'sandbox',
    serverName: 'Sandbox',
    serverKind: 'sandbox',
    serverStatus: 'live',
    description: 'Sandbox server.',
    membershipStatus: 'active',
    isVisible: true,
    isStandard: false,
    isSandbox: true,
    isStaffContext: true,
    canEnterGame: false,
    canCreateHero: true,
    nextAction: 'create_hero',
    blockReason: null,
    userHeroCount: 0,
    defaultHeroId: null,
    defaultHeroName: null,
    isServerFull: false,
    isDistrictAFull: false,
    districtACapacity: 100,
    districtAOccupied: 2,
    districtAFree: 98,
    heroesJson: [],
    eligibilityJson: {},
    heroes: [],
    ...patch,
  };
}

function origin(): Origin {
  return {
    id: 'origin-1',
    key: 'nomad',
    name: 'Nomad',
    description: 'Nomad origin.',
    imageUrl: null,
    createdAt: '2026-05-01T10:00:00Z',
  };
}



