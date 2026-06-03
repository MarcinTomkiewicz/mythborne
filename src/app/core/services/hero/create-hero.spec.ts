import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { StartFlowHeroCreationResult } from '../../domain/start-flow/start-flow.model';
import { AuthState } from '../auth/auth-state';
import { StartFlow } from '../start-flow/start-flow';
import { ActiveHero } from './active-hero';
import { CreateHero } from './create-hero';

describe('CreateHero', () => {
  let activeHero: jasmine.SpyObj<ActiveHero>;
  let authState: jasmine.SpyObj<AuthState>;
  let startFlow: jasmine.SpyObj<StartFlow>;
  let service: CreateHero;

  beforeEach(() => {
    activeHero = jasmine.createSpyObj<ActiveHero>('ActiveHero', [
      'applyStartFlowHeroCreationResult',
    ]);
    authState = jasmine.createSpyObj<AuthState>('AuthState', ['user']);
    startFlow = jasmine.createSpyObj<StartFlow>('StartFlow', ['createHero']);

    authState.user.and.returnValue({ id: 'user-1' } as ReturnType<AuthState['user']>);
    startFlow.createHero.and.returnValue(of(heroCreationResult()));

    TestBed.configureTestingModule({
      providers: [
        CreateHero,
        { provide: ActiveHero, useValue: activeHero },
        { provide: AuthState, useValue: authState },
        { provide: StartFlow, useValue: startFlow },
      ],
    });
    service = TestBed.inject(CreateHero);
  });

  it('creates a hero through the start-flow RPC service with the selected availability server id', async () => {
    const result = await firstValueFrom(
      service.createHero('  Hero Name  ', 'origin-1', 'server-1'),
    );

    expect(result.heroId).toBe('hero-1');
    expect(startFlow.createHero).toHaveBeenCalledOnceWith(jasmine.objectContaining({
      serverId: 'server-1',
      originId: 'origin-1',
      heroName: 'Hero Name',
      requestId: jasmine.stringMatching(/^start-flow:server-1:/),
    }));
    expect(activeHero.applyStartFlowHeroCreationResult).toHaveBeenCalledOnceWith(result);
  });

  it('requires a selected availability server id before calling the start-flow RPC', () => {
    expect(() => service.createHero('Hero', 'origin-1', ''))
      .toThrowError('Nie ma teraz świata dostępnego do stworzenia bohatera.');
    expect(startFlow.createHero).not.toHaveBeenCalled();
    expect(activeHero.applyStartFlowHeroCreationResult).not.toHaveBeenCalled();
  });

  it('requires an authenticated user before calling the start-flow RPC', () => {
    authState.user.and.returnValue(null);

    expect(() => service.createHero('Hero', 'origin-1', 'server-1'))
      .toThrowError('Cannot create a hero without an authenticated user.');
    expect(startFlow.createHero).not.toHaveBeenCalled();
    expect(activeHero.applyStartFlowHeroCreationResult).not.toHaveBeenCalled();
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
