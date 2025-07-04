export interface IQueryOptions<T = any> {
  select?: string;
  filters?: Partial<Record<keyof T, any>>;
  range?: { from: number; to: number };
  orderBy?: { column: keyof T; ascending?: boolean };
}
