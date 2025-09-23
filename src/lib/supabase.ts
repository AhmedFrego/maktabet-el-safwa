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
    const { filter, pagination, sort } = params;

    if (resource === 'users') {
      let query = supabase
        .from('users')
        .select('*', { count: 'exact' })
        .neq('role', 'admin')
        .neq('role', 'owner');

      if (filter?.or) {
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

    if (filter && filter.or) {
      let query = supabase
        .from(resource as keyof MergedDatabase['public']['Tables'])
        .select('*', { count: 'exact' });

      if (sort) {
        query = query.order(sort.field, { ascending: sort.order === 'ASC' });
      }

      if (pagination) {
        const { page, perPage } = pagination;
        query = query.range((page - 1) * perPage, page * perPage - 1);
      }

      query = query.or(filter.or);

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        data: (data ?? []) as unknown as RecordType[],
        total: count ?? (data ? data.length : 0),
      };
    }

    return baseProvider.getList<RecordType>(resource, params);
  },
};

export const authProvider = supabaseAuthProvider(supabase, {});
