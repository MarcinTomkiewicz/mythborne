import { HeroRow } from '../../types/domain-row.types';
import { IHero } from './hero.model';

export function mapHero(row: HeroRow): IHero {
  return {
    id: row.id,
    userId: row.user_id,
    serverId: row.server_id,
    name: row.name,
    level: row.level ?? 1,
    rank: row.rank ?? 1,
    experience: row.experience ?? 0,
    totalExperienceEarned: row.total_experience_earned ?? 0,
    characterPoints: row.character_points,
    totalCharacterPointsEarned: row.total_character_points_earned,
    originId: row.origin_id,
    estateId: row.estate_id,
    profilePicture: row.profile_picture,
    createdAt: row.created_at,
  };
}
