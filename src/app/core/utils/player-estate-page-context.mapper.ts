import {
  PlayerEstateHeroRow,
  PlayerEstatePageContext,
} from '../domain/estate/player-estate-page-context.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  optionalNumber,
  optionalText,
  read,
  requiredNumber,
  requiredRecord,
  requiredText,
} from './json-read';
import { mapEstateCopyJson } from './player-estate-copy.mapper';
import { mapNullableEstateRuntimeState } from './player-estate-runtime.mapper';

const PLAYER_ESTATE_CONTRACT_VERSION = 'player_estate_page_context_v3';

export function mapPlayerEstatePageContext(
  value: Json,
): PlayerEstatePageContext {
  const root = requiredRecord(value, 'get_player_estate_page_context');
  const contractVersion = requiredText(
    read(root, 'contractVersion'),
    'get_player_estate_page_context.contractVersion',
  );

  if (contractVersion !== PLAYER_ESTATE_CONTRACT_VERSION) {
    throw new Error(
      `get_player_estate_page_context.contractVersion must be ${PLAYER_ESTATE_CONTRACT_VERSION}.`,
    );
  }

  return {
    contractVersion,
    hero: mapHero(requiredRecord(read(root, 'hero'), 'hero')),
    copyJson: mapEstateCopyJson(read(root, 'copyJson')),
    estateRuntimeState: mapNullableEstateRuntimeState(read(root, 'estateRuntimeState')),
  };
}

function mapHero(hero: JsonRecord): PlayerEstateHeroRow {
  return {
    id: requiredText(read(hero, 'id'), 'hero.id'),
    name: requiredText(read(hero, 'name'), 'hero.name'),
    level: optionalNumber(read(hero, 'level')),
    origin_id: optionalText(read(hero, 'origin_id')),
    rank: optionalNumber(read(hero, 'rank')),
    experience: optionalNumber(read(hero, 'experience')),
    profile_picture: optionalText(read(hero, 'profile_picture')),
    created_at: optionalText(read(hero, 'created_at')),
    estate_id: optionalText(read(hero, 'estate_id')),
    user_id: requiredText(read(hero, 'user_id'), 'hero.user_id'),
    server_id: requiredText(read(hero, 'server_id'), 'hero.server_id'),
    character_points: requiredNumber(
      read(hero, 'character_points'),
      'hero.character_points',
    ),
    total_character_points_earned: requiredNumber(
      read(hero, 'total_character_points_earned'),
      'hero.total_character_points_earned',
    ),
    total_experience_earned: requiredNumber(
      read(hero, 'total_experience_earned'),
      'hero.total_experience_earned',
    ),
  };
}
