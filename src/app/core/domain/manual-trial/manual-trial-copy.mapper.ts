import { MANUAL_TRIAL_COPY_KIND } from '../../constants/manual-trial.const';
import type { GetPlayerManualTrialCopyRpcResult } from '../../types/game-copy-rpc.types';
import {
  JsonRecord,
  read,
  requiredRecord,
  requiredText,
} from '../../utils/json-read';
import type {
  ManualTrialCopy,
  ManualTrialFailureReasonCopy,
  ManualTrialOutcomeCopy,
} from './manual-trial-copy.model';

export function mapManualTrialCopy(
  value: GetPlayerManualTrialCopyRpcResult,
): ManualTrialCopy {
  const root = requiredRecord(value, MANUAL_TRIAL_COPY_KIND);
  const noActive = requiredRecord(
    read(root, 'noActive'),
    `${MANUAL_TRIAL_COPY_KIND}.noActive`,
  );
  const offer = requiredRecord(
    read(root, 'offer'),
    `${MANUAL_TRIAL_COPY_KIND}.offer`,
  );
  const offerActions = requiredRecord(
    read(offer, 'actions'),
    `${MANUAL_TRIAL_COPY_KIND}.offer.actions`,
  );
  const manual = requiredRecord(
    read(root, 'manual'),
    `${MANUAL_TRIAL_COPY_KIND}.manual`,
  );
  const unsupported = requiredRecord(
    read(root, 'unsupported'),
    `${MANUAL_TRIAL_COPY_KIND}.unsupported`,
  );
  const unsupportedActions = requiredRecord(
    read(unsupported, 'actions'),
    `${MANUAL_TRIAL_COPY_KIND}.unsupported.actions`,
  );
  const exit = requiredRecord(
    read(root, 'exit'),
    `${MANUAL_TRIAL_COPY_KIND}.exit`,
  );
  const exitActions = requiredRecord(
    read(exit, 'actions'),
    `${MANUAL_TRIAL_COPY_KIND}.exit.actions`,
  );
  const result = requiredRecord(
    read(root, 'result'),
    `${MANUAL_TRIAL_COPY_KIND}.result`,
  );
  const report = requiredRecord(
    read(root, 'report'),
    `${MANUAL_TRIAL_COPY_KIND}.report`,
  );
  const reportActions = requiredRecord(
    read(report, 'actions'),
    `${MANUAL_TRIAL_COPY_KIND}.report.actions`,
  );

  return {
    noActive: {
      title: requiredText(
        read(noActive, 'title'),
        `${MANUAL_TRIAL_COPY_KIND}.noActive.title`,
      ),
      body: requiredText(
        read(noActive, 'body'),
        `${MANUAL_TRIAL_COPY_KIND}.noActive.body`,
      ),
    },
    offer: {
      eyebrow: requiredText(
        read(offer, 'eyebrow'),
        `${MANUAL_TRIAL_COPY_KIND}.offer.eyebrow`,
      ),
      title: requiredText(
        read(offer, 'title'),
        `${MANUAL_TRIAL_COPY_KIND}.offer.title`,
      ),
      body: requiredText(
        read(offer, 'body'),
        `${MANUAL_TRIAL_COPY_KIND}.offer.body`,
      ),
      actions: {
        manualResolve: requiredText(
          read(offerActions, 'manualResolve'),
          `${MANUAL_TRIAL_COPY_KIND}.offer.actions.manualResolve`,
        ),
        autoResolve: requiredText(
          read(offerActions, 'autoResolve'),
          `${MANUAL_TRIAL_COPY_KIND}.offer.actions.autoResolve`,
        ),
      },
    },
    manual: {
      loading: requiredText(
        read(manual, 'loading'),
        `${MANUAL_TRIAL_COPY_KIND}.manual.loading`,
      ),
      submitting: requiredText(
        read(manual, 'submitting'),
        `${MANUAL_TRIAL_COPY_KIND}.manual.submitting`,
      ),
      resolving: requiredText(
        read(manual, 'resolving'),
        `${MANUAL_TRIAL_COPY_KIND}.manual.resolving`,
      ),
    },
    unsupported: {
      title: requiredText(
        read(unsupported, 'title'),
        `${MANUAL_TRIAL_COPY_KIND}.unsupported.title`,
      ),
      body: requiredText(
        read(unsupported, 'body'),
        `${MANUAL_TRIAL_COPY_KIND}.unsupported.body`,
      ),
      actions: {
        autoResolve: requiredText(
          read(unsupportedActions, 'autoResolve'),
          `${MANUAL_TRIAL_COPY_KIND}.unsupported.actions.autoResolve`,
        ),
      },
    },
    exit: {
      title: requiredText(
        read(exit, 'title'),
        `${MANUAL_TRIAL_COPY_KIND}.exit.title`,
      ),
      body: requiredText(
        read(exit, 'body'),
        `${MANUAL_TRIAL_COPY_KIND}.exit.body`,
      ),
      actions: {
        confirm: requiredText(
          read(exitActions, 'confirm'),
          `${MANUAL_TRIAL_COPY_KIND}.exit.actions.confirm`,
        ),
        cancel: requiredText(
          read(exitActions, 'cancel'),
          `${MANUAL_TRIAL_COPY_KIND}.exit.actions.cancel`,
        ),
      },
    },
    result: {
      title: requiredText(
        read(result, 'title'),
        `${MANUAL_TRIAL_COPY_KIND}.result.title`,
      ),
    },
    report: {
      actions: {
        openReport: requiredText(
          read(reportActions, 'openReport'),
          `${MANUAL_TRIAL_COPY_KIND}.report.actions.openReport`,
        ),
        backToExploration: requiredText(
          read(reportActions, 'backToExploration'),
          `${MANUAL_TRIAL_COPY_KIND}.report.actions.backToExploration`,
        ),
      },
    },
    outcomes: mapManualTrialOutcomeCopyDictionary(
      requiredRecord(
        read(root, 'outcomes'),
        `${MANUAL_TRIAL_COPY_KIND}.outcomes`,
      ),
    ),
    failureReasons: mapManualTrialFailureReasonCopyDictionary(
      requiredRecord(
        read(root, 'failureReasons'),
        `${MANUAL_TRIAL_COPY_KIND}.failureReasons`,
      ),
    ),
  };
}

export function mapManualTrialOutcomeCopyDictionary(
  outcomes: JsonRecord,
): Record<string, ManualTrialOutcomeCopy> {
  return Object.fromEntries(
    Object.entries(outcomes).map(([key, value]) => {
      const field = `${MANUAL_TRIAL_COPY_KIND}.outcomes.${key}`;
      const outcome = requiredRecord(value, field);

      return [
        key,
        {
          label: requiredText(read(outcome, 'label'), `${field}.label`),
        },
      ];
    }),
  );
}

export function mapManualTrialFailureReasonCopyDictionary(
  failureReasons: JsonRecord,
): Record<string, ManualTrialFailureReasonCopy> {
  return Object.fromEntries(
    Object.entries(failureReasons).map(([key, value]) => {
      const field = `${MANUAL_TRIAL_COPY_KIND}.failureReasons.${key}`;
      const failureReason = requiredRecord(value, field);

      return [
        key,
        {
          label: requiredText(read(failureReason, 'label'), `${field}.label`),
          helper: requiredText(read(failureReason, 'helper'), `${field}.helper`),
        },
      ];
    }),
  );
}
