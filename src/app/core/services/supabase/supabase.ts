import { Injectable } from '@angular/core';
import { from, map, Observable } from 'rxjs';

import { IQueryOptions } from '../../interfaces/i-query/i-query';
import { supabase } from '../../supabase/supabase';
import { Insert, Row, TableName, Update } from '../../types/supabase.types';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  getAll<T extends TableName>(
    table: T,
    options?: IQueryOptions<Row<T>>
  ): Observable<Row<T>[]> {
    const selectedColumns = options?.select ?? '*';

    let query = supabase.from(table).select(selectedColumns);

  if (options?.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      if (value === null) {
        query = query.is(key, null); // 👈 to dodajemy!
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
    return from(
      supabase
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
    return from(
      supabase
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
