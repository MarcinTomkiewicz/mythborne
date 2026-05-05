import { CreateGameReportFromCombatResultRpcRow } from '../types/game-report-rpc.types';
import {
  mapCreatedCombatGameReport,
  toCreateGameReportFromCombatResultRpcArgs,
} from './game-report-producer-mappers';

describe('game report producer mappers', () => {
  it('maps combat report creation input to generated RPC args', () => {
    expect(toCreateGameReportFromCombatResultRpcArgs({
      combatResultId: ' combat-result-1 ',
      ownerHeroId: ' hero-1 ',
      reason: ' Sandbox report. ',
      requestId: ' request-1 ',
    })).toEqual({
      p_combat_result_id: 'combat-result-1',
      p_owner_hero_id: 'hero-1',
      p_reason: 'Sandbox report.',
      p_request_id: 'request-1',
    });
  });

  it('omits optional empty args instead of sending blank values', () => {
    expect(toCreateGameReportFromCombatResultRpcArgs({
      combatResultId: 'combat-result-1',
      ownerHeroId: ' ',
      reason: null,
      requestId: undefined,
    })).toEqual({
      p_combat_result_id: 'combat-result-1',
    });
  });

  it('requires a combat result id before calling the producer RPC', () => {
    expect(() => toCreateGameReportFromCombatResultRpcArgs({
      combatResultId: ' ',
    })).toThrowError('combatResultId is required for combat game report creation.');
  });

  it('maps created combat report rows into explicit read models', () => {
    expect(mapCreatedCombatGameReport(row())).toEqual({
      reportId: 'report-1',
      reportTypeKey: 'combat',
      publicToken: 'public-token-1',
      combatResultId: 'combat-result-1',
      serverId: 'server-1',
      participantsCreated: 2,
      accessRowsCreated: 1,
      auditLogId: 'audit-1',
    });
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
