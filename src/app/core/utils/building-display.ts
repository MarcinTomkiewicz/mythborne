import {
  BuildingResourceType,
} from '../domain/building/building.model';
import { BonusType } from '../types/bonus.types';
import { formatBonusValue } from './bonus';

export function toBuildingBonusLabel(target: string): string {
  return target
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (value) => value.toUpperCase());
}

export function toBuildingBonusValue(value: number, type: BonusType): string {
  return formatBonusValue(value, type, { includePlus: false });
}

export function toBuildingDurationLabel(minutes: number | null): string {
  if (minutes === null) {
    return 'Unavailable';
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${remainingMinutes} min`;
}

export function toResourceLabel(type: BuildingResourceType): string {
  if (type === 'materials') {
    return 'Materials';
  }

  if (type === 'workforce') {
    return 'Workforce';
  }

  return 'Drachma';
}

export function resourceOrder(type: BuildingResourceType): number {
  if (type === 'drachma') {
    return 0;
  }

  if (type === 'materials') {
    return 1;
  }

  return 2;
}
