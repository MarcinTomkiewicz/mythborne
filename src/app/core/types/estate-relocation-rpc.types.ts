import { Database } from './database.types';

type RelocateHeroEstateFunction =
  Database['public']['Functions']['relocate_hero_estate_to_empty_address'];

export type RelocateHeroEstateRpcArgs = RelocateHeroEstateFunction['Args'];
export type RelocateHeroEstateRpcRow = RelocateHeroEstateFunction['Returns'][number];
