import {
  AttachRewardDropItemToGameReportRpcRow,
  CreateGameReportFromCombatResultRpcRow,
} from '../types/game-report-rpc.types';
import {
  mapAttachedRewardDropItemReference,
  mapCreatedCombatGameReport,
  toAttachRewardDropItemToGameReportRpcArgs,
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
    expect(mapCreatedCombatGameReport(combatReportRow())).toEqual({
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

  it('maps reward drop attachment input to generated RPC args', () => {
    expect(toAttachRewardDropItemToGameReportRpcArgs({
      reportId: ' report-1 ',
      itemId: ' item-1 ',
      sortOrder: 20,
      reason: ' Attach reward drop. ',
      requestId: ' request-1 ',
    })).toEqual({
      p_report_id: 'report-1',
      p_item_id: 'item-1',
      p_sort_order: 20,
      p_reason: 'Attach reward drop.',
      p_request_id: 'request-1',
    });
  });

  it('omits optional reward drop attachment args when absent', () => {
    expect(toAttachRewardDropItemToGameReportRpcArgs({
      reportId: 'report-1',
      itemId: 'item-1',
      sortOrder: null,
      reason: ' ',
      requestId: undefined,
    })).toEqual({
      p_report_id: 'report-1',
      p_item_id: 'item-1',
    });
  });

  it('requires report and item ids for reward drop attachment', () => {
    expect(() => toAttachRewardDropItemToGameReportRpcArgs({
      reportId: ' ',
      itemId: 'item-1',
    })).toThrowError('reportId is required for game report item attachment.');
    expect(() => toAttachRewardDropItemToGameReportRpcArgs({
      reportId: 'report-1',
      itemId: '',
    })).toThrowError('itemId is required for game report item attachment.');
  });

  it('requires integer sort order for reward drop attachment', () => {
    expect(() => toAttachRewardDropItemToGameReportRpcArgs({
      reportId: 'report-1',
      itemId: 'item-1',
      sortOrder: 1.5,
    })).toThrowError('sortOrder must be an integer for game report item attachment.');
  });

  it('maps attached reward drop rows without exposing raw component ids', () => {
    expect(mapAttachedRewardDropItemReference(rewardDropRow())).toEqual({
      reportId: 'report-1',
      itemReferenceId: 'item-reference-1',
      sourceItemId: 'item-1',
      displayName: 'Fine Bronze Blade',
      qualityKey: 'fine',
      sortOrder: 20,
      auditLogId: 'audit-2',
    });
  });
});

function combatReportRow(): CreateGameReportFromCombatResultRpcRow {
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

function rewardDropRow(): AttachRewardDropItemToGameReportRpcRow {
  return {
    audit_log_id: 'audit-2',
    base_id: 'base-1',
    display_name_fallback: 'Fine Bronze Blade',
    item_reference_id: 'item-reference-1',
    prefix_affix_id: 'prefix-1',
    quality_key: 'fine',
    report_id: 'report-1',
    sort_order: 20,
    source_item_id: 'item-1',
    suffix_affix_id: 'suffix-1',
  };
}
