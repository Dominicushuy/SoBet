export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      bets: {
        Row: {
          amount: number;
          bet_code: string;
          chosen_numbers: string[];
          created_at: string | null;
          draw_date: string;
          id: string;
          potential_win: number;
          province: string | null;
          province_id: string | null;
          region: string;
          result: Json | null;
          rule_id: string;
          status: string;
          subtype: string | null;
          total_amount: number;
          updated_at: string | null;
          user_id: string;
          won_amount: number | null;
        };
        Insert: {
          amount: number;
          bet_code: string;
          chosen_numbers: string[];
          created_at?: string | null;
          draw_date: string;
          id?: string;
          potential_win: number;
          province?: string | null;
          province_id?: string | null;
          region: string;
          result?: Json | null;
          rule_id: string;
          status?: string;
          subtype?: string | null;
          total_amount: number;
          updated_at?: string | null;
          user_id: string;
          won_amount?: number | null;
        };
        Update: {
          amount?: number;
          bet_code?: string;
          chosen_numbers?: string[];
          created_at?: string | null;
          draw_date?: string;
          id?: string;
          potential_win?: number;
          province?: string | null;
          province_id?: string | null;
          region?: string;
          result?: Json | null;
          rule_id?: string;
          status?: string;
          subtype?: string | null;
          total_amount?: number;
          updated_at?: string | null;
          user_id?: string;
          won_amount?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'bets_province_id_fkey';
            columns: ['province_id'];
            isOneToOne: false;
            referencedRelation: 'provinces';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bets_rule_id_fkey';
            columns: ['rule_id'];
            isOneToOne: false;
            referencedRelation: 'rules';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bets_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      lottery_schedules: {
        Row: {
          created_at: string | null;
          day_of_week: number;
          id: string;
          is_active: boolean;
          province_id: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          day_of_week: number;
          id?: string;
          is_active?: boolean;
          province_id: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          day_of_week?: number;
          id?: string;
          is_active?: boolean;
          province_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'lottery_schedules_province_id_fkey';
            columns: ['province_id'];
            isOneToOne: false;
            referencedRelation: 'provinces';
            referencedColumns: ['id'];
          },
        ];
      };
      provinces: {
        Row: {
          code: string | null;
          created_at: string | null;
          id: string;
          is_active: boolean;
          name: string;
          region: string;
          sub_region: string | null;
          updated_at: string | null;
        };
        Insert: {
          code?: string | null;
          created_at?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          region: string;
          sub_region?: string | null;
          updated_at?: string | null;
        };
        Update: {
          code?: string | null;
          created_at?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          region?: string;
          sub_region?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      results: {
        Row: {
          created_at: string | null;
          draw_date: string;
          id: string;
          province: string;
          province_id: string | null;
          region: string;
          updated_at: string | null;
          winning_numbers: Json;
        };
        Insert: {
          created_at?: string | null;
          draw_date: string;
          id?: string;
          province: string;
          province_id?: string | null;
          region: string;
          updated_at?: string | null;
          winning_numbers: Json;
        };
        Update: {
          created_at?: string | null;
          draw_date?: string;
          id?: string;
          province?: string;
          province_id?: string | null;
          region?: string;
          updated_at?: string | null;
          winning_numbers?: Json;
        };
        Relationships: [
          {
            foreignKeyName: 'results_province_id_fkey';
            columns: ['province_id'];
            isOneToOne: false;
            referencedRelation: 'provinces';
            referencedColumns: ['id'];
          },
        ];
      };
      rules: {
        Row: {
          active: boolean;
          bet_type: string;
          created_at: string | null;
          description: string | null;
          digits: number | null;
          id: string;
          name: string;
          rate: number | null;
          region: string;
          rule_code: string;
          stake_formula: string | null;
          updated_at: string | null;
          variants: Json | null;
          win_logic: Json | null;
        };
        Insert: {
          active?: boolean;
          bet_type: string;
          created_at?: string | null;
          description?: string | null;
          digits?: number | null;
          id?: string;
          name: string;
          rate?: number | null;
          region: string;
          rule_code: string;
          stake_formula?: string | null;
          updated_at?: string | null;
          variants?: Json | null;
          win_logic?: Json | null;
        };
        Update: {
          active?: boolean;
          bet_type?: string;
          created_at?: string | null;
          description?: string | null;
          digits?: number | null;
          id?: string;
          name?: string;
          rate?: number | null;
          region?: string;
          rule_code?: string;
          stake_formula?: string | null;
          updated_at?: string | null;
          variants?: Json | null;
          win_logic?: Json | null;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          amount: number;
          balance_after: number;
          balance_before: number;
          created_at: string | null;
          id: string;
          notes: string | null;
          reference_id: string | null;
          status: string;
          type: string;
          updated_at: string | null;
          user_id: string;
          wallet_id: string;
        };
        Insert: {
          amount: number;
          balance_after: number;
          balance_before: number;
          created_at?: string | null;
          id?: string;
          notes?: string | null;
          reference_id?: string | null;
          status?: string;
          type: string;
          updated_at?: string | null;
          user_id: string;
          wallet_id: string;
        };
        Update: {
          amount?: number;
          balance_after?: number;
          balance_before?: number;
          created_at?: string | null;
          id?: string;
          notes?: string | null;
          reference_id?: string | null;
          status?: string;
          type?: string;
          updated_at?: string | null;
          user_id?: string;
          wallet_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'transactions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_wallet_id_fkey';
            columns: ['wallet_id'];
            isOneToOne: false;
            referencedRelation: 'wallets';
            referencedColumns: ['id'];
          },
        ];
      };
      users: {
        Row: {
          created_at: string | null;
          email: string;
          id: string;
          role: string;
          updated_at: string | null;
          username: string;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          id?: string;
          role?: string;
          updated_at?: string | null;
          username: string;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          id?: string;
          role?: string;
          updated_at?: string | null;
          username?: string;
        };
        Relationships: [];
      };
      wallets: {
        Row: {
          balance: number;
          created_at: string | null;
          id: string;
          total_bet: number;
          total_win: number;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          balance?: number;
          created_at?: string | null;
          id?: string;
          total_bet?: number;
          total_win?: number;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          balance?: number;
          created_at?: string | null;
          id?: string;
          total_bet?: number;
          total_win?: number;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'wallets_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_latest_result_for_province: {
        Args: {
          province_id_param: string;
        };
        Returns: {
          result_id: string;
          draw_date: string;
          winning_numbers: Json;
        }[];
      };
      get_provinces_by_day_of_week: {
        Args: {
          day: number;
        };
        Returns: {
          province_id: string;
          province_name: string;
          region: string;
          sub_region: string;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    ? (PublicSchema['Tables'] & PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends keyof PublicSchema['Enums'] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
    ? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;
