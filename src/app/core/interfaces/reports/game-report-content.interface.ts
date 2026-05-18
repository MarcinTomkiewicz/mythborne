import {
  GameReportCombatSection,
  GameReportContextualReadiness,
  GameReportContextSection,
  GameReportItemReference,
  GameReportParticipant,
  GameReportRelatedReport,
  PublicGameReportItemReference,
} from '../../domain/reports/game-report.model';

export interface GameReportContentReadModel {
  participants: GameReportParticipant[];
  itemReferences: Array<GameReportItemReference | PublicGameReportItemReference>;
  trialSection: GameReportContextSection | null;
  encounterSection: GameReportContextSection | null;
  rewardSection: GameReportContextSection | null;
  effectSection: GameReportContextSection | null;
  combatSection: GameReportCombatSection | null;
  relatedReports: GameReportRelatedReport[];
  contextualReadiness: GameReportContextualReadiness | null;
}
