import {
  CombatAttackEvent,
  CombatParticipantInput,
} from './combat.model';
import { CombatantSnapshot, SandboxCombatOutcome } from './combat-sandbox.model';

export interface CombatSandboxStepInput {
  heroId: string;
  hero: CombatantSnapshot;
  enemy: CombatantSnapshot;
  heroHealth: number;
  enemyHealth: number;
  turnNumber: number;
  attackOrderStart: number;
  indicatorPosition: number;
  streak: number;
}

export interface CombatSandboxStepResolution {
  initiator: CombatParticipantInput;
  defender: CombatParticipantInput;
  events: readonly CombatAttackEvent[];
  heroHealth: number;
  enemyHealth: number;
  outcome: SandboxCombatOutcome | null;
  turnsPlayed: number;
  turnLimit: number;
}
