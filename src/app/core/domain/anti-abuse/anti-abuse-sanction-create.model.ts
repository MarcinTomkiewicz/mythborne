import {
  AntiAbuseSanctionDecision,
  AntiAbuseSanctionItemDecision,
  CharacterPointPenaltyDecision,
} from './anti-abuse-sanction.model';

export interface CreatedSanctionWorkflowResult {
  sanction: AntiAbuseSanctionDecision;
  penalty: CharacterPointPenaltyDecision | null;
  sanctionItems: AntiAbuseSanctionItemDecision[];
  partialFailureMessage: string | null;
}

export interface CreateSanctionWorkflowRequest {
  caseId: string;
  sanctionTypeKey: string;
  requiresCharacterPointPenalty: boolean;
  requiresItemLinks: boolean;
  targetHeroId: string;
  targetUserId: string;
  reason: string;
  operatorNotes: string | null;
  sourceHeroId: string | null;
  amountCharacterPoints: number | null;
  durationDays: number | null;
  itemIds: readonly string[];
}
