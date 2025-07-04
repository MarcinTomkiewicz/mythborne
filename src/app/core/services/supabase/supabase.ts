import { Injectable } from '@angular/core';
import { from, map, Observable } from 'rxjs';
import { Database } from '../../supabase/database.types';
import { IQueryOptions } from '../../interfaces/i-query/i-query';
import { supabase } from '../../supabase/supabase';

type TableName = keyof Database['public']['Tables'];
type Table<T extends TableName> = Database['public']['Tables'][T];
type Row<T extends TableName> = Table<T>['Row'];
type Insert<T extends TableName> = Table<T>['Insert'];
type Update<T extends TableName> = Table<T>['Update'];

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  getAll<T extends TableName>(
    table: T,
    options?: IQueryOptions<Row<T>>
  ): Observable<Row<T>[]> {
    const selectedColumns = options?.select ?? '*';
    let query = supabase.from<T, Row<T>>(table).select(selectedColumns);

    if (options?.filters) {
      for (const [key, value] of Object.entries(options.filters)) {
        query = query.eq(key as string, value as any);
      }
    }

    if (options?.orderBy) {
      query = query.order(
        options.orderBy.column as string,
        { ascending: options.orderBy.ascending ?? true }
      );
    }

    if (options?.range) {
      query = query.range(options.range.from, options.range.to);
    }

    return from(query).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as Row<T>[];
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
        .from<T, Row<T>>(table)
        .select(select)
        .eq('id', id as any)
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as Row<T>;
      })
    );
  }

  create<T extends TableName>(
    table: T,
    payload: Insert<T>
  ): Observable<Row<T>> {
    return from(
      supabase
        .from<T, Row<T>>(table)
        .insert(payload)
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as Row<T>;
      })
    );
  }

  updateById<T extends TableName>(
    table: T,
    id: string | number,
    payload: Update<T>
  ): Observable<Row<T>> {
    return from(
      supabase
        .from<T, Row<T>>(table)
        .update(payload)
        .eq('id', id as any)
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as Row<T>;
      })
    );
  }

  deleteById<T extends TableName>(
    table: T,
    id: string | number
  ): Observable<boolean> {
    return from(
      supabase
        .from<T, Row<T>>(table)
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
