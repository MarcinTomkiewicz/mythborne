import { Injectable, inject } from '@angular/core';
import { from, map, Observable, throwError, of } from 'rxjs';
import { IQueryOptions } from '../../interfaces/i-query/i-query';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Insert, Row, TableName, Update } from '../../types/supabase.types';
import { Platform } from '../platform/platform';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private readonly platform = inject(Platform);
  private readonly supabase: SupabaseClient | null = this.platform.isBrowser
    ? createClient(environment.supabaseUrl, environment.supabaseKey)
    : null;

  private ensureClient(): SupabaseClient {
    if (!this.supabase) {
      throw new Error('[Supabase] Tried to access client on server-side.');
    }
    return this.supabase;
  }

  getAll<T extends TableName>(
    table: T,
    options?: IQueryOptions<Row<T>>
  ): Observable<Row<T>[]> {
    if (!this.supabase) return of([]); // SSR-safe fallback

    const selectedColumns = options?.select ?? '*';

    let query = this.supabase.from(table).select(selectedColumns);

    if (options?.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value === null) {
          query = query.is(key, null);
        } else {
          query = query.eq(key, value as any);
        }
      });
    }

    if (options?.orderBy) {
      query = query.order(options.orderBy.column as string, {
        ascending: options.orderBy.ascending ?? true,
      });
    }

    if (options?.range) {
      query = query.range(options.range.from, options.range.to);
    }

    return from(query).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as unknown as Row<T>[];
      })
    );
  }

  getById<T extends TableName>(
    table: T,
    id: string | number,
    select: string = '*'
  ): Observable<Row<T>> {
    if (!this.supabase) return throwError(() => new Error('Supabase not available on server'));

    return from(
      this.supabase
        .from(table)
        .select(select)
        .eq('id', id as any)
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as unknown as Row<T>;
      })
    );
  }

  deleteById<T extends TableName>(
    table: T,
    id: string | number
  ): Observable<boolean> {
    if (!this.supabase) return throwError(() => new Error('Supabase not available on server'));

    return from(
      this.supabase
        .from(table)
        .delete()
        .eq('id', id as any)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
        return true;
      })
    );
  }
}
