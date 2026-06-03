import { Json } from '../types/database.types';
import { firstTextArray, firstTextInRecords } from './json-display-text';
import { jsonRecord, read } from './json-read';

export function gameReportNarrativeLines(rawJson: Json | undefined): string[] {
  const keys = ['narrativeLines', 'narrative_lines', 'playerNarrativeLines', 'player_narrative_lines'];

  return reportTextRecords(rawJson)
    .flatMap((record) => firstTextArray(record, ...keys))
    .filter((value, index, values) => values.indexOf(value) === index);
}

export function gameReportSummaryText(rawJson: Json | undefined): string | null {
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

export function gameReportOutcomeToneText(rawJson: Json | undefined): string | null {
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

export function gameReportOutcomeTitle(rawJson: Json | undefined): string | null {
  return firstTextInRecords(
    reportTextRecords(rawJson),
    'outcomeTitle',
    'outcome_title',
    'resultTitle',
    'result_title',
    'bannerTitle',
    'banner_title',
    'title',
  );
}

export function gameReportDirectReportId(rawJson: Json | undefined): string | null {
  return firstTextInRecords(
    reportTextRecords(rawJson),
    'gameReportId',
    'game_report_id',
    'reportId',
    'report_id',
  );
}

export function gameReportPublicPath(rawJson: Json | undefined): string | null {
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

export function gameReportPublicToken(rawJson: Json | undefined): string | null {
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

export function gameReportRewardHeadingText(input: {
  rewardRawJson: Json | undefined;
  reportRawJson: Json | undefined;
}): string | null {
  return firstTextInRecords(rewardTextRecords(input), 'title', 'heading', 'label');
}

export function gameReportRewardIntroText(input: {
  rewardRawJson: Json | undefined;
  reportRawJson: Json | undefined;
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
  const section = gameReportSectionRecord(rawJson);
  const raw = jsonRecord(rawJson);

  return [section, raw];
}

function publicReportTextRecords(rawJson: Json | undefined): Array<ReturnType<typeof jsonRecord>> {
  const section = gameReportSectionRecord(rawJson);
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
  reportRawJson: Json | undefined;
}): Array<ReturnType<typeof jsonRecord>> {
  const rewardRaw = jsonRecord(input.rewardRawJson);
  const rewardSection = jsonRecord(read(
    rewardRaw,
    'rewardSection',
    'reward_section',
    'rewardSectionJson',
    'reward_section_json',
  ));
  const reportRewardSection = jsonRecord(read(
    jsonRecord(input.reportRawJson),
    'rewardSection',
    'reward_section',
    'rewardSectionJson',
    'reward_section_json',
  ));

  return [rewardSection, reportRewardSection, rewardRaw];
}

function gameReportSectionRecord(rawJson: Json | undefined): ReturnType<typeof jsonRecord> {
  const raw = jsonRecord(rawJson);

  return jsonRecord(read(
    raw,
    'reportSection',
    'report_section',
    'reportSectionJson',
    'report_section_json',
    'resultSection',
    'result_section',
    'resultSectionJson',
    'result_section_json',
    'combatSection',
    'combat_section',
    'combatSectionJson',
    'combat_section_json',
  ));
}
