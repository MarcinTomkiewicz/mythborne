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

export function toBuildingDurationLabel(seconds: number | null): string {
  if (seconds === null) {
    return 'Unavailable';
  }

  if (seconds < 60) {
    return `${seconds} sec`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    return remainingSeconds === 0 ? `${minutes} min` : `${minutes} min ${remainingSeconds} sec`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes === 0 ? `${hours} h` : `${hours} h ${remainingMinutes} min`;
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
