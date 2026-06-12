import { PvpPublicReportSectionsCopy } from '../domain/pvp/pvp-public-report-copy.model';
import {
  JsonRecord,
  requiredRecord,
  requiredText,
  read,
} from './json-read';

export function mapPvpPublicReportSectionsCopy(record: JsonRecord): PvpPublicReportSectionsCopy {
  return {
    result: mapBasicSection(
      requiredRecord(read(record, 'result'), 'get_public_pvp_report_copy.sections.result'),
      'get_public_pvp_report_copy.sections.result',
    ),
    combat: mapBasicSection(
      requiredRecord(read(record, 'combat'), 'get_public_pvp_report_copy.sections.combat'),
      'get_public_pvp_report_copy.sections.combat',
    ),
    participants: mapBasicSection(
      requiredRecord(read(record, 'participants'), 'get_public_pvp_report_copy.sections.participants'),
      'get_public_pvp_report_copy.sections.participants',
    ),
    spy: mapBasicSection(
      requiredRecord(read(record, 'spy'), 'get_public_pvp_report_copy.sections.spy'),
      'get_public_pvp_report_copy.sections.spy',
    ),
    resources: mapOmittedSection(
      requiredRecord(read(record, 'resources'), 'get_public_pvp_report_copy.sections.resources'),
      'get_public_pvp_report_copy.sections.resources',
    ),
    experience: mapOmittedSection(
      requiredRecord(read(record, 'experience'), 'get_public_pvp_report_copy.sections.experience'),
      'get_public_pvp_report_copy.sections.experience',
    ),
    publicNotice: mapNoticeSection(
      requiredRecord(read(record, 'publicNotice'), 'get_public_pvp_report_copy.sections.publicNotice'),
      'get_public_pvp_report_copy.sections.publicNotice',
    ),
    notFound: mapNoticeSection(
      requiredRecord(read(record, 'notFound'), 'get_public_pvp_report_copy.sections.notFound'),
      'get_public_pvp_report_copy.sections.notFound',
    ),
  };
}

function mapBasicSection(record: JsonRecord, fieldPrefix: string) {
  return {
    label: requiredText(read(record, 'label'), `${fieldPrefix}.label`),
    emptyLabel: requiredText(read(record, 'emptyLabel'), `${fieldPrefix}.emptyLabel`),
  };
}

function mapOmittedSection(record: JsonRecord, fieldPrefix: string) {
  return {
    label: requiredText(read(record, 'label'), `${fieldPrefix}.label`),
    privateOmittedLabel: requiredText(
      read(record, 'privateOmittedLabel'),
      `${fieldPrefix}.privateOmittedLabel`,
    ),
  };
}

function mapNoticeSection(record: JsonRecord, fieldPrefix: string) {
  return {
    title: requiredText(read(record, 'title'), `${fieldPrefix}.title`),
    text: requiredText(read(record, 'text'), `${fieldPrefix}.text`),
  };
}
