import {
  PvpPrivateAttackReportAccessCopy,
  PvpPrivateAttackReportSectionsCopy,
  PvpPrivateAttackViewerRole,
  PvpPrivateReportAccessCopy,
  PvpPrivateReportCopy,
  PvpPrivateReportKind,
  PvpPrivateReportLocale,
  PvpPrivateReportShellCopy,
  PvpPrivateSpyReportAccessCopy,
  PvpPrivateSpyReportSectionsCopy,
  PvpPrivateSpyViewerRole,
} from '../domain/pvp/pvp-private-report-copy.model';
import { Database } from '../types/database.types';
import {
  JsonRecord,
  requireLiteral,
  requireNull,
  requiredNullableText,
  requiredRecord,
  requiredText,
  read,
} from './json-read';
import { mapPrivateAttackReportCopy } from './pvp-private-attack-report-copy.mapper';
import { mapPrivateSpyReportCopy } from './pvp-private-spy-report-copy.mapper';

type PvpReportCopyRaw =
  Database['public']['Functions']['get_pvp_report_copy']['Returns'];

const PRIVATE_REPORT_LOCALES: readonly PvpPrivateReportLocale[] = ['pl', 'en'];
const ATTACK_VIEWER_ROLES: readonly PvpPrivateAttackViewerRole[] = [
  'attacker',
  'defender',
  'viewer',
];
const SPY_VIEWER_ROLES: readonly PvpPrivateSpyViewerRole[] = [
  'spy_owner',
  'target',
  'viewer',
];

export function mapPvpPrivateReportCopy(raw: PvpReportCopyRaw): PvpPrivateReportCopy {
  const root = requiredRecord(raw, 'get_pvp_report_copy');
  const reportKind = requiredUnion(
    requiredText(read(root, 'reportKind'), 'get_pvp_report_copy.reportKind'),
    ['attack', 'spy'] as const,
    'get_pvp_report_copy.reportKind',
  );
  const attackReportRaw = read(root, 'attackReport');
  const spyReportRaw = read(root, 'spyReport');
  const common = {
    contractKey: 'pvp_report_copy' as const,
    contractVersion: 'pvp_report_copy_v1' as const,
    requestedLocale: requiredText(read(root, 'requestedLocale'), 'get_pvp_report_copy.requestedLocale'),
    locale: mapLocale(root),
    fallbackLocale: 'en' as const,
    visibility: 'private' as const,
    reportId: requiredText(read(root, 'reportId'), 'get_pvp_report_copy.reportId'),
    publicToken: requiredNullableText(read(root, 'publicToken'), 'get_pvp_report_copy.publicToken'),
    shell: mapShell(requiredRecord(read(root, 'shell'), 'get_pvp_report_copy.shell')),
  };

  validateIdentity(root);

  if (reportKind === 'attack') {
    requireNull(spyReportRaw, 'get_pvp_report_copy.spyReport');
    const access = mapAccess(
      requiredRecord(read(root, 'access'), 'get_pvp_report_copy.access'),
      reportKind,
    );
    const attackReport = mapPrivateAttackReportCopy(
      requiredRecord(attackReportRaw, 'get_pvp_report_copy.attackReport'),
    );
    requireMatchingViewerRole(
      access.viewerRole,
      attackReport.viewerRole,
      'get_pvp_report_copy.access.viewerRole',
      'get_pvp_report_copy.attackReport.viewerRole',
    );

    return {
      ...common,
      reportKind,
      access,
      sections: mapSections(
        requiredRecord(read(root, 'sections'), 'get_pvp_report_copy.sections'),
        reportKind,
      ),
      attackReport,
      spyReport: null,
    };
  }

  requireNull(attackReportRaw, 'get_pvp_report_copy.attackReport');
  const access = mapAccess(
    requiredRecord(read(root, 'access'), 'get_pvp_report_copy.access'),
    reportKind,
  );
  const spyReport = mapPrivateSpyReportCopy(
    requiredRecord(spyReportRaw, 'get_pvp_report_copy.spyReport'),
  );
  requireMatchingViewerRole(
    access.viewerRole,
    spyReport.viewerRole,
    'get_pvp_report_copy.access.viewerRole',
    'get_pvp_report_copy.spyReport.viewerRole',
  );

  return {
    ...common,
    reportKind,
    access,
    sections: mapSections(
      requiredRecord(read(root, 'sections'), 'get_pvp_report_copy.sections'),
      reportKind,
    ),
    attackReport: null,
    spyReport,
  };
}

