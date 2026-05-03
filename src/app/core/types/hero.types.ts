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
