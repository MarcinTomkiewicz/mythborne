import { Json } from '../types/database.types';
import { optionalText } from './json-read-primitives';

export function copyTextOrKey(value: Json | undefined, keyPath: string): string {
  const text = optionalText(value);

  return text?.trim() ? text : keyPath;
}
