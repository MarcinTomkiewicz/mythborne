import {
  AntiAbuseSanctionFormField,
  AntiAbuseSanctionFormFieldKey,
  AntiAbuseSanctionFormModel,
  AntiAbuseSanctionTypeFormSource,
} from '../domain/anti-abuse/anti-abuse-sanction-form.model';

const BASE_SANCTION_FIELDS: readonly AntiAbuseSanctionFormField[] = [
  {
    key: 'reason',
    label: 'Reason',
    visible: true,
    required: true,
    helperText: 'Required staff reason for creating this sanction.',
  },
  {
    key: 'targetHeroId',
    label: 'Target hero',
    visible: true,
    required: true,
    helperText: 'Use server-scoped hero/account target search to select the target hero.',
  },
  {
    key: 'targetUserId',
    label: 'Target account',
    visible: true,
    required: true,
    helperText: 'Use the selected hero/account target so the matching account id is captured.',
  },
];

export function createAntiAbuseSanctionFormModel(
  sanctionType: AntiAbuseSanctionTypeFormSource,
): AntiAbuseSanctionFormModel {
  return {
    sanctionTypeKey: sanctionType.key,
    label: sanctionType.label,
    description: sanctionType.description,
    helperText: sanctionType.helperText,
    adminDescription: sanctionType.adminDescription,
    fields: [
      ...BASE_SANCTION_FIELDS,
      optionalField(
        'sourceHeroId',
        'Source hero',
        sanctionType.requiresSourceHero,
        'Select the hero that supplied the evidence or item context.',
      ),
      optionalField(
        'durationDays',
        'Duration',
        sanctionType.requiresDurationDays,
        'Duration in days for temporary sanctions.',
      ),
      optionalField(
        'amountCharacterPoints',
        'Character Points amount',
        sanctionType.requiresCharacterPointsAmount,
        'Character Points amount for this sanction.',
      ),
      optionalField(
        'itemIds',
        'Items',
        sanctionType.requiresItemSelection,
        'Items linked to this sanction.',
      ),
    ],
  };
}

export function visibleSanctionFormFields(
  model: AntiAbuseSanctionFormModel,
): readonly AntiAbuseSanctionFormField[] {
  return model.fields.filter((field) => field.visible);
}

export function requiredSanctionFormFieldKeys(
  model: AntiAbuseSanctionFormModel,
): readonly AntiAbuseSanctionFormFieldKey[] {
  return model.fields.filter((field) => field.required).map((field) => field.key);
}

function optionalField(
  key: AntiAbuseSanctionFormFieldKey,
  label: string,
  enabled: boolean,
  helperText: string,
): AntiAbuseSanctionFormField {
  return {
    key,
    label,
    visible: enabled,
    required: enabled,
    helperText,
  };
}
