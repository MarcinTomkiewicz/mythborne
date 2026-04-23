import { FormulaBalanceSelection } from './item-generation-formula-balance.types';

export interface BalanceSelection extends FormulaBalanceSelection {
  qualityKey?: string;
  profileKey?: string;
}
