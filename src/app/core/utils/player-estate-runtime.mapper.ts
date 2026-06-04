import { EstateRuntimeState } from '../domain/estate/player-estate-page-context.model';
import { Json } from '../types/database.types';
import { assignBoolean, assignNumber, assignText } from './json-assign';
import {
  JsonRecord,
  optionalBoolean,
  optionalNumber,
  optionalText,
  read,
  requiredArray,
  requiredRecord,
  requiredText,
} from './json-read';
import { mapBuilding, mapBuildingGroup } from './player-estate-building.mapper';
import { mapJob, mapOptionalJob } from './player-estate-job.mapper';
import { mapResource } from './player-estate-resource.mapper';

export function mapNullableEstateRuntimeState(
  value: Json | undefined,
): EstateRuntimeState | null {
  if (value === null) {
    return null;
  }

  return mapEstateRuntimeState(requiredRecord(value, 'estateRuntimeState'));
}

function mapEstateRuntimeState(runtime: JsonRecord): EstateRuntimeState {
  const row: EstateRuntimeState = {
    hero_id: requiredText(read(runtime, 'hero_id'), 'estateRuntimeState.hero_id'),
    server_id: requiredText(read(runtime, 'server_id'), 'estateRuntimeState.server_id'),
    estate_id: requiredText(read(runtime, 'estate_id'), 'estateRuntimeState.estate_id'),
    district_code: requiredText(
      read(runtime, 'district_code'),
      'estateRuntimeState.district_code',
    ),
    active_job_json: mapOptionalJob(read(runtime, 'active_job_json')),
    recent_jobs_json: requiredArray(
      read(runtime, 'recent_jobs_json'),
      'estateRuntimeState.recent_jobs_json',
    ).map((job, index) => mapJob(job, `estateRuntimeState.recent_jobs_json[${index}]`)),
    resources_json: requiredArray(
      read(runtime, 'resources_json'),
      'estateRuntimeState.resources_json',
    ).map((resource, index) =>
      mapResource(resource, `estateRuntimeState.resources_json[${index}]`),
    ),
    buildings_json: requiredArray(
      read(runtime, 'buildings_json'),
      'estateRuntimeState.buildings_json',
    ).map((building, index) =>
      mapBuilding(building, `estateRuntimeState.buildings_json[${index}]`),
    ),
    building_groups_json: requiredArray(
      read(runtime, 'building_groups_json'),
      'estateRuntimeState.building_groups_json',
    ).map((group, index) =>
      mapBuildingGroup(group, `estateRuntimeState.building_groups_json[${index}]`),
    ),
  };

  assignNumber(row, 'address_number', optionalNumber(read(runtime, 'address_number')));
  assignText(row, 'address', optionalText(read(runtime, 'address')));
  assignNumber(row, 'estate_rank', optionalNumber(read(runtime, 'estate_rank')));
  assignNumber(
    row,
    'settled_completed_count',
    optionalNumber(read(runtime, 'settled_completed_count')),
  );
  assignText(row, 'settled_as_of', optionalText(read(runtime, 'settled_as_of')));
  assignBoolean(
    row,
    'attack_protection_active',
    optionalBoolean(read(runtime, 'attack_protection_active')),
  );
  assignText(
    row,
    'attack_protection_expires_at',
    optionalText(read(runtime, 'attack_protection_expires_at')),
  );
  assignText(
    row,
    'attack_protection_source_entity_type',
    optionalText(read(runtime, 'attack_protection_source_entity_type')),
  );
  assignText(
    row,
    'attack_protection_source_entity_id',
    optionalText(read(runtime, 'attack_protection_source_entity_id')),
  );
  assignBoolean(
    row,
    'siege_protection_active',
    optionalBoolean(read(runtime, 'siege_protection_active')),
  );
  assignText(
    row,
    'siege_protection_expires_at',
    optionalText(read(runtime, 'siege_protection_expires_at')),
  );
  assignText(row, 'siege_protection_source', optionalText(read(runtime, 'siege_protection_source')));

  return row;
}
