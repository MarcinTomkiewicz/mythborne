import { ENCOUNTER_KIND } from '../../../core/constants/encounter-runtime-keys.const';
import { HeroExplorationStepResolutionReadModel } from '../../../core/domain/exploration/exploration-runtime.model';
import { Json } from '../../../core/types/database.types';
import { jsonRecord, optionalText, read } from '../../../core/utils/json-read';

const ENCOUNTER_KIND_LABEL: Record<string, string> = {
  [ENCOUNTER_KIND.combat]: 'Zasadzka',
  [ENCOUNTER_KIND.resource]: 'Zasoby',
  [ENCOUNTER_KIND.buff]: 'Wzmocnienie',
  [ENCOUNTER_KIND.debuff]: 'Osłabienie',
};

export function explorationStepResultTitle(
  result: HeroExplorationStepResolutionReadModel | null,
): string {
  if (!result) {
    return '';
  }

  const sectionTitle = reportSectionTitle(result);

  if (sectionTitle) {
    return sectionTitle;
  }

  if (isTrialManifestationFailure(result)) {
    return 'Próba nie przybrała kształtu';
  }

  if (result.outcomeKind === 'trial') {
    return result.challengeAttemptId
      ? 'Próba ujawniona'
      : 'Próba wymaga uzupełnienia akcji';
  }

  if (result.outcomeKind === 'encounter') {
    return result.challengeAttemptId
      ? 'Spotkanie rozpoczęte'
      : 'Spotkanie rozstrzygnięte';
  }

  return 'Bez zdarzenia';
}

export function explorationStepResultTypeLabel(
  result: HeroExplorationStepResolutionReadModel | null,
): string | null {
  if (result?.outcomeKind !== 'encounter') {
    return null;
  }

  return ENCOUNTER_KIND_LABEL[explorationStepEncounterKind(result) ?? ''] ?? null;
}

export function explorationStepReportNarrativeLines(
  result: HeroExplorationStepResolutionReadModel | null,
): string[] {
  if (!result) {
    return [];
  }

  const section = reportSectionRecord(result);

  return [
    ...textArray(read(section, 'narrativeLines', 'narrative_lines')),
    ...textArray(read(section, 'playerNarrativeLines', 'player_narrative_lines')),
    ...textArray(read(section, 'lines')),
  ].filter(uniqueText);
}

export function explorationStepReportFallbackLines(
  result: HeroExplorationStepResolutionReadModel | null,
): string[] {
  if (!result) {
    return [];
  }

  const section = reportSectionRecord(result);
  const summary = firstText(section, 'summary', 'playerSummary', 'player_summary', 'detailText', 'detail_text');

  if (summary) {
    return textLines(summary);
  }

  if (isTrialManifestationFailure(result)) {
    return ['Próba nie przybrała kształtu.'];
  }

  if (result.outcomeKind === 'encounter') {
    return ['Spotkanie zostało rozstrzygnięte.'];
  }

  if (result.outcomeKind === 'nothing') {
    return ['Odcinek drogi zakończył się bez istotnego zdarzenia.'];
  }

  return ['Wynik tego odcinka wyprawy został rozstrzygnięty.'];
}

export function explorationStepResultHasEffectContext(
  result: HeroExplorationStepResolutionReadModel | null,
): boolean {
  if (!result) {
    return false;
  }

  const section = reportSectionRecord(result);
  const sectionKind = firstText(
    section,
    'sectionKind',
    'section_kind',
    'kind',
    'resultKind',
    'result_kind',
    'encounterKind',
    'encounter_kind',
  );
  const encounterKind = explorationStepEncounterKind(result);

  return (
    sectionKind === 'effect' ||
    sectionKind === ENCOUNTER_KIND.buff ||
    sectionKind === ENCOUNTER_KIND.debuff ||
    encounterKind === ENCOUNTER_KIND.buff ||
    encounterKind === ENCOUNTER_KIND.debuff
  );
}

export function explorationStepDirectReportLink(
  result: HeroExplorationStepResolutionReadModel | null,
): string {
  const reportId = explorationStepDirectReportId(result);

  return reportId ? `/game/reports/${reportId}` : '/game/reports';
}

export function explorationStepDirectReportLabel(
  result: HeroExplorationStepResolutionReadModel | null,
): string {
  return explorationStepDirectReportId(result)
    ? 'Otwórz pełny raport'
    : 'Otwórz centrum raportów';
}

export function explorationStepPublicReportPath(
  result: HeroExplorationStepResolutionReadModel | null,
): string | null {
  const publicUrl = explorationStepPublicReportUrl(result);

  if (publicUrl) {
    return publicUrl;
  }

  const token = explorationStepPublicReportToken(result);

  return token ? `/report/${token}` : null;
}

export function explorationStepRewardIntro(
  result: HeroExplorationStepResolutionReadModel | null,
  rewardRawJson: Json | null | undefined,
): string {
  const rewardSection = reportSectionRecordFromValue(
    firstJson(
      rewardRawJson,
      'rewardSection',
      'reward_section',
      'rewardSectionJson',
      'reward_section_json',
    ),
  );
  const intro = firstText(
    rewardSection,
    'intro',
    'introText',
    'intro_text',
    'summary',
    'playerSummary',
    'player_summary',
    'displayText',
    'display_text',
  );

  if (intro) {
    return intro.endsWith(':') ? intro : `${intro}:`;
  }

  return result?.outcomeKind === 'trial' ? 'Nagroda:' : 'Zysk wyprawy:';
}

