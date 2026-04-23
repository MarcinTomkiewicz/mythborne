export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      bonus_templates: {
        Row: {
          description: string | null
          id: string
          target: string
          type: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          target: string
          type?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          target?: string
          type?: string | null
        }
        Relationships: []
      }
      balance_formula_assignments: {
        Row: {
          created_at: string
          formula_id: string
          id: string
          target_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          formula_id: string
          id?: string
          target_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          formula_id?: string
          id?: string
          target_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "balance_formula_assignments_formula_id_fkey"
            columns: ["formula_id"]
            isOneToOne: false
            referencedRelation: "balance_formulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "balance_formula_assignments_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: true
            referencedRelation: "balance_formula_targets"
            referencedColumns: ["id"]
          },
        ]
      }
      balance_formula_targets: {
        Row: {
          allowed_variables: string[]
          created_at: string
          default_test_context: Json
          description: string | null
          id: string
          key: string
          label: string
          scope_key: string
          sort_order: number
        }
        Insert: {
          allowed_variables?: string[]
          created_at?: string
          default_test_context?: Json
          description?: string | null
          id?: string
          key: string
          label: string
          scope_key: string
          sort_order?: number
        }
        Update: {
          allowed_variables?: string[]
          created_at?: string
          default_test_context?: Json
          description?: string | null
          id?: string
          key?: string
          label?: string
          scope_key?: string
          sort_order?: number
        }
        Relationships: []
      }
      balance_formula_blocks: {
        Row: {
          category: string
          created_at: string
          helper_text: string | null
          id: string
          label: string
          scope_key: string
          sort_order: number
          token: string
        }
        Insert: {
          category: string
          created_at?: string
          helper_text?: string | null
          id?: string
          label: string
          scope_key: string
          sort_order?: number
          token: string
        }
        Update: {
          category?: string
          created_at?: string
          helper_text?: string | null
          id?: string
          label?: string
          scope_key?: string
          sort_order?: number
          token?: string
        }
        Relationships: []
      }
      balance_formulas: {
        Row: {
          created_at: string
          description: string | null
          expression: string
          id: string
          is_enabled: boolean
          key: string
          label: string
          scope_key: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          expression: string
          id?: string
          is_enabled?: boolean
          key: string
          label: string
          scope_key: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          expression?: string
          id?: string
          is_enabled?: boolean
          key?: string
          label?: string
          scope_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      building_bonuses: {
        Row: {
          building_id: string | null
          id: string
          template_id: string | null
          value: number
        }
        Insert: {
          building_id?: string | null
          id?: string
          template_id?: string | null
          value: number
        }
        Update: {
          building_id?: string | null
          id?: string
          template_id?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "building_bonuses_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "building_bonuses_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "bonus_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      building_requirements: {
        Row: {
          applies_from_level: number
          building_id: string
          created_at: string
          id: string
          min_value: number
          requirement_type: string
          sort_order: number
          stat_key: string | null
        }
        Insert: {
          applies_from_level?: number
          building_id: string
          created_at?: string
          id?: string
          min_value: number
          requirement_type: string
          sort_order?: number
          stat_key?: string | null
        }
        Update: {
          applies_from_level?: number
          building_id?: string
          created_at?: string
          id?: string
          min_value?: number
          requirement_type?: string
          sort_order?: number
          stat_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "building_requirements_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "building_requirements_stat_key_fkey"
            columns: ["stat_key"]
            isOneToOne: false
            referencedRelation: "stats"
            referencedColumns: ["key"]
          },
        ]
      }
      building_resource_costs: {
        Row: {
          applies_from_level: number
          base_value: number
          building_id: string
          created_at: string
          id: string
          resource_type: string
          sort_order: number
        }
        Insert: {
          applies_from_level?: number
          base_value: number
          building_id: string
          created_at?: string
          id?: string
          resource_type: string
          sort_order?: number
        }
        Update: {
          applies_from_level?: number
          base_value?: number
          building_id?: string
          created_at?: string
          id?: string
          resource_type?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "building_resource_costs_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
        ]
      }
      buildings: {
        Row: {
          base_build_time_minutes: number
          base_cost: number
          created_at: string | null
          description: string | null
          district_code: string
          id: string
          image_path: string | null
          key: string
          max_level: number
          name: string
          rank_required: number
          requirements: Json
          sort_order: number
        }
        Insert: {
          base_build_time_minutes?: number
          base_cost?: number
          created_at?: string | null
          description?: string | null
          district_code?: string
          id?: string
          image_path?: string | null
          key: string
          max_level?: number
          name: string
          rank_required?: number
          requirements?: Json
          sort_order?: number
        }
        Update: {
          base_build_time_minutes?: number
          base_cost?: number
          created_at?: string | null
          description?: string | null
          district_code?: string
          id?: string
          image_path?: string | null
          key?: string
          max_level?: number
          name?: string
          rank_required?: number
          requirements?: Json
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "buildings_district_code_fkey"
            columns: ["district_code"]
            isOneToOne: false
            referencedRelation: "estate_districts"
            referencedColumns: ["code"]
          },
        ]
      }
      estate_buildings: {
        Row: {
          building_id: string
          estate_id: string
          level: number
        }
        Insert: {
          building_id: string
          estate_id: string
          level?: number
        }
        Update: {
          building_id?: string
          estate_id?: string
          level?: number
        }
        Relationships: [
          {
            foreignKeyName: "estate_buildings_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estate_buildings_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
        ]
      }
      estate_districts: {
        Row: {
          code: string
          description: string
          name: string
          rank: number
        }
        Insert: {
          code: string
          description: string
          name: string
          rank: number
        }
        Update: {
          code?: string
          description?: string
          name?: string
          rank?: number
        }
        Relationships: []
      }
      estates: {
        Row: {
          address: string
          created_at: string | null
          district_code: string | null
          hero_id: string | null
          id: string
          rank: number
        }
        Insert: {
          address: string
          created_at?: string | null
          district_code?: string | null
          hero_id?: string | null
          id?: string
          rank: number
        }
        Update: {
          address?: string
          created_at?: string | null
          district_code?: string | null
          hero_id?: string | null
          id?: string
          rank?: number
        }
        Relationships: [
          {
            foreignKeyName: "estates_district_code_fkey"
            columns: ["district_code"]
            isOneToOne: false
            referencedRelation: "estate_districts"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "estates_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
        ]
      }
      hero: {
        Row: {
          created_at: string | null
          estate_id: string | null
          experience: number | null
          id: string
          level: number | null
          name: string
          origin_id: string | null
          profile_picture: string | null
          rank: number | null
        }
        Insert: {
          created_at?: string | null
          estate_id?: string | null
          experience?: number | null
          id: string
          level?: number | null
          name: string
          origin_id?: string | null
          profile_picture?: string | null
          rank?: number | null
        }
        Update: {
          created_at?: string | null
          estate_id?: string | null
          experience?: number | null
          id?: string
          level?: number | null
          name?: string
          origin_id?: string | null
          profile_picture?: string | null
          rank?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hero_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_origin_id_fkey"
            columns: ["origin_id"]
            isOneToOne: false
            referencedRelation: "origin"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_derived: {
        Row: {
          critical: number
          def: number
          evasion: number
          health: number
          hero_id: string
          hp: number
          luck: number
          max_dmg: number
          min_dmg: number
        }
        Insert: {
          critical?: number
          def?: number
          evasion?: number
          health?: number
          hero_id: string
          hp?: number
          luck?: number
          max_dmg?: number
          min_dmg?: number
        }
        Update: {
          critical?: number
          def?: number
          evasion?: number
          health?: number
          hero_id?: string
          hp?: number
          luck?: number
          max_dmg?: number
          min_dmg?: number
        }
        Relationships: [
          {
            foreignKeyName: "hero_derived_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: true
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_resources: {
        Row: {
          amount: number
          hero_id: string | null
          id: string
          per_hour: number
          resource_type: string
          updated_at: string | null
        }
        Insert: {
          amount?: number
          hero_id?: string | null
          id?: string
          per_hour?: number
          resource_type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          hero_id?: string | null
          id?: string
          per_hour?: number
          resource_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hero_resources_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_stats: {
        Row: {
          hero_id: string
          stat_key: string
          value: number
        }
        Insert: {
          hero_id: string
          stat_key: string
          value: number
        }
        Update: {
          hero_id?: string
          stat_key?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "hero_stats_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_stats_stat_key_fkey"
            columns: ["stat_key"]
            isOneToOne: false
            referencedRelation: "stats"
            referencedColumns: ["key"]
          },
        ]
      }
      item_generation_affix_bonuses: {
        Row: {
          affix_id: string
          id: string
          template_id: string
          value: number
        }
        Insert: {
          affix_id: string
          id?: string
          template_id: string
          value: number
        }
        Update: {
          affix_id?: string
          id?: string
          template_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "item_generation_affix_bonuses_affix_id_fkey"
            columns: ["affix_id"]
            isOneToOne: false
            referencedRelation: "item_generation_affixes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_generation_affix_bonuses_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "bonus_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      item_generation_affixes: {
        Row: {
          created_at: string
          description: string | null
          gold_value: number
          id: string
          key: string
          kind: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          gold_value: number
          id?: string
          key: string
          kind: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          gold_value?: number
          id?: string
          key?: string
          kind?: string
          name?: string
        }
        Relationships: []
      }
      item_generation_base_bonuses: {
        Row: {
          base_id: string
          id: string
          template_id: string
          value: number
        }
        Insert: {
          base_id: string
          id?: string
          template_id: string
          value: number
        }
        Update: {
          base_id?: string
          id?: string
          template_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "item_generation_base_bonuses_base_id_fkey"
            columns: ["base_id"]
            isOneToOne: false
            referencedRelation: "item_generation_bases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_generation_base_bonuses_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "bonus_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      item_generation_bases: {
        Row: {
          base_value: number
          created_at: string
          description: string | null
          id: string
          key: string
          name: string
          slot: string
        }
        Insert: {
          base_value: number
          created_at?: string
          description?: string | null
          id?: string
          key: string
          name: string
          slot: string
        }
        Update: {
          base_value?: number
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          name?: string
          slot?: string
        }
        Relationships: []
      }
      item_generation_bucket_profiles: {
        Row: {
          base_value: number
          bucket_count: number
          created_at: string
          description: string | null
          growth_factor: number
          id: string
          is_active: boolean
          key: string
          linear_growth: number
          min_increment: number
          name: string
          rounding_step: number
        }
        Insert: {
          base_value: number
          bucket_count: number
          created_at?: string
          description?: string | null
          growth_factor: number
          id?: string
          is_active?: boolean
          key: string
          linear_growth?: number
          min_increment: number
          name: string
          rounding_step: number
        }
        Update: {
          base_value?: number
          bucket_count?: number
          created_at?: string
          description?: string | null
          growth_factor?: number
          id?: string
          is_active?: boolean
          key?: string
          linear_growth?: number
          min_increment?: number
          name?: string
          rounding_step?: number
        }
        Relationships: []
      }
      item_generation_qualities: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean
          key: string
          label: string
          multiplier: number
          sort_order: number
          weight: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          key: string
          label: string
          multiplier: number
          sort_order?: number
          weight: number
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          key?: string
          label?: string
          multiplier?: number
          sort_order?: number
          weight?: number
        }
        Relationships: []
      }
      item_bonuses: {
        Row: {
          id: string
          item_id: string | null
          template_id: string | null
          value: number
        }
        Insert: {
          id?: string
          item_id?: string | null
          template_id?: string | null
          value: number
        }
        Update: {
          id?: string
          item_id?: string | null
          template_id?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "item_bonuses_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_bonuses_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "bonus_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      origin: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          name?: string
        }
        Relationships: []
      }
      origin_bonuses: {
        Row: {
          id: string
          origin_id: string | null
          template_id: string | null
          value: number
        }
        Insert: {
          id?: string
          origin_id?: string | null
          template_id?: string | null
          value: number
        }
        Update: {
          id?: string
          origin_id?: string | null
          template_id?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "origin_bonuses_origin_id_fkey"
            columns: ["origin_id"]
            isOneToOne: false
            referencedRelation: "origin"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "origin_bonuses_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "bonus_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      ranks: {
        Row: {
          description: string | null
          id: number
          max_players: number | null
          name: string | null
          required_level: number | null
        }
        Insert: {
          description?: string | null
          id: number
          max_players?: number | null
          name?: string | null
          required_level?: number | null
        }
        Update: {
          description?: string | null
          id?: number
          max_players?: number | null
          name?: string | null
          required_level?: number | null
        }
        Relationships: []
      }
      roles: {
        Row: {
          description: string | null
          id: number
          name: string
        }
        Insert: {
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      stats: {
        Row: {
          description: string | null
          id: string
          key: string
          label: string
          order: number
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          label: string
          order: number
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          label?: string
          order?: number
        }
        Relationships: []
      }
      stats_derived: {
        Row: {
          description: string | null
          id: string
          key: string
          label: string
          order: number
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          label: string
          order: number
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          label?: string
          order?: number
        }
        Relationships: []
      }
      user_data: {
        Row: {
          bio: string | null
          birthday: string | null
          city: string | null
          created_at: string | null
          email: string
          facebook: string | null
          id: string
          instagram: string | null
          is_online: boolean | null
          last_login: string | null
          linkedin: string | null
          name: string
          photo_url: string | null
          role_id: number | null
          twitter: string | null
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          birthday?: string | null
          city?: string | null
          created_at?: string | null
          email: string
          facebook?: string | null
          id: string
          instagram?: string | null
          is_online?: boolean | null
          last_login?: string | null
          linkedin?: string | null
          name: string
          photo_url?: string | null
          role_id?: number | null
          twitter?: string | null
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          birthday?: string | null
          city?: string | null
          created_at?: string | null
          email?: string
          facebook?: string | null
          id?: string
          instagram?: string | null
          is_online?: boolean | null
          last_login?: string | null
          linkedin?: string | null
          name?: string
          photo_url?: string | null
          role_id?: number | null
          twitter?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_data_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

