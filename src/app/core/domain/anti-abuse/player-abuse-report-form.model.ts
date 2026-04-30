import { PlayerAbuseReportTypeEntry } from './anti-abuse-dictionary.model';

export type PlayerAbuseReportFormFieldKey =
  | 'title'
  | 'description'
  | 'accusedHeroId'
  | 'relatedItemId'
  | 'relatedTradeId';

export interface PlayerAbuseReportFormField {
  key: PlayerAbuseReportFormFieldKey;
  label: string;
  visible: boolean;
  required: boolean;
  helperText: string | null;
}

export interface PlayerAbuseReportFormModel {
  reportTypeKey: string;
  label: string;
  description: string;
  helperText: string | null;
  fields: readonly PlayerAbuseReportFormField[];
}

export type PlayerAbuseReportTypeFormSource = PlayerAbuseReportTypeEntry;
