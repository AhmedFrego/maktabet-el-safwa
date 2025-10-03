import { MergedDatabase } from './supabase-overrides.types';

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.4';
  };
  public: {
    Tables: {
      academic_years_duplicate: {
        Row: {
          id: string;
          name: string;
          short_name: string;
          sort_value: number | null;
          stage: Database['public']['Enums']['stage'];
        };
        Insert: {
          id?: string;
          name: string;
          short_name: string;
          sort_value?: number | null;
          stage?: Database['public']['Enums']['stage'];
        };
        Update: {
          id?: string;
          name?: string;
          short_name?: string;
          sort_value?: number | null;
          stage?: Database['public']['Enums']['stage'];
        };
        Relationships: [];
      };
      academic_yearss: {
        Row: {
          id: string;
          name: string;
          short_name: string;
          sort_value: number | null;
          stage: Database['public']['Enums']['stage'];
        };
        Insert: {
          id?: string;
          name: string;
          short_name: string;
          sort_value?: number | null;
          stage?: Database['public']['Enums']['stage'];
        };
        Update: {
          id?: string;
          name?: string;
          short_name?: string;
          sort_value?: number | null;
          stage?: Database['public']['Enums']['stage'];
        };
        Relationships: [];
      };
      cover_types: {
        Row: {
          id: string;
          name: string;
          to_paper_size: Json[] | null;
        };
        Insert: {
          id?: string;
          name: string;
          to_paper_size?: Json[] | null;
        };
        Update: {
          id?: string;
          name?: string;
          to_paper_size?: Json[] | null;
        };
        Relationships: [];
      };
      paper_types: {
        Row: {
          id: string;
          name: string;
        };
        Insert: {
          id?: string;
          name: string;
        };
        Update: {
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      publications: {
        Row: {
          academic_year: Database['public']['Enums']['academic_years'];
          additional_data: string | null;
          change_price: Json | null;
          cover_url: string | null;
          created_at: string;
          created_by: string;
          default_paper_size: string;
          do_round: boolean | null;
          id: string;
          pages: number;
          publication_type: Database['public']['Enums']['publications_types'] | null;
          publisher: string;
          related_publications: Json[] | null;
          subject_id: string;
          term: Database['public']['Enums']['term'] | null;
          two_faces_cover: boolean | null;
          updated_at: string | null;
          updated_by: string | null;
          year: string;
        };
        Insert: {
          academic_year: Database['public']['Enums']['academic_years'];
          additional_data?: string | null;
          change_price?: Json | null;
          cover_url?: string | null;
          created_at: string;
          created_by: string;
          default_paper_size: string;
          do_round?: boolean | null;
          id?: string;
          pages: number;
          publication_type?: Database['public']['Enums']['publications_types'] | null;
          publisher: string;
          related_publications?: Json[] | null;
          subject_id: string;
          term?: Database['public']['Enums']['term'] | null;
          two_faces_cover?: boolean | null;
          updated_at?: string | null;
          updated_by?: string | null;
          year: string;
        };
        Update: {
          academic_year?: Database['public']['Enums']['academic_years'];
          additional_data?: string | null;
          change_price?: Json | null;
          cover_url?: string | null;
          created_at?: string;
          created_by?: string;
          default_paper_size?: string;
          do_round?: boolean | null;
          id?: string;
          pages?: number;
          publication_type?: Database['public']['Enums']['publications_types'] | null;
          publisher?: string;
          related_publications?: Json[] | null;
          subject_id?: string;
          term?: Database['public']['Enums']['term'] | null;
          two_faces_cover?: boolean | null;
          updated_at?: string | null;
          updated_by?: string | null;
          year?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'publications_default_paper_size_fkey';
            columns: ['default_paper_size'];
            isOneToOne: false;
            referencedRelation: 'paper_types';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'publications_publisher_fkey';
            columns: ['publisher'];
            isOneToOne: false;
            referencedRelation: 'publishers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'publications_subject_id_fkey';
            columns: ['subject_id'];
            isOneToOne: false;
            referencedRelation: 'subjects';
            referencedColumns: ['id'];
          },
        ];
      };
      publishers: {
        Row: {
          id: string;
          name: string;
        };
        Insert: {
          id?: string;
          name: string;
        };
        Update: {
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      reservations: {
        Row: {
          branch: Database['public']['Enums']['branches'];
          client_id: string;
          created_at: string;
          created_by: string;
          dead_line: string;
          delivered_at: string | null;
          delivered_by: string | null;
          id: string;
          paid_amount: number;
          remain_amount: number;
          reservation_status: Database['public']['Enums']['reservation_state'];
          reserved_items: Json[];
          total_price: number;
        };
        Insert: {
          branch?: Database['public']['Enums']['branches'];
          client_id: string;
          created_at?: string;
          created_by: string;
          dead_line: string;
          delivered_at?: string | null;
          delivered_by?: string | null;
          id?: string;
          paid_amount: number;
          remain_amount: number;
          reservation_status?: Database['public']['Enums']['reservation_state'];
          reserved_items: Json[];
          total_price: number;
        };
        Update: {
          branch?: Database['public']['Enums']['branches'];
          client_id?: string;
          created_at?: string;
          created_by?: string;
          dead_line?: string;
          delivered_at?: string | null;
          delivered_by?: string | null;
          id?: string;
          paid_amount?: number;
          remain_amount?: number;
          reservation_status?: Database['public']['Enums']['reservation_state'];
          reserved_items?: Json[];
          total_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'reservations_client_id_fkey1';
            columns: ['client_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      settings: {
        Row: {
          available_covers: string[] | null;
          branch_admin: string;
          branch_avatar_url: string;
          branch_geo_location: string | null;
          branch_hours: Json | null;
          branch_location: string | null;
          branch_name: string;
          branch_phone_numbers: Json | null;
          covers_prices: Json[] | null;
          current_term: Database['public']['Enums']['term'];
          current_year: string;
          default_cover: string | null;
          default_paper_size: string;
          id: string;
          paper_prices: Json[] | null;
          price_ceil_to: number | null;
        };
        Insert: {
          available_covers?: string[] | null;
          branch_admin: string;
          branch_avatar_url?: string;
          branch_geo_location?: string | null;
          branch_hours?: Json | null;
          branch_location?: string | null;
          branch_name?: string;
          branch_phone_numbers?: Json | null;
          covers_prices?: Json[] | null;
          current_term: Database['public']['Enums']['term'];
          current_year: string;
          default_cover?: string | null;
          default_paper_size: string;
          id?: string;
          paper_prices?: Json[] | null;
          price_ceil_to?: number | null;
        };
        Update: {
          available_covers?: string[] | null;
          branch_admin?: string;
          branch_avatar_url?: string;
          branch_geo_location?: string | null;
          branch_hours?: Json | null;
          branch_location?: string | null;
          branch_name?: string;
          branch_phone_numbers?: Json | null;
          covers_prices?: Json[] | null;
          current_term?: Database['public']['Enums']['term'];
          current_year?: string;
          default_cover?: string | null;
          default_paper_size?: string;
          id?: string;
          paper_prices?: Json[] | null;
          price_ceil_to?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'setting_default_paper_size_fkey';
            columns: ['default_paper_size'];
            isOneToOne: false;
            referencedRelation: 'paper_types';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'settings_default_cover_fkey';
            columns: ['default_cover'];
            isOneToOne: false;
            referencedRelation: 'cover_types';
            referencedColumns: ['id'];
          },
        ];
      };
      subjects: {
        Row: {
          id: string;
          name: string;
        };
        Insert: {
          id?: string;
          name: string;
        };
        Update: {
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
          phone_number: string | null;
          role: Database['public']['Enums']['user_role'];
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          phone_number?: string | null;
          role?: Database['public']['Enums']['user_role'];
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          phone_number?: string | null;
          role?: Database['public']['Enums']['user_role'];
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      academic_years:
        | 'KG0'
        | 'KG1'
        | 'KG2'
        | '1st_primary'
        | '2nd_primary'
        | '3rd_primary'
        | '4th_primary'
        | '5th_primary'
        | '6th_primary'
        | '1st_preparatory'
        | '2nd_preparatory'
        | '3rd_preparatory'
        | '1st_secondary'
        | '2nd_secondary'
        | '3rd_secondary';
      branches: 'bakus';
      publications_types: 'note' | 'book' | 'other';
      reservation_state: 'in-progress' | 'ready' | 'canceled' | 'delivered';
      stage: 'KG' | 'primary' | 'preparatory' | 'secondary' | 'other';
      term: '1st' | '2nd' | 'full_year';
      user_role: 'owner' | 'admin' | 'client' | 'vip-client';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<MergedDatabase, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof MergedDatabase, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      academic_years: [
        'KG0',
        'KG1',
        'KG2',
        '1st_primary',
        '2nd_primary',
        '3rd_primary',
        '4th_primary',
        '5th_primary',
        '6th_primary',
        '1st_preparatory',
        '2nd_preparatory',
        '3rd_preparatory',
        '1st_secondary',
        '2nd_secondary',
        '3rd_secondary',
      ],
      branches: ['bakus'],
      publications_types: ['note', 'book', 'other'],
      reservation_state: ['in-progress', 'ready', 'canceled', 'delivered'],
      stage: ['KG', 'primary', 'preparatory', 'secondary', 'other'],
      term: ['1st', '2nd', 'full_year'],
      user_role: ['owner', 'admin', 'client', 'vip-client'],
    },
  },
} as const;
