import { Component, input } from '@angular/core';
import {
  GameReportCombatSection,
  GameReportItemReference,
  GameReportParticipant,
  PublicGameReportItemReference,
} from '../../core/domain/reports/game-report.model';

export interface GameReportContentReadModel {
  participants: GameReportParticipant[];
  itemReferences: Array<GameReportItemReference | PublicGameReportItemReference>;
  combatSection: GameReportCombatSection | null;
}

@Component({
  selector: 'app-game-report-content',
  standalone: true,
  templateUrl: './game-report-content.html',
})
export class GameReportContent {
  readonly report = input.required<GameReportContentReadModel>();
  readonly participantsTitle = input.required<string>();
  readonly participantsText = input.required<string>();
  readonly itemReferencesTitle = input.required<string>();
  readonly itemReferencesText = input.required<string>();
  readonly combatSectionTitle = input.required<string>();
  readonly combatSectionText = input.required<string>();
}
