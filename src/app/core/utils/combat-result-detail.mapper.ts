import { CombatResultDetailReadModel } from '../domain/combat/combat-live.model';
import { Json } from '../types/database.types';
import { GetCombatResultDetailRpcRow } from '../types/combat-live-rpc.types';

export function mapCombatResultDetail(
  row: GetCombatResultDetailRpcRow,
): CombatResultDetailReadModel {
  return {
    combatResultId: row.combat_result_id,
    outcome: row.outcome,
    winnerSide: row.winner_side ?? null,
    loserSide: row.loser_side ?? null,
    turnsCompleted: row.turns_completed,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    participants: row.participants_json,
    attacks: row.attacks_json,
    rawJson: row as unknown as Json,
  };
}
