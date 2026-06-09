export type PlayerTopbarHeroVitalKey = 'health' | 'level' | 'experience';
export type PlayerTopbarResourceKey = 'drachma' | 'materials' | 'workforce';

export interface PlayerTopbarDisplay {
  heroVitals: PlayerTopbarHeroVitalDisplay[];
  resources: PlayerTopbarResourceDisplay[];
}

export interface PlayerTopbarDisplayItem {
  label: string;
  ariaLabel: string;
  iconKey: string;
  sortOrder: number;
}

export interface PlayerTopbarHeroVitalDisplay extends PlayerTopbarDisplayItem {
  key: PlayerTopbarHeroVitalKey;
  progressKind: string | null;
}

export interface PlayerTopbarResourceDisplay extends PlayerTopbarDisplayItem {
  key: PlayerTopbarResourceKey;
  ratePrefix: string | null;
  rateSuffix: string | null;
}
