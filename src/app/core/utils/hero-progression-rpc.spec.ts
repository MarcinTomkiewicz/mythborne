import {
  firstGrantHeroExperienceRow,
  mapGrantHeroExperienceResult,
  toGrantHeroExperienceRpcArgs,
} from './hero-progression-rpc';

describe('hero progression rpc helpers', () => {
  it('maps XP grant input to the canonical workflow RPC args', () => {
    const args = toGrantHeroExperienceRpcArgs({
        heroId: ' hero-1 ',
        grant: {
          experienceAmount: 25,
        sourceKind: ' exploration ',
        sourceId: ' source-1 ',
        reason: ' Trial reward ',
        requestId: ' request-1 ',
        metadataJson: { trialId: 'trial-1' },
      },
    }) as Record<string, unknown>;

    expect(args).toEqual({
      p_hero_id: 'hero-1',
      p_experience_amount: 25,
      p_source_kind: 'exploration',
      p_source_id: 'source-1',
      p_reason: 'Trial reward',
      p_request_id: 'request-1',
      p_metadata_json: { trialId: 'trial-1' },
    });
  });

  it('maps XP grant result including level-up and Character Points penalty sink output', () => {
    expect(
      mapGrantHeroExperienceResult({
        progression_ledger_id: 'ledger-1',
        hero_id: 'hero-1',
        server_id: 'server-1',
        experience_gained: 250,
        level_before: 2,
        level_after: 4,
        experience_before: 80,
        experience_after: 30,
        total_experience_earned_before: 1080,
        total_experience_earned_after: 1330,
        levels_gained: 2,
        reached_levels_json: [3, 4],
        character_points_gross_gained: 250,
        character_points_balance_after: 120,
      }),
    ).toEqual({
      progressionLedgerId: 'ledger-1',
      heroId: 'hero-1',
      serverId: 'server-1',
      experienceGained: 250,
      levelBefore: 2,
      levelAfter: 4,
      experienceBefore: 80,
      experienceAfter: 30,
      totalExperienceEarnedBefore: 1080,
      totalExperienceEarnedAfter: 1330,
      levelsGained: 2,
      reachedLevels: [3, 4],
      characterPointsGrossGained: 250,
      characterPointsBalanceAfter: 120,
    });
  });

  it('requires producer identity fields for XP grant workflow', () => {
    expect(() =>
      toGrantHeroExperienceRpcArgs({
        heroId: 'hero-1',
        grant: {
          experienceAmount: 10,
          sourceKind: '',
          sourceId: 'source-1',
          reason: 'Reward',
        },
      }),
    ).toThrowError('sourceKind is required for XP grant workflow.');
  });

  it('rejects non-positive XP grant amounts', () => {
    expect(() =>
      toGrantHeroExperienceRpcArgs({
        heroId: 'hero-1',
        grant: {
          experienceAmount: 0,
          sourceKind: 'exploration',
          sourceId: 'source-1',
          reason: 'Reward',
        },
      }),
    ).toThrowError('experienceAmount must be a positive integer for XP grant workflow.');
  });

  it('rejects decimal XP grant amounts instead of silently rounding them', () => {
    expect(() =>
      toGrantHeroExperienceRpcArgs({
        heroId: 'hero-1',
        grant: {
          experienceAmount: 25.2,
          sourceKind: 'exploration',
          sourceId: 'source-1',
          reason: 'Reward',
        },
      }),
    ).toThrowError('experienceAmount must be a positive integer for XP grant workflow.');
  });

  it('requires the RPC to return a result row', () => {
    expect(() => firstGrantHeroExperienceRow([])).toThrowError(
      'grant_hero_experience returned no result row.',
    );
  });
});
