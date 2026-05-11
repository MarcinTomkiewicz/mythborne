import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
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
      summary: 'Character creation route blocked',
    }));
  });
});

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
