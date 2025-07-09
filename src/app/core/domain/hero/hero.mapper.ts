import { Row } from '../../types/supabase.types';
import { IHero } from './hero.model';

export type HeroRow = Row<'hero'>;

export function mapHero(row: HeroRow): IHero {
  return {
    id: row.id,
    name: row.name,
    level: row.level ?? 1,
    rank: row.rank ?? 1,
    experience: row.experience ?? 0,
    originId: row.origin_id,
    estateId: row.estate_id,
    profilePicture: row.profile_picture,
    createdAt: row.created_at,
  };
}
