export interface LevelMatchLabelInput {
  levelMatchKind: string;
  levelValue: number | null;
  maxLevelValue: number | null;
  levelInterval: number | null;
}

export const LEVEL_MATCH_KIND = {
  any: 'any',
  exact: 'exact',
  minimum: 'minimum',
  range: 'range',
  interval: 'interval',
} as const;

export function levelMatchLabel(input: LevelMatchLabelInput): string {
  switch (input.levelMatchKind) {
    case LEVEL_MATCH_KIND.any:
      return 'Any reached level';
    case LEVEL_MATCH_KIND.exact:
      return `Reached level ${input.levelValue ?? 'not configured'}`;
    case LEVEL_MATCH_KIND.minimum:
      return `Reached level ${input.levelValue ?? 'not configured'}+`;
    case LEVEL_MATCH_KIND.range:
      return `Reached levels ${input.levelValue ?? 'not configured'}..${input.maxLevelValue ?? 'not configured'}`;
    case LEVEL_MATCH_KIND.interval:
      return `Every ${input.levelInterval ?? 'not configured'} levels from ${input.levelValue ?? 'not configured'}`;
    default:
      return `${input.levelMatchKind} level match`;
  }
}
