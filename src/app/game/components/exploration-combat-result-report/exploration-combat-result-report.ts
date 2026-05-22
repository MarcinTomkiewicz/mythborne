import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastService } from '../../../core/services/ui/toast';
import { Json } from '../../../core/types/database.types';
import {
  jsonRecord,
  optionalBoolean,
  optionalNumber,
  optionalText,
  read,
} from '../../../core/utils/json-read';
import { humanizeKey } from '../../../core/utils/normalize-text';
import { ItemDetailPopover } from '../../../shared/item-detail-popover/item-detail-popover';
import { ExplorationChallengeState } from '../../pages/exploration/exploration-challenge.state';
import { ExplorationRewardState } from '../../pages/exploration/exploration-reward.state';
import { ExplorationOutcomeReportLayout } from '../exploration-outcome-report-layout/exploration-outcome-report-layout';

const COMBAT_EVENT_BADGE_LABELS: Record<string, string> = {
  Evaded: 'unik',
  Hit: 'trafienie',
  Miss: 'pudło',
  Critical: 'cios krytyczny',
};

@Component({
  selector: 'app-exploration-combat-result-report',
  standalone: true,
  imports: [RouterLink, ButtonModule, ExplorationOutcomeReportLayout, ItemDetailPopover],
  templateUrl: './exploration-combat-result-report.html',
  host: { class: 'd-block w-100' },
})
export class ExplorationCombatResultReport {
  readonly challenge = inject(ExplorationChallengeState);
  readonly rewardState = inject(ExplorationRewardState);
  private readonly toast = inject(ToastService);
  readonly combatResultDetail = computed(() => this.challenge.combatResultDetail());
  readonly completedChallenge = computed(() => this.challenge.completedCombatChallenge());
  readonly completedCombat = computed(() => this.challenge.completedCombatLiveState());
  readonly reportSourceKind = computed(() => {
    const challenge = this.completedChallenge();

    if (challenge?.trialDefinitionId) {
      return 'trial';
    }

    if (challenge?.encounterDefinitionId) {
      return 'encounter';
    }

    return 'unknown';
  });
  readonly reportTitle = computed(() => {
    const backendTitle = this.backendCombatText('title', 'reportTitle', 'report_title');

    if (backendTitle) {
      return backendTitle;
    }

    switch (this.reportSourceKind()) {
      case 'trial':
        return 'Próba bojowa rozstrzygnięta';
      case 'encounter':
        return 'Spotkanie rozstrzygnięte: Zasadzka';
      default:
        return 'Walka rozstrzygnięta';
    }
  });
  readonly narrativeLines = computed(() => {
    const lines = this.backendCombatTextArray(
      'narrativeLines',
      'narrative_lines',
      'playerNarrativeLines',
      'player_narrative_lines',
    );

    if (lines.length) {
      return lines;
    }

    return [
      this.backendCombatText(
        'summary',
        'playerSummary',
        'player_summary',
        'detailText',
        'detail_text',
        'displayText',
        'display_text',
      ) ?? 'Walka została rozstrzygnięta.',
    ];
  });
  readonly winnerLabel = computed(() => {
    const winnerSide = this.combatResultDetail()?.winnerSide ?? null;

    if (!winnerSide) {
      return 'Nierozstrzygnięte';
    }

    const participant = this.challenge.combatParticipants()
      .find((row) => row.side === winnerSide);

    return participant
      ? `${participant.displayName} (${this.sideLabel(winnerSide)})`
      : this.sideLabel(winnerSide);
  });
  readonly outcomeLabel = computed(() =>
    this.backendCombatText('outcomeLabel', 'outcome_label', 'outcomeDisplay', 'outcome_display')
      ?? this.combatOutcomeLabel(this.combatResultDetail()?.outcome ?? null),
  );
  readonly participantRows = computed(() =>
    this.challenge.combatParticipants().map((participant) => ({
      id: participant.participantId,
      name: participant.displayName,
      side: participant.side ? this.sideLabel(participant.side) : 'Strona N/D',
      hp: this.challenge.participantHpLabel(participant),
      status: participant.statusLabel ?? participant.statusKey ?? 'Status N/D',
    })),
  );
  readonly timelineRows = computed(() =>
    this.challenge.combatTimelineRows().flatMap((row) => {
      const details = row.details.filter((detail) => !this.isTechnicalCombatText(detail));
      const isTechnicalTitle = this.isTechnicalCombatText(row.title);

      if (isTechnicalTitle && !row.badges.length && !details.length) {
        return [];
      }

      return [{
        ...row,
        title: isTechnicalTitle ? 'Akcja walki' : row.title,
        details,
      }];
    }),
  );
  readonly attackRows = computed(() => this.attackRowsFromJson(this.combatResultDetail()?.attacks));
  readonly directReportLink = computed(() => {
    const reportId = this.backendCombatText(
      'gameReportId',
      'game_report_id',
      'reportId',
      'report_id',
    );

    return reportId ? `/game/reports/${reportId}` : '/game/reports';
  });
  readonly directReportLabel = computed(() =>
    this.directReportLink() === '/game/reports'
      ? 'Otwórz centrum raportów'
      : 'Otwórz pełny raport',
  );
  readonly publicReportPath = computed(() =>
    this.publicReportText(
      'publicReportUrl',
      'public_report_url',
      'externalReportUrl',
      'external_report_url',
      'shareUrl',
      'share_url',
    ) ?? this.publicReportPathFromToken(),
  );
  readonly hasPublicReportLink = computed(() => this.publicReportPath() !== null);
  readonly reportRewardDisplay = computed(() => {
    const reward = this.rewardState.rewardDisplay();

    return reward
      ? {
          ...reward,
          entries: reward.entries.filter((entry) =>
            entry.entryKind !== 'character_points' &&
            entry.entryKind !== 'hero_points',
          ),
        }
      : null;
  });
  readonly rewardHeading = computed(() =>
    this.backendRewardText('title', 'heading', 'label') ??
    (
      this.reportSourceKind() === 'trial'
        ? 'Nagroda'
        : 'Zysk wyprawy'
    ),
  );
  readonly rewardIntro = computed(() =>
    this.backendRewardText(
      'intro',
      'introText',
      'intro_text',
      'summary',
      'playerSummary',
      'player_summary',
      'displayText',
      'display_text',
    ) ?? (
      this.reportSourceKind() === 'trial'
        ? 'Nagroda:'
        : 'Zysk wyprawy:'
    ),
  );

