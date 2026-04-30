import { AntiAbuseCaseReadModel } from './anti-abuse-case.model';
import { AntiAbuseSanctionTypeEntry } from './anti-abuse-dictionary.model';
import {
  AntiAbuseSanctionDecision,
  CharacterPointPenaltyDecision,
} from './anti-abuse-sanction.model';

export interface AntiAbuseRepeatOffenderHistoryInput {
  serverId: string;
  heroId?: string | null;
  userId?: string | null;
  excludeCaseId?: string | null;
}

export interface AntiAbuseRepeatOffenderHistoryTarget {
  heroId: string | null;
  userId: string | null;
}

export interface AntiAbuseRepeatOffenderHistoryTargetOption
  extends AntiAbuseRepeatOffenderHistoryTarget {
  label: string;
}

export interface AntiAbuseRepeatOffenderHistory {
  target: AntiAbuseRepeatOffenderHistoryTarget;
  cases: AntiAbuseCaseReadModel[];
  sanctions: AntiAbuseSanctionDecision[];
  warnings: AntiAbuseSanctionDecision[];
  characterPointPenalties: CharacterPointPenaltyDecision[];
  dictionaries: {
    sanctionTypes: AntiAbuseSanctionTypeEntry[];
  };
  totals: {
    cases: number;
    sanctions: number;
    warnings: number;
    characterPointPenalties: number;
    remainingCharacterPoints: number;
  };
}
