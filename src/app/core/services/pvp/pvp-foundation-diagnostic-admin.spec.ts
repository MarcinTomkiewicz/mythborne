import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { Backend } from '../backend/backend';
import {
  mapPvpFoundationDiagnostic,
  PvpFoundationDiagnosticAdmin,
} from './pvp-foundation-diagnostic-admin';

describe('PvpFoundationDiagnosticAdmin', () => {
  let service: PvpFoundationDiagnosticAdmin;
  let backend: jasmine.SpyObj<Backend>;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', [
      'rpc',
      'getAll',
      'create',
      'update',
      'delete',
      'upsert',
    ]);
    backend.rpc.and.returnValue(of(diagnosticJson()) as never);

    TestBed.configureTestingModule({
      providers: [
        PvpFoundationDiagnosticAdmin,
        { provide: Backend, useValue: backend },
      ],
    });

    service = TestBed.inject(PvpFoundationDiagnosticAdmin);
  });

  it('loads PvP foundation diagnostic through the approved RPC boundary', async () => {
    const diagnostic = await firstValueFrom(
      service.getDiagnostic('server-1'),
    );

    expect(diagnostic).toEqual({
      structuralStatus: 'ok',
      formulaStatus: 'ok',
      missingFunctions: ['missing_function'],
      missingTriggers: ['missing_trigger'],
      incomingNotificationCount: 0,
      positiveSmokePrerequisites: ['second hero with estate'],
    });
    expect(backend.rpc).toHaveBeenCalledOnceWith(
      RPC.inspect_pvp_foundation_integration_state,
      { p_server_id: 'server-1' },
    );
  });

  it('does not use direct reads, writes or test-data creation helpers', async () => {
    await firstValueFrom(service.getDiagnostic(null));

    expect(backend.rpc).toHaveBeenCalledWith(
      RPC.inspect_pvp_foundation_integration_state,
      {},
    );
    expect(backend.getAll).not.toHaveBeenCalled();
    expect(backend.create).not.toHaveBeenCalled();
    expect(backend.update).not.toHaveBeenCalled();
    expect(backend.delete).not.toHaveBeenCalled();
    expect(backend.upsert).not.toHaveBeenCalled();
  });

  it('maps missing optional diagnostic detail without inventing values', () => {
    expect(mapPvpFoundationDiagnostic({})).toEqual({
      structuralStatus: null,
      formulaStatus: null,
      missingFunctions: [],
      missingTriggers: [],
      incomingNotificationCount: null,
      positiveSmokePrerequisites: [],
    });
  });
});

function diagnosticJson(): unknown {
  return {
    structuralStatus: 'ok',
    formulaStatus: 'ok',
    missingFunctions: ['missing_function'],
    missingTriggers: ['missing_trigger'],
    incomingNotificationCount: 0,
    positiveSmokePrerequisites: ['second hero with estate'],
  };
}
