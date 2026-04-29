import { AntiAbuseDictionaryData } from '../domain/anti-abuse/anti-abuse-dictionary.model';
import {
  AntiAbuseCaseDecision,
  AntiAbuseSanctionDecision,
  PlayerAbuseReportDecision,
  PlayerRelationshipDeclarationDecision,
} from '../domain/anti-abuse/anti-abuse-decision.model';
import {
  playerDeclarationDecisionDisplay,
  playerReportDecisionDisplay,
  playerSanctionDecisionDisplay,
  sanctionItemLinkDisplay,
  sanctionTypeMetadata,
  staffCaseDecisionDisplay,
  staffSanctionDecisionDisplay,
} from './anti-abuse-decision-display';

describe('anti-abuse decision display helpers', () => {
  it('uses DB dictionary labels and keeps technical keys secondary', () => {
    expect(sanctionTypeMetadata('character_point_fine', dictionaries())).toEqual(
      jasmine.objectContaining({
        label: 'Character point fine',
        description: 'Removes character points.',
        technicalKey: 'character_point_fine',
      }),
    );
  });

  it('explains sanction item links as evidence/context, not confiscation', () => {
    expect(
      sanctionItemLinkDisplay({
        itemId: 'item-1',
        reason: 'Trade evidence.',
      }).description,
    ).toContain('does not confiscate, transfer, or otherwise mutate');
  });

  it('keeps staff-only notes out of player-facing sanction display', () => {
    const staff = staffSanctionDecisionDisplay(createSanction(), dictionaries());
    const player = playerSanctionDecisionDisplay(createSanction(), dictionaries());

    expect(staff.operatorNotes).toBe('Staff-only investigation note.');
    expect(player).toEqual(
      jasmine.objectContaining({
        label: 'Character point fine',
        reason: 'Confirmed abuse.',
        statusReason: null,
        playerNotes: null,
      }),
    );
    expect(player as unknown as Record<string, unknown>).not.toEqual(
      jasmine.objectContaining({
        operatorNotes: jasmine.any(String),
        adminDescription: jasmine.any(String),
      }),
    );
  });

  it('uses status reason as staff case reason fallback', () => {
    expect(staffCaseDecisionDisplay(createCase()).reason).toBe('Status reason.');
  });

  it('keeps report and declaration staff-only fields out of player-facing displays', () => {
    const report = playerReportDecisionDisplay(createReport(), dictionaries());
    const declaration = playerDeclarationDecisionDisplay(
      createDeclaration(),
      dictionaries(),
    );

    expect(report).toEqual(
      jasmine.objectContaining({
        label: 'Scam',
        statusReason: null,
        playerNotes: 'Player-visible report note.',
      }),
    );
    expect(declaration).toEqual(
      jasmine.objectContaining({
        label: 'Shared household',
        statusReason: null,
        playerNotes: 'Player-visible declaration note.',
      }),
    );
    expect(report as unknown as Record<string, unknown>).not.toEqual(
      jasmine.objectContaining({
        operatorNotes: jasmine.any(String),
        adminNotes: jasmine.any(String),
        adminDescription: jasmine.any(String),
      }),
    );
    expect(declaration as unknown as Record<string, unknown>).not.toEqual(
      jasmine.objectContaining({
        operatorNotes: jasmine.any(String),
        adminNotes: jasmine.any(String),
        adminDescription: jasmine.any(String),
      }),
    );
  });
});

function dictionaries(): AntiAbuseDictionaryData {
  return {
    sanctionTypes: [
      {
        key: 'character_point_fine',
        label: 'Character point fine',
        description: 'Removes character points.',
        helperText: 'Use for confirmed abuse.',
        adminDescription: 'Staff policy context.',
        category: 'points',
        sortOrder: 10,
        isActive: true,
        requiresReason: true,
        requiresTargetHero: true,
        requiresSourceHero: false,
        requiresDurationDays: false,
        requiresItemSelection: false,
        requiresCharacterPointsAmount: true,
      },
    ],
    reportTypes: [
      {
        key: 'scam',
        label: 'Scam',
        description: 'Report a scam.',
        helperText: null,
        adminDescription: 'Staff report policy.',
        category: 'trade',
        sortOrder: 10,
        isActive: true,
        requiresAccusedHero: true,
        requiresDescription: true,
        requiresTradeSelection: true,
        requiresItemSelection: false,
      },
    ],
    declarationTypes: [
      {
        key: 'shared_household',
        label: 'Shared household',
        description: 'Shared household declaration.',
        helperText: null,
        adminDescription: 'Staff declaration policy.',
        category: 'relationship',
        sortOrder: 10,
        isActive: true,
        minParticipants: 2,
        maxParticipants: 4,
        requiresAmount: false,
        requiresExpiration: false,
        requiresTradeSelection: false,
        requiresItemSelection: false,
      },
    ],
    signalTypes: [],
  };
}

function createCase(): AntiAbuseCaseDecision {
  return {
    id: 'case-1',
    serverId: 'server-1',
    title: 'Case title',
    summary: 'Case summary.',
    status: 'resolved',
    statusReason: 'Status reason.',
    verdict: null,
    verdictReason: null,
    sanctionRequired: null,
    noSanctionReason: null,
    operatorNotes: 'Staff-only case note.',
    resolvedAt: null,
    resolvedByUserId: null,
    cancelledAt: null,
    updatedAt: '2026-04-29T00:00:00.000Z',
  };
}

function createSanction(): AntiAbuseSanctionDecision {
  return {
    id: 'sanction-1',
    caseId: 'case-1',
    sanctionTypeKey: 'character_point_fine',
    status: 'pending',
    statusReason: 'Awaiting application.',
    reason: 'Confirmed abuse.',
    operatorNotes: 'Staff-only investigation note.',
    targetHeroId: 'hero-1',
    targetUserId: 'user-1',
    sourceHeroId: null,
    destinationHeroId: null,
    amountCharacterPoints: 100,
    durationDays: null,
    startsAt: null,
    endsAt: null,
    appliedAt: null,
    completedAt: null,
    cancelledAt: null,
    forgivenAt: null,
    failedAt: null,
    imposedByUserId: 'operator-1',
    updatedAt: '2026-04-29T00:00:00.000Z',
  };
}

function createReport(): PlayerAbuseReportDecision {
  return {
    id: 'report-1',
    serverId: 'server-1',
    reportTypeKey: 'scam',
    title: 'Report title',
    status: 'resolved',
    statusReason: 'Staff-only status reason.',
    caseId: 'case-1',
    adminNotes: 'Staff-only report note.',
    playerNotes: 'Player-visible report note.',
    resolvedAt: null,
    updatedAt: '2026-04-29T00:00:00.000Z',
  };
}

function createDeclaration(): PlayerRelationshipDeclarationDecision {
  return {
    id: 'declaration-1',
    serverId: 'server-1',
    declarationTypeKey: 'shared_household',
    title: 'Declaration title',
    status: 'approved',
    statusReason: 'Staff-only declaration reason.',
    adminNotes: 'Staff-only declaration note.',
    playerNotes: 'Player-visible declaration note.',
    reviewedAt: null,
    reviewedByUserId: null,
    updatedAt: '2026-04-29T00:00:00.000Z',
  };
}
