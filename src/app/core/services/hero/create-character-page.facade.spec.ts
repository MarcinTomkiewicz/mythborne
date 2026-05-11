import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import {
  StartFlowHeroCreationResult,
  StartFlowServerAvailability,
} from '../../domain/start-flow/start-flow.model';
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
    activeServer = jasmine.createSpyObj<ActiveServer>('ActiveServer', ['selectedServer']);
    createHero = jasmine.createSpyObj<CreateHero>('CreateHero', ['createHero']);
    messageService = jasmine.createSpyObj<MessageService>('MessageService', ['add', 'clear']);
    router = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);
    startFlow = jasmine.createSpyObj<StartFlow>('StartFlow', ['getServerAvailability']);

    activeServer.selectedServer.and.returnValue({ id: 'server-1' } as ReturnType<ActiveServer['selectedServer']>);
    auth.saveUserData.and.returnValue(of('user-1'));
    createHero.createHero.and.returnValue(of(heroCreationResult({
      routeNextAction: 'unexpected_action',
    })));
    startFlow.getServerAvailability.and.returnValue(of([{
      serverId: 'server-1',
      canCreateHero: true,
    } as StartFlowServerAvailability]));

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
    facade.heroForm.controls.characterName.setValue('Hero Name');
    facade.form.controls.originId.setValue('origin-1');
    facade.profileForm.controls.name.setValue('Player Name');

    facade.submit();

    expect(createHero.createHero).toHaveBeenCalled();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(facade.errorMessage()).toBe(
      'Unsupported start-flow route action returned by DB: unexpected_action.',
    );
    expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'error',
      summary: 'Przekierowanie po stworzeniu zablokowane',
    }));
  });

  it('shows a player-readable duplicate hero name error from the DB/RPC workflow', () => {
    createHero.createHero.and.returnValue(
      throwError(() => new Error('duplicate key value violates unique constraint')),
    );
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
      blockReason: 'Dzielnica startowa na tym serwerze jest pełna.',
    } as StartFlowServerAvailability]);
    facade.heroForm.controls.characterName.setValue('Hero Name');
    facade.form.controls.originId.setValue('origin-1');
    facade.profileForm.controls.name.setValue('Player Name');

    facade.submit();

    expect(createHero.createHero).not.toHaveBeenCalled();
    expect(facade.errorMessage()).toBe('Dzielnica startowa na tym serwerze jest pełna.');
    expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'error',
      summary: 'Tworzenie bohatera zablokowane',
    }));
  });
});

function fillValidCreationForm(facade: CreateCharacterPageFacade): void {
  facade.heroForm.controls.characterName.setValue('Hero Name');
  facade.form.controls.originId.setValue('origin-1');
  facade.profileForm.controls.name.setValue('Player Name');
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
