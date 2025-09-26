import { createClient } from '@supabase/supabase-js';
import { supabaseDataProvider, supabaseAuthProvider } from 'ra-supabase';
import type { DataProvider, GetListParams, GetListResult, RaRecord } from 'react-admin';
import { MergedDatabase } from 'types';

export const instanceUrl = import.meta.env.VITE_SUPABASE_URL;
const apiKey = import.meta.env.VITE_SUPABASE_API_KEY;

export const supabase = createClient<MergedDatabase>(instanceUrl, apiKey);

const baseProvider = supabaseDataProvider({
  instanceUrl,
  apiKey,
  supabaseClient: supabase,
});

const applyFilters = (query: ReturnType<typeof supabase.from>, filter: Record<string, unknown>) => {
  Object.entries(filter).forEach(([key, value]) => {
    if (key === 'or' && typeof value === 'string') {
      const sanitizedOr = value.replace(/^\(+|\)+$/g, '');
      query.or(sanitizedOr);
    } else if (Array.isArray(value)) query.in(key, value);
    else if (value !== undefined) query.eq(key, value);
  });
};

const applyPagination = (
  query: ReturnType<typeof supabase.from>,
  pagination?: GetListParams['pagination']
) => {
  if (pagination) {
    const { page, perPage } = pagination;
    query.range((page - 1) * perPage, page * perPage - 1);
  }
};

const applySorting = (query: ReturnType<typeof supabase.from>, sort?: GetListParams['sort']) => {
  if (sort) query.order(sort.field, { ascending: sort.order === 'ASC' });
};

const resolveRelations = (selectStr: string, filter: Record<string, unknown>): string => {
  if (typeof filter.or !== 'string') return selectStr;

  const re = /([a-zA-Z0-9_]+)\./g;
  const relationNames = Array.from(filter.or.matchAll(re)).map((m) => m[1]);

  relationNames.forEach((rel) => {
    const regex = new RegExp(`${rel}:([^\\(]+)\\(`, 'g');
    if (regex.test(selectStr)) selectStr = selectStr.replace(regex, `${rel}:$1!inner(`);
    else selectStr += `,${rel}!inner(*)`;
  });

  return selectStr;
};

export const myProvider: DataProvider = {
  ...baseProvider,

  getList: async <RecordType extends RaRecord>(
    resource: string,
    params: GetListParams
  ): Promise<GetListResult<RecordType>> => {
    const { filter = {}, pagination, sort, meta } = params;

    if (resource === 'users') {
      const query = supabase
        .from('users')
        .select('*', { count: 'exact' })
        .neq('role', 'admin')
        .neq('role', 'owner');

      applyFilters(query, filter);
      applySorting(query, sort);
      applyPagination(query, pagination);

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        data: (data ?? []) as unknown as RecordType[],
        total: count ?? (data ? data.length : 0),
      };
    }

    let selectStr = '*';
    if (Array.isArray(meta?.columns) && meta.columns.length > 0) {
      selectStr = meta.columns.join(',');
    }

    selectStr = resolveRelations(selectStr, filter);

    const query = supabase
      .from(resource as keyof MergedDatabase['public']['Tables'])
      .select(selectStr, { count: 'exact' });

    applyFilters(query, filter);
    applySorting(query, sort);
    applyPagination(query, pagination);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: (data ?? []) as unknown as RecordType[],
      total: count ?? (data ? data.length : 0),
    };
  },
};

export const authProvider = supabaseAuthProvider(supabase, {});
