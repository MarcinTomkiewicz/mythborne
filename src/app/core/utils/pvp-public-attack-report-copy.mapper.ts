import {
  PvpPublicAttackOutcomeKey,
  PvpPublicAttackReportCopy,
} from '../domain/pvp/pvp-public-report-copy.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  requireLiteral,
  requireNull,
  requiredArray,
  requiredBoolean,
  requiredText,
  read,
} from './json-read';

const ATTACK_OUTCOMES: readonly PvpPublicAttackOutcomeKey[] = [
  'attacker_victory',
  'defender_victory',
  'draw',
];

export function mapPvpPublicAttackReportCopy(record: JsonRecord): PvpPublicAttackReportCopy {
  requireLiteral(
    requiredText(read(record, 'reportKind'), 'get_public_pvp_report_copy.attackReport.reportKind'),
    'attack',
    'get_public_pvp_report_copy.attackReport.reportKind',
  );
  requireLiteral(
    requiredText(read(record, 'viewerRole'), 'get_public_pvp_report_copy.attackReport.viewerRole'),
    'viewer',
    'get_public_pvp_report_copy.attackReport.viewerRole',
  );
  assertEmptyArray(read(record, 'experienceLines'), 'get_public_pvp_report_copy.attackReport.experienceLines');
  requireNull(read(record, 'resourceLine'), 'get_public_pvp_report_copy.attackReport.resourceLine');
  requireNull(read(record, 'gloryLine'), 'get_public_pvp_report_copy.attackReport.gloryLine');
  requireTrue(
    requiredBoolean(
      read(record, 'privateDetailsOmitted'),
      'get_public_pvp_report_copy.attackReport.privateDetailsOmitted',
    ),
    'get_public_pvp_report_copy.attackReport.privateDetailsOmitted',
  );

  return {
    reportKind: 'attack',
    viewerRole: 'viewer',
    outcomeKey: requiredUnion(
      requiredText(read(record, 'outcomeKey'), 'get_public_pvp_report_copy.attackReport.outcomeKey'),
      ATTACK_OUTCOMES,
      'get_public_pvp_report_copy.attackReport.outcomeKey',
    ),
    title: requiredText(read(record, 'title'), 'get_public_pvp_report_copy.attackReport.title'),
    summary: requiredText(read(record, 'summary'), 'get_public_pvp_report_copy.attackReport.summary'),
    resultTitle: requiredText(read(record, 'resultTitle'), 'get_public_pvp_report_copy.attackReport.resultTitle'),
    resultNarrative: requiredText(
      read(record, 'resultNarrative'),
      'get_public_pvp_report_copy.attackReport.resultNarrative',
    ),
    experienceLines: [],
    resourceLine: null,
    gloryLine: null,
    privateDetailsOmitted: true,
    privateDetailsOmittedLabel: requiredText(
      read(record, 'privateDetailsOmittedLabel'),
      'get_public_pvp_report_copy.attackReport.privateDetailsOmittedLabel',
    ),
  };
}

function assertEmptyArray(value: Json | undefined, field: string): void {
  if (requiredArray(value, field).length !== 0) {
    throw new Error(`${field} must be empty.`);
  }
}

function requireTrue(value: boolean, field: string): true {
  if (value !== true) {
    throw new Error(`${field} must be true.`);
  }

  return true;
}

function requiredUnion<T extends string>(
  value: string,
  allowed: readonly T[],
  field: string,
): T {
  if (!allowed.includes(value as T)) {
    throw new Error(`${field} must be one of ${allowed.join(', ')}.`);
  }

  return value as T;
}
