import { FilterOperator } from '../enums/filter-operators';

export interface IFilter {
  operator: FilterOperator;
  value: unknown;
}

export type FilterDefinition = IFilter | IFilter[];

export interface IFilters {
  [key: string]: FilterDefinition;
}
