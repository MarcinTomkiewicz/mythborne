import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  COMBAT_ATTACK_SOURCE_KIND,
  COMBAT_OUTCOME,
  COMBAT_PARTICIPANT_KIND,
  COMBAT_SIDE,
  COMBAT_SOURCE_TYPE,
  CombatResolutionResult,
} from '../../domain/combat/combat.model';
import { Backend } from '../backend/backend';
import { CombatResultSnapshotsService } from './combat-result-snapshots';

describe('CombatResultSnapshotsService', () => {
  let backend: jasmine.SpyObj<Backend>;
  let service: CombatResultSnapshotsService;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', [
      'rpc',
      'create',
      'update',
      'upsert',
      'delete',
    ]);
    backend.rpc.and.returnValue(of([{
      combat_result_id: 'combat-result-1',
      server_id: 'server-1',
      source_type: COMBAT_SOURCE_TYPE.sandbox,
      source_entity_id: 'sandbox-run-1',
      outcome: COMBAT_OUTCOME.initiatorVictory,
      participants_created: 2,
      participant_stats_created: 3,
      attacks_created: 1,
      audit_log_id: 'audit-1',
    }]));

    TestBed.configureTestingModule({
      providers: [
        CombatResultSnapshotsService,
        { provide: Backend, useValue: backend },
      ],
    });
    service = TestBed.inject(CombatResultSnapshotsService);
  });

  it('persists completed combat results through the canonical snapshot RPC only', async () => {
    const persisted = await firstValueFrom(service.persistResult({
      result: combatResult(),
      reason: 'Sandbox persistence.',
      requestId: 'request-1',
    }));

    expect(backend.rpc).toHaveBeenCalledOnceWith(
      RPC.persist_combat_result_snapshot,
      jasmine.objectContaining({
        p_server_id: 'server-1',
        p_source_type: COMBAT_SOURCE_TYPE.sandbox,
        p_outcome: COMBAT_OUTCOME.initiatorVictory,
        p_turns_completed: 1,
      }),
    );
    expect(backend.create).not.toHaveBeenCalled();
    expect(backend.update).not.toHaveBeenCalled();
    expect(backend.upsert).not.toHaveBeenCalled();
    expect(backend.delete).not.toHaveBeenCalled();
    expect(persisted).toEqual(jasmine.objectContaining({
      combatResultId: 'combat-result-1',
      participantsCreated: 2,
      participantStatsCreated: 3,
      attacksCreated: 1,
      auditLogId: 'audit-1',
    }));
  });

  it('rejects production gameplay source snapshots unless caller marks a backend authority boundary', async () => {
    expect(() => service.persistResult({
      result: combatResult({ sourceType: COMBAT_SOURCE_TYPE.pvp }),
    })).toThrowError(
      'Combat result source "pvp" requires an explicit backend validation/finalization authority boundary before snapshot persistence.',
    );
    expect(backend.rpc).not.toHaveBeenCalled();
  });

  it('reports an empty RPC return as a persistence configuration error', async () => {
    backend.rpc.and.returnValue(of([]));

    await expectAsync(firstValueFrom(service.persistResult({
      result: combatResult(),
    }))).toBeRejectedWithError(
      'Combat result snapshot persistence returned no result row.',
    );
  });
});

function combatResult(overrides: {
  sourceType?: CombatResolutionResult['source']['sourceType'];
} = {}): CombatResolutionResult {
  return {
    source: {
      sourceType: overrides.sourceType ?? COMBAT_SOURCE_TYPE.sandbox,
      sourceEntityId: 'sandbox-run-1',
      serverId: 'server-1',
      startedAt: '2026-05-02T10:00:00.000Z',
      completedAt: '2026-05-02T10:01:00.000Z',
    },
    outcome: COMBAT_OUTCOME.initiatorVictory,
    winnerSide: COMBAT_SIDE.initiator,
    loserSide: COMBAT_SIDE.defender,
    turnsCompleted: 1,
    initiatorHeroId: 'hero-1',
    defenderHeroId: null,
    participants: [
      {
        side: COMBAT_SIDE.initiator,
        displayName: 'Hero',
        level: 1,
        reference: {
          participantKind: COMBAT_PARTICIPANT_KIND.hero,
          heroId: 'hero-1',
          opponentDefinitionId: null,
        },
        stats: {
          maxHealth: 20,
          defense: 1,
          minDamage: 2,
          maxDamage: 3,
          luck: 0,
          criticalChance: 0,
          criticalDamage: 50,
          evasionChance: 0,
        },
        healthStart: 20,
        healthEnd: 20,
      },
      {
        side: COMBAT_SIDE.defender,
        displayName: 'Opponent',
        level: 1,
        reference: {
          participantKind: COMBAT_PARTICIPANT_KIND.opponent,
          heroId: null,
          opponentDefinitionId: 'opponent-1',
        },
        stats: {
          maxHealth: 5,
          defense: 0,
          minDamage: 1,
          maxDamage: 1,
          luck: 0,
          criticalChance: 0,
          criticalDamage: 50,
          evasionChance: 0,
        },
        healthStart: 5,
        healthEnd: 0,
      },
    ],
    participantStats: [
      { side: COMBAT_SIDE.initiator, statKey: 'strength', statValue: 10 },
      { side: COMBAT_SIDE.defender, statKey: 'strength', statValue: 6 },
    ],
    attacks: [
      {
        turnNumber: 1,
        attackOrder: 1,
        actorSide: COMBAT_SIDE.initiator,
        targetSide: COMBAT_SIDE.defender,
        attackSlotIndex: 0,
        source: {
          kind: COMBAT_ATTACK_SOURCE_KIND.unarmed,
          label: 'Unarmed',
          opponentAttackSourceId: null,
          sourceItemId: null,
          sourceBaseId: null,
          sourceQualityKey: null,
          sourcePrefixAffixId: null,
          sourceSuffixAffixId: null,
        },
        timingHit: null,
        evaded: false,
        critical: false,
        rolledDamage: 5,
        criticalDamage: null,
        finalDamage: 5,
        targetHealthBefore: 5,
        targetHealthAfter: 0,
        displayText: 'Hero hits Opponent.',
      },
    ],
  };
}
