import { Database } from './database.types';

export type GetHeroExperienceToNextLevelRpcArgs =
  Database['public']['Functions']['get_hero_experience_to_next_level']['Args'];

export type GetHeroExperienceToNextLevelRpcResult =
  Database['public']['Functions']['get_hero_experience_to_next_level']['Returns'];

export type GrantHeroExperienceRpcArgs =
  Database['public']['Functions']['grant_hero_experience']['Args'];

export type GrantHeroExperienceRpcRow =
  Database['public']['Functions']['grant_hero_experience']['Returns'][number];
