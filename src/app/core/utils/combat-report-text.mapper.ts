import { Json } from '../types/database.types';
import { firstTextArray, firstTextInRecords } from './json-display-text';
import { jsonRecord, read } from './json-read';

export function combatReportParticipantsJson(input: {
  rawJson: Json | undefined;
  participantsJson: Json | undefined;
}): Json | undefined {
  return read(combatReportSectionRecord(input.rawJson), 'participants') ??
    input.participantsJson;
}

export function combatReportAttacksJson(input: {
  rawJson: Json | undefined;
  attacksJson: Json | undefined;
}): Json | undefined {
  return read(combatReportSectionRecord(input.rawJson), 'attacks') ??
    input.attacksJson;
}

export function combatReportNarrativeLines(rawJson: Json | undefined): string[] {
  const keys = ['narrativeLines', 'narrative_lines', 'playerNarrativeLines', 'player_narrative_lines'];

  return reportTextRecords(rawJson)
    .flatMap((record) => firstTextArray(record, ...keys))
    .filter((value, index, values) => values.indexOf(value) === index);
}

export function combatReportSummaryText(rawJson: Json | undefined): string | null {
  return firstTextInRecords(
    reportTextRecords(rawJson),
    'summary',
    'playerSummary',
    'player_summary',
    'detailText',
    'detail_text',
    'displayText',
    'display_text',
  );
}

export function combatReportOutcomeToneText(rawJson: Json | undefined): string | null {
  return firstTextInRecords(
    reportTextRecords(rawJson),
    'viewerOutcomeTone',
    'viewer_outcome_tone',
    'outcomeTone',
    'outcome_tone',
    'viewerResult',
    'viewer_result',
  );
}

export function combatReportOutcomeTitle(rawJson: Json | undefined): string | null {
  return firstTextInRecords(
    reportTextRecords(rawJson),
    'outcomeTitle',
    'outcome_title',
    'resultTitle',
    'result_title',
    'bannerTitle',
    'banner_title',
  );
}

export function combatReportDirectReportId(rawJson: Json | undefined): string | null {
  return firstTextInRecords(
    reportTextRecords(rawJson),
    'gameReportId',
    'game_report_id',
    'reportId',
    'report_id',
  );
}

export function combatReportPublicPath(rawJson: Json | undefined): string | null {
  return firstTextInRecords(
    publicReportTextRecords(rawJson),
    'publicReportUrl',
    'public_report_url',
    'externalReportUrl',
    'external_report_url',
    'shareUrl',
    'share_url',
  );
}

export function combatReportPublicToken(rawJson: Json | undefined): string | null {
  return firstTextInRecords(
    publicReportTextRecords(rawJson),
    'publicToken',
    'public_token',
    'shareToken',
    'share_token',
    'reportCode',
    'report_code',
  );
}

export function combatRewardHeadingText(input: {
  rewardRawJson: Json | undefined;
  combatRawJson: Json | undefined;
}): string | null {
  return firstTextInRecords(rewardTextRecords(input), 'title', 'heading', 'label');
}

export function combatRewardIntroText(input: {
  rewardRawJson: Json | undefined;
  combatRawJson: Json | undefined;
}): string | null {
  return firstTextInRecords(
    rewardTextRecords(input),
    'intro',
    'introText',
    'intro_text',
    'summary',
    'playerSummary',
    'player_summary',
    'displayText',
    'display_text',
  );
}

function reportTextRecords(rawJson: Json | undefined): Array<ReturnType<typeof jsonRecord>> {
  const section = combatReportSectionRecord(rawJson);
  const raw = jsonRecord(rawJson);

  return [section, raw];
}

function publicReportTextRecords(rawJson: Json | undefined): Array<ReturnType<typeof jsonRecord>> {
  const section = combatReportSectionRecord(rawJson);
  const raw = jsonRecord(rawJson);

  return [
    jsonRecord(read(section, 'report', 'reportJson', 'report_json', 'gameReport', 'game_report')),
    jsonRecord(read(raw, 'report', 'reportJson', 'report_json', 'gameReport', 'game_report')),
    jsonRecord(read(section, 'share', 'shareJson', 'share_json')),
    jsonRecord(read(raw, 'share', 'shareJson', 'share_json')),
    section,
    raw,
  ];
}

function rewardTextRecords(input: {
  rewardRawJson: Json | undefined;
  combatRawJson: Json | undefined;
}): Array<ReturnType<typeof jsonRecord>> {
  const rewardRaw = jsonRecord(input.rewardRawJson);
  const rewardSection = jsonRecord(read(
    rewardRaw,
    'rewardSection',
    'reward_section',
    'rewardSectionJson',
    'reward_section_json',
  ));
  const combatRewardSection = jsonRecord(read(
    jsonRecord(input.combatRawJson),
    'rewardSection',
    'reward_section',
    'rewardSectionJson',
    'reward_section_json',
  ));

  return [rewardSection, combatRewardSection, rewardRaw];
}

function combatReportSectionRecord(rawJson: Json | undefined): ReturnType<typeof jsonRecord> {
  return jsonRecord(read(
    jsonRecord(rawJson),
    'combatSection',
    'combat_section',
    'combatSectionJson',
    'combat_section_json',
  ));
}
