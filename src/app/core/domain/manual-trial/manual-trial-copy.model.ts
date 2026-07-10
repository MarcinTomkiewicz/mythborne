export interface ManualTrialCopy {
  noActive: ManualTrialNoActiveCopy;
  offer: ManualTrialOfferCopy;
  manual: ManualTrialManualStateCopy;
  unsupported: ManualTrialUnsupportedCopy;
  exit: ManualTrialExitCopy;
  result: ManualTrialResultCopy;
  report: ManualTrialReportCopy;
  outcomes: Record<string, ManualTrialOutcomeCopy>;
  failureReasons: Record<string, ManualTrialFailureReasonCopy>;
}

export interface ManualTrialNoActiveCopy {
  title: string;
  body: string;
}

export interface ManualTrialOfferCopy {
  eyebrow: string;
  title: string;
  body: string;
  actions: ManualTrialOfferActionsCopy;
}

export interface ManualTrialOfferActionsCopy {
  manualResolve: string;
  autoResolve: string;
}

export interface ManualTrialManualStateCopy {
  loading: string;
  submitting: string;
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

export interface ManualTrialReportCopy {
  actions: ManualTrialReportActionsCopy;
}

export interface ManualTrialReportActionsCopy {
  openReport: string;
  backToExploration: string;
}

export interface ManualTrialOutcomeCopy {
  label: string;
}

export interface ManualTrialFailureReasonCopy {
  label: string;
  helper: string;
}
