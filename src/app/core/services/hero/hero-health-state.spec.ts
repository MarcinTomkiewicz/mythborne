import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { Backend } from '../backend/backend';
import { HeroHealthState } from './hero-health-state';

describe('HeroHealthState', () => {
  let service: HeroHealthState;
  let backend: jasmine.SpyObj<Backend>;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', ['rpc']);
    backend.rpc.and.returnValue(of([{
      hero_id: 'hero-1',
      server_id: 'server-1',
      current_health: 84,
      max_health: 120,
      reset_policy_key: 'reset_to_max_on_runtime_sync',
      synced_at: '2026-05-13T10:00:00.000Z',
      metadata_json: {},
    }]));

    TestBed.configureTestingModule({
      providers: [
        HeroHealthState,
        { provide: Backend, useValue: backend },
      ],
    });
    service = TestBed.inject(HeroHealthState);
  });

  it('maps canonical DB-owned health state without calculating current health', async () => {
    const result = await firstValueFrom(service.getHeroHealthState('hero-1'));

    expect(backend.rpc).toHaveBeenCalledWith(
      RPC.get_hero_health_state,
      { p_hero_id: 'hero-1' },
    );
    expect(result).toEqual({
      heroId: 'hero-1',
      serverId: 'server-1',
      currentHealth: 84,
      maxHealth: 120,
      resetPolicyKey: 'reset_to_max_on_runtime_sync',
      syncedAt: '2026-05-13T10:00:00.000Z',
    });
  });

  it('rejects health state rows for a different hero', async () => {
    backend.rpc.and.returnValue(of([{
      hero_id: 'hero-2',
      server_id: 'server-1',
      current_health: 1,
      max_health: 2,
      reset_policy_key: 'reset_to_max_on_runtime_sync',
      synced_at: '2026-05-13T10:00:00.000Z',
      metadata_json: {},
    }]));

    await expectAsync(firstValueFrom(service.getHeroHealthState('hero-1')))
      .toBeRejectedWithError('Hero health state returned a row for a different hero.');
  });
});
