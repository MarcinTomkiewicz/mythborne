import {
  PvpPrivateAttackReportCopy,
  PvpPrivateAttackViewerRole,
  PvpPrivateGloryCopy,
} from '../domain/pvp/pvp-private-report-copy.model';
import {
  JsonRecord,
  requireLiteral,
  requiredArray,
  requiredNumber,
  requiredRecord,
  requiredText,
  read,
} from './json-read';
import { mapRichTextFragments } from './rich-text.mapper';

const ATTACK_VIEWER_ROLES: readonly PvpPrivateAttackViewerRole[] = [
  'attacker',
  'defender',
  'viewer',
];
const GLORY_VARIANTS: readonly PvpPrivateGloryCopy['variantKey'][] = [
  'majorGain',
  'minorGain',
  'noChange',
  'minorLoss',
  'majorLoss',
  'unavailable',
];

export function mapPrivateAttackReportCopy(record: JsonRecord): PvpPrivateAttackReportCopy {
  const result = requiredRecord(
    read(record, 'result'),
    'get_pvp_report_copy.attackReport.result',
  );
  const experience = requiredRecord(
    read(record, 'experience'),
    'get_pvp_report_copy.attackReport.experience',
  );
  const resources = requiredRecord(
    read(record, 'resources'),
    'get_pvp_report_copy.attackReport.resources',
  );

  return {
    outcomeKey: requiredText(read(record, 'outcomeKey'), 'get_pvp_report_copy.attackReport.outcomeKey'),
    viewerRole: requiredUnion(
      requiredText(read(record, 'viewerRole'), 'get_pvp_report_copy.attackReport.viewerRole'),
      ATTACK_VIEWER_ROLES,
      'get_pvp_report_copy.attackReport.viewerRole',
    ),
    result: {
      title: requiredText(read(result, 'title'), 'get_pvp_report_copy.attackReport.result.title'),
      narrativePlainText: requiredText(
        read(result, 'narrativePlainText'),
        'get_pvp_report_copy.attackReport.result.narrativePlainText',
      ),
    },
    experience: {
      rows: requiredArray(
        read(experience, 'rows'),
        'get_pvp_report_copy.attackReport.experience.rows',
      ).map((row, index) => ({
        recipientHeroId: requiredText(
          read(row, 'recipientHeroId'),
          `get_pvp_report_copy.attackReport.experience.rows[${index}].recipientHeroId`,
        ),
        amount: requiredNumber(
          read(row, 'amount'),
          `get_pvp_report_copy.attackReport.experience.rows[${index}].amount`,
        ),
        label: requiredText(
          read(row, 'label'),
          `get_pvp_report_copy.attackReport.experience.rows[${index}].label`,
        ),
        displayValue: requiredText(
          read(row, 'displayValue'),
          `get_pvp_report_copy.attackReport.experience.rows[${index}].displayValue`,
        ),
      })),
      lines: requiredArray(
        read(experience, 'lines'),
        'get_pvp_report_copy.attackReport.experience.lines',
      ).map((row, index) => ({
        key: requiredText(read(row, 'key'), `get_pvp_report_copy.attackReport.experience.lines[${index}].key`),
        recipient: requiredText(
          read(row, 'recipient'),
          `get_pvp_report_copy.attackReport.experience.lines[${index}].recipient`,
        ),
        amount: requiredNumber(
          read(row, 'amount'),
          `get_pvp_report_copy.attackReport.experience.lines[${index}].amount`,
        ),
        text: requiredText(read(row, 'text'), `get_pvp_report_copy.attackReport.experience.lines[${index}].text`),
      })),
    },
    resources: {
      line: requiredText(read(resources, 'line'), 'get_pvp_report_copy.attackReport.resources.line'),
      gainRows: mapResourceRows(resources, 'gainRows'),
      lossRows: mapResourceRows(resources, 'lossRows'),
    },
    glory: mapGlory(requiredRecord(read(record, 'glory'), 'get_pvp_report_copy.attackReport.glory')),
  };
}

function mapResourceRows(resources: JsonRecord, key: 'gainRows' | 'lossRows') {
  return requiredArray(
    read(resources, key),
    `get_pvp_report_copy.attackReport.resources.${key}`,
  ).map((row, index) => ({
    key: requiredText(read(row, 'key'), `get_pvp_report_copy.attackReport.resources.${key}[${index}].key`),
    resourceType: requiredText(
      read(row, 'resourceType'),
      `get_pvp_report_copy.attackReport.resources.${key}[${index}].resourceType`,
    ),
    label: requiredText(read(row, 'label'), `get_pvp_report_copy.attackReport.resources.${key}[${index}].label`),
    amount: requiredNumber(read(row, 'amount'), `get_pvp_report_copy.attackReport.resources.${key}[${index}].amount`),
    displayValue: requiredText(
      read(row, 'displayValue'),
      `get_pvp_report_copy.attackReport.resources.${key}[${index}].displayValue`,
    ),
  }));
}

function mapGlory(record: JsonRecord): PvpPrivateGloryCopy {
  return {
    variantKey: requiredUnion(
      requiredText(read(record, 'variantKey'), 'get_pvp_report_copy.attackReport.glory.variantKey'),
      GLORY_VARIANTS,
      'get_pvp_report_copy.attackReport.glory.variantKey',
    ),
    linePlainText: requiredText(read(record, 'linePlainText'), 'get_pvp_report_copy.attackReport.glory.linePlainText'),
    lineRichText: mapRichTextFragments(
      read(record, 'lineRichText'),
      'get_pvp_report_copy.attackReport.glory.lineRichText',
      requireTextRichTextKind,
    ),
  };
}

function requireTextRichTextKind(value: string, field: string): 'text' {
  return requireLiteral(value, 'text', field);
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
