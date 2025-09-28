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
      academic_years: {
        Row: {
          id: string;
          name: string;
          short_name: string;
        };
        Insert: {
          id?: string;
          name: string;
          short_name: string;
        };
        Update: {
          id?: string;
          name?: string;
          short_name?: string;
        };
        Relationships: [];
      };
      books: {
        Row: {
          academic_year: string;
          additional_data: string | null;
          cover_url: string | null;
          created_at: string;
          created_by: string | null;
          default_paper_size: string;
          do_round: boolean | null;
          id: string;
          pages: number;
          publisher: string;
          related_books: Json | null;
          subject_id: string;
          term: string;
          updated_at: string | null;
          updated_by: string | null;
          year: string;
        };
        Insert: {
          academic_year: string;
          additional_data?: string | null;
          cover_url?: string | null;
          created_at?: string;
          created_by?: string | null;
          default_paper_size: string;
          do_round?: boolean | null;
          id?: string;
          pages: number;
          publisher: string;
          related_books?: Json | null;
          subject_id: string;
          term: string;
          updated_at?: string | null;
          updated_by?: string | null;
          year: string;
        };
        Update: {
          academic_year?: string;
          additional_data?: string | null;
          cover_url?: string | null;
          created_at?: string;
          created_by?: string | null;
          default_paper_size?: string;
          do_round?: boolean | null;
          id?: string;
          pages?: number;
          publisher?: string;
          related_books?: Json | null;
          subject_id?: string;
          term?: string;
          updated_at?: string | null;
          updated_by?: string | null;
          year?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'books_academic_year_fkey';
            columns: ['academic_year'];
            isOneToOne: false;
            referencedRelation: 'academic_years';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'books_default_paper_size_fkey';
            columns: ['default_paper_size'];
            isOneToOne: false;
            referencedRelation: 'paper_sizes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'books_publisher_fkey';
            columns: ['publisher'];
            isOneToOne: false;
            referencedRelation: 'books_publishers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'books_subject_id_fkey';
            columns: ['subject_id'];
            isOneToOne: false;
            referencedRelation: 'subjects';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'books_term_fkey';
            columns: ['term'];
            isOneToOne: false;
            referencedRelation: 'terms';
            referencedColumns: ['id'];
          },
        ];
      };
      books_publishers: {
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
      cover_paper_sizes: {
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
      cover_paper_types: {
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
      cover_types: {
        Row: {
          gsm: string;
          id: string;
          name: string | null;
          type: string | null;
        };
        Insert: {
          gsm: string;
          id?: string;
          name?: string | null;
          type?: string | null;
        };
        Update: {
          gsm?: string;
          id?: string;
          name?: string | null;
          type?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'cover_types_name_fkey';
            columns: ['name'];
            isOneToOne: false;
            referencedRelation: 'cover_paper_sizes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'cover_types_type_fkey';
            columns: ['type'];
            isOneToOne: false;
            referencedRelation: 'cover_paper_types';
            referencedColumns: ['id'];
          },
        ];
      };
      delivered_reservations: {
        Row: {
          delivered_at: string;
          delivered_by: string | null;
          id: string;
          reservation_id: string;
        };
        Insert: {
          delivered_at: string;
          delivered_by?: string | null;
          id?: string;
          reservation_id: string;
        };
        Update: {
          delivered_at?: string;
          delivered_by?: string | null;
          id?: string;
          reservation_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'delivered_reservations_reservation_id_fkey';
            columns: ['reservation_id'];
            isOneToOne: true;
            referencedRelation: 'reservations';
            referencedColumns: ['id'];
          },
        ];
      };
      notes: {
        Row: {
          academic_year: string;
          additional_data: string | null;
          cover_url: string | null;
          created_at: string;
          created_by: string | null;
          default_paper_size: string;
          do_round: boolean | null;
          id: string;
          nickname: string | null;
          pages: number;
          price: number | null;
          related_notes: Json[] | null;
          subject_id: string;
          teacher_id: string;
          term_id: string;
          updated_at: string | null;
          updated_by: string | null;
          year: string;
        };
        Insert: {
          academic_year: string;
          additional_data?: string | null;
          cover_url?: string | null;
          created_at?: string;
          created_by?: string | null;
          default_paper_size: string;
          do_round?: boolean | null;
          id?: string;
          nickname?: string | null;
          pages: number;
          price?: number | null;
          related_notes?: Json[] | null;
          subject_id: string;
          teacher_id: string;
          term_id: string;
          updated_at?: string | null;
          updated_by?: string | null;
          year: string;
        };
        Update: {
          academic_year?: string;
          additional_data?: string | null;
          cover_url?: string | null;
          created_at?: string;
          created_by?: string | null;
          default_paper_size?: string;
          do_round?: boolean | null;
          id?: string;
          nickname?: string | null;
          pages?: number;
          price?: number | null;
          related_notes?: Json[] | null;
          subject_id?: string;
          teacher_id?: string;
          term_id?: string;
          updated_at?: string | null;
          updated_by?: string | null;
          year?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notes_academic_year_fkey';
            columns: ['academic_year'];
            isOneToOne: false;
            referencedRelation: 'academic_years';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notes_defaul_paper_size_fkey';
            columns: ['default_paper_size'];
            isOneToOne: false;
            referencedRelation: 'paper_sizes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notes_subject_id_fkey';
            columns: ['subject_id'];
            isOneToOne: false;
            referencedRelation: 'subjects';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notes_teacher_fkey';
            columns: ['teacher_id'];
            isOneToOne: false;
            referencedRelation: 'teachers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notes_term_fkey';
            columns: ['term_id'];
            isOneToOne: false;
            referencedRelation: 'terms';
            referencedColumns: ['id'];
          },
        ];
      };
      paper_sizes: {
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
      paper_types: {
        Row: {
          gsm: string | null;
          id: string;
          name: string | null;
        };
        Insert: {
          gsm?: string | null;
          id?: string;
          name?: string | null;
        };
        Update: {
          gsm?: string | null;
          id?: string;
          name?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'paper_types_name_fkey';
            columns: ['name'];
            isOneToOne: false;
            referencedRelation: 'paper_sizes';
            referencedColumns: ['id'];
          },
        ];
      };
      reservations: {
        Row: {
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
          branch_id: string;
          current_term: string;
          current_year: string;
          default_paper_size: string;
          id: string;
          paper_prices: Json[] | null;
          price_ceil_to: number | null;
        };
        Insert: {
          branch_id?: string;
          current_term: string;
          current_year: string;
          default_paper_size: string;
          id?: string;
          paper_prices?: Json[] | null;
          price_ceil_to?: number | null;
        };
        Update: {
          branch_id?: string;
          current_term?: string;
          current_year?: string;
          default_paper_size?: string;
          id?: string;
          paper_prices?: Json[] | null;
          price_ceil_to?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'setting_current_term_fkey';
            columns: ['current_term'];
            isOneToOne: false;
            referencedRelation: 'terms';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'setting_default_paper_size_fkey';
            columns: ['default_paper_size'];
            isOneToOne: false;
            referencedRelation: 'paper_sizes';
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
      teachers: {
        Row: {
          id: string;
          name: string;
          nickname: string | null;
          subject_id: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          nickname?: string | null;
          subject_id?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          nickname?: string | null;
          subject_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'teachers_subject_id_fkey';
            columns: ['subject_id'];
            isOneToOne: false;
            referencedRelation: 'subjects';
            referencedColumns: ['id'];
          },
        ];
      };
      terms: {
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
      reservation_state: 'in-progress' | 'ready' | 'canceled' | 'delivered';
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
      reservation_state: ['in-progress', 'ready', 'canceled', 'delivered'],
      user_role: ['owner', 'admin', 'client', 'vip-client'],
    },
  },
} as const;
