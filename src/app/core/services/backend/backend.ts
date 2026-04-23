import { inject, Injectable } from '@angular/core';
import { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';
import { from, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { FilterOperator } from '../../enums/filter-operators';
import { FilterDefinition, IFilter } from '../../interfaces/i-filter';
import { applyFilters } from '../../utils/query';
import { toCamelCase, toSnakeCase, toSnakeKey } from '../../utils/type-mappings';
import { SupabaseClientService } from '../supabase/supabase-client';
import { BackendOrder, Pagination } from '../../types/backend.types';

@Injectable({ providedIn: 'root' })
export class Backend {
  private readonly supabase = inject(SupabaseClientService).client;

  getAll<T extends object>(opts: {
    table: string;
    select?: string;
    joins?: string;
    filters?: Record<string, FilterDefinition>;
    sortBy?: keyof T;
    sortOrder?: 'asc' | 'desc';
    orderBy?: BackendOrder<T> | BackendOrder<T>[];
    pagination?: Pagination;
    range?: { from: number; to: number };
    camelCase?: boolean;
  }): Observable<T[]> {
    const { table, joins, sortBy, sortOrder = 'asc', orderBy, pagination, range } = opts;
    const select = opts.select ?? (joins ? `*, ${joins}` : '*');
    let query = applyFilters(this.table(table).select(select), {
      ...opts.filters,
      ...pagination?.filters,
    });

    if (sortBy) {
      query = query.order(toSnakeKey(String(sortBy)), { ascending: sortOrder === 'asc' });
    }

    for (const order of this.normalizeOrder(orderBy)) {
      query = query.order(toSnakeKey(String(order.column)), {
        ascending: order.ascending ?? true,
      });
    }

    if (range) {
      query = query.range(range.from, range.to);
    } else if (pagination?.page !== undefined && pagination?.pageSize !== undefined) {
      const fromIndex = (pagination.page - 1) * pagination.pageSize;
      query = query.range(fromIndex, fromIndex + pagination.pageSize - 1);
    } else {
      query = query.range(0, 999);
    }

    return from(query).pipe(
      map((response: any) =>
        this.mapListResponse<T>(response, opts.camelCase ?? true)
      )
    );
  }

  getById<T extends object>(table: string, id: string | number): Observable<T | null> {
    return this.getOneByFields<T>(table, { id });
  }

  getBySlug<T extends object>(table: string, slug: string): Observable<T | null> {
    return this.getOneByFields<T>(table, { slug });
  }

  getOneByFields<T extends object>(
    table: string,
    filters: Record<string, unknown>
  ): Observable<T | null> {
    const iFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      acc[key] = { operator: FilterOperator.EQ, value };
      return acc;
    }, {} as Record<string, IFilter>);
    const query = applyFilters(this.table(table).select('*'), iFilters);

    return from(query.maybeSingle()).pipe(
      map((response: any) =>
        this.mapSingleResponse<T>(response)
      )
    );
  }

  getCount(table: string, filters?: Record<string, FilterDefinition>): Observable<number> {
    const query = applyFilters(
      this.table(table).select('*', { count: 'exact', head: true }),
      filters
    );

    return from(query).pipe(
      map((response: any) => {
        this.throwIfError(response);
        return response.count ?? 0;
      })
    );
  }

  getByIds<T extends object>(table: string, ids: Array<string | number>): Observable<T[]> {
    if (!ids.length) {
      return of([]);
    }

    return from(this.table(table).select('*').in('id', ids)).pipe(
      map((response: any) =>
        this.mapListResponse<T>(response)
      )
    );
  }

  create<T extends object>(table: string, data: object): Observable<T> {
    return from(
      this.table(table).insert(toSnakeCase(data) as any).select('*').single()
    ).pipe(map((response: any) => this.requireSingle<T>(response)));
  }

  createMany<T extends object>(table: string, data: object[]): Observable<T[]> {
    if (!data.length) {
      return of([]);
    }

    return from(this.table(table).insert(toSnakeCase(data) as any).select('*')).pipe(
      map((response: any) => this.mapListResponse<T>(response))
    );
  }

  update<T extends object>(
    table: string,
    id: string | number,
    patch: object
  ): Observable<T> {
    return from(
      this.table(table).update(toSnakeCase(patch) as any).eq('id', id).select('*').single()
    ).pipe(map((response: any) => this.requireSingle<T>(response)));
  }

  updateWhere<T extends object>(
    table: string,
    filters: Record<string, FilterDefinition>,
    patch: object
  ): Observable<T[]> {
    const query = applyFilters(this.table(table).update(toSnakeCase(patch) as any), filters);

    return from(query.select('*')).pipe(
      map((response: any) => this.mapListResponse<T>(response))
    );
  }

  upsert<T extends object>(
    table: string,
    data: object,
    conflictTarget = 'id'
  ): Observable<T> {
    return from(
      this.table(table)
        .upsert(toSnakeCase(data) as any, { onConflict: conflictTarget })
        .select('*')
        .single()
    ).pipe(map((response: any) => this.requireSingle<T>(response)));
  }

  upsertMany<T extends object>(
    table: string,
    data: object[],
    conflictTarget = 'id'
  ): Observable<T[]> {
    if (!data.length) {
      return of([]);
    }

    return from(
      this.table(table)
        .upsert(toSnakeCase(data) as any, { onConflict: conflictTarget })
        .select('*')
    ).pipe(map((response: any) => this.mapListResponse<T>(response)));
  }

  delete(
    table: string,
    filters: string | number | Record<string, FilterDefinition>
  ): Observable<void> {
    const normalizedFilters =
      typeof filters === 'object'
        ? filters
        : { id: { operator: FilterOperator.EQ, value: filters } };
    const query = applyFilters(this.table(table).delete(), normalizedFilters);

    return from(query).pipe(
      map((response: any) => {
        this.throwIfError(response);
      })
    );
  }

  private table(table: string) {
    return (this.supabase as any).from(table);
  }

  private normalizeOrder<T extends object>(
    orderBy?: BackendOrder<T> | BackendOrder<T>[]
  ): BackendOrder<T>[] {
    if (!orderBy) {
      return [];
    }

    return Array.isArray(orderBy) ? orderBy : [orderBy];
  }

  private mapListResponse<T extends object>(
    response: PostgrestResponse<any>,
    camelCase = true
  ): T[] {
    this.throwIfError(response);
    return camelCase
      ? (response.data ?? []).map((entry) => toCamelCase<T>(entry))
      : ((response.data ?? []) as T[]);
  }

  private mapSingleResponse<T extends object>(
    response: PostgrestSingleResponse<any>
  ): T | null {
    this.throwIfError(response);
    return response.data ? toCamelCase<T>(response.data) : null;
  }

  private requireSingle<T extends object>(response: PostgrestSingleResponse<any>): T {
    this.throwIfError(response);

    if (!response.data) {
      throw new Error('Database operation returned no row.');
    }

    return toCamelCase<T>(response.data);
  }

  private throwIfError(response: { error: { message: string } | null }) {
    if (response.error) {
      throw new Error(response.error.message);
    }
  }
}
