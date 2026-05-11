import { ExplorationChallengeRewardReadModel } from '../../../core/domain/exploration/exploration-reward.model';
import { jsonRecord, optionalText, read } from '../../../core/utils/json-read';

export interface RewardDiagnosticRow {
  label: string;
  value: string;
}

export interface RewardDiagnosticSource {
  kind: 'challenge_attempt' | 'step';
  explorationId: string;
  challengeAttemptId?: string;
  stepId?: string;
}

export function rewardDiagnosticRows(
  reward: ExplorationChallengeRewardReadModel | null,
): RewardDiagnosticRow[] {
  if (!reward) {
    return [];
  }

  const rows: RewardDiagnosticRow[] = [
    { label: 'Źródło', value: rewardSource(reward) },
    {
      label: 'Grant',
      value: reward.rewardGrant
        ? `${reward.rewardGrant.id} (${reward.rewardGrant.status})`
        : reward.rewardGrantId ?? 'Brak grantu w read modelu.',
    },
    {
      label: 'Reward assignment lookup',
      value: reward.rewardGrant
        ? `Profil ${reward.rewardGrant.rewardProfileId}`
        : 'Brak profilu w read modelu.',
    },
    {
      label: 'Wpisy przetworzone',
      value: `${reward.entries.length} z ${reward.rewardEntryCount ?? 'N/D'}`,
    },
    {
      label: 'Item generation',
      value: `${reward.items.length} z ${reward.generatedItemCount ?? 'N/D'} itemów zmapowanych z read modelu.`,
    },
  ];

  reward.entries.forEach((entry, index) => {
    const metadata = jsonRecord(entry.metadataJson);
    const reasons = [
      optionalText(read(metadata, 'itemGenerationReason', 'item_generation_reason')),
      optionalText(read(metadata, 'skippedReason', 'skipped_reason', 'skipReason', 'skip_reason')),
    ].filter(Boolean);

    if (reasons.length) {
      rows.push({ label: `Wpis ${index + 1}`, value: reasons.join(' ') });
    }
  });

  return rows;
}

export function rewardBackendDiagnosticRows(
  reward: ExplorationChallengeRewardReadModel | null,
  source: RewardDiagnosticSource | null,
  isLoading: boolean,
): RewardDiagnosticRow[] {
  if (!source) {
    return [];
  }

  const rpc = source.kind === 'step'
    ? 'get_exploration_step_reward_read_model'
    : 'get_exploration_challenge_reward_read_model';
  const args = source.kind === 'step'
    ? { p_step_id: source.stepId }
    : { p_challenge_attempt_id: source.challengeAttemptId };

  return [
    { label: 'RPC', value: rpc },
    { label: 'Args', value: JSON.stringify(args) },
    { label: 'Status', value: isLoading ? 'loading' : reward ? 'mapped' : 'null/empty response' },
    { label: 'Backend row shape', value: JSON.stringify(reward?.rawJson ?? null) },
  ];
}

function rewardSource(reward: ExplorationChallengeRewardReadModel): string {
  return [
    reward.rewardSourceKind,
    reward.rewardSourceId,
  ].filter(Boolean).join(' ') || 'N/D';
}
