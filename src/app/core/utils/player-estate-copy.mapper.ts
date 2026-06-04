import { EstateCopyJson } from '../domain/estate/player-estate-page-context.model';
import { Json } from '../types/database.types';
import {
  optionalText,
  read,
  readPath,
  requiredRecord,
  requiredText,
} from './json-read';
import { assignText } from './json-assign';

export function mapEstateCopyJson(value: Json | undefined): EstateCopyJson {
  const copyJson = requiredRecord(value, 'copyJson');
  const mapped: EstateCopyJson = {
    sections: {
      overview: requiredText(
        readPath(copyJson, 'sections', 'overview'),
        'copyJson.sections.overview',
      ),
      buildings: requiredText(
        readPath(copyJson, 'sections', 'buildings'),
        'copyJson.sections.buildings',
      ),
      resources: requiredText(
        readPath(copyJson, 'sections', 'resources'),
        'copyJson.sections.resources',
      ),
    },
    summary: {
      district: requiredText(
        readPath(copyJson, 'summary', 'district'),
        'copyJson.summary.district',
      ),
      activeJob: requiredText(
        readPath(copyJson, 'summary', 'activeJob'),
        'copyJson.summary.activeJob',
      ),
      vicinity: requiredText(
        readPath(copyJson, 'summary', 'vicinity'),
        'copyJson.summary.vicinity',
      ),
    },
    actions: {
      upgrade: requiredText(
        readPath(copyJson, 'actions', 'upgrade'),
        'copyJson.actions.upgrade',
      ),
      details: requiredText(
        readPath(copyJson, 'actions', 'details'),
        'copyJson.actions.details',
      ),
      openVicinityEstateList: requiredText(
        readPath(copyJson, 'actions', 'openVicinityEstateList'),
        'copyJson.actions.openVicinityEstateList',
      ),
      openVicinityEstateListAriaLabel: requiredText(
        readPath(copyJson, 'actions', 'openVicinityEstateListAriaLabel'),
        'copyJson.actions.openVicinityEstateListAriaLabel',
      ),
    },
    empty: {
      buildings: requiredText(
        readPath(copyJson, 'empty', 'buildings'),
        'copyJson.empty.buildings',
      ),
      bonuses: requiredText(
        readPath(copyJson, 'empty', 'bonuses'),
        'copyJson.empty.bonuses',
      ),
      activeJob: requiredText(
        readPath(copyJson, 'empty', 'activeJob'),
        'copyJson.empty.activeJob',
      ),
    },
    labels: {
      currentLevel: requiredText(
        readPath(copyJson, 'labels', 'currentLevel'),
        'copyJson.labels.currentLevel',
      ),
      nextLevel: requiredText(
        readPath(copyJson, 'labels', 'nextLevel'),
        'copyJson.labels.nextLevel',
      ),
      buildTime: requiredText(
        readPath(copyJson, 'labels', 'buildTime'),
        'copyJson.labels.buildTime',
      ),
    },
  };

  assignText(mapped.sections, 'requirements', optionalText(readPath(copyJson, 'sections', 'requirements')));
  assignText(mapped.sections, 'upgradePreview', optionalText(readPath(copyJson, 'sections', 'upgradePreview')));
  assignText(mapped.sections, 'bonuses', optionalText(readPath(copyJson, 'sections', 'bonuses')));
  assignText(mapped.summary, 'address', optionalText(readPath(copyJson, 'summary', 'address')));
  assignText(mapped.summary, 'rank', optionalText(readPath(copyJson, 'summary', 'rank')));
  assignText(mapped.summary, 'buildingsReady', optionalText(readPath(copyJson, 'summary', 'buildingsReady')));
  assignText(mapped.empty, 'requirements', optionalText(readPath(copyJson, 'empty', 'requirements')));
  assignText(mapped.labels, 'maxLevel', optionalText(readPath(copyJson, 'labels', 'maxLevel')));
  assignText(
    mapped.labels,
    'availableInDistrict',
    optionalText(readPath(copyJson, 'labels', 'availableInDistrict')),
  );
  assignTopSummary(mapped, read(copyJson, 'topSummary'));

  return mapped;
}

function assignTopSummary(target: EstateCopyJson, value: Json | undefined): void {
  if (value === undefined || value === null) {
    return;
  }

  const topSummary = requiredRecord(value, 'copyJson.topSummary');
  const mapped: NonNullable<EstateCopyJson['topSummary']> = {};

  assignText(mapped, 'vicinityLabel', optionalText(read(topSummary, 'vicinityLabel')));
  assignText(mapped, 'vicinityActionLabel', optionalText(read(topSummary, 'vicinityActionLabel')));
  assignText(mapped, 'activeJobEmptyLabel', optionalText(read(topSummary, 'activeJobEmptyLabel')));

  target.topSummary = mapped;
}
