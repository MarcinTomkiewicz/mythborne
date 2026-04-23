import { FilterOperator } from '../enums/filter-operators';
import { FilterDefinition } from '../interfaces/i-filter';
import { toSnakeKey } from './type-mappings';

export function applyFilters(
  query: any,
  filters?: Record<string, FilterDefinition>
): any {
  if (!filters) {
    return query;
  }

  for (const [key, definition] of Object.entries(filters)) {
    const normalizedFilters = Array.isArray(definition) ? definition : [definition];

    for (const filter of normalizedFilters) {
      if (filter.value === undefined) {
        continue;
      }

      const column = toSnakeKey(key);

      switch (filter.operator || FilterOperator.EQ) {
        case FilterOperator.EQ:
          query = query.eq(column, filter.value);
          break;
        case FilterOperator.GTE:
          query = query.gte(column, filter.value);
          break;
        case FilterOperator.LTE:
          query = query.lte(column, filter.value);
          break;
        case FilterOperator.GT:
          query = query.gt(column, filter.value);
          break;
        case FilterOperator.LT:
          query = query.lt(column, filter.value);
          break;
        case FilterOperator.LIKE:
          query = query.like(column, filter.value);
          break;
        case FilterOperator.IN:
          query = query.in(column, filter.value);
          break;
        case FilterOperator.IS:
          query = query.is(column, filter.value);
          break;
        case FilterOperator.NE:
          query = query.neq(column, filter.value);
          break;
        default:
          throw new Error(`Unsupported filter operator: ${filter.operator}`);
      }
    }
  }

  return query;
}
