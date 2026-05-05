import { Component, input } from '@angular/core';
import {
  GameReportCombatSection,
  GameReportCombatParticipant,
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

  toBooleanLabel(value: boolean | null): string {
    if (value === null) {
      return 'n/a';
    }

    return value ? 'yes' : 'no';
  }

  toOptionalNumberLabel(value: number | null): string {
    return value === null ? 'n/a' : String(value);
  }

  toHpChangeLabel(before: number | null, after: number | null): string {
    return `${this.toOptionalNumberLabel(before)} -> ${this.toOptionalNumberLabel(after)}`;
  }

  toDateTimeLabel(value: string | null): string {
    return value ? new Date(value).toLocaleString() : 'n/a';
  }

  toItemSourceKindLabel(value: string): string {
    return value === 'reward_drop' ? 'Reward drop' : value;
  }

  itemReferenceTrackKey(
    index: number,
    item: GameReportItemReference | PublicGameReportItemReference,
  ): string {
    return `${item.sourceKind}-${item.displayName}-${item.sortOrder}-${index}`;
  }

  hasCombatStats(participant: GameReportCombatParticipant): boolean {
    return (
      participant.maxHealth !== null ||
      participant.defense !== null ||
      participant.minDamage !== null ||
      participant.maxDamage !== null ||
      participant.luck !== null ||
      participant.criticalChance !== null ||
      participant.criticalDamage !== null ||
      participant.evasionChance !== null ||
      participant.stats.length > 0
    );
  }
}
