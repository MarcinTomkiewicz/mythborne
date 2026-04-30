import {
  PlayerRelationshipDeclarationFormField,
  PlayerRelationshipDeclarationFormFieldKey,
  PlayerRelationshipDeclarationFormModel,
  PlayerRelationshipDeclarationTypeFormSource,
} from '../domain/anti-abuse/player-relationship-declaration-form.model';

const BASE_DECLARATION_FIELDS: readonly PlayerRelationshipDeclarationFormField[] = [
  {
    key: 'title',
    label: 'Title',
    visible: true,
    required: true,
    helperText: 'Short label for this declaration.',
  },
  {
    key: 'description',
    label: 'Description / reason',
    visible: true,
    required: true,
    helperText: 'Explain why this relationship should be declared.',
  },
  {
    key: 'participants',
    label: 'Participants',
    visible: true,
    required: true,
    helperText: null,
  },
];

export function createPlayerRelationshipDeclarationFormModel(
  declarationType: PlayerRelationshipDeclarationTypeFormSource,
): PlayerRelationshipDeclarationFormModel {
  return {
    declarationTypeKey: declarationType.key,
    label: declarationType.label,
    description: declarationType.description,
    helperText: declarationType.helperText,
    participantRules: {
      minParticipants: normalizedMinParticipants(declarationType.minParticipants),
      maxParticipants: normalizedMaxParticipants(
        declarationType.minParticipants,
        declarationType.maxParticipants,
      ),
      helperText: participantHelperText(declarationType),
    },
    fields: [
      ...baseFieldsFor(declarationType),
      optionalField(
        'amountCharacterPoints',
        'Amount',
        declarationType.requiresAmount,
        'Character Points amount relevant to this declaration.',
      ),
      optionalField(
        'expiresAt',
        'Expiration',
        declarationType.requiresExpiration,
        'When this declaration should stop applying.',
      ),
      optionalField(
        'itemIds',
        'Items',
        declarationType.requiresItemSelection,
        'Items related to this declaration.',
      ),
      optionalField(
        'tradeIds',
        'Trades',
        declarationType.requiresTradeSelection,
        'Trades related to this declaration.',
      ),
    ],
  };
}

export function visibleDeclarationFormFields(
  model: PlayerRelationshipDeclarationFormModel,
): readonly PlayerRelationshipDeclarationFormField[] {
  return model.fields.filter((field) => field.visible);
}

export function requiredDeclarationFormFieldKeys(
  model: PlayerRelationshipDeclarationFormModel,
): readonly PlayerRelationshipDeclarationFormFieldKey[] {
  return model.fields.filter((field) => field.required).map((field) => field.key);
}

function baseFieldsFor(
  declarationType: PlayerRelationshipDeclarationTypeFormSource,
): readonly PlayerRelationshipDeclarationFormField[] {
  return BASE_DECLARATION_FIELDS.map((field) =>
    field.key === 'participants'
      ? {
          ...field,
          helperText: participantHelperText(declarationType),
        }
      : field,
  );
}

function optionalField(
  key: PlayerRelationshipDeclarationFormFieldKey,
  label: string,
  enabled: boolean,
  helperText: string,
): PlayerRelationshipDeclarationFormField {
  return {
    key,
    label,
    visible: enabled,
    required: enabled,
    helperText,
  };
}

function normalizedMinParticipants(value: number): number {
  return Number.isInteger(value) && value > 0 ? value : 1;
}

function normalizedMaxParticipants(
  minParticipants: number,
  maxParticipants: number | null,
): number | null {
  if (maxParticipants === null) {
    return null;
  }

  const min = normalizedMinParticipants(minParticipants);
  return Number.isInteger(maxParticipants) && maxParticipants >= min
    ? maxParticipants
    : min;
}

function participantHelperText(
  declarationType: PlayerRelationshipDeclarationTypeFormSource,
): string {
  const min = normalizedMinParticipants(declarationType.minParticipants);
  const max = normalizedMaxParticipants(
    declarationType.minParticipants,
    declarationType.maxParticipants,
  );

  return max === null
    ? `At least ${min} participant(s) are required.`
    : `${min}-${max} participant(s) are required.`;
}
