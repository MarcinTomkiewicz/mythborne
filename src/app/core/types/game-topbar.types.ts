import { Row } from './supabase.types';

export type HeroResourceRow = Row<'hero_resources'>;

export interface GameTopbarResourceDefinition {
  label: string;
  type: HeroResourceRow['resource_type'];
}

export interface GameTopbarResourceDisplay extends GameTopbarResourceDefinition {
  amount: number;
  perHour: number;
}
