import { PlayerRelationshipDeclarationTypeEntry } from './anti-abuse-dictionary.model';

export type PlayerRelationshipDeclarationFormFieldKey =
  | 'title'
  | 'description'
  | 'participants'
  | 'amountCharacterPoints'
  | 'expiresAt'
  | 'itemIds'
  | 'tradeIds';

export interface PlayerRelationshipDeclarationParticipantRules {
  minParticipants: number;
  maxParticipants: number | null;
  helperText: string | null;
}

export interface PlayerRelationshipDeclarationFormField {
  key: PlayerRelationshipDeclarationFormFieldKey;
  label: string;
  visible: boolean;
  required: boolean;
  helperText: string | null;
}

export interface PlayerRelationshipDeclarationFormModel {
  declarationTypeKey: string;
  label: string;
  description: string;
  helperText: string | null;
  participantRules: PlayerRelationshipDeclarationParticipantRules;
  fields: readonly PlayerRelationshipDeclarationFormField[];
}

export type PlayerRelationshipDeclarationTypeFormSource =
  PlayerRelationshipDeclarationTypeEntry;