function validateIdentity(root: JsonRecord): void {
  requireLiteral(
    requiredText(read(root, 'contractKey'), 'get_pvp_report_copy.contractKey'),
    'pvp_report_copy',
    'get_pvp_report_copy.contractKey',
  );
  requireLiteral(
    requiredText(read(root, 'contractVersion'), 'get_pvp_report_copy.contractVersion'),
    'pvp_report_copy_v1',
    'get_pvp_report_copy.contractVersion',
  );
  requireLiteral(
    requiredText(read(root, 'visibility'), 'get_pvp_report_copy.visibility'),
    'private',
    'get_pvp_report_copy.visibility',
  );
  requireLiteral(
    requiredText(read(root, 'fallbackLocale'), 'get_pvp_report_copy.fallbackLocale'),
    'en',
    'get_pvp_report_copy.fallbackLocale',
  );
}

function mapLocale(root: JsonRecord): PvpPrivateReportLocale {
  return requiredUnion(
    requiredText(read(root, 'locale'), 'get_pvp_report_copy.locale'),
    PRIVATE_REPORT_LOCALES,
    'get_pvp_report_copy.locale',
  );
}

function mapAccess(
  record: JsonRecord,
  reportKind: 'attack',
): PvpPrivateAttackReportAccessCopy;
function mapAccess(
  record: JsonRecord,
  reportKind: 'spy',
): PvpPrivateSpyReportAccessCopy;
function mapAccess(
  record: JsonRecord,
  reportKind: PvpPrivateReportKind,
): PvpPrivateReportAccessCopy {
  const viewerRole = requiredText(read(record, 'viewerRole'), 'get_pvp_report_copy.access.viewerRole');

  return {
    heroId: requiredText(read(record, 'heroId'), 'get_pvp_report_copy.access.heroId'),
    accessRole: requiredText(read(record, 'accessRole'), 'get_pvp_report_copy.access.accessRole'),
    viewerRole: reportKind === 'attack'
      ? requiredUnion(viewerRole, ATTACK_VIEWER_ROLES, 'get_pvp_report_copy.access.viewerRole')
      : requiredUnion(viewerRole, SPY_VIEWER_ROLES, 'get_pvp_report_copy.access.viewerRole'),
  };
}

function mapShell(record: JsonRecord): PvpPrivateReportShellCopy {
  return {
    eyebrow: requiredText(read(record, 'eyebrow'), 'get_pvp_report_copy.shell.eyebrow'),
    sourceLabel: requiredText(read(record, 'sourceLabel'), 'get_pvp_report_copy.shell.sourceLabel'),
    eventTypeLabel: requiredText(read(record, 'eventTypeLabel'), 'get_pvp_report_copy.shell.eventTypeLabel'),
    title: requiredText(read(record, 'title'), 'get_pvp_report_copy.shell.title'),
    summary: requiredText(read(record, 'summary'), 'get_pvp_report_copy.shell.summary'),
  };
}

function mapSections(
  record: JsonRecord,
  reportKind: 'attack',
): PvpPrivateAttackReportSectionsCopy;
function mapSections(
  record: JsonRecord,
  reportKind: 'spy',
): PvpPrivateSpyReportSectionsCopy;
function mapSections(
  record: JsonRecord,
  reportKind: PvpPrivateReportKind,
): PvpPrivateAttackReportSectionsCopy | PvpPrivateSpyReportSectionsCopy {
  return reportKind === 'attack'
    ? {
        result: requiredSection(record, 'result'),
        battleLoot: requiredSection(record, 'battleLoot'),
        resources: requiredSection(record, 'resources'),
        experience: requiredSection(record, 'experience'),
        glory: requiredSection(record, 'glory'),
        combat: requiredSection(record, 'combat'),
      }
    : {
        result: requiredSection(record, 'result'),
        spy: requiredSection(record, 'spy'),
        resources: requiredSection(record, 'resources'),
        buildings: requiredSection(record, 'buildings'),
        equipment: requiredSection(record, 'equipment'),
        stats: requiredSection(record, 'stats'),
        detection: requiredSection(record, 'detection'),
      };
}

function requiredSection(record: JsonRecord, key: string): string {
  return requiredText(read(record, key), `get_pvp_report_copy.sections.${key}`);
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

function requireMatchingViewerRole(
  rootViewerRole: string,
  branchViewerRole: string,
  rootField: string,
  branchField: string,
): void {
  if (rootViewerRole !== branchViewerRole) {
    throw new Error(`${rootField} must match ${branchField}.`);
  }
}
