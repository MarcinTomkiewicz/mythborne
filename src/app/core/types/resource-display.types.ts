import { Row } from './supabase.types';

export type HeroResourceRow = Row<'hero_resources'>;

export interface ResourceDisplayDefinition {
  label: string;
  type: HeroResourceRow['resource_type'];
}

export interface ResourceAmountDisplay extends ResourceDisplayDefinition {
  amount: number;
  perHour: number;
}
