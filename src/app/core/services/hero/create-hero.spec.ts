import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { StartFlowHeroCreationResult } from '../../domain/start-flow/start-flow.model';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import { AuthState } from '../auth/auth-state';
import { ActiveServer } from '../server/active-server';
import { StartFlow } from '../start-flow/start-flow';
import { ActiveHero } from './active-hero';
import { CreateHero } from './create-hero';

describe('CreateHero', () => {
  let activeHero: jasmine.SpyObj<ActiveHero>;
  let activeServer: jasmine.SpyObj<ActiveServer>;
  let authState: jasmine.SpyObj<AuthState>;
  let startFlow: jasmine.SpyObj<StartFlow>;
  let service: CreateHero;

  beforeEach(() => {
    activeHero = jasmine.createSpyObj<ActiveHero>('ActiveHero', [
      'loadActiveHero',
      'selectHero',
    ]);
    activeServer = jasmine.createSpyObj<ActiveServer>('ActiveServer', [
      'loadAccessibleServers',
      'selectedServer',
    ]);
    authState = jasmine.createSpyObj<AuthState>('AuthState', ['user']);
    startFlow = jasmine.createSpyObj<StartFlow>('StartFlow', ['createHero']);

    authState.user.and.returnValue({ id: 'user-1' } as ReturnType<AuthState['user']>);
    activeServer.selectedServer.and.returnValue({ id: 'server-1' } as ReturnType<ActiveServer['selectedServer']>);
    activeHero.loadActiveHero.and.returnValue(of(null));
    activeHero.selectHero.and.returnValue(of(activeContext('hero-1')));
    startFlow.createHero.and.returnValue(of(heroCreationResult()));

    TestBed.configureTestingModule({
      providers: [
        CreateHero,
        { provide: ActiveHero, useValue: activeHero },
        { provide: ActiveServer, useValue: activeServer },
        { provide: AuthState, useValue: authState },
        { provide: StartFlow, useValue: startFlow },
      ],
    });
    service = TestBed.inject(CreateHero);
  });

  it('creates a hero through the start-flow RPC service and selects the returned hero', async () => {
    const result = await firstValueFrom(
      service.createHero('  Hero Name  ', 'origin-1'),
    );

    expect(result.heroId).toBe('hero-1');
    expect(startFlow.createHero).toHaveBeenCalledOnceWith(jasmine.objectContaining({
      serverId: 'server-1',
      originId: 'origin-1',
      heroName: 'Hero Name',
      requestId: jasmine.stringMatching(/^start-flow:server-1:/),
    }));
    expect(activeHero.selectHero).toHaveBeenCalledOnceWith('hero-1');
    expect(activeHero.loadActiveHero).not.toHaveBeenCalled();
  });

  it('selects a newly created sandbox hero instead of preserving the old active hero', async () => {
    startFlow.createHero.and.returnValue(of(heroCreationResult({
      heroId: 'hero-new',
    })));
    activeHero.selectHero.and.returnValue(of(activeContext('hero-new')));

    const result = await firstValueFrom(
      service.createHero('New Sandbox Hero', 'origin-1'),
    );

    expect(result.heroId).toBe('hero-new');
    expect(activeHero.selectHero).toHaveBeenCalledOnceWith('hero-new');
  });

  it('loads accessible servers before creating when no server is selected', async () => {
    activeServer.selectedServer.and.returnValues(
      null,
      { id: 'server-loaded' } as ReturnType<ActiveServer['selectedServer']>,
    );
    activeServer.loadAccessibleServers.and.returnValue(of([]));

    await firstValueFrom(service.createHero('Hero', 'origin-1'));

    expect(activeServer.loadAccessibleServers).toHaveBeenCalled();
    expect(startFlow.createHero).toHaveBeenCalledOnceWith(jasmine.objectContaining({
      serverId: 'server-loaded',
    }));
  });

  it('requires an authenticated user before calling the start-flow RPC', () => {
    authState.user.and.returnValue(null);

    expect(() => service.createHero('Hero', 'origin-1'))
      .toThrowError('Cannot create a hero without an authenticated user.');
    expect(startFlow.createHero).not.toHaveBeenCalled();
    expect(activeHero.loadActiveHero).not.toHaveBeenCalled();
    expect(activeHero.selectHero).not.toHaveBeenCalled();
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

function activeContext(heroId: string): ActiveHeroState {
  return {
    userId: 'user-1',
    serverId: 'server-1',
    heroId,
    server: { id: 'server-1' } as ActiveHeroState['server'],
    hero: { id: heroId, name: 'Hero', serverId: 'server-1' } as ActiveHeroState['hero'],
    heroRow: { id: heroId, server_id: 'server-1' } as ActiveHeroState['heroRow'],
  };
}
