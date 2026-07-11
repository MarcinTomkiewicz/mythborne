export interface ManualTrialCopy {
  noActive: ManualTrialNoActiveCopy;
  manual: ManualTrialManualStateCopy;
  unsupported: ManualTrialUnsupportedCopy;
  exit: ManualTrialExitCopy;
  result: ManualTrialResultCopy;
  trials: Record<string, ManualTrialLabelCopy>;
  failureReasons: Record<string, ManualTrialFailureReasonCopy>;
}

export interface ManualTrialNoActiveCopy {
  title: string;
  body: string;
}

export interface ManualTrialManualStateCopy {
  loading: string;
  resolving: string;
}

export interface ManualTrialUnsupportedCopy {
  title: string;
  body: string;
  actions: ManualTrialUnsupportedActionsCopy;
}

export interface ManualTrialUnsupportedActionsCopy {
  autoResolve: string;
}

export interface ManualTrialExitCopy {
  title: string;
  body: string;
  actions: ManualTrialExitActionsCopy;
}

export interface ManualTrialExitActionsCopy {
  confirm: string;
  cancel: string;
}

export interface ManualTrialResultCopy {
  title: string;
}

export interface ManualTrialLabelCopy {
  label: string;
}

export interface ManualTrialFailureReasonCopy {
  label: string;
  helper: string;
}
