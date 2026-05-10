import { ExplorationDefinitionsState } from '../exploration-shared/exploration-definitions.state';

export function luckLabBucketLabel(
  definitions: ExplorationDefinitionsState,
  bucketProfileId: string | null,
): string {
  if (!bucketProfileId) {
    return 'DB default';
  }

  const profile = definitions
    .itemBucketProfiles()
    .find((entry) => entry.id === bucketProfileId || entry.key === bucketProfileId);

  return profile ? `${profile.name} (${profile.key})` : 'Referenced bucket not loaded';
}

export function luckLabQualityLabel(
  definitions: ExplorationDefinitionsState,
  maxQualityKey: string | null,
): string {
  if (!maxQualityKey) {
    return 'DB default';
  }

  const quality = definitions
    .itemQualities()
    .find((entry) => entry.key === maxQualityKey);

  return quality ? `${quality.label} (${quality.key})` : 'Referenced quality not loaded';
}
