export interface IHero {
  id: string;
  userId: string;
  serverId: string;
  name: string;
  level: number;
  rank: number;
  experience: number;
  totalExperienceEarned: number;
  characterPoints: number;
  totalCharacterPointsEarned: number;
  originId: string | null;
  estateId: string | null;
  profilePicture: string | null;
  createdAt: string | null;
}

export interface HeroExperienceProgress {
  level: number;
  currentExperience: number;
  totalExperienceEarned: number;
  experienceToNextLevel: number;
  remainingExperience: number;
  experiencePercent: number;
}

export interface GrantHeroExperienceInput {
  experienceAmount: number;
  sourceKind: string;
  sourceId: string;
  reason: string;
  requestId?: string | null;
  metadataJson?: unknown;
}

export interface GrantHeroExperienceResult {
  progressionLedgerId: string;
  heroId: string;
  serverId: string;
  experienceGained: number;
  levelBefore: number;
  levelAfter: number;
  experienceBefore: number;
  experienceAfter: number;
  totalExperienceEarnedBefore: number;
  totalExperienceEarnedAfter: number;
  levelsGained: number;
  reachedLevels: number[];
  characterPointsGrossGained: number;
  characterPointsBalanceAfter: number;
}

export interface IHeroDerived extends Record<string, number> {
  def: number;
  minDmg: number;
  maxDmg: number;
  luck: number;
  critical: number;
  criticalDamage: number;
  evasion: number;
  health: number;
}
