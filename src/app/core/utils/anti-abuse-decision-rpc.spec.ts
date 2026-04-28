import {
  toAddAntiAbuseSanctionItemRpcArgs,
  toCanManageAntiAbuseRpcArgs,
  toCreateAntiAbuseSanctionRpcArgs,
  toCreateCharacterPointPenaltyForSanctionRpcArgs,
  toSetAntiAbuseCaseDecisionRpcArgs,
  toSetAntiAbuseSanctionStatusRpcArgs,
  toSetCharacterPointPenaltyStatusRpcArgs,
  toSetPlayerAbuseReportDecisionRpcArgs,
  toSetPlayerRelationshipDeclarationDecisionRpcArgs,
} from './anti-abuse-decision-rpc';

describe('anti-abuse decision rpc mappers', () => {
  it('maps case decision input to DB-side audited workflow args', () => {
    expect(
      toSetAntiAbuseCaseDecisionRpcArgs({
        caseId: 'case-1',
        status: 'resolved',
        statusReason: ' Evidence reviewed. ',
        verdict: 'abuse_confirmed',
        verdictReason: 'Confirmed funneling.',
        sanctionRequired: true,
        noSanctionReason: null,
        operatorNotes: 'Internal note.',
      }),
    ).toEqual({
      p_case_id: 'case-1',
      p_status: 'resolved',
      p_status_reason: 'Evidence reviewed.',
      p_verdict: 'abuse_confirmed',
      p_verdict_reason: 'Confirmed funneling.',
      p_sanction_required: true,
      p_operator_notes: 'Internal note.',
    });
  });

  it('maps declaration and report decisions without frontend audit args', () => {
    expect(
      toSetPlayerRelationshipDeclarationDecisionRpcArgs({
        declarationId: 'declaration-1',
        status: 'approved',
        statusReason: 'Valid shared household.',
        adminNotes: 'Reviewed by staff.',
        playerNotes: 'Accepted.',
      }),
    ).toEqual({
      p_declaration_id: 'declaration-1',
      p_status: 'approved',
      p_status_reason: 'Valid shared household.',
      p_admin_notes: 'Reviewed by staff.',
      p_player_notes: 'Accepted.',
    });

    expect(
      toSetPlayerAbuseReportDecisionRpcArgs({
        reportId: 'report-1',
        status: 'linked_to_case',
        statusReason: 'Linked to open case.',
        caseId: 'case-1',
      }),
    ).toEqual({
      p_report_id: 'report-1',
      p_status: 'linked_to_case',
      p_status_reason: 'Linked to open case.',
      p_case_id: 'case-1',
    });
  });

  it('maps sanction, penalty and sanction-item workflow args', () => {
    expect(
      toCreateAntiAbuseSanctionRpcArgs({
        caseId: 'case-1',
        sanctionTypeKey: 'character_point_fine',
        targetHeroId: 'hero-1',
        targetUserId: 'user-1',
        reason: 'Confirmed abuse.',
        amountCharacterPoints: 250,
        durationDays: null,
      }),
    ).toEqual({
      p_case_id: 'case-1',
      p_sanction_type_key: 'character_point_fine',
      p_target_hero_id: 'hero-1',
      p_target_user_id: 'user-1',
      p_reason: 'Confirmed abuse.',
      p_amount_character_points: 250,
    });

    expect(
      toSetAntiAbuseSanctionStatusRpcArgs({
        sanctionId: 'sanction-1',
        status: 'applied',
        statusReason: 'Applied by operator.',
      }),
    ).toEqual({
      p_sanction_id: 'sanction-1',
      p_status: 'applied',
      p_status_reason: 'Applied by operator.',
    });

    expect(
      toCreateCharacterPointPenaltyForSanctionRpcArgs({
        sanctionId: 'sanction-1',
        reason: 'Create fine.',
      }),
    ).toEqual({
      p_sanction_id: 'sanction-1',
      p_reason: 'Create fine.',
    });

    expect(
      toSetCharacterPointPenaltyStatusRpcArgs({
        penaltyId: 'penalty-1',
        status: 'forgiven',
        statusReason: 'Manual forgiveness.',
      }),
    ).toEqual({
      p_penalty_id: 'penalty-1',
      p_status: 'forgiven',
      p_status_reason: 'Manual forgiveness.',
    });

    expect(
      toAddAntiAbuseSanctionItemRpcArgs({
        sanctionId: 'sanction-1',
        itemId: 'item-1',
        reason: 'Evidence item.',
        sourceHeroId: 'hero-1',
      }),
    ).toEqual({
      p_sanction_id: 'sanction-1',
      p_item_id: 'item-1',
      p_reason: 'Evidence item.',
      p_source_hero_id: 'hero-1',
    });
  });

  it('maps permission helper args', () => {
    expect(toCanManageAntiAbuseRpcArgs(' server-1 ')).toEqual({
      p_server_id: 'server-1',
    });
  });

  it('requires stable ids and reasons for workflows that need them', () => {
    expect(() =>
      toCreateAntiAbuseSanctionRpcArgs({
        caseId: 'case-1',
        sanctionTypeKey: 'character_point_fine',
        targetHeroId: 'hero-1',
        targetUserId: 'user-1',
        reason: '',
      }),
    ).toThrowError('reason is required for anti-abuse decision workflow.');

    expect(() =>
      toSetPlayerRelationshipDeclarationDecisionRpcArgs({
        declarationId: '',
        status: 'rejected',
        statusReason: 'Missing evidence.',
      }),
    ).toThrowError('declarationId is required for anti-abuse decision workflow.');
  });

});
