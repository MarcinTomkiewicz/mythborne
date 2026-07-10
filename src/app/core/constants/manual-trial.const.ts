export const MANUAL_TRIAL_ERROR_CONTEXT = 'manual_trial';

export const MANUAL_TRIAL_ERROR_CODES = {
  contextChanged: 'manual_trial:context_changed',
  scopeMismatch: 'manual_trial:scope_mismatch',
  staleAttempt: 'manual_trial:stale_attempt',
  staleSession: 'manual_trial:stale_session',
  staleVerdict: 'manual_trial:stale_verdict',
} as const;
