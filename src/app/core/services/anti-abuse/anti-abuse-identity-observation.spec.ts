import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { EDGE_FUNCTIONS } from '../../constants/edge-functions.const';
import { Backend } from '../backend/backend';
import { SupabaseClientService } from '../supabase/supabase-client';
import { AntiAbuseIdentityObservation } from './anti-abuse-identity-observation';

describe('AntiAbuseIdentityObservation', () => {
  let functions: FunctionsSpy;
  let backend: jasmine.SpyObj<Backend>;
  let service: AntiAbuseIdentityObservation;

  beforeEach(() => {
    functions = jasmine.createSpyObj<FunctionsSpy>('functions', ['invoke']);
    backend = jasmine.createSpyObj<Backend>('Backend', ['rpc', 'create', 'update', 'delete']);
    functions.invoke.and.resolveTo({
      data: { ok: true, observationId: 'observation-1' },
      error: null,
    });

    TestBed.configureTestingModule({
      providers: [
        AntiAbuseIdentityObservation,
        {
          provide: SupabaseClientService,
          useValue: {
            client: { functions },
          },
        },
        { provide: Backend, useValue: backend },
      ],
    });
    service = TestBed.inject(AntiAbuseIdentityObservation);
  });

  it('calls only the approved identity observation Edge Function', async () => {
    const result = await firstValueFrom(
      service.recordIdentityObservation({
        serverId: 'server-1',
        heroId: 'hero-1',
        sourceKey: 'login',
        sourceEntityType: 'session',
        sourceEntityId: 'session-1',
      }),
    );

    expect(result).toEqual({
      ok: true,
      observationId: 'observation-1',
      statusMessage: 'Identity observation recorded.',
    });
    expect(functions.invoke).toHaveBeenCalledOnceWith(
      EDGE_FUNCTIONS.record_identity_observation,
      {
        body: {
          serverId: 'server-1',
          heroId: 'hero-1',
          sourceKey: 'login',
          sourceEntityType: 'session',
          sourceEntityId: 'session-1',
        },
      },
    );
    expect(backend.rpc).not.toHaveBeenCalled();
    expect(backend.create).not.toHaveBeenCalled();
    expect(backend.update).not.toHaveBeenCalled();
    expect(backend.delete).not.toHaveBeenCalled();
  });

  it('maps invocation errors to safe status text', async () => {
    functions.invoke.and.resolveTo({
      data: null,
      error: { message: 'Missing required env var: IDENTITY_HASH_PEPPER' },
    });

    await expectAsync(
      firstValueFrom(service.recordIdentityObservation({ serverId: 'server-1' })),
    ).toBeResolvedTo({
      ok: false,
      observationId: null,
      statusMessage: 'Identity observation was not recorded.',
    });
  });

  it('maps rejected Edge Function invocations to safe status text', async () => {
    functions.invoke.and.rejectWith(
      new Error('Missing required env var: IDENTITY_HASH_PEPPER'),
    );

    await expectAsync(
      firstValueFrom(service.recordIdentityObservation({ serverId: 'server-1' })),
    ).toBeResolvedTo({
      ok: false,
      observationId: null,
      statusMessage: 'Identity observation was not recorded.',
    });
  });
});

interface FunctionsSpy {
  invoke: jasmine.Spy;
}
