import { AccountEntrySummaryRowConfig } from '../account-entry-summary-row.interface';

export type CreateCharacterOriginCreationSummaryRowKey =
  | 'server'
  | 'heroName'
  | 'origin'
  | 'characterPoints'
  | 'estate';

export type CreateCharacterOriginSelectedSummaryRowKey =
  | 'origin'
  | 'bonuses';

export type CreateCharacterOriginCreationSummaryRowConfig =
  AccountEntrySummaryRowConfig<CreateCharacterOriginCreationSummaryRowKey>;

export type CreateCharacterOriginSelectedSummaryRowConfig =
  AccountEntrySummaryRowConfig<CreateCharacterOriginSelectedSummaryRowKey>;
