import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { CreateGameReportFromCombatResultRpcRow } from '../../types/game-report-rpc.types';
import { Backend } from '../backend/backend';
import { GameReportProducers } from './game-report-producers';

describe('GameReportProducers', () => {
  let backend: jasmine.SpyObj<Backend>;
  let service: GameReportProducers;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', [
      'rpc',
      'create',
      'createMany',
      'update',
      'upsert',
      'delete',
    ]);
    backend.rpc.and.returnValue(of([row()]));

    TestBed.configureTestingModule({
      providers: [
        GameReportProducers,
        { provide: Backend, useValue: backend },
      ],
    });
    service = TestBed.inject(GameReportProducers);
  });

  it('creates a combat report wrapper through the canonical producer RPC only', async () => {
    const result = await firstValueFrom(service.createCombatReportFromResult({
      combatResultId: 'combat-result-1',
      ownerHeroId: 'hero-1',
      reason: 'Temporary low-level combat report smoke.',
      requestId: 'request-1',
    }));

    expect(backend.rpc).toHaveBeenCalledWith(
      RPC.create_game_report_from_combat_result,
      {
        p_combat_result_id: 'combat-result-1',
        p_owner_hero_id: 'hero-1',
        p_reason: 'Temporary low-level combat report smoke.',
        p_request_id: 'request-1',
      },
    );
    expect(result).toEqual(jasmine.objectContaining({
      reportId: 'report-1',
      publicToken: 'public-token-1',
      participantsCreated: 2,
      accessRowsCreated: 1,
    }));
    expect(backend.create).not.toHaveBeenCalled();
    expect(backend.createMany).not.toHaveBeenCalled();
    expect(backend.update).not.toHaveBeenCalled();
    expect(backend.upsert).not.toHaveBeenCalled();
    expect(backend.delete).not.toHaveBeenCalled();
  });

  it('treats repeated creation as RPC-owned idempotence instead of frontend inserts', async () => {
    backend.rpc.and.returnValues(of([row()]), of([row()]));

    const first = await firstValueFrom(service.createCombatReportFromResult({
      combatResultId: 'combat-result-1',
      requestId: 'request-1',
    }));
    const second = await firstValueFrom(service.createCombatReportFromResult({
      combatResultId: 'combat-result-1',
      requestId: 'request-1',
    }));

    expect(first.reportId).toBe('report-1');
    expect(second.reportId).toBe('report-1');
    expect(backend.rpc).toHaveBeenCalledTimes(2);
    expect(backend.create).not.toHaveBeenCalled();
    expect(backend.upsert).not.toHaveBeenCalled();
  });

  it('reports an empty RPC return as a producer contract error', async () => {
    backend.rpc.and.returnValue(of([]));

    await expectAsync(firstValueFrom(service.createCombatReportFromResult({
      combatResultId: 'combat-result-1',
    }))).toBeRejectedWithError(
      'create_game_report_from_combat_result returned no result.',
    );
  });
});

function row(): CreateGameReportFromCombatResultRpcRow {
  return {
    access_rows_created: 1,
    audit_log_id: 'audit-1',
    combat_result_id: 'combat-result-1',
    participants_created: 2,
    public_token: 'public-token-1',
    report_id: 'report-1',
    report_type_key: 'combat',
    server_id: 'server-1',
  };
}
