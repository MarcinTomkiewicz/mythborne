import {
  PvpPublicReportAccessCopy,
  PvpPublicReportCopy,
  PvpPublicReportKind,
  PvpPublicReportLocale,
} from '../domain/pvp/pvp-public-report-copy.model';
import { Database } from '../types/database.types';
import {
  JsonRecord,
  requireLiteral,
  requireNull,
  requiredBoolean,
  requiredNullableText,
  requiredRecord,
  requiredText,
  read,
} from './json-read';
import { mapPvpPublicAttackReportCopy } from './pvp-public-attack-report-copy.mapper';
import { mapPvpPublicReportSectionsCopy } from './pvp-public-report-sections-copy.mapper';
import { mapPvpPublicReportShellCopy } from './pvp-public-report-shell-copy.mapper';
import { mapPvpPublicSpyReportCopy } from './pvp-public-spy-report-copy.mapper';

type PvpPublicReportCopyRaw =
  Database['public']['Functions']['get_public_pvp_report_copy']['Returns'];

const PUBLIC_REPORT_LOCALES: readonly PvpPublicReportLocale[] = ['pl', 'en'];

export function mapPvpPublicReportCopy(raw: PvpPublicReportCopyRaw): PvpPublicReportCopy {
  const root = requiredRecord(raw, 'get_public_pvp_report_copy');
  const reportKind = nullableUnion(
    requiredNullableText(read(root, 'reportKind'), 'get_public_pvp_report_copy.reportKind'),
    ['attack', 'spy'] as const,
    'get_public_pvp_report_copy.reportKind',
  );
  const shellRaw = read(root, 'shell');
  const attackReportRaw = read(root, 'attackReport');
  const spyReportRaw = read(root, 'spyReport');
  const publicToken = requiredNullableText(read(root, 'publicToken'), 'get_public_pvp_report_copy.publicToken');
  const access = mapAccess(requiredRecord(read(root, 'access'), 'get_public_pvp_report_copy.access'));
  const common = {
    contractKey: 'pvp_report_copy' as const,
    contractVersion: 'pvp_report_copy_v1' as const,
    requestedLocale: requiredText(read(root, 'requestedLocale'), 'get_public_pvp_report_copy.requestedLocale'),
    locale: mapLocale(root),
    fallbackLocale: 'en' as const,
    visibility: 'public' as const,
    reportId: null,
    publicToken,
    sections: mapPvpPublicReportSectionsCopy(
      requiredRecord(read(root, 'sections'), 'get_public_pvp_report_copy.sections'),
    ),
  };

  validateIdentity(root);

  if (!access.isAvailable) {
    requireNull(shellRaw, 'get_public_pvp_report_copy.shell');
    requireNull(attackReportRaw, 'get_public_pvp_report_copy.attackReport');
    requireNull(spyReportRaw, 'get_public_pvp_report_copy.spyReport');
    if (reportKind !== null) {
      throw new Error('get_public_pvp_report_copy.reportKind must be null when unavailable.');
    }

    return {
      ...common,
      reportKind: null,
      access,
      shell: null,
      attackReport: null,
      spyReport: null,
    };
  }

  if (!publicToken) {
    throw new Error('get_public_pvp_report_copy.publicToken is required when available.');
  }

  if (reportKind === 'attack') {
    requireNull(spyReportRaw, 'get_public_pvp_report_copy.spyReport');

    return {
      ...common,
      publicToken,
      reportKind,
      access,
      shell: mapPvpPublicReportShellCopy(
        requiredRecord(shellRaw, 'get_public_pvp_report_copy.shell'),
        publicToken,
      ),
      attackReport: mapPvpPublicAttackReportCopy(
        requiredRecord(attackReportRaw, 'get_public_pvp_report_copy.attackReport'),
      ),
      spyReport: null,
    };
  }

  if (reportKind === 'spy') {
    requireNull(attackReportRaw, 'get_public_pvp_report_copy.attackReport');

    return {
      ...common,
      publicToken,
      reportKind,
      access,
      shell: mapPvpPublicReportShellCopy(
        requiredRecord(shellRaw, 'get_public_pvp_report_copy.shell'),
        publicToken,
      ),
      attackReport: null,
      spyReport: mapPvpPublicSpyReportCopy(
        requiredRecord(spyReportRaw, 'get_public_pvp_report_copy.spyReport'),
      ),
    };
  }

  throw new Error('get_public_pvp_report_copy.reportKind is required when available.');
}

function validateIdentity(root: JsonRecord): void {
  requireLiteral(
    requiredText(read(root, 'contractKey'), 'get_public_pvp_report_copy.contractKey'),
    'pvp_report_copy',
    'get_public_pvp_report_copy.contractKey',
  );
  requireLiteral(
    requiredText(read(root, 'contractVersion'), 'get_public_pvp_report_copy.contractVersion'),
    'pvp_report_copy_v1',
    'get_public_pvp_report_copy.contractVersion',
  );
  requireLiteral(
    requiredText(read(root, 'visibility'), 'get_public_pvp_report_copy.visibility'),
    'public',
    'get_public_pvp_report_copy.visibility',
  );
  requireNull(read(root, 'reportId'), 'get_public_pvp_report_copy.reportId');
  requireLiteral(
    requiredText(read(root, 'fallbackLocale'), 'get_public_pvp_report_copy.fallbackLocale'),
    'en',
    'get_public_pvp_report_copy.fallbackLocale',
  );
}

function mapLocale(root: JsonRecord): PvpPublicReportLocale {
  return requiredUnion(
    requiredText(read(root, 'locale'), 'get_public_pvp_report_copy.locale'),
    PUBLIC_REPORT_LOCALES,
    'get_public_pvp_report_copy.locale',
  );
}

function mapAccess(record: JsonRecord): PvpPublicReportAccessCopy {
  requireLiteral(
    requiredText(read(record, 'viewerRole'), 'get_public_pvp_report_copy.access.viewerRole'),
    'viewer',
    'get_public_pvp_report_copy.access.viewerRole',
  );

  const isAvailable = requiredBoolean(read(record, 'isAvailable'), 'get_public_pvp_report_copy.access.isAvailable');

  return isAvailable
    ? {
        viewerRole: 'viewer',
        isAvailable: true,
      }
    : {
        viewerRole: 'viewer',
        isAvailable: false,
        notFoundKey: requiredUnion(
          requiredText(read(record, 'notFoundKey'), 'get_public_pvp_report_copy.access.notFoundKey'),
          ['public_report_not_found', 'public_pvp_report_unsupported'] as const,
          'get_public_pvp_report_copy.access.notFoundKey',
        ),
        notFoundLabel: requiredText(read(record, 'notFoundLabel'), 'get_public_pvp_report_copy.access.notFoundLabel'),
      };
}

function nullableUnion<T extends string>(
  value: string | null,
  allowed: readonly T[],
  field: string,
): T | null {
  return value === null ? null : requiredUnion(value, allowed, field);
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
