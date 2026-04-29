import {
  mapSaveStatAllocationResult,
  toSaveStatAllocationRpcArgs,
} from './stat-allocation-rpc';

describe('stat allocation rpc mapper', () => {
  it('normalizes stat payload and maps Character Points spent', () => {
    const args = toSaveStatAllocationRpcArgs({
      heroId: ' hero-1 ',
      stats: { strength: -1, dexterity: 2.7 },
      previousCharacterPoints: 8,
      nextCharacterPoints: 5,
    });

    expect(args as Record<string, unknown>).toEqual({
      p_hero_id: 'hero-1',
      p_stat_values_json: { strength: 0, dexterity: 3 },
      p_character_points_spent: 3,
      p_reason: 'Stat allocation saved.',
    });
  });

  it('rejects missing hero id before calling the stat allocation rpc', () => {
    expect(() =>
      toSaveStatAllocationRpcArgs({
        heroId: ' ',
        stats: { strength: 1 },
        previousCharacterPoints: 5,
        nextCharacterPoints: 4,
      }),
    ).toThrowError('heroId is required for stat allocation save.');
  });

  it('does not report negative Character Points spent', () => {
    expect(
      toSaveStatAllocationRpcArgs({
        heroId: 'hero-1',
        stats: { strength: 1 },
        previousCharacterPoints: 5,
        nextCharacterPoints: 7,
      }).p_character_points_spent,
    ).toBe(0);
  });

  it('maps RPC result stats and Character Points from persisted workflow output', () => {
    expect(
      mapSaveStatAllocationResult({
        audit_log_id: 'audit-1',
        character_points_after: 5,
        hero_id: 'hero-1',
        server_id: 'server-1',
        stats_json: { strength: 2, dexterity: 3.2 },
      }),
    ).toEqual({
      auditLogId: 'audit-1',
      characterPointsAfter: 5,
      heroId: 'hero-1',
      serverId: 'server-1',
      stats: { strength: 2, dexterity: 3 },
    });
  });
});
