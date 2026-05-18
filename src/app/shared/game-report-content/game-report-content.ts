import { Component, input } from '@angular/core';
import {
  GameReportCombatParticipant,
  GameReportContextualReadiness,
  GameReportContextSection,
  GameReportItemReference,
  GameReportRelatedReport,
  PublicGameReportItemReference,
} from '../../core/domain/reports/game-report.model';
import { GameReportContentReadModel } from '../../core/interfaces/reports/game-report-content.interface';
import { humanizeKey } from '../../core/utils/normalize-text';
import { ItemDetailPopover } from '../item-detail-popover/item-detail-popover';

@Component({
  selector: 'app-game-report-content',
  standalone: true,
  imports: [ItemDetailPopover],
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

  itemReferenceTrackKey(
    index: number,
    item: GameReportItemReference | PublicGameReportItemReference,
  ): string {
    return `${item.sourceKind}-${item.displayName}-${item.sortOrder}-${index}`;
  }

  toBooleanLabel(value: boolean | null): string {
    return value === null ? 'n/a' : value ? 'yes' : 'no';
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
    return value === 'reward_drop' ? 'Reward drop' : humanizeKey(value, value);
  }

  itemReferenceId(
    item: GameReportItemReference | PublicGameReportItemReference,
  ): string | null {
    return 'sourceItemId' in item ? item.sourceItemId : null;
  }

  contextualReadiness(): GameReportContextualReadiness | null {
    const report = this.report();

    if (
      report.participants.length > 0 ||
      report.itemReferences.length > 0 ||
      this.contextSections().length > 0 ||
      this.relatedReports().length > 0 ||
      report.combatSection !== null
    ) {
      return null;
    }

    return report.contextualReadiness;
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

  contextSections(): GameReportContextSection[] {
    const report = this.report();

    return [
      report.trialSection,
      report.encounterSection,
      report.effectSection,
      report.rewardSection,
    ].filter((section): section is GameReportContextSection => section != null);
  }

  relatedReports(): GameReportRelatedReport[] {
    return this.report().relatedReports ?? [];
  }
}
