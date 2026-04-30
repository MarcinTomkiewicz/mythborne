import {
  PlayerAbuseReportFormField,
  PlayerAbuseReportFormFieldKey,
  PlayerAbuseReportFormModel,
  PlayerAbuseReportTypeFormSource,
} from '../domain/anti-abuse/player-abuse-report-form.model';

const BASE_REPORT_FIELDS: readonly PlayerAbuseReportFormField[] = [
  {
    key: 'title',
    label: 'Title',
    visible: true,
    required: true,
    helperText: 'Short label for this report.',
  },
  {
    key: 'description',
    label: 'Description',
    visible: true,
    required: true,
    helperText: 'Explain what happened and why staff should review it.',
  },
];

export function createPlayerAbuseReportFormModel(
  reportType: PlayerAbuseReportTypeFormSource,
): PlayerAbuseReportFormModel {
  return {
    reportTypeKey: reportType.key,
    label: reportType.label,
    description: reportType.description,
    helperText: reportType.helperText,
    fields: [
      ...BASE_REPORT_FIELDS,
      optionalField(
        'accusedHeroId',
        'Accused hero',
        reportType.requiresAccusedHero,
        'Select the hero this report is about.',
      ),
      optionalField(
        'relatedItemId',
        'Related item',
        reportType.requiresItemSelection,
        'Select an item related to this report.',
      ),
      optionalField(
        'relatedTradeId',
        'Related trade',
        reportType.requiresTradeSelection,
        'Select a trade related to this report.',
      ),
    ],
  };
}

export function visibleAbuseReportFormFields(
  model: PlayerAbuseReportFormModel,
): readonly PlayerAbuseReportFormField[] {
  return model.fields.filter((field) => field.visible);
}

export function requiredAbuseReportFormFieldKeys(
  model: PlayerAbuseReportFormModel,
): readonly PlayerAbuseReportFormFieldKey[] {
  return model.fields.filter((field) => field.required).map((field) => field.key);
}

function optionalField(
  key: PlayerAbuseReportFormFieldKey,
  label: string,
  enabled: boolean,
  helperText: string,
): PlayerAbuseReportFormField {
  return {
    key,
    label,
    visible: enabled,
    required: enabled,
    helperText,
  };
}
