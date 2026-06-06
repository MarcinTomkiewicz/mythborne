import { Json } from '../types/database.types';

export function optionalText(value: Json | undefined): string | null {
  return typeof value === 'string' ? value : null;
}

export function requiredText(value: Json | undefined, field: string): string {
  const textValue = optionalText(value);

  if (!textValue) {
    throw new Error(`${field} must be a non-empty string.`);
  }

  return textValue;
}

export function optionalNullableText(value: Json | undefined, field: string): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  const textValue = optionalText(value);

  if (textValue === null) {
    throw new Error(`${field} must be a string or null.`);
  }

  return textValue;
}

export function requiredNullableText(value: Json | undefined, field: string): string | null {
  if (value === undefined) {
    throw new Error(`${field} must be present.`);
  }

  return optionalNullableText(value, field);
}

export function optionalNumber(value: Json | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function requiredNumber(value: Json | undefined, field: string): number {
  const number = optionalNumber(value);

  if (number === null) {
    throw new Error(`${field} must be a number.`);
  }

  return number;
}

export function optionalNullableNumber(value: Json | undefined, field: string): number | null {
  if (value === undefined || value === null) {
    return null;
  }

  const number = optionalNumber(value);

  if (number === null) {
    throw new Error(`${field} must be a number or null.`);
  }

  return number;
}

export function requiredNullableNumber(value: Json | undefined, field: string): number | null {
  if (value === undefined) {
    throw new Error(`${field} must be present.`);
  }

  return optionalNullableNumber(value, field);
}

export function optionalBoolean(value: Json | undefined): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

export function requiredBoolean(value: Json | undefined, field: string): boolean {
  const booleanValue = optionalBoolean(value);

  if (booleanValue === null) {
    throw new Error(`${field} must be a boolean.`);
  }

  return booleanValue;
}

export function optionalNullableBoolean(value: Json | undefined, field: string): boolean | null {
  if (value === undefined || value === null) {
    return null;
  }

  const boolean = optionalBoolean(value);

  if (boolean === null) {
    throw new Error(`${field} must be a boolean or null.`);
  }

  return boolean;
}

export function requiredNullableBoolean(value: Json | undefined, field: string): boolean | null {
  if (value === undefined) {
    throw new Error(`${field} must be present.`);
  }

  return optionalNullableBoolean(value, field);
}

export function requiredInteger(value: Json | undefined, field: string): number {
  const number = optionalNumber(value);

  if (number === null || !Number.isInteger(number)) {
    throw new Error(`${field} must be an integer.`);
  }

  return number;
}

export function requiredNonNegativeInteger(value: Json | undefined, field: string): number {
  const number = requiredInteger(value, field);

  if (number < 0) {
    throw new Error(`${field} must be a non-negative integer.`);
  }

  return number;
}

export function optionalNonNegativeInteger(value: Json | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  return requiredNonNegativeInteger(value, 'optional non-negative integer');
}

export function optionalStringOrNumber(value: Json | undefined, field: string): string | number | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }

  throw new Error(`${field} must be a string, number, or null.`);
}

export function requireLiteral<T extends string>(value: string, expected: T, field: string): T {
  if (value !== expected) {
    throw new Error(`${field} must be ${expected}.`);
  }

  return expected;
}