  eventBadgeLabel(value: string): string {
    const knownLabel = COMBAT_EVENT_BADGE_LABELS[value];

    if (knownLabel) {
      return knownLabel;
    }

    if (value.startsWith('Damage ')) {
      return `obrażenia ${value.replace('Damage ', '')}`;
    }

    if (value.startsWith('Rolled ')) {
      return `rzut ${value.replace('Rolled ', '')}`;
    }

    return value.replace('HP ', 'HP ');
  }

  copyPublicReportLink(): void {
    const link = this.publicReportPath();

    if (!link || typeof navigator === 'undefined' || !navigator.clipboard) {
      this.toast.show('error', 'Raport', 'Nie udało się skopiować linku do raportu.');
      return;
    }

    void navigator.clipboard.writeText(this.absoluteReportLink(link))
      .then(() => this.toast.show('success', 'Raport', 'Link do raportu został skopiowany.'))
      .catch(() => this.toast.show('error', 'Raport', 'Nie udało się skopiować linku do raportu.'));
  }

  private attackRowsFromJson(value: Json | undefined) {
    const attacksJson = read(this.combatSectionRecord(), 'attacks') ?? value;

    return Array.isArray(attacksJson)
      ? attacksJson.flatMap((entry, index) => {
          const row = jsonRecord(entry);

          if (!row) {
            return [];
          }

          const actor = optionalText(read(
            row,
            'actorDisplayName',
            'actor_display_name',
            'attackerDisplayName',
            'attacker_display_name',
            'actorName',
            'actor_name',
          ));
          const target = optionalText(read(
            row,
            'targetDisplayName',
            'target_display_name',
            'defenderDisplayName',
            'defender_display_name',
            'targetName',
            'target_name',
          ));
          const damage = optionalNumber(read(
            row,
            'finalDamage',
            'final_damage',
            'damage',
            'damageAmount',
            'damage_amount',
          ));
          const evaded = optionalBoolean(read(row, 'evaded', 'wasEvaded', 'was_evaded'));
          const critical = optionalBoolean(read(row, 'critical', 'wasCritical', 'was_critical'));
          const hit = optionalBoolean(read(row, 'timingHit', 'timing_hit', 'hit'));
          const round = optionalNumber(read(row, 'roundNumber', 'round_number'));
          const action = optionalNumber(read(row, 'actionIndex', 'action_index'));
          const eventLabel = optionalText(read(row, 'eventLabel', 'event_label'));
          const detailText = optionalText(read(row, 'detailText', 'detail_text'));
          const displayText = optionalText(read(row, 'displayText', 'display_text', 'summary'));
          const damageDisplay = optionalText(read(row, 'damageDisplay', 'damage_display'));
          const details = [
            detailText,
            displayText && displayText !== eventLabel ? displayText : null,
            damageDisplay,
            round !== null ? `runda ${round}` : null,
            action !== null ? `akcja ${action}` : null,
            hit === true ? 'trafienie' : null,
            hit === false ? 'pudło' : null,
            evaded === true ? 'unik celu' : null,
            critical === true ? 'cios krytyczny' : null,
            damage !== null ? `obrażenia ${damage}` : null,
          ].filter((detail): detail is string => detail !== null);

          return [{
            id: `${index}`,
            title: eventLabel
              ?? (actor && target
              ? `${actor} zaatakował ${target}`
              : displayText ?? 'Akcja walki'),
            details: details.filter((detail): detail is string =>
              detail !== null && !this.isTechnicalCombatText(detail),
            ),
          }];
        })
      : [];
  }