export function explorationStepRewardTitle(
  result: HeroExplorationStepResolutionReadModel | null,
  rewardRawJson: Json | null | undefined,
): string {
  const rewardSection = reportSectionRecordFromValue(
    firstJson(
      rewardRawJson,
      'rewardSection',
      'reward_section',
      'rewardSectionJson',
      'reward_section_json',
    ),
  );
  const title = firstText(rewardSection, 'title', 'heading', 'label');

  if (title) {
    return title;
  }

  return result?.outcomeKind === 'trial' ? 'Nagroda' : 'Zysk wyprawy';
}

export function explorationStepEncounterKind(
  result: HeroExplorationStepResolutionReadModel | null,
): string | null {
  if (!result || result.outcomeKind !== 'encounter') {
    return null;
  }

  const metadata = jsonRecord(result.metadataJson);

  return result.selectedDefinition?.encounterKind
    ?? optionalText(read(metadata, 'encounterKind', 'encounter_kind'));
}

function reportSectionTitle(result: HeroExplorationStepResolutionReadModel): string | null {
  const section = reportSectionRecord(result);
  const title = firstText(section, 'title', 'heading');
  const outcomeLabel = firstText(section, 'outcomeLabel', 'outcome_label');

  return title && outcomeLabel && !title.includes(outcomeLabel)
    ? `${title}: ${outcomeLabel}`
    : title ?? outcomeLabel;
}

export function explorationStepDirectReportId(
  result: HeroExplorationStepResolutionReadModel | null,
): string | null {
  if (!result) {
    return null;
  }

  const metadata = jsonRecord(result.metadataJson);
  const section = reportSectionRecord(result);

  return firstText(
    section,
    'gameReportId',
    'game_report_id',
    'reportId',
    'report_id',
  ) ?? firstText(
    metadata,
    'gameReportId',
    'game_report_id',
    'reportId',
    'report_id',
  );
}

function explorationStepPublicReportUrl(
  result: HeroExplorationStepResolutionReadModel | null,
): string | null {
  if (!result) {
    return null;
  }

  const metadata = jsonRecord(result.metadataJson);
  const section = reportSectionRecord(result);

  return firstTextInRecords(
    reportCandidateRecords(metadata, section),
    'publicReportUrl',
    'public_report_url',
    'externalReportUrl',
    'external_report_url',
    'shareUrl',
    'share_url',
  );
}

function explorationStepPublicReportToken(
  result: HeroExplorationStepResolutionReadModel | null,
): string | null {
  if (!result) {
    return null;
  }

  const metadata = jsonRecord(result.metadataJson);
  const section = reportSectionRecord(result);

  return firstTextInRecords(
    reportCandidateRecords(metadata, section),
    'publicToken',
    'public_token',
    'shareToken',
    'share_token',
    'reportCode',
    'report_code',
  );
}

function reportCandidateRecords(
  metadata: ReturnType<typeof jsonRecord>,
  section: ReturnType<typeof jsonRecord>,
): Array<ReturnType<typeof jsonRecord>> {
  return [
    section,
    metadata,
    jsonRecord(read(section, 'report', 'reportJson', 'report_json', 'gameReport', 'game_report')),
    jsonRecord(read(metadata, 'report', 'reportJson', 'report_json', 'gameReport', 'game_report')),
    jsonRecord(read(section, 'share', 'shareJson', 'share_json')),
    jsonRecord(read(metadata, 'share', 'shareJson', 'share_json')),
  ];
}

function reportSectionRecord(result: HeroExplorationStepResolutionReadModel): ReturnType<typeof jsonRecord> {
  const metadata = jsonRecord(result.metadataJson);
  const sectionKey = result.outcomeKind === 'trial' || isTrialManifestationFailure(result)
    ? 'trial'
    : result.outcomeKind === 'encounter'
      ? 'encounter'
      : 'nothing';

  return reportSectionRecordFromValue(
    firstJson(
      metadata,
      'reportSection',
      'report_section',
      'report',
      'reportJson',
      'report_json',
      `${sectionKey}Section`,
      `${sectionKey}_section`,
      `${sectionKey}SectionJson`,
      `${sectionKey}_section_json`,
    ),
  ) ?? metadata;
}

function reportSectionRecordFromValue(value: Json | undefined): ReturnType<typeof jsonRecord> {
  const record = jsonRecord(value);

  if (!record) {
    return null;
  }

  return jsonRecord(read(record, 'section')) ?? record;
}

function firstJson(
  recordOrValue: Json | ReturnType<typeof jsonRecord> | undefined,
  ...keys: string[]
): Json | undefined {
  const record = jsonRecord(recordOrValue as Json | undefined) ?? recordOrValue as ReturnType<typeof jsonRecord>;

  return read(record, ...keys);
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

function textArray(value: Json | undefined): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((entry) =>
      typeof entry === 'string' ? textLines(entry) : [],
    );
  }

  return typeof value === 'string' ? textLines(value) : [];
}

function textLines(value: string): string[] {
  return value
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function uniqueText(value: string, index: number, values: string[]): boolean {
  return values.indexOf(value) === index;
}

function isTrialManifestationFailure(
  result: HeroExplorationStepResolutionReadModel,
): boolean {
  if (result.outcomeKind !== 'nothing') {
    return false;
  }

  const metadata = jsonRecord(result.metadataJson);

  return (
    (
      result.rawOutcomeKind === 'trial_opportunity' ||
      read(metadata, 'rawOutcomeKind', 'raw_outcome_kind') === 'trial_opportunity'
    ) &&
    read(metadata, 'trialManifested', 'trial_manifested') === false
  );
}
