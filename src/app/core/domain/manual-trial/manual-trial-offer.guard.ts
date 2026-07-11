import type {
  ManualRuntimeManifest,
  ManualTrialBackendVerdict,
  TrialOffer,
} from './manual-trial-core.model';

export function manualTrialManifestMatchesOffer(
  manifest: ManualRuntimeManifest,
  offer: TrialOffer,
): boolean {
  return manifest.attemptId === offer.attemptId
    && manifest.serverId === offer.serverId
    && manifest.heroId === offer.heroId
    && manifest.trialDefinitionId === offer.trialDefinitionId
    && manifest.minigameKey === offer.minigameKey
    && (
      !offer.existingManualSessionId
      || manifest.manualSessionId === offer.existingManualSessionId
    )
    && (
      !offer.existingManifestId
      || manifest.manifestId === offer.existingManifestId
    );
}

export function manualTrialVerdictMatchesOffer(
  verdict: ManualTrialBackendVerdict,
  offer: TrialOffer,
): boolean {
  return verdict.attemptId === offer.attemptId
    && verdict.serverId === offer.serverId
    && verdict.heroId === offer.heroId
    && verdict.trialDefinitionId === offer.trialDefinitionId
    && verdict.minigameKey === offer.minigameKey
    && (
      !offer.existingVerdictId
      || verdict.verdictId === offer.existingVerdictId
    )
    && (
      !offer.existingManualSessionId
      || verdict.manualSessionId === offer.existingManualSessionId
    );
}
