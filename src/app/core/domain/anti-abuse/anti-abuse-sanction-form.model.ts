import { AntiAbuseSanctionTypeEntry } from './anti-abuse-dictionary.model';

export type AntiAbuseSanctionFormFieldKey =
  | 'reason'
  | 'targetHeroId'
  | 'targetUserId'
  | 'sourceHeroId'
  | 'durationDays'
  | 'amountCharacterPoints'
  | 'itemIds';

export interface AntiAbuseSanctionFormField {
  key: AntiAbuseSanctionFormFieldKey;
  label: string;
  visible: boolean;
  required: boolean;
  helperText: string | null;
}

export interface AntiAbuseSanctionFormModel {
  sanctionTypeKey: string;
  label: string;
  description: string;
  helperText: string | null;
  adminDescription: string | null;
  fields: readonly AntiAbuseSanctionFormField[];
}

export type AntiAbuseSanctionTypeFormSource = AntiAbuseSanctionTypeEntry;
