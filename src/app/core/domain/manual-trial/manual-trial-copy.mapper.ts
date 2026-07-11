import { MANUAL_TRIAL_COPY_KIND } from '../../constants/manual-trial.const';
import type { GetPlayerManualTrialCopyRpcResult } from '../../types/game-copy-rpc.types';
import {
  type JsonRecord,
  requiredRecord,
  requiredRecordField,
  requiredTextFields,
} from '../../utils/json-read';
import type {
  ManualTrialCopy,
  ManualTrialFailureReasonCopy,
  ManualTrialLabelCopy,
} from './manual-trial-copy.model';

export function mapManualTrialCopy(
  value: GetPlayerManualTrialCopyRpcResult,
): ManualTrialCopy {
  const root = requiredRecord(value, MANUAL_TRIAL_COPY_KIND);
  const section = (key: string) =>
    requiredRecordField(root, key, MANUAL_TRIAL_COPY_KIND);
  const noActive = section('noActive');
  const manual = section('manual');
  const unsupported = section('unsupported');
  const exit = section('exit');
  const result = section('result');

  return {
    noActive: requiredTextFields(
      noActive,
      `${MANUAL_TRIAL_COPY_KIND}.noActive`,
      ['title', 'body'],
    ),
    manual: requiredTextFields(
      manual,
      `${MANUAL_TRIAL_COPY_KIND}.manual`,
      ['loading', 'resolving'],
    ),
    unsupported: {
      ...requiredTextFields(
        unsupported,
        `${MANUAL_TRIAL_COPY_KIND}.unsupported`,
        ['title', 'body'],
      ),
      actions: requiredTextFields(
        requiredRecordField(
          unsupported,
          'actions',
          `${MANUAL_TRIAL_COPY_KIND}.unsupported`,
        ),
        `${MANUAL_TRIAL_COPY_KIND}.unsupported.actions`,
        ['autoResolve'],
      ),
    },
    exit: {
      ...requiredTextFields(
        exit,
        `${MANUAL_TRIAL_COPY_KIND}.exit`,
        ['title', 'body'],
      ),
      actions: requiredTextFields(
        requiredRecordField(exit, 'actions', `${MANUAL_TRIAL_COPY_KIND}.exit`),
        `${MANUAL_TRIAL_COPY_KIND}.exit.actions`,
        ['confirm', 'cancel'],
      ),
    },
    result: requiredTextFields(
      result,
      `${MANUAL_TRIAL_COPY_KIND}.result`,
      ['title'],
    ),
    trials: mapManualTrialLabelCopyDictionary(
      section('trials'),
      `${MANUAL_TRIAL_COPY_KIND}.trials`,
    ),
    failureReasons: mapManualTrialFailureReasons(
      section('failureReasons'),
      `${MANUAL_TRIAL_COPY_KIND}.failureReasons`,
    ),
  };
}

export function mapManualTrialLabelCopyDictionary(
  dictionary: JsonRecord,
  fieldPath: string,
): Record<string, ManualTrialLabelCopy> {
  return Object.fromEntries(
    Object.entries(dictionary).map(([key, value]) => {
      const field = `${fieldPath}.${key}`;

      return [
        key,
        requiredTextFields(requiredRecord(value, field), field, ['label']),
      ];
    }),
  );
}

export function mapManualTrialFailureReasons(
  failureReasons: JsonRecord,
  fieldPath: string,
): Record<string, ManualTrialFailureReasonCopy> {
  return Object.fromEntries(
    Object.entries(failureReasons).map(([key, value]) => {
      const field = `${fieldPath}.${key}`;

      return [
        key,
        requiredTextFields(
          requiredRecord(value, field),
          field,
          ['label', 'helper'],
        ),
      ];
    }),
  );
}
