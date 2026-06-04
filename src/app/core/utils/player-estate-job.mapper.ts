import { EstateBuildingJob } from '../domain/estate/player-estate-page-context.model';
import { Json } from '../types/database.types';
import { assignBoolean, assignNumber, assignText } from './json-assign';
import {
  JsonRecord,
  optionalBoolean,
  optionalNumber,
  optionalText,
  read,
  requiredNumber,
  requiredRecord,
  requiredText,
} from './json-read';

export function mapOptionalJob(value: Json | undefined): EstateBuildingJob | null {
  if (value === undefined || value === null) {
    return null;
  }

  return mapJob(
    requiredRecord(value, 'estateRuntimeState.active_job_json'),
    'estateRuntimeState.active_job_json',
  );
}

export function mapJob(job: JsonRecord, field: string): EstateBuildingJob {
  const row: EstateBuildingJob = {
    jobId: requiredText(read(job, 'jobId'), `${field}.jobId`),
    estateId: requiredText(read(job, 'estateId'), `${field}.estateId`),
    buildingId: requiredText(read(job, 'buildingId'), `${field}.buildingId`),
    targetLevel: requiredNumber(read(job, 'targetLevel'), `${field}.targetLevel`),
    status: requiredText(read(job, 'status'), `${field}.status`),
  };

  assignText(row, 'buildingKey', optionalText(read(job, 'buildingKey')));
  assignText(row, 'buildingName', optionalText(read(job, 'buildingName')));
  assignText(row, 'startedAt', optionalText(read(job, 'startedAt')));
  assignText(row, 'completesAt', optionalText(read(job, 'completesAt')));
  assignText(row, 'createdAt', optionalText(read(job, 'createdAt')));
  assignText(row, 'updatedAt', optionalText(read(job, 'updatedAt')));
  assignNumber(
    row,
    'secondsUntilCompletion',
    optionalNumber(read(job, 'secondsUntilCompletion')),
  );
  assignBoolean(row, 'isDue', optionalBoolean(read(job, 'isDue')));

  return row;
}
