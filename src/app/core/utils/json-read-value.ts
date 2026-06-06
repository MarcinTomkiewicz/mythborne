import { Json } from '../types/database.types';

export function text(value: Json | undefined): string {
  return typeof value === 'string' ? value : '';
}

export function numberValue(value: Json | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export function booleanValue(value: Json | undefined): boolean {
  return typeof value === 'boolean' ? value : false;
}

export function jsonValue(value: Json | undefined): Json {
  return value === undefined ? {} : value;
}

export function optionalJson(value: Json | undefined): Json | null {
  return value === undefined ? null : value;
}
