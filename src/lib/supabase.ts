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

export const myProvider: DataProvider = {
  ...baseProvider,

  getList: async <RecordType extends RaRecord>(
    resource: string,
    params: GetListParams
  ): Promise<GetListResult<RecordType>> => {
    const { filter = {}, pagination, sort, meta } = params;

    if (resource === 'users') {
      let query = supabase
        .from('users')
        .select('*', { count: 'exact' })
        .neq('role', 'admin')
        .neq('role', 'owner');

      if (filter.or) {
        const sanitizedOr = filter.or.replace(/^\(+|\)+$/g, '');
        query = query.or(sanitizedOr);
      }

      if (sort) {
        query = query.order(sort.field, { ascending: sort.order === 'ASC' });
      }

      if (pagination) {
        const { page, perPage } = pagination;
        query = query.range((page - 1) * perPage, page * perPage - 1);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        data: (data ?? []) as unknown as RecordType[],
        total: count ?? (data ? data.length : 0),
      };
    }

    let selectStr = '*';
    if (meta?.columns && Array.isArray(meta.columns) && meta.columns.length > 0) {
      selectStr = meta.columns.join(',');
    }

    if (typeof filter.or === 'string') {
      const re = /([a-zA-Z0-9_]+)\./g;
      let match;
      const relationNames: string[] = [];

      while ((match = re.exec(filter.or))) {
        if (match[1] && !relationNames.includes(match[1])) {
          relationNames.push(match[1]);
        }
      }

      relationNames.forEach((rel) => {
        const regex = new RegExp(`${rel}:([^\\(]+)\\(`, 'g');
        if (regex.test(selectStr)) {
          selectStr = selectStr.replace(regex, `${rel}:$1!inner(`);
        } else {
          selectStr += `,${rel}!inner(*)`;
        }
      });
    }

    let query = supabase
      .from(resource as keyof MergedDatabase['public']['Tables'])
      .select(selectStr, { count: 'exact' });

    if (filter.client_id) {
      query = query.eq('client_id', filter.client_id);
    }

    if (sort) {
      query = query.order(sort.field, { ascending: sort.order === 'ASC' });
    }

    if (pagination) {
      const { page, perPage } = pagination;
      query = query.range((page - 1) * perPage, page * perPage - 1);
    }

    if (filter.or) {
      query = query.or(filter.or);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: (data ?? []) as unknown as RecordType[],
      total: count ?? (data ? data.length : 0),
    };
  },
};

export const authProvider = supabaseAuthProvider(supabase, {});
