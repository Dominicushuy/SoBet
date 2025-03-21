export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      bets: {
        Row: {
          amount: number;
          bet_code: string;
          chosen_numbers: string[];
          created_at: string;
          draw_date: string;
          id: string;
          potential_win: number;
          region: string;
          result: Json | null;
          rule_id: string;
          status: string;
          subtype: string | null;
          total_amount: number;
          updated_at: string;
          user_id: string;
          won_amount: number | null;
        };
        Insert: {
          amount: number;
          bet_code: string;
          chosen_numbers: string[];
          created_at?: string;
          draw_date: string;
          id?: string;
          potential_win: number;
          region: string;
          result?: Json | null;
          rule_id: string;
          status?: string;
          subtype?: string | null;
          total_amount: number;
          updated_at?: string;
          user_id: string;
          won_amount?: number | null;
        };
        Update: {
          amount?: number;
          bet_code?: string;
          chosen_numbers?: string[];
          created_at?: string;
          draw_date?: string;
          id?: string;
          potential_win?: number;
          region?: string;
          result?: Json | null;
          rule_id?: string;
          status?: string;
          subtype?: string | null;
          total_amount?: number;
          updated_at?: string;
          user_id?: string;
          won_amount?: number | null;
        };
        Relationships: [
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
      results: {
        Row: {
          created_at: string;
          draw_date: string;
          id: string;
          province: string;
          region: string;
          updated_at: string;
          winning_numbers: Json;
        };
        Insert: {
          created_at?: string;
          draw_date: string;
          id?: string;
          province: string;
          region: string;
          updated_at?: string;
          winning_numbers: Json;
        };
        Update: {
          created_at?: string;
          draw_date?: string;
          id?: string;
          province?: string;
          region?: string;
          updated_at?: string;
          winning_numbers?: Json;
        };
        Relationships: [];
      };
      rules: {
        Row: {
          active: boolean;
          bet_type: string;
          created_at: string;
          description: string | null;
          digits: number | null;
          id: string;
          name: string;
          rate: number | null;
          region: string;
          rule_code: string;
          stake_formula: string | null;
          updated_at: string;
          variants: Json | null;
          win_logic: Json | null;
        };
        Insert: {
          active?: boolean;
          bet_type: string;
          created_at?: string;
          description?: string | null;
          digits?: number | null;
          id?: string;
          name: string;
          rate?: number | null;
          region: string;
          rule_code: string;
          stake_formula?: string | null;
          updated_at?: string;
          variants?: Json | null;
          win_logic?: Json | null;
        };
        Update: {
          active?: boolean;
          bet_type?: string;
          created_at?: string;
          description?: string | null;
          digits?: number | null;
          id?: string;
          name?: string;
          rate?: number | null;
          region?: string;
          rule_code?: string;
          stake_formula?: string | null;
          updated_at?: string;
          variants?: Json | null;
          win_logic?: Json | null;
        };
        Relationships: [];
      };
      users: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          role: string;
          updated_at: string;
          username: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          role?: string;
          updated_at?: string;
          username: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          role?: string;
          updated_at?: string;
          username?: string;
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
