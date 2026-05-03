import { Row } from '../../types/supabase.types';
import { mapHeroProgressionLedgerEntry } from './hero-progression-ledger.mapper';

describe('mapHeroProgressionLedgerEntry', () => {
  it('maps an experience gain row into a display-safe progression history model', () => {
    const result = mapHeroProgressionLedgerEntry(ledgerRow());

    expect(result.id).toBe('ledger-1');
    expect(result.heroId).toBe('hero-1');
    expect(result.serverId).toBe('server-1');
    expect(result.entryKind).toBe('experience_gain');
    expect(result.entryType).toBe('experience_gain');
    expect(result.sourceKind).toBe('trial');
    expect(result.sourceId).toBe('trial-1');
    expect(result.experienceDelta).toBe(120);
    expect(result.experienceBefore).toBe(60);
    expect(result.experienceAfter).toBe(0);
    expect(result.totalExperienceEarnedBefore).toBe(60);
    expect(result.totalExperienceEarnedAfter).toBe(180);
    expect(result.levelBefore).toBe(1);
    expect(result.levelAfter).toBe(2);
    expect(result.reachedLevel).toBeNull();
    expect(result.parentLedgerId).toBeNull();
    expect(result.characterPointsGrossDelta).toBe(120);
    expect(result.characterPointsBalanceAfter).toBe(25);
    expect(result.xpThreshold).toBe(180);
    expect(result.createdAt).toBe('2026-05-03T10:00:00.000Z');
    expect((result.metadataJson as Record<string, unknown>)['outcome']).toBe('success');
  });

  it('distinguishes level-up rows from their parent experience gain row', () => {
    const result = mapHeroProgressionLedgerEntry(
      ledgerRow({
        id: 'level-ledger-1',
        entry_kind: 'level_up',
        experience_delta: 0,
        reached_level: 2,
        parent_ledger_id: 'ledger-1',
      }),
    );

    expect(result.entryType).toBe('level_up');
    expect(result.reachedLevel).toBe(2);
    expect(result.parentLedgerId).toBe('ledger-1');
  });

  it('treats rows with reached level as level-up history even if the kind is unexpected', () => {
    const result = mapHeroProgressionLedgerEntry(
      ledgerRow({
        entry_kind: 'custom_level_event',
        reached_level: 3,
      }),
    );

    expect(result.entryType).toBe('level_up');
  });
});

function ledgerRow(
  overrides: Partial<Row<'hero_progression_ledger'>> = {},
): Row<'hero_progression_ledger'> {
  return {
    id: 'ledger-1',
    hero_id: 'hero-1',
    server_id: 'server-1',
    entry_kind: 'experience_gain',
    source_kind: 'trial',
    source_id: 'trial-1',
    experience_delta: 120,
    experience_before: 60,
    experience_after: 0,
    total_experience_earned_before: 60,
    total_experience_earned_after: 180,
    level_before: 1,
    level_after: 2,
    reached_level: null,
    parent_ledger_id: null,
    character_points_gross_delta: 120,
    character_points_balance_after: 25,
    xp_threshold: 180,
    reason: 'Trial completion reward',
    request_id: 'request-1',
    created_by: 'admin-1',
    created_at: '2026-05-03T10:00:00.000Z',
    metadata_json: { outcome: 'success' },
    ...overrides,
  };
}