  private backendCombatText(...keys: string[]): string | null {
    const raw = jsonRecord(this.combatResultDetail()?.rawJson);
    const section = this.combatSectionRecord();

    return firstText(section, ...keys) ?? firstText(raw, ...keys);
  }

  private backendCombatTextArray(...keys: string[]): string[] {
    const raw = jsonRecord(this.combatResultDetail()?.rawJson);
    const section = this.combatSectionRecord();

    return [
      ...firstTextArray(section, ...keys),
      ...firstTextArray(raw, ...keys),
    ].filter((value, index, values) => values.indexOf(value) === index);
  }

  private combatSectionRecord(): ReturnType<typeof jsonRecord> {
    const raw = jsonRecord(this.combatResultDetail()?.rawJson);

    return jsonRecord(read(
      raw,
      'combatSection',
      'combat_section',
      'combatSectionJson',
      'combat_section_json',
    ));
  }

  private isTechnicalCombatText(value: string): boolean {
    const normalized = value.toLowerCase();

    return normalized.includes('db ') ||
      normalized.includes('walking dead') ||
      normalized.includes('walking deada') ||
      normalized.includes('manifest');
  }

  private sideLabel(value: string): string {
    switch (value) {
      case 'initiator':
        return 'bohater';
      case 'defender':
        return 'przeciwnik';
      default:
        return humanizeKey(value, 'strona');
    }
  }

  private combatOutcomeLabel(outcome: string | null): string {
    switch (outcome) {
      case 'initiator_victory':
        return 'Zwycięstwo bohatera';
      case 'defender_victory':
        return 'Zwycięstwo przeciwnika';
      case 'draw':
        return 'Remis';
      case null:
        return 'Wynik walki';
      default:
        return 'Walka rozstrzygnięta';
    }
  }

  private backendRewardText(...keys: string[]): string | null {
    const rewardRaw = jsonRecord(this.rewardState.reward()?.rawJson);
    const rewardSection = jsonRecord(read(
      rewardRaw,
      'rewardSection',
      'reward_section',
      'rewardSectionJson',
      'reward_section_json',
    ));
    const combatRewardSection = jsonRecord(read(
      jsonRecord(this.combatResultDetail()?.rawJson),
      'rewardSection',
      'reward_section',
      'rewardSectionJson',
      'reward_section_json',
    ));

    return firstText(rewardSection, ...keys)
      ?? firstText(combatRewardSection, ...keys)
      ?? firstText(rewardRaw, ...keys);
  }

  private publicReportPathFromToken(): string | null {
    const token = this.publicReportText(
      'publicToken',
      'public_token',
      'shareToken',
      'share_token',
      'reportCode',
      'report_code',
    );

    return token ? `/report/${token}` : null;
  }

  private publicReportText(...keys: string[]): string | null {
    const raw = jsonRecord(this.combatResultDetail()?.rawJson);
    const section = this.combatSectionRecord();

    return firstTextInRecords([
      section,
      raw,
      jsonRecord(read(section, 'report', 'reportJson', 'report_json', 'gameReport', 'game_report')),
      jsonRecord(read(raw, 'report', 'reportJson', 'report_json', 'gameReport', 'game_report')),
      jsonRecord(read(section, 'share', 'shareJson', 'share_json')),
      jsonRecord(read(raw, 'share', 'shareJson', 'share_json')),
    ], ...keys);
  }

  private absoluteReportLink(link: string): string {
    return typeof window === 'undefined' || link.startsWith('http')
      ? link
      : `${window.location.origin}${link}`;
  }
}

function firstText(
  record: ReturnType<typeof jsonRecord>,
  ...keys: string[]
): string | null {
  for (const key of keys) {
    const value = optionalText(read(record, key));

    if (value?.trim()) {
      return value.trim();
    }
  }

  return null;
}

function firstTextInRecords(
  records: Array<ReturnType<typeof jsonRecord>>,
  ...keys: string[]
): string | null {
  for (const record of records) {
    const value = firstText(record, ...keys);

    if (value) {
      return value;
    }
  }

  return null;
}

function firstTextArray(
  record: ReturnType<typeof jsonRecord>,
  ...keys: string[]
): string[] {
  for (const key of keys) {
    const value = read(record, key);

    if (Array.isArray(value)) {
      const lines = value.flatMap((entry) =>
        typeof entry === 'string' ? textLines(entry) : [],
      );

      if (lines.length) {
        return lines;
      }
    }

    if (typeof value === 'string') {
      const lines = textLines(value);

      if (lines.length) {
        return lines;
      }
    }
  }

  return [];
}

function textLines(value: string): string[] {
  return value
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}
