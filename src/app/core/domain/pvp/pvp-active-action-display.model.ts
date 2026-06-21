export interface PvpActiveActionFactRow {
  label: string;
  value: string;
}

export interface PvpActiveActionFactCandidate {
  label: string;
  value: string | null;
}

export interface PvpActiveActionTiming {
  startedAt: string | null;
  resolvesAt: string | null;
}
