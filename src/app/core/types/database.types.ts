export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      anti_abuse_case_audit_logs: {
        Row: {
          audit_log_id: string
          case_id: string
          created_at: string
          linked_by_user_id: string | null
          reason: string | null
        }
        Insert: {
          audit_log_id: string
          case_id: string
          created_at?: string
          linked_by_user_id?: string | null
          reason?: string | null
        }
        Update: {
          audit_log_id?: string
          case_id?: string
          created_at?: string
          linked_by_user_id?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anti_abuse_case_audit_logs_audit_log_id_fkey"
            columns: ["audit_log_id"]
            isOneToOne: false
            referencedRelation: "audit_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anti_abuse_case_audit_logs_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "anti_abuse_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      anti_abuse_case_declarations: {
        Row: {
          case_id: string
          created_at: string
          declaration_id: string
          linked_by_user_id: string | null
          reason: string | null
        }
        Insert: {
          case_id: string
          created_at?: string
          declaration_id: string
          linked_by_user_id?: string | null
          reason?: string | null
        }
        Update: {
          case_id?: string
          created_at?: string
          declaration_id?: string
          linked_by_user_id?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anti_abuse_case_declarations_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "anti_abuse_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anti_abuse_case_declarations_declaration_id_fkey"
            columns: ["declaration_id"]
            isOneToOne: false
            referencedRelation: "player_relationship_declarations"
            referencedColumns: ["id"]
          },
        ]
      }
      anti_abuse_case_participants: {
        Row: {
          case_id: string
          created_at: string
          created_by_user_id: string | null
          description: string | null
          hero_id: string | null
          id: string
          reason: string | null
          role_key: string
          user_id: string | null
        }
        Insert: {
          case_id: string
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          hero_id?: string | null
          id?: string
          reason?: string | null
          role_key: string
          user_id?: string | null
        }
        Update: {
          case_id?: string
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          hero_id?: string | null
          id?: string
          reason?: string | null
          role_key?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anti_abuse_case_participants_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "anti_abuse_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anti_abuse_case_participants_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
        ]
      }
      anti_abuse_case_signals: {
        Row: {
          case_id: string
          created_at: string
          linked_by_user_id: string | null
          reason: string | null
          signal_id: string
        }
        Insert: {
          case_id: string
          created_at?: string
          linked_by_user_id?: string | null
          reason?: string | null
          signal_id: string
        }
        Update: {
          case_id?: string
          created_at?: string
          linked_by_user_id?: string | null
          reason?: string | null
          signal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "anti_abuse_case_signals_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "anti_abuse_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anti_abuse_case_signals_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "anti_abuse_signals"
            referencedColumns: ["id"]
          },
        ]
      }
      anti_abuse_cases: {
        Row: {
          assigned_to_user_id: string | null
          cancelled_at: string | null
          created_at: string
          grouping_key: string | null
          id: string
          last_signal_at: string | null
          no_sanction_reason: string | null
          opened_by_user_id: string | null
          operator_notes: string | null
          possible_recidivism: boolean
          primary_hero_id: string | null
          primary_user_id: string | null
          resolved_at: string | null
          resolved_by_user_id: string | null
          sanction_required: boolean | null
          server_id: string
          signal_count: number
          source: Database["public"]["Enums"]["anti_abuse_case_source"]
          status: Database["public"]["Enums"]["anti_abuse_case_status"]
          status_reason: string | null
          summary: string | null
          title: string
          updated_at: string
          verdict: Database["public"]["Enums"]["anti_abuse_case_verdict"] | null
          verdict_reason: string | null
        }
        Insert: {
          assigned_to_user_id?: string | null
          cancelled_at?: string | null
          created_at?: string
          grouping_key?: string | null
          id?: string
          last_signal_at?: string | null
          no_sanction_reason?: string | null
          opened_by_user_id?: string | null
          operator_notes?: string | null
          possible_recidivism?: boolean
          primary_hero_id?: string | null
          primary_user_id?: string | null
          resolved_at?: string | null
          resolved_by_user_id?: string | null
          sanction_required?: boolean | null
          server_id: string
          signal_count?: number
          source?: Database["public"]["Enums"]["anti_abuse_case_source"]
          status?: Database["public"]["Enums"]["anti_abuse_case_status"]
          status_reason?: string | null
          summary?: string | null
          title: string
          updated_at?: string
          verdict?:
            | Database["public"]["Enums"]["anti_abuse_case_verdict"]
            | null
          verdict_reason?: string | null
        }
        Update: {
          assigned_to_user_id?: string | null
          cancelled_at?: string | null
          created_at?: string
          grouping_key?: string | null
          id?: string
          last_signal_at?: string | null
          no_sanction_reason?: string | null
          opened_by_user_id?: string | null
          operator_notes?: string | null
          possible_recidivism?: boolean
          primary_hero_id?: string | null
          primary_user_id?: string | null
          resolved_at?: string | null
          resolved_by_user_id?: string | null
          sanction_required?: boolean | null
          server_id?: string
          signal_count?: number
          source?: Database["public"]["Enums"]["anti_abuse_case_source"]
          status?: Database["public"]["Enums"]["anti_abuse_case_status"]
          status_reason?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
          verdict?:
            | Database["public"]["Enums"]["anti_abuse_case_verdict"]
            | null
          verdict_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anti_abuse_cases_primary_hero_id_fkey"
            columns: ["primary_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anti_abuse_cases_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
        ]
      }
      anti_abuse_identity_observations: {
        Row: {
          capture_source_key: string
          created_at: string
          device_token_hash: string | null
          hero_id: string | null
          id: string
          ip_hash: string | null
          ip_prefix_hash: string | null
          metadata_json: Json
          observation_source_key: string
          observed_at: string
          retention_until: string
          server_id: string | null
          source_entity_id: string | null
          source_entity_type: string | null
          user_agent_hash: string | null
          user_id: string
        }
        Insert: {
          capture_source_key?: string
          created_at?: string
          device_token_hash?: string | null
          hero_id?: string | null
          id?: string
          ip_hash?: string | null
          ip_prefix_hash?: string | null
          metadata_json?: Json
          observation_source_key: string
          observed_at?: string
          retention_until?: string
          server_id?: string | null
          source_entity_id?: string | null
          source_entity_type?: string | null
          user_agent_hash?: string | null
          user_id: string
        }
        Update: {
          capture_source_key?: string
          created_at?: string
          device_token_hash?: string | null
          hero_id?: string | null
          id?: string
          ip_hash?: string | null
          ip_prefix_hash?: string | null
          metadata_json?: Json
          observation_source_key?: string
          observed_at?: string
          retention_until?: string
          server_id?: string | null
          source_entity_id?: string | null
          source_entity_type?: string | null
          user_agent_hash?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "anti_abuse_identity_observations_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anti_abuse_identity_observations_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
        ]
      }
      anti_abuse_sanction_items: {
        Row: {
          created_at: string
          created_by_user_id: string | null
          destination_hero_id: string | null
          id: string
          item_id: string
          operator_notes: string | null
          reason: string
          sanction_id: string
          source_hero_id: string | null
        }
        Insert: {
          created_at?: string
          created_by_user_id?: string | null
          destination_hero_id?: string | null
          id?: string
          item_id: string
          operator_notes?: string | null
          reason: string
          sanction_id: string
          source_hero_id?: string | null
        }
        Update: {
          created_at?: string
          created_by_user_id?: string | null
          destination_hero_id?: string | null
          id?: string
          item_id?: string
          operator_notes?: string | null
          reason?: string
          sanction_id?: string
          source_hero_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anti_abuse_sanction_items_destination_hero_id_fkey"
            columns: ["destination_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anti_abuse_sanction_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anti_abuse_sanction_items_sanction_id_fkey"
            columns: ["sanction_id"]
            isOneToOne: false
            referencedRelation: "anti_abuse_sanctions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anti_abuse_sanction_items_source_hero_id_fkey"
            columns: ["source_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
        ]
      }
      anti_abuse_sanction_types: {
        Row: {
          admin_description: string | null
          category: string
          created_at: string
          created_by: string | null
          description: string
          helper_text: string | null
          id: string
          is_active: boolean
          key: string
          label: string
          requires_character_points_amount: boolean
          requires_duration_days: boolean
          requires_item_selection: boolean
          requires_reason: boolean
          requires_source_hero: boolean
          requires_target_hero: boolean
          sort_order: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          admin_description?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          description: string
          helper_text?: string | null
          id?: string
          is_active?: boolean
          key: string
          label: string
          requires_character_points_amount?: boolean
          requires_duration_days?: boolean
          requires_item_selection?: boolean
          requires_reason?: boolean
          requires_source_hero?: boolean
          requires_target_hero?: boolean
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          admin_description?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          helper_text?: string | null
          id?: string
          is_active?: boolean
          key?: string
          label?: string
          requires_character_points_amount?: boolean
          requires_duration_days?: boolean
          requires_item_selection?: boolean
          requires_reason?: boolean
          requires_source_hero?: boolean
          requires_target_hero?: boolean
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      anti_abuse_sanctions: {
        Row: {
          amount_character_points: number | null
          applied_at: string | null
          cancelled_at: string | null
          case_id: string
          completed_at: string | null
          created_at: string
          destination_hero_id: string | null
          duration_days: number | null
          ends_at: string | null
          failed_at: string | null
          forgiven_at: string | null
          id: string
          imposed_by_user_id: string | null
          operator_notes: string | null
          reason: string
          sanction_type_key: string
          source_hero_id: string | null
          starts_at: string | null
          status: Database["public"]["Enums"]["anti_abuse_sanction_status"]
          status_reason: string | null
          target_hero_id: string | null
          target_user_id: string | null
          updated_at: string
        }
        Insert: {
          amount_character_points?: number | null
          applied_at?: string | null
          cancelled_at?: string | null
          case_id: string
          completed_at?: string | null
          created_at?: string
          destination_hero_id?: string | null
          duration_days?: number | null
          ends_at?: string | null
          failed_at?: string | null
          forgiven_at?: string | null
          id?: string
          imposed_by_user_id?: string | null
          operator_notes?: string | null
          reason: string
          sanction_type_key: string
          source_hero_id?: string | null
          starts_at?: string | null
          status?: Database["public"]["Enums"]["anti_abuse_sanction_status"]
          status_reason?: string | null
          target_hero_id?: string | null
          target_user_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_character_points?: number | null
          applied_at?: string | null
          cancelled_at?: string | null
          case_id?: string
          completed_at?: string | null
          created_at?: string
          destination_hero_id?: string | null
          duration_days?: number | null
          ends_at?: string | null
          failed_at?: string | null
          forgiven_at?: string | null
          id?: string
          imposed_by_user_id?: string | null
          operator_notes?: string | null
          reason?: string
          sanction_type_key?: string
          source_hero_id?: string | null
          starts_at?: string | null
          status?: Database["public"]["Enums"]["anti_abuse_sanction_status"]
          status_reason?: string | null
          target_hero_id?: string | null
          target_user_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "anti_abuse_sanctions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "anti_abuse_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anti_abuse_sanctions_destination_hero_id_fkey"
            columns: ["destination_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anti_abuse_sanctions_sanction_type_key_fkey"
            columns: ["sanction_type_key"]
            isOneToOne: false
            referencedRelation: "anti_abuse_sanction_types"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "anti_abuse_sanctions_source_hero_id_fkey"
            columns: ["source_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anti_abuse_sanctions_target_hero_id_fkey"
            columns: ["target_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
        ]
      }
      anti_abuse_signal_types: {
        Row: {
          admin_description: string | null
          category: string
          created_at: string
          created_by: string | null
          default_confidence: number
          default_score: number
          default_severity: Database["public"]["Enums"]["audit_severity"]
          description: string
          helper_text: string | null
          id: string
          is_active: boolean
          key: string
          label: string
          sort_order: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          admin_description?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          default_confidence?: number
          default_score?: number
          default_severity?: Database["public"]["Enums"]["audit_severity"]
          description: string
          helper_text?: string | null
          id?: string
          is_active?: boolean
          key: string
          label: string
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          admin_description?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          default_confidence?: number
          default_score?: number
          default_severity?: Database["public"]["Enums"]["audit_severity"]
          description?: string
          helper_text?: string | null
          id?: string
          is_active?: boolean
          key?: string
          label?: string
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      anti_abuse_signals: {
        Row: {
          actor_hero_id: string | null
          actor_user_id: string | null
          audit_log_id: string | null
          confidence: number
          created_at: string
          description: string
          dismissed_at: string | null
          dismissed_by_user_id: string | null
          dismissed_reason: string | null
          entity_id: string | null
          entity_type_key: string | null
          grouping_key: string | null
          id: string
          is_dismissed: boolean
          metadata_json: Json
          reason: string | null
          score: number
          server_id: string
          severity: Database["public"]["Enums"]["audit_severity"]
          signal_type_key: string
          target_hero_id: string | null
          target_user_id: string | null
          title: string
        }
        Insert: {
          actor_hero_id?: string | null
          actor_user_id?: string | null
          audit_log_id?: string | null
          confidence?: number
          created_at?: string
          description: string
          dismissed_at?: string | null
          dismissed_by_user_id?: string | null
          dismissed_reason?: string | null
          entity_id?: string | null
          entity_type_key?: string | null
          grouping_key?: string | null
          id?: string
          is_dismissed?: boolean
          metadata_json?: Json
          reason?: string | null
          score?: number
          server_id: string
          severity?: Database["public"]["Enums"]["audit_severity"]
          signal_type_key: string
          target_hero_id?: string | null
          target_user_id?: string | null
          title: string
        }
        Update: {
          actor_hero_id?: string | null
          actor_user_id?: string | null
          audit_log_id?: string | null
          confidence?: number
          created_at?: string
          description?: string
          dismissed_at?: string | null
          dismissed_by_user_id?: string | null
          dismissed_reason?: string | null
          entity_id?: string | null
          entity_type_key?: string | null
          grouping_key?: string | null
          id?: string
          is_dismissed?: boolean
          metadata_json?: Json
          reason?: string | null
          score?: number
          server_id?: string
          severity?: Database["public"]["Enums"]["audit_severity"]
          signal_type_key?: string
          target_hero_id?: string | null
          target_user_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "anti_abuse_signals_actor_hero_id_fkey"
            columns: ["actor_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anti_abuse_signals_audit_log_id_fkey"
            columns: ["audit_log_id"]
            isOneToOne: false
            referencedRelation: "audit_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anti_abuse_signals_entity_type_key_fkey"
            columns: ["entity_type_key"]
            isOneToOne: false
            referencedRelation: "audit_entity_types"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "anti_abuse_signals_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anti_abuse_signals_signal_type_key_fkey"
            columns: ["signal_type_key"]
            isOneToOne: false
            referencedRelation: "anti_abuse_signal_types"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "anti_abuse_signals_target_hero_id_fkey"
            columns: ["target_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_action_types: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          default_severity: Database["public"]["Enums"]["audit_severity"]
          description: string | null
          id: string
          is_active: boolean
          key: string
          label: string
          sort_order: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          default_severity?: Database["public"]["Enums"]["audit_severity"]
          description?: string | null
          id?: string
          is_active?: boolean
          key: string
          label: string
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          default_severity?: Database["public"]["Enums"]["audit_severity"]
          description?: string | null
          id?: string
          is_active?: boolean
          key?: string
          label?: string
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      audit_entity_types: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          key: string
          label: string
          sort_order: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          key: string
          label: string
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          key?: string
          label?: string
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action_type_key: string
          actor_hero_id: string | null
          actor_user_id: string | null
          created_at: string
          entity_id: string | null
          entity_type_key: string
          id: string
          metadata_json: Json
          new_value_json: Json | null
          old_value_json: Json | null
          reason: string | null
          request_id: string | null
          server_id: string | null
          severity: Database["public"]["Enums"]["audit_severity"]
          target_hero_id: string | null
          target_user_id: string | null
        }
        Insert: {
          action_type_key: string
          actor_hero_id?: string | null
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type_key: string
          id?: string
          metadata_json?: Json
          new_value_json?: Json | null
          old_value_json?: Json | null
          reason?: string | null
          request_id?: string | null
          server_id?: string | null
          severity?: Database["public"]["Enums"]["audit_severity"]
          target_hero_id?: string | null
          target_user_id?: string | null
        }
        Update: {
          action_type_key?: string
          actor_hero_id?: string | null
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type_key?: string
          id?: string
          metadata_json?: Json
          new_value_json?: Json | null
          old_value_json?: Json | null
          reason?: string | null
          request_id?: string | null
          server_id?: string | null
          severity?: Database["public"]["Enums"]["audit_severity"]
          target_hero_id?: string | null
          target_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_action_type_key_fkey"
            columns: ["action_type_key"]
            isOneToOne: false
            referencedRelation: "audit_action_types"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "audit_logs_actor_hero_id_fkey"
            columns: ["actor_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_entity_type_key_fkey"
            columns: ["entity_type_key"]
            isOneToOne: false
            referencedRelation: "audit_entity_types"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "audit_logs_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_target_hero_id_fkey"
            columns: ["target_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
        ]
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
      bonus_scopes: {
        Row: {
          category: string
          created_at: string
          description: string
          helper_text: string | null
          id: string
          is_active: boolean
          key: string
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description: string
          helper_text?: string | null
          id?: string
          is_active?: boolean
          key: string
          label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          helper_text?: string | null
          id?: string
          is_active?: boolean
          key?: string
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      bonus_target_categories: {
        Row: {
          created_at: string
          description: string
          id: string
          is_active: boolean
          key: string
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          key: string
          label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          key?: string
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      bonus_targets: {
        Row: {
          category_key: string
          created_at: string
          description: string
          helper_text: string | null
          id: string
          is_active: boolean
          is_stackable: boolean
          key: string
          label: string
          sort_order: number
          updated_at: string
          value_kind: string
        }
        Insert: {
          category_key: string
          created_at?: string
          description: string
          helper_text?: string | null
          id?: string
          is_active?: boolean
          is_stackable?: boolean
          key: string
          label: string
          sort_order?: number
          updated_at?: string
          value_kind?: string
        }
        Update: {
          category_key?: string
          created_at?: string
          description?: string
          helper_text?: string | null
          id?: string
          is_active?: boolean
          is_stackable?: boolean
          key?: string
          label?: string
          sort_order?: number
          updated_at?: string
          value_kind?: string
        }
        Relationships: [
          {
            foreignKeyName: "bonus_targets_category_key_fkey"
            columns: ["category_key"]
            isOneToOne: false
            referencedRelation: "bonus_target_categories"
            referencedColumns: ["key"]
          },
        ]
      }
      bonus_templates: {
        Row: {
          description: string | null
          formula_id: string | null
          formula_target_id: string | null
          id: string
          is_active: boolean
          key: string | null
          label: string | null
          level_interval: number | null
          params_json: Json
          scaling_stat_key: string | null
          scope_key: string
          sort_order: number
          target: string | null
          target_key: string
          type: Database["public"]["Enums"]["bonus_type"]
          type_key: string
          updated_at: string
        }
        Insert: {
          description?: string | null
          formula_id?: string | null
          formula_target_id?: string | null
          id?: string
          is_active?: boolean
          key?: string | null
          label?: string | null
          level_interval?: number | null
          params_json?: Json
          scaling_stat_key?: string | null
          scope_key: string
          sort_order?: number
          target?: string | null
          target_key: string
          type?: Database["public"]["Enums"]["bonus_type"]
          type_key: string
          updated_at?: string
        }
        Update: {
          description?: string | null
          formula_id?: string | null
          formula_target_id?: string | null
          id?: string
          is_active?: boolean
          key?: string | null
          label?: string | null
          level_interval?: number | null
          params_json?: Json
          scaling_stat_key?: string | null
          scope_key?: string
          sort_order?: number
          target?: string | null
          target_key?: string
          type?: Database["public"]["Enums"]["bonus_type"]
          type_key?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bonus_templates_formula_id_fkey"
            columns: ["formula_id"]
            isOneToOne: false
            referencedRelation: "balance_formulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bonus_templates_formula_target_id_fkey"
            columns: ["formula_target_id"]
            isOneToOne: false
            referencedRelation: "balance_formula_targets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bonus_templates_scaling_stat_key_fkey"
            columns: ["scaling_stat_key"]
            isOneToOne: false
            referencedRelation: "stats"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "bonus_templates_scope_key_fkey"
            columns: ["scope_key"]
            isOneToOne: false
            referencedRelation: "bonus_scopes"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "bonus_templates_target_key_fkey"
            columns: ["target_key"]
            isOneToOne: false
            referencedRelation: "bonus_targets"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "bonus_templates_type_key_fkey"
            columns: ["type_key"]
            isOneToOne: false
            referencedRelation: "bonus_types"
            referencedColumns: ["key"]
          },
        ]
      }
      bonus_types: {
        Row: {
          admin_description: string | null
          category: string
          created_at: string
          description: string
          helper_text: string | null
          id: string
          is_active: boolean
          key: string
          label: string
          requires_feature_target: boolean
          requires_formula: boolean
          requires_level_interval: boolean
          requires_resource_type: boolean
          requires_scaling_stat: boolean
          requires_value: boolean
          sort_order: number
          updated_at: string
          value_kind: string
        }
        Insert: {
          admin_description?: string | null
          category?: string
          created_at?: string
          description: string
          helper_text?: string | null
          id?: string
          is_active?: boolean
          key: string
          label: string
          requires_feature_target?: boolean
          requires_formula?: boolean
          requires_level_interval?: boolean
          requires_resource_type?: boolean
          requires_scaling_stat?: boolean
          requires_value?: boolean
          sort_order?: number
          updated_at?: string
          value_kind?: string
        }
        Update: {
          admin_description?: string | null
          category?: string
          created_at?: string
          description?: string
          helper_text?: string | null
          id?: string
          is_active?: boolean
          key?: string
          label?: string
          requires_feature_target?: boolean
          requires_formula?: boolean
          requires_level_interval?: boolean
          requires_resource_type?: boolean
          requires_scaling_stat?: boolean
          requires_value?: boolean
          sort_order?: number
          updated_at?: string
          value_kind?: string
        }
        Relationships: []
      }
      building_bonuses: {
        Row: {
          building_id: string
          id: string
          template_id: string
          value: number
        }
        Insert: {
          building_id: string
          id?: string
          template_id: string
          value: number
        }
        Update: {
          building_id?: string
          id?: string
          template_id?: string
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
      building_district_level_caps: {
        Row: {
          building_id: string
          created_at: string
          description: string | null
          district_code: string
          id: string
          max_level: number
          updated_at: string
        }
        Insert: {
          building_id: string
          created_at?: string
          description?: string | null
          district_code: string
          id?: string
          max_level?: number
          updated_at?: string
        }
        Update: {
          building_id?: string
          created_at?: string
          description?: string | null
          district_code?: string
          id?: string
          max_level?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "building_district_level_caps_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "building_district_level_caps_district_code_fkey"
            columns: ["district_code"]
            isOneToOne: false
            referencedRelation: "estate_districts"
            referencedColumns: ["code"]
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
          base_build_time_seconds: number
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
          sort_order: number
          starting_level: number
        }
        Insert: {
          base_build_time_seconds?: number
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
          sort_order?: number
          starting_level?: number
        }
        Update: {
          base_build_time_seconds?: number
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
          sort_order?: number
          starting_level?: number
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
      character_point_ledger: {
        Row: {
          amount_delta: number
          balance_after: number
          created_at: string
          created_by: string | null
          description: string | null
          hero_id: string
          id: string
          reason: Database["public"]["Enums"]["character_point_ledger_reason"]
          related_entity_id: string | null
          related_entity_type: string | null
          server_id: string
        }
        Insert: {
          amount_delta: number
          balance_after: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          hero_id: string
          id?: string
          reason: Database["public"]["Enums"]["character_point_ledger_reason"]
          related_entity_id?: string | null
          related_entity_type?: string | null
          server_id: string
        }
        Update: {
          amount_delta?: number
          balance_after?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          hero_id?: string
          id?: string
          reason?: Database["public"]["Enums"]["character_point_ledger_reason"]
          related_entity_id?: string | null
          related_entity_type?: string | null
          server_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "character_point_ledger_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_point_ledger_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
        ]
      }
      character_point_locks: {
        Row: {
          amount: number
          auction_bid_id: string | null
          auction_listing_id: string | null
          consumed_at: string | null
          created_at: string
          description: string | null
          expired_at: string | null
          expires_at: string | null
          failed_at: string | null
          hero_id: string
          id: string
          reason: Database["public"]["Enums"]["character_point_lock_reason"]
          released_at: string | null
          server_id: string
          status: Database["public"]["Enums"]["character_point_lock_status"]
          status_reason: string | null
          trade_offer_id: string | null
        }
        Insert: {
          amount: number
          auction_bid_id?: string | null
          auction_listing_id?: string | null
          consumed_at?: string | null
          created_at?: string
          description?: string | null
          expired_at?: string | null
          expires_at?: string | null
          failed_at?: string | null
          hero_id: string
          id?: string
          reason: Database["public"]["Enums"]["character_point_lock_reason"]
          released_at?: string | null
          server_id: string
          status?: Database["public"]["Enums"]["character_point_lock_status"]
          status_reason?: string | null
          trade_offer_id?: string | null
        }
        Update: {
          amount?: number
          auction_bid_id?: string | null
          auction_listing_id?: string | null
          consumed_at?: string | null
          created_at?: string
          description?: string | null
          expired_at?: string | null
          expires_at?: string | null
          failed_at?: string | null
          hero_id?: string
          id?: string
          reason?: Database["public"]["Enums"]["character_point_lock_reason"]
          released_at?: string | null
          server_id?: string
          status?: Database["public"]["Enums"]["character_point_lock_status"]
          status_reason?: string | null
          trade_offer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "character_point_locks_auction_bid_id_fkey"
            columns: ["auction_bid_id"]
            isOneToOne: false
            referencedRelation: "player_auction_bids"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_point_locks_auction_listing_id_fkey"
            columns: ["auction_listing_id"]
            isOneToOne: false
            referencedRelation: "player_auction_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_point_locks_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_point_locks_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_point_locks_trade_offer_id_fkey"
            columns: ["trade_offer_id"]
            isOneToOne: false
            referencedRelation: "player_trade_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      character_point_penalties: {
        Row: {
          applied_at: string | null
          cancelled_at: string | null
          case_id: string
          completed_at: string | null
          created_at: string
          created_by_user_id: string | null
          failed_at: string | null
          forgiven_at: string | null
          hero_id: string
          id: string
          operator_notes: string | null
          paid_amount: number
          reason: string
          remaining_amount: number
          sanction_id: string
          server_id: string
          status: Database["public"]["Enums"]["anti_abuse_sanction_status"]
          status_reason: string | null
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          applied_at?: string | null
          cancelled_at?: string | null
          case_id: string
          completed_at?: string | null
          created_at?: string
          created_by_user_id?: string | null
          failed_at?: string | null
          forgiven_at?: string | null
          hero_id: string
          id?: string
          operator_notes?: string | null
          paid_amount?: number
          reason: string
          remaining_amount: number
          sanction_id: string
          server_id: string
          status?: Database["public"]["Enums"]["anti_abuse_sanction_status"]
          status_reason?: string | null
          total_amount: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          applied_at?: string | null
          cancelled_at?: string | null
          case_id?: string
          completed_at?: string | null
          created_at?: string
          created_by_user_id?: string | null
          failed_at?: string | null
          forgiven_at?: string | null
          hero_id?: string
          id?: string
          operator_notes?: string | null
          paid_amount?: number
          reason?: string
          remaining_amount?: number
          sanction_id?: string
          server_id?: string
          status?: Database["public"]["Enums"]["anti_abuse_sanction_status"]
          status_reason?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "character_point_penalties_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "anti_abuse_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_point_penalties_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_point_penalties_sanction_id_fkey"
            columns: ["sanction_id"]
            isOneToOne: true
            referencedRelation: "anti_abuse_sanctions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_point_penalties_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
        ]
      }
      combat_attack_source_kind_definitions: {
        Row: {
          admin_description: string | null
          created_at: string
          description: string
          helper_text: string | null
          is_active: boolean
          key: string
          label: string
          metadata_json: Json
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          description: string
          helper_text?: string | null
          is_active?: boolean
          key: string
          label: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          description?: string
          helper_text?: string | null
          is_active?: boolean
          key?: string
          label?: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      combat_candidate_kind_definitions: {
        Row: {
          admin_description: string | null
          created_at: string
          description: string
          helper_text: string | null
          is_active: boolean
          key: string
          label: string
          metadata_json: Json
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          description: string
          helper_text?: string | null
          is_active?: boolean
          key: string
          label: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          description?: string
          helper_text?: string | null
          is_active?: boolean
          key?: string
          label?: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      combat_live_action_requests: {
        Row: {
          actor_hero_id: string | null
          actor_participant_id: string | null
          created_at: string
          id: string
          request_id: string
          request_kind: string
          response_json: Json
          session_id: string
          timing_input_json: Json
        }
        Insert: {
          actor_hero_id?: string | null
          actor_participant_id?: string | null
          created_at?: string
          id?: string
          request_id: string
          request_kind?: string
          response_json?: Json
          session_id: string
          timing_input_json?: Json
        }
        Update: {
          actor_hero_id?: string | null
          actor_participant_id?: string | null
          created_at?: string
          id?: string
          request_id?: string
          request_kind?: string
          response_json?: Json
          session_id?: string
          timing_input_json?: Json
        }
        Relationships: [
          {
            foreignKeyName: "combat_live_action_requests_actor_hero_id_fkey"
            columns: ["actor_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combat_live_action_requests_actor_participant_id_fkey"
            columns: ["actor_participant_id"]
            isOneToOne: false
            referencedRelation: "combat_live_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combat_live_action_requests_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "combat_live_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      combat_live_event_kinds: {
        Row: {
          created_at: string
          description: string | null
          is_active: boolean
          key: string
          label: string
          metadata_json: Json
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          is_active?: boolean
          key: string
          label: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          is_active?: boolean
          key?: string
          label?: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      combat_live_events: {
        Row: {
          action_index: number | null
          actor_participant_id: string | null
          actor_side: Database["public"]["Enums"]["combat_side"] | null
          actor_streak_after: number | null
          actor_streak_before: number | null
          attack_source_kind:
            | Database["public"]["Enums"]["combat_attack_source_kind"]
            | null
          attack_source_label: string | null
          created_at: string
          critical: boolean | null
          critical_damage: number | null
          display_text: string | null
          evaded: boolean | null
          event_index: number
          event_kind: string
          final_damage: number | null
          id: string
          metadata_json: Json
          rolled_damage: number | null
          round_number: number
          server_id: string
          session_id: string
          target_health_after: number | null
          target_health_before: number | null
          target_participant_id: string | null
          target_side: Database["public"]["Enums"]["combat_side"] | null
          timing_hit: boolean | null
        }
        Insert: {
          action_index?: number | null
          actor_participant_id?: string | null
          actor_side?: Database["public"]["Enums"]["combat_side"] | null
          actor_streak_after?: number | null
          actor_streak_before?: number | null
          attack_source_kind?:
            | Database["public"]["Enums"]["combat_attack_source_kind"]
            | null
          attack_source_label?: string | null
          created_at?: string
          critical?: boolean | null
          critical_damage?: number | null
          display_text?: string | null
          evaded?: boolean | null
          event_index: number
          event_kind: string
          final_damage?: number | null
          id?: string
          metadata_json?: Json
          rolled_damage?: number | null
          round_number: number
          server_id: string
          session_id: string
          target_health_after?: number | null
          target_health_before?: number | null
          target_participant_id?: string | null
          target_side?: Database["public"]["Enums"]["combat_side"] | null
          timing_hit?: boolean | null
        }
        Update: {
          action_index?: number | null
          actor_participant_id?: string | null
          actor_side?: Database["public"]["Enums"]["combat_side"] | null
          actor_streak_after?: number | null
          actor_streak_before?: number | null
          attack_source_kind?:
            | Database["public"]["Enums"]["combat_attack_source_kind"]
            | null
          attack_source_label?: string | null
          created_at?: string
          critical?: boolean | null
          critical_damage?: number | null
          display_text?: string | null
          evaded?: boolean | null
          event_index?: number
          event_kind?: string
          final_damage?: number | null
          id?: string
          metadata_json?: Json
          rolled_damage?: number | null
          round_number?: number
          server_id?: string
          session_id?: string
          target_health_after?: number | null
          target_health_before?: number | null
          target_participant_id?: string | null
          target_side?: Database["public"]["Enums"]["combat_side"] | null
          timing_hit?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "combat_live_events_actor_participant_id_fkey"
            columns: ["actor_participant_id"]
            isOneToOne: false
            referencedRelation: "combat_live_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combat_live_events_event_kind_fkey"
            columns: ["event_kind"]
            isOneToOne: false
            referencedRelation: "combat_live_event_kinds"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "combat_live_events_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combat_live_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "combat_live_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combat_live_events_target_participant_id_fkey"
            columns: ["target_participant_id"]
            isOneToOne: false
            referencedRelation: "combat_live_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      combat_live_participant_statuses: {
        Row: {
          created_at: string
          description: string | null
          is_active: boolean
          key: string
          label: string
          metadata_json: Json
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          is_active?: boolean
          key: string
          label: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          is_active?: boolean
          key?: string
          label?: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      combat_live_participants: {
        Row: {
          actor_kind: Database["public"]["Enums"]["combat_participant_kind"]
          created_at: string
          display_name: string
          health_current: number
          health_max: number
          hero_id: string | null
          id: string
          is_player_controlled: boolean
          metadata_json: Json
          opponent_definition_id: string | null
          participant_key: string
          requires_manual_input: boolean
          server_id: string
          session_id: string
          side: Database["public"]["Enums"]["combat_side"]
          snapshot_json: Json
          sort_order: number
          status_key: string
          streak_current: number
          updated_at: string
        }
        Insert: {
          actor_kind: Database["public"]["Enums"]["combat_participant_kind"]
          created_at?: string
          display_name: string
          health_current: number
          health_max: number
          hero_id?: string | null
          id?: string
          is_player_controlled?: boolean
          metadata_json?: Json
          opponent_definition_id?: string | null
          participant_key: string
          requires_manual_input?: boolean
          server_id: string
          session_id: string
          side: Database["public"]["Enums"]["combat_side"]
          snapshot_json?: Json
          sort_order?: number
          status_key?: string
          streak_current?: number
          updated_at?: string
        }
        Update: {
          actor_kind?: Database["public"]["Enums"]["combat_participant_kind"]
          created_at?: string
          display_name?: string
          health_current?: number
          health_max?: number
          hero_id?: string | null
          id?: string
          is_player_controlled?: boolean
          metadata_json?: Json
          opponent_definition_id?: string | null
          participant_key?: string
          requires_manual_input?: boolean
          server_id?: string
          session_id?: string
          side?: Database["public"]["Enums"]["combat_side"]
          snapshot_json?: Json
          sort_order?: number
          status_key?: string
          streak_current?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "combat_live_participants_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combat_live_participants_opponent_definition_id_fkey"
            columns: ["opponent_definition_id"]
            isOneToOne: false
            referencedRelation: "combat_opponent_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combat_live_participants_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combat_live_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "combat_live_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combat_live_participants_status_key_fkey"
            columns: ["status_key"]
            isOneToOne: false
            referencedRelation: "combat_live_participant_statuses"
            referencedColumns: ["key"]
          },
        ]
      }
      combat_live_session_statuses: {
        Row: {
          created_at: string
          description: string | null
          is_active: boolean
          key: string
          label: string
          metadata_json: Json
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          is_active?: boolean
          key: string
          label: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          is_active?: boolean
          key?: string
          label?: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      combat_live_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          current_action_index: number
          current_actor_participant_id: string | null
          current_round_number: number
          current_timing_manifest_json: Json
          event_count: number
          final_combat_result_id: string | null
          id: string
          metadata_json: Json
          round_order_json: Json
          server_id: string
          source_entity_id: string
          source_entity_type: string
          source_type: Database["public"]["Enums"]["combat_source_type"]
          status_key: string
          turn_limit: number
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_action_index?: number
          current_actor_participant_id?: string | null
          current_round_number?: number
          current_timing_manifest_json?: Json
          event_count?: number
          final_combat_result_id?: string | null
          id?: string
          metadata_json?: Json
          round_order_json?: Json
          server_id: string
          source_entity_id: string
          source_entity_type: string
          source_type: Database["public"]["Enums"]["combat_source_type"]
          status_key?: string
          turn_limit?: number
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_action_index?: number
          current_actor_participant_id?: string | null
          current_round_number?: number
          current_timing_manifest_json?: Json
          event_count?: number
          final_combat_result_id?: string | null
          id?: string
          metadata_json?: Json
          round_order_json?: Json
          server_id?: string
          source_entity_id?: string
          source_entity_type?: string
          source_type?: Database["public"]["Enums"]["combat_source_type"]
          status_key?: string
          turn_limit?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "combat_live_sessions_current_actor_participant_fkey"
            columns: ["current_actor_participant_id"]
            isOneToOne: false
            referencedRelation: "combat_live_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combat_live_sessions_final_combat_result_id_fkey"
            columns: ["final_combat_result_id"]
            isOneToOne: false
            referencedRelation: "combat_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combat_live_sessions_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combat_live_sessions_status_key_fkey"
            columns: ["status_key"]
            isOneToOne: false
            referencedRelation: "combat_live_session_statuses"
            referencedColumns: ["key"]
          },
        ]
      }
      combat_opponent_attack_sources: {
        Row: {
          admin_description: string | null
          attack_count: number
          created_at: string
          critical_chance: number
          critical_damage: number
          description: string | null
          helper_text: string | null
          id: string
          is_active: boolean
          key: string
          label: string
          max_damage: number
          max_opponent_level: number | null
          min_damage: number
          min_opponent_level: number | null
          opponent_definition_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          attack_count?: number
          created_at?: string
          critical_chance?: number
          critical_damage?: number
          description?: string | null
          helper_text?: string | null
          id?: string
          is_active?: boolean
          key: string
          label: string
          max_damage?: number
          max_opponent_level?: number | null
          min_damage?: number
          min_opponent_level?: number | null
          opponent_definition_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          attack_count?: number
          created_at?: string
          critical_chance?: number
          critical_damage?: number
          description?: string | null
          helper_text?: string | null
          id?: string
          is_active?: boolean
          key?: string
          label?: string
          max_damage?: number
          max_opponent_level?: number | null
          min_damage?: number
          min_opponent_level?: number | null
          opponent_definition_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "combat_opponent_attack_sources_opponent_definition_id_fkey"
            columns: ["opponent_definition_id"]
            isOneToOne: false
            referencedRelation: "combat_opponent_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      combat_opponent_definitions: {
        Row: {
          admin_description: string | null
          created_at: string
          default_scaling_formula_id: string | null
          description: string | null
          equipment_mode: Database["public"]["Enums"]["combat_opponent_equipment_mode"]
          family_key: string
          helper_text: string | null
          id: string
          is_active: boolean
          key: string
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          default_scaling_formula_id?: string | null
          description?: string | null
          equipment_mode?: Database["public"]["Enums"]["combat_opponent_equipment_mode"]
          family_key: string
          helper_text?: string | null
          id?: string
          is_active?: boolean
          key: string
          label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          default_scaling_formula_id?: string | null
          description?: string | null
          equipment_mode?: Database["public"]["Enums"]["combat_opponent_equipment_mode"]
          family_key?: string
          helper_text?: string | null
          id?: string
          is_active?: boolean
          key?: string
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "combat_opponent_definitions_default_scaling_formula_id_fkey"
            columns: ["default_scaling_formula_id"]
            isOneToOne: false
            referencedRelation: "balance_formulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combat_opponent_definitions_family_key_fkey"
            columns: ["family_key"]
            isOneToOne: false
            referencedRelation: "combat_opponent_families"
            referencedColumns: ["key"]
          },
        ]
      }
      combat_opponent_equipment_entries: {
        Row: {
          created_at: string
          entry_mode: Database["public"]["Enums"]["combat_opponent_equipment_mode"]
          generated_bucket_profile_id: string | null
          generated_max_quality_key: string | null
          id: string
          is_active: boolean
          manual_base_id: string | null
          manual_prefix_affix_id: string | null
          manual_quality_key: string | null
          manual_suffix_affix_id: string | null
          max_opponent_level: number | null
          min_opponent_level: number | null
          opponent_definition_id: string
          slot_key: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          entry_mode: Database["public"]["Enums"]["combat_opponent_equipment_mode"]
          generated_bucket_profile_id?: string | null
          generated_max_quality_key?: string | null
          id?: string
          is_active?: boolean
          manual_base_id?: string | null
          manual_prefix_affix_id?: string | null
          manual_quality_key?: string | null
          manual_suffix_affix_id?: string | null
          max_opponent_level?: number | null
          min_opponent_level?: number | null
          opponent_definition_id: string
          slot_key: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          entry_mode?: Database["public"]["Enums"]["combat_opponent_equipment_mode"]
          generated_bucket_profile_id?: string | null
          generated_max_quality_key?: string | null
          id?: string
          is_active?: boolean
          manual_base_id?: string | null
          manual_prefix_affix_id?: string | null
          manual_quality_key?: string | null
          manual_suffix_affix_id?: string | null
          max_opponent_level?: number | null
          min_opponent_level?: number | null
          opponent_definition_id?: string
          slot_key?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "combat_opponent_equipment_entr_generated_bucket_profile_id_fkey"
            columns: ["generated_bucket_profile_id"]
            isOneToOne: false
            referencedRelation: "item_generation_bucket_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combat_opponent_equipment_entrie_generated_max_quality_key_fkey"
            columns: ["generated_max_quality_key"]
            isOneToOne: false
            referencedRelation: "item_generation_qualities"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "combat_opponent_equipment_entries_manual_base_id_fkey"
            columns: ["manual_base_id"]
            isOneToOne: false
            referencedRelation: "item_generation_bases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combat_opponent_equipment_entries_manual_prefix_affix_id_fkey"
            columns: ["manual_prefix_affix_id"]
            isOneToOne: false
            referencedRelation: "item_generation_affixes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combat_opponent_equipment_entries_manual_quality_key_fkey"
            columns: ["manual_quality_key"]
            isOneToOne: false
            referencedRelation: "item_generation_qualities"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "combat_opponent_equipment_entries_manual_suffix_affix_id_fkey"
            columns: ["manual_suffix_affix_id"]
            isOneToOne: false
            referencedRelation: "item_generation_affixes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combat_opponent_equipment_entries_opponent_definition_id_fkey"
            columns: ["opponent_definition_id"]
            isOneToOne: false
            referencedRelation: "combat_opponent_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combat_opponent_equipment_entries_slot_key_fkey"
            columns: ["slot_key"]
            isOneToOne: false
            referencedRelation: "equipment_slot_definitions"
            referencedColumns: ["key"]
          },
        ]
      }
      combat_opponent_equipment_mode_definitions: {
        Row: {
          admin_description: string | null
          created_at: string
          description: string
          helper_text: string | null
          is_active: boolean
          key: Database["public"]["Enums"]["combat_opponent_equipment_mode"]
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          description: string
          helper_text?: string | null
          is_active?: boolean
          key: Database["public"]["Enums"]["combat_opponent_equipment_mode"]
          label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          description?: string
          helper_text?: string | null
          is_active?: boolean
          key?: Database["public"]["Enums"]["combat_opponent_equipment_mode"]
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      combat_opponent_families: {
        Row: {
          admin_description: string | null
          created_at: string
          description: string | null
          helper_text: string | null
          is_active: boolean
          key: string
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          description?: string | null
          helper_text?: string | null
          is_active?: boolean
          key: string
          label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          description?: string | null
          helper_text?: string | null
          is_active?: boolean
          key?: string
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      combat_opponent_stat_values: {
        Row: {
          base_value: number
          created_at: string
          id: string
          opponent_definition_id: string
          sort_order: number
          stat_key: string
          updated_at: string
        }
        Insert: {
          base_value: number
          created_at?: string
          id?: string
          opponent_definition_id: string
          sort_order?: number
          stat_key: string
          updated_at?: string
        }
        Update: {
          base_value?: number
          created_at?: string
          id?: string
          opponent_definition_id?: string
          sort_order?: number
          stat_key?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "combat_opponent_stat_values_opponent_definition_id_fkey"
            columns: ["opponent_definition_id"]
            isOneToOne: false
            referencedRelation: "combat_opponent_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combat_opponent_stat_values_stat_key_fkey"
            columns: ["stat_key"]
            isOneToOne: false
            referencedRelation: "stats"
            referencedColumns: ["key"]
          },
        ]
      }
      combat_outcome_definitions: {
        Row: {
          admin_description: string | null
          created_at: string
          description: string
          helper_text: string | null
          is_active: boolean
          key: string
          label: string
          metadata_json: Json
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          description: string
          helper_text?: string | null
          is_active?: boolean
          key: string
          label: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          description?: string
          helper_text?: string | null
          is_active?: boolean
          key?: string
          label?: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      combat_participant_kind_definitions: {
        Row: {
          admin_description: string | null
          created_at: string
          description: string
          helper_text: string | null
          is_active: boolean
          key: string
          label: string
          metadata_json: Json
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          description: string
          helper_text?: string | null
          is_active?: boolean
          key: string
          label: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          description?: string
          helper_text?: string | null
          is_active?: boolean
          key?: string
          label?: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      combat_result_attacks: {
        Row: {
          actor_side: Database["public"]["Enums"]["combat_side"]
          attack_order: number
          attack_slot_index: number
          attack_source_kind: Database["public"]["Enums"]["combat_attack_source_kind"]
          attack_source_label: string
          combat_result_id: string
          created_at: string
          critical: boolean
          critical_damage: number | null
          display_text: string
          evaded: boolean
          final_damage: number
          id: string
          opponent_attack_source_id: string | null
          rolled_damage: number | null
          source_base_id: string | null
          source_item_id: string | null
          source_prefix_affix_id: string | null
          source_quality_key: string | null
          source_suffix_affix_id: string | null
          target_health_after: number
          target_health_before: number
          target_side: Database["public"]["Enums"]["combat_side"]
          timing_hit: boolean | null
          turn_number: number
        }
        Insert: {
          actor_side: Database["public"]["Enums"]["combat_side"]
          attack_order: number
          attack_slot_index: number
          attack_source_kind: Database["public"]["Enums"]["combat_attack_source_kind"]
          attack_source_label: string
          combat_result_id: string
          created_at?: string
          critical?: boolean
          critical_damage?: number | null
          display_text: string
          evaded?: boolean
          final_damage?: number
          id?: string
          opponent_attack_source_id?: string | null
          rolled_damage?: number | null
          source_base_id?: string | null
          source_item_id?: string | null
          source_prefix_affix_id?: string | null
          source_quality_key?: string | null
          source_suffix_affix_id?: string | null
          target_health_after: number
          target_health_before: number
          target_side: Database["public"]["Enums"]["combat_side"]
          timing_hit?: boolean | null
          turn_number: number
        }
        Update: {
          actor_side?: Database["public"]["Enums"]["combat_side"]
          attack_order?: number
          attack_slot_index?: number
          attack_source_kind?: Database["public"]["Enums"]["combat_attack_source_kind"]
          attack_source_label?: string
          combat_result_id?: string
          created_at?: string
          critical?: boolean
          critical_damage?: number | null
          display_text?: string
          evaded?: boolean
          final_damage?: number
          id?: string
          opponent_attack_source_id?: string | null
          rolled_damage?: number | null
          source_base_id?: string | null
          source_item_id?: string | null
          source_prefix_affix_id?: string | null
          source_quality_key?: string | null
          source_suffix_affix_id?: string | null
          target_health_after?: number
          target_health_before?: number
          target_side?: Database["public"]["Enums"]["combat_side"]
          timing_hit?: boolean | null
          turn_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "combat_result_attacks_combat_result_id_fkey"
            columns: ["combat_result_id"]
            isOneToOne: false
            referencedRelation: "combat_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combat_result_attacks_opponent_attack_source_id_fkey"
            columns: ["opponent_attack_source_id"]
            isOneToOne: false
            referencedRelation: "combat_opponent_attack_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combat_result_attacks_source_base_id_fkey"
            columns: ["source_base_id"]
            isOneToOne: false
            referencedRelation: "item_generation_bases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combat_result_attacks_source_prefix_affix_id_fkey"
            columns: ["source_prefix_affix_id"]
            isOneToOne: false
            referencedRelation: "item_generation_affixes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combat_result_attacks_source_quality_key_fkey"
            columns: ["source_quality_key"]
            isOneToOne: false
            referencedRelation: "item_generation_qualities"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "combat_result_attacks_source_suffix_affix_id_fkey"
            columns: ["source_suffix_affix_id"]
            isOneToOne: false
            referencedRelation: "item_generation_affixes"
            referencedColumns: ["id"]
          },
        ]
      }
      combat_result_participant_stats: {
        Row: {
          created_at: string
          id: string
          participant_id: string
          stat_key: string
          stat_value: number
        }
        Insert: {
          created_at?: string
          id?: string
          participant_id: string
          stat_key: string
          stat_value: number
        }
        Update: {
          created_at?: string
          id?: string
          participant_id?: string
          stat_key?: string
          stat_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "combat_result_participant_stats_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "combat_result_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combat_result_participant_stats_stat_key_fkey"
            columns: ["stat_key"]
            isOneToOne: false
            referencedRelation: "stats"
            referencedColumns: ["key"]
          },
        ]
      }
      combat_result_participants: {
        Row: {
          combat_result_id: string
          created_at: string
          critical_chance: number
          critical_damage: number
          defense: number
          display_name: string
          evasion_chance: number
          health_end: number
          health_start: number
          hero_id: string | null
          id: string
          level: number
          luck: number
          max_damage: number
          max_health: number
          min_damage: number
          opponent_definition_id: string | null
          participant_kind: Database["public"]["Enums"]["combat_participant_kind"]
          side: Database["public"]["Enums"]["combat_side"]
        }
        Insert: {
          combat_result_id: string
          created_at?: string
          critical_chance: number
          critical_damage: number
          defense: number
          display_name: string
          evasion_chance: number
          health_end: number
          health_start: number
          hero_id?: string | null
          id?: string
          level: number
          luck: number
          max_damage: number
          max_health: number
          min_damage: number
          opponent_definition_id?: string | null
          participant_kind: Database["public"]["Enums"]["combat_participant_kind"]
          side: Database["public"]["Enums"]["combat_side"]
        }
        Update: {
          combat_result_id?: string
          created_at?: string
          critical_chance?: number
          critical_damage?: number
          defense?: number
          display_name?: string
          evasion_chance?: number
          health_end?: number
          health_start?: number
          hero_id?: string | null
          id?: string
          level?: number
          luck?: number
          max_damage?: number
          max_health?: number
          min_damage?: number
          opponent_definition_id?: string | null
          participant_kind?: Database["public"]["Enums"]["combat_participant_kind"]
          side?: Database["public"]["Enums"]["combat_side"]
        }
        Relationships: [
          {
            foreignKeyName: "combat_result_participants_combat_result_id_fkey"
            columns: ["combat_result_id"]
            isOneToOne: false
            referencedRelation: "combat_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combat_result_participants_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combat_result_participants_opponent_definition_id_fkey"
            columns: ["opponent_definition_id"]
            isOneToOne: false
            referencedRelation: "combat_opponent_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      combat_results: {
        Row: {
          completed_at: string
          created_at: string
          defender_hero_id: string | null
          id: string
          initiator_hero_id: string | null
          loser_side: Database["public"]["Enums"]["combat_side"] | null
          outcome: Database["public"]["Enums"]["combat_outcome"]
          server_id: string
          source_entity_id: string | null
          source_type: Database["public"]["Enums"]["combat_source_type"]
          started_at: string | null
          turns_completed: number
          winner_side: Database["public"]["Enums"]["combat_side"] | null
        }
        Insert: {
          completed_at?: string
          created_at?: string
          defender_hero_id?: string | null
          id?: string
          initiator_hero_id?: string | null
          loser_side?: Database["public"]["Enums"]["combat_side"] | null
          outcome: Database["public"]["Enums"]["combat_outcome"]
          server_id: string
          source_entity_id?: string | null
          source_type: Database["public"]["Enums"]["combat_source_type"]
          started_at?: string | null
          turns_completed: number
          winner_side?: Database["public"]["Enums"]["combat_side"] | null
        }
        Update: {
          completed_at?: string
          created_at?: string
          defender_hero_id?: string | null
          id?: string
          initiator_hero_id?: string | null
          loser_side?: Database["public"]["Enums"]["combat_side"] | null
          outcome?: Database["public"]["Enums"]["combat_outcome"]
          server_id?: string
          source_entity_id?: string | null
          source_type?: Database["public"]["Enums"]["combat_source_type"]
          started_at?: string | null
          turns_completed?: number
          winner_side?: Database["public"]["Enums"]["combat_side"] | null
        }
        Relationships: [
          {
            foreignKeyName: "combat_results_defender_hero_id_fkey"
            columns: ["defender_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combat_results_initiator_hero_id_fkey"
            columns: ["initiator_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combat_results_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
        ]
      }
      combat_side_definitions: {
        Row: {
          admin_description: string | null
          created_at: string
          description: string
          helper_text: string | null
          is_active: boolean
          key: string
          label: string
          metadata_json: Json
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          description: string
          helper_text?: string | null
          is_active?: boolean
          key: string
          label: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          description?: string
          helper_text?: string | null
          is_active?: boolean
          key?: string
          label?: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      combat_source_type_definitions: {
        Row: {
          admin_description: string | null
          created_at: string
          description: string
          helper_text: string | null
          is_active: boolean
          key: string
          label: string
          metadata_json: Json
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          description: string
          helper_text?: string | null
          is_active?: boolean
          key: string
          label: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          description?: string
          helper_text?: string | null
          is_active?: boolean
          key?: string
          label?: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      config_change_entries: {
        Row: {
          change_kind: Database["public"]["Enums"]["config_change_kind"]
          change_set_id: string
          config_definition_id: string | null
          created_at: string
          entity_id: string | null
          entity_type:
            | Database["public"]["Enums"]["config_managed_entity_type"]
            | null
          field_path: string | null
          id: string
          metadata_json: Json
          new_scope:
            | Database["public"]["Enums"]["config_governance_scope"]
            | null
          new_value_json: Json | null
          old_scope:
            | Database["public"]["Enums"]["config_governance_scope"]
            | null
          old_value_json: Json | null
          replaced_at: string | null
          replaced_by_entry_id: string | null
          server_id: string | null
        }
        Insert: {
          change_kind: Database["public"]["Enums"]["config_change_kind"]
          change_set_id: string
          config_definition_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?:
            | Database["public"]["Enums"]["config_managed_entity_type"]
            | null
          field_path?: string | null
          id?: string
          metadata_json?: Json
          new_scope?:
            | Database["public"]["Enums"]["config_governance_scope"]
            | null
          new_value_json?: Json | null
          old_scope?:
            | Database["public"]["Enums"]["config_governance_scope"]
            | null
          old_value_json?: Json | null
          replaced_at?: string | null
          replaced_by_entry_id?: string | null
          server_id?: string | null
        }
        Update: {
          change_kind?: Database["public"]["Enums"]["config_change_kind"]
          change_set_id?: string
          config_definition_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?:
            | Database["public"]["Enums"]["config_managed_entity_type"]
            | null
          field_path?: string | null
          id?: string
          metadata_json?: Json
          new_scope?:
            | Database["public"]["Enums"]["config_governance_scope"]
            | null
          new_value_json?: Json | null
          old_scope?:
            | Database["public"]["Enums"]["config_governance_scope"]
            | null
          old_value_json?: Json | null
          replaced_at?: string | null
          replaced_by_entry_id?: string | null
          server_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "config_change_entries_change_set_id_fkey"
            columns: ["change_set_id"]
            isOneToOne: false
            referencedRelation: "config_change_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "config_change_entries_config_definition_id_fkey"
            columns: ["config_definition_id"]
            isOneToOne: false
            referencedRelation: "config_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "config_change_entries_replaced_by_entry_id_fkey"
            columns: ["replaced_by_entry_id"]
            isOneToOne: false
            referencedRelation: "config_change_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "config_change_entries_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
        ]
      }
      config_change_sets: {
        Row: {
          applied_at: string | null
          applied_by: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          cancelled_reason: string | null
          changelog_body: string | null
          changelog_title: string | null
          changelog_visibility: Database["public"]["Enums"]["config_change_visibility"]
          created_at: string
          draft_kind: string | null
          id: string
          ready_at: string | null
          ready_by: string | null
          reason: string
          requested_by: string | null
          status: Database["public"]["Enums"]["config_change_status"]
          title: string
          updated_at: string
        }
        Insert: {
          applied_at?: string | null
          applied_by?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          cancelled_reason?: string | null
          changelog_body?: string | null
          changelog_title?: string | null
          changelog_visibility?: Database["public"]["Enums"]["config_change_visibility"]
          created_at?: string
          draft_kind?: string | null
          id?: string
          ready_at?: string | null
          ready_by?: string | null
          reason: string
          requested_by?: string | null
          status?: Database["public"]["Enums"]["config_change_status"]
          title: string
          updated_at?: string
        }
        Update: {
          applied_at?: string | null
          applied_by?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          cancelled_reason?: string | null
          changelog_body?: string | null
          changelog_title?: string | null
          changelog_visibility?: Database["public"]["Enums"]["config_change_visibility"]
          created_at?: string
          draft_kind?: string | null
          id?: string
          ready_at?: string | null
          ready_by?: string | null
          reason?: string
          requested_by?: string | null
          status?: Database["public"]["Enums"]["config_change_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      config_definition_ui_metadata: {
        Row: {
          admin_description_override: string | null
          admin_label_override: string | null
          change_warning: string | null
          config_definition_id: string
          created_at: string
          gameplay_impact_summary: string | null
          helper_text: string | null
          metadata_json: Json
          preview_kind: string
          sort_order: number
          ui_group_key: string | null
          ui_group_label: string | null
          updated_at: string
        }
        Insert: {
          admin_description_override?: string | null
          admin_label_override?: string | null
          change_warning?: string | null
          config_definition_id: string
          created_at?: string
          gameplay_impact_summary?: string | null
          helper_text?: string | null
          metadata_json?: Json
          preview_kind?: string
          sort_order?: number
          ui_group_key?: string | null
          ui_group_label?: string | null
          updated_at?: string
        }
        Update: {
          admin_description_override?: string | null
          admin_label_override?: string | null
          change_warning?: string | null
          config_definition_id?: string
          created_at?: string
          gameplay_impact_summary?: string | null
          helper_text?: string | null
          metadata_json?: Json
          preview_kind?: string
          sort_order?: number
          ui_group_key?: string | null
          ui_group_label?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "config_definition_ui_metadata_config_definition_id_fkey"
            columns: ["config_definition_id"]
            isOneToOne: true
            referencedRelation: "config_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      config_definitions: {
        Row: {
          created_at: string
          default_value_json: Json | null
          description: string | null
          governance_scope: Database["public"]["Enums"]["config_governance_scope"]
          id: string
          is_active: boolean
          key: string
          label: string
          managed_entity_key: string | null
          managed_entity_type: Database["public"]["Enums"]["config_managed_entity_type"]
          sort_order: number
          updated_at: string
          value_schema_json: Json
          value_type: Database["public"]["Enums"]["config_value_type"]
        }
        Insert: {
          created_at?: string
          default_value_json?: Json | null
          description?: string | null
          governance_scope: Database["public"]["Enums"]["config_governance_scope"]
          id?: string
          is_active?: boolean
          key: string
          label: string
          managed_entity_key?: string | null
          managed_entity_type: Database["public"]["Enums"]["config_managed_entity_type"]
          sort_order?: number
          updated_at?: string
          value_schema_json?: Json
          value_type?: Database["public"]["Enums"]["config_value_type"]
        }
        Update: {
          created_at?: string
          default_value_json?: Json | null
          description?: string | null
          governance_scope?: Database["public"]["Enums"]["config_governance_scope"]
          id?: string
          is_active?: boolean
          key?: string
          label?: string
          managed_entity_key?: string | null
          managed_entity_type?: Database["public"]["Enums"]["config_managed_entity_type"]
          sort_order?: number
          updated_at?: string
          value_schema_json?: Json
          value_type?: Database["public"]["Enums"]["config_value_type"]
        }
        Relationships: []
      }
      config_draft_entity_field_allowlist: {
        Row: {
          admin_label: string
          allow_blank: boolean
          apply_domain: string
          apply_order: number
          created_at: string
          description: string | null
          entity_type: Database["public"]["Enums"]["config_managed_entity_type"]
          enum_values: string[] | null
          field_path: string
          id: string
          is_enabled: boolean
          is_nullable: boolean
          max_numeric: number | null
          metadata_json: Json
          min_numeric: number | null
          player_safe_label: string
          ref_column_name: string | null
          ref_table_name: string | null
          updated_at: string
          validation_hint: string | null
          value_type: Database["public"]["Enums"]["config_value_type"]
        }
        Insert: {
          admin_label: string
          allow_blank?: boolean
          apply_domain: string
          apply_order?: number
          created_at?: string
          description?: string | null
          entity_type: Database["public"]["Enums"]["config_managed_entity_type"]
          enum_values?: string[] | null
          field_path: string
          id?: string
          is_enabled?: boolean
          is_nullable?: boolean
          max_numeric?: number | null
          metadata_json?: Json
          min_numeric?: number | null
          player_safe_label: string
          ref_column_name?: string | null
          ref_table_name?: string | null
          updated_at?: string
          validation_hint?: string | null
          value_type: Database["public"]["Enums"]["config_value_type"]
        }
        Update: {
          admin_label?: string
          allow_blank?: boolean
          apply_domain?: string
          apply_order?: number
          created_at?: string
          description?: string | null
          entity_type?: Database["public"]["Enums"]["config_managed_entity_type"]
          enum_values?: string[] | null
          field_path?: string
          id?: string
          is_enabled?: boolean
          is_nullable?: boolean
          max_numeric?: number | null
          metadata_json?: Json
          min_numeric?: number | null
          player_safe_label?: string
          ref_column_name?: string | null
          ref_table_name?: string | null
          updated_at?: string
          validation_hint?: string | null
          value_type?: Database["public"]["Enums"]["config_value_type"]
        }
        Relationships: []
      }
      derived_stat_definitions: {
        Row: {
          admin_description: string | null
          base_source: string
          base_stat_key: string | null
          bonus_target_key: string
          calculation_kind: string
          created_at: string
          description: string
          formula_target_key: string | null
          helper_text: string | null
          id: string
          is_active: boolean
          is_combat_stat: boolean
          key: string
          label: string
          max_related_stat_key: string | null
          min_related_stat_key: string | null
          min_value: number | null
          secondary_bonus_target_key: string | null
          sort_order: number
          updated_at: string
          value_kind: string
        }
        Insert: {
          admin_description?: string | null
          base_source?: string
          base_stat_key?: string | null
          bonus_target_key: string
          calculation_kind?: string
          created_at?: string
          description: string
          formula_target_key?: string | null
          helper_text?: string | null
          id?: string
          is_active?: boolean
          is_combat_stat?: boolean
          key: string
          label: string
          max_related_stat_key?: string | null
          min_related_stat_key?: string | null
          min_value?: number | null
          secondary_bonus_target_key?: string | null
          sort_order?: number
          updated_at?: string
          value_kind?: string
        }
        Update: {
          admin_description?: string | null
          base_source?: string
          base_stat_key?: string | null
          bonus_target_key?: string
          calculation_kind?: string
          created_at?: string
          description?: string
          formula_target_key?: string | null
          helper_text?: string | null
          id?: string
          is_active?: boolean
          is_combat_stat?: boolean
          key?: string
          label?: string
          max_related_stat_key?: string | null
          min_related_stat_key?: string | null
          min_value?: number | null
          secondary_bonus_target_key?: string | null
          sort_order?: number
          updated_at?: string
          value_kind?: string
        }
        Relationships: [
          {
            foreignKeyName: "derived_stat_definitions_base_stat_key_fkey"
            columns: ["base_stat_key"]
            isOneToOne: false
            referencedRelation: "stats"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "derived_stat_definitions_bonus_target_key_fkey"
            columns: ["bonus_target_key"]
            isOneToOne: false
            referencedRelation: "bonus_targets"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "derived_stat_definitions_formula_target_key_fkey"
            columns: ["formula_target_key"]
            isOneToOne: false
            referencedRelation: "balance_formula_targets"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "derived_stat_definitions_secondary_bonus_target_key_fkey"
            columns: ["secondary_bonus_target_key"]
            isOneToOne: false
            referencedRelation: "bonus_targets"
            referencedColumns: ["key"]
          },
        ]
      }
      encounter_combat_candidates: {
        Row: {
          candidate_kind: Database["public"]["Enums"]["combat_candidate_kind"]
          created_at: string
          difficulty_multiplier: number
          encounter_definition_id: string
          family_key: string | null
          id: string
          is_active: boolean
          max_hero_level: number | null
          min_hero_level: number | null
          opponent_definition_id: string | null
          scaling_formula_id: string | null
          sort_order: number
          updated_at: string
          weight: number
        }
        Insert: {
          candidate_kind: Database["public"]["Enums"]["combat_candidate_kind"]
          created_at?: string
          difficulty_multiplier?: number
          encounter_definition_id: string
          family_key?: string | null
          id?: string
          is_active?: boolean
          max_hero_level?: number | null
          min_hero_level?: number | null
          opponent_definition_id?: string | null
          scaling_formula_id?: string | null
          sort_order?: number
          updated_at?: string
          weight?: number
        }
        Update: {
          candidate_kind?: Database["public"]["Enums"]["combat_candidate_kind"]
          created_at?: string
          difficulty_multiplier?: number
          encounter_definition_id?: string
          family_key?: string | null
          id?: string
          is_active?: boolean
          max_hero_level?: number | null
          min_hero_level?: number | null
          opponent_definition_id?: string | null
          scaling_formula_id?: string | null
          sort_order?: number
          updated_at?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "encounter_combat_candidates_encounter_definition_id_fkey"
            columns: ["encounter_definition_id"]
            isOneToOne: false
            referencedRelation: "encounter_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "encounter_combat_candidates_family_key_fkey"
            columns: ["family_key"]
            isOneToOne: false
            referencedRelation: "combat_opponent_families"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "encounter_combat_candidates_opponent_definition_id_fkey"
            columns: ["opponent_definition_id"]
            isOneToOne: false
            referencedRelation: "combat_opponent_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "encounter_combat_candidates_scaling_formula_id_fkey"
            columns: ["scaling_formula_id"]
            isOneToOne: false
            referencedRelation: "balance_formulas"
            referencedColumns: ["id"]
          },
        ]
      }
      encounter_definitions: {
        Row: {
          admin_description: string | null
          created_at: string
          description: string
          encounter_kind: string
          helper_text: string | null
          id: string
          is_active: boolean
          key: string
          label: string
          max_difficulty_key: string | null
          max_district_code: string | null
          metadata_json: Json
          min_difficulty_key: string | null
          min_district_code: string | null
          minigame_key: string | null
          reward_profile_id: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          description: string
          encounter_kind: string
          helper_text?: string | null
          id?: string
          is_active?: boolean
          key: string
          label: string
          max_difficulty_key?: string | null
          max_district_code?: string | null
          metadata_json?: Json
          min_difficulty_key?: string | null
          min_district_code?: string | null
          minigame_key?: string | null
          reward_profile_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          description?: string
          encounter_kind?: string
          helper_text?: string | null
          id?: string
          is_active?: boolean
          key?: string
          label?: string
          max_difficulty_key?: string | null
          max_district_code?: string | null
          metadata_json?: Json
          min_difficulty_key?: string | null
          min_district_code?: string | null
          minigame_key?: string | null
          reward_profile_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "encounter_definitions_max_difficulty_key_fkey"
            columns: ["max_difficulty_key"]
            isOneToOne: false
            referencedRelation: "exploration_difficulty_tiers"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "encounter_definitions_min_difficulty_key_fkey"
            columns: ["min_difficulty_key"]
            isOneToOne: false
            referencedRelation: "exploration_difficulty_tiers"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "encounter_definitions_minigame_key_fkey"
            columns: ["minigame_key"]
            isOneToOne: false
            referencedRelation: "exploration_minigame_definitions"
            referencedColumns: ["key"]
          },
        ]
      }
      encounter_description_variants: {
        Row: {
          created_at: string
          description: string
          encounter_definition_id: string
          helper_text: string | null
          id: string
          is_active: boolean
          label: string | null
          metadata_json: Json
          sort_order: number
        }
        Insert: {
          created_at?: string
          description: string
          encounter_definition_id: string
          helper_text?: string | null
          id?: string
          is_active?: boolean
          label?: string | null
          metadata_json?: Json
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string
          encounter_definition_id?: string
          helper_text?: string | null
          id?: string
          is_active?: boolean
          label?: string | null
          metadata_json?: Json
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "encounter_description_variants_encounter_definition_id_fkey"
            columns: ["encounter_definition_id"]
            isOneToOne: false
            referencedRelation: "encounter_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      encounter_effect_payloads: {
        Row: {
          admin_description: string | null
          chance_percent: number
          created_at: string
          description: string | null
          effect_definition_id: string
          encounter_definition_id: string
          helper_text: string | null
          id: string
          is_active: boolean
          metadata_json: Json
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          chance_percent?: number
          created_at?: string
          description?: string | null
          effect_definition_id: string
          encounter_definition_id: string
          helper_text?: string | null
          id?: string
          is_active?: boolean
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          chance_percent?: number
          created_at?: string
          description?: string | null
          effect_definition_id?: string
          encounter_definition_id?: string
          helper_text?: string | null
          id?: string
          is_active?: boolean
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "encounter_effect_payloads_effect_definition_id_fkey"
            columns: ["effect_definition_id"]
            isOneToOne: false
            referencedRelation: "exploration_effect_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "encounter_effect_payloads_encounter_definition_id_fkey"
            columns: ["encounter_definition_id"]
            isOneToOne: false
            referencedRelation: "encounter_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      encounter_resource_payloads: {
        Row: {
          admin_description: string | null
          amount_mode: string
          chance_percent: number
          created_at: string
          description: string | null
          encounter_definition_id: string
          formula_id: string | null
          helper_text: string | null
          id: string
          is_active: boolean
          max_amount: number | null
          metadata_json: Json
          min_amount: number | null
          resource_type: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          amount_mode?: string
          chance_percent?: number
          created_at?: string
          description?: string | null
          encounter_definition_id: string
          formula_id?: string | null
          helper_text?: string | null
          id?: string
          is_active?: boolean
          max_amount?: number | null
          metadata_json?: Json
          min_amount?: number | null
          resource_type: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          amount_mode?: string
          chance_percent?: number
          created_at?: string
          description?: string | null
          encounter_definition_id?: string
          formula_id?: string | null
          helper_text?: string | null
          id?: string
          is_active?: boolean
          max_amount?: number | null
          metadata_json?: Json
          min_amount?: number | null
          resource_type?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "encounter_resource_payloads_encounter_definition_id_fkey"
            columns: ["encounter_definition_id"]
            isOneToOne: false
            referencedRelation: "encounter_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "encounter_resource_payloads_formula_id_fkey"
            columns: ["formula_id"]
            isOneToOne: false
            referencedRelation: "balance_formulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "encounter_resource_payloads_resource_type_fkey"
            columns: ["resource_type"]
            isOneToOne: false
            referencedRelation: "resource_types"
            referencedColumns: ["key"]
          },
        ]
      }
      entity_bonuses: {
        Row: {
          bonus_template_id: string
          created_at: string
          description: string | null
          entity_id: string
          entity_type: string
          formula_id_override: string | null
          formula_target_id_override: string | null
          id: string
          is_active: boolean
          legacy_source_id: string | null
          legacy_source_table: string | null
          level_interval_override: number | null
          params_json: Json
          quality_scales_level_interval: boolean
          quality_scales_value: boolean
          scaling_stat_key_override: string | null
          scope_key_override: string | null
          sort_order: number
          updated_at: string
          value: number
        }
        Insert: {
          bonus_template_id: string
          created_at?: string
          description?: string | null
          entity_id: string
          entity_type: string
          formula_id_override?: string | null
          formula_target_id_override?: string | null
          id?: string
          is_active?: boolean
          legacy_source_id?: string | null
          legacy_source_table?: string | null
          level_interval_override?: number | null
          params_json?: Json
          quality_scales_level_interval?: boolean
          quality_scales_value?: boolean
          scaling_stat_key_override?: string | null
          scope_key_override?: string | null
          sort_order?: number
          updated_at?: string
          value: number
        }
        Update: {
          bonus_template_id?: string
          created_at?: string
          description?: string | null
          entity_id?: string
          entity_type?: string
          formula_id_override?: string | null
          formula_target_id_override?: string | null
          id?: string
          is_active?: boolean
          legacy_source_id?: string | null
          legacy_source_table?: string | null
          level_interval_override?: number | null
          params_json?: Json
          quality_scales_level_interval?: boolean
          quality_scales_value?: boolean
          scaling_stat_key_override?: string | null
          scope_key_override?: string | null
          sort_order?: number
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "entity_bonuses_bonus_template_id_fkey"
            columns: ["bonus_template_id"]
            isOneToOne: false
            referencedRelation: "bonus_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entity_bonuses_formula_id_override_fkey"
            columns: ["formula_id_override"]
            isOneToOne: false
            referencedRelation: "balance_formulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entity_bonuses_formula_target_id_override_fkey"
            columns: ["formula_target_id_override"]
            isOneToOne: false
            referencedRelation: "balance_formula_targets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entity_bonuses_scaling_stat_key_override_fkey"
            columns: ["scaling_stat_key_override"]
            isOneToOne: false
            referencedRelation: "stats"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "entity_bonuses_scope_key_override_fkey"
            columns: ["scope_key_override"]
            isOneToOne: false
            referencedRelation: "bonus_scopes"
            referencedColumns: ["key"]
          },
        ]
      }
      entity_formula_assignments: {
        Row: {
          created_at: string
          entity_id: string
          entity_kind: string
          formula_id: string
          id: string
          target_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_kind: string
          formula_id: string
          id?: string
          target_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_kind?: string
          formula_id?: string
          id?: string
          target_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "entity_formula_assignments_formula_id_fkey"
            columns: ["formula_id"]
            isOneToOne: false
            referencedRelation: "balance_formulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entity_formula_assignments_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "balance_formula_targets"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_requirements: {
        Row: {
          applies_from_level: number
          context: string
          created_at: string
          description: string | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["requirement_entity_type"]
          id: string
          is_active: boolean
          params_json: Json
          required_building_key: string | null
          required_district_code: string | null
          required_resource_type: string | null
          required_stat_key: string | null
          required_value_boolean: boolean | null
          required_value_decimal: number | null
          required_value_integer: number | null
          required_value_text: string | null
          requirement_definition_key: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          applies_from_level?: number
          context?: string
          created_at?: string
          description?: string | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["requirement_entity_type"]
          id?: string
          is_active?: boolean
          params_json?: Json
          required_building_key?: string | null
          required_district_code?: string | null
          required_resource_type?: string | null
          required_stat_key?: string | null
          required_value_boolean?: boolean | null
          required_value_decimal?: number | null
          required_value_integer?: number | null
          required_value_text?: string | null
          requirement_definition_key: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          applies_from_level?: number
          context?: string
          created_at?: string
          description?: string | null
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["requirement_entity_type"]
          id?: string
          is_active?: boolean
          params_json?: Json
          required_building_key?: string | null
          required_district_code?: string | null
          required_resource_type?: string | null
          required_stat_key?: string | null
          required_value_boolean?: boolean | null
          required_value_decimal?: number | null
          required_value_integer?: number | null
          required_value_text?: string | null
          requirement_definition_key?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "entity_requirements_required_building_key_fkey"
            columns: ["required_building_key"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "entity_requirements_required_district_code_fkey"
            columns: ["required_district_code"]
            isOneToOne: false
            referencedRelation: "estate_districts"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "entity_requirements_required_stat_key_fkey"
            columns: ["required_stat_key"]
            isOneToOne: false
            referencedRelation: "stats"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "entity_requirements_requirement_definition_key_fkey"
            columns: ["requirement_definition_key"]
            isOneToOne: false
            referencedRelation: "requirement_definitions"
            referencedColumns: ["key"]
          },
        ]
      }
      equipment_slot_definitions: {
        Row: {
          admin_description: string | null
          created_at: string
          description: string
          equipment_area: string
          helper_text: string | null
          is_active: boolean
          key: string
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          description: string
          equipment_area: string
          helper_text?: string | null
          is_active?: boolean
          key: string
          label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          description?: string
          equipment_area?: string
          helper_text?: string | null
          is_active?: boolean
          key?: string
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      estate_building_jobs: {
        Row: {
          building_id: string
          completes_at: string
          created_at: string
          estate_id: string
          id: string
          started_at: string
          status: Database["public"]["Enums"]["estate_building_job_status"]
          target_level: number
          updated_at: string
        }
        Insert: {
          building_id: string
          completes_at: string
          created_at?: string
          estate_id: string
          id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["estate_building_job_status"]
          target_level: number
          updated_at?: string
        }
        Update: {
          building_id?: string
          completes_at?: string
          created_at?: string
          estate_id?: string
          id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["estate_building_job_status"]
          target_level?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estate_building_jobs_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estate_building_jobs_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
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
      estate_district_address_capacities: {
        Row: {
          address_capacity: number
          admin_description: string | null
          created_at: string
          description: string
          district_code: string
          helper_text: string | null
          is_active: boolean
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          address_capacity: number
          admin_description?: string | null
          created_at?: string
          description: string
          district_code: string
          helper_text?: string | null
          is_active?: boolean
          label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          address_capacity?: number
          admin_description?: string | null
          created_at?: string
          description?: string
          district_code?: string
          helper_text?: string | null
          is_active?: boolean
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estate_district_address_capacities_district_code_fkey"
            columns: ["district_code"]
            isOneToOne: true
            referencedRelation: "estate_districts"
            referencedColumns: ["code"]
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
      estate_movement_locks: {
        Row: {
          created_at: string
          created_by_hero_id: string | null
          ended_at: string | null
          estate_id: string | null
          expires_at: string
          hero_id: string
          id: string
          lock_kind: string
          metadata_json: Json
          reason: string | null
          server_id: string
          source_entity_id: string | null
          source_entity_type: string | null
          starts_at: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by_hero_id?: string | null
          ended_at?: string | null
          estate_id?: string | null
          expires_at: string
          hero_id: string
          id?: string
          lock_kind: string
          metadata_json?: Json
          reason?: string | null
          server_id: string
          source_entity_id?: string | null
          source_entity_type?: string | null
          starts_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by_hero_id?: string | null
          ended_at?: string | null
          estate_id?: string | null
          expires_at?: string
          hero_id?: string
          id?: string
          lock_kind?: string
          metadata_json?: Json
          reason?: string | null
          server_id?: string
          source_entity_id?: string | null
          source_entity_type?: string | null
          starts_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estate_movement_locks_created_by_hero_id_fkey"
            columns: ["created_by_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estate_movement_locks_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estate_movement_locks_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estate_movement_locks_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
        ]
      }
      estates: {
        Row: {
          address: string
          address_number: number | null
          created_at: string | null
          district_code: string | null
          hero_id: string
          id: string
          rank: number
          server_id: string
        }
        Insert: {
          address: string
          address_number?: number | null
          created_at?: string | null
          district_code?: string | null
          hero_id: string
          id?: string
          rank: number
          server_id: string
        }
        Update: {
          address?: string
          address_number?: number | null
          created_at?: string | null
          district_code?: string | null
          hero_id?: string
          id?: string
          rank?: number
          server_id?: string
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
          {
            foreignKeyName: "estates_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
        ]
      }
      exploration_difficulty_tiers: {
        Row: {
          admin_description: string | null
          created_at: string
          description: string
          encounter_reward_multiplier: number
          helper_text: string | null
          is_active: boolean
          key: string
          label: string
          metadata_json: Json
          sort_order: number
          step_duration_multiplier: number
          trial_opportunity_step_cap: number
          trial_reward_multiplier: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          description: string
          encounter_reward_multiplier?: number
          helper_text?: string | null
          is_active?: boolean
          key: string
          label: string
          metadata_json?: Json
          sort_order?: number
          step_duration_multiplier?: number
          trial_opportunity_step_cap?: number
          trial_reward_multiplier?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          description?: string
          encounter_reward_multiplier?: number
          helper_text?: string | null
          is_active?: boolean
          key?: string
          label?: string
          metadata_json?: Json
          sort_order?: number
          step_duration_multiplier?: number
          trial_opportunity_step_cap?: number
          trial_reward_multiplier?: number
          updated_at?: string
        }
        Relationships: []
      }
      exploration_effect_definitions: {
        Row: {
          admin_description: string | null
          bonus_template_id: string | null
          created_at: string
          default_duration_steps: number | null
          default_value: number | null
          description: string
          effect_kind: string
          helper_text: string | null
          id: string
          is_active: boolean
          key: string
          label: string
          metadata_json: Json
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          bonus_template_id?: string | null
          created_at?: string
          default_duration_steps?: number | null
          default_value?: number | null
          description: string
          effect_kind: string
          helper_text?: string | null
          id?: string
          is_active?: boolean
          key: string
          label: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          bonus_template_id?: string | null
          created_at?: string
          default_duration_steps?: number | null
          default_value?: number | null
          description?: string
          effect_kind?: string
          helper_text?: string | null
          id?: string
          is_active?: boolean
          key?: string
          label?: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exploration_effect_definitions_bonus_template_id_fkey"
            columns: ["bonus_template_id"]
            isOneToOne: false
            referencedRelation: "bonus_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      exploration_location_descriptions: {
        Row: {
          created_at: string
          description: string
          difficulty_key: string | null
          district_code: string | null
          helper_text: string | null
          id: string
          is_active: boolean
          key: string
          label: string
          metadata_json: Json
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          difficulty_key?: string | null
          district_code?: string | null
          helper_text?: string | null
          id?: string
          is_active?: boolean
          key: string
          label: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          difficulty_key?: string | null
          district_code?: string | null
          helper_text?: string | null
          id?: string
          is_active?: boolean
          key?: string
          label?: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exploration_location_descriptions_difficulty_key_fkey"
            columns: ["difficulty_key"]
            isOneToOne: false
            referencedRelation: "exploration_difficulty_tiers"
            referencedColumns: ["key"]
          },
        ]
      }
      exploration_minigame_definitions: {
        Row: {
          admin_description: string | null
          created_at: string
          description: string
          helper_text: string | null
          implementation_key: string
          is_active: boolean
          key: string
          label: string
          metadata_json: Json
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          description: string
          helper_text?: string | null
          implementation_key: string
          is_active?: boolean
          key: string
          label: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          description?: string
          helper_text?: string | null
          implementation_key?: string
          is_active?: boolean
          key?: string
          label?: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      exploration_readiness_reason_codes: {
        Row: {
          created_at: string
          description: string | null
          is_active: boolean
          is_blocking: boolean
          key: string
          label: string
          metadata_json: Json
          severity: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          is_active?: boolean
          is_blocking?: boolean
          key: string
          label: string
          metadata_json?: Json
          severity?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          is_active?: boolean
          is_blocking?: boolean
          key?: string
          label?: string
          metadata_json?: Json
          severity?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      game_report_hero_access: {
        Row: {
          access_role: Database["public"]["Enums"]["game_report_access_role"]
          created_at: string
          hero_id: string
          id: string
          read_at: string | null
          report_id: string
        }
        Insert: {
          access_role: Database["public"]["Enums"]["game_report_access_role"]
          created_at?: string
          hero_id: string
          id?: string
          read_at?: string | null
          report_id: string
        }
        Update: {
          access_role?: Database["public"]["Enums"]["game_report_access_role"]
          created_at?: string
          hero_id?: string
          id?: string
          read_at?: string | null
          report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_report_hero_access_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_report_hero_access_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "game_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      game_report_item_references: {
        Row: {
          base_id: string | null
          created_at: string
          display_name_fallback: string
          id: string
          prefix_affix_id: string | null
          quality_key: string | null
          report_id: string
          sort_order: number
          source_item_id: string | null
          source_kind: Database["public"]["Enums"]["game_report_item_source_kind"]
          suffix_affix_id: string | null
        }
        Insert: {
          base_id?: string | null
          created_at?: string
          display_name_fallback: string
          id?: string
          prefix_affix_id?: string | null
          quality_key?: string | null
          report_id: string
          sort_order?: number
          source_item_id?: string | null
          source_kind: Database["public"]["Enums"]["game_report_item_source_kind"]
          suffix_affix_id?: string | null
        }
        Update: {
          base_id?: string | null
          created_at?: string
          display_name_fallback?: string
          id?: string
          prefix_affix_id?: string | null
          quality_key?: string | null
          report_id?: string
          sort_order?: number
          source_item_id?: string | null
          source_kind?: Database["public"]["Enums"]["game_report_item_source_kind"]
          suffix_affix_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_report_item_references_base_id_fkey"
            columns: ["base_id"]
            isOneToOne: false
            referencedRelation: "item_generation_bases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_report_item_references_prefix_affix_id_fkey"
            columns: ["prefix_affix_id"]
            isOneToOne: false
            referencedRelation: "item_generation_affixes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_report_item_references_quality_key_fkey"
            columns: ["quality_key"]
            isOneToOne: false
            referencedRelation: "item_generation_qualities"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "game_report_item_references_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "game_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_report_item_references_suffix_affix_id_fkey"
            columns: ["suffix_affix_id"]
            isOneToOne: false
            referencedRelation: "item_generation_affixes"
            referencedColumns: ["id"]
          },
        ]
      }
      game_report_participants: {
        Row: {
          created_at: string
          display_name: string
          hero_id: string | null
          id: string
          level_snapshot: number | null
          participant_role: string
          report_id: string
          side_label: string | null
          sort_order: number
        }
        Insert: {
          created_at?: string
          display_name: string
          hero_id?: string | null
          id?: string
          level_snapshot?: number | null
          participant_role: string
          report_id: string
          side_label?: string | null
          sort_order?: number
        }
        Update: {
          created_at?: string
          display_name?: string
          hero_id?: string | null
          id?: string
          level_snapshot?: number | null
          participant_role?: string
          report_id?: string
          side_label?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "game_report_participants_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_report_participants_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "game_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      game_report_types: {
        Row: {
          admin_description: string | null
          created_at: string
          description: string
          helper_text: string | null
          is_active: boolean
          key: string
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          description: string
          helper_text?: string | null
          is_active?: boolean
          key: string
          label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          description?: string
          helper_text?: string | null
          is_active?: boolean
          key?: string
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      game_reports: {
        Row: {
          created_at: string
          id: string
          public_token: string
          report_type_key: string
          server_id: string
          source_entity_id: string
          source_entity_type: Database["public"]["Enums"]["game_report_source_entity_type"]
          summary: string | null
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          public_token?: string
          report_type_key: string
          server_id: string
          source_entity_id: string
          source_entity_type: Database["public"]["Enums"]["game_report_source_entity_type"]
          summary?: string | null
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          public_token?: string
          report_type_key?: string
          server_id?: string
          source_entity_id?: string
          source_entity_type?: Database["public"]["Enums"]["game_report_source_entity_type"]
          summary?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_reports_report_type_key_fkey"
            columns: ["report_type_key"]
            isOneToOne: false
            referencedRelation: "game_report_types"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "game_reports_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
        ]
      }
      game_servers: {
        Row: {
          archived_at: string | null
          created_at: string
          description: string | null
          id: string
          key: string
          kind: Database["public"]["Enums"]["game_server_kind"]
          launched_at: string | null
          name: string
          status: Database["public"]["Enums"]["game_server_status"]
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          key: string
          kind: Database["public"]["Enums"]["game_server_kind"]
          launched_at?: string | null
          name: string
          status?: Database["public"]["Enums"]["game_server_status"]
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          kind?: Database["public"]["Enums"]["game_server_kind"]
          launched_at?: string | null
          name?: string
          status?: Database["public"]["Enums"]["game_server_status"]
          updated_at?: string
        }
        Relationships: []
      }
      global_config_values: {
        Row: {
          activated_at: string | null
          archived_at: string | null
          config_definition_id: string
          created_at: string
          created_by: string | null
          id: string
          status: Database["public"]["Enums"]["config_value_status"]
          value_json: Json
          version: number
        }
        Insert: {
          activated_at?: string | null
          archived_at?: string | null
          config_definition_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          status?: Database["public"]["Enums"]["config_value_status"]
          value_json: Json
          version?: number
        }
        Update: {
          activated_at?: string | null
          archived_at?: string | null
          config_definition_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          status?: Database["public"]["Enums"]["config_value_status"]
          value_json?: Json
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "global_config_values_config_definition_id_fkey"
            columns: ["config_definition_id"]
            isOneToOne: false
            referencedRelation: "config_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_armory_access_locks: {
        Row: {
          created_at: string
          guild_id: string
          id: string
          member_hero_id: string
          member_user_id: string
          metadata_json: Json
          reason: string
          request_id: string | null
          server_id: string
          set_by_hero_id: string
          status_key: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          guild_id: string
          id?: string
          member_hero_id: string
          member_user_id: string
          metadata_json?: Json
          reason: string
          request_id?: string | null
          server_id: string
          set_by_hero_id: string
          status_key?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          guild_id?: string
          id?: string
          member_hero_id?: string
          member_user_id?: string
          metadata_json?: Json
          reason?: string
          request_id?: string | null
          server_id?: string
          set_by_hero_id?: string
          status_key?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_armory_access_locks_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_armory_access_locks_member_hero_id_fkey"
            columns: ["member_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_armory_access_locks_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_armory_access_locks_set_by_hero_id_fkey"
            columns: ["set_by_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_armory_access_locks_status_key_fkey"
            columns: ["status_key"]
            isOneToOne: false
            referencedRelation: "guild_armory_access_statuses"
            referencedColumns: ["key"]
          },
        ]
      }
      guild_armory_access_statuses: {
        Row: {
          admin_description: string | null
          created_at: string
          description: string | null
          helper_text: string | null
          is_active: boolean
          key: string
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          description?: string | null
          helper_text?: string | null
          is_active?: boolean
          key: string
          label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          description?: string | null
          helper_text?: string | null
          is_active?: boolean
          key?: string
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      guild_armory_item_statuses: {
        Row: {
          admin_description: string | null
          created_at: string
          description: string | null
          helper_text: string | null
          is_active: boolean
          key: string
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          description?: string | null
          helper_text?: string | null
          is_active?: boolean
          key: string
          label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          description?: string | null
          helper_text?: string | null
          is_active?: boolean
          key?: string
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      guild_armory_items: {
        Row: {
          created_at: string
          deposit_reason: string
          deposited_at: string
          deposited_by_hero_id: string
          guild_id: string
          id: string
          item_id: string
          metadata_json: Json
          owner_hero_id: string
          owner_user_id: string
          request_id: string | null
          server_id: string
          status_changed_at: string | null
          status_key: string
          status_reason: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deposit_reason: string
          deposited_at?: string
          deposited_by_hero_id: string
          guild_id: string
          id?: string
          item_id: string
          metadata_json?: Json
          owner_hero_id: string
          owner_user_id: string
          request_id?: string | null
          server_id: string
          status_changed_at?: string | null
          status_key?: string
          status_reason?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deposit_reason?: string
          deposited_at?: string
          deposited_by_hero_id?: string
          guild_id?: string
          id?: string
          item_id?: string
          metadata_json?: Json
          owner_hero_id?: string
          owner_user_id?: string
          request_id?: string | null
          server_id?: string
          status_changed_at?: string | null
          status_key?: string
          status_reason?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_armory_items_deposited_by_hero_id_fkey"
            columns: ["deposited_by_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_armory_items_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_armory_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_armory_items_owner_hero_id_fkey"
            columns: ["owner_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_armory_items_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_armory_items_status_key_fkey"
            columns: ["status_key"]
            isOneToOne: false
            referencedRelation: "guild_armory_item_statuses"
            referencedColumns: ["key"]
          },
        ]
      }
      guild_armory_loan_statuses: {
        Row: {
          admin_description: string | null
          created_at: string
          description: string | null
          helper_text: string | null
          is_active: boolean
          key: string
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          description?: string | null
          helper_text?: string | null
          is_active?: boolean
          key: string
          label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          description?: string | null
          helper_text?: string | null
          is_active?: boolean
          key?: string
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      guild_armory_loans: {
        Row: {
          armory_item_id: string
          borrowed_at: string
          borrower_hero_id: string
          borrower_user_id: string
          created_at: string
          due_at: string | null
          ended_at: string | null
          ended_by_hero_id: string | null
          guild_id: string
          id: string
          item_id: string
          metadata_json: Json
          owner_hero_id: string
          owner_user_id: string
          reason: string
          request_id: string | null
          server_id: string
          status_key: string
          status_reason: string | null
          updated_at: string
        }
        Insert: {
          armory_item_id: string
          borrowed_at?: string
          borrower_hero_id: string
          borrower_user_id: string
          created_at?: string
          due_at?: string | null
          ended_at?: string | null
          ended_by_hero_id?: string | null
          guild_id: string
          id?: string
          item_id: string
          metadata_json?: Json
          owner_hero_id: string
          owner_user_id: string
          reason: string
          request_id?: string | null
          server_id: string
          status_key?: string
          status_reason?: string | null
          updated_at?: string
        }
        Update: {
          armory_item_id?: string
          borrowed_at?: string
          borrower_hero_id?: string
          borrower_user_id?: string
          created_at?: string
          due_at?: string | null
          ended_at?: string | null
          ended_by_hero_id?: string | null
          guild_id?: string
          id?: string
          item_id?: string
          metadata_json?: Json
          owner_hero_id?: string
          owner_user_id?: string
          reason?: string
          request_id?: string | null
          server_id?: string
          status_key?: string
          status_reason?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_armory_loans_armory_item_id_fkey"
            columns: ["armory_item_id"]
            isOneToOne: false
            referencedRelation: "guild_armory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_armory_loans_borrower_hero_id_fkey"
            columns: ["borrower_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_armory_loans_ended_by_hero_id_fkey"
            columns: ["ended_by_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_armory_loans_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_armory_loans_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_armory_loans_owner_hero_id_fkey"
            columns: ["owner_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_armory_loans_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_armory_loans_status_key_fkey"
            columns: ["status_key"]
            isOneToOne: false
            referencedRelation: "guild_armory_loan_statuses"
            referencedColumns: ["key"]
          },
        ]
      }
      guild_emergency_election_nominations: {
        Row: {
          candidate_hero_id: string
          candidate_user_id: string
          created_at: string
          election_id: string
          guild_id: string
          id: string
          metadata_json: Json
          nominated_by_hero_id: string
          nominated_by_user_id: string
          reason: string
          request_id: string | null
          server_id: string
        }
        Insert: {
          candidate_hero_id: string
          candidate_user_id: string
          created_at?: string
          election_id: string
          guild_id: string
          id?: string
          metadata_json?: Json
          nominated_by_hero_id: string
          nominated_by_user_id: string
          reason: string
          request_id?: string | null
          server_id: string
        }
        Update: {
          candidate_hero_id?: string
          candidate_user_id?: string
          created_at?: string
          election_id?: string
          guild_id?: string
          id?: string
          metadata_json?: Json
          nominated_by_hero_id?: string
          nominated_by_user_id?: string
          reason?: string
          request_id?: string | null
          server_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_emergency_election_nominations_candidate_hero_id_fkey"
            columns: ["candidate_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_emergency_election_nominations_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "guild_emergency_elections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_emergency_election_nominations_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_emergency_election_nominations_nominated_by_hero_id_fkey"
            columns: ["nominated_by_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_emergency_election_nominations_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_emergency_election_statuses: {
        Row: {
          admin_description: string | null
          created_at: string
          description: string | null
          helper_text: string | null
          is_active: boolean
          key: string
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          description?: string | null
          helper_text?: string | null
          is_active?: boolean
          key: string
          label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          description?: string | null
          helper_text?: string | null
          is_active?: boolean
          key?: string
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      guild_emergency_election_votes: {
        Row: {
          candidate_hero_id: string
          created_at: string
          election_id: string
          guild_id: string
          id: string
          metadata_json: Json
          reason: string | null
          request_id: string | null
          server_id: string
          voter_hero_id: string
          voter_user_id: string
        }
        Insert: {
          candidate_hero_id: string
          created_at?: string
          election_id: string
          guild_id: string
          id?: string
          metadata_json?: Json
          reason?: string | null
          request_id?: string | null
          server_id: string
          voter_hero_id: string
          voter_user_id: string
        }
        Update: {
          candidate_hero_id?: string
          created_at?: string
          election_id?: string
          guild_id?: string
          id?: string
          metadata_json?: Json
          reason?: string | null
          request_id?: string | null
          server_id?: string
          voter_hero_id?: string
          voter_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_emergency_election_votes_candidate_hero_id_fkey"
            columns: ["candidate_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_emergency_election_votes_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "guild_emergency_elections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_emergency_election_votes_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_emergency_election_votes_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_emergency_election_votes_voter_hero_id_fkey"
            columns: ["voter_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_emergency_elections: {
        Row: {
          created_at: string
          finalized_at: string | null
          guild_id: string
          id: string
          inactive_leader_hero_id: string
          inactive_leader_user_id: string
          inactivity_threshold_days: number
          leader_last_sign_in_at: string | null
          metadata_json: Json
          nomination_ends_at: string
          nomination_starts_at: string
          reason: string
          request_id: string | null
          server_id: string
          started_by_hero_id: string
          started_by_user_id: string
          status_key: string
          status_reason: string | null
          updated_at: string
          voting_ends_at: string | null
          voting_starts_at: string | null
          winner_hero_id: string | null
        }
        Insert: {
          created_at?: string
          finalized_at?: string | null
          guild_id: string
          id?: string
          inactive_leader_hero_id: string
          inactive_leader_user_id: string
          inactivity_threshold_days: number
          leader_last_sign_in_at?: string | null
          metadata_json?: Json
          nomination_ends_at: string
          nomination_starts_at?: string
          reason: string
          request_id?: string | null
          server_id: string
          started_by_hero_id: string
          started_by_user_id: string
          status_key?: string
          status_reason?: string | null
          updated_at?: string
          voting_ends_at?: string | null
          voting_starts_at?: string | null
          winner_hero_id?: string | null
        }
        Update: {
          created_at?: string
          finalized_at?: string | null
          guild_id?: string
          id?: string
          inactive_leader_hero_id?: string
          inactive_leader_user_id?: string
          inactivity_threshold_days?: number
          leader_last_sign_in_at?: string | null
          metadata_json?: Json
          nomination_ends_at?: string
          nomination_starts_at?: string
          reason?: string
          request_id?: string | null
          server_id?: string
          started_by_hero_id?: string
          started_by_user_id?: string
          status_key?: string
          status_reason?: string | null
          updated_at?: string
          voting_ends_at?: string | null
          voting_starts_at?: string | null
          winner_hero_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guild_emergency_elections_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_emergency_elections_inactive_leader_hero_id_fkey"
            columns: ["inactive_leader_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_emergency_elections_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_emergency_elections_started_by_hero_id_fkey"
            columns: ["started_by_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_emergency_elections_status_key_fkey"
            columns: ["status_key"]
            isOneToOne: false
            referencedRelation: "guild_emergency_election_statuses"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "guild_emergency_elections_winner_hero_id_fkey"
            columns: ["winner_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_invite_statuses: {
        Row: {
          admin_description: string | null
          created_at: string
          description: string | null
          helper_text: string | null
          is_active: boolean
          key: string
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          description?: string | null
          helper_text?: string | null
          is_active?: boolean
          key: string
          label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          description?: string | null
          helper_text?: string | null
          is_active?: boolean
          key?: string
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      guild_invites: {
        Row: {
          created_at: string
          expires_at: string | null
          guild_id: string
          id: string
          inviter_hero_id: string
          inviter_user_id: string
          metadata_json: Json
          reason: string
          request_id: string | null
          responded_at: string | null
          server_id: string
          status_key: string
          status_reason: string | null
          target_hero_id: string
          target_user_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          guild_id: string
          id?: string
          inviter_hero_id: string
          inviter_user_id: string
          metadata_json?: Json
          reason: string
          request_id?: string | null
          responded_at?: string | null
          server_id: string
          status_key?: string
          status_reason?: string | null
          target_hero_id: string
          target_user_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          guild_id?: string
          id?: string
          inviter_hero_id?: string
          inviter_user_id?: string
          metadata_json?: Json
          reason?: string
          request_id?: string | null
          responded_at?: string | null
          server_id?: string
          status_key?: string
          status_reason?: string | null
          target_hero_id?: string
          target_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_invites_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_invites_inviter_hero_id_fkey"
            columns: ["inviter_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_invites_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_invites_status_key_fkey"
            columns: ["status_key"]
            isOneToOne: false
            referencedRelation: "guild_invite_statuses"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "guild_invites_target_hero_id_fkey"
            columns: ["target_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_join_request_statuses: {
        Row: {
          admin_description: string | null
          created_at: string
          description: string | null
          helper_text: string | null
          is_active: boolean
          key: string
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          description?: string | null
          helper_text?: string | null
          is_active?: boolean
          key: string
          label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          description?: string | null
          helper_text?: string | null
          is_active?: boolean
          key?: string
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      guild_join_requests: {
        Row: {
          created_at: string
          expires_at: string | null
          guild_id: string
          id: string
          metadata_json: Json
          reason: string
          request_id: string | null
          requester_hero_id: string
          requester_user_id: string
          reviewed_at: string | null
          reviewed_by_hero_id: string | null
          reviewed_by_user_id: string | null
          server_id: string
          status_key: string
          status_reason: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          guild_id: string
          id?: string
          metadata_json?: Json
          reason: string
          request_id?: string | null
          requester_hero_id: string
          requester_user_id: string
          reviewed_at?: string | null
          reviewed_by_hero_id?: string | null
          reviewed_by_user_id?: string | null
          server_id: string
          status_key?: string
          status_reason?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          guild_id?: string
          id?: string
          metadata_json?: Json
          reason?: string
          request_id?: string | null
          requester_hero_id?: string
          requester_user_id?: string
          reviewed_at?: string | null
          reviewed_by_hero_id?: string | null
          reviewed_by_user_id?: string | null
          server_id?: string
          status_key?: string
          status_reason?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_join_requests_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_join_requests_requester_hero_id_fkey"
            columns: ["requester_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_join_requests_reviewed_by_hero_id_fkey"
            columns: ["reviewed_by_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_join_requests_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_join_requests_status_key_fkey"
            columns: ["status_key"]
            isOneToOne: false
            referencedRelation: "guild_join_request_statuses"
            referencedColumns: ["key"]
          },
        ]
      }
      guild_membership_statuses: {
        Row: {
          admin_description: string | null
          created_at: string
          description: string | null
          helper_text: string | null
          is_active: boolean
          key: string
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          description?: string | null
          helper_text?: string | null
          is_active?: boolean
          key: string
          label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          description?: string | null
          helper_text?: string | null
          is_active?: boolean
          key?: string
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      guild_memberships: {
        Row: {
          created_at: string
          ended_at: string | null
          ended_reason: string | null
          guild_id: string
          hero_id: string
          id: string
          invited_by_hero_id: string | null
          joined_at: string | null
          metadata_json: Json
          role_key: string
          server_id: string
          status_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          ended_reason?: string | null
          guild_id: string
          hero_id: string
          id?: string
          invited_by_hero_id?: string | null
          joined_at?: string | null
          metadata_json?: Json
          role_key: string
          server_id: string
          status_key?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          ended_reason?: string | null
          guild_id?: string
          hero_id?: string
          id?: string
          invited_by_hero_id?: string | null
          joined_at?: string | null
          metadata_json?: Json
          role_key?: string
          server_id?: string
          status_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_memberships_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_memberships_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_memberships_invited_by_hero_id_fkey"
            columns: ["invited_by_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_memberships_role_key_fkey"
            columns: ["role_key"]
            isOneToOne: false
            referencedRelation: "guild_roles"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "guild_memberships_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_memberships_status_key_fkey"
            columns: ["status_key"]
            isOneToOne: false
            referencedRelation: "guild_membership_statuses"
            referencedColumns: ["key"]
          },
        ]
      }
      guild_roles: {
        Row: {
          admin_description: string | null
          created_at: string
          description: string | null
          helper_text: string | null
          is_active: boolean
          key: string
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          description?: string | null
          helper_text?: string | null
          is_active?: boolean
          key: string
          label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          description?: string | null
          helper_text?: string | null
          is_active?: boolean
          key?: string
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      guild_statuses: {
        Row: {
          admin_description: string | null
          created_at: string
          description: string | null
          helper_text: string | null
          is_active: boolean
          key: string
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          description?: string | null
          helper_text?: string | null
          is_active?: boolean
          key: string
          label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          description?: string | null
          helper_text?: string | null
          is_active?: boolean
          key?: string
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      guilds: {
        Row: {
          created_at: string
          created_by_hero_id: string | null
          created_by_user_id: string | null
          description: string | null
          dissolved_at: string | null
          dissolved_by_hero_id: string | null
          dissolved_reason: string | null
          id: string
          leader_hero_id: string
          metadata_json: Json
          name: string
          server_id: string
          status_key: string
          tag: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by_hero_id?: string | null
          created_by_user_id?: string | null
          description?: string | null
          dissolved_at?: string | null
          dissolved_by_hero_id?: string | null
          dissolved_reason?: string | null
          id?: string
          leader_hero_id: string
          metadata_json?: Json
          name: string
          server_id: string
          status_key?: string
          tag: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by_hero_id?: string | null
          created_by_user_id?: string | null
          description?: string | null
          dissolved_at?: string | null
          dissolved_by_hero_id?: string | null
          dissolved_reason?: string | null
          id?: string
          leader_hero_id?: string
          metadata_json?: Json
          name?: string
          server_id?: string
          status_key?: string
          tag?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guilds_created_by_hero_id_fkey"
            columns: ["created_by_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guilds_dissolved_by_hero_id_fkey"
            columns: ["dissolved_by_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guilds_leader_hero_id_fkey"
            columns: ["leader_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guilds_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guilds_status_key_fkey"
            columns: ["status_key"]
            isOneToOne: false
            referencedRelation: "guild_statuses"
            referencedColumns: ["key"]
          },
        ]
      }
      hero: {
        Row: {
          character_points: number
          created_at: string | null
          estate_id: string | null
          experience: number | null
          id: string
          level: number | null
          name: string
          origin_id: string | null
          profile_picture: string | null
          rank: number | null
          server_id: string
          total_character_points_earned: number
          total_experience_earned: number
          user_id: string
        }
        Insert: {
          character_points?: number
          created_at?: string | null
          estate_id?: string | null
          experience?: number | null
          id?: string
          level?: number | null
          name: string
          origin_id?: string | null
          profile_picture?: string | null
          rank?: number | null
          server_id: string
          total_character_points_earned?: number
          total_experience_earned?: number
          user_id: string
        }
        Update: {
          character_points?: number
          created_at?: string | null
          estate_id?: string | null
          experience?: number | null
          id?: string
          level?: number | null
          name?: string
          origin_id?: string | null
          profile_picture?: string | null
          rank?: number | null
          server_id?: string
          total_character_points_earned?: number
          total_experience_earned?: number
          user_id?: string
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
          {
            foreignKeyName: "hero_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_armory_shelves: {
        Row: {
          created_at: string
          hero_id: string
          id: string
          name: string
          position: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          hero_id: string
          id?: string
          name: string
          position: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          hero_id?: string
          id?: string
          name?: string
          position?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hero_armory_shelves_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_daily_action_counters: {
        Row: {
          action_date: string
          action_kind: string
          created_at: string
          hero_id: string
          id: string
          metadata_json: Json
          remaining_count: number
          server_id: string
          updated_at: string
        }
        Insert: {
          action_date: string
          action_kind: string
          created_at?: string
          hero_id: string
          id?: string
          metadata_json?: Json
          remaining_count?: number
          server_id: string
          updated_at?: string
        }
        Update: {
          action_date?: string
          action_kind?: string
          created_at?: string
          hero_id?: string
          id?: string
          metadata_json?: Json
          remaining_count?: number
          server_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hero_daily_action_counters_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_daily_action_counters_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_equipment: {
        Row: {
          equipped_at: string
          hero_id: string
          item_id: string
          slot_key: string
        }
        Insert: {
          equipped_at?: string
          hero_id: string
          item_id: string
          slot_key: string
        }
        Update: {
          equipped_at?: string
          hero_id?: string
          item_id?: string
          slot_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "hero_equipment_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_equipment_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_equipment_slot_key_fkey"
            columns: ["slot_key"]
            isOneToOne: false
            referencedRelation: "equipment_slot_definitions"
            referencedColumns: ["key"]
          },
        ]
      }
      hero_exploration_challenge_attempts: {
        Row: {
          auto_resolve_chance: number | null
          auto_resolve_roll: number | null
          challenge_kind: string
          completed_at: string | null
          completion_mode: string | null
          created_at: string
          details_json: Json
          difficulty_key: string
          district_code: string
          encounter_definition_id: string | null
          exploration_id: string
          hero_id: string
          id: string
          manifestation_chance: number | null
          manifestation_roll: number | null
          manifestation_status: string
          manual_deadline_at: string | null
          metadata_json: Json
          minigame_key: string | null
          performance_rating: string | null
          reward_grant_id: string | null
          score: number | null
          server_id: string
          started_at: string | null
          status: string
          step_id: string
          success: boolean | null
          tested_stat_key: string | null
          trial_definition_id: string | null
          updated_at: string
        }
        Insert: {
          auto_resolve_chance?: number | null
          auto_resolve_roll?: number | null
          challenge_kind: string
          completed_at?: string | null
          completion_mode?: string | null
          created_at?: string
          details_json?: Json
          difficulty_key: string
          district_code?: string
          encounter_definition_id?: string | null
          exploration_id: string
          hero_id: string
          id?: string
          manifestation_chance?: number | null
          manifestation_roll?: number | null
          manifestation_status?: string
          manual_deadline_at?: string | null
          metadata_json?: Json
          minigame_key?: string | null
          performance_rating?: string | null
          reward_grant_id?: string | null
          score?: number | null
          server_id: string
          started_at?: string | null
          status: string
          step_id: string
          success?: boolean | null
          tested_stat_key?: string | null
          trial_definition_id?: string | null
          updated_at?: string
        }
        Update: {
          auto_resolve_chance?: number | null
          auto_resolve_roll?: number | null
          challenge_kind?: string
          completed_at?: string | null
          completion_mode?: string | null
          created_at?: string
          details_json?: Json
          difficulty_key?: string
          district_code?: string
          encounter_definition_id?: string | null
          exploration_id?: string
          hero_id?: string
          id?: string
          manifestation_chance?: number | null
          manifestation_roll?: number | null
          manifestation_status?: string
          manual_deadline_at?: string | null
          metadata_json?: Json
          minigame_key?: string | null
          performance_rating?: string | null
          reward_grant_id?: string | null
          score?: number | null
          server_id?: string
          started_at?: string | null
          status?: string
          step_id?: string
          success?: boolean | null
          tested_stat_key?: string | null
          trial_definition_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hero_exploration_challenge_attempt_encounter_definition_id_fkey"
            columns: ["encounter_definition_id"]
            isOneToOne: false
            referencedRelation: "encounter_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_exploration_challenge_attempts_difficulty_key_fkey"
            columns: ["difficulty_key"]
            isOneToOne: false
            referencedRelation: "exploration_difficulty_tiers"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "hero_exploration_challenge_attempts_district_code_fkey"
            columns: ["district_code"]
            isOneToOne: false
            referencedRelation: "estate_districts"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "hero_exploration_challenge_attempts_exploration_id_fkey"
            columns: ["exploration_id"]
            isOneToOne: false
            referencedRelation: "hero_explorations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_exploration_challenge_attempts_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_exploration_challenge_attempts_minigame_key_fkey"
            columns: ["minigame_key"]
            isOneToOne: false
            referencedRelation: "exploration_minigame_definitions"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "hero_exploration_challenge_attempts_reward_grant_id_fkey"
            columns: ["reward_grant_id"]
            isOneToOne: false
            referencedRelation: "reward_grants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_exploration_challenge_attempts_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_exploration_challenge_attempts_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "hero_exploration_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_exploration_challenge_attempts_tested_stat_key_fkey"
            columns: ["tested_stat_key"]
            isOneToOne: false
            referencedRelation: "stats"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "hero_exploration_challenge_attempts_trial_definition_id_fkey"
            columns: ["trial_definition_id"]
            isOneToOne: false
            referencedRelation: "trial_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_exploration_edges: {
        Row: {
          created_at: string
          direction_key: string
          exploration_id: string
          from_node_id: string
          id: string
          is_available: boolean
          label: string
          metadata_json: Json
          server_id: string
          sort_order: number
          to_node_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          direction_key: string
          exploration_id: string
          from_node_id: string
          id?: string
          is_available?: boolean
          label: string
          metadata_json?: Json
          server_id: string
          sort_order?: number
          to_node_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          direction_key?: string
          exploration_id?: string
          from_node_id?: string
          id?: string
          is_available?: boolean
          label?: string
          metadata_json?: Json
          server_id?: string
          sort_order?: number
          to_node_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hero_exploration_edges_exploration_id_fkey"
            columns: ["exploration_id"]
            isOneToOne: false
            referencedRelation: "hero_explorations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_exploration_edges_from_node_id_fkey"
            columns: ["from_node_id"]
            isOneToOne: false
            referencedRelation: "hero_exploration_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_exploration_edges_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_exploration_edges_to_node_id_fkey"
            columns: ["to_node_id"]
            isOneToOne: false
            referencedRelation: "hero_exploration_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_exploration_effects: {
        Row: {
          applied_at: string
          consumed_at: string | null
          consumed_by_id: string | null
          consumed_by_kind: string | null
          created_at: string
          effect_definition_id: string
          effect_kind: string
          exploration_id: string
          hero_id: string
          id: string
          is_active: boolean
          metadata_json: Json
          server_id: string
          source_id: string | null
          source_kind: string
          updated_at: string
        }
        Insert: {
          applied_at?: string
          consumed_at?: string | null
          consumed_by_id?: string | null
          consumed_by_kind?: string | null
          created_at?: string
          effect_definition_id: string
          effect_kind: string
          exploration_id: string
          hero_id: string
          id?: string
          is_active?: boolean
          metadata_json?: Json
          server_id: string
          source_id?: string | null
          source_kind: string
          updated_at?: string
        }
        Update: {
          applied_at?: string
          consumed_at?: string | null
          consumed_by_id?: string | null
          consumed_by_kind?: string | null
          created_at?: string
          effect_definition_id?: string
          effect_kind?: string
          exploration_id?: string
          hero_id?: string
          id?: string
          is_active?: boolean
          metadata_json?: Json
          server_id?: string
          source_id?: string | null
          source_kind?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hero_exploration_effects_effect_definition_id_fkey"
            columns: ["effect_definition_id"]
            isOneToOne: false
            referencedRelation: "exploration_effect_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_exploration_effects_exploration_id_fkey"
            columns: ["exploration_id"]
            isOneToOne: false
            referencedRelation: "hero_explorations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_exploration_effects_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_exploration_effects_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_exploration_nodes: {
        Row: {
          created_at: string
          created_sequence: number
          description_id: string | null
          distance_from_root: number
          exploration_id: string
          id: string
          label: string | null
          metadata_json: Json
          parent_node_id: string | null
          server_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_sequence: number
          description_id?: string | null
          distance_from_root?: number
          exploration_id: string
          id?: string
          label?: string | null
          metadata_json?: Json
          parent_node_id?: string | null
          server_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_sequence?: number
          description_id?: string | null
          distance_from_root?: number
          exploration_id?: string
          id?: string
          label?: string | null
          metadata_json?: Json
          parent_node_id?: string | null
          server_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hero_exploration_nodes_description_id_fkey"
            columns: ["description_id"]
            isOneToOne: false
            referencedRelation: "exploration_location_descriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_exploration_nodes_exploration_id_fkey"
            columns: ["exploration_id"]
            isOneToOne: false
            referencedRelation: "hero_explorations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_exploration_nodes_parent_node_id_fkey"
            columns: ["parent_node_id"]
            isOneToOne: false
            referencedRelation: "hero_exploration_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_exploration_nodes_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_exploration_steps: {
        Row: {
          created_at: string
          difficulty_key: string
          direction_key: string | null
          district_code: string
          edge_id: string | null
          encounter_chance: number | null
          encounter_definition_id: string | null
          encounter_roll: number | null
          exploration_id: string
          from_node_id: string
          hero_id: string
          id: string
          metadata_json: Json
          outcome_kind: string
          resolved_at: string | null
          resolves_at: string
          server_id: string
          started_at: string
          status: string
          step_kind: string
          to_node_id: string | null
          trial_definition_id: string | null
          trial_opportunity_chance: number | null
          trial_opportunity_roll: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          difficulty_key: string
          direction_key?: string | null
          district_code?: string
          edge_id?: string | null
          encounter_chance?: number | null
          encounter_definition_id?: string | null
          encounter_roll?: number | null
          exploration_id: string
          from_node_id: string
          hero_id: string
          id?: string
          metadata_json?: Json
          outcome_kind?: string
          resolved_at?: string | null
          resolves_at: string
          server_id: string
          started_at?: string
          status?: string
          step_kind: string
          to_node_id?: string | null
          trial_definition_id?: string | null
          trial_opportunity_chance?: number | null
          trial_opportunity_roll?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          difficulty_key?: string
          direction_key?: string | null
          district_code?: string
          edge_id?: string | null
          encounter_chance?: number | null
          encounter_definition_id?: string | null
          encounter_roll?: number | null
          exploration_id?: string
          from_node_id?: string
          hero_id?: string
          id?: string
          metadata_json?: Json
          outcome_kind?: string
          resolved_at?: string | null
          resolves_at?: string
          server_id?: string
          started_at?: string
          status?: string
          step_kind?: string
          to_node_id?: string | null
          trial_definition_id?: string | null
          trial_opportunity_chance?: number | null
          trial_opportunity_roll?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hero_exploration_steps_difficulty_key_fkey"
            columns: ["difficulty_key"]
            isOneToOne: false
            referencedRelation: "exploration_difficulty_tiers"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "hero_exploration_steps_district_code_fkey"
            columns: ["district_code"]
            isOneToOne: false
            referencedRelation: "estate_districts"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "hero_exploration_steps_edge_id_fkey"
            columns: ["edge_id"]
            isOneToOne: false
            referencedRelation: "hero_exploration_edges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_exploration_steps_encounter_definition_id_fkey"
            columns: ["encounter_definition_id"]
            isOneToOne: false
            referencedRelation: "encounter_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_exploration_steps_exploration_id_fkey"
            columns: ["exploration_id"]
            isOneToOne: false
            referencedRelation: "hero_explorations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_exploration_steps_from_node_id_fkey"
            columns: ["from_node_id"]
            isOneToOne: false
            referencedRelation: "hero_exploration_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_exploration_steps_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_exploration_steps_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_exploration_steps_to_node_id_fkey"
            columns: ["to_node_id"]
            isOneToOne: false
            referencedRelation: "hero_exploration_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_exploration_steps_trial_definition_id_fkey"
            columns: ["trial_definition_id"]
            isOneToOne: false
            referencedRelation: "trial_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_exploration_test_overrides: {
        Row: {
          consumed_at: string | null
          consumed_by_step_id: string | null
          created_at: string
          created_by: string | null
          difficulty_key: string
          encounter_definition_id: string | null
          expires_at: string
          force_manifestation_status: string | null
          forced_outcome_kind: string
          hero_id: string
          id: string
          is_consumed: boolean
          metadata_json: Json
          override_kind: string
          reason: string
          server_id: string
          trial_definition_id: string | null
          updated_at: string
        }
        Insert: {
          consumed_at?: string | null
          consumed_by_step_id?: string | null
          created_at?: string
          created_by?: string | null
          difficulty_key: string
          encounter_definition_id?: string | null
          expires_at?: string
          force_manifestation_status?: string | null
          forced_outcome_kind: string
          hero_id: string
          id?: string
          is_consumed?: boolean
          metadata_json?: Json
          override_kind?: string
          reason: string
          server_id: string
          trial_definition_id?: string | null
          updated_at?: string
        }
        Update: {
          consumed_at?: string | null
          consumed_by_step_id?: string | null
          created_at?: string
          created_by?: string | null
          difficulty_key?: string
          encounter_definition_id?: string | null
          expires_at?: string
          force_manifestation_status?: string | null
          forced_outcome_kind?: string
          hero_id?: string
          id?: string
          is_consumed?: boolean
          metadata_json?: Json
          override_kind?: string
          reason?: string
          server_id?: string
          trial_definition_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hero_exploration_test_overrides_consumed_by_step_id_fkey"
            columns: ["consumed_by_step_id"]
            isOneToOne: false
            referencedRelation: "hero_exploration_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_exploration_test_overrides_difficulty_key_fkey"
            columns: ["difficulty_key"]
            isOneToOne: false
            referencedRelation: "exploration_difficulty_tiers"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "hero_exploration_test_overrides_encounter_definition_id_fkey"
            columns: ["encounter_definition_id"]
            isOneToOne: false
            referencedRelation: "encounter_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_exploration_test_overrides_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_exploration_test_overrides_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_exploration_test_overrides_trial_definition_id_fkey"
            columns: ["trial_definition_id"]
            isOneToOne: false
            referencedRelation: "trial_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_explorations: {
        Row: {
          completed_at: string | null
          created_at: string
          current_node_id: string | null
          difficulty_key: string
          district_code: string
          exploration_date: string
          hero_id: string
          id: string
          metadata_json: Json
          server_id: string
          started_at: string
          status: string
          trial_dry_step_count: number
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_node_id?: string | null
          difficulty_key: string
          district_code?: string
          exploration_date: string
          hero_id: string
          id?: string
          metadata_json?: Json
          server_id: string
          started_at?: string
          status?: string
          trial_dry_step_count?: number
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_node_id?: string | null
          difficulty_key?: string
          district_code?: string
          exploration_date?: string
          hero_id?: string
          id?: string
          metadata_json?: Json
          server_id?: string
          started_at?: string
          status?: string
          trial_dry_step_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hero_explorations_current_node_id_fkey"
            columns: ["current_node_id"]
            isOneToOne: false
            referencedRelation: "hero_exploration_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_explorations_difficulty_key_fkey"
            columns: ["difficulty_key"]
            isOneToOne: false
            referencedRelation: "exploration_difficulty_tiers"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "hero_explorations_district_code_fkey"
            columns: ["district_code"]
            isOneToOne: false
            referencedRelation: "estate_districts"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "hero_explorations_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_explorations_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_health_state: {
        Row: {
          created_at: string
          current_health: number
          hero_id: string
          max_health_snapshot: number
          metadata_json: Json
          reset_policy_key: string
          server_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_health: number
          hero_id: string
          max_health_snapshot: number
          metadata_json?: Json
          reset_policy_key?: string
          server_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_health?: number
          hero_id?: string
          max_health_snapshot?: number
          metadata_json?: Json
          reset_policy_key?: string
          server_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hero_health_state_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: true
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_health_state_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_level_stat_bonus_grants: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          grant_kind: string
          hero_id: string
          id: string
          level_up_ledger_id: string
          metadata_json: Json
          parent_experience_ledger_id: string | null
          random_total_amount: number | null
          random_weight_snapshot: number | null
          reached_level: number
          rule_id: string
          rule_stat_id: string | null
          server_id: string
          stat_key: string
          value_after: number
          value_before: number
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          grant_kind: string
          hero_id: string
          id?: string
          level_up_ledger_id: string
          metadata_json?: Json
          parent_experience_ledger_id?: string | null
          random_total_amount?: number | null
          random_weight_snapshot?: number | null
          reached_level: number
          rule_id: string
          rule_stat_id?: string | null
          server_id: string
          stat_key: string
          value_after: number
          value_before: number
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          grant_kind?: string
          hero_id?: string
          id?: string
          level_up_ledger_id?: string
          metadata_json?: Json
          parent_experience_ledger_id?: string | null
          random_total_amount?: number | null
          random_weight_snapshot?: number | null
          reached_level?: number
          rule_id?: string
          rule_stat_id?: string | null
          server_id?: string
          stat_key?: string
          value_after?: number
          value_before?: number
        }
        Relationships: [
          {
            foreignKeyName: "hero_level_stat_bonus_grants_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_level_stat_bonus_grants_level_up_ledger_id_fkey"
            columns: ["level_up_ledger_id"]
            isOneToOne: false
            referencedRelation: "hero_progression_ledger"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_level_stat_bonus_grants_parent_experience_ledger_id_fkey"
            columns: ["parent_experience_ledger_id"]
            isOneToOne: false
            referencedRelation: "hero_progression_ledger"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_level_stat_bonus_grants_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "level_up_stat_bonus_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_level_stat_bonus_grants_rule_stat_id_fkey"
            columns: ["rule_stat_id"]
            isOneToOne: false
            referencedRelation: "level_up_stat_bonus_rule_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_level_stat_bonus_grants_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_level_stat_bonus_grants_stat_key_fkey"
            columns: ["stat_key"]
            isOneToOne: false
            referencedRelation: "stats"
            referencedColumns: ["key"]
          },
        ]
      }
      hero_loadout_preset_settings: {
        Row: {
          created_at: string
          id: boolean
          is_active: boolean
          preset_limit: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          id?: boolean
          is_active?: boolean
          preset_limit?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          id?: boolean
          is_active?: boolean
          preset_limit?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      hero_loadout_preset_slots: {
        Row: {
          created_at: string
          generation_base_id_snapshot: string | null
          generation_quality_key_snapshot: string | null
          item_id: string
          item_name_snapshot: string | null
          item_status_snapshot:
            | Database["public"]["Enums"]["item_status"]
            | null
          prefix_affix_id_snapshot: string | null
          preset_id: string
          saved_from_equipped_at: string | null
          slot_key: string
          suffix_affix_id_snapshot: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          generation_base_id_snapshot?: string | null
          generation_quality_key_snapshot?: string | null
          item_id: string
          item_name_snapshot?: string | null
          item_status_snapshot?:
            | Database["public"]["Enums"]["item_status"]
            | null
          prefix_affix_id_snapshot?: string | null
          preset_id: string
          saved_from_equipped_at?: string | null
          slot_key: string
          suffix_affix_id_snapshot?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          generation_base_id_snapshot?: string | null
          generation_quality_key_snapshot?: string | null
          item_id?: string
          item_name_snapshot?: string | null
          item_status_snapshot?:
            | Database["public"]["Enums"]["item_status"]
            | null
          prefix_affix_id_snapshot?: string | null
          preset_id?: string
          saved_from_equipped_at?: string | null
          slot_key?: string
          suffix_affix_id_snapshot?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hero_loadout_preset_slots_preset_id_fkey"
            columns: ["preset_id"]
            isOneToOne: false
            referencedRelation: "hero_loadout_presets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_loadout_preset_slots_slot_key_fkey"
            columns: ["slot_key"]
            isOneToOne: false
            referencedRelation: "equipment_slot_definitions"
            referencedColumns: ["key"]
          },
        ]
      }
      hero_loadout_presets: {
        Row: {
          cleared_at: string | null
          created_at: string
          hero_id: string
          id: string
          name: string
          preset_number: number
          saved_at: string | null
          updated_at: string
        }
        Insert: {
          cleared_at?: string | null
          created_at?: string
          hero_id: string
          id?: string
          name: string
          preset_number: number
          saved_at?: string | null
          updated_at?: string
        }
        Update: {
          cleared_at?: string | null
          created_at?: string
          hero_id?: string
          id?: string
          name?: string
          preset_number?: number
          saved_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hero_loadout_presets_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_prestige: {
        Row: {
          created_at: string
          current_points: number
          current_rank_number: number
          current_rank_uuid: string | null
          hero_id: string
          last_ledger_id: string | null
          metadata_json: Json
          server_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_points?: number
          current_rank_number?: number
          current_rank_uuid?: string | null
          hero_id: string
          last_ledger_id?: string | null
          metadata_json?: Json
          server_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_points?: number
          current_rank_number?: number
          current_rank_uuid?: string | null
          hero_id?: string
          last_ledger_id?: string | null
          metadata_json?: Json
          server_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hero_prestige_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: true
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_prestige_last_ledger_id_fkey"
            columns: ["last_ledger_id"]
            isOneToOne: false
            referencedRelation: "hero_prestige_ledger"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_prestige_ledger: {
        Row: {
          admin_context_json: Json
          created_at: string
          hero_id: string
          id: string
          message_kind: string
          metadata_json: Json
          player_summary_json: Json
          points_after: number
          points_before: number
          points_delta: number
          rank_number_after: number
          rank_number_before: number
          rank_uuid_after: string | null
          rank_uuid_before: string | null
          request_id: string | null
          server_id: string
          source_entity_id: string | null
          source_entity_type: string | null
          source_kind: string
        }
        Insert: {
          admin_context_json?: Json
          created_at?: string
          hero_id: string
          id?: string
          message_kind: string
          metadata_json?: Json
          player_summary_json?: Json
          points_after: number
          points_before: number
          points_delta: number
          rank_number_after: number
          rank_number_before: number
          rank_uuid_after?: string | null
          rank_uuid_before?: string | null
          request_id?: string | null
          server_id: string
          source_entity_id?: string | null
          source_entity_type?: string | null
          source_kind: string
        }
        Update: {
          admin_context_json?: Json
          created_at?: string
          hero_id?: string
          id?: string
          message_kind?: string
          metadata_json?: Json
          player_summary_json?: Json
          points_after?: number
          points_before?: number
          points_delta?: number
          rank_number_after?: number
          rank_number_before?: number
          rank_uuid_after?: string | null
          rank_uuid_before?: string | null
          request_id?: string | null
          server_id?: string
          source_entity_id?: string | null
          source_entity_type?: string | null
          source_kind?: string
        }
        Relationships: [
          {
            foreignKeyName: "hero_prestige_ledger_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_prestige_ledger_message_kind_fkey"
            columns: ["message_kind"]
            isOneToOne: false
            referencedRelation: "prestige_change_message_kinds"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "hero_prestige_ledger_source_kind_fkey"
            columns: ["source_kind"]
            isOneToOne: false
            referencedRelation: "prestige_source_kinds"
            referencedColumns: ["key"]
          },
        ]
      }
      hero_progression_ledger: {
        Row: {
          character_points_balance_after: number | null
          character_points_gross_delta: number
          created_at: string
          created_by: string | null
          entry_kind: string
          experience_after: number | null
          experience_before: number | null
          experience_delta: number
          hero_id: string
          id: string
          level_after: number | null
          level_before: number | null
          metadata_json: Json
          parent_ledger_id: string | null
          reached_level: number | null
          reason: string
          request_id: string | null
          server_id: string
          source_id: string
          source_kind: string
          total_experience_earned_after: number | null
          total_experience_earned_before: number | null
          xp_threshold: number | null
        }
        Insert: {
          character_points_balance_after?: number | null
          character_points_gross_delta?: number
          created_at?: string
          created_by?: string | null
          entry_kind: string
          experience_after?: number | null
          experience_before?: number | null
          experience_delta?: number
          hero_id: string
          id?: string
          level_after?: number | null
          level_before?: number | null
          metadata_json?: Json
          parent_ledger_id?: string | null
          reached_level?: number | null
          reason: string
          request_id?: string | null
          server_id: string
          source_id: string
          source_kind: string
          total_experience_earned_after?: number | null
          total_experience_earned_before?: number | null
          xp_threshold?: number | null
        }
        Update: {
          character_points_balance_after?: number | null
          character_points_gross_delta?: number
          created_at?: string
          created_by?: string | null
          entry_kind?: string
          experience_after?: number | null
          experience_before?: number | null
          experience_delta?: number
          hero_id?: string
          id?: string
          level_after?: number | null
          level_before?: number | null
          metadata_json?: Json
          parent_ledger_id?: string | null
          reached_level?: number | null
          reason?: string
          request_id?: string | null
          server_id?: string
          source_id?: string
          source_kind?: string
          total_experience_earned_after?: number | null
          total_experience_earned_before?: number | null
          xp_threshold?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hero_progression_ledger_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_progression_ledger_parent_ledger_id_fkey"
            columns: ["parent_ledger_id"]
            isOneToOne: false
            referencedRelation: "hero_progression_ledger"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_progression_ledger_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_resource_ledger: {
        Row: {
          amount_delta: number
          balance_after: number
          created_at: string
          hero_id: string
          id: string
          reason: string
          related_entity_id: string | null
          related_entity_type: string | null
          resource_type: string
          server_id: string
        }
        Insert: {
          amount_delta: number
          balance_after: number
          created_at?: string
          hero_id: string
          id?: string
          reason: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          resource_type: string
          server_id: string
        }
        Update: {
          amount_delta?: number
          balance_after?: number
          created_at?: string
          hero_id?: string
          id?: string
          reason?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          resource_type?: string
          server_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hero_resource_ledger_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_resource_ledger_resource_type_fkey"
            columns: ["resource_type"]
            isOneToOne: false
            referencedRelation: "resource_types"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "hero_resource_ledger_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
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
          {
            foreignKeyName: "hero_resources_resource_type_fkey"
            columns: ["resource_type"]
            isOneToOne: false
            referencedRelation: "resource_types"
            referencedColumns: ["key"]
          },
        ]
      }
      hero_runtime_activities: {
        Row: {
          activity_kind: string
          available_at: string | null
          created_at: string
          ended_at: string | null
          expires_at: string | null
          hero_id: string
          id: string
          metadata_json: Json
          reason: string | null
          request_id: string | null
          server_id: string
          source_entity_id: string | null
          source_entity_type: string | null
          started_at: string
          status: string
          updated_at: string
        }
        Insert: {
          activity_kind: string
          available_at?: string | null
          created_at?: string
          ended_at?: string | null
          expires_at?: string | null
          hero_id: string
          id?: string
          metadata_json?: Json
          reason?: string | null
          request_id?: string | null
          server_id: string
          source_entity_id?: string | null
          source_entity_type?: string | null
          started_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          activity_kind?: string
          available_at?: string | null
          created_at?: string
          ended_at?: string | null
          expires_at?: string | null
          hero_id?: string
          id?: string
          metadata_json?: Json
          reason?: string | null
          request_id?: string | null
          server_id?: string
          source_entity_id?: string | null
          source_entity_type?: string | null
          started_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hero_runtime_activities_activity_kind_fkey"
            columns: ["activity_kind"]
            isOneToOne: false
            referencedRelation: "hero_runtime_activity_kinds"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "hero_runtime_activities_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_runtime_activities_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_runtime_activities_status_fkey"
            columns: ["status"]
            isOneToOne: false
            referencedRelation: "hero_runtime_activity_statuses"
            referencedColumns: ["key"]
          },
        ]
      }
      hero_runtime_activity_kinds: {
        Row: {
          admin_description: string | null
          blocks_other_activity: boolean
          created_at: string
          description: string
          helper_text: string | null
          is_active: boolean
          key: string
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          blocks_other_activity?: boolean
          created_at?: string
          description: string
          helper_text?: string | null
          is_active?: boolean
          key: string
          label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          blocks_other_activity?: boolean
          created_at?: string
          description?: string
          helper_text?: string | null
          is_active?: boolean
          key?: string
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      hero_runtime_activity_statuses: {
        Row: {
          admin_description: string | null
          created_at: string
          description: string
          helper_text: string | null
          is_active: boolean
          is_blocking: boolean
          is_terminal: boolean
          key: string
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          description: string
          helper_text?: string | null
          is_active?: boolean
          is_blocking?: boolean
          is_terminal?: boolean
          key: string
          label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          description?: string
          helper_text?: string | null
          is_active?: boolean
          is_blocking?: boolean
          is_terminal?: boolean
          key?: string
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
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
      item_generation_affix_allowed_targets: {
        Row: {
          affix_id: string
          created_at: string
          id: string
          is_active: boolean
          metadata_json: Json
          target_key: string
          target_kind: string
          updated_at: string
        }
        Insert: {
          affix_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          metadata_json?: Json
          target_key: string
          target_kind: string
          updated_at?: string
        }
        Update: {
          affix_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          metadata_json?: Json
          target_key?: string
          target_kind?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_generation_affix_allowed_targets_affix_id_fkey"
            columns: ["affix_id"]
            isOneToOne: false
            referencedRelation: "item_generation_affixes"
            referencedColumns: ["id"]
          },
        ]
      }
      item_generation_affix_families: {
        Row: {
          bonus_recipe_json: Json
          created_at: string
          description: string | null
          drachma_value_recipe_json: Json
          id: string
          is_active: boolean
          key: string
          kind: string
          label: string
          metadata_json: Json
          requirement_recipe_json: Json
          sort_order: number
          target_policy_json: Json
          updated_at: string
        }
        Insert: {
          bonus_recipe_json?: Json
          created_at?: string
          description?: string | null
          drachma_value_recipe_json?: Json
          id?: string
          is_active?: boolean
          key: string
          kind: string
          label: string
          metadata_json?: Json
          requirement_recipe_json?: Json
          sort_order?: number
          target_policy_json?: Json
          updated_at?: string
        }
        Update: {
          bonus_recipe_json?: Json
          created_at?: string
          description?: string | null
          drachma_value_recipe_json?: Json
          id?: string
          is_active?: boolean
          key?: string
          kind?: string
          label?: string
          metadata_json?: Json
          requirement_recipe_json?: Json
          sort_order?: number
          target_policy_json?: Json
          updated_at?: string
        }
        Relationships: []
      }
      item_generation_affix_family_members: {
        Row: {
          affix_id: string
          created_at: string
          family_id: string
          notes: string | null
          tier_index: number | null
          tier_key: string | null
          updated_at: string
        }
        Insert: {
          affix_id: string
          created_at?: string
          family_id: string
          notes?: string | null
          tier_index?: number | null
          tier_key?: string | null
          updated_at?: string
        }
        Update: {
          affix_id?: string
          created_at?: string
          family_id?: string
          notes?: string | null
          tier_index?: number | null
          tier_key?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_generation_affix_family_members_affix_id_fkey"
            columns: ["affix_id"]
            isOneToOne: false
            referencedRelation: "item_generation_affixes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_generation_affix_family_members_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "item_generation_affix_families"
            referencedColumns: ["id"]
          },
        ]
      }
      item_generation_affix_growth_patterns: {
        Row: {
          created_at: string
          description: string | null
          is_active: boolean
          key: string
          label: string
          sort_order: number
          unit: string
          updated_at: string
          values_json: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          is_active?: boolean
          key: string
          label: string
          sort_order?: number
          unit?: string
          updated_at?: string
          values_json: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          is_active?: boolean
          key?: string
          label?: string
          sort_order?: number
          unit?: string
          updated_at?: string
          values_json?: Json
        }
        Relationships: []
      }
      item_generation_affix_set_kind_requirements: {
        Row: {
          base_type_key: string
          created_at: string
          required_count: number
          set_kind: string
          sort_order: number
        }
        Insert: {
          base_type_key: string
          created_at?: string
          required_count: number
          set_kind: string
          sort_order?: number
        }
        Update: {
          base_type_key?: string
          created_at?: string
          required_count?: number
          set_kind?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "item_generation_affix_set_kind_requirements_base_type_key_fkey"
            columns: ["base_type_key"]
            isOneToOne: false
            referencedRelation: "item_generation_base_types"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "item_generation_affix_set_kind_requirements_set_kind_fkey"
            columns: ["set_kind"]
            isOneToOne: false
            referencedRelation: "item_generation_affix_set_kinds"
            referencedColumns: ["key"]
          },
        ]
      }
      item_generation_affix_set_kinds: {
        Row: {
          created_at: string
          description: string | null
          helper_text: string | null
          is_active: boolean
          key: string
          label: string
          metadata_json: Json
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          helper_text?: string | null
          is_active?: boolean
          key: string
          label: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          helper_text?: string | null
          is_active?: boolean
          key?: string
          label?: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      item_generation_affix_sets: {
        Row: {
          created_at: string
          description: string | null
          helper_text: string | null
          id: string
          is_active: boolean
          label: string
          metadata_json: Json
          prefix_affix_id: string
          set_kind: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          helper_text?: string | null
          id?: string
          is_active?: boolean
          label: string
          metadata_json?: Json
          prefix_affix_id: string
          set_kind: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          helper_text?: string | null
          id?: string
          is_active?: boolean
          label?: string
          metadata_json?: Json
          prefix_affix_id?: string
          set_kind?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_generation_affix_sets_prefix_affix_id_fkey"
            columns: ["prefix_affix_id"]
            isOneToOne: true
            referencedRelation: "item_generation_affixes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_generation_affix_sets_set_kind_fkey"
            columns: ["set_kind"]
            isOneToOne: false
            referencedRelation: "item_generation_affix_set_kinds"
            referencedColumns: ["key"]
          },
        ]
      }
      item_generation_affix_target_categories: {
        Row: {
          created_at: string
          description: string | null
          is_active: boolean
          key: string
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          is_active?: boolean
          key: string
          label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          is_active?: boolean
          key?: string
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      item_generation_affix_target_category_members: {
        Row: {
          base_type_key: string
          category_key: string
          created_at: string
          sort_order: number
        }
        Insert: {
          base_type_key: string
          category_key: string
          created_at?: string
          sort_order?: number
        }
        Update: {
          base_type_key?: string
          category_key?: string
          created_at?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "item_generation_affix_target_category_member_base_type_key_fkey"
            columns: ["base_type_key"]
            isOneToOne: false
            referencedRelation: "item_generation_base_types"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "item_generation_affix_target_category_members_category_key_fkey"
            columns: ["category_key"]
            isOneToOne: false
            referencedRelation: "item_generation_affix_target_categories"
            referencedColumns: ["key"]
          },
        ]
      }
      item_generation_affixes: {
        Row: {
          created_at: string
          description: string | null
          display_forms_json: Json
          gold_value: number
          id: string
          is_legacy: boolean
          key: string
          kind: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_forms_json?: Json
          gold_value: number
          id?: string
          is_legacy?: boolean
          key: string
          kind: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_forms_json?: Json
          gold_value?: number
          id?: string
          is_legacy?: boolean
          key?: string
          kind?: string
          name?: string
          updated_at?: string
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
      item_generation_base_type_equip_targets: {
        Row: {
          admin_description: string | null
          base_type_key: string
          created_at: string
          equip_target_key: string
          equipment_area: string
          helper_text: string | null
          is_active: boolean
          label: string
          metadata_json: Json
          physical_slot_keys: string[]
          player_facing_slot_summary: string
          slot_selection_mode: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          base_type_key: string
          created_at?: string
          equip_target_key: string
          equipment_area: string
          helper_text?: string | null
          is_active?: boolean
          label: string
          metadata_json?: Json
          physical_slot_keys: string[]
          player_facing_slot_summary: string
          slot_selection_mode: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          base_type_key?: string
          created_at?: string
          equip_target_key?: string
          equipment_area?: string
          helper_text?: string | null
          is_active?: boolean
          label?: string
          metadata_json?: Json
          physical_slot_keys?: string[]
          player_facing_slot_summary?: string
          slot_selection_mode?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_generation_base_type_equip_targets_base_type_key_fkey"
            columns: ["base_type_key"]
            isOneToOne: true
            referencedRelation: "item_generation_base_types"
            referencedColumns: ["key"]
          },
        ]
      }
      item_generation_base_type_targets: {
        Row: {
          base_type_key: string
          bonus_target_key: string
          created_at: string
          default_value: number | null
          display_group: string | null
          display_group_role: string | null
          display_label: string | null
          display_role: string
          helper_text: string | null
          hide_when_default: boolean
          hide_when_zero: boolean
          id: string
          is_player_visible: boolean
          is_required: boolean
          max_value: number | null
          min_required_in_group: number | null
          min_value: number | null
          required_group_key: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          base_type_key: string
          bonus_target_key: string
          created_at?: string
          default_value?: number | null
          display_group?: string | null
          display_group_role?: string | null
          display_label?: string | null
          display_role?: string
          helper_text?: string | null
          hide_when_default?: boolean
          hide_when_zero?: boolean
          id?: string
          is_player_visible?: boolean
          is_required?: boolean
          max_value?: number | null
          min_required_in_group?: number | null
          min_value?: number | null
          required_group_key?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          base_type_key?: string
          bonus_target_key?: string
          created_at?: string
          default_value?: number | null
          display_group?: string | null
          display_group_role?: string | null
          display_label?: string | null
          display_role?: string
          helper_text?: string | null
          hide_when_default?: boolean
          hide_when_zero?: boolean
          id?: string
          is_player_visible?: boolean
          is_required?: boolean
          max_value?: number | null
          min_required_in_group?: number | null
          min_value?: number | null
          required_group_key?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_generation_base_type_targets_base_type_key_fkey"
            columns: ["base_type_key"]
            isOneToOne: false
            referencedRelation: "item_generation_base_types"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "item_generation_base_type_targets_bonus_target_key_fkey"
            columns: ["bonus_target_key"]
            isOneToOne: false
            referencedRelation: "bonus_targets"
            referencedColumns: ["key"]
          },
        ]
      }
      item_generation_base_types: {
        Row: {
          created_at: string
          description: string | null
          equipment_slot_group: string
          hand_usage: string
          id: string
          is_active: boolean
          key: string
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          equipment_slot_group: string
          hand_usage: string
          id?: string
          is_active?: boolean
          key: string
          label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          equipment_slot_group?: string
          hand_usage?: string
          id?: string
          is_active?: boolean
          key?: string
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      item_generation_bases: {
        Row: {
          base_type_key: string
          base_value: number
          created_at: string
          description: string | null
          grammatical_gender: string
          grammatical_number: string
          id: string
          is_legacy: boolean
          key: string
          name: string
          slot: string | null
          updated_at: string
        }
        Insert: {
          base_type_key: string
          base_value: number
          created_at?: string
          description?: string | null
          grammatical_gender?: string
          grammatical_number?: string
          id?: string
          is_legacy?: boolean
          key: string
          name: string
          slot?: string | null
          updated_at?: string
        }
        Update: {
          base_type_key?: string
          base_value?: number
          created_at?: string
          description?: string | null
          grammatical_gender?: string
          grammatical_number?: string
          id?: string
          is_legacy?: boolean
          key?: string
          name?: string
          slot?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_generation_bases_base_type_key_fkey"
            columns: ["base_type_key"]
            isOneToOne: false
            referencedRelation: "item_generation_base_types"
            referencedColumns: ["key"]
          },
        ]
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
          display_forms_json: Json
          id: string
          is_enabled: boolean
          key: string
          label: string
          multiplier: number
          requirement_multiplier: number
          sort_order: number
          weight: number
        }
        Insert: {
          created_at?: string
          display_forms_json?: Json
          id?: string
          is_enabled?: boolean
          key: string
          label: string
          multiplier: number
          requirement_multiplier?: number
          sort_order?: number
          weight: number
        }
        Update: {
          created_at?: string
          display_forms_json?: Json
          id?: string
          is_enabled?: boolean
          key?: string
          label?: string
          multiplier?: number
          requirement_multiplier?: number
          sort_order?: number
          weight?: number
        }
        Relationships: []
      }
      item_requirement_aggregation_settings: {
        Row: {
          additional_requirement_fraction: number
          created_at: string
          id: boolean
          is_active: boolean
          min_required_value: number
          rounding_mode: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          additional_requirement_fraction?: number
          created_at?: string
          id?: boolean
          is_active?: boolean
          min_required_value?: number
          rounding_mode?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          additional_requirement_fraction?: number
          created_at?: string
          id?: boolean
          is_active?: boolean
          min_required_value?: number
          rounding_mode?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      items: {
        Row: {
          armory_shelf_position: number
          created_at: string | null
          description: string | null
          drachma_value: number | null
          generated_at: string
          generation_base_id: string | null
          generation_quality_key: string | null
          hero_id: string
          id: string
          metadata_json: Json
          name: string
          prefix_affix_id: string | null
          recoverable_until: string | null
          scrapped_at: string | null
          server_id: string
          status: Database["public"]["Enums"]["item_status"]
          suffix_affix_id: string | null
          updated_at: string
        }
        Insert: {
          armory_shelf_position?: number
          created_at?: string | null
          description?: string | null
          drachma_value?: number | null
          generated_at?: string
          generation_base_id?: string | null
          generation_quality_key?: string | null
          hero_id: string
          id?: string
          metadata_json?: Json
          name: string
          prefix_affix_id?: string | null
          recoverable_until?: string | null
          scrapped_at?: string | null
          server_id: string
          status?: Database["public"]["Enums"]["item_status"]
          suffix_affix_id?: string | null
          updated_at?: string
        }
        Update: {
          armory_shelf_position?: number
          created_at?: string | null
          description?: string | null
          drachma_value?: number | null
          generated_at?: string
          generation_base_id?: string | null
          generation_quality_key?: string | null
          hero_id?: string
          id?: string
          metadata_json?: Json
          name?: string
          prefix_affix_id?: string | null
          recoverable_until?: string | null
          scrapped_at?: string | null
          server_id?: string
          status?: Database["public"]["Enums"]["item_status"]
          suffix_affix_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "items_generation_base_id_fkey"
            columns: ["generation_base_id"]
            isOneToOne: false
            referencedRelation: "item_generation_bases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_generation_quality_key_fkey"
            columns: ["generation_quality_key"]
            isOneToOne: false
            referencedRelation: "item_generation_qualities"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "items_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_prefix_affix_id_fkey"
            columns: ["prefix_affix_id"]
            isOneToOne: false
            referencedRelation: "item_generation_affixes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_suffix_affix_id_fkey"
            columns: ["suffix_affix_id"]
            isOneToOne: false
            referencedRelation: "item_generation_affixes"
            referencedColumns: ["id"]
          },
        ]
      }
      level_up_stat_bonus_rule_stats: {
        Row: {
          admin_description: string | null
          created_at: string
          created_by: string | null
          helper_text: string | null
          id: string
          is_active: boolean
          max_points_per_level: number | null
          metadata_json: Json
          rule_id: string
          sort_order: number
          stat_key: string
          updated_at: string
          updated_by: string | null
          weight: number
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          created_by?: string | null
          helper_text?: string | null
          id?: string
          is_active?: boolean
          max_points_per_level?: number | null
          metadata_json?: Json
          rule_id: string
          sort_order?: number
          stat_key: string
          updated_at?: string
          updated_by?: string | null
          weight?: number
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          created_by?: string | null
          helper_text?: string | null
          id?: string
          is_active?: boolean
          max_points_per_level?: number | null
          metadata_json?: Json
          rule_id?: string
          sort_order?: number
          stat_key?: string
          updated_at?: string
          updated_by?: string | null
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "level_up_stat_bonus_rule_stats_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "level_up_stat_bonus_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "level_up_stat_bonus_rule_stats_stat_key_fkey"
            columns: ["stat_key"]
            isOneToOne: false
            referencedRelation: "stats"
            referencedColumns: ["key"]
          },
        ]
      }
      level_up_stat_bonus_rules: {
        Row: {
          admin_description: string | null
          created_at: string
          created_by: string | null
          description: string
          fixed_amount: number | null
          fixed_stat_key: string | null
          helper_text: string | null
          id: string
          is_active: boolean
          key: string
          label: string
          level_interval: number | null
          level_match_kind: string
          level_value: number | null
          max_level_value: number | null
          max_total_amount: number | null
          metadata_json: Json
          min_total_amount: number | null
          rule_kind: string
          sort_order: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          fixed_amount?: number | null
          fixed_stat_key?: string | null
          helper_text?: string | null
          id?: string
          is_active?: boolean
          key: string
          label: string
          level_interval?: number | null
          level_match_kind?: string
          level_value?: number | null
          max_level_value?: number | null
          max_total_amount?: number | null
          metadata_json?: Json
          min_total_amount?: number | null
          rule_kind?: string
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          fixed_amount?: number | null
          fixed_stat_key?: string | null
          helper_text?: string | null
          id?: string
          is_active?: boolean
          key?: string
          label?: string
          level_interval?: number | null
          level_match_kind?: string
          level_value?: number | null
          max_level_value?: number | null
          max_total_amount?: number | null
          metadata_json?: Json
          min_total_amount?: number | null
          rule_kind?: string
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "level_up_stat_bonus_rules_fixed_stat_key_fkey"
            columns: ["fixed_stat_key"]
            isOneToOne: false
            referencedRelation: "stats"
            referencedColumns: ["key"]
          },
        ]
      }
      locale_definitions: {
        Row: {
          created_at: string
          description: string | null
          is_active: boolean
          is_default: boolean
          key: string
          label: string
          metadata_json: Json
          native_label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          is_active?: boolean
          is_default?: boolean
          key: string
          label: string
          metadata_json?: Json
          native_label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          is_active?: boolean
          is_default?: boolean
          key?: string
          label?: string
          metadata_json?: Json
          native_label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      localized_entity_texts: {
        Row: {
          created_at: string
          entity_key: string
          entity_type: string
          field_key: string
          id: string
          is_active: boolean
          locale_key: string
          metadata_json: Json
          source_locale_key: string | null
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          entity_key: string
          entity_type: string
          field_key: string
          id?: string
          is_active?: boolean
          locale_key: string
          metadata_json?: Json
          source_locale_key?: string | null
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          entity_key?: string
          entity_type?: string
          field_key?: string
          id?: string
          is_active?: boolean
          locale_key?: string
          metadata_json?: Json
          source_locale_key?: string | null
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "localized_entity_texts_locale_key_fkey"
            columns: ["locale_key"]
            isOneToOne: false
            referencedRelation: "locale_definitions"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "localized_entity_texts_source_locale_key_fkey"
            columns: ["source_locale_key"]
            isOneToOne: false
            referencedRelation: "locale_definitions"
            referencedColumns: ["key"]
          },
        ]
      }
      manual_trial_action_log_statuses: {
        Row: {
          admin_description: string | null
          created_at: string
          description: string
          helper_text: string | null
          is_active: boolean
          is_player_visible: boolean
          is_terminal: boolean
          key: string
          label: string
          metadata_json: Json
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          description: string
          helper_text?: string | null
          is_active?: boolean
          is_player_visible?: boolean
          is_terminal?: boolean
          key: string
          label: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          description?: string
          helper_text?: string | null
          is_active?: boolean
          is_player_visible?: boolean
          is_terminal?: boolean
          key?: string
          label?: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      manual_trial_action_logs: {
        Row: {
          accepted_at: string | null
          action_log_json: Json
          admin_context_json: Json
          attempt_id: string
          backend_replay_json: Json
          client_environment_summary_json: Json
          client_observed_summary_json: Json
          client_timing_summary_json: Json
          created_at: string
          failure_reason_key: string | null
          hero_id: string
          id: string
          manifest_hash: string
          manifest_id: string
          manifest_version: number
          manual_session_id: string
          metadata_json: Json
          received_at: string
          rejected_at: string | null
          replayed_at: string | null
          request_id: string
          server_id: string
          status_key: string
          updated_at: string
          validation_reason_key: string | null
          validation_summary_json: Json
        }
        Insert: {
          accepted_at?: string | null
          action_log_json?: Json
          admin_context_json?: Json
          attempt_id: string
          backend_replay_json?: Json
          client_environment_summary_json?: Json
          client_observed_summary_json?: Json
          client_timing_summary_json?: Json
          created_at?: string
          failure_reason_key?: string | null
          hero_id: string
          id?: string
          manifest_hash: string
          manifest_id: string
          manifest_version: number
          manual_session_id: string
          metadata_json?: Json
          received_at?: string
          rejected_at?: string | null
          replayed_at?: string | null
          request_id: string
          server_id: string
          status_key?: string
          updated_at?: string
          validation_reason_key?: string | null
          validation_summary_json?: Json
        }
        Update: {
          accepted_at?: string | null
          action_log_json?: Json
          admin_context_json?: Json
          attempt_id?: string
          backend_replay_json?: Json
          client_environment_summary_json?: Json
          client_observed_summary_json?: Json
          client_timing_summary_json?: Json
          created_at?: string
          failure_reason_key?: string | null
          hero_id?: string
          id?: string
          manifest_hash?: string
          manifest_id?: string
          manifest_version?: number
          manual_session_id?: string
          metadata_json?: Json
          received_at?: string
          rejected_at?: string | null
          replayed_at?: string | null
          request_id?: string
          server_id?: string
          status_key?: string
          updated_at?: string
          validation_reason_key?: string | null
          validation_summary_json?: Json
        }
        Relationships: [
          {
            foreignKeyName: "manual_trial_action_logs_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "hero_exploration_challenge_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_trial_action_logs_failure_reason_key_fkey"
            columns: ["failure_reason_key"]
            isOneToOne: false
            referencedRelation: "manual_trial_failure_reasons"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "manual_trial_action_logs_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_trial_action_logs_manifest_id_fkey"
            columns: ["manifest_id"]
            isOneToOne: false
            referencedRelation: "manual_trial_manifests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_trial_action_logs_manual_session_id_fkey"
            columns: ["manual_session_id"]
            isOneToOne: false
            referencedRelation: "manual_trial_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_trial_action_logs_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_trial_action_logs_status_key_fkey"
            columns: ["status_key"]
            isOneToOne: false
            referencedRelation: "manual_trial_action_log_statuses"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "manual_trial_action_logs_validation_reason_key_fkey"
            columns: ["validation_reason_key"]
            isOneToOne: false
            referencedRelation: "manual_trial_validation_reasons"
            referencedColumns: ["key"]
          },
        ]
      }
      manual_trial_failure_reasons: {
        Row: {
          admin_description: string | null
          created_at: string
          description: string
          helper_text: string | null
          is_active: boolean
          is_player_visible: boolean
          key: string
          label: string
          metadata_json: Json
          reason_family: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          description: string
          helper_text?: string | null
          is_active?: boolean
          is_player_visible?: boolean
          key: string
          label: string
          metadata_json?: Json
          reason_family: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          description?: string
          helper_text?: string | null
          is_active?: boolean
          is_player_visible?: boolean
          key?: string
          label?: string
          metadata_json?: Json
          reason_family?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      manual_trial_manifest_statuses: {
        Row: {
          admin_description: string | null
          created_at: string
          description: string
          helper_text: string | null
          is_active: boolean
          is_player_visible: boolean
          is_terminal: boolean
          key: string
          label: string
          metadata_json: Json
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          description: string
          helper_text?: string | null
          is_active?: boolean
          is_player_visible?: boolean
          is_terminal?: boolean
          key: string
          label: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          description?: string
          helper_text?: string | null
          is_active?: boolean
          is_player_visible?: boolean
          is_terminal?: boolean
          key?: string
          label?: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      manual_trial_manifests: {
        Row: {
          accessibility_policy_json: Json
          admin_context_json: Json
          attempt_id: string
          config_hash: string | null
          consumed_at: string | null
          created_at: string
          expires_at: string | null
          generated_at: string
          hero_id: string
          id: string
          inactivity_policy_json: Json
          invalidated_at: string | null
          manifest_hash: string
          manifest_version: number
          manual_session_id: string
          metadata_json: Json
          minigame_config_json: Json
          minigame_key: string
          player_manifest_json: Json
          report_policy_json: Json
          seed_hash: string | null
          server_id: string
          status_key: string
          timing_policy_json: Json
          trial_definition_id: string
          updated_at: string
          validation_context_json: Json
        }
        Insert: {
          accessibility_policy_json?: Json
          admin_context_json?: Json
          attempt_id: string
          config_hash?: string | null
          consumed_at?: string | null
          created_at?: string
          expires_at?: string | null
          generated_at?: string
          hero_id: string
          id?: string
          inactivity_policy_json?: Json
          invalidated_at?: string | null
          manifest_hash: string
          manifest_version?: number
          manual_session_id: string
          metadata_json?: Json
          minigame_config_json?: Json
          minigame_key: string
          player_manifest_json?: Json
          report_policy_json?: Json
          seed_hash?: string | null
          server_id: string
          status_key?: string
          timing_policy_json?: Json
          trial_definition_id: string
          updated_at?: string
          validation_context_json?: Json
        }
        Update: {
          accessibility_policy_json?: Json
          admin_context_json?: Json
          attempt_id?: string
          config_hash?: string | null
          consumed_at?: string | null
          created_at?: string
          expires_at?: string | null
          generated_at?: string
          hero_id?: string
          id?: string
          inactivity_policy_json?: Json
          invalidated_at?: string | null
          manifest_hash?: string
          manifest_version?: number
          manual_session_id?: string
          metadata_json?: Json
          minigame_config_json?: Json
          minigame_key?: string
          player_manifest_json?: Json
          report_policy_json?: Json
          seed_hash?: string | null
          server_id?: string
          status_key?: string
          timing_policy_json?: Json
          trial_definition_id?: string
          updated_at?: string
          validation_context_json?: Json
        }
        Relationships: [
          {
            foreignKeyName: "manual_trial_manifests_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "hero_exploration_challenge_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_trial_manifests_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_trial_manifests_manual_session_id_fkey"
            columns: ["manual_session_id"]
            isOneToOne: false
            referencedRelation: "manual_trial_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_trial_manifests_minigame_key_fkey"
            columns: ["minigame_key"]
            isOneToOne: false
            referencedRelation: "exploration_minigame_definitions"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "manual_trial_manifests_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_trial_manifests_status_key_fkey"
            columns: ["status_key"]
            isOneToOne: false
            referencedRelation: "manual_trial_manifest_statuses"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "manual_trial_manifests_trial_definition_id_fkey"
            columns: ["trial_definition_id"]
            isOneToOne: false
            referencedRelation: "trial_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      manual_trial_outcome_kinds: {
        Row: {
          admin_description: string | null
          created_at: string
          description: string
          helper_text: string | null
          is_active: boolean
          is_player_visible: boolean
          is_success: boolean
          key: string
          label: string
          metadata_json: Json
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          description: string
          helper_text?: string | null
          is_active?: boolean
          is_player_visible?: boolean
          is_success: boolean
          key: string
          label: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          description?: string
          helper_text?: string | null
          is_active?: boolean
          is_player_visible?: boolean
          is_success?: boolean
          key?: string
          label?: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      manual_trial_resolution_modes: {
        Row: {
          admin_description: string | null
          created_at: string
          description: string
          helper_text: string | null
          is_active: boolean
          is_auto_resolve: boolean
          is_manual_path: boolean
          is_player_visible: boolean
          key: string
          label: string
          metadata_json: Json
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          description: string
          helper_text?: string | null
          is_active?: boolean
          is_auto_resolve?: boolean
          is_manual_path?: boolean
          is_player_visible?: boolean
          key: string
          label: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          description?: string
          helper_text?: string | null
          is_active?: boolean
          is_auto_resolve?: boolean
          is_manual_path?: boolean
          is_player_visible?: boolean
          key?: string
          label?: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      manual_trial_session_statuses: {
        Row: {
          admin_description: string | null
          created_at: string
          description: string
          helper_text: string | null
          is_active: boolean
          is_player_visible: boolean
          is_terminal: boolean
          key: string
          label: string
          metadata_json: Json
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          description: string
          helper_text?: string | null
          is_active?: boolean
          is_player_visible?: boolean
          is_terminal?: boolean
          key: string
          label: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          description?: string
          helper_text?: string | null
          is_active?: boolean
          is_player_visible?: boolean
          is_terminal?: boolean
          key?: string
          label?: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      manual_trial_sessions: {
        Row: {
          admin_context_json: Json
          attempt_id: string
          closed_at: string | null
          created_at: string
          created_by_user_id: string | null
          expires_at: string | null
          hero_id: string
          id: string
          last_activity_at: string
          metadata_json: Json
          minigame_key: string
          player_context_json: Json
          request_id: string | null
          resolved_at: string | null
          server_id: string
          started_at: string
          status_key: string
          submitted_at: string | null
          trial_definition_id: string
          updated_at: string
        }
        Insert: {
          admin_context_json?: Json
          attempt_id: string
          closed_at?: string | null
          created_at?: string
          created_by_user_id?: string | null
          expires_at?: string | null
          hero_id: string
          id?: string
          last_activity_at?: string
          metadata_json?: Json
          minigame_key: string
          player_context_json?: Json
          request_id?: string | null
          resolved_at?: string | null
          server_id: string
          started_at?: string
          status_key?: string
          submitted_at?: string | null
          trial_definition_id: string
          updated_at?: string
        }
        Update: {
          admin_context_json?: Json
          attempt_id?: string
          closed_at?: string | null
          created_at?: string
          created_by_user_id?: string | null
          expires_at?: string | null
          hero_id?: string
          id?: string
          last_activity_at?: string
          metadata_json?: Json
          minigame_key?: string
          player_context_json?: Json
          request_id?: string | null
          resolved_at?: string | null
          server_id?: string
          started_at?: string
          status_key?: string
          submitted_at?: string | null
          trial_definition_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "manual_trial_sessions_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "hero_exploration_challenge_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_trial_sessions_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_trial_sessions_minigame_key_fkey"
            columns: ["minigame_key"]
            isOneToOne: false
            referencedRelation: "exploration_minigame_definitions"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "manual_trial_sessions_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_trial_sessions_status_key_fkey"
            columns: ["status_key"]
            isOneToOne: false
            referencedRelation: "manual_trial_session_statuses"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "manual_trial_sessions_trial_definition_id_fkey"
            columns: ["trial_definition_id"]
            isOneToOne: false
            referencedRelation: "trial_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      manual_trial_validation_reasons: {
        Row: {
          admin_description: string | null
          created_at: string
          description: string
          helper_text: string | null
          is_active: boolean
          is_player_visible: boolean
          key: string
          label: string
          metadata_json: Json
          severity: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          description: string
          helper_text?: string | null
          is_active?: boolean
          is_player_visible?: boolean
          key: string
          label: string
          metadata_json?: Json
          severity?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          description?: string
          helper_text?: string | null
          is_active?: boolean
          is_player_visible?: boolean
          key?: string
          label?: string
          metadata_json?: Json
          severity?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      manual_trial_verdicts: {
        Row: {
          action_log_id: string | null
          admin_validation_json: Json
          attempt_id: string
          backend_replay_summary_json: Json
          created_at: string
          failure_reason_key: string | null
          game_report_id: string | null
          hero_id: string
          id: string
          manual_session_id: string | null
          metadata_json: Json
          minigame_key: string
          outcome_key: string
          performance_rating: string | null
          player_report_summary_json: Json
          request_id: string | null
          resolution_mode_key: string
          resolved_at: string
          reward_grant_id: string | null
          reward_summary_json: Json
          score: number | null
          server_id: string
          trial_definition_id: string
          updated_at: string
          validation_reason_key: string | null
          validation_warnings_json: Json
        }
        Insert: {
          action_log_id?: string | null
          admin_validation_json?: Json
          attempt_id: string
          backend_replay_summary_json?: Json
          created_at?: string
          failure_reason_key?: string | null
          game_report_id?: string | null
          hero_id: string
          id?: string
          manual_session_id?: string | null
          metadata_json?: Json
          minigame_key: string
          outcome_key: string
          performance_rating?: string | null
          player_report_summary_json?: Json
          request_id?: string | null
          resolution_mode_key: string
          resolved_at?: string
          reward_grant_id?: string | null
          reward_summary_json?: Json
          score?: number | null
          server_id: string
          trial_definition_id: string
          updated_at?: string
          validation_reason_key?: string | null
          validation_warnings_json?: Json
        }
        Update: {
          action_log_id?: string | null
          admin_validation_json?: Json
          attempt_id?: string
          backend_replay_summary_json?: Json
          created_at?: string
          failure_reason_key?: string | null
          game_report_id?: string | null
          hero_id?: string
          id?: string
          manual_session_id?: string | null
          metadata_json?: Json
          minigame_key?: string
          outcome_key?: string
          performance_rating?: string | null
          player_report_summary_json?: Json
          request_id?: string | null
          resolution_mode_key?: string
          resolved_at?: string
          reward_grant_id?: string | null
          reward_summary_json?: Json
          score?: number | null
          server_id?: string
          trial_definition_id?: string
          updated_at?: string
          validation_reason_key?: string | null
          validation_warnings_json?: Json
        }
        Relationships: [
          {
            foreignKeyName: "manual_trial_verdicts_action_log_id_fkey"
            columns: ["action_log_id"]
            isOneToOne: false
            referencedRelation: "manual_trial_action_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_trial_verdicts_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "hero_exploration_challenge_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_trial_verdicts_failure_reason_key_fkey"
            columns: ["failure_reason_key"]
            isOneToOne: false
            referencedRelation: "manual_trial_failure_reasons"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "manual_trial_verdicts_game_report_id_fkey"
            columns: ["game_report_id"]
            isOneToOne: false
            referencedRelation: "game_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_trial_verdicts_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_trial_verdicts_manual_session_id_fkey"
            columns: ["manual_session_id"]
            isOneToOne: false
            referencedRelation: "manual_trial_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_trial_verdicts_minigame_key_fkey"
            columns: ["minigame_key"]
            isOneToOne: false
            referencedRelation: "exploration_minigame_definitions"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "manual_trial_verdicts_outcome_key_fkey"
            columns: ["outcome_key"]
            isOneToOne: false
            referencedRelation: "manual_trial_outcome_kinds"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "manual_trial_verdicts_resolution_mode_key_fkey"
            columns: ["resolution_mode_key"]
            isOneToOne: false
            referencedRelation: "manual_trial_resolution_modes"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "manual_trial_verdicts_reward_grant_id_fkey"
            columns: ["reward_grant_id"]
            isOneToOne: false
            referencedRelation: "reward_grants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_trial_verdicts_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_trial_verdicts_trial_definition_id_fkey"
            columns: ["trial_definition_id"]
            isOneToOne: false
            referencedRelation: "trial_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_trial_verdicts_validation_reason_key_fkey"
            columns: ["validation_reason_key"]
            isOneToOne: false
            referencedRelation: "manual_trial_validation_reasons"
            referencedColumns: ["key"]
          },
        ]
      }
      moderation_action_types: {
        Row: {
          created_at: string
          default_duration_minutes: number | null
          description: string
          helper_text: string | null
          is_active: boolean
          is_ban: boolean
          is_restriction: boolean
          is_severe: boolean
          is_staff_disqualifying: boolean
          is_suspension: boolean
          is_warning: boolean
          key: string
          label: string
          moderator_can_apply: boolean
          operator_can_apply: boolean
          scope_required: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_duration_minutes?: number | null
          description: string
          helper_text?: string | null
          is_active?: boolean
          is_ban?: boolean
          is_restriction?: boolean
          is_severe?: boolean
          is_staff_disqualifying?: boolean
          is_suspension?: boolean
          is_warning?: boolean
          key: string
          label: string
          moderator_can_apply?: boolean
          operator_can_apply?: boolean
          scope_required?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_duration_minutes?: number | null
          description?: string
          helper_text?: string | null
          is_active?: boolean
          is_ban?: boolean
          is_restriction?: boolean
          is_severe?: boolean
          is_staff_disqualifying?: boolean
          is_suspension?: boolean
          is_warning?: boolean
          key?: string
          label?: string
          moderator_can_apply?: boolean
          operator_can_apply?: boolean
          scope_required?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      moderation_actions: {
        Row: {
          action_type_key: string
          created_at: string
          created_by_user_id: string | null
          expires_at: string | null
          id: string
          is_staff_disqualifying: boolean
          metadata_json: Json
          operator_notes: string | null
          player_visible_note: string | null
          reason: string
          resolved_at: string | null
          resolved_by_user_id: string | null
          scope_key: string | null
          server_id: string
          source_entity_id: string | null
          source_entity_type: string | null
          source_snapshot_id: string | null
          starts_at: string
          status: Database["public"]["Enums"]["moderation_action_status"]
          status_reason: string | null
          target_hero_id: string | null
          target_user_id: string
        }
        Insert: {
          action_type_key: string
          created_at?: string
          created_by_user_id?: string | null
          expires_at?: string | null
          id?: string
          is_staff_disqualifying?: boolean
          metadata_json?: Json
          operator_notes?: string | null
          player_visible_note?: string | null
          reason: string
          resolved_at?: string | null
          resolved_by_user_id?: string | null
          scope_key?: string | null
          server_id: string
          source_entity_id?: string | null
          source_entity_type?: string | null
          source_snapshot_id?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["moderation_action_status"]
          status_reason?: string | null
          target_hero_id?: string | null
          target_user_id: string
        }
        Update: {
          action_type_key?: string
          created_at?: string
          created_by_user_id?: string | null
          expires_at?: string | null
          id?: string
          is_staff_disqualifying?: boolean
          metadata_json?: Json
          operator_notes?: string | null
          player_visible_note?: string | null
          reason?: string
          resolved_at?: string | null
          resolved_by_user_id?: string | null
          scope_key?: string | null
          server_id?: string
          source_entity_id?: string | null
          source_entity_type?: string | null
          source_snapshot_id?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["moderation_action_status"]
          status_reason?: string | null
          target_hero_id?: string | null
          target_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderation_actions_action_type_key_fkey"
            columns: ["action_type_key"]
            isOneToOne: false
            referencedRelation: "moderation_action_types"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "moderation_actions_scope_key_fkey"
            columns: ["scope_key"]
            isOneToOne: false
            referencedRelation: "staff_permission_scopes"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "moderation_actions_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_actions_target_hero_id_fkey"
            columns: ["target_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_db_owned_producer_diagnostics: {
        Row: {
          admin_description_pl: string
          admin_label_pl: string
          blocker_help_text_pl: string | null
          created_at: string
          helper_text_pl: string | null
          is_active: boolean
          is_expected: boolean
          is_explicit_non_producer: boolean
          metadata_json: Json
          notification_type_keys: string[]
          producer_function_names: string[]
          producer_key: string
          producer_kind: string
          producer_table_name: string | null
          producer_trigger_name: string | null
          sort_order: number
          updated_at: string
          workflow_key: string
        }
        Insert: {
          admin_description_pl: string
          admin_label_pl: string
          blocker_help_text_pl?: string | null
          created_at?: string
          helper_text_pl?: string | null
          is_active?: boolean
          is_expected?: boolean
          is_explicit_non_producer?: boolean
          metadata_json?: Json
          notification_type_keys?: string[]
          producer_function_names?: string[]
          producer_key: string
          producer_kind?: string
          producer_table_name?: string | null
          producer_trigger_name?: string | null
          sort_order?: number
          updated_at?: string
          workflow_key: string
        }
        Update: {
          admin_description_pl?: string
          admin_label_pl?: string
          blocker_help_text_pl?: string | null
          created_at?: string
          helper_text_pl?: string | null
          is_active?: boolean
          is_expected?: boolean
          is_explicit_non_producer?: boolean
          metadata_json?: Json
          notification_type_keys?: string[]
          producer_function_names?: string[]
          producer_key?: string
          producer_kind?: string
          producer_table_name?: string | null
          producer_trigger_name?: string | null
          sort_order?: number
          updated_at?: string
          workflow_key?: string
        }
        Relationships: []
      }
      notification_types: {
        Row: {
          admin_description: string | null
          category: string
          created_at: string
          default_severity: Database["public"]["Enums"]["notification_severity"]
          default_toast_enabled: boolean
          description: string
          helper_text: string | null
          is_active: boolean
          key: string
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          category: string
          created_at?: string
          default_severity?: Database["public"]["Enums"]["notification_severity"]
          default_toast_enabled?: boolean
          description: string
          helper_text?: string | null
          is_active?: boolean
          key: string
          label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          category?: string
          created_at?: string
          default_severity?: Database["public"]["Enums"]["notification_severity"]
          default_toast_enabled?: boolean
          description?: string
          helper_text?: string | null
          is_active?: boolean
          key?: string
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_label: string | null
          action_url: string | null
          actor_hero_id: string | null
          actor_user_id: string | null
          body: string | null
          created_at: string
          dismissed_at: string | null
          id: string
          notification_type_key: string
          read_at: string | null
          recipient_hero_id: string | null
          recipient_kind: Database["public"]["Enums"]["notification_recipient_kind"]
          recipient_user_id: string
          server_id: string | null
          severity: Database["public"]["Enums"]["notification_severity"]
          source_entity_id: string | null
          source_entity_type: string | null
          title: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          actor_hero_id?: string | null
          actor_user_id?: string | null
          body?: string | null
          created_at?: string
          dismissed_at?: string | null
          id?: string
          notification_type_key: string
          read_at?: string | null
          recipient_hero_id?: string | null
          recipient_kind: Database["public"]["Enums"]["notification_recipient_kind"]
          recipient_user_id: string
          server_id?: string | null
          severity: Database["public"]["Enums"]["notification_severity"]
          source_entity_id?: string | null
          source_entity_type?: string | null
          title: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          actor_hero_id?: string | null
          actor_user_id?: string | null
          body?: string | null
          created_at?: string
          dismissed_at?: string | null
          id?: string
          notification_type_key?: string
          read_at?: string | null
          recipient_hero_id?: string | null
          recipient_kind?: Database["public"]["Enums"]["notification_recipient_kind"]
          recipient_user_id?: string
          server_id?: string | null
          severity?: Database["public"]["Enums"]["notification_severity"]
          source_entity_id?: string | null
          source_entity_type?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_hero_id_fkey"
            columns: ["actor_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_notification_type_key_fkey"
            columns: ["notification_type_key"]
            isOneToOne: false
            referencedRelation: "notification_types"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "notifications_recipient_hero_id_fkey"
            columns: ["recipient_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
        ]
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
      player_abuse_report_types: {
        Row: {
          admin_description: string | null
          category: string
          created_at: string
          created_by: string | null
          description: string
          helper_text: string | null
          id: string
          is_active: boolean
          key: string
          label: string
          requires_accused_hero: boolean
          requires_description: boolean
          requires_item_selection: boolean
          requires_trade_selection: boolean
          sort_order: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          admin_description?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          description: string
          helper_text?: string | null
          id?: string
          is_active?: boolean
          key: string
          label: string
          requires_accused_hero?: boolean
          requires_description?: boolean
          requires_item_selection?: boolean
          requires_trade_selection?: boolean
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          admin_description?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          helper_text?: string | null
          id?: string
          is_active?: boolean
          key?: string
          label?: string
          requires_accused_hero?: boolean
          requires_description?: boolean
          requires_item_selection?: boolean
          requires_trade_selection?: boolean
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      player_abuse_reports: {
        Row: {
          accused_hero_id: string | null
          accused_user_id: string | null
          admin_notes: string | null
          case_id: string | null
          created_at: string
          description: string
          id: string
          player_notes: string | null
          related_item_id: string | null
          related_trade_id: string | null
          related_trade_reference: string | null
          report_type_key: string
          reporting_hero_id: string | null
          reporting_user_id: string
          resolved_at: string | null
          server_id: string
          status: Database["public"]["Enums"]["player_abuse_report_status"]
          status_reason: string | null
          title: string
          updated_at: string
        }
        Insert: {
          accused_hero_id?: string | null
          accused_user_id?: string | null
          admin_notes?: string | null
          case_id?: string | null
          created_at?: string
          description: string
          id?: string
          player_notes?: string | null
          related_item_id?: string | null
          related_trade_id?: string | null
          related_trade_reference?: string | null
          report_type_key: string
          reporting_hero_id?: string | null
          reporting_user_id: string
          resolved_at?: string | null
          server_id: string
          status?: Database["public"]["Enums"]["player_abuse_report_status"]
          status_reason?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          accused_hero_id?: string | null
          accused_user_id?: string | null
          admin_notes?: string | null
          case_id?: string | null
          created_at?: string
          description?: string
          id?: string
          player_notes?: string | null
          related_item_id?: string | null
          related_trade_id?: string | null
          related_trade_reference?: string | null
          report_type_key?: string
          reporting_hero_id?: string | null
          reporting_user_id?: string
          resolved_at?: string | null
          server_id?: string
          status?: Database["public"]["Enums"]["player_abuse_report_status"]
          status_reason?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_abuse_reports_accused_hero_id_fkey"
            columns: ["accused_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_abuse_reports_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "anti_abuse_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_abuse_reports_related_item_id_fkey"
            columns: ["related_item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_abuse_reports_report_type_key_fkey"
            columns: ["report_type_key"]
            isOneToOne: false
            referencedRelation: "player_abuse_report_types"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "player_abuse_reports_reporting_hero_id_fkey"
            columns: ["reporting_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_abuse_reports_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
        ]
      }
      player_auction_bids: {
        Row: {
          amount_character_points: number
          bidder_hero_id: string
          cancelled_at: string | null
          created_at: string
          failed_at: string | null
          id: string
          listing_id: string
          refunded_at: string | null
          status: Database["public"]["Enums"]["player_auction_bid_status"]
          status_reason: string | null
        }
        Insert: {
          amount_character_points: number
          bidder_hero_id: string
          cancelled_at?: string | null
          created_at?: string
          failed_at?: string | null
          id?: string
          listing_id: string
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["player_auction_bid_status"]
          status_reason?: string | null
        }
        Update: {
          amount_character_points?: number
          bidder_hero_id?: string
          cancelled_at?: string | null
          created_at?: string
          failed_at?: string | null
          id?: string
          listing_id?: string
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["player_auction_bid_status"]
          status_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_auction_bids_bidder_hero_id_fkey"
            columns: ["bidder_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_auction_bids_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "player_auction_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      player_auction_listings: {
        Row: {
          auction_mode: Database["public"]["Enums"]["player_auction_mode"]
          buy_now_character_points: number | null
          cancelled_at: string | null
          completed_at: string | null
          created_at: string
          current_bid_character_points: number | null
          current_highest_bidder_hero_id: string | null
          description: string | null
          ends_at: string | null
          expired_at: string | null
          failed_at: string | null
          id: string
          item_id: string
          seller_hero_id: string
          server_id: string
          starting_bid_character_points: number | null
          starts_at: string | null
          status: Database["public"]["Enums"]["player_auction_status"]
          status_reason: string | null
          updated_at: string
        }
        Insert: {
          auction_mode: Database["public"]["Enums"]["player_auction_mode"]
          buy_now_character_points?: number | null
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string
          current_bid_character_points?: number | null
          current_highest_bidder_hero_id?: string | null
          description?: string | null
          ends_at?: string | null
          expired_at?: string | null
          failed_at?: string | null
          id?: string
          item_id: string
          seller_hero_id: string
          server_id: string
          starting_bid_character_points?: number | null
          starts_at?: string | null
          status?: Database["public"]["Enums"]["player_auction_status"]
          status_reason?: string | null
          updated_at?: string
        }
        Update: {
          auction_mode?: Database["public"]["Enums"]["player_auction_mode"]
          buy_now_character_points?: number | null
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string
          current_bid_character_points?: number | null
          current_highest_bidder_hero_id?: string | null
          description?: string | null
          ends_at?: string | null
          expired_at?: string | null
          failed_at?: string | null
          id?: string
          item_id?: string
          seller_hero_id?: string
          server_id?: string
          starting_bid_character_points?: number | null
          starts_at?: string | null
          status?: Database["public"]["Enums"]["player_auction_status"]
          status_reason?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_auction_listings_current_highest_bidder_hero_id_fkey"
            columns: ["current_highest_bidder_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_auction_listings_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_auction_listings_seller_hero_id_fkey"
            columns: ["seller_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_auction_listings_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
        ]
      }
      player_auction_watches: {
        Row: {
          created_at: string
          ended_at: string | null
          hero_id: string
          id: string
          is_active: boolean
          listing_id: string
          server_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          hero_id: string
          id?: string
          is_active?: boolean
          listing_id: string
          server_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          hero_id?: string
          id?: string
          is_active?: boolean
          listing_id?: string
          server_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_auction_watches_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_auction_watches_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "player_auction_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_auction_watches_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
        ]
      }
      player_relationship_declaration_items: {
        Row: {
          created_at: string
          created_by_user_id: string | null
          declaration_id: string
          description: string | null
          id: string
          item_id: string | null
          item_name_snapshot: string | null
          reason: string | null
          role_key: string
        }
        Insert: {
          created_at?: string
          created_by_user_id?: string | null
          declaration_id: string
          description?: string | null
          id?: string
          item_id?: string | null
          item_name_snapshot?: string | null
          reason?: string | null
          role_key?: string
        }
        Update: {
          created_at?: string
          created_by_user_id?: string | null
          declaration_id?: string
          description?: string | null
          id?: string
          item_id?: string | null
          item_name_snapshot?: string | null
          reason?: string | null
          role_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_relationship_declaration_items_declaration_id_fkey"
            columns: ["declaration_id"]
            isOneToOne: false
            referencedRelation: "player_relationship_declarations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_relationship_declaration_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      player_relationship_declaration_participants: {
        Row: {
          created_at: string
          created_by_user_id: string | null
          declaration_id: string
          description: string | null
          hero_id: string | null
          id: string
          reason: string | null
          role_key: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by_user_id?: string | null
          declaration_id: string
          description?: string | null
          hero_id?: string | null
          id?: string
          reason?: string | null
          role_key: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by_user_id?: string | null
          declaration_id?: string
          description?: string | null
          hero_id?: string | null
          id?: string
          reason?: string | null
          role_key?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_relationship_declaration_participant_declaration_id_fkey"
            columns: ["declaration_id"]
            isOneToOne: false
            referencedRelation: "player_relationship_declarations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_relationship_declaration_participants_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
        ]
      }
      player_relationship_declaration_trades: {
        Row: {
          created_at: string
          created_by_user_id: string | null
          declaration_id: string
          description: string | null
          id: string
          reason: string | null
          role_key: string
          trade_id: string | null
          trade_reference: string | null
        }
        Insert: {
          created_at?: string
          created_by_user_id?: string | null
          declaration_id: string
          description?: string | null
          id?: string
          reason?: string | null
          role_key?: string
          trade_id?: string | null
          trade_reference?: string | null
        }
        Update: {
          created_at?: string
          created_by_user_id?: string | null
          declaration_id?: string
          description?: string | null
          id?: string
          reason?: string | null
          role_key?: string
          trade_id?: string | null
          trade_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_relationship_declaration_trades_declaration_id_fkey"
            columns: ["declaration_id"]
            isOneToOne: false
            referencedRelation: "player_relationship_declarations"
            referencedColumns: ["id"]
          },
        ]
      }
      player_relationship_declaration_types: {
        Row: {
          admin_description: string | null
          category: string
          created_at: string
          created_by: string | null
          description: string
          helper_text: string | null
          id: string
          is_active: boolean
          key: string
          label: string
          max_participants: number | null
          min_participants: number
          requires_amount: boolean
          requires_expiration: boolean
          requires_item_selection: boolean
          requires_trade_selection: boolean
          sort_order: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          admin_description?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          description: string
          helper_text?: string | null
          id?: string
          is_active?: boolean
          key: string
          label: string
          max_participants?: number | null
          min_participants?: number
          requires_amount?: boolean
          requires_expiration?: boolean
          requires_item_selection?: boolean
          requires_trade_selection?: boolean
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          admin_description?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          helper_text?: string | null
          id?: string
          is_active?: boolean
          key?: string
          label?: string
          max_participants?: number | null
          min_participants?: number
          requires_amount?: boolean
          requires_expiration?: boolean
          requires_item_selection?: boolean
          requires_trade_selection?: boolean
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      player_relationship_declarations: {
        Row: {
          admin_notes: string | null
          amount_character_points: number | null
          completed_at: string | null
          created_at: string
          created_by_hero_id: string | null
          created_by_user_id: string
          declaration_type_key: string
          description: string
          expires_at: string | null
          id: string
          player_notes: string | null
          reviewed_at: string | null
          reviewed_by_user_id: string | null
          revoked_at: string | null
          server_id: string
          starts_at: string | null
          status: Database["public"]["Enums"]["player_relationship_declaration_status"]
          status_reason: string | null
          submitted_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          amount_character_points?: number | null
          completed_at?: string | null
          created_at?: string
          created_by_hero_id?: string | null
          created_by_user_id: string
          declaration_type_key: string
          description: string
          expires_at?: string | null
          id?: string
          player_notes?: string | null
          reviewed_at?: string | null
          reviewed_by_user_id?: string | null
          revoked_at?: string | null
          server_id: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["player_relationship_declaration_status"]
          status_reason?: string | null
          submitted_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          amount_character_points?: number | null
          completed_at?: string | null
          created_at?: string
          created_by_hero_id?: string | null
          created_by_user_id?: string
          declaration_type_key?: string
          description?: string
          expires_at?: string | null
          id?: string
          player_notes?: string | null
          reviewed_at?: string | null
          reviewed_by_user_id?: string | null
          revoked_at?: string | null
          server_id?: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["player_relationship_declaration_status"]
          status_reason?: string | null
          submitted_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_relationship_declarations_created_by_hero_id_fkey"
            columns: ["created_by_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_relationship_declarations_declaration_type_key_fkey"
            columns: ["declaration_type_key"]
            isOneToOne: false
            referencedRelation: "player_relationship_declaration_types"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "player_relationship_declarations_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
        ]
      }
      player_trade_offer_items: {
        Row: {
          created_at: string
          id: string
          item_id: string
          offer_id: string
          offered_by_hero_id: string
          side: Database["public"]["Enums"]["player_trade_side"]
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          offer_id: string
          offered_by_hero_id: string
          side: Database["public"]["Enums"]["player_trade_side"]
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          offer_id?: string
          offered_by_hero_id?: string
          side?: Database["public"]["Enums"]["player_trade_side"]
        }
        Relationships: [
          {
            foreignKeyName: "player_trade_offer_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_trade_offer_items_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "player_trade_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_trade_offer_items_offered_by_hero_id_fkey"
            columns: ["offered_by_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
        ]
      }
      player_trade_offers: {
        Row: {
          accepted_by_creator_at: string | null
          accepted_by_target_at: string | null
          cancelled_at: string | null
          completed_at: string | null
          created_at: string
          creator_character_points: number
          creator_hero_id: string
          description: string | null
          expires_at: string | null
          failed_at: string | null
          id: string
          rejected_at: string | null
          server_id: string
          status: Database["public"]["Enums"]["player_trade_offer_status"]
          status_reason: string | null
          target_character_points: number
          target_hero_id: string
          updated_at: string
        }
        Insert: {
          accepted_by_creator_at?: string | null
          accepted_by_target_at?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string
          creator_character_points?: number
          creator_hero_id: string
          description?: string | null
          expires_at?: string | null
          failed_at?: string | null
          id?: string
          rejected_at?: string | null
          server_id: string
          status?: Database["public"]["Enums"]["player_trade_offer_status"]
          status_reason?: string | null
          target_character_points?: number
          target_hero_id: string
          updated_at?: string
        }
        Update: {
          accepted_by_creator_at?: string | null
          accepted_by_target_at?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string
          creator_character_points?: number
          creator_hero_id?: string
          description?: string | null
          expires_at?: string | null
          failed_at?: string | null
          id?: string
          rejected_at?: string | null
          server_id?: string
          status?: Database["public"]["Enums"]["player_trade_offer_status"]
          status_reason?: string | null
          target_character_points?: number
          target_hero_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_trade_offers_creator_hero_id_fkey"
            columns: ["creator_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_trade_offers_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_trade_offers_target_hero_id_fkey"
            columns: ["target_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
        ]
      }
      player_trade_transaction_items: {
        Row: {
          created_at: string
          from_hero_id: string | null
          generation_base_id_snapshot: string | null
          generation_base_key_snapshot: string | null
          generation_base_name_snapshot: string | null
          generation_base_type_key_snapshot: string | null
          generation_quality_key_snapshot: string | null
          generation_quality_label_snapshot: string | null
          has_prefix_snapshot: boolean | null
          has_suffix_snapshot: boolean | null
          id: string
          item_drachma_value_snapshot: number | null
          item_id: string | null
          item_name_snapshot: string | null
          item_snapshot_json: Json
          prefix_affix_id_snapshot: string | null
          prefix_affix_key_snapshot: string | null
          prefix_affix_name_snapshot: string | null
          server_id: string
          suffix_affix_id_snapshot: string | null
          suffix_affix_key_snapshot: string | null
          suffix_affix_name_snapshot: string | null
          to_hero_id: string | null
          transaction_id: string
          value_bucket_snapshot: number | null
        }
        Insert: {
          created_at?: string
          from_hero_id?: string | null
          generation_base_id_snapshot?: string | null
          generation_base_key_snapshot?: string | null
          generation_base_name_snapshot?: string | null
          generation_base_type_key_snapshot?: string | null
          generation_quality_key_snapshot?: string | null
          generation_quality_label_snapshot?: string | null
          has_prefix_snapshot?: boolean | null
          has_suffix_snapshot?: boolean | null
          id?: string
          item_drachma_value_snapshot?: number | null
          item_id?: string | null
          item_name_snapshot?: string | null
          item_snapshot_json?: Json
          prefix_affix_id_snapshot?: string | null
          prefix_affix_key_snapshot?: string | null
          prefix_affix_name_snapshot?: string | null
          server_id: string
          suffix_affix_id_snapshot?: string | null
          suffix_affix_key_snapshot?: string | null
          suffix_affix_name_snapshot?: string | null
          to_hero_id?: string | null
          transaction_id: string
          value_bucket_snapshot?: number | null
        }
        Update: {
          created_at?: string
          from_hero_id?: string | null
          generation_base_id_snapshot?: string | null
          generation_base_key_snapshot?: string | null
          generation_base_name_snapshot?: string | null
          generation_base_type_key_snapshot?: string | null
          generation_quality_key_snapshot?: string | null
          generation_quality_label_snapshot?: string | null
          has_prefix_snapshot?: boolean | null
          has_suffix_snapshot?: boolean | null
          id?: string
          item_drachma_value_snapshot?: number | null
          item_id?: string | null
          item_name_snapshot?: string | null
          item_snapshot_json?: Json
          prefix_affix_id_snapshot?: string | null
          prefix_affix_key_snapshot?: string | null
          prefix_affix_name_snapshot?: string | null
          server_id?: string
          suffix_affix_id_snapshot?: string | null
          suffix_affix_key_snapshot?: string | null
          suffix_affix_name_snapshot?: string | null
          to_hero_id?: string | null
          transaction_id?: string
          value_bucket_snapshot?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "player_trade_transaction_items_from_hero_id_fkey"
            columns: ["from_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_trade_transaction_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_trade_transaction_items_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_trade_transaction_items_to_hero_id_fkey"
            columns: ["to_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_trade_transaction_items_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "player_trade_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      player_trade_transactions: {
        Row: {
          auction_listing_id: string | null
          completed_at: string | null
          created_at: string
          creator_character_points: number
          creator_hero_id: string | null
          description: string | null
          failed_at: string | null
          id: string
          offer_id: string | null
          reason: string | null
          reversed_at: string | null
          server_id: string
          status: Database["public"]["Enums"]["player_trade_transaction_status"]
          target_character_points: number
          target_hero_id: string | null
          transaction_type: Database["public"]["Enums"]["player_trade_transaction_type"]
        }
        Insert: {
          auction_listing_id?: string | null
          completed_at?: string | null
          created_at?: string
          creator_character_points?: number
          creator_hero_id?: string | null
          description?: string | null
          failed_at?: string | null
          id?: string
          offer_id?: string | null
          reason?: string | null
          reversed_at?: string | null
          server_id: string
          status?: Database["public"]["Enums"]["player_trade_transaction_status"]
          target_character_points?: number
          target_hero_id?: string | null
          transaction_type: Database["public"]["Enums"]["player_trade_transaction_type"]
        }
        Update: {
          auction_listing_id?: string | null
          completed_at?: string | null
          created_at?: string
          creator_character_points?: number
          creator_hero_id?: string | null
          description?: string | null
          failed_at?: string | null
          id?: string
          offer_id?: string | null
          reason?: string | null
          reversed_at?: string | null
          server_id?: string
          status?: Database["public"]["Enums"]["player_trade_transaction_status"]
          target_character_points?: number
          target_hero_id?: string | null
          transaction_type?: Database["public"]["Enums"]["player_trade_transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "player_trade_transactions_auction_listing_id_fkey"
            columns: ["auction_listing_id"]
            isOneToOne: false
            referencedRelation: "player_auction_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_trade_transactions_creator_hero_id_fkey"
            columns: ["creator_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_trade_transactions_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "player_trade_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_trade_transactions_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_trade_transactions_target_hero_id_fkey"
            columns: ["target_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
        ]
      }
      prestige_change_message_kinds: {
        Row: {
          admin_description: string | null
          created_at: string
          direction: string
          is_active: boolean
          is_rank_change: boolean
          key: string
          label: string
          metadata_json: Json
          min_abs_delta: number
          player_message: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          direction: string
          is_active?: boolean
          is_rank_change?: boolean
          key: string
          label: string
          metadata_json?: Json
          min_abs_delta?: number
          player_message: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          direction?: string
          is_active?: boolean
          is_rank_change?: boolean
          key?: string
          label?: string
          metadata_json?: Json
          min_abs_delta?: number
          player_message?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      prestige_pvp_delta_matrix: {
        Row: {
          actor_role: string
          admin_description: string
          band_key: string
          combat_outcome: Database["public"]["Enums"]["combat_outcome"]
          created_at: string
          description: string
          id: string
          is_active: boolean
          label: string
          message_kind: string
          metadata_json: Json
          points_delta: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          actor_role: string
          admin_description: string
          band_key: string
          combat_outcome: Database["public"]["Enums"]["combat_outcome"]
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          label: string
          message_kind: string
          metadata_json?: Json
          points_delta: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          actor_role?: string
          admin_description?: string
          band_key?: string
          combat_outcome?: Database["public"]["Enums"]["combat_outcome"]
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          label?: string
          message_kind?: string
          metadata_json?: Json
          points_delta?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prestige_pvp_delta_matrix_band_key_fkey"
            columns: ["band_key"]
            isOneToOne: false
            referencedRelation: "prestige_pvp_target_bands"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "prestige_pvp_delta_matrix_message_kind_fkey"
            columns: ["message_kind"]
            isOneToOne: false
            referencedRelation: "prestige_change_message_kinds"
            referencedColumns: ["key"]
          },
        ]
      }
      prestige_pvp_target_bands: {
        Row: {
          created_at: string
          description: string
          helper_text: string
          is_active: boolean
          key: string
          label: string
          max_position_percent: number
          metadata_json: Json
          min_position_percent: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          helper_text: string
          is_active?: boolean
          key: string
          label: string
          max_position_percent: number
          metadata_json?: Json
          min_position_percent: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          helper_text?: string
          is_active?: boolean
          key?: string
          label?: string
          max_position_percent?: number
          metadata_json?: Json
          min_position_percent?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      prestige_source_kinds: {
        Row: {
          created_at: string
          description: string | null
          helper_text: string | null
          is_active: boolean
          key: string
          label: string
          metadata_json: Json
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          helper_text?: string | null
          is_active?: boolean
          key: string
          label: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          helper_text?: string | null
          is_active?: boolean
          key?: string
          label?: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      pvp_action_kinds: {
        Row: {
          admin_description: string | null
          created_at: string
          creates_combat: boolean
          creates_runtime_activity: boolean
          creates_spy_result: boolean
          description: string
          helper_text: string | null
          is_active: boolean
          is_travel_action: boolean
          key: string
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          creates_combat?: boolean
          creates_runtime_activity?: boolean
          creates_spy_result?: boolean
          description: string
          helper_text?: string | null
          is_active?: boolean
          is_travel_action?: boolean
          key: string
          label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          creates_combat?: boolean
          creates_runtime_activity?: boolean
          creates_spy_result?: boolean
          description?: string
          helper_text?: string | null
          is_active?: boolean
          is_travel_action?: boolean
          key?: string
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      pvp_action_statuses: {
        Row: {
          admin_description: string | null
          created_at: string
          description: string
          helper_text: string | null
          is_active: boolean
          is_blocking: boolean
          is_terminal: boolean
          key: string
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          description: string
          helper_text?: string | null
          is_active?: boolean
          is_blocking?: boolean
          is_terminal?: boolean
          key: string
          label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          description?: string
          helper_text?: string | null
          is_active?: boolean
          is_blocking?: boolean
          is_terminal?: boolean
          key?: string
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      pvp_actions: {
        Row: {
          action_kind: string
          arrives_at: string
          attack_travel_time_seconds: number
          attacker_address_number_snapshot: number | null
          attacker_district_code_snapshot: string | null
          attacker_estate_id: string | null
          attacker_hero_id: string
          attacker_level_snapshot: number
          created_at: string
          distance_score: number
          id: string
          manual_deadline_at: string | null
          manual_fight_window_seconds: number | null
          metadata_json: Json
          reason: string | null
          request_id: string | null
          resolved_at: string | null
          runtime_activity_id: string | null
          server_id: string
          spy_travel_time_seconds: number
          started_at: string
          status: string
          target_address_number_snapshot: number | null
          target_district_code_snapshot: string | null
          target_estate_id: string | null
          target_hero_id: string
          target_level_snapshot: number
          target_protection_id: string | null
          target_protection_seconds: number | null
          travel_time_seconds: number
          updated_at: string
        }
        Insert: {
          action_kind: string
          arrives_at: string
          attack_travel_time_seconds: number
          attacker_address_number_snapshot?: number | null
          attacker_district_code_snapshot?: string | null
          attacker_estate_id?: string | null
          attacker_hero_id: string
          attacker_level_snapshot: number
          created_at?: string
          distance_score: number
          id?: string
          manual_deadline_at?: string | null
          manual_fight_window_seconds?: number | null
          metadata_json?: Json
          reason?: string | null
          request_id?: string | null
          resolved_at?: string | null
          runtime_activity_id?: string | null
          server_id: string
          spy_travel_time_seconds: number
          started_at?: string
          status?: string
          target_address_number_snapshot?: number | null
          target_district_code_snapshot?: string | null
          target_estate_id?: string | null
          target_hero_id: string
          target_level_snapshot: number
          target_protection_id?: string | null
          target_protection_seconds?: number | null
          travel_time_seconds: number
          updated_at?: string
        }
        Update: {
          action_kind?: string
          arrives_at?: string
          attack_travel_time_seconds?: number
          attacker_address_number_snapshot?: number | null
          attacker_district_code_snapshot?: string | null
          attacker_estate_id?: string | null
          attacker_hero_id?: string
          attacker_level_snapshot?: number
          created_at?: string
          distance_score?: number
          id?: string
          manual_deadline_at?: string | null
          manual_fight_window_seconds?: number | null
          metadata_json?: Json
          reason?: string | null
          request_id?: string | null
          resolved_at?: string | null
          runtime_activity_id?: string | null
          server_id?: string
          spy_travel_time_seconds?: number
          started_at?: string
          status?: string
          target_address_number_snapshot?: number | null
          target_district_code_snapshot?: string | null
          target_estate_id?: string | null
          target_hero_id?: string
          target_level_snapshot?: number
          target_protection_id?: string | null
          target_protection_seconds?: number | null
          travel_time_seconds?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pvp_actions_action_kind_fkey"
            columns: ["action_kind"]
            isOneToOne: false
            referencedRelation: "pvp_action_kinds"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "pvp_actions_attacker_estate_id_fkey"
            columns: ["attacker_estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pvp_actions_attacker_hero_id_fkey"
            columns: ["attacker_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pvp_actions_runtime_activity_id_fkey"
            columns: ["runtime_activity_id"]
            isOneToOne: false
            referencedRelation: "hero_runtime_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pvp_actions_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pvp_actions_status_fkey"
            columns: ["status"]
            isOneToOne: false
            referencedRelation: "pvp_action_statuses"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "pvp_actions_target_estate_id_fkey"
            columns: ["target_estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pvp_actions_target_hero_id_fkey"
            columns: ["target_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pvp_actions_target_protection_id_fkey"
            columns: ["target_protection_id"]
            isOneToOne: false
            referencedRelation: "pvp_target_protections"
            referencedColumns: ["id"]
          },
        ]
      }
      pvp_attack_outcome_kinds: {
        Row: {
          admin_description: string | null
          created_at: string
          description: string
          helper_text: string | null
          is_active: boolean
          key: string
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          description: string
          helper_text?: string | null
          is_active?: boolean
          key: string
          label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          description?: string
          helper_text?: string | null
          is_active?: boolean
          key?: string
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      pvp_attack_results: {
        Row: {
          attacker_estate_id: string | null
          attacker_hero_id: string
          attacker_level_snapshot: number
          combat_outcome: Database["public"]["Enums"]["combat_outcome"]
          combat_result_id: string
          created_at: string
          defender_estate_id: string | null
          defender_hero_id: string
          defender_level_snapshot: number
          id: string
          level_difference: number
          loser_hero_id: string | null
          metadata_json: Json
          notification_context_json: Json
          outcome_key: string
          prestige_context_json: Json
          pvp_action_id: string
          report_context_json: Json
          resource_outcome_json: Json
          reward_context_json: Json
          server_id: string
          winner_hero_id: string | null
        }
        Insert: {
          attacker_estate_id?: string | null
          attacker_hero_id: string
          attacker_level_snapshot: number
          combat_outcome: Database["public"]["Enums"]["combat_outcome"]
          combat_result_id: string
          created_at?: string
          defender_estate_id?: string | null
          defender_hero_id: string
          defender_level_snapshot: number
          id?: string
          level_difference: number
          loser_hero_id?: string | null
          metadata_json?: Json
          notification_context_json?: Json
          outcome_key: string
          prestige_context_json?: Json
          pvp_action_id: string
          report_context_json?: Json
          resource_outcome_json?: Json
          reward_context_json?: Json
          server_id: string
          winner_hero_id?: string | null
        }
        Update: {
          attacker_estate_id?: string | null
          attacker_hero_id?: string
          attacker_level_snapshot?: number
          combat_outcome?: Database["public"]["Enums"]["combat_outcome"]
          combat_result_id?: string
          created_at?: string
          defender_estate_id?: string | null
          defender_hero_id?: string
          defender_level_snapshot?: number
          id?: string
          level_difference?: number
          loser_hero_id?: string | null
          metadata_json?: Json
          notification_context_json?: Json
          outcome_key?: string
          prestige_context_json?: Json
          pvp_action_id?: string
          report_context_json?: Json
          resource_outcome_json?: Json
          reward_context_json?: Json
          server_id?: string
          winner_hero_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pvp_attack_results_attacker_estate_id_fkey"
            columns: ["attacker_estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pvp_attack_results_attacker_hero_id_fkey"
            columns: ["attacker_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pvp_attack_results_combat_result_id_fkey"
            columns: ["combat_result_id"]
            isOneToOne: false
            referencedRelation: "combat_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pvp_attack_results_defender_estate_id_fkey"
            columns: ["defender_estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pvp_attack_results_defender_hero_id_fkey"
            columns: ["defender_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pvp_attack_results_loser_hero_id_fkey"
            columns: ["loser_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pvp_attack_results_outcome_key_fkey"
            columns: ["outcome_key"]
            isOneToOne: false
            referencedRelation: "pvp_attack_outcome_kinds"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "pvp_attack_results_pvp_action_id_fkey"
            columns: ["pvp_action_id"]
            isOneToOne: false
            referencedRelation: "pvp_actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pvp_attack_results_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pvp_attack_results_winner_hero_id_fkey"
            columns: ["winner_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
        ]
      }
      pvp_spy_results: {
        Row: {
          base_stats_raw_snapshot_json: Json
          base_stats_snapshot_json: Json
          buildings_snapshot_json: Json
          created_at: string
          derived_combat_stats_json: Json
          detected: boolean
          detection_chance: number
          detection_roll: number
          equipment_snapshot_json: Json
          estate_snapshot_json: Json
          id: string
          metadata_json: Json
          outcome_key: string
          pvp_action_id: string
          resolution_policy_json: Json
          resources_snapshot_json: Json
          result_summary: string | null
          server_id: string
          spy_cunning_snapshot: number
          spy_estate_id: string | null
          spy_hero_id: string
          spy_level_snapshot: number
          success: boolean
          success_chance: number
          success_roll: number
          target_address_number_snapshot: number | null
          target_address_snapshot: string | null
          target_display_name_snapshot: string
          target_district_code_snapshot: string | null
          target_estate_id: string | null
          target_hero_id: string
          target_intelligence_snapshot: number
          target_level_snapshot: number
          visibility_key: string
        }
        Insert: {
          base_stats_raw_snapshot_json?: Json
          base_stats_snapshot_json?: Json
          buildings_snapshot_json?: Json
          created_at?: string
          derived_combat_stats_json?: Json
          detected: boolean
          detection_chance: number
          detection_roll: number
          equipment_snapshot_json?: Json
          estate_snapshot_json?: Json
          id?: string
          metadata_json?: Json
          outcome_key: string
          pvp_action_id: string
          resolution_policy_json?: Json
          resources_snapshot_json?: Json
          result_summary?: string | null
          server_id: string
          spy_cunning_snapshot: number
          spy_estate_id?: string | null
          spy_hero_id: string
          spy_level_snapshot: number
          success: boolean
          success_chance: number
          success_roll: number
          target_address_number_snapshot?: number | null
          target_address_snapshot?: string | null
          target_display_name_snapshot: string
          target_district_code_snapshot?: string | null
          target_estate_id?: string | null
          target_hero_id: string
          target_intelligence_snapshot: number
          target_level_snapshot: number
          visibility_key?: string
        }
        Update: {
          base_stats_raw_snapshot_json?: Json
          base_stats_snapshot_json?: Json
          buildings_snapshot_json?: Json
          created_at?: string
          derived_combat_stats_json?: Json
          detected?: boolean
          detection_chance?: number
          detection_roll?: number
          equipment_snapshot_json?: Json
          estate_snapshot_json?: Json
          id?: string
          metadata_json?: Json
          outcome_key?: string
          pvp_action_id?: string
          resolution_policy_json?: Json
          resources_snapshot_json?: Json
          result_summary?: string | null
          server_id?: string
          spy_cunning_snapshot?: number
          spy_estate_id?: string | null
          spy_hero_id?: string
          spy_level_snapshot?: number
          success?: boolean
          success_chance?: number
          success_roll?: number
          target_address_number_snapshot?: number | null
          target_address_snapshot?: string | null
          target_display_name_snapshot?: string
          target_district_code_snapshot?: string | null
          target_estate_id?: string | null
          target_hero_id?: string
          target_intelligence_snapshot?: number
          target_level_snapshot?: number
          visibility_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "pvp_spy_results_pvp_action_id_fkey"
            columns: ["pvp_action_id"]
            isOneToOne: false
            referencedRelation: "pvp_actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pvp_spy_results_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pvp_spy_results_spy_estate_id_fkey"
            columns: ["spy_estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pvp_spy_results_spy_hero_id_fkey"
            columns: ["spy_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pvp_spy_results_target_estate_id_fkey"
            columns: ["target_estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pvp_spy_results_target_hero_id_fkey"
            columns: ["target_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
        ]
      }
      pvp_target_protections: {
        Row: {
          created_at: string
          created_by_hero_id: string | null
          ended_at: string | null
          expires_at: string
          id: string
          metadata_json: Json
          reason: string | null
          server_id: string
          source_entity_id: string | null
          source_entity_type: string | null
          starts_at: string
          status: string
          target_estate_id: string | null
          target_hero_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by_hero_id?: string | null
          ended_at?: string | null
          expires_at: string
          id?: string
          metadata_json?: Json
          reason?: string | null
          server_id: string
          source_entity_id?: string | null
          source_entity_type?: string | null
          starts_at?: string
          status?: string
          target_estate_id?: string | null
          target_hero_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by_hero_id?: string | null
          ended_at?: string | null
          expires_at?: string
          id?: string
          metadata_json?: Json
          reason?: string | null
          server_id?: string
          source_entity_id?: string | null
          source_entity_type?: string | null
          starts_at?: string
          status?: string
          target_estate_id?: string | null
          target_hero_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pvp_target_protections_created_by_hero_id_fkey"
            columns: ["created_by_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pvp_target_protections_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pvp_target_protections_target_estate_id_fkey"
            columns: ["target_estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pvp_target_protections_target_hero_id_fkey"
            columns: ["target_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
        ]
      }
      ranks: {
        Row: {
          admin_description: string | null
          created_at: string
          description: string | null
          district_code: string
          helper_text: string | null
          id: number
          is_active: boolean
          max_players: number | null
          metadata_json: Json
          name: string | null
          player_label: string
          prestige_points_required: number
          rank_number: number
          rank_uuid: string
          required_level: number | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          description?: string | null
          district_code: string
          helper_text?: string | null
          id: number
          is_active?: boolean
          max_players?: number | null
          metadata_json?: Json
          name?: string | null
          player_label: string
          prestige_points_required: number
          rank_number: number
          rank_uuid?: string
          required_level?: number | null
          sort_order: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          description?: string | null
          district_code?: string
          helper_text?: string | null
          id?: number
          is_active?: boolean
          max_players?: number | null
          metadata_json?: Json
          name?: string | null
          player_label?: string
          prestige_points_required?: number
          rank_number?: number
          rank_uuid?: string
          required_level?: number | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      requirement_definitions: {
        Row: {
          admin_description: string | null
          category: string
          created_at: string
          description: string
          helper_text: string | null
          id: string
          is_active: boolean
          key: string
          label: string
          sort_order: number
          updated_at: string
          value_type: Database["public"]["Enums"]["requirement_value_type"]
        }
        Insert: {
          admin_description?: string | null
          category?: string
          created_at?: string
          description: string
          helper_text?: string | null
          id?: string
          is_active?: boolean
          key: string
          label: string
          sort_order?: number
          updated_at?: string
          value_type: Database["public"]["Enums"]["requirement_value_type"]
        }
        Update: {
          admin_description?: string | null
          category?: string
          created_at?: string
          description?: string
          helper_text?: string | null
          id?: string
          is_active?: boolean
          key?: string
          label?: string
          sort_order?: number
          updated_at?: string
          value_type?: Database["public"]["Enums"]["requirement_value_type"]
        }
        Relationships: []
      }
      resource_types: {
        Row: {
          admin_description: string | null
          created_at: string
          description: string
          helper_text: string | null
          is_active: boolean
          key: string
          label: string
          metadata_json: Json
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          description: string
          helper_text?: string | null
          is_active?: boolean
          key: string
          label: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          description?: string
          helper_text?: string | null
          is_active?: boolean
          key?: string
          label?: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      reward_assignment_match_kinds: {
        Row: {
          admin_description: string | null
          created_at: string
          description: string
          helper_text: string | null
          is_active: boolean
          key: string
          label: string
          metadata_json: Json
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          description: string
          helper_text?: string | null
          is_active?: boolean
          key: string
          label: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          description?: string
          helper_text?: string | null
          is_active?: boolean
          key?: string
          label?: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      reward_entry_amount_modes: {
        Row: {
          admin_description: string | null
          created_at: string
          description: string
          helper_text: string | null
          is_active: boolean
          key: string
          label: string
          metadata_json: Json
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          description: string
          helper_text?: string | null
          is_active?: boolean
          key: string
          label: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          description?: string
          helper_text?: string | null
          is_active?: boolean
          key?: string
          label?: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      reward_entry_kind_amount_modes: {
        Row: {
          admin_description: string | null
          amount_mode: string
          created_at: string
          description: string
          entry_kind: string
          helper_text: string | null
          is_active: boolean
          is_default: boolean
          label: string
          metadata_json: Json
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          amount_mode: string
          created_at?: string
          description: string
          entry_kind: string
          helper_text?: string | null
          is_active?: boolean
          is_default?: boolean
          label: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          amount_mode?: string
          created_at?: string
          description?: string
          entry_kind?: string
          helper_text?: string | null
          is_active?: boolean
          is_default?: boolean
          label?: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_entry_kind_amount_modes_amount_mode_fkey"
            columns: ["amount_mode"]
            isOneToOne: false
            referencedRelation: "reward_entry_amount_modes"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "reward_entry_kind_amount_modes_entry_kind_fkey"
            columns: ["entry_kind"]
            isOneToOne: false
            referencedRelation: "reward_entry_kinds"
            referencedColumns: ["key"]
          },
        ]
      }
      reward_entry_kinds: {
        Row: {
          admin_description: string | null
          created_at: string
          description: string
          helper_text: string | null
          is_active: boolean
          key: string
          label: string
          metadata_json: Json
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          description: string
          helper_text?: string | null
          is_active?: boolean
          key: string
          label: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          description?: string
          helper_text?: string | null
          is_active?: boolean
          key?: string
          label?: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      reward_grant_entries: {
        Row: {
          amount: number | null
          created_at: string
          effect_definition_id: string | null
          entry_kind: string
          id: string
          item_id: string | null
          metadata_json: Json
          new_value_json: Json | null
          old_value_json: Json | null
          resource_type: string | null
          reward_grant_id: string
          reward_profile_entry_id: string | null
          source_hero_id: string | null
          target_hero_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          effect_definition_id?: string | null
          entry_kind: string
          id?: string
          item_id?: string | null
          metadata_json?: Json
          new_value_json?: Json | null
          old_value_json?: Json | null
          resource_type?: string | null
          reward_grant_id: string
          reward_profile_entry_id?: string | null
          source_hero_id?: string | null
          target_hero_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          effect_definition_id?: string | null
          entry_kind?: string
          id?: string
          item_id?: string | null
          metadata_json?: Json
          new_value_json?: Json | null
          old_value_json?: Json | null
          resource_type?: string | null
          reward_grant_id?: string
          reward_profile_entry_id?: string | null
          source_hero_id?: string | null
          target_hero_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reward_grant_entries_effect_definition_id_fkey"
            columns: ["effect_definition_id"]
            isOneToOne: false
            referencedRelation: "exploration_effect_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_grant_entries_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_grant_entries_resource_type_fkey"
            columns: ["resource_type"]
            isOneToOne: false
            referencedRelation: "resource_types"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "reward_grant_entries_reward_grant_id_fkey"
            columns: ["reward_grant_id"]
            isOneToOne: false
            referencedRelation: "reward_grants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_grant_entries_reward_profile_entry_id_fkey"
            columns: ["reward_profile_entry_id"]
            isOneToOne: false
            referencedRelation: "reward_profile_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_grant_entries_source_hero_id_fkey"
            columns: ["source_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_grant_entries_target_hero_id_fkey"
            columns: ["target_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_grants: {
        Row: {
          created_at: string
          granted_at: string
          id: string
          metadata_json: Json
          reason: string | null
          recipient_hero_id: string
          request_id: string | null
          reward_profile_id: string
          server_id: string
          source_id: string
          source_kind: string
          status: string
        }
        Insert: {
          created_at?: string
          granted_at?: string
          id?: string
          metadata_json?: Json
          reason?: string | null
          recipient_hero_id: string
          request_id?: string | null
          reward_profile_id: string
          server_id: string
          source_id: string
          source_kind: string
          status?: string
        }
        Update: {
          created_at?: string
          granted_at?: string
          id?: string
          metadata_json?: Json
          reason?: string | null
          recipient_hero_id?: string
          request_id?: string | null
          reward_profile_id?: string
          server_id?: string
          source_id?: string
          source_kind?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_grants_recipient_hero_id_fkey"
            columns: ["recipient_hero_id"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_grants_reward_profile_id_fkey"
            columns: ["reward_profile_id"]
            isOneToOne: false
            referencedRelation: "reward_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_grants_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_level_match_kinds: {
        Row: {
          admin_description: string | null
          created_at: string
          description: string
          helper_text: string | null
          is_active: boolean
          key: string
          label: string
          metadata_json: Json
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          description: string
          helper_text?: string | null
          is_active?: boolean
          key: string
          label: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          description?: string
          helper_text?: string | null
          is_active?: boolean
          key?: string
          label?: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      reward_outcome_kinds: {
        Row: {
          admin_description: string | null
          created_at: string
          description: string
          helper_text: string | null
          is_active: boolean
          key: string
          label: string
          metadata_json: Json
          sort_order: number
          source_kind: string
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          description: string
          helper_text?: string | null
          is_active?: boolean
          key: string
          label: string
          metadata_json?: Json
          sort_order?: number
          source_kind: string
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          description?: string
          helper_text?: string | null
          is_active?: boolean
          key?: string
          label?: string
          metadata_json?: Json
          sort_order?: number
          source_kind?: string
          updated_at?: string
        }
        Relationships: []
      }
      reward_profile_assignments: {
        Row: {
          created_at: string
          description: string | null
          difficulty_key: string | null
          difficulty_match_kind: string
          district_code: string | null
          district_match_kind: string
          encounter_definition_id: string | null
          helper_text: string | null
          id: string
          is_active: boolean
          level_interval: number | null
          level_match_kind: string
          level_value: number | null
          max_difficulty_key: string | null
          max_district_code: string | null
          max_level_value: number | null
          metadata_json: Json
          outcome_kind: string
          reward_profile_id: string
          sort_order: number
          source_kind: string
          trial_definition_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty_key?: string | null
          difficulty_match_kind?: string
          district_code?: string | null
          district_match_kind?: string
          encounter_definition_id?: string | null
          helper_text?: string | null
          id?: string
          is_active?: boolean
          level_interval?: number | null
          level_match_kind?: string
          level_value?: number | null
          max_difficulty_key?: string | null
          max_district_code?: string | null
          max_level_value?: number | null
          metadata_json?: Json
          outcome_kind: string
          reward_profile_id: string
          sort_order?: number
          source_kind: string
          trial_definition_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty_key?: string | null
          difficulty_match_kind?: string
          district_code?: string | null
          district_match_kind?: string
          encounter_definition_id?: string | null
          helper_text?: string | null
          id?: string
          is_active?: boolean
          level_interval?: number | null
          level_match_kind?: string
          level_value?: number | null
          max_difficulty_key?: string | null
          max_district_code?: string | null
          max_level_value?: number | null
          metadata_json?: Json
          outcome_kind?: string
          reward_profile_id?: string
          sort_order?: number
          source_kind?: string
          trial_definition_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_profile_assignments_difficulty_key_fkey"
            columns: ["difficulty_key"]
            isOneToOne: false
            referencedRelation: "exploration_difficulty_tiers"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "reward_profile_assignments_difficulty_match_kind_fkey"
            columns: ["difficulty_match_kind"]
            isOneToOne: false
            referencedRelation: "reward_assignment_match_kinds"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "reward_profile_assignments_district_match_kind_fkey"
            columns: ["district_match_kind"]
            isOneToOne: false
            referencedRelation: "reward_assignment_match_kinds"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "reward_profile_assignments_encounter_definition_id_fkey"
            columns: ["encounter_definition_id"]
            isOneToOne: false
            referencedRelation: "encounter_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_profile_assignments_level_match_kind_fkey"
            columns: ["level_match_kind"]
            isOneToOne: false
            referencedRelation: "reward_level_match_kinds"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "reward_profile_assignments_max_difficulty_key_fkey"
            columns: ["max_difficulty_key"]
            isOneToOne: false
            referencedRelation: "exploration_difficulty_tiers"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "reward_profile_assignments_outcome_kind_fkey"
            columns: ["source_kind", "outcome_kind"]
            isOneToOne: false
            referencedRelation: "reward_outcome_kinds"
            referencedColumns: ["source_kind", "key"]
          },
          {
            foreignKeyName: "reward_profile_assignments_reward_profile_id_fkey"
            columns: ["reward_profile_id"]
            isOneToOne: false
            referencedRelation: "reward_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_profile_assignments_trial_definition_id_fkey"
            columns: ["trial_definition_id"]
            isOneToOne: false
            referencedRelation: "trial_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_profile_entries: {
        Row: {
          admin_description: string | null
          amount_mode: string
          bucket_profile_id: string | null
          chance_percent: number
          created_at: string
          description: string
          effect_definition_id: string | null
          entry_kind: string
          formula_id: string | null
          helper_text: string | null
          id: string
          is_active: boolean
          label: string
          max_amount: number | null
          max_item_count: number | null
          max_quality_key: string | null
          metadata_json: Json
          min_amount: number | null
          min_item_count: number | null
          resource_type: string | null
          reward_profile_id: string
          sort_order: number
          transfer_recipient_role: string | null
          transfer_source_role: string | null
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          amount_mode?: string
          bucket_profile_id?: string | null
          chance_percent?: number
          created_at?: string
          description: string
          effect_definition_id?: string | null
          entry_kind: string
          formula_id?: string | null
          helper_text?: string | null
          id?: string
          is_active?: boolean
          label: string
          max_amount?: number | null
          max_item_count?: number | null
          max_quality_key?: string | null
          metadata_json?: Json
          min_amount?: number | null
          min_item_count?: number | null
          resource_type?: string | null
          reward_profile_id: string
          sort_order?: number
          transfer_recipient_role?: string | null
          transfer_source_role?: string | null
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          amount_mode?: string
          bucket_profile_id?: string | null
          chance_percent?: number
          created_at?: string
          description?: string
          effect_definition_id?: string | null
          entry_kind?: string
          formula_id?: string | null
          helper_text?: string | null
          id?: string
          is_active?: boolean
          label?: string
          max_amount?: number | null
          max_item_count?: number | null
          max_quality_key?: string | null
          metadata_json?: Json
          min_amount?: number | null
          min_item_count?: number | null
          resource_type?: string | null
          reward_profile_id?: string
          sort_order?: number
          transfer_recipient_role?: string | null
          transfer_source_role?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_profile_entries_bucket_profile_id_fkey"
            columns: ["bucket_profile_id"]
            isOneToOne: false
            referencedRelation: "item_generation_bucket_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_profile_entries_effect_definition_id_fkey"
            columns: ["effect_definition_id"]
            isOneToOne: false
            referencedRelation: "exploration_effect_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_profile_entries_formula_id_fkey"
            columns: ["formula_id"]
            isOneToOne: false
            referencedRelation: "balance_formulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_profile_entries_max_quality_key_fkey"
            columns: ["max_quality_key"]
            isOneToOne: false
            referencedRelation: "item_generation_qualities"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "reward_profile_entries_resource_type_fkey"
            columns: ["resource_type"]
            isOneToOne: false
            referencedRelation: "resource_types"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "reward_profile_entries_reward_profile_id_fkey"
            columns: ["reward_profile_id"]
            isOneToOne: false
            referencedRelation: "reward_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_profiles: {
        Row: {
          admin_description: string | null
          category: string
          created_at: string
          description: string
          helper_text: string | null
          id: string
          is_active: boolean
          key: string
          label: string
          metadata_json: Json
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          category?: string
          created_at?: string
          description: string
          helper_text?: string | null
          id?: string
          is_active?: boolean
          key: string
          label: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          category?: string
          created_at?: string
          description?: string
          helper_text?: string | null
          id?: string
          is_active?: boolean
          key?: string
          label?: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      reward_source_kinds: {
        Row: {
          admin_description: string | null
          created_at: string
          description: string
          helper_text: string | null
          is_active: boolean
          key: string
          label: string
          metadata_json: Json
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          description: string
          helper_text?: string | null
          is_active?: boolean
          key: string
          label: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          description?: string
          helper_text?: string | null
          is_active?: boolean
          key?: string
          label?: string
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      roles: {
        Row: {
          description: string | null
          id: number
          key: string
          name: string
        }
        Insert: {
          description?: string | null
          id?: number
          key: string
          name: string
        }
        Update: {
          description?: string | null
          id?: number
          key?: string
          name?: string
        }
        Relationships: []
      }
      scheduled_job_runs: {
        Row: {
          backlog_after: number | null
          backlog_before: number | null
          created_at: string
          duration_ms: number | null
          error_count: number
          error_message: string | null
          error_sqlstate: string | null
          finished_at: string | null
          id: string
          job_key: string
          limit_requested: number | null
          processed_count: number
          request_id: string | null
          result_summary_json: Json
          started_at: string
          status: string
          success_count: number
        }
        Insert: {
          backlog_after?: number | null
          backlog_before?: number | null
          created_at?: string
          duration_ms?: number | null
          error_count?: number
          error_message?: string | null
          error_sqlstate?: string | null
          finished_at?: string | null
          id?: string
          job_key: string
          limit_requested?: number | null
          processed_count?: number
          request_id?: string | null
          result_summary_json?: Json
          started_at?: string
          status?: string
          success_count?: number
        }
        Update: {
          backlog_after?: number | null
          backlog_before?: number | null
          created_at?: string
          duration_ms?: number | null
          error_count?: number
          error_message?: string | null
          error_sqlstate?: string | null
          finished_at?: string | null
          id?: string
          job_key?: string
          limit_requested?: number | null
          processed_count?: number
          request_id?: string | null
          result_summary_json?: Json
          started_at?: string
          status?: string
          success_count?: number
        }
        Relationships: []
      }
      server_config_values: {
        Row: {
          config_definition_id: string
          created_at: string
          created_by: string | null
          id: string
          locked_at: string | null
          server_id: string
          source: Database["public"]["Enums"]["server_config_value_source"]
          updated_at: string
          value_json: Json
        }
        Insert: {
          config_definition_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          locked_at?: string | null
          server_id: string
          source: Database["public"]["Enums"]["server_config_value_source"]
          updated_at?: string
          value_json: Json
        }
        Update: {
          config_definition_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          locked_at?: string | null
          server_id?: string
          source?: Database["public"]["Enums"]["server_config_value_source"]
          updated_at?: string
          value_json?: Json
        }
        Relationships: [
          {
            foreignKeyName: "server_config_values_config_definition_id_fkey"
            columns: ["config_definition_id"]
            isOneToOne: false
            referencedRelation: "config_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "server_config_values_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
        ]
      }
      server_event_config: {
        Row: {
          cooldown_days: number
          created_at: string
          default_duration_days: number
          future_council_activation_days_after_vote: number
          future_council_activation_rule: string
          future_council_activation_weekday: number | null
          future_council_proposal_count: number
          future_council_vote_duration_days: number
          metadata_json: Json
          server_id: string
          system_roll_chance_percent: number
          system_roll_enabled: boolean
          updated_at: string
        }
        Insert: {
          cooldown_days?: number
          created_at?: string
          default_duration_days?: number
          future_council_activation_days_after_vote?: number
          future_council_activation_rule?: string
          future_council_activation_weekday?: number | null
          future_council_proposal_count?: number
          future_council_vote_duration_days?: number
          metadata_json?: Json
          server_id: string
          system_roll_chance_percent?: number
          system_roll_enabled?: boolean
          updated_at?: string
        }
        Update: {
          cooldown_days?: number
          created_at?: string
          default_duration_days?: number
          future_council_activation_days_after_vote?: number
          future_council_activation_rule?: string
          future_council_activation_weekday?: number | null
          future_council_proposal_count?: number
          future_council_vote_duration_days?: number
          metadata_json?: Json
          server_id?: string
          system_roll_chance_percent?: number
          system_roll_enabled?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "server_event_config_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: true
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
        ]
      }
      server_event_definitions: {
        Row: {
          admin_notes: string | null
          created_at: string
          default_duration_days: number | null
          effect_explanation: string
          event_polarity: string
          helper_text: string | null
          id: string
          is_active: boolean
          key: string
          lore_description: string
          lore_name: string
          metadata_json: Json
          player_summary: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          default_duration_days?: number | null
          effect_explanation: string
          event_polarity?: string
          helper_text?: string | null
          id?: string
          is_active?: boolean
          key: string
          lore_description: string
          lore_name: string
          metadata_json?: Json
          player_summary: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          default_duration_days?: number | null
          effect_explanation?: string
          event_polarity?: string
          helper_text?: string | null
          id?: string
          is_active?: boolean
          key?: string
          lore_description?: string
          lore_name?: string
          metadata_json?: Json
          player_summary?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      server_event_effects: {
        Row: {
          admin_description: string | null
          created_at: string
          definition_id: string
          id: string
          is_active: boolean
          metadata_json: Json
          numeric_value: number
          operation: string
          player_description: string
          player_label: string
          sort_order: number
          target_family: string
          target_key: string | null
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          definition_id: string
          id?: string
          is_active?: boolean
          metadata_json?: Json
          numeric_value: number
          operation: string
          player_description: string
          player_label: string
          sort_order?: number
          target_family: string
          target_key?: string | null
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          definition_id?: string
          id?: string
          is_active?: boolean
          metadata_json?: Json
          numeric_value?: number
          operation?: string
          player_description?: string
          player_label?: string
          sort_order?: number
          target_family?: string
          target_key?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "server_event_effects_definition_id_fkey"
            columns: ["definition_id"]
            isOneToOne: false
            referencedRelation: "server_event_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      server_event_runs: {
        Row: {
          actual_ended_at: string | null
          created_at: string
          created_by: string | null
          definition_id: string
          ends_at: string
          id: string
          metadata_json: Json
          request_id: string | null
          server_id: string
          source_kind: string
          starts_at: string
          status: string
          updated_at: string
        }
        Insert: {
          actual_ended_at?: string | null
          created_at?: string
          created_by?: string | null
          definition_id: string
          ends_at: string
          id?: string
          metadata_json?: Json
          request_id?: string | null
          server_id: string
          source_kind: string
          starts_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          actual_ended_at?: string | null
          created_at?: string
          created_by?: string | null
          definition_id?: string
          ends_at?: string
          id?: string
          metadata_json?: Json
          request_id?: string | null
          server_id?: string
          source_kind?: string
          starts_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "server_event_runs_definition_id_fkey"
            columns: ["definition_id"]
            isOneToOne: false
            referencedRelation: "server_event_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "server_event_runs_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
        ]
      }
      server_memberships: {
        Row: {
          ban_reason: string | null
          created_at: string
          id: string
          joined_at: string
          moderation_block_action_id: string | null
          moderation_block_expires_at: string | null
          moderation_block_reason: string | null
          moderation_block_synced_at: string | null
          server_id: string
          status: Database["public"]["Enums"]["server_membership_status"]
          suspended_until: string | null
          suspension_reason: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ban_reason?: string | null
          created_at?: string
          id?: string
          joined_at?: string
          moderation_block_action_id?: string | null
          moderation_block_expires_at?: string | null
          moderation_block_reason?: string | null
          moderation_block_synced_at?: string | null
          server_id: string
          status?: Database["public"]["Enums"]["server_membership_status"]
          suspended_until?: string | null
          suspension_reason?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ban_reason?: string | null
          created_at?: string
          id?: string
          joined_at?: string
          moderation_block_action_id?: string | null
          moderation_block_expires_at?: string | null
          moderation_block_reason?: string | null
          moderation_block_synced_at?: string | null
          server_id?: string
          status?: Database["public"]["Enums"]["server_membership_status"]
          suspended_until?: string | null
          suspension_reason?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "server_memberships_moderation_block_action_id_fkey"
            columns: ["moderation_block_action_id"]
            isOneToOne: false
            referencedRelation: "moderation_actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "server_memberships_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
        ]
      }
      server_staff_assignment_scopes: {
        Row: {
          created_at: string
          granted_by_user_id: string | null
          id: string
          scope_key: string
          staff_assignment_id: string
        }
        Insert: {
          created_at?: string
          granted_by_user_id?: string | null
          id?: string
          scope_key: string
          staff_assignment_id: string
        }
        Update: {
          created_at?: string
          granted_by_user_id?: string | null
          id?: string
          scope_key?: string
          staff_assignment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "server_staff_assignment_scopes_scope_key_fkey"
            columns: ["scope_key"]
            isOneToOne: false
            referencedRelation: "staff_permission_scopes"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "server_staff_assignment_scopes_staff_assignment_id_fkey"
            columns: ["staff_assignment_id"]
            isOneToOne: false
            referencedRelation: "server_staff_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      server_staff_assignments: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          role: Database["public"]["Enums"]["server_staff_role"]
          server_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          role: Database["public"]["Enums"]["server_staff_role"]
          server_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          role?: Database["public"]["Enums"]["server_staff_role"]
          server_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "server_staff_assignments_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "game_servers"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_permission_scopes: {
        Row: {
          created_at: string
          description: string
          helper_text: string | null
          is_active: boolean
          key: string
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          helper_text?: string | null
          is_active?: boolean
          key: string
          label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          helper_text?: string | null
          is_active?: boolean
          key?: string
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      stats: {
        Row: {
          admin_description: string | null
          description: string | null
          helper_text: string | null
          id: string
          key: string
          label: string
          order: number
        }
        Insert: {
          admin_description?: string | null
          description?: string | null
          helper_text?: string | null
          id?: string
          key: string
          label: string
          order: number
        }
        Update: {
          admin_description?: string | null
          description?: string | null
          helper_text?: string | null
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
      trial_combat_candidates: {
        Row: {
          candidate_kind: Database["public"]["Enums"]["combat_candidate_kind"]
          created_at: string
          difficulty_multiplier: number
          family_key: string | null
          id: string
          is_active: boolean
          max_hero_level: number | null
          min_hero_level: number | null
          opponent_definition_id: string | null
          scaling_formula_id: string | null
          sort_order: number
          trial_definition_id: string
          updated_at: string
          weight: number
        }
        Insert: {
          candidate_kind: Database["public"]["Enums"]["combat_candidate_kind"]
          created_at?: string
          difficulty_multiplier?: number
          family_key?: string | null
          id?: string
          is_active?: boolean
          max_hero_level?: number | null
          min_hero_level?: number | null
          opponent_definition_id?: string | null
          scaling_formula_id?: string | null
          sort_order?: number
          trial_definition_id: string
          updated_at?: string
          weight?: number
        }
        Update: {
          candidate_kind?: Database["public"]["Enums"]["combat_candidate_kind"]
          created_at?: string
          difficulty_multiplier?: number
          family_key?: string | null
          id?: string
          is_active?: boolean
          max_hero_level?: number | null
          min_hero_level?: number | null
          opponent_definition_id?: string | null
          scaling_formula_id?: string | null
          sort_order?: number
          trial_definition_id?: string
          updated_at?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "trial_combat_candidates_family_key_fkey"
            columns: ["family_key"]
            isOneToOne: false
            referencedRelation: "combat_opponent_families"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "trial_combat_candidates_opponent_definition_id_fkey"
            columns: ["opponent_definition_id"]
            isOneToOne: false
            referencedRelation: "combat_opponent_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trial_combat_candidates_scaling_formula_id_fkey"
            columns: ["scaling_formula_id"]
            isOneToOne: false
            referencedRelation: "balance_formulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trial_combat_candidates_trial_definition_id_fkey"
            columns: ["trial_definition_id"]
            isOneToOne: false
            referencedRelation: "trial_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      trial_definitions: {
        Row: {
          admin_description: string | null
          created_at: string
          description: string
          helper_text: string | null
          id: string
          is_active: boolean
          key: string
          label: string
          metadata_json: Json
          minigame_key: string
          sort_order: number
          tested_stat_key: string
          updated_at: string
        }
        Insert: {
          admin_description?: string | null
          created_at?: string
          description: string
          helper_text?: string | null
          id?: string
          is_active?: boolean
          key: string
          label: string
          metadata_json?: Json
          minigame_key: string
          sort_order?: number
          tested_stat_key: string
          updated_at?: string
        }
        Update: {
          admin_description?: string | null
          created_at?: string
          description?: string
          helper_text?: string | null
          id?: string
          is_active?: boolean
          key?: string
          label?: string
          metadata_json?: Json
          minigame_key?: string
          sort_order?: number
          tested_stat_key?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trial_definitions_minigame_key_fkey"
            columns: ["minigame_key"]
            isOneToOne: false
            referencedRelation: "exploration_minigame_definitions"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "trial_definitions_tested_stat_key_fkey"
            columns: ["tested_stat_key"]
            isOneToOne: false
            referencedRelation: "stats"
            referencedColumns: ["key"]
          },
        ]
      }
      trial_manifestation_cap_profiles: {
        Row: {
          created_at: string
          description: string | null
          difficulty_key: string
          district_code: string
          helper_text: string | null
          id: string
          is_active: boolean
          max_manifestation_chance_percent: number
          metadata_json: Json
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty_key: string
          district_code: string
          helper_text?: string | null
          id?: string
          is_active?: boolean
          max_manifestation_chance_percent: number
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty_key?: string
          district_code?: string
          helper_text?: string | null
          id?: string
          is_active?: boolean
          max_manifestation_chance_percent?: number
          metadata_json?: Json
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trial_manifestation_cap_profiles_difficulty_key_fkey"
            columns: ["difficulty_key"]
            isOneToOne: false
            referencedRelation: "exploration_difficulty_tiers"
            referencedColumns: ["key"]
          },
        ]
      }
      ui_metadata_entries: {
        Row: {
          created_at: string
          description: string | null
          helper_text: string | null
          id: string
          impact_summary: string | null
          is_active: boolean
          key: string
          label: string
          metadata_json: Json
          namespace: string
          sort_order: number
          ui_group_key: string | null
          ui_group_label: string | null
          updated_at: string
          warning_text: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          helper_text?: string | null
          id?: string
          impact_summary?: string | null
          is_active?: boolean
          key: string
          label: string
          metadata_json?: Json
          namespace: string
          sort_order?: number
          ui_group_key?: string | null
          ui_group_label?: string | null
          updated_at?: string
          warning_text?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          helper_text?: string | null
          id?: string
          impact_summary?: string | null
          is_active?: boolean
          key?: string
          label?: string
          metadata_json?: Json
          namespace?: string
          sort_order?: number
          ui_group_key?: string | null
          ui_group_label?: string | null
          updated_at?: string
          warning_text?: string | null
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
      v_health_percent_template_id: {
        Row: {
          id: string | null
        }
        Insert: {
          id?: string | null
        }
        Update: {
          id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_anti_abuse_case_participant_if_missing: {
        Args: {
          p_case_id: string
          p_created_by_user_id?: string
          p_description?: string
          p_hero_id: string
          p_reason?: string
          p_role_key: string
          p_user_id: string
        }
        Returns: string
      }
      add_anti_abuse_sanction_item: {
        Args: {
          p_destination_hero_id?: string
          p_item_id: string
          p_operator_notes?: string
          p_reason?: string
          p_sanction_id: string
          p_source_hero_id?: string
        }
        Returns: {
          created_at: string
          created_by_user_id: string | null
          destination_hero_id: string | null
          id: string
          item_id: string
          operator_notes: string | null
          reason: string
          sanction_id: string
          source_hero_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "anti_abuse_sanction_items"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      add_hero_remaining_actions: {
        Args: {
          p_action_date?: string
          p_action_kind: string
          p_amount: number
          p_hero_id: string
          p_reason: string
          p_server_id: string
        }
        Returns: {
          action_date: string
          action_kind: string
          counter_id: string
          hero_id: string
          remaining_count: number
          server_id: string
        }[]
      }
      advance_combat_live_to_next_player_action: {
        Args: { p_request_id?: string; p_session_id: string }
        Returns: {
          awaiting_player_action: boolean
          combat_completed: boolean
          event_count: number
        }[]
      }
      aggregate_item_detail_modifier_rows: {
        Args: { p_bonuses_json: Json }
        Returns: Json
      }
      apply_auction_pagination_display: {
        Args: { p_payload: Json; p_template: string }
        Returns: Json
      }
      apply_balance_formula_assignment_draft_entry: {
        Args: {
          p_actor: string
          p_entry: Database["public"]["Tables"]["config_change_entries"]["Row"]
        }
        Returns: undefined
      }
      apply_balance_formula_draft_entry: {
        Args: {
          p_actor: string
          p_entry: Database["public"]["Tables"]["config_change_entries"]["Row"]
        }
        Returns: undefined
      }
      apply_character_point_penalty_sink: {
        Args: {
          p_available_amount: number
          p_description?: string
          p_hero_id: string
          p_related_entity_id?: string
          p_related_entity_type?: string
        }
        Returns: {
          balance_after: number
          consumed_amount: number
          payments_json: Json
        }[]
      }
      apply_character_points_delta: {
        Args: {
          p_amount_delta: number
          p_created_by?: string
          p_description?: string
          p_hero_id: string
          p_reason: Database["public"]["Enums"]["character_point_ledger_reason"]
          p_related_entity_id?: string
          p_related_entity_type?: string
        }
        Returns: number
      }
      apply_combat_live_round_end_healing: {
        Args: {
          p_request_id?: string
          p_round_number: number
          p_session_id: string
        }
        Returns: {
          applied_count: number
          event_count: number
        }[]
      }
      apply_config_change_set: {
        Args: { p_change_set_id: string }
        Returns: {
          applied_at: string | null
          applied_by: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          cancelled_reason: string | null
          changelog_body: string | null
          changelog_title: string | null
          changelog_visibility: Database["public"]["Enums"]["config_change_visibility"]
          created_at: string
          draft_kind: string | null
          id: string
          ready_at: string | null
          ready_by: string | null
          reason: string
          requested_by: string | null
          status: Database["public"]["Enums"]["config_change_status"]
          title: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "config_change_sets"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      apply_config_entity_field_change_entry: {
        Args: {
          p_actor: string
          p_entry: Database["public"]["Tables"]["config_change_entries"]["Row"]
        }
        Returns: undefined
      }
      apply_global_config_value_change_entry: {
        Args: {
          p_actor: string
          p_entry: Database["public"]["Tables"]["config_change_entries"]["Row"]
        }
        Returns: undefined
      }
      apply_hero_level_stat_bonus_grant: {
        Args: {
          p_amount: number
          p_grant_kind: string
          p_hero_id: string
          p_level_up_ledger_id: string
          p_metadata_json?: Json
          p_random_total_amount?: number
          p_random_weight_snapshot?: number
          p_rule_id: string
          p_rule_stat_id: string
          p_stat_key: string
        }
        Returns: string
      }
      apply_hero_loadout_preset: {
        Args: {
          p_hero_id: string
          p_preset_number: number
          p_request_id?: string
        }
        Returns: {
          equipped_count: number
          failed_count: number
          final_equipment_json: Json
          hero_id: string
          preset_number: number
          request_id: string
          result_journal_json: Json
          skipped_count: number
          success: boolean
        }[]
      }
      apply_hero_prestige_delta: {
        Args: {
          p_admin_context_json?: Json
          p_hero_id: string
          p_message_kind?: string
          p_metadata_json?: Json
          p_player_summary_json?: Json
          p_points_delta: number
          p_request_id?: string
          p_source_entity_id?: string
          p_source_entity_type?: string
          p_source_kind: string
        }
        Returns: {
          admin_context_json: Json
          created_new_ledger: boolean
          effective_points_delta: number
          hero_id: string
          ledger_id: string
          message_kind: string
          player_summary_json: Json
          points_after: number
          points_before: number
          points_delta: number
          rank_changed: boolean
          rank_name_after: string
          rank_name_before: string
          rank_number_after: number
          rank_number_before: number
          request_id: string
          server_id: string
          source_entity_id: string
          source_entity_type: string
          source_kind: string
        }[]
      }
      apply_hero_resource_delta_with_ledger: {
        Args: {
          p_amount_delta: number
          p_hero_id: string
          p_reason: string
          p_related_entity_id?: string
          p_related_entity_type?: string
          p_resource_type: string
        }
        Returns: number
      }
      apply_item_detail_popover_item_stats_filter: {
        Args: { p_response: Json }
        Returns: Json
      }
      apply_item_detail_popover_requirement_current_text: {
        Args: { p_response: Json }
        Returns: Json
      }
      apply_item_detail_popover_requirement_status: {
        Args: { p_item_id: string; p_response: Json; p_viewer_hero_id: string }
        Returns: Json
      }
      apply_item_generation_bucket_profile_draft_entry: {
        Args: {
          p_actor: string
          p_entry: Database["public"]["Tables"]["config_change_entries"]["Row"]
        }
        Returns: undefined
      }
      apply_item_generation_quality_draft_entry: {
        Args: {
          p_actor: string
          p_entry: Database["public"]["Tables"]["config_change_entries"]["Row"]
        }
        Returns: undefined
      }
      apply_level_up_stat_bonuses_to_hero: {
        Args: {
          p_hero_id: string
          p_level_up_ledger_id: string
          p_metadata_json?: Json
          p_reason?: string
          p_request_id?: string
        }
        Returns: {
          grants_json: Json
          hero_id: string
          level_up_ledger_id: string
          reached_level: number
          rules_applied: number
          rules_matched: number
          total_points_granted: number
        }[]
      }
      apply_player_estate_building_group_metadata_json: {
        Args: { p_building_json: Json; p_default_district_code: string }
        Returns: Json
      }
      apply_player_estate_building_requirement_status_json: {
        Args: { p_building_json: Json; p_estate_id: string; p_hero_id: string }
        Returns: Json
      }
      apply_player_estate_building_resource_cost_status_json: {
        Args: { p_building_json: Json; p_hero_id: string }
        Returns: Json
      }
      apply_player_estate_buildings_group_metadata_json: {
        Args: { p_buildings_json: Json; p_default_district_code: string }
        Returns: Json
      }
      apply_player_estate_buildings_requirement_status_json: {
        Args: { p_buildings_json: Json; p_estate_id: string; p_hero_id: string }
        Returns: Json
      }
      apply_player_estate_buildings_resource_cost_status_json: {
        Args: { p_buildings_json: Json; p_hero_id: string }
        Returns: Json
      }
      apply_pvp_attack_result_prestige: {
        Args: { p_pvp_attack_result_id: string; p_request_id?: string }
        Returns: {
          attacker_estate_id: string | null
          attacker_hero_id: string
          attacker_level_snapshot: number
          combat_outcome: Database["public"]["Enums"]["combat_outcome"]
          combat_result_id: string
          created_at: string
          defender_estate_id: string | null
          defender_hero_id: string
          defender_level_snapshot: number
          id: string
          level_difference: number
          loser_hero_id: string | null
          metadata_json: Json
          notification_context_json: Json
          outcome_key: string
          prestige_context_json: Json
          pvp_action_id: string
          report_context_json: Json
          resource_outcome_json: Json
          reward_context_json: Json
          server_id: string
          winner_hero_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "pvp_attack_results"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      apply_pvp_resource_consequences: {
        Args: { p_pvp_attack_result_id: string; p_request_id?: string }
        Returns: {
          attacker_estate_id: string | null
          attacker_hero_id: string
          attacker_level_snapshot: number
          combat_outcome: Database["public"]["Enums"]["combat_outcome"]
          combat_result_id: string
          created_at: string
          defender_estate_id: string | null
          defender_hero_id: string
          defender_level_snapshot: number
          id: string
          level_difference: number
          loser_hero_id: string | null
          metadata_json: Json
          notification_context_json: Json
          outcome_key: string
          prestige_context_json: Json
          pvp_action_id: string
          report_context_json: Json
          resource_outcome_json: Json
          reward_context_json: Json
          server_id: string
          winner_hero_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "pvp_attack_results"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      apply_pvp_xp_rewards: {
        Args: { p_pvp_attack_result_id: string; p_request_id?: string }
        Returns: {
          attacker_estate_id: string | null
          attacker_hero_id: string
          attacker_level_snapshot: number
          combat_outcome: Database["public"]["Enums"]["combat_outcome"]
          combat_result_id: string
          created_at: string
          defender_estate_id: string | null
          defender_hero_id: string
          defender_level_snapshot: number
          id: string
          level_difference: number
          loser_hero_id: string | null
          metadata_json: Json
          notification_context_json: Json
          outcome_key: string
          prestige_context_json: Json
          pvp_action_id: string
          report_context_json: Json
          resource_outcome_json: Json
          reward_context_json: Json
          server_id: string
          winner_hero_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "pvp_attack_results"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      apply_reward_character_points_delta: {
        Args: {
          p_amount_delta: number
          p_description: string
          p_hero_id: string
          p_reason: Database["public"]["Enums"]["character_point_ledger_reason"]
          p_related_entity_id: string
          p_related_entity_type: string
        }
        Returns: number
      }
      apply_reward_resource_delta: {
        Args: {
          p_amount_delta: number
          p_hero_id: string
          p_resource_type: string
        }
        Returns: number
      }
      apply_server_config_value_change_entry: {
        Args: {
          p_actor: string
          p_entry: Database["public"]["Tables"]["config_change_entries"]["Row"]
        }
        Returns: undefined
      }
      apply_server_event_requirement_modifier: {
        Args: {
          p_required_value: number
          p_requirement_definition_key: string
          p_server_id: string
        }
        Returns: {
          adjusted_required_value: number
          applied_percent_delta: number
          effects_json: Json
          excluded_from_modifier: boolean
          original_required_value: number
          requirement_definition_key: string
        }[]
      }
      assert_can_decide_anti_abuse: {
        Args: { p_operation?: string; p_server_id: string }
        Returns: undefined
      }
      assert_can_manage_anti_abuse_sanctions: {
        Args: { p_operation?: string; p_server_id: string }
        Returns: undefined
      }
      assert_can_manage_combat_opponent_config: {
        Args: { p_operation?: string; p_reason: string }
        Returns: undefined
      }
      assert_can_manage_encounter_payload_config: {
        Args: { p_operation?: string; p_reason: string }
        Returns: undefined
      }
      assert_can_manage_entity_requirements: {
        Args: {
          p_entity_id: string
          p_entity_type: Database["public"]["Enums"]["requirement_entity_type"]
          p_operation?: string
        }
        Returns: undefined
      }
      assert_can_manage_reward_config: {
        Args: { p_operation?: string; p_reason: string }
        Returns: undefined
      }
      assert_can_read_full_moderation_history: {
        Args: { p_operation?: string; p_server_id: string }
        Returns: undefined
      }
      assert_can_triage_anti_abuse: {
        Args: { p_operation?: string; p_server_id: string }
        Returns: undefined
      }
      assert_can_use_exploration_test_tools: {
        Args: { p_operation?: string; p_server_id: string }
        Returns: undefined
      }
      assert_can_use_hero_exploration: {
        Args: { p_hero_id: string; p_operation?: string }
        Returns: undefined
      }
      assert_hero_belongs_to_server: {
        Args: { p_hero_id: string; p_server_id: string }
        Returns: undefined
      }
      assert_hero_can_start_runtime_activity: {
        Args: {
          p_activity_kind: string
          p_hero_id: string
          p_operation?: string
        }
        Returns: undefined
      }
      assert_hero_can_use_normal_gameplay: {
        Args: { p_hero_id: string; p_operation?: string }
        Returns: undefined
      }
      assert_hero_can_use_player_auction_runtime: {
        Args: { p_hero_id: string; p_operation?: string }
        Returns: undefined
      }
      assert_hero_can_use_player_trade_runtime: {
        Args: { p_hero_id: string; p_operation?: string }
        Returns: undefined
      }
      assert_hero_estate_movement_not_locked: {
        Args: { p_hero_id: string; p_lock_kinds?: string[] }
        Returns: undefined
      }
      assert_hero_meets_building_prestige_requirement: {
        Args: {
          p_building_id: string
          p_hero_id: string
          p_target_level: number
        }
        Returns: undefined
      }
      assert_hero_meets_building_requirements: {
        Args: {
          p_building_id: string
          p_estate_id: string
          p_hero_id: string
          p_target_level: number
        }
        Returns: undefined
      }
      assert_item_not_in_current_guild_armory: {
        Args: { p_action?: string; p_item_id: string }
        Returns: undefined
      }
      assert_server_event_effect_payload: {
        Args: {
          p_numeric_value: number
          p_operation: string
          p_target_family: string
          p_target_key: string
        }
        Returns: undefined
      }
      assert_server_event_metadata_has_no_weights: {
        Args: { p_context: string; p_metadata_json: Json }
        Returns: undefined
      }
      assign_global_role: {
        Args: { p_reason: string; p_role_key: string; p_user_id: string }
        Returns: {
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
        SetofOptions: {
          from: "*"
          to: "user_data"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      assign_server_staff: {
        Args: {
          p_notes?: string
          p_reason: string
          p_role: Database["public"]["Enums"]["server_staff_role"]
          p_server_id: string
          p_user_id: string
        }
        Returns: {
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          role: Database["public"]["Enums"]["server_staff_role"]
          server_id: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "server_staff_assignments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      attach_reward_drop_item_to_game_report: {
        Args: {
          p_item_id: string
          p_reason?: string
          p_report_id: string
          p_request_id?: string
          p_sort_order?: number
        }
        Returns: {
          audit_log_id: string
          base_id: string
          display_name_fallback: string
          item_reference_id: string
          prefix_affix_id: string
          quality_key: string
          report_id: string
          sort_order: number
          source_item_id: string
          suffix_affix_id: string
        }[]
      }
      attach_reward_grant_items_to_game_report: {
        Args: {
          p_reason?: string
          p_report_id: string
          p_request_id?: string
          p_reward_grant_id: string
        }
        Returns: {
          attached_count: number
          existing_count: number
          item_reference_count: number
          report_id: string
          reward_grant_id: string
          skipped_count: number
        }[]
      }
      auction_bid_status_label: {
        Args: {
          p_status: Database["public"]["Enums"]["player_auction_bid_status"]
        }
        Returns: string
      }
      auction_bid_status_tone: {
        Args: {
          p_status: Database["public"]["Enums"]["player_auction_bid_status"]
        }
        Returns: string
      }
      auction_character_points_display: {
        Args: { p_amount: number }
        Returns: string
      }
      auction_mode_label: {
        Args: { p_mode: Database["public"]["Enums"]["player_auction_mode"] }
        Returns: string
      }
      auction_pagination_json: {
        Args: { p_limit: number; p_offset: number; p_total_count: number }
        Returns: Json
      }
      auction_status_label: {
        Args: { p_status: Database["public"]["Enums"]["player_auction_status"] }
        Returns: string
      }
      auction_status_tone: {
        Args: { p_status: Database["public"]["Enums"]["player_auction_status"] }
        Returns: string
      }
      auto_resolve_combat_session: {
        Args: {
          p_request_id?: string
          p_source_entity_id: string
          p_source_entity_type: string
        }
        Returns: {
          attacks_created: number
          combat_result_id: string
          combat_session_id: string
          completion_mode: string
          exploration_status: string
          final_event_count: number
          game_report_id: string
          outcome: Database["public"]["Enums"]["combat_outcome"]
          outcome_key: string
          participant_stats_created: number
          participants_created: number
          remaining_trials: number
          report_attacks_count: number
          reward_grant_id: string
          runtime_activity_id: string
          source_entity_id: string
          source_entity_type: string
          source_result_id: string
          source_result_kind: string
          source_type: Database["public"]["Enums"]["combat_source_type"]
          status: string
          success: boolean
        }[]
      }
      auto_resolve_hero_exploration_challenge_attempt: {
        Args: { p_challenge_attempt_id: string; p_request_id?: string }
        Returns: {
          auto_resolve_chance: number
          auto_resolve_roll: number
          challenge_attempt_id: string
          completion_mode: string
          reward_grant_id: string
          status: string
          success: boolean
        }[]
      }
      auto_resolve_manual_trial: {
        Args: {
          p_attempt_id: string
          p_request_id?: string
          p_resolution_mode_key?: string
        }
        Returns: {
          action_log_id: string
          attempt_id: string
          backend_replay_summary_json: Json
          failure_reason_helper_text: string
          failure_reason_key: string
          failure_reason_label: string
          game_report_id: string
          hero_id: string
          manual_session_id: string
          minigame_key: string
          outcome_key: string
          performance_rating: string
          player_report_summary_json: Json
          resolution_mode_key: string
          resolved_at: string
          reward_grant_id: string
          reward_summary_json: Json
          score: number
          server_id: string
          trial_definition_id: string
          validation_reason_key: string
          validation_reason_label: string
          validation_reason_severity: string
          validation_warnings_json: Json
          verdict_id: string
        }[]
      }
      auto_resolve_pvp_attack_action: {
        Args: { p_pvp_action_id: string; p_request_id?: string }
        Returns: {
          action_status: string
          attacks_created: number
          combat_result_id: string
          combat_session_id: string
          final_event_count: number
          game_report_id: string
          outcome: Database["public"]["Enums"]["combat_outcome"]
          outcome_key: string
          participant_stats_created: number
          participants_created: number
          pvp_action_id: string
          pvp_attack_result_id: string
          report_attacks_count: number
          runtime_activity_id: string
        }[]
      }
      borrow_guild_armory_item: {
        Args: {
          p_actor_hero_id: string
          p_armory_item_id: string
          p_reason?: string
          p_request_id?: string
        }
        Returns: {
          armory_item_id: string
          armory_status_key: string
          audit_log_id: string
          borrower_hero_id: string
          guild_id: string
          item_id: string
          loan_id: string
          loan_status_key: string
          owner_hero_id: string
        }[]
      }
      build_anti_abuse_hero_pair_grouping_key: {
        Args: { p_hero_a: string; p_hero_b: string; p_server_id: string }
        Returns: string
      }
      build_auction_bid_row: {
        Args: { p_bid_id: string; p_viewer_hero_id: string }
        Returns: Json
      }
      build_auction_item_display_core: {
        Args: { p_item_id: string }
        Returns: Json
      }
      build_auction_listing_row: {
        Args: { p_hero_id: string; p_listing_id: string }
        Returns: Json
      }
      build_auction_listing_row_raw_v1: {
        Args: { p_listing_id: string; p_viewer_hero_id: string }
        Returns: Json
      }
      build_auction_pagination_display: {
        Args: {
          p_limit: number
          p_offset: number
          p_template: string
          p_total_count: number
        }
        Returns: Json
      }
      build_combat_attack_log_display_json: {
        Args: {
          p_actor_display_name?: string
          p_attack_source_kind?: string
          p_attack_source_label?: string
          p_critical?: boolean
          p_display_text?: string
          p_evaded?: boolean
          p_event_kind?: string
          p_final_damage?: number
          p_round_number?: number
          p_target_display_name?: string
          p_timing_hit?: boolean
        }
        Returns: Json
      }
      build_combat_live_action_manifest: {
        Args: { p_action_json: Json; p_session_id: string }
        Returns: Json
      }
      build_combat_live_attacks_snapshot_json: {
        Args: { p_session_id: string }
        Returns: Json
      }
      build_combat_live_participant_base_stat_rows_json: {
        Args: { p_locale_key?: string; p_participant_id: string }
        Returns: Json
      }
      build_combat_live_participant_combat_stat_rows_json: {
        Args: { p_locale_key?: string; p_participant_id: string }
        Returns: Json
      }
      build_combat_live_participants_snapshot_json: {
        Args: { p_session_id: string }
        Returns: Json
      }
      build_combat_opponent_equipment_loadout_snapshot: {
        Args: { p_opponent_definition_id: string; p_reference_level?: number }
        Returns: Json
      }
      build_combat_preview_base_stat_rows_json: {
        Args: { p_locale_key?: string; p_snapshot_json: Json }
        Returns: Json
      }
      build_combat_preview_combat_stat_rows_json: {
        Args: { p_locale_key?: string; p_snapshot_json: Json }
        Returns: Json
      }
      build_combat_result_participant_base_stat_rows_json: {
        Args: { p_locale_key?: string; p_participant_id: string }
        Returns: Json
      }
      build_combat_result_participant_combat_stat_rows_json: {
        Args: { p_locale_key?: string; p_participant_id: string }
        Returns: Json
      }
      build_exploration_effect_definition_display_json: {
        Args: { p_effect_definition_id: string; p_public_safe?: boolean }
        Returns: Json
      }
      build_exploration_trial_detail_by_stat_json: {
        Args: {
          p_auto_result_preview_json: Json
          p_manifestation_preview_json: Json
        }
        Returns: Json
      }
      build_game_report_combat_section_json: {
        Args: { p_public_safe?: boolean; p_report_id: string }
        Returns: Json
      }
      build_game_report_combat_section_json_base: {
        Args: { p_public_safe?: boolean; p_report_id: string }
        Returns: Json
      }
      build_game_report_effect_section_json: {
        Args: { p_public_safe?: boolean; p_report_id: string }
        Returns: Json
      }
      build_game_report_encounter_section_json: {
        Args: { p_public_safe?: boolean; p_report_id: string }
        Returns: Json
      }
      build_game_report_related_reports_json: {
        Args: { p_public_safe?: boolean; p_report_id: string }
        Returns: Json
      }
      build_game_report_reward_section_json: {
        Args: { p_public_safe?: boolean; p_report_id: string }
        Returns: Json
      }
      build_game_report_reward_section_json_base: {
        Args: { p_public_safe?: boolean; p_report_id: string }
        Returns: Json
      }
      build_game_report_source_label: {
        Args: { p_report_id: string }
        Returns: string
      }
      build_game_report_spy_section_json: {
        Args: { p_public_safe?: boolean; p_report_id: string }
        Returns: Json
      }
      build_game_report_spy_section_json_for_viewer: {
        Args: {
          p_public_safe?: boolean
          p_report_id: string
          p_viewer_hero_id: string
        }
        Returns: Json
      }
      build_game_report_trial_section_json: {
        Args: { p_public_safe?: boolean; p_report_id: string }
        Returns: Json
      }
      build_hero_building_requirement_status_json: {
        Args: {
          p_building_id: string
          p_estate_id: string
          p_hero_id: string
          p_target_level: number
        }
        Returns: Json
      }
      build_hero_building_resource_cost_status_json: {
        Args: { p_hero_id: string; p_resource_costs_json: Json }
        Returns: Json
      }
      build_hero_combat_preview_snapshot_readonly: {
        Args: {
          p_hero_id: string
          p_pvp_role?: string
          p_side?: Database["public"]["Enums"]["combat_side"]
        }
        Returns: Json
      }
      build_hero_combatant_snapshot_for_resolver: {
        Args: {
          p_hero_id: string
          p_side?: Database["public"]["Enums"]["combat_side"]
        }
        Returns: Json
      }
      build_hero_effective_base_stat_rows_readonly:
        | { Args: { p_hero_id: string; p_locale_key?: string }; Returns: Json }
        | {
            Args: {
              p_excluded_item_id: string
              p_hero_id: string
              p_locale_key: string
            }
            Returns: Json
          }
      build_hero_exploration_movement_options: {
        Args: { p_exploration_id: string }
        Returns: Json
      }
      build_hero_item_stat_summary: {
        Args: { p_hero_id: string; p_item_id: string }
        Returns: Json
      }
      build_hero_runtime_stats_snapshot_readonly: {
        Args: { p_hero_id: string; p_locale_key?: string }
        Returns: Json
      }
      build_item_detail_popover_bonuses_json: {
        Args: { p_item_id: string; p_viewer_hero_id: string }
        Returns: Json
      }
      build_item_detail_popover_component_detail: {
        Args: {
          p_access: Json
          p_base_id: string
          p_created_at: string
          p_item_id: string
          p_item_name: string
          p_item_status: string
          p_owner_hero_id: string
          p_owner_hero_name: string
          p_prefix_affix_id: string
          p_quality_key: string
          p_report_item_reference_id: string
          p_server_id: string
          p_suffix_affix_id: string
          p_viewer_hero_id: string
        }
        Returns: Json
      }
      build_item_detail_popover_component_requirement_status: {
        Args: {
          p_base_id: string
          p_prefix_affix_id: string
          p_quality_key: string
          p_suffix_affix_id: string
          p_viewer_hero_id: string
        }
        Returns: Json
      }
      build_item_detail_popover_copy_payload: { Args: never; Returns: Json }
      build_item_detail_popover_live_detail: {
        Args: { p_context?: string; p_hero_id: string; p_item_id: string }
        Returns: Json
      }
      build_item_detail_popover_requirement_status_json: {
        Args: { p_item_id: string; p_viewer_hero_id: string }
        Returns: Json
      }
      build_opponent_combatant_snapshot_for_resolver:
        | {
            Args: {
              p_difficulty_multiplier?: number
              p_opponent_definition_id: string
              p_reference_level?: number
              p_side?: Database["public"]["Enums"]["combat_side"]
            }
            Returns: Json
          }
        | {
            Args: {
              p_candidate_scaling_formula_id: string
              p_difficulty_multiplier: number
              p_opponent_definition_id: string
              p_reference_level: number
              p_side: Database["public"]["Enums"]["combat_side"]
            }
            Returns: Json
          }
      build_player_estate_building_groups_json: {
        Args: { p_buildings_json: Json; p_default_district_code: string }
        Returns: Json
      }
      build_player_item_display_core_json: {
        Args: { p_item_json: Json }
        Returns: Json
      }
      build_player_item_popover_detail_json: {
        Args: { p_hero_id: string; p_item_id: string }
        Returns: Json
      }
      build_polish_prefix_display_forms: {
        Args: { p_prefix_name: string }
        Returns: Json
      }
      build_pvp_hero_combatant_snapshot_for_resolver: {
        Args: {
          p_hero_id: string
          p_side: Database["public"]["Enums"]["combat_side"]
        }
        Returns: Json
      }
      build_pvp_prestige_context: {
        Args: { p_pvp_attack_result_id: string }
        Returns: Json
      }
      build_pvp_spy_base_stats_snapshot: {
        Args: { p_hero_id: string }
        Returns: Json
      }
      build_pvp_spy_buildings_snapshot: {
        Args: { p_estate_id: string }
        Returns: Json
      }
      build_pvp_spy_derived_combat_stats_placeholder: {
        Args: { p_hero_id: string }
        Returns: Json
      }
      build_pvp_spy_equipment_snapshot: {
        Args: { p_hero_id: string }
        Returns: Json
      }
      build_pvp_spy_estate_snapshot: {
        Args: { p_estate_id: string }
        Returns: Json
      }
      build_pvp_spy_raw_base_stats_snapshot: {
        Args: { p_hero_id: string }
        Returns: Json
      }
      build_pvp_spy_resource_snapshot: {
        Args: { p_hero_id: string }
        Returns: Json
      }
      build_report_item_display_name: {
        Args: {
          p_base_id: string
          p_prefix_affix_id?: string
          p_quality_key: string
          p_source_item_id?: string
          p_suffix_affix_id?: string
        }
        Returns: string
      }
      build_trade_item_row: { Args: { p_item_id: string }; Returns: Json }
      build_trade_offer_row: {
        Args: { p_hero_id: string; p_offer_id: string }
        Returns: Json
      }
      build_trade_offer_side: {
        Args: {
          p_offer_id: string
          p_side: Database["public"]["Enums"]["player_trade_side"]
        }
        Returns: Json
      }
      build_trade_route_access_blocker_json: {
        Args: { p_surface: string }
        Returns: Json
      }
      bulk_equip_hero_items: {
        Args: { p_hero_id: string; p_items_json: Json; p_request_id?: string }
        Returns: {
          equipped_count: number
          failed_count: number
          final_equipment_json: Json
          hero_id: string
          request_id: string
          result_journal_json: Json
          skipped_count: number
          success: boolean
        }[]
      }
      bulk_move_hero_armory_items_to_shelf: {
        Args: {
          p_hero_id: string
          p_items_json: Json
          p_request_id?: string
          p_target_shelf_position: number
        }
        Returns: {
          armory_state_json: Json
          failed_count: number
          hero_id: string
          moved_count: number
          request_id: string
          result_journal_json: Json
          selected_count: number
          server_id: string
          skipped_count: number
          success: boolean
          target_shelf_name: string
          target_shelf_position: number
          visible_items_json: Json
        }[]
      }
      bulk_unequip_hero_items: {
        Args: { p_hero_id: string; p_items_json: Json; p_request_id?: string }
        Returns: {
          armory_state_json: Json
          failed_count: number
          final_equipment_json: Json
          hero_id: string
          request_id: string
          result_journal_json: Json
          server_id: string
          skipped_count: number
          success: boolean
          unequipped_count: number
          visible_items_json: Json
        }[]
      }
      bulk_vendor_scrap_hero_items: {
        Args: {
          p_actor_hero_id: string
          p_reason?: string
          p_request_id?: string
          p_selection_json: Json
        }
        Returns: {
          armory_state_json: Json
          balance_after: number
          failed_count: number
          final_equipment_json: Json
          hero_id: string
          request_id: string
          result_journal_json: Json
          selected_count: number
          server_id: string
          skipped_count: number
          sold_count: number
          success: boolean
          total_drachma_amount: number
          visible_items_json: Json
        }[]
      }
      buy_now_player_auction: {
        Args: {
          p_auction_listing_id: string
          p_buyer_hero_id: string
          p_description?: string
        }
        Returns: string
      }
      calculate_hero_max_health: {
        Args: { p_hero_id: string }
        Returns: number
      }
      calculate_luck_influence: {
        Args: { p_luck_value: number }
        Returns: number
      }
      calculate_prestige_rank_from_points: {
        Args: { p_points: number }
        Returns: {
          district_code: string
          next_prestige_points_required: number
          next_rank_name: string
          next_rank_number: number
          prestige_points_required: number
          rank_name: string
          rank_number: number
          rank_uuid: string
        }[]
      }
      calculate_pvp_estate_distance_score: {
        Args: {
          p_source_address_number: number
          p_source_district_code: string
          p_target_address_number: number
          p_target_district_code: string
        }
        Returns: number
      }
      calculate_pvp_prestige_delta: {
        Args: {
          p_actor_role: string
          p_attacker_level: number
          p_combat_outcome: Database["public"]["Enums"]["combat_outcome"]
          p_defender_level: number
          p_max_target_level: number
          p_min_target_level: number
        }
        Returns: {
          actor_role: string
          admin_context_json: Json
          band_key: string
          band_label: string
          combat_outcome: Database["public"]["Enums"]["combat_outcome"]
          message_direction: string
          message_kind: string
          player_message: string
          player_summary_json: Json
          points_delta: number
          target_position_percent: number
          target_position_percent_clamped: number
        }[]
      }
      calculate_pvp_prestige_target_band: {
        Args: {
          p_attacker_level: number
          p_defender_level: number
          p_max_target_level: number
          p_min_target_level: number
        }
        Returns: {
          attacker_level: number
          band_key: string
          band_label: string
          defender_level: number
          explanation: string
          is_out_of_range: boolean
          max_target_level: number
          min_target_level: number
          target_position_percent: number
          target_position_percent_clamped: number
        }[]
      }
      calculate_trial_power: {
        Args: { p_luck_value: number; p_tested_stat_value: number }
        Returns: {
          luck_influence: number
          luck_value: number
          tested_stat_value: number
          trial_power: number
        }[]
      }
      can_apply_local_moderation_action: {
        Args: { p_scope_key: string; p_server_id: string }
        Returns: boolean
      }
      can_decide_anti_abuse: { Args: { p_server_id: string }; Returns: boolean }
      can_have_moderator_scope: {
        Args: { p_scope_key: string; p_server_id: string }
        Returns: boolean
      }
      can_hero_runtime_use_item: {
        Args: { p_hero_id: string; p_item_id: string }
        Returns: boolean
      }
      can_investigate_auction: {
        Args: { p_server_id: string }
        Returns: boolean
      }
      can_investigate_trade: { Args: { p_server_id: string }; Returns: boolean }
      can_manage_anti_abuse: { Args: { p_server_id: string }; Returns: boolean }
      can_manage_anti_abuse_sanctions: {
        Args: { p_server_id: string }
        Returns: boolean
      }
      can_manage_config_governance: {
        Args: { p_server_id?: string }
        Returns: boolean
      }
      can_manage_hero: { Args: { target_hero_id: string }; Returns: boolean }
      can_manage_server_staff: {
        Args: { p_server_id: string }
        Returns: boolean
      }
      can_read_combat_live_session: {
        Args: { p_session_id: string }
        Returns: boolean
      }
      can_read_combat_result: {
        Args: { p_combat_result_id: string }
        Returns: boolean
      }
      can_read_full_moderation_history: {
        Args: { p_server_id: string }
        Returns: boolean
      }
      can_read_hero: { Args: { target_hero_id: string }; Returns: boolean }
      can_read_moderation_action: {
        Args: {
          p_action: Database["public"]["Tables"]["moderation_actions"]["Row"]
        }
        Returns: boolean
      }
      can_search_admin_balance_references: { Args: never; Returns: boolean }
      can_search_moderation_targets: {
        Args: { p_server_id: string }
        Returns: boolean
      }
      can_submit_combat_live_player_action: {
        Args: { p_session_id: string }
        Returns: boolean
      }
      can_triage_anti_abuse: { Args: { p_server_id: string }; Returns: boolean }
      cancel_active_estate_building_jobs_for_relocation: {
        Args: { p_effective_at?: string; p_estate_id: string }
        Returns: number
      }
      cancel_config_change_set: {
        Args: { p_cancelled_reason: string; p_change_set_id: string }
        Returns: {
          applied_at: string | null
          applied_by: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          cancelled_reason: string | null
          changelog_body: string | null
          changelog_title: string | null
          changelog_visibility: Database["public"]["Enums"]["config_change_visibility"]
          created_at: string
          draft_kind: string | null
          id: string
          ready_at: string | null
          ready_by: string | null
          reason: string
          requested_by: string | null
          status: Database["public"]["Enums"]["config_change_status"]
          title: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "config_change_sets"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      cancel_guild_invite: {
        Args: {
          p_actor_hero_id: string
          p_invite_id: string
          p_reason?: string
          p_request_id?: string
        }
        Returns: {
          audit_log_id: string
          guild_id: string
          invite_id: string
          status_key: string
          target_hero_id: string
        }[]
      }
      cancel_guild_join_request: {
        Args: {
          p_join_request_id: string
          p_reason?: string
          p_request_id?: string
          p_requester_hero_id: string
        }
        Returns: {
          audit_log_id: string
          guild_id: string
          join_request_id: string
          requester_hero_id: string
          status_key: string
        }[]
      }
      cancel_player_auction_listing: {
        Args: { p_auction_listing_id: string; p_status_reason?: string }
        Returns: string
      }
      cancel_player_direct_trade_offer: {
        Args: { p_offer_id: string; p_status_reason?: string }
        Returns: string
      }
      cancel_server_event_run: {
        Args: { p_reason?: string; p_run_id: string }
        Returns: {
          actual_ended_at: string | null
          created_at: string
          created_by: string | null
          definition_id: string
          ends_at: string
          id: string
          metadata_json: Json
          request_id: string | null
          server_id: string
          source_kind: string
          starts_at: string
          status: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "server_event_runs"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      check_hero_meets_item_requirements: {
        Args: { p_hero_id: string; p_item_id: string }
        Returns: {
          failures_json: Json
          meets_requirements: boolean
        }[]
      }
      check_hero_meets_prestige_requirement: {
        Args: { p_hero_id: string; p_required_rank_number: number }
        Returns: {
          current_district_code: string
          current_rank_name: string
          current_rank_number: number
          hero_id: string
          meets_requirement: boolean
          reason: string
          required_district_code: string
          required_rank_name: string
          required_rank_number: number
          server_id: string
        }[]
      }
      clear_hero_loadout_preset: {
        Args: {
          p_hero_id: string
          p_preset_number: number
          p_request_id?: string
        }
        Returns: {
          cleared_slot_count: number
          hero_id: string
          name: string
          preset_id: string
          preset_number: number
          request_id: string
        }[]
      }
      close_player_auction_listing: {
        Args: { p_auction_listing_id: string; p_description?: string }
        Returns: string
      }
      combat_attack_source_label_pl: {
        Args: { p_attack_source_kind: string; p_attack_source_label?: string }
        Returns: string
      }
      combat_display_text_with_legal_life_drain: {
        Args: {
          p_attack_source_kind: string
          p_display_text: string
          p_metadata_json: Json
        }
        Returns: string
      }
      combat_event_player_display_json: {
        Args: {
          p_actor_display_name?: string
          p_critical?: boolean
          p_display_text?: string
          p_evaded?: boolean
          p_event_kind?: string
          p_final_damage?: number
          p_round_number?: number
          p_target_display_name?: string
          p_timing_hit?: boolean
        }
        Returns: Json
      }
      combat_life_drain_heal_amount_from_metadata: {
        Args: { p_attack_source_kind: string; p_metadata_json: Json }
        Returns: number
      }
      combat_live_attack_source_kind_from_text: {
        Args: {
          p_default?: Database["public"]["Enums"]["combat_attack_source_kind"]
          p_raw: string
        }
        Returns: Database["public"]["Enums"]["combat_attack_source_kind"]
      }
      combat_live_formula_value: {
        Args: {
          p_fallback?: number
          p_target_key: string
          p_variables_json: Json
        }
        Returns: number
      }
      combat_live_snapshot_number: {
        Args: { p_default?: number; p_key: string; p_snapshot: Json }
        Returns: number
      }
      combat_live_snapshot_text: {
        Args: { p_default?: string; p_key: string; p_snapshot: Json }
        Returns: string
      }
      combat_live_timing_input_percent: {
        Args: { p_timing_input_json: Json }
        Returns: number
      }
      complete_due_pvp_return_runtime_activities: {
        Args: { p_as_of?: string; p_hero_id: string }
        Returns: {
          activity_id: string
          activity_kind: string
          completed_at: string
          pvp_action_id: string
        }[]
      }
      complete_due_pvp_return_runtime_activities_batch: {
        Args: { p_as_of?: string; p_limit?: number; p_request_id?: string }
        Returns: {
          activity_id: string
          activity_kind: string
          completed: boolean
          completed_at: string
          error_message: string
          error_sqlstate: string
          hero_id: string
          pvp_action_id: string
        }[]
      }
      complete_hero_exploration_challenge_attempt: {
        Args: {
          p_challenge_attempt_id: string
          p_completion_mode: string
          p_details_json?: Json
          p_performance_rating?: string
          p_request_id?: string
          p_score?: number
          p_success: boolean
        }
        Returns: {
          challenge_attempt_id: string
          completion_mode: string
          exploration_status: string
          remaining_trials: number
          reward_grant_id: string
          status: string
          success: boolean
        }[]
      }
      compose_generated_item_name: {
        Args: {
          p_base_id: string
          p_prefix_affix_id: string
          p_quality_key: string
          p_suffix_affix_id: string
        }
        Returns: string
      }
      compose_item_generation_display_name: {
        Args: {
          p_base_id: string
          p_locale_key?: string
          p_prefix_name: string
          p_quality_key: string
          p_suffix_name?: string
        }
        Returns: string
      }
      compose_item_generation_display_name_by_ids: {
        Args: {
          p_base_id: string
          p_locale_key?: string
          p_prefix_affix_id: string
          p_quality_key: string
          p_suffix_affix_id?: string
        }
        Returns: string
      }
      compose_item_generation_display_name_from_ids: {
        Args: {
          p_base_id: string
          p_locale_key?: string
          p_prefix_affix_id: string
          p_quality_key: string
          p_suffix_affix_id?: string
        }
        Returns: string
      }
      compose_item_generation_display_name_from_item_id: {
        Args: { p_item_id: string; p_locale_key?: string }
        Returns: string
      }
      compute_reward_item_budget: {
        Args: { p_bucket_profile_id?: string }
        Returns: number
      }
      compute_reward_item_budget_luck_preview: {
        Args: {
          p_bucket_profile_id?: string
          p_luck_value?: number
          p_metadata_json?: Json
        }
        Returns: {
          bucket_count: number
          bucket_index: number
          bucket_profile_id: string
          bucket_profile_key: string
          bucket_profile_name: string
          formula_expression: string
          formula_key: string
          luck_influence: number
          luck_value: number
          range_roll: number
          rolled_budget: number
        }[]
      }
      config_json_values_match: {
        Args: { p_actual: Json; p_expected: Json }
        Returns: boolean
      }
      confirm_player_direct_trade_offer: {
        Args: { p_description?: string; p_offer_id: string }
        Returns: string
      }
      consume_active_exploration_effect: {
        Args: {
          p_consumed_by_id: string
          p_consumed_by_kind: string
          p_exploration_id: string
        }
        Returns: number
      }
      consume_next_hero_exploration_outcome_override: {
        Args: { p_exploration_id: string; p_step_id: string }
        Returns: {
          encounter_definition_id: string
          force_manifestation_status: string
          forced_outcome_kind: string
          override_id: string
          trial_definition_id: string
        }[]
      }
      consume_next_hero_pending_combat_effect: {
        Args: {
          p_consumed_by_id: string
          p_consumed_by_kind: string
          p_hero_id: string
          p_metadata_json?: Json
        }
        Returns: {
          consumed_by_id: string
          consumed_by_kind: string
          consumed_count: number
          effect_definition_id: string
          effect_id: string
          effect_key: string
          effect_label: string
          exploration_id: string
        }[]
      }
      count_due_estate_building_jobs: {
        Args: { p_as_of?: string }
        Returns: number
      }
      count_due_pvp_actions_for_settlement: {
        Args: { p_as_of?: string }
        Returns: number
      }
      count_due_pvp_return_runtime_locks: {
        Args: { p_as_of?: string }
        Returns: number
      }
      create_anti_abuse_sanction: {
        Args: {
          p_amount_character_points?: number
          p_case_id: string
          p_destination_hero_id?: string
          p_duration_days?: number
          p_operator_notes?: string
          p_reason: string
          p_sanction_type_key: string
          p_source_hero_id?: string
          p_target_hero_id: string
          p_target_user_id: string
        }
        Returns: {
          amount_character_points: number | null
          applied_at: string | null
          cancelled_at: string | null
          case_id: string
          completed_at: string | null
          created_at: string
          destination_hero_id: string | null
          duration_days: number | null
          ends_at: string | null
          failed_at: string | null
          forgiven_at: string | null
          id: string
          imposed_by_user_id: string | null
          operator_notes: string | null
          reason: string
          sanction_type_key: string
          source_hero_id: string | null
          starts_at: string | null
          status: Database["public"]["Enums"]["anti_abuse_sanction_status"]
          status_reason: string | null
          target_hero_id: string | null
          target_user_id: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "anti_abuse_sanctions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_character_point_lock_for_auction_bid: {
        Args: {
          p_amount: number
          p_auction_bid_id: string
          p_auction_listing_id: string
          p_description?: string
          p_hero_id: string
          p_server_id: string
        }
        Returns: string
      }
      create_character_point_lock_for_auction_buy_now: {
        Args: {
          p_amount: number
          p_auction_listing_id: string
          p_description?: string
          p_hero_id: string
          p_server_id: string
        }
        Returns: string
      }
      create_character_point_lock_for_trade: {
        Args: {
          p_amount: number
          p_description?: string
          p_hero_id: string
          p_server_id: string
          p_trade_offer_id: string
        }
        Returns: string
      }
      create_character_point_penalty_for_sanction: {
        Args: {
          p_operator_notes?: string
          p_reason?: string
          p_sanction_id: string
        }
        Returns: {
          applied_at: string | null
          cancelled_at: string | null
          case_id: string
          completed_at: string | null
          created_at: string
          created_by_user_id: string | null
          failed_at: string | null
          forgiven_at: string | null
          hero_id: string
          id: string
          operator_notes: string | null
          paid_amount: number
          reason: string
          remaining_amount: number
          sanction_id: string
          server_id: string
          status: Database["public"]["Enums"]["anti_abuse_sanction_status"]
          status_reason: string | null
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "character_point_penalties"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_config_change_set_draft: {
        Args: {
          p_changelog_body?: string
          p_changelog_title?: string
          p_changelog_visibility?: Database["public"]["Enums"]["config_change_visibility"]
          p_reason: string
          p_title: string
        }
        Returns: {
          applied_at: string | null
          applied_by: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          cancelled_reason: string | null
          changelog_body: string | null
          changelog_title: string | null
          changelog_visibility: Database["public"]["Enums"]["config_change_visibility"]
          created_at: string
          draft_kind: string | null
          id: string
          ready_at: string | null
          ready_by: string | null
          reason: string
          requested_by: string | null
          status: Database["public"]["Enums"]["config_change_status"]
          title: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "config_change_sets"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_config_value_change_entry: {
        Args: {
          p_change_kind: Database["public"]["Enums"]["config_change_kind"]
          p_change_set_id: string
          p_config_definition_id: string
          p_metadata_json?: Json
          p_new_value_json: Json
          p_server_id?: string
        }
        Returns: {
          change_kind: Database["public"]["Enums"]["config_change_kind"]
          change_set_id: string
          config_definition_id: string | null
          created_at: string
          entity_id: string | null
          entity_type:
            | Database["public"]["Enums"]["config_managed_entity_type"]
            | null
          field_path: string | null
          id: string
          metadata_json: Json
          new_scope:
            | Database["public"]["Enums"]["config_governance_scope"]
            | null
          new_value_json: Json | null
          old_scope:
            | Database["public"]["Enums"]["config_governance_scope"]
            | null
          old_value_json: Json | null
          replaced_at: string | null
          replaced_by_entry_id: string | null
          server_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "config_change_entries"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_default_exploration_edges: {
        Args: { p_exploration_id: string; p_node_id: string }
        Returns: number
      }
      create_entity_requirement: {
        Args: {
          p_applies_from_level?: number
          p_description?: string
          p_entity_id: string
          p_entity_type: Database["public"]["Enums"]["requirement_entity_type"]
          p_reason?: string
          p_required_building_key?: string
          p_required_district_code?: string
          p_required_resource_type?: string
          p_required_stat_key?: string
          p_required_value_boolean?: boolean
          p_required_value_decimal?: number
          p_required_value_integer?: number
          p_required_value_text?: string
          p_requirement_definition_key: string
          p_requirement_scope_key?: string
          p_sort_order?: number
        }
        Returns: {
          applies_from_level: number
          context: string
          created_at: string
          description: string | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["requirement_entity_type"]
          id: string
          is_active: boolean
          params_json: Json
          required_building_key: string | null
          required_district_code: string | null
          required_resource_type: string | null
          required_stat_key: string | null
          required_value_boolean: boolean | null
          required_value_decimal: number | null
          required_value_integer: number | null
          required_value_text: string | null
          requirement_definition_key: string
          sort_order: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "entity_requirements"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_game_report_from_combat_result: {
        Args: {
          p_combat_result_id: string
          p_owner_hero_id?: string
          p_reason?: string
          p_request_id?: string
        }
        Returns: {
          access_rows_created: number
          audit_log_id: string
          combat_result_id: string
          participants_created: number
          public_token: string
          report_id: string
          report_type_key: string
          server_id: string
        }[]
      }
      create_guild: {
        Args: {
          p_description?: string
          p_leader_hero_id: string
          p_name: string
          p_reason?: string
          p_request_id?: string
          p_tag: string
        }
        Returns: {
          audit_log_id: string
          creation_drachma_cost: number
          drachma_balance_after: number
          guild_id: string
          leader_hero_id: string
          membership_id: string
          name: string
          server_id: string
          status_key: string
          tag: string
        }[]
      }
      create_guild_invite: {
        Args: {
          p_actor_hero_id: string
          p_expires_at?: string
          p_reason?: string
          p_request_id?: string
          p_target_hero_id: string
        }
        Returns: {
          audit_log_id: string
          expires_at: string
          guild_id: string
          invite_id: string
          status_key: string
          target_hero_id: string
        }[]
      }
      create_guild_join_request: {
        Args: {
          p_expires_at?: string
          p_guild_id: string
          p_reason?: string
          p_request_id?: string
          p_requester_hero_id: string
        }
        Returns: {
          audit_log_id: string
          expires_at: string
          guild_id: string
          join_request_id: string
          requester_hero_id: string
          status_key: string
        }[]
      }
      create_hero_start_flow: {
        Args: {
          p_hero_name: string
          p_origin_id: string
          p_request_id?: string
          p_server_id: string
        }
        Returns: {
          address: string
          address_number: number
          audit_log_id: string
          character_point_ledger_id: string
          character_points_balance: number
          created_new_hero: boolean
          district_code: string
          estate_id: string
          hero_id: string
          hero_name: string
          hero_stats_json: Json
          origin_id: string
          origin_key: string
          origin_label: string
          prestige_rank_name: string
          prestige_rank_number: number
          resources_json: Json
          route_next_action: string
          server_id: string
        }[]
      }
      create_manual_trial_game_report: {
        Args: { p_request_id?: string; p_verdict_id: string }
        Returns: {
          access_rows_touched: number
          attempt_id: string
          created_new_report: boolean
          hero_id: string
          manual_session_id: string
          participants_created: number
          public_token: string
          report_id: string
          report_type_key: string
          reward_grant_id: string
          server_id: string
          source_entity_id: string
          source_entity_type: Database["public"]["Enums"]["game_report_source_entity_type"]
          summary: string
          title: string
          verdict_id: string
        }[]
      }
      create_moderation_action: {
        Args: {
          p_action_type_key: string
          p_expires_at?: string
          p_metadata_json?: Json
          p_operator_notes?: string
          p_player_visible_note?: string
          p_reason: string
          p_scope_key?: string
          p_server_id: string
          p_source_entity_id?: string
          p_source_entity_type?: string
          p_source_snapshot_id?: string
          p_target_hero_id?: string
          p_target_user_id: string
        }
        Returns: {
          action_type_key: string
          created_at: string
          created_by_user_id: string | null
          expires_at: string | null
          id: string
          is_staff_disqualifying: boolean
          metadata_json: Json
          operator_notes: string | null
          player_visible_note: string | null
          reason: string
          resolved_at: string | null
          resolved_by_user_id: string | null
          scope_key: string | null
          server_id: string
          source_entity_id: string | null
          source_entity_type: string | null
          source_snapshot_id: string | null
          starts_at: string
          status: Database["public"]["Enums"]["moderation_action_status"]
          status_reason: string | null
          target_hero_id: string | null
          target_user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "moderation_actions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_notification: {
        Args: {
          p_action_label?: string
          p_action_url?: string
          p_actor_hero_id?: string
          p_actor_user_id?: string
          p_body?: string
          p_notification_type_key: string
          p_recipient_hero_id: string
          p_recipient_kind: Database["public"]["Enums"]["notification_recipient_kind"]
          p_recipient_user_id: string
          p_server_id: string
          p_severity?: Database["public"]["Enums"]["notification_severity"]
          p_source_entity_id?: string
          p_source_entity_type?: string
          p_title: string
        }
        Returns: string
      }
      create_or_link_anti_abuse_case_for_signal: {
        Args: { p_signal_id: string }
        Returns: string
      }
      create_player_abuse_report: {
        Args: {
          p_accused_hero_id?: string
          p_description: string
          p_related_item_id?: string
          p_related_trade_id?: string
          p_related_trade_reference?: string
          p_report_type_key: string
          p_reporting_hero_id?: string
          p_server_id: string
          p_title: string
        }
        Returns: {
          case_id: string
          report_id: string
        }[]
      }
      create_player_auction_listing: {
        Args: {
          p_auction_mode: Database["public"]["Enums"]["player_auction_mode"]
          p_buy_now_character_points?: number
          p_description?: string
          p_item_id: string
          p_seller_hero_id: string
          p_starting_bid_character_points?: number
        }
        Returns: string
      }
      create_player_direct_trade_offer: {
        Args: {
          p_creator_character_points?: number
          p_creator_hero_id: string
          p_creator_item_ids?: string[]
          p_description?: string
          p_target_hero_id: string
        }
        Returns: string
      }
      create_player_relationship_declaration: {
        Args: {
          p_amount_character_points?: number
          p_created_by_hero_id?: string
          p_declaration_type_key: string
          p_description: string
          p_expires_at?: string
          p_items_json?: Json
          p_participants_json?: Json
          p_request_id?: string
          p_server_id: string
          p_starts_at?: string
          p_title: string
          p_trades_json?: Json
        }
        Returns: {
          declaration_id: string
        }[]
      }
      create_prestige_rank_change_notification: {
        Args: { p_ledger_id: string }
        Returns: string
      }
      create_pvp_attack_game_report: {
        Args: { p_pvp_attack_result_id: string; p_request_id?: string }
        Returns: {
          access_rows_upserted: number
          audit_log_id: string
          combat_result_id: string
          participants_created: number
          public_token: string
          pvp_attack_result_id: string
          report_id: string
          report_type_key: string
          server_id: string
        }[]
      }
      create_pvp_attack_result_from_combat_result: {
        Args: { p_combat_result_id: string; p_request_id?: string }
        Returns: {
          attacker_estate_id: string | null
          attacker_hero_id: string
          attacker_level_snapshot: number
          combat_outcome: Database["public"]["Enums"]["combat_outcome"]
          combat_result_id: string
          created_at: string
          defender_estate_id: string | null
          defender_hero_id: string
          defender_level_snapshot: number
          id: string
          level_difference: number
          loser_hero_id: string | null
          metadata_json: Json
          notification_context_json: Json
          outcome_key: string
          prestige_context_json: Json
          pvp_action_id: string
          report_context_json: Json
          resource_outcome_json: Json
          reward_context_json: Json
          server_id: string
          winner_hero_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "pvp_attack_results"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_pvp_spy_game_report: {
        Args: { p_pvp_spy_result_id: string; p_request_id?: string }
        Returns: {
          access_rows_touched: number
          created_new_report: boolean
          game_report_id: string
          participants_created: number
          pvp_spy_result_id: string
        }[]
      }
      create_pvp_spy_result_from_action: {
        Args: {
          p_derived_combat_stats_json?: Json
          p_pvp_action_id: string
          p_request_id?: string
        }
        Returns: {
          base_stats_raw_snapshot_json: Json
          base_stats_snapshot_json: Json
          buildings_snapshot_json: Json
          created_at: string
          derived_combat_stats_json: Json
          detected: boolean
          detection_chance: number
          detection_roll: number
          equipment_snapshot_json: Json
          estate_snapshot_json: Json
          id: string
          metadata_json: Json
          outcome_key: string
          pvp_action_id: string
          resolution_policy_json: Json
          resources_snapshot_json: Json
          result_summary: string | null
          server_id: string
          spy_cunning_snapshot: number
          spy_estate_id: string | null
          spy_hero_id: string
          spy_level_snapshot: number
          success: boolean
          success_chance: number
          success_roll: number
          target_address_number_snapshot: number | null
          target_address_snapshot: string | null
          target_display_name_snapshot: string
          target_district_code_snapshot: string | null
          target_estate_id: string | null
          target_hero_id: string
          target_intelligence_snapshot: number
          target_level_snapshot: number
          visibility_key: string
        }
        SetofOptions: {
          from: "*"
          to: "pvp_spy_results"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      deactivate_combat_opponent_attack_source: {
        Args: {
          p_attack_source_id: string
          p_reason: string
          p_request_id?: string
        }
        Returns: {
          admin_description: string | null
          attack_count: number
          created_at: string
          critical_chance: number
          critical_damage: number
          description: string | null
          helper_text: string | null
          id: string
          is_active: boolean
          key: string
          label: string
          max_damage: number
          max_opponent_level: number | null
          min_damage: number
          min_opponent_level: number | null
          opponent_definition_id: string
          sort_order: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "combat_opponent_attack_sources"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      deactivate_combat_opponent_definition: {
        Args: {
          p_opponent_definition_id: string
          p_reason: string
          p_request_id?: string
        }
        Returns: {
          admin_description: string | null
          created_at: string
          default_scaling_formula_id: string | null
          description: string | null
          equipment_mode: Database["public"]["Enums"]["combat_opponent_equipment_mode"]
          family_key: string
          helper_text: string | null
          id: string
          is_active: boolean
          key: string
          label: string
          sort_order: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "combat_opponent_definitions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      deactivate_combat_opponent_equipment_entry: {
        Args: {
          p_equipment_entry_id: string
          p_reason: string
          p_request_id?: string
        }
        Returns: {
          created_at: string
          entry_mode: Database["public"]["Enums"]["combat_opponent_equipment_mode"]
          generated_bucket_profile_id: string | null
          generated_max_quality_key: string | null
          id: string
          is_active: boolean
          manual_base_id: string | null
          manual_prefix_affix_id: string | null
          manual_quality_key: string | null
          manual_suffix_affix_id: string | null
          max_opponent_level: number | null
          min_opponent_level: number | null
          opponent_definition_id: string
          slot_key: string
          sort_order: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "combat_opponent_equipment_entries"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      deactivate_combat_opponent_family: {
        Args: { p_family_key: string; p_reason: string; p_request_id?: string }
        Returns: {
          admin_description: string | null
          created_at: string
          description: string | null
          helper_text: string | null
          is_active: boolean
          key: string
          label: string
          sort_order: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "combat_opponent_families"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      deactivate_encounter_combat_candidate: {
        Args: {
          p_candidate_id: string
          p_reason: string
          p_request_id?: string
        }
        Returns: {
          candidate_kind: Database["public"]["Enums"]["combat_candidate_kind"]
          created_at: string
          difficulty_multiplier: number
          encounter_definition_id: string
          family_key: string | null
          id: string
          is_active: boolean
          max_hero_level: number | null
          min_hero_level: number | null
          opponent_definition_id: string | null
          scaling_formula_id: string | null
          sort_order: number
          updated_at: string
          weight: number
        }
        SetofOptions: {
          from: "*"
          to: "encounter_combat_candidates"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      deactivate_encounter_definition: {
        Args: {
          p_encounter_definition_id: string
          p_reason: string
          p_request_id?: string
        }
        Returns: {
          admin_description: string | null
          created_at: string
          description: string
          encounter_kind: string
          helper_text: string | null
          id: string
          is_active: boolean
          key: string
          label: string
          max_difficulty_key: string | null
          max_district_code: string | null
          metadata_json: Json
          min_difficulty_key: string | null
          min_district_code: string | null
          minigame_key: string | null
          reward_profile_id: string | null
          sort_order: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "encounter_definitions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      deactivate_encounter_description_variant: {
        Args: { p_reason: string; p_request_id?: string; p_variant_id: string }
        Returns: {
          created_at: string
          description: string
          encounter_definition_id: string
          helper_text: string | null
          id: string
          is_active: boolean
          label: string | null
          metadata_json: Json
          sort_order: number
        }
        SetofOptions: {
          from: "*"
          to: "encounter_description_variants"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      deactivate_encounter_effect_payload: {
        Args: { p_payload_id: string; p_reason: string; p_request_id?: string }
        Returns: {
          admin_description: string | null
          chance_percent: number
          created_at: string
          description: string | null
          effect_definition_id: string
          encounter_definition_id: string
          helper_text: string | null
          id: string
          is_active: boolean
          metadata_json: Json
          sort_order: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "encounter_effect_payloads"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      deactivate_encounter_resource_payload: {
        Args: { p_payload_id: string; p_reason: string; p_request_id?: string }
        Returns: {
          admin_description: string | null
          amount_mode: string
          chance_percent: number
          created_at: string
          description: string | null
          encounter_definition_id: string
          formula_id: string | null
          helper_text: string | null
          id: string
          is_active: boolean
          max_amount: number | null
          metadata_json: Json
          min_amount: number | null
          resource_type: string
          sort_order: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "encounter_resource_payloads"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      deactivate_entity_requirement: {
        Args: { p_reason: string; p_requirement_id: string }
        Returns: {
          applies_from_level: number
          context: string
          created_at: string
          description: string | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["requirement_entity_type"]
          id: string
          is_active: boolean
          params_json: Json
          required_building_key: string | null
          required_district_code: string | null
          required_resource_type: string | null
          required_stat_key: string | null
          required_value_boolean: boolean | null
          required_value_decimal: number | null
          required_value_integer: number | null
          required_value_text: string | null
          requirement_definition_key: string
          sort_order: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "entity_requirements"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      deactivate_exploration_effect_definition: {
        Args: {
          p_effect_definition_id: string
          p_reason: string
          p_request_id?: string
        }
        Returns: {
          admin_description: string | null
          bonus_template_id: string | null
          created_at: string
          default_duration_steps: number | null
          default_value: number | null
          description: string
          effect_kind: string
          helper_text: string | null
          id: string
          is_active: boolean
          key: string
          label: string
          metadata_json: Json
          sort_order: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "exploration_effect_definitions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      deactivate_level_up_stat_bonus_rule: {
        Args: { p_reason: string; p_request_id?: string; p_rule_id: string }
        Returns: {
          admin_description: string | null
          created_at: string
          created_by: string | null
          description: string
          fixed_amount: number | null
          fixed_stat_key: string | null
          helper_text: string | null
          id: string
          is_active: boolean
          key: string
          label: string
          level_interval: number | null
          level_match_kind: string
          level_value: number | null
          max_level_value: number | null
          max_total_amount: number | null
          metadata_json: Json
          min_total_amount: number | null
          rule_kind: string
          sort_order: number
          updated_at: string
          updated_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "level_up_stat_bonus_rules"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      deactivate_level_up_stat_bonus_rule_stat: {
        Args: {
          p_reason: string
          p_request_id?: string
          p_rule_stat_id: string
        }
        Returns: {
          admin_description: string | null
          created_at: string
          created_by: string | null
          helper_text: string | null
          id: string
          is_active: boolean
          max_points_per_level: number | null
          metadata_json: Json
          rule_id: string
          sort_order: number
          stat_key: string
          updated_at: string
          updated_by: string | null
          weight: number
        }
        SetofOptions: {
          from: "*"
          to: "level_up_stat_bonus_rule_stats"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      deactivate_resource_type: {
        Args: { p_key: string; p_reason: string; p_request_id?: string }
        Returns: {
          admin_description: string | null
          created_at: string
          description: string
          helper_text: string | null
          is_active: boolean
          key: string
          label: string
          metadata_json: Json
          sort_order: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "resource_types"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      deactivate_reward_outcome_kind: {
        Args: {
          p_key: string
          p_reason: string
          p_request_id?: string
          p_source_kind: string
        }
        Returns: {
          admin_description: string | null
          created_at: string
          description: string
          helper_text: string | null
          is_active: boolean
          key: string
          label: string
          metadata_json: Json
          sort_order: number
          source_kind: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "reward_outcome_kinds"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      deactivate_reward_profile: {
        Args: {
          p_reason: string
          p_request_id?: string
          p_reward_profile_id: string
        }
        Returns: {
          admin_description: string | null
          category: string
          created_at: string
          description: string
          helper_text: string | null
          id: string
          is_active: boolean
          key: string
          label: string
          metadata_json: Json
          sort_order: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "reward_profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      deactivate_reward_profile_assignment: {
        Args: {
          p_assignment_id: string
          p_reason: string
          p_request_id?: string
        }
        Returns: {
          created_at: string
          description: string | null
          difficulty_key: string | null
          difficulty_match_kind: string
          district_code: string | null
          district_match_kind: string
          encounter_definition_id: string | null
          helper_text: string | null
          id: string
          is_active: boolean
          level_interval: number | null
          level_match_kind: string
          level_value: number | null
          max_difficulty_key: string | null
          max_district_code: string | null
          max_level_value: number | null
          metadata_json: Json
          outcome_kind: string
          reward_profile_id: string
          sort_order: number
          source_kind: string
          trial_definition_id: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "reward_profile_assignments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      deactivate_reward_profile_entry: {
        Args: { p_entry_id: string; p_reason: string; p_request_id?: string }
        Returns: {
          admin_description: string | null
          amount_mode: string
          bucket_profile_id: string | null
          chance_percent: number
          created_at: string
          description: string
          effect_definition_id: string | null
          entry_kind: string
          formula_id: string | null
          helper_text: string | null
          id: string
          is_active: boolean
          label: string
          max_amount: number | null
          max_item_count: number | null
          max_quality_key: string | null
          metadata_json: Json
          min_amount: number | null
          min_item_count: number | null
          resource_type: string | null
          reward_profile_id: string
          sort_order: number
          transfer_recipient_role: string | null
          transfer_source_role: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "reward_profile_entries"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      deactivate_trial_combat_candidate: {
        Args: {
          p_candidate_id: string
          p_reason: string
          p_request_id?: string
        }
        Returns: {
          candidate_kind: Database["public"]["Enums"]["combat_candidate_kind"]
          created_at: string
          difficulty_multiplier: number
          family_key: string | null
          id: string
          is_active: boolean
          max_hero_level: number | null
          min_hero_level: number | null
          opponent_definition_id: string | null
          scaling_formula_id: string | null
          sort_order: number
          trial_definition_id: string
          updated_at: string
          weight: number
        }
        SetofOptions: {
          from: "*"
          to: "trial_combat_candidates"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      deactivate_trial_definition: {
        Args: {
          p_reason: string
          p_request_id?: string
          p_trial_definition_id: string
        }
        Returns: {
          admin_description: string | null
          created_at: string
          description: string
          helper_text: string | null
          id: string
          is_active: boolean
          key: string
          label: string
          metadata_json: Json
          minigame_key: string
          sort_order: number
          tested_stat_key: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "trial_definitions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      delete_combat_opponent_stat_value: {
        Args: {
          p_reason: string
          p_request_id?: string
          p_stat_value_id: string
        }
        Returns: {
          base_value: number
          created_at: string
          id: string
          opponent_definition_id: string
          sort_order: number
          stat_key: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "combat_opponent_stat_values"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      delete_game_report_for_hero: {
        Args: {
          p_hero_id: string
          p_reason?: string
          p_report_id: string
          p_request_id?: string
        }
        Returns: {
          audit_log_id: string
          deleted_report: boolean
          hero_id: string
          public_token: string
          remaining_access_count: number
          removed_access: boolean
          report_id: string
        }[]
      }
      demote_guild_officer: {
        Args: {
          p_actor_hero_id: string
          p_reason?: string
          p_request_id?: string
          p_target_hero_id: string
        }
        Returns: {
          actor_hero_id: string
          audit_log_id: string
          guild_id: string
          new_role_key: string
          old_role_key: string
          target_hero_id: string
          target_membership_id: string
        }[]
      }
      deposit_guild_armory_item: {
        Args: {
          p_actor_hero_id: string
          p_item_id: string
          p_reason?: string
          p_request_id?: string
        }
        Returns: {
          armory_item_id: string
          audit_log_id: string
          guild_id: string
          item_id: string
          owner_hero_id: string
          status_key: string
        }[]
      }
      disband_guild: {
        Args: {
          p_actor_hero_id: string
          p_reason: string
          p_request_id?: string
        }
        Returns: {
          actor_hero_id: string
          audit_log_id: string
          cancelled_invite_count: number
          cancelled_join_request_count: number
          dissolved_at: string
          ended_membership_count: number
          guild_id: string
          status_key: string
        }[]
      }
      dismiss_notification: {
        Args: { p_notification_id: string }
        Returns: {
          action_label: string | null
          action_url: string | null
          actor_hero_id: string | null
          actor_user_id: string | null
          body: string | null
          created_at: string
          dismissed_at: string | null
          id: string
          notification_type_key: string
          read_at: string | null
          recipient_hero_id: string | null
          recipient_kind: Database["public"]["Enums"]["notification_recipient_kind"]
          recipient_user_id: string
          server_id: string | null
          severity: Database["public"]["Enums"]["notification_severity"]
          source_entity_id: string | null
          source_entity_type: string | null
          title: string
        }
        SetofOptions: {
          from: "*"
          to: "notifications"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      district_code_rank: { Args: { p_district_code: string }; Returns: number }
      end_current_guild_armory_state_for_item: {
        Args: {
          p_actor_hero_id?: string
          p_item_id: string
          p_reason: string
          p_request_id?: string
          p_terminal_status: string
        }
        Returns: {
          armory_item_id: string
          armory_status_key: string
          guild_id: string
          item_id: string
          loan_id: string
          loan_status_key: string
        }[]
      }
      ensure_combat_live_session_for_source: {
        Args: {
          p_request_id?: string
          p_source_entity_id: string
          p_source_entity_type: string
        }
        Returns: {
          awaiting_player_action: boolean
          combat_session_id: string
          current_action_index: number
          current_actor_participant_id: string
          current_round_number: number
          current_timing_manifest_json: Json
          event_count: number
          events_json: Json
          final_combat_result_id: string
          participants_json: Json
          round_order_json: Json
          server_id: string
          source_entity_id: string
          source_entity_type: string
          source_type: Database["public"]["Enums"]["combat_source_type"]
          status_key: string
          status_label: string
          updated_at: string
        }[]
      }
      ensure_estate_building_baseline: {
        Args: { p_estate_id: string }
        Returns: number
      }
      ensure_exploration_combat_session_unchecked: {
        Args: { p_challenge_attempt_id: string; p_request_id?: string }
        Returns: {
          awaiting_player_action: boolean
          combat_session_id: string
          current_action_index: number
          current_actor_participant_id: string
          current_round_number: number
          current_timing_manifest_json: Json
          event_count: number
          events_json: Json
          final_combat_result_id: string
          participants_json: Json
          round_order_json: Json
          server_id: string
          source_entity_id: string
          source_entity_type: string
          source_type: Database["public"]["Enums"]["combat_source_type"]
          status_key: string
          status_label: string
          updated_at: string
        }[]
      }
      ensure_hero_daily_action_counter: {
        Args: {
          p_action_date?: string
          p_action_kind: string
          p_hero_id: string
        }
        Returns: {
          action_date: string
          action_kind: string
          created_at: string
          hero_id: string
          id: string
          metadata_json: Json
          remaining_count: number
          server_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "hero_daily_action_counters"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      ensure_hero_loadout_presets: {
        Args: { p_hero_id: string }
        Returns: number
      }
      ensure_hero_prestige_state: {
        Args: { p_hero_id: string }
        Returns: {
          current_points: number
          current_rank_name: string
          current_rank_number: number
          current_rank_uuid: string
          district_code: string
          hero_id: string
          server_id: string
          updated_at: string
        }[]
      }
      ensure_pvp_combat_session: {
        Args: { p_pvp_action_id: string; p_request_id?: string }
        Returns: {
          awaiting_player_action: boolean
          combat_session_id: string
          current_action_index: number
          current_actor_participant_id: string
          current_round_number: number
          current_timing_manifest_json: Json
          event_count: number
          events_json: Json
          final_combat_result_id: string
          participants_json: Json
          round_order_json: Json
          server_id: string
          source_entity_id: string
          source_entity_type: string
          source_type: Database["public"]["Enums"]["combat_source_type"]
          status_key: string
          status_label: string
          updated_at: string
        }[]
      }
      equip_hero_item: {
        Args: {
          p_hero_id: string
          p_item_id: string
          p_request_id?: string
          p_target_slot_key?: string
        }
        Returns: {
          action_key: string
          final_equipment_json: Json
          hero_id: string
          item_id: string
          journal_json: Json
          message: string
          request_id: string
          slot_key: string
          success: boolean
        }[]
      }
      estate_matches_hero_server: {
        Args: { target_hero_id: string; target_server_id: string }
        Returns: boolean
      }
      evaluate_balance_formula_expression: {
        Args: {
          p_allowed_variables: string[]
          p_expression: string
          p_variables_json: Json
        }
        Returns: number
      }
      evaluate_balance_formula_target: {
        Args: { p_target_key: string; p_variables_json: Json }
        Returns: number
      }
      evaluate_balance_formula_target_for_entity: {
        Args: {
          p_entity_id: string
          p_entity_kind: string
          p_target_key: string
          p_variables?: Json
        }
        Returns: {
          entity_id: string
          entity_kind: string
          formula_expression: string
          formula_id: string
          formula_key: string
          formula_label: string
          formula_source: string
          target_id: string
          target_key: string
          value: number
        }[]
      }
      evaluate_balance_formula_target_with_draft: {
        Args: {
          p_change_set_id?: string
          p_target_key: string
          p_variables_json: Json
        }
        Returns: {
          allowed_variables: string[]
          change_set_id: string
          conflict_status: string
          formula_expression: string
          formula_id: string
          formula_key: string
          formula_label: string
          formula_source: string
          pending_changes_json: Json
          target_id: string
          target_key: string
          target_label: string
          target_scope_key: string
          value: number
          variables_json: Json
        }[]
      }
      evaluate_combat_opponent_scaled_stat: {
        Args: {
          p_base_value: number
          p_candidate_scaling_formula_id?: string
          p_current_level: number
          p_difficulty_multiplier: number
          p_opponent_definition_id: string
        }
        Returns: {
          formula_context_json: Json
          formula_id: string
          formula_key: string
          formula_source: string
          scaled_value: number
        }[]
      }
      evaluate_reward_profile_entry_amount: {
        Args: {
          p_entry_id: string
          p_hero_id?: string
          p_metadata_json?: Json
          p_source_id?: string
          p_source_kind?: string
        }
        Returns: number
      }
      evaluate_reward_profile_entry_item_count: {
        Args: {
          p_entry_id: string
          p_hero_id?: string
          p_metadata_json?: Json
          p_source_id?: string
          p_source_kind?: string
        }
        Returns: number
      }
      exit_manual_trial_to_auto_resolve: {
        Args: { p_manual_session_id: string; p_request_id?: string }
        Returns: {
          action_log_id: string
          attempt_id: string
          backend_replay_summary_json: Json
          failure_reason_helper_text: string
          failure_reason_key: string
          failure_reason_label: string
          game_report_id: string
          hero_id: string
          manual_session_id: string
          minigame_key: string
          outcome_key: string
          performance_rating: string
          player_report_summary_json: Json
          resolution_mode_key: string
          resolved_at: string
          reward_grant_id: string
          reward_summary_json: Json
          score: number
          server_id: string
          trial_definition_id: string
          validation_reason_key: string
          validation_reason_label: string
          validation_reason_severity: string
          validation_warnings_json: Json
          verdict_id: string
        }[]
      }
      expire_pvp_target_protections: {
        Args: { p_target_hero_id?: string }
        Returns: number
      }
      exploration_effect_kind_label_pl: {
        Args: { p_effect_kind: string }
        Returns: string
      }
      filter_item_detail_player_modifier_rows: {
        Args: { p_base_type_key: string; p_bonuses_json: Json }
        Returns: Json
      }
      filter_item_detail_popover_item_stats_rows: {
        Args: { p_rows: Json }
        Returns: Json
      }
      filter_player_facing_item_stats_json: {
        Args: { p_rows_json: Json }
        Returns: Json
      }
      finalize_combat_source_result: {
        Args: {
          p_request_id?: string
          p_resolution_mode?: string
          p_session_id: string
        }
        Returns: {
          attacks_created: number
          combat_result_id: string
          combat_session_id: string
          completion_mode: string
          exploration_status: string
          final_event_count: number
          game_report_id: string
          outcome: Database["public"]["Enums"]["combat_outcome"]
          outcome_key: string
          participant_stats_created: number
          participants_created: number
          remaining_trials: number
          report_attacks_count: number
          reward_grant_id: string
          runtime_activity_id: string
          source_entity_id: string
          source_entity_type: string
          source_result_id: string
          source_result_kind: string
          source_type: Database["public"]["Enums"]["combat_source_type"]
          status: string
          success: boolean
        }[]
      }
      finalize_combat_source_result_internal: {
        Args: {
          p_request_id?: string
          p_resolution_mode?: string
          p_session_id: string
        }
        Returns: {
          attacks_created: number
          combat_result_id: string
          combat_session_id: string
          completion_mode: string
          exploration_status: string
          final_event_count: number
          game_report_id: string
          outcome: Database["public"]["Enums"]["combat_outcome"]
          outcome_key: string
          participant_stats_created: number
          participants_created: number
          remaining_trials: number
          report_attacks_count: number
          reward_grant_id: string
          runtime_activity_id: string
          source_entity_id: string
          source_entity_type: string
          source_result_id: string
          source_result_kind: string
          source_type: Database["public"]["Enums"]["combat_source_type"]
          status: string
          success: boolean
        }[]
      }
      finalize_completed_estate_building_jobs: {
        Args: { p_estate_id: string }
        Returns: number
      }
      finalize_guild_emergency_election: {
        Args: {
          p_actor_hero_id: string
          p_election_id: string
          p_reason?: string
          p_request_id?: string
        }
        Returns: {
          audit_log_id: string
          election_id: string
          guild_id: string
          new_leader_hero_id: string
          old_leader_hero_id: string
          status_key: string
          winning_vote_count: number
        }[]
      }
      finalize_hero_estate_building_jobs: {
        Args: { p_hero_id: string }
        Returns: {
          completed_count: number
          estate_id: string
          hero_id: string
          server_id: string
        }[]
      }
      finalize_player_auction_sale: {
        Args: {
          p_actor?: string
          p_amount_character_points: number
          p_auction_listing_id: string
          p_buyer_hero_id: string
          p_description?: string
          p_reason: string
        }
        Returns: string
      }
      finalize_pvp_combat_session: {
        Args: { p_request_id?: string; p_session_id: string }
        Returns: {
          combat_result_id: string
          combat_session_id: string
          finalized_at: string
          outcome_key: string
          pvp_action_id: string
          pvp_action_status: string
          pvp_attack_result_id: string
        }[]
      }
      find_best_level_up_reward_assignment: {
        Args: { p_reached_level: number }
        Returns: {
          assignment_id: string
          level_interval: number
          level_match_kind: string
          level_value: number
          match_priority: number
          max_level_value: number
          reward_profile_id: string
          sort_order: number
        }[]
      }
      find_best_pvp_reward_assignment: {
        Args: { p_outcome_kind: string }
        Returns: {
          assignment_id: string
          metadata_json: Json
          outcome_kind: string
          outcome_multiplier: number
          recipient_role: string
          reward_profile_id: string
          sort_order: number
        }[]
      }
      find_reward_profile_for_challenge: {
        Args: { p_challenge_attempt_id: string; p_success: boolean }
        Returns: string
      }
      finish_elapsed_exploration_step_runtime_locks: {
        Args: { p_as_of?: string; p_hero_id?: string }
        Returns: number
      }
      finish_expired_server_event_runs: {
        Args: { p_now?: string; p_server_id?: string }
        Returns: number
      }
      finish_hero_runtime_activity: {
        Args: {
          p_activity_id: string
          p_metadata_json?: Json
          p_reason?: string
          p_status?: string
        }
        Returns: {
          activity_kind: string
          available_at: string | null
          created_at: string
          ended_at: string | null
          expires_at: string | null
          hero_id: string
          id: string
          metadata_json: Json
          reason: string | null
          request_id: string | null
          server_id: string
          source_entity_id: string | null
          source_entity_type: string | null
          started_at: string
          status: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "hero_runtime_activities"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      finish_hero_runtime_activity_by_source: {
        Args: {
          p_metadata_json?: Json
          p_reason?: string
          p_source_entity_id: string
          p_source_entity_type: string
          p_status?: string
        }
        Returns: {
          activity_kind: string
          available_at: string | null
          created_at: string
          ended_at: string | null
          expires_at: string | null
          hero_id: string
          id: string
          metadata_json: Json
          reason: string | null
          request_id: string | null
          server_id: string
          source_entity_id: string | null
          source_entity_type: string | null
          started_at: string
          status: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "hero_runtime_activities"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      force_complete_hero_exploration_challenge_attempt: {
        Args: {
          p_challenge_attempt_id: string
          p_reason: string
          p_server_id: string
          p_success: boolean
        }
        Returns: {
          challenge_attempt_id: string
          completion_mode: string
          exploration_status: string
          remaining_trials: number
          reward_grant_id: string
          status: string
          success: boolean
        }[]
      }
      force_return_guild_armory_loan: {
        Args: {
          p_actor_hero_id: string
          p_loan_id: string
          p_reason?: string
          p_request_id?: string
        }
        Returns: {
          armory_item_id: string
          armory_status_key: string
          audit_log_id: string
          guild_id: string
          item_id: string
          loan_id: string
          loan_status_key: string
        }[]
      }
      format_combat_damage_display_pl: {
        Args: { p_damage: number }
        Returns: string
      }
      format_estate_address: {
        Args: { p_address_number: number; p_district_code: string }
        Returns: string
      }
      format_exploration_duration_display: {
        Args: { p_seconds: number }
        Returns: string
      }
      format_exploration_item_count_display: {
        Args: { p_max_count: number; p_min_count: number }
        Returns: string
      }
      format_exploration_percent_display: {
        Args: { p_value: number }
        Returns: string
      }
      format_item_stat_numeric_display: {
        Args: { p_value: number }
        Returns: string
      }
      format_player_facing_bonus_display: {
        Args: { p_target_label: string; p_type_key: string; p_value: number }
        Returns: string
      }
      format_player_facing_bonus_display_scoped: {
        Args: {
          p_scope_key?: string
          p_target_key: string
          p_target_label: string
          p_type_key: string
          p_value: number
        }
        Returns: string
      }
      format_player_facing_requirement_display: {
        Args: {
          p_required_building_key?: string
          p_required_district_code?: string
          p_required_resource_type?: string
          p_required_stat_key?: string
          p_required_value?: number
          p_required_value_text?: string
          p_requirement_definition_key: string
        }
        Returns: string
      }
      format_player_facing_requirement_display_parts: {
        Args: {
          p_required_building_key?: string
          p_required_district_code?: string
          p_required_resource_type?: string
          p_required_stat_key?: string
          p_required_value?: number
          p_required_value_text?: string
          p_requirement_definition_key: string
        }
        Returns: Json
      }
      format_start_flow_bonus_value: {
        Args: { p_target_label: string; p_type_key: string; p_value: number }
        Returns: string
      }
      format_vicinity_address: {
        Args: { p_address_number: number; p_district_code: string }
        Returns: string
      }
      formula_clamp:
        | {
            Args: { p_max: number; p_min: number; p_value: number }
            Returns: number
          }
        | {
            Args: { p_max: number; p_min: number; p_value: number }
            Returns: number
          }
      formula_exploration_auto_resolve_model_b3: {
        Args: {
          p_auto_resolve_penalty: number
          p_cap_percent: number
          p_difficulty_multiplier: number
          p_stat_cap: number
          p_trial_power: number
        }
        Returns: number
      }
      formula_random:
        | { Args: never; Returns: number }
        | { Args: { p_max: number; p_min: number }; Returns: number }
      formula_round_down: {
        Args: { p_step?: number; p_value: number }
        Returns: number
      }
      formula_round_up: {
        Args: { p_step?: number; p_value: number }
        Returns: number
      }
      formula_trial_manifestation_model_k: {
        Args: {
          p_cap_percent: number
          p_difficulty_multiplier: number
          p_spirituality_over_cap: number
          p_stat_cap: number
          p_trial_power: number
        }
        Returns: number
      }
      generate_game_report_public_token: { Args: never; Returns: string }
      generate_identity_observation_anti_abuse_signals: {
        Args: {
          p_lookback_hours?: number
          p_min_distinct_users?: number
          p_observation_id: string
        }
        Returns: number
      }
      generate_pvp_attack_anti_abuse_signals: {
        Args: { p_pvp_attack_result_id: string; p_request_id?: string }
        Returns: Json
      }
      generate_reward_item_for_hero: {
        Args: {
          p_bucket_profile_id?: string
          p_hero_id: string
          p_max_quality_key?: string
          p_metadata_json?: Json
          p_server_id: string
        }
        Returns: string
      }
      generate_trade_transaction_anti_abuse_signals: {
        Args: { p_transaction_id: string }
        Returns: number
      }
      generate_trade_transaction_identity_anti_abuse_signals: {
        Args: { p_lookback_hours?: number; p_transaction_id: string }
        Returns: number
      }
      get_account_entry_hero_contexts: {
        Args: { p_server_id?: string }
        Returns: {
          address: string
          address_label: string
          address_number: number
          created_at: string
          district_code: string
          estate_id: string
          hero_context_json: Json
          hero_id: string
          hero_level: number
          hero_name: string
          route_next_action: string
          server_id: string
          server_key: string
          server_name: string
        }[]
      }
      get_active_balance_draft_change_set: {
        Args: never
        Returns: {
          active_entry_count: number
          applied_at: string
          applied_by: string
          cancelled_at: string
          cancelled_by: string
          cancelled_reason: string
          change_set_id: string
          changelog_body: string
          changelog_title: string
          changelog_visibility: Database["public"]["Enums"]["config_change_visibility"]
          created_at: string
          draft_kind: string
          entry_count: number
          ready_at: string
          ready_by: string
          reason: string
          requested_by: string
          status: Database["public"]["Enums"]["config_change_status"]
          title: string
          updated_at: string
        }[]
      }
      get_active_pvp_action_offer: {
        Args: { p_hero_id: string }
        Returns: {
          action_kind: string
          arrives_at: string
          attacker_hero_id: string
          attacker_name: string
          available_at: string
          awaiting_player_action: boolean
          can_auto_settle: boolean
          can_enter_manual_resolution: boolean
          combat_live_session_id: string
          combat_live_status_key: string
          combat_result_id: string
          defender_hero_id: string
          defender_name: string
          expires_at: string
          is_blocking_runtime_activity: boolean
          is_manual_window: boolean
          is_resolved: boolean
          is_travel_phase: boolean
          manual_deadline_at: string
          metadata_json: Json
          outcome_key: string
          phase: string
          phase_ends_at: string
          phase_label: string
          phase_started_at: string
          pvp_action_id: string
          pvp_attack_result_id: string
          raw_status: string
          remaining_seconds: number
          resolved_at: string
          return_available_at: string
          return_started_at: string
          runtime_activity_id: string
          runtime_activity_is_blocking: boolean
          runtime_activity_status: string
          seconds_until_arrival: number
          seconds_until_expiry: number
          seconds_until_manual_deadline: number
          server_id: string
          started_at: string
          status_label: string
          target_address: string
          target_address_number: number
          target_district_code: string
          target_name: string
          viewer_hero_id: string
          viewer_role: string
        }[]
      }
      get_active_server_event: {
        Args: { p_server_id: string }
        Returns: {
          definition_id: string
          definition_key: string
          effect_explanation: string
          effects_json: Json
          ends_at: string
          event_polarity: string
          lore_description: string
          lore_name: string
          player_summary: string
          remaining_seconds: number
          run_id: string
          server_id: string
          starts_at: string
        }[]
      }
      get_active_server_event_effect_modifier: {
        Args: {
          p_server_id: string
          p_target_family: string
          p_target_key?: string
        }
        Returns: {
          effects_json: Json
          flat_delta: number
          multiplier: number
          percent_delta: number
          server_id: string
          target_family: string
          target_key: string
        }[]
      }
      get_active_server_event_effects: {
        Args: { p_server_id: string }
        Returns: {
          definition_id: string
          definition_key: string
          effect_metadata_json: Json
          numeric_value: number
          operation: string
          player_description: string
          player_label: string
          run_id: string
          server_id: string
          target_family: string
          target_key: string
        }[]
      }
      get_active_trial_offer: {
        Args: { p_hero_id: string }
        Returns: {
          attempt_id: string
          can_auto_resolve: boolean
          can_manual_resolve: boolean
          challenge_status: string
          difficulty_description: string
          difficulty_helper_text: string
          difficulty_key: string
          difficulty_label: string
          district_code: string
          existing_manifest_id: string
          existing_manual_session_id: string
          existing_verdict_id: string
          game_report_id: string
          hero_id: string
          manual_deadline_at: string
          minigame_description: string
          minigame_helper_text: string
          minigame_implementation_key: string
          minigame_key: string
          minigame_label: string
          offer_inactivity_auto_resolve_at: string
          player_context_json: Json
          policy_json: Json
          reward_grant_id: string
          server_id: string
          tested_stat_description: string
          tested_stat_helper_text: string
          tested_stat_key: string
          tested_stat_label: string
          trial_definition_id: string
          trial_description: string
          trial_helper_text: string
          trial_key: string
          trial_label: string
        }[]
      }
      get_admin_notification_db_owned_producer_diagnostics: {
        Args: never
        Returns: {
          admin_description_pl: string
          admin_label_pl: string
          blocker_help_text_pl: string
          diagnostics_status: string
          diagnostics_status_label_pl: string
          diagnostics_summary_pl: string
          helper_text_pl: string
          inactive_notification_type_keys: string[]
          is_active: boolean
          is_expected: boolean
          is_explicit_non_producer: boolean
          metadata_json: Json
          missing_notification_type_keys: string[]
          missing_producer_function_names: string[]
          notification_type_keys: string[]
          notification_types_json: Json
          producer_function_names: string[]
          producer_functions_json: Json
          producer_key: string
          producer_kind: string
          producer_table_exists: boolean
          producer_table_name: string
          producer_trigger_name: string
          workflow_key: string
        }[]
      }
      get_admin_preview_contracts: {
        Args: never
        Returns: {
          preview_description: string
          preview_kind: string
          preview_label: string
          purpose: string
          rpc_name: string
        }[]
      }
      get_auction_base_type_filter_options: { Args: never; Returns: Json }
      get_auction_bids_page: {
        Args: { p_hero_id: string; p_limit?: number; p_offset?: number }
        Returns: Json
      }
      get_auction_bids_page_raw_v1: {
        Args: { p_hero_id: string; p_limit?: number; p_offset?: number }
        Returns: Json
      }
      get_auction_create_context: {
        Args: { p_hero_id: string; p_limit?: number; p_offset?: number }
        Returns: Json
      }
      get_auction_create_context_raw_v1: {
        Args: { p_hero_id: string; p_limit?: number; p_offset?: number }
        Returns: Json
      }
      get_auction_listings_page: {
        Args: { p_hero_id: string; p_limit?: number; p_offset?: number }
        Returns: Json
      }
      get_auction_listings_page_raw_v1: {
        Args: { p_hero_id: string; p_limit?: number; p_offset?: number }
        Returns: Json
      }
      get_auction_page_context: { Args: { p_hero_id: string }; Returns: Json }
      get_auction_page_context_raw_v1: {
        Args: { p_hero_id: string }
        Returns: Json
      }
      get_auction_page_copy: { Args: never; Returns: Json }
      get_auction_page_copy_raw_v1: { Args: never; Returns: Json }
      get_balance_formula_assignment_draft_overlay: {
        Args: { p_change_set_id?: string }
        Returns: {
          allowed_variables: string[]
          assignment_id: string
          change_set_id: string
          conflict_status: string
          default_test_context: Json
          draft_patch_json: Json
          effective_formula_expression: string
          effective_formula_id: string
          effective_formula_is_enabled: boolean
          effective_formula_key: string
          effective_formula_label: string
          effective_row_json: Json
          has_draft_changes: boolean
          live_formula_expression: string
          live_formula_id: string
          live_formula_is_enabled: boolean
          live_formula_key: string
          live_formula_label: string
          live_row_json: Json
          pending_changes_json: Json
          target_id: string
          target_key: string
          target_label: string
          target_scope_key: string
        }[]
      }
      get_balance_formula_draft_overlay: {
        Args: { p_change_set_id?: string }
        Returns: {
          change_set_id: string
          conflict_status: string
          draft_patch_json: Json
          effective_description: string
          effective_expression: string
          effective_is_enabled: boolean
          effective_label: string
          effective_row_json: Json
          formula_id: string
          formula_key: string
          has_draft_changes: boolean
          live_description: string
          live_expression: string
          live_is_enabled: boolean
          live_label: string
          live_row_json: Json
          pending_changes_json: Json
          scope_key: string
        }[]
      }
      get_bonus_impact_preview: {
        Args: {
          p_entity_id?: string
          p_entity_type?: string
          p_quality_key?: string
        }
        Returns: {
          bonus_description: string
          bonus_key: string
          bonus_label: string
          bonus_scope_description: string
          bonus_scope_key: string
          bonus_scope_label: string
          bonus_target_description: string
          bonus_target_key: string
          bonus_target_label: string
          bonus_template_id: string
          bonus_type_description: string
          bonus_type_key: string
          bonus_type_label: string
          entity_bonus_id: string
          entity_id: string
          entity_type: string
          explanation: string
          level_interval: number
          params_json: Json
          preview_value: number
          quality_key: string
          quality_label: string
          quality_multiplier: number
          quality_scales_level_interval: boolean
          quality_scales_value: boolean
          scaling_stat_key: string
          value: number
          warning_text: string
        }[]
      }
      get_building_effective_requirement_rows: {
        Args: { p_building_id: string; p_target_level: number }
        Returns: {
          applies_from_level: number
          building_id: string
          context: string
          description: string
          effective_required_value_decimal: number
          effective_required_value_integer: number
          effective_required_value_numeric: number
          entity_requirement_id: string
          formula_applied: boolean
          formula_target_key: string
          formula_variables_json: Json
          is_active: boolean
          params_json: Json
          required_building_key: string
          required_district_code: string
          required_resource_type: string
          required_stat_key: string
          requirement_definition_key: string
          sort_order: number
          static_required_value_numeric: number
          target_level: number
        }[]
      }
      get_building_max_level_for_district: {
        Args: { p_building_id: string; p_district_code: string }
        Returns: number
      }
      get_building_progression_preview: {
        Args: {
          p_building_id: string
          p_district_code?: string
          p_from_level?: number
          p_to_level?: number
        }
        Returns: {
          base_build_time_seconds: number
          base_cost: number
          building_description: string
          building_id: string
          building_key: string
          building_name: string
          cap_explanation: string
          cap_source: string
          default_max_level: number
          district_explanation: string
          effective_max_level: number
          is_available_in_selected_district: boolean
          is_unlimited: boolean
          minimum_district_code: string
          next_level: number
          preview_level: number
          selected_district_code: string
          starting_level: number
          starting_level_explanation: string
        }[]
      }
      get_challenge_auto_resolve_success_chance: {
        Args: { p_challenge_attempt_id: string }
        Returns: number
      }
      get_combat_live_action_life_drain_percent: {
        Args: { p_actor_participant_id: string; p_attack_entry: Json }
        Returns: {
          life_drain_percent: number
          source_summary_json: Json
        }[]
      }
      get_combat_live_numeric_config: {
        Args: { p_fallback: number; p_key: string }
        Returns: number
      }
      get_combat_live_participant_round_healing: {
        Args: { p_participant_id: string }
        Returns: {
          round_healing_amount: number
          round_healing_flat_amount: number
          round_healing_percent: number
          source_summary_json: Json
        }[]
      }
      get_combat_live_participant_round_healing_flat: {
        Args: { p_participant_id: string }
        Returns: {
          round_healing_flat: number
          source_summary_json: Json
        }[]
      }
      get_combat_live_session_outcome: {
        Args: { p_session_id: string }
        Returns: Database["public"]["Enums"]["combat_outcome"]
      }
      get_combat_live_state: {
        Args: { p_session_id: string; p_since_event_index?: number }
        Returns: {
          awaiting_player_action: boolean
          combat_session_id: string
          current_action_index: number
          current_actor_participant_id: string
          current_round_number: number
          current_timing_manifest_json: Json
          event_count: number
          events_json: Json
          final_combat_result_id: string
          participants_json: Json
          round_order_json: Json
          server_id: string
          source_entity_id: string
          source_entity_type: string
          source_type: Database["public"]["Enums"]["combat_source_type"]
          status_key: string
          status_label: string
          updated_at: string
        }[]
      }
      get_combat_resolution_preview: {
        Args: {
          p_locale_key?: string
          p_source_entity_id: string
          p_source_entity_type: string
        }
        Returns: {
          auto_entrypoint: string
          can_auto_resolve: boolean
          can_start_manual: boolean
          combat_session_id: string
          decision_required: boolean
          manual_entrypoint: string
          metadata_json: Json
          participants_json: Json
          preview_status: string
          source_entity_id: string
          source_entity_type: string
          source_type: Database["public"]["Enums"]["combat_source_type"]
          updated_at: string
        }[]
      }
      get_combat_result_detail: {
        Args: { p_combat_result_id: string }
        Returns: {
          attacks_json: Json
          combat_result_id: string
          completed_at: string
          created_at: string
          defender_hero_id: string
          initiator_hero_id: string
          loser_side: Database["public"]["Enums"]["combat_side"]
          outcome: Database["public"]["Enums"]["combat_outcome"]
          participants_json: Json
          server_id: string
          source_entity_id: string
          source_type: Database["public"]["Enums"]["combat_source_type"]
          started_at: string
          turns_completed: number
          winner_side: Database["public"]["Enums"]["combat_side"]
        }[]
      }
      get_combat_snapshot_stat_value: {
        Args: { p_fallback?: number; p_stat_key: string; p_stats_json: Json }
        Returns: number
      }
      get_combat_turn_limit: { Args: never; Returns: number }
      get_config_change_set_draft_entries: {
        Args: { p_change_set_id: string; p_include_replaced?: boolean }
        Returns: {
          admin_label: string
          apply_domain: string
          apply_order: number
          change_kind: Database["public"]["Enums"]["config_change_kind"]
          change_set_id: string
          conflict_status: string
          created_at: string
          effective_sandbox_value_json: Json
          entity_id: string
          entity_label: string
          entity_type: Database["public"]["Enums"]["config_managed_entity_type"]
          entry_id: string
          field_label: string
          field_path: string
          has_effective_change: boolean
          is_active_final: boolean
          live_value_json: Json
          metadata_json: Json
          new_value_json: Json
          old_value_json: Json
          pending_change_summary: Json
          replaced_at: string
          replaced_by_entry_id: string
          value_type: Database["public"]["Enums"]["config_value_type"]
        }[]
      }
      get_config_definition_explainability: {
        Args: {
          p_include_inactive?: boolean
          p_managed_entity_key?: string
          p_server_id?: string
        }
        Returns: {
          applies_to_description: string
          applies_to_helper_text: string
          applies_to_kind: string
          applies_to_label: string
          change_warning: string
          config_definition_id: string
          config_key: string
          description: string
          effective_value_json: Json
          effective_value_source_description: string
          effective_value_source_key: string
          effective_value_source_label: string
          expected_change_kind: Database["public"]["Enums"]["config_change_kind"]
          expected_change_kind_label: string
          gameplay_impact_summary: string
          governance_scope: Database["public"]["Enums"]["config_governance_scope"]
          governance_scope_description: string
          governance_scope_helper_text: string
          governance_scope_label: string
          governance_scope_warning_text: string
          helper_text: string
          label: string
          managed_entity_key: string
          managed_entity_type: Database["public"]["Enums"]["config_managed_entity_type"]
          managed_entity_type_description: string
          managed_entity_type_label: string
          metadata_json: Json
          preview_description: string
          preview_kind: string
          preview_label: string
          selected_server_id: string
          sort_order: number
          ui_group_key: string
          ui_group_label: string
          value_type: Database["public"]["Enums"]["config_value_type"]
          value_type_description: string
          value_type_label: string
        }[]
      }
      get_config_definition_ui_metadata: {
        Args: {
          p_config_definition_id?: string
          p_include_inactive?: boolean
          p_managed_entity_key?: string
        }
        Returns: {
          change_warning: string
          config_definition_id: string
          config_key: string
          description: string
          gameplay_impact_summary: string
          governance_scope: Database["public"]["Enums"]["config_governance_scope"]
          helper_text: string
          label: string
          managed_entity_key: string
          managed_entity_type: Database["public"]["Enums"]["config_managed_entity_type"]
          metadata_json: Json
          preview_description: string
          preview_kind: string
          preview_label: string
          sort_order: number
          ui_group_key: string
          ui_group_label: string
          value_type: Database["public"]["Enums"]["config_value_type"]
        }[]
      }
      get_config_entity_field_live_value_status: {
        Args: {
          p_entity_id: string
          p_entity_type: Database["public"]["Enums"]["config_managed_entity_type"]
          p_field_path: string
        }
        Returns: {
          entity_exists: boolean
          entity_label: string
          field_valid: boolean
          live_value_json: Json
        }[]
      }
      get_current_exploration_date: { Args: never; Returns: string }
      get_current_global_config_value_json: {
        Args: { p_config_definition_id: string }
        Returns: Json
      }
      get_current_global_effective_config_value_json: {
        Args: { p_config_definition_id: string }
        Returns: Json
      }
      get_current_guild_armory_item_state: {
        Args: { p_item_id: string }
        Returns: {
          armory_item_id: string
          armory_status_key: string
          borrower_hero_id: string
          guild_id: string
          item_id: string
          loan_id: string
          loan_status_key: string
          owner_hero_id: string
        }[]
      }
      get_current_server_effective_config_value_json: {
        Args: { p_config_definition_id: string; p_server_id: string }
        Returns: Json
      }
      get_default_daily_action_limit: {
        Args: { p_action_kind: string; p_hero_id: string }
        Returns: number
      }
      get_effective_membership_moderation_block: {
        Args: { p_server_id: string; p_user_id: string }
        Returns: {
          action_id: string
          action_type_key: string
          expires_at: string
          reason: string
        }[]
      }
      get_encounter_definition_readiness: {
        Args: { p_encounter_definition_id?: string }
        Returns: {
          blocking_reason_count: number
          combat_candidate_count: number
          definition_id: string
          definition_key: string
          definition_kind: string
          effect_payload_count: number
          encounter_kind: string
          is_active: boolean
          is_ready: boolean
          metadata_json: Json
          minigame_key: string
          reasons_json: Json
          reward_assignment_count: number
        }[]
      }
      get_estate_building_effective_bonus_scope_key: {
        Args: {
          p_building_key: string
          p_target_key: string
          p_template_scope_key: string
        }
        Returns: string
      }
      get_exploration_challenge_reward_read_model: {
        Args: { p_challenge_attempt_id: string }
        Returns: {
          challenge_attempt_id: string
          challenge_kind: string
          challenge_status: string
          completed_at: string
          completion_mode: string
          difficulty_key: string
          district_code: string
          encounter_definition_id: string
          encounter_key: string
          encounter_kind: string
          encounter_label: string
          explanation: string
          exploration_id: string
          generated_item_count: number
          generated_items_json: Json
          hero_id: string
          minigame_key: string
          no_reward_reason_helper_text: string
          no_reward_reason_key: string
          no_reward_reason_label: string
          reward_entries_json: Json
          reward_entry_count: number
          reward_grant_id: string
          reward_grant_status: string
          reward_granted_at: string
          reward_profile_id: string
          reward_profile_key: string
          reward_profile_label: string
          reward_status_key: string
          reward_status_label: string
          server_id: string
          started_at: string
          step_id: string
          success: boolean
          tested_stat_key: string
          trial_definition_id: string
          trial_key: string
          trial_label: string
        }[]
      }
      get_exploration_difficulty_reward_card_summary: {
        Args: { p_difficulty_key: string; p_hero_id: string }
        Returns: Json
      }
      get_exploration_manual_resolution_seconds: {
        Args: never
        Returns: number
      }
      get_exploration_reward_execution_diagnostic: {
        Args: { p_challenge_attempt_id: string }
        Returns: {
          active_hero_effect_count: number
          challenge_attempt_id: string
          challenge_kind: string
          challenge_status: string
          completion_mode: string
          consumed_hero_effect_count: number
          details_json: Json
          diagnostic_flags_json: Json
          encounter_definition_id: string
          encounter_effect_payload_count: number
          encounter_effect_payloads_json: Json
          encounter_kind: string
          exploration_id: string
          hero_effects_json: Json
          hero_id: string
          metadata_json: Json
          reward_entries_json: Json
          reward_entry_count: number
          reward_grant_exists: boolean
          reward_grant_id: string
          server_id: string
          step_id: string
          success: boolean
          trial_definition_id: string
        }[]
      }
      get_exploration_step_duration_seconds: {
        Args: { p_difficulty_key: string; p_server_id: string }
        Returns: number
      }
      get_exploration_step_reward_read_model: {
        Args: { p_step_id: string }
        Returns: {
          challenge_attempt_id: string
          challenge_completion_mode: string
          challenge_kind: string
          challenge_status: string
          challenge_success: boolean
          difficulty_key: string
          district_code: string
          encounter_definition_id: string
          encounter_key: string
          encounter_kind: string
          encounter_label: string
          explanation: string
          exploration_id: string
          generated_item_count: number
          generated_items_json: Json
          hero_id: string
          no_reward_reason_helper_text: string
          no_reward_reason_key: string
          no_reward_reason_label: string
          outcome_kind: string
          resolved_at: string
          reward_entries_json: Json
          reward_entry_count: number
          reward_grant_id: string
          reward_grant_status: string
          reward_granted_at: string
          reward_profile_id: string
          reward_profile_key: string
          reward_profile_label: string
          reward_source_id: string
          reward_source_kind: string
          reward_source_label: string
          reward_status_key: string
          reward_status_label: string
          server_id: string
          started_at: string
          step_id: string
          step_kind: string
          step_status: string
          trial_definition_id: string
          trial_key: string
          trial_label: string
        }[]
      }
      get_exploration_step_selection_diagnostic: {
        Args: { p_step_id: string }
        Returns: {
          challenge_attempt_id: string
          challenge_status: string
          encounter_chance: number
          encounter_definition_id: string
          encounter_definition_key: string
          encounter_definition_ready: boolean
          encounter_kind: string
          encounter_readiness_reasons_json: Json
          encounter_roll: number
          encounter_selection_skipped_reason: string
          exploration_id: string
          forced_override_id: string
          hero_id: string
          metadata_json: Json
          outcome_kind: string
          readiness_guarded: boolean
          reward_grant_id: string
          server_id: string
          step_id: string
          step_kind: string
          step_status: string
          trial_definition_id: string
          trial_definition_key: string
          trial_definition_ready: boolean
          trial_opportunity_chance: number
          trial_opportunity_roll: number
          trial_readiness_reasons_json: Json
        }[]
      }
      get_full_hero_moderation_history: {
        Args: { p_hero_id: string; p_server_id: string }
        Returns: {
          action_type_key: string
          created_at: string
          created_by_user_id: string | null
          expires_at: string | null
          id: string
          is_staff_disqualifying: boolean
          metadata_json: Json
          operator_notes: string | null
          player_visible_note: string | null
          reason: string
          resolved_at: string | null
          resolved_by_user_id: string | null
          scope_key: string | null
          server_id: string
          source_entity_id: string | null
          source_entity_type: string | null
          source_snapshot_id: string | null
          starts_at: string
          status: Database["public"]["Enums"]["moderation_action_status"]
          status_reason: string | null
          target_hero_id: string | null
          target_user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "moderation_actions"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_full_user_moderation_history: {
        Args: { p_server_id: string; p_user_id: string }
        Returns: {
          action_type_key: string
          created_at: string
          created_by_user_id: string | null
          expires_at: string | null
          id: string
          is_staff_disqualifying: boolean
          metadata_json: Json
          operator_notes: string | null
          player_visible_note: string | null
          reason: string
          resolved_at: string | null
          resolved_by_user_id: string | null
          scope_key: string | null
          server_id: string
          source_entity_id: string | null
          source_entity_type: string | null
          source_snapshot_id: string | null
          starts_at: string
          status: Database["public"]["Enums"]["moderation_action_status"]
          status_reason: string | null
          target_hero_id: string | null
          target_user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "moderation_actions"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_global_config_integer: {
        Args: { p_config_key: string; p_fallback: number }
        Returns: number
      }
      get_global_numeric_config_value: {
        Args: { p_config_key: string; p_fallback?: number }
        Returns: number
      }
      get_guild_config_summary: {
        Args: never
        Returns: {
          armory_capacity: number
          armory_capacity_is_unlimited: boolean
          creation_drachma_cost: number
          emergency_max_candidates: number
          leader_inactivity_threshold_days: number
          member_base_limit: number
          member_limit_per_leader_level: number
          nomination_duration_minutes: number
          voting_duration_minutes: number
        }[]
      }
      get_guild_member_limit: { Args: { p_guild_id: string }; Returns: number }
      get_hero_active_character_point_locks: {
        Args: { p_hero_id: string }
        Returns: number
      }
      get_hero_active_runtime_activity: {
        Args: { p_hero_id: string }
        Returns: {
          activity_id: string
          activity_kind: string
          activity_kind_label: string
          available_at: string
          ended_at: string
          expires_at: string
          hero_id: string
          metadata_json: Json
          reason: string
          request_id: string
          server_id: string
          source_entity_id: string
          source_entity_type: string
          started_at: string
          status: string
          status_label: string
        }[]
      }
      get_hero_active_trade_slot_count: {
        Args: { p_hero_id: string }
        Returns: number
      }
      get_hero_armory_item_detail: {
        Args: { p_hero_id: string; p_item_id: string }
        Returns: {
          armory_shelf_position: number
          base_key: string
          base_name: string
          base_type_key: string
          bonuses_json: Json
          created_at: string
          drachma_value: number
          generated_at: string
          generation_base_id: string
          generation_quality_key: string
          hero_id: string
          item_id: string
          item_name: string
          item_status: Database["public"]["Enums"]["item_status"]
          prefix_affix_id: string
          prefix_key: string
          prefix_name: string
          quality_multiplier: number
          server_id: string
          shelf_name: string
          suffix_affix_id: string
          suffix_key: string
          suffix_name: string
          visibility_index: number
          visibility_limit: number
        }[]
      }
      get_hero_armory_item_detail_core: {
        Args: { p_hero_id: string; p_item_id: string }
        Returns: {
          armory_shelf_position: number
          base_key: string
          base_name: string
          base_type_key: string
          bonuses_json: Json
          created_at: string
          drachma_value: number
          generated_at: string
          generation_base_id: string
          generation_quality_key: string
          hero_id: string
          item_id: string
          item_name: string
          item_status: Database["public"]["Enums"]["item_status"]
          prefix_affix_id: string
          prefix_key: string
          prefix_name: string
          quality_multiplier: number
          server_id: string
          shelf_name: string
          suffix_affix_id: string
          suffix_key: string
          suffix_name: string
          visibility_index: number
          visibility_limit: number
        }[]
      }
      get_hero_armory_items: {
        Args: { p_hero_id: string }
        Returns: {
          allowed_slot_keys: string[]
          armory_shelf_position: number
          base_key: string
          base_name: string
          base_type_key: string
          created_at: string
          drachma_value: number
          equipment_area: string
          generated_at: string
          generation_base_id: string
          generation_quality_key: string
          hand_usage_key: string
          hero_id: string
          is_unsorted: boolean
          is_visible: boolean
          item_category_key: string
          item_id: string
          item_name: string
          item_status: Database["public"]["Enums"]["item_status"]
          prefix_affix_id: string
          primary_slot_key: string
          server_id: string
          shelf_name: string
          suffix_affix_id: string
          visibility_index: number
          visibility_limit: number
        }[]
      }
      get_hero_armory_ranked_items_internal: {
        Args: {
          p_hero_id: string
          p_server_id: string
          p_visibility_limit: number
        }
        Returns: {
          armory_shelf_position: number
          created_at: string
          display_visibility_index: number
          drachma_value: number
          generated_at: string
          generation_base_id: string
          generation_quality_key: string
          hero_id: string
          inventory_visibility_index: number
          is_equipped: boolean
          is_frontend_visible: boolean
          item_id: string
          item_name: string
          item_status: Database["public"]["Enums"]["item_status"]
          prefix_affix_id: string
          server_id: string
          suffix_affix_id: string
        }[]
      }
      get_hero_armory_visibility_state: {
        Args: { p_hero_id: string }
        Returns: {
          armory_building_id: string
          armory_building_key: string
          armory_building_level: number
          estate_id: string
          generated_at: string
          hero_id: string
          hidden_item_count: number
          server_id: string
          shelves_json: Json
          source_config_json: Json
          total_owned_item_count: number
          unsorted_json: Json
          visibility_limit: number
          visibility_limit_source: string
          visibility_order: string
          visible_item_count: number
          visible_statuses: string[]
        }[]
      }
      get_hero_attribute_allocation_model: {
        Args: { p_hero_id: string; p_stat_values_json?: Json }
        Returns: Json
      }
      get_hero_attribute_allocation_preview_manifest: {
        Args: { p_hero_id: string }
        Returns: Json
      }
      get_hero_attribute_derived_preview_manifest: {
        Args: { p_hero_id: string }
        Returns: Json
      }
      get_hero_available_character_points: {
        Args: { p_hero_id: string }
        Returns: number
      }
      get_hero_base_stat_value: {
        Args: { p_hero_id: string; p_stat_key: string }
        Returns: number
      }
      get_hero_base_stat_value_excluding_item: {
        Args: {
          p_excluded_item_id: string
          p_hero_id: string
          p_stat_key: string
        }
        Returns: number
      }
      get_hero_combat_derived_event_modifier: {
        Args: { p_hero_id: string; p_target_key: string }
        Returns: {
          effects_json: Json
          flat_delta: number
          hero_id: string
          multiplier: number
          percent_delta: number
          server_id: string
          target_key: string
        }[]
      }
      get_hero_current_district_code: {
        Args: { p_hero_id: string }
        Returns: string
      }
      get_hero_dashboard_runtime_stats: {
        Args: { p_hero_id: string }
        Returns: {
          attack_count: number
          attack_plan_json: Json
          critical_chance_bonus: number
          critical_damage: number
          current_health: number
          damage_rows_json: Json
          defense: number
          display_stats_json: Json
          evasion_chance_bonus: number
          hero_id: string
          luck: number
          max_health: number
          source_json: Json
          stats_json: Json
        }[]
      }
      get_hero_effective_direct_stat_value_for_system: {
        Args: { p_hero_id: string; p_stat_key: string }
        Returns: number
      }
      get_hero_equipment_runtime_bonus_rows: {
        Args: { p_hero_id: string }
        Returns: {
          bonus_label: string
          bonus_template_id: string
          bonus_template_key: string
          effective_value: number
          entity_bonus_id: string
          entity_bonus_params_json: Json
          generation_quality_key: string
          hero_id: string
          item_id: string
          item_status: Database["public"]["Enums"]["item_status"]
          quality_multiplier: number
          quality_scales_level_interval: boolean
          quality_scales_value: boolean
          raw_value: number
          scope_key: string
          slot_key: string
          sort_order: number
          source_entity_id: string
          source_entity_type: string
          source_key: string
          source_label: string
          source_layer: string
          target_key: string
          template_params_json: Json
          type_key: string
        }[]
      }
      get_hero_equipment_runtime_bonus_totals: {
        Args: { p_hero_id: string }
        Returns: {
          bonus_row_count: number
          hero_id: string
          scope_key: string
          target_key: string
          total_value: number
          type_key: string
        }[]
      }
      get_hero_equipment_runtime_slots: {
        Args: { p_hero_id: string }
        Returns: {
          base_key: string
          base_name: string
          base_type_key: string
          equipment_area: string
          equipment_slot_group: string
          equipped_at: string
          generation_base_id: string
          generation_quality_key: string
          hand_usage: string
          has_item: boolean
          hero_id: string
          is_runtime_usable: boolean
          item_id: string
          item_name: string
          item_status_key: string
          prefix_affix_id: string
          prefix_key: string
          prefix_name: string
          quality_label: string
          quality_multiplier: number
          slot_item_state: string
          slot_key: string
          slot_label: string
          slot_sort_order: number
          suffix_affix_id: string
          suffix_key: string
          suffix_name: string
        }[]
      }
      get_hero_equipped_affix_set_bonus_rows: {
        Args: { p_hero_id: string }
        Returns: {
          bonus_template_id: string
          bonus_template_key: string
          building_id: string
          building_level: number
          effective_value: number
          entity_bonus_id: string
          hero_id: string
          item_id: string
          metadata_json: Json
          raw_value: number
          scope_key: string
          slot_key: string
          sort_order: number
          source_base_type_key: string
          source_entity_id: string
          source_entity_type: string
          source_key: string
          source_kind: string
          source_label: string
          source_layer: string
          target_key: string
          type_key: string
        }[]
      }
      get_hero_equipped_affix_sets: {
        Args: { p_hero_id: string }
        Returns: {
          hero_id: string
          is_complete: boolean
          matched_item_count: number
          matched_items_json: Json
          matched_requirement_count: number
          missing_requirement_count: number
          missing_requirements_json: Json
          prefix_affix_id: string
          prefix_key: string
          prefix_name: string
          required_item_count: number
          requirements_json: Json
          server_id: string
          set_description: string
          set_helper_text: string
          set_id: string
          set_kind: string
          set_label: string
          set_quality_key: string
          set_quality_label: string
          set_quality_multiplier: number
          source_json: Json
        }[]
      }
      get_hero_estate_movement_lock_state: {
        Args: { p_hero_id: string; p_lock_kinds?: string[] }
        Returns: {
          expires_at: string
          is_locked: boolean
          lock_id: string
          lock_kind: string
          lock_reason: string
          remaining_seconds: number
          source_entity_id: string
          source_entity_type: string
          starts_at: string
        }[]
      }
      get_hero_estate_runtime_state: {
        Args: { p_hero_id: string }
        Returns: {
          active_job_json: Json
          address: string
          address_number: number
          attack_protection_active: boolean
          attack_protection_expires_at: string
          attack_protection_source_entity_id: string
          attack_protection_source_entity_type: string
          buildings_json: Json
          district_code: string
          estate_id: string
          estate_rank: number
          hero_id: string
          recent_jobs_json: Json
          resources_json: Json
          server_id: string
          settled_as_of: string
          settled_completed_count: number
          siege_protection_active: boolean
          siege_protection_expires_at: string
          siege_protection_source: string
        }[]
      }
      get_hero_estate_summary_state: {
        Args: { p_hero_id: string }
        Returns: {
          active_job_json: Json
          address: string
          address_number: number
          attack_protection_active: boolean
          attack_protection_expires_at: string
          attack_protection_source_entity_id: string
          attack_protection_source_entity_type: string
          district_code: string
          estate_id: string
          estate_rank: number
          hero_id: string
          server_id: string
          settled_as_of: string
          settled_completed_count: number
          siege_protection_active: boolean
          siege_protection_expires_at: string
          siege_protection_source: string
        }[]
      }
      get_hero_experience_to_next_level: {
        Args: { p_experience?: number; p_hero_id: string; p_level?: number }
        Returns: number
      }
      get_hero_exploration_debug_state: {
        Args: {
          p_exploration_date?: string
          p_hero_id: string
          p_server_id: string
        }
        Returns: Json
      }
      get_hero_exploration_difficulty_card_previews: {
        Args: { p_hero_id: string; p_steps_to_preview?: number }
        Returns: {
          auto_result_display: string
          auto_result_policy: string
          auto_result_preview_json: Json
          auto_result_success_chance: number
          card_json: Json
          difficulty_description: string
          difficulty_helper_text: string
          difficulty_key: string
          difficulty_label: string
          district_code: string
          generated_at: string
          hero_id: string
          is_active: boolean
          is_available: boolean
          manifestation_chance: number
          manifestation_display: string
          manifestation_preview_json: Json
          reward_profile_label: string
          reward_profile_summary: string
          reward_profiles_json: Json
          server_id: string
          source_json: Json
          step_duration_display: string
          step_duration_multiplier: number
          step_duration_seconds: number
          trial_opportunity_chance: number
          trial_opportunity_display: string
          trial_opportunity_is_guaranteed_by_step_cap: boolean
          trial_opportunity_preview_rows_json: Json
          trial_opportunity_step_cap: number
        }[]
      }
      get_hero_exploration_difficulty_card_previews_core: {
        Args: { p_hero_id: string; p_steps_to_preview?: number }
        Returns: {
          auto_result_display: string
          auto_result_preview_json: Json
          auto_result_success_chance: number
          card_json: Json
          difficulty_description: string
          difficulty_helper_text: string
          difficulty_key: string
          difficulty_label: string
          district_code: string
          generated_at: string
          hero_id: string
          is_active: boolean
          is_available: boolean
          manifestation_chance: number
          manifestation_display: string
          manifestation_preview_json: Json
          reward_profile_label: string
          reward_profile_summary: string
          reward_profiles_json: Json
          server_id: string
          source_json: Json
          step_duration_display: string
          step_duration_multiplier: number
          step_duration_seconds: number
          trial_opportunity_chance: number
          trial_opportunity_display: string
          trial_opportunity_is_guaranteed_by_step_cap: boolean
          trial_opportunity_preview_rows_json: Json
          trial_opportunity_step_cap: number
        }[]
      }
      get_hero_exploration_luck_value: {
        Args: { p_hero_id: string }
        Returns: number
      }
      get_hero_exploration_state: {
        Args: { p_difficulty_key: string; p_hero_id: string }
        Returns: Json
      }
      get_hero_exploration_state_core: {
        Args: { p_difficulty_key: string; p_hero_id: string }
        Returns: Json
      }
      get_hero_game_report_detail: {
        Args: { p_hero_id: string; p_report_id: string }
        Returns: {
          access_role: Database["public"]["Enums"]["game_report_access_role"]
          combat_section_json: Json
          created_at: string
          effect_section_json: Json
          encounter_section_json: Json
          is_unread: boolean
          item_references_json: Json
          participants_json: Json
          public_token: string
          read_at: string
          related_reports_json: Json
          report_id: string
          report_type_description: string
          report_type_key: string
          report_type_label: string
          reward_section_json: Json
          source_entity_id: string
          source_entity_type: Database["public"]["Enums"]["game_report_source_entity_type"]
          source_label: string
          spy_section_json: Json
          summary: string
          title: string
          trial_section_json: Json
        }[]
      }
      get_hero_game_report_unread_count: {
        Args: { p_hero_id: string }
        Returns: number
      }
      get_hero_game_reports: {
        Args: {
          p_hero_id: string
          p_limit?: number
          p_offset?: number
          p_report_type_key?: string
          p_unread_only?: boolean
        }
        Returns: {
          access_role: Database["public"]["Enums"]["game_report_access_role"]
          created_at: string
          is_unread: boolean
          item_references_count: number
          participants_json: Json
          public_token: string
          read_at: string
          report_id: string
          report_type_key: string
          report_type_label: string
          source_entity_id: string
          source_entity_type: Database["public"]["Enums"]["game_report_source_entity_type"]
          summary: string
          title: string
        }[]
      }
      get_hero_guild_armory_item_rows: {
        Args: { p_hero_id: string }
        Returns: {
          armory_item_id: string
          armory_status_key: string
          base_type_key: string
          borrowed_at: string
          borrower_hero_id: string
          borrower_hero_name: string
          can_borrow: boolean
          can_force_return: boolean
          can_remove: boolean
          can_return: boolean
          can_withdraw: boolean
          deposited_at: string
          generation_quality_key: string
          guild_id: string
          item_id: string
          item_name: string
          item_status: Database["public"]["Enums"]["item_status"]
          loan_id: string
          loan_status_key: string
          owner_hero_id: string
          owner_hero_name: string
          quality_label: string
        }[]
      }
      get_hero_guild_armory_loan_rows: {
        Args: { p_hero_id: string; p_include_terminal?: boolean }
        Returns: {
          armory_item_id: string
          borrowed_at: string
          borrower_hero_id: string
          borrower_hero_name: string
          can_force_return: boolean
          can_return: boolean
          due_at: string
          ended_at: string
          guild_id: string
          item_id: string
          item_name: string
          loan_id: string
          loan_status_key: string
          owner_hero_id: string
          owner_hero_name: string
          reason: string
          status_reason: string
        }[]
      }
      get_hero_guild_dashboard: {
        Args: { p_hero_id: string }
        Returns: {
          active_election_id: string
          active_election_status_key: string
          armory_available_count: number
          armory_borrowed_count: number
          can_create_guild: boolean
          can_invite: boolean
          can_manage_armory: boolean
          can_manage_members: boolean
          can_start_emergency_election: boolean
          guild_id: string
          guild_name: string
          guild_status_key: string
          guild_tag: string
          hero_id: string
          member_count: number
          member_limit: number
          membership_id: string
          membership_status_key: string
          my_active_loan_count: number
          my_armory_access_status_key: string
          my_deposited_item_count: number
          pending_invite_count: number
          pending_join_request_count: number
          role_key: string
          role_label: string
          server_id: string
        }[]
      }
      get_hero_guild_emergency_election_candidate_rows: {
        Args: { p_hero_id: string }
        Returns: {
          candidate_hero_id: string
          candidate_hero_name: string
          created_at: string
          election_id: string
          guild_id: string
          is_my_candidate: boolean
          is_my_vote: boolean
          nominated_by_hero_id: string
          nominated_by_hero_name: string
          nomination_id: string
          vote_count: number
        }[]
      }
      get_hero_guild_emergency_election_summary: {
        Args: { p_hero_id: string }
        Returns: {
          can_finalize: boolean
          can_nominate: boolean
          can_start_voting: boolean
          can_vote: boolean
          election_id: string
          guild_id: string
          inactive_leader_hero_id: string
          inactive_leader_hero_name: string
          max_candidates: number
          my_vote_candidate_hero_id: string
          nomination_count: number
          nomination_ends_at: string
          nomination_starts_at: string
          started_by_hero_id: string
          started_by_hero_name: string
          status_key: string
          vote_count: number
          voting_ends_at: string
          voting_starts_at: string
        }[]
      }
      get_hero_guild_invitation_rows: {
        Args: { p_hero_id: string; p_include_terminal?: boolean }
        Returns: {
          can_accept: boolean
          can_cancel: boolean
          can_reject: boolean
          created_at: string
          expires_at: string
          guild_id: string
          guild_name: string
          guild_tag: string
          invite_id: string
          inviter_hero_id: string
          inviter_hero_name: string
          reason: string
          responded_at: string
          status_key: string
          status_reason: string
          target_hero_id: string
          target_hero_name: string
        }[]
      }
      get_hero_guild_join_request_rows: {
        Args: { p_hero_id: string; p_include_terminal?: boolean }
        Returns: {
          can_accept: boolean
          can_cancel: boolean
          can_reject: boolean
          created_at: string
          expires_at: string
          guild_id: string
          guild_name: string
          guild_tag: string
          join_request_id: string
          reason: string
          requester_hero_id: string
          requester_hero_name: string
          reviewed_at: string
          reviewed_by_hero_id: string
          reviewed_by_hero_name: string
          status_key: string
          status_reason: string
        }[]
      }
      get_hero_guild_members: {
        Args: { p_hero_id: string }
        Returns: {
          armory_access_status_key: string
          created_at: string
          guild_id: string
          joined_at: string
          member_hero_id: string
          member_name: string
          member_user_id: string
          membership_status_key: string
          role_key: string
          role_label: string
        }[]
      }
      get_hero_guild_state: {
        Args: { p_hero_id: string }
        Returns: {
          can_create_guild: boolean
          can_invite: boolean
          can_manage_armory: boolean
          can_manage_members: boolean
          guild_id: string
          guild_name: string
          guild_status_key: string
          guild_tag: string
          hero_id: string
          member_count: number
          member_limit: number
          membership_id: string
          membership_status_key: string
          role_key: string
          role_label: string
          server_id: string
        }[]
      }
      get_hero_health_state: {
        Args: { p_hero_id: string }
        Returns: {
          current_health: number
          hero_id: string
          max_health: number
          metadata_json: Json
          reset_policy_key: string
          server_id: string
          synced_at: string
        }[]
      }
      get_hero_item_requirement_status: {
        Args: { p_hero_id: string; p_item_id: string }
        Returns: {
          check_json: Json
          failures_json: Json
          generated_at: string
          hero_id: string
          item_id: string
          item_name: string
          item_status: Database["public"]["Enums"]["item_status"]
          meets_requirements: boolean
          requirement_count: number
          requirements_json: Json
          server_id: string
          unmet_count: number
        }[]
      }
      get_hero_item_runtime_bonus_rows: {
        Args: { p_hero_id: string; p_item_id: string; p_slot_key?: string }
        Returns: {
          bonus_label: string
          bonus_template_id: string
          bonus_template_key: string
          effective_value: number
          entity_bonus_id: string
          entity_bonus_params_json: Json
          generation_quality_key: string
          hero_id: string
          item_id: string
          item_status: Database["public"]["Enums"]["item_status"]
          quality_multiplier: number
          quality_scales_level_interval: boolean
          quality_scales_value: boolean
          raw_value: number
          scope_key: string
          slot_key: string
          sort_order: number
          source_entity_id: string
          source_entity_type: string
          source_key: string
          source_label: string
          source_layer: string
          target_key: string
          template_params_json: Json
          type_key: string
        }[]
      }
      get_hero_loadout_preset_limit: { Args: never; Returns: number }
      get_hero_loadout_presets: {
        Args: { p_hero_id: string }
        Returns: {
          cleared_at: string
          created_at: string
          hero_id: string
          name: string
          preset_id: string
          preset_number: number
          saved_at: string
          slot_count: number
          updated_at: string
        }[]
      }
      get_hero_luck_breakdown: {
        Args: { p_hero_id: string }
        Returns: {
          details_json: Json
          effective_value: number
          flat_value: number
          multiplier: number
          percent_delta: number
          source_key: string
          source_label: string
        }[]
      }
      get_hero_luck_value: { Args: { p_hero_id: string }; Returns: number }
      get_hero_normal_gameplay_block_reason: {
        Args: { p_hero_id: string }
        Returns: string
      }
      get_hero_pair_relationship_declaration_context: {
        Args: {
          p_as_of?: string
          p_context_type_keys?: string[]
          p_hero_a_id: string
          p_hero_b_id: string
          p_include_submitted?: boolean
          p_server_id: string
        }
        Returns: Json
      }
      get_hero_pending_combat_effect_state: {
        Args: { p_hero_id: string }
        Returns: {
          applied_at: string
          bonus_template_key: string
          bonus_template_label: string
          consumed_at: string
          consumed_by_id: string
          consumed_by_kind: string
          effect_definition_id: string
          effect_description: string
          effect_helper_text: string
          effect_id: string
          effect_key: string
          effect_kind: string
          effect_kind_label: string
          effect_label: string
          effect_target_key: string
          effect_target_label: string
          exploration_id: string
          hero_id: string
          is_active: boolean
          metadata_json: Json
          player_summary: string
          runtime_included: boolean
          server_id: string
          status: string
          value_display: string
        }[]
      }
      get_hero_prestige_admin_debug: {
        Args: { p_hero_id: string }
        Returns: {
          current_district_code: string
          current_points: number
          current_prestige_points_required: number
          current_rank_name: string
          current_rank_number: number
          current_rank_uuid: string
          hero_id: string
          last_admin_context_json: Json
          last_ledger_id: string
          last_message_kind: string
          last_points_after: number
          last_points_before: number
          last_points_delta: number
          last_source_entity_id: string
          last_source_entity_type: string
          last_source_kind: string
          next_prestige_points_required: number
          next_rank_name: string
          next_rank_number: number
          server_id: string
          updated_at: string
        }[]
      }
      get_hero_prestige_public_summary: {
        Args: { p_hero_id: string }
        Returns: {
          district_code: string
          helper_text: string
          hero_id: string
          player_label: string
          rank_name: string
          rank_number: number
          rank_uuid: string
          server_id: string
          updated_at: string
        }[]
      }
      get_hero_prestige_requirement_context: {
        Args: { p_hero_id: string }
        Returns: {
          current_district_code: string
          current_rank_label: string
          current_rank_name: string
          current_rank_number: number
          hero_id: string
          server_id: string
          updated_at: string
        }[]
      }
      get_hero_pvp_daily_attack_state: {
        Args: { p_hero_id: string }
        Returns: {
          action_date: string
          action_kind: string
          attacker_has_blocking_activity: boolean
          can_start_attack: boolean
          counter_created_at: string
          counter_exists: boolean
          counter_id: string
          counter_updated_at: string
          daily_attack_limit: number
          extra_daily_attacks: number
          formula_target: string
          generated_at: string
          hero_id: string
          remaining_daily_attacks: number
          server_id: string
          state_json: Json
          used_daily_attacks: number
        }[]
      }
      get_hero_pvp_travel_time_reduction: {
        Args: { p_hero_id: string }
        Returns: {
          cap_percent: number
          capped_reduction_percent: number
          hero_id: string
          reduction_percent: number
          source_rows: Json
        }[]
      }
      get_hero_runtime_attack_plan: {
        Args: { p_hero_id: string }
        Returns: Json
      }
      get_hero_runtime_attack_plan_unclamped_core: {
        Args: { p_hero_id: string }
        Returns: Json
      }
      get_hero_runtime_bonus_rows: {
        Args: { p_hero_id: string }
        Returns: {
          bonus_template_id: string
          bonus_template_key: string
          building_id: string
          building_level: number
          effective_value: number
          entity_bonus_id: string
          hero_id: string
          item_id: string
          metadata_json: Json
          raw_value: number
          scope_key: string
          slot_key: string
          sort_order: number
          source_base_type_key: string
          source_entity_id: string
          source_entity_type: string
          source_key: string
          source_kind: string
          source_label: string
          source_layer: string
          target_key: string
          type_key: string
        }[]
      }
      get_hero_runtime_bonus_rows_core: {
        Args: { p_hero_id: string }
        Returns: {
          bonus_template_id: string
          bonus_template_key: string
          building_id: string
          building_level: number
          effective_value: number
          entity_bonus_id: string
          hero_id: string
          item_id: string
          metadata_json: Json
          raw_value: number
          scope_key: string
          slot_key: string
          sort_order: number
          source_base_type_key: string
          source_entity_id: string
          source_entity_type: string
          source_key: string
          source_kind: string
          source_label: string
          source_layer: string
          target_key: string
          type_key: string
        }[]
      }
      get_hero_runtime_bonus_totals: {
        Args: { p_hero_id: string }
        Returns: {
          bonus_row_count: number
          hero_id: string
          scope_key: string
          source_summary_json: Json
          target_key: string
          total_value: number
          type_key: string
        }[]
      }
      get_hero_runtime_derived_stats: {
        Args: { p_hero_id: string }
        Returns: {
          attack_count: number
          attack_plan_json: Json
          critical_chance_bonus: number
          critical_damage: number
          current_health: number
          damage_rows_json: Json
          defense: number
          display_stats_json: Json
          evasion_chance_bonus: number
          hero_id: string
          luck: number
          max_health: number
          source_json: Json
          stats_json: Json
        }[]
      }
      get_hero_server_event_runtime_modifiers: {
        Args: { p_hero_id: string }
        Returns: {
          effects_json: Json
          flat_delta: number
          hero_id: string
          multiplier: number
          percent_delta: number
          server_id: string
          target_family: string
          target_key: string
        }[]
      }
      get_hero_stat_allocation_cap: {
        Args: { p_hero_id: string; p_stat_key: string }
        Returns: number
      }
      get_hero_stat_upgrade_cost: {
        Args: {
          p_current_value: number
          p_hero_id: string
          p_next_value: number
          p_stat_key: string
        }
        Returns: number
      }
      get_hero_trade_slot_limit: {
        Args: { p_hero_id: string }
        Returns: number
      }
      get_hero_trial_power: {
        Args: { p_hero_id: string; p_tested_stat_key: string }
        Returns: {
          hero_id: string
          luck_influence: number
          luck_value: number
          tested_stat_key: string
          tested_stat_value: number
          trial_power: number
        }[]
      }
      get_incomplete_item_generation_affix_set_bonus_configs: {
        Args: never
        Returns: {
          active_bonus_count: number
          issue_detail: string
          issue_key: string
          prefix_affix_id: string
          prefix_key: string
          prefix_name: string
          set_id: string
          set_is_active: boolean
          set_kind: string
          set_label: string
        }[]
      }
      get_item_detail_popover_raw_v1: {
        Args: {
          p_context?: string
          p_hero_id?: string
          p_item_id?: string
          p_item_reference_id?: string
          p_public_token?: string
        }
        Returns: Json
      }
      get_item_effective_requirements: {
        Args: { p_item_id: string }
        Returns: {
          additional_component_value: number
          additional_requirement_fraction: number
          component_count: number
          final_decimal_value: number
          generation_quality_key: string
          highest_component_value: number
          item_id: string
          item_owner_hero_id: string
          pre_quality_value: number
          quality_requirement_multiplier: number
          required_stat_key: string
          required_value_integer: number
          requirement_definition_key: string
          rounding_mode: string
        }[]
      }
      get_item_generation_affix_allowed_base_types: {
        Args: { p_affix_id: string }
        Returns: {
          base_type_key: string
          source_target_key: string
          source_target_kind: string
        }[]
      }
      get_item_generation_affix_candidates_for_base_type: {
        Args: {
          p_affix_kind: string
          p_base_type_key: string
          p_max_gold_value?: number
        }
        Returns: {
          created_at: string
          description: string | null
          display_forms_json: Json
          gold_value: number
          id: string
          is_legacy: boolean
          key: string
          kind: string
          name: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "item_generation_affixes"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_item_generation_affix_set_bonus_config: {
        Args: { p_set_id: string }
        Returns: {
          bonus_template_id: string
          bonus_template_key: string
          bonus_template_label: string
          created_at: string
          description: string
          entity_bonus_id: string
          entity_bonus_is_active: boolean
          params_json: Json
          prefix_affix_id: string
          prefix_key: string
          prefix_name: string
          quality_scales_level_interval: boolean
          quality_scales_value: boolean
          scope_key: string
          set_id: string
          set_is_active: boolean
          set_kind: string
          set_label: string
          sort_order: number
          target_key: string
          type_key: string
          updated_at: string
          value: number
        }[]
      }
      get_item_generation_affix_set_config: {
        Args: { p_prefix_affix_id: string }
        Returns: {
          created_at: string
          is_active: boolean
          metadata_json: Json
          prefix_affix_id: string
          prefix_key: string
          prefix_name: string
          requirements_json: Json
          set_description: string
          set_helper_text: string
          set_id: string
          set_kind: string
          set_label: string
          updated_at: string
        }[]
      }
      get_item_generation_affix_set_kind_requirements: {
        Args: { p_set_kind: string }
        Returns: {
          base_type_key: string
          required_count: number
          set_kind: string
          set_kind_label: string
          sort_order: number
        }[]
      }
      get_item_generation_affix_target_config: {
        Args: { p_affix_id: string }
        Returns: {
          active_target_count: number
          affix_id: string
          affix_key: string
          affix_kind: string
          affix_name: string
          allowed_base_type_count: number
          allowed_base_types_json: Json
          allowed_targets_json: Json
        }[]
      }
      get_item_generation_base_type_equip_metadata: {
        Args: { p_base_type_key: string }
        Returns: Json
      }
      get_item_generation_bucket_profile_draft_overlay: {
        Args: { p_change_set_id?: string }
        Returns: {
          bucket_profile_id: string
          bucket_profile_key: string
          change_set_id: string
          conflict_status: string
          draft_patch_json: Json
          effective_base_value: number
          effective_bucket_count: number
          effective_description: string
          effective_growth_factor: number
          effective_is_active: boolean
          effective_linear_growth: number
          effective_min_increment: number
          effective_name: string
          effective_rounding_step: number
          effective_row_json: Json
          has_draft_changes: boolean
          live_base_value: number
          live_bucket_count: number
          live_description: string
          live_growth_factor: number
          live_is_active: boolean
          live_linear_growth: number
          live_min_increment: number
          live_name: string
          live_rounding_step: number
          live_row_json: Json
          pending_changes_json: Json
        }[]
      }
      get_item_generation_quality_draft_overlay: {
        Args: { p_change_set_id?: string }
        Returns: {
          change_set_id: string
          conflict_status: string
          draft_patch_json: Json
          effective_is_enabled: boolean
          effective_label: string
          effective_multiplier: number
          effective_requirement_multiplier: number
          effective_row_json: Json
          effective_sort_order: number
          effective_weight: number
          has_draft_changes: boolean
          live_is_enabled: boolean
          live_label: string
          live_multiplier: number
          live_requirement_multiplier: number
          live_row_json: Json
          live_sort_order: number
          live_weight: number
          pending_changes_json: Json
          quality_id: string
          quality_key: string
        }[]
      }
      get_item_prefix_display_modifier: {
        Args: {
          p_base_id: string
          p_locale_key?: string
          p_prefix_affix_id: string
        }
        Returns: string
      }
      get_item_primary_stat_target_keys: {
        Args: { p_base_type_key: string }
        Returns: string[]
      }
      get_item_quality_display_modifier: {
        Args: {
          p_base_id?: string
          p_locale_key?: string
          p_quality_key: string
        }
        Returns: string
      }
      get_item_quality_impact_preview: {
        Args: { p_base_value?: number; p_bonus_value?: number }
        Returns: {
          bonus_scaling_explanation: string
          is_enabled: boolean
          multiplier: number
          quality_key: string
          quality_label: string
          sample_base_value: number
          sample_bonus_value: number
          sample_item_value: number
          sample_quality_scaled_bonus_value: number
          sort_order: number
          value_multiplier_explanation: string
          weight: number
        }[]
      }
      get_item_requirement_component_rows: {
        Args: { p_item_id: string }
        Returns: {
          applies_from_level: number
          generation_quality_key: string
          item_id: string
          item_owner_hero_id: string
          item_status: Database["public"]["Enums"]["item_status"]
          quality_requirement_multiplier: number
          raw_required_value: number
          required_stat_key: string
          requirement_definition_key: string
          requirement_id: string
          requirement_sort_order: number
          source_entity_id: string
          source_entity_type: Database["public"]["Enums"]["requirement_entity_type"]
          source_key: string
          source_label: string
          source_layer: string
          source_sort_order: number
        }[]
      }
      get_localized_entity_text: {
        Args: {
          p_entity_key: string
          p_entity_type: string
          p_fallback?: string
          p_field_key: string
          p_locale_key?: string
        }
        Returns: string
      }
      get_luck_lab_preview_contracts: {
        Args: never
        Returns: {
          anon_execute: boolean
          authenticated_execute: boolean
          contract_key: string
          description: string
          helper_text: string
          is_available: boolean
          label: string
          metadata_json: Json
          panel_key: string
          result_type: string
          rpc_name: string
          rpc_signature: string
          sort_order: number
        }[]
      }
      get_manual_trial_backend_verdict: {
        Args: { p_manual_session_id: string }
        Returns: {
          action_log_id: string
          attempt_id: string
          backend_replay_summary_json: Json
          failure_reason_helper_text: string
          failure_reason_key: string
          failure_reason_label: string
          game_report_id: string
          hero_id: string
          manual_session_id: string
          minigame_key: string
          outcome_key: string
          performance_rating: string
          player_report_summary_json: Json
          resolution_mode_key: string
          resolved_at: string
          reward_grant_id: string
          reward_summary_json: Json
          score: number
          server_id: string
          trial_definition_id: string
          validation_reason_key: string
          validation_reason_label: string
          validation_reason_severity: string
          validation_warnings_json: Json
          verdict_id: string
        }[]
      }
      get_manual_trial_backend_verdict_for_attempt: {
        Args: { p_attempt_id: string }
        Returns: {
          action_log_id: string
          attempt_id: string
          backend_replay_summary_json: Json
          failure_reason_helper_text: string
          failure_reason_key: string
          failure_reason_label: string
          game_report_id: string
          hero_id: string
          manual_session_id: string
          minigame_key: string
          outcome_key: string
          performance_rating: string
          player_report_summary_json: Json
          resolution_mode_key: string
          resolved_at: string
          reward_grant_id: string
          reward_summary_json: Json
          score: number
          server_id: string
          trial_definition_id: string
          validation_reason_key: string
          validation_reason_label: string
          validation_reason_severity: string
          validation_warnings_json: Json
          verdict_id: string
        }[]
      }
      get_manual_trial_runtime_manifest: {
        Args: { p_manual_session_id: string }
        Returns: {
          accessibility_policy_json: Json
          attempt_id: string
          hero_id: string
          inactivity_policy_json: Json
          manifest_expires_at: string
          manifest_hash: string
          manifest_id: string
          manifest_status_key: string
          manifest_version: number
          manual_session_id: string
          minigame_config_json: Json
          minigame_key: string
          player_manifest_json: Json
          report_policy_json: Json
          server_id: string
          session_expires_at: string
          session_status_key: string
          started_at: string
          timing_policy_json: Json
          trial_definition_id: string
        }[]
      }
      get_my_notification_unread_count: {
        Args: { p_hero_id?: string; p_server_id?: string }
        Returns: number
      }
      get_my_notifications: {
        Args: {
          p_hero_id?: string
          p_include_dismissed?: boolean
          p_limit?: number
          p_offset?: number
          p_server_id?: string
          p_unread_only?: boolean
        }
        Returns: {
          action_label: string
          action_url: string
          actor_hero_id: string
          body: string
          created_at: string
          default_toast_enabled: boolean
          dismissed_at: string
          is_dismissed: boolean
          is_unread: boolean
          notification_id: string
          notification_type_category: string
          notification_type_helper_text: string
          notification_type_key: string
          notification_type_label: string
          read_at: string
          recipient_hero_id: string
          recipient_kind: Database["public"]["Enums"]["notification_recipient_kind"]
          server_id: string
          severity: Database["public"]["Enums"]["notification_severity"]
          source_entity_id: string
          source_entity_type: string
          title: string
        }[]
      }
      get_my_pvp_attack_result: {
        Args: { p_attack_result_id: string; p_hero_id: string }
        Returns: {
          attack_result_id: string
          attacker_hero_id: string
          attacker_level_snapshot: number
          combat_outcome: Database["public"]["Enums"]["combat_outcome"]
          combat_result_id: string
          created_at: string
          defender_hero_id: string
          defender_level_snapshot: number
          level_difference: number
          loser_hero_id: string
          metadata_json: Json
          notification_context_json: Json
          outcome_key: string
          outcome_label: string
          prestige_context_json: Json
          pvp_action_id: string
          report_context_json: Json
          resource_outcome_json: Json
          reward_context_json: Json
          server_id: string
          winner_hero_id: string
        }[]
      }
      get_my_pvp_spy_result: {
        Args: { p_hero_id: string; p_spy_result_id: string }
        Returns: {
          base_stats_snapshot_json: Json
          buildings_snapshot_json: Json
          created_at: string
          derived_combat_stats_json: Json
          equipment_snapshot_json: Json
          estate_snapshot_json: Json
          metadata_json: Json
          pvp_action_id: string
          resources_snapshot_json: Json
          result_summary: string
          server_id: string
          spy_hero_id: string
          spy_level_snapshot: number
          spy_result_id: string
          target_address_snapshot: string
          target_display_name_snapshot: string
          target_hero_id: string
          target_level_snapshot: number
          visibility_key: string
        }[]
      }
      get_my_staff_notification_unread_count: {
        Args: { p_server_id: string }
        Returns: number
      }
      get_my_staff_notifications: {
        Args: {
          p_include_dismissed?: boolean
          p_limit?: number
          p_offset?: number
          p_server_id: string
          p_unread_only?: boolean
        }
        Returns: {
          action_label: string
          action_url: string
          actor_hero_id: string
          body: string
          created_at: string
          default_toast_enabled: boolean
          dismissed_at: string
          is_dismissed: boolean
          is_unread: boolean
          notification_id: string
          notification_type_category: string
          notification_type_helper_text: string
          notification_type_key: string
          notification_type_label: string
          read_at: string
          recipient_hero_id: string
          recipient_kind: Database["public"]["Enums"]["notification_recipient_kind"]
          server_id: string
          severity: Database["public"]["Enums"]["notification_severity"]
          source_entity_id: string
          source_entity_type: string
          title: string
        }[]
      }
      get_non_trial_encounter_chance: {
        Args: { p_exploration_id: string }
        Returns: number
      }
      get_notification_hook_diagnostics: {
        Args: never
        Returns: {
          admin_description_pl: string
          admin_label_pl: string
          blocker_help_text_pl: string
          diagnostics_status: string
          diagnostics_status_label_pl: string
          diagnostics_summary_pl: string
          helper_text_pl: string
          inactive_notification_type_keys: string[]
          is_active: boolean
          is_expected: boolean
          is_explicit_non_producer: boolean
          metadata_json: Json
          missing_notification_type_keys: string[]
          missing_producer_function_names: string[]
          notification_type_keys: string[]
          notification_types_json: Json
          producer_function_names: string[]
          producer_functions_json: Json
          producer_key: string
          producer_kind: string
          producer_table_exists: boolean
          producer_table_name: string
          producer_trigger_name: string
          workflow_key: string
        }[]
      }
      get_or_create_active_balance_draft_change_set: {
        Args: { p_reason: string; p_request_id?: string }
        Returns: {
          active_entry_count: number
          applied_at: string
          applied_by: string
          cancelled_at: string
          cancelled_by: string
          cancelled_reason: string
          change_set_id: string
          changelog_body: string
          changelog_title: string
          changelog_visibility: Database["public"]["Enums"]["config_change_visibility"]
          created_at: string
          created_new: boolean
          draft_kind: string
          entry_count: number
          ready_at: string
          ready_by: string
          reason: string
          requested_by: string
          status: Database["public"]["Enums"]["config_change_status"]
          title: string
          updated_at: string
        }[]
      }
      get_player_armory_availability_options_json: {
        Args: never
        Returns: Json
      }
      get_player_armory_copy_json: { Args: never; Returns: Json }
      get_player_armory_page_context: {
        Args: { p_hero_id: string }
        Returns: Json
      }
      get_player_attributes_page_context: {
        Args: { p_hero_id: string }
        Returns: Json
      }
      get_player_dashboard_copy_json: { Args: never; Returns: Json }
      get_player_dashboard_page_context: {
        Args: { p_hero_id: string }
        Returns: Json
      }
      get_player_equipment_preview_copy_json: { Args: never; Returns: Json }
      get_player_estate_building_progression_preview_context: {
        Args: {
          p_building_id: string
          p_from_level?: number
          p_hero_id: string
          p_to_level?: number
        }
        Returns: Json
      }
      get_player_estate_copy_json: { Args: never; Returns: Json }
      get_player_estate_page_context: {
        Args: { p_hero_id: string }
        Returns: Json
      }
      get_player_item_popover_detail_raw_v1: {
        Args: { p_context?: string; p_hero_id: string; p_item_id: string }
        Returns: Json
      }
      get_player_page_hero_guard: {
        Args: { p_hero_id: string; p_operation?: string }
        Returns: {
          character_points: number
          created_at: string | null
          estate_id: string | null
          experience: number | null
          id: string
          level: number | null
          name: string
          origin_id: string | null
          profile_picture: string | null
          rank: number | null
          server_id: string
          total_character_points_earned: number
          total_experience_earned: number
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "hero"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_player_trade_page_context: {
        Args: { p_hero_id: string; p_limit?: number; p_offset?: number }
        Returns: Json
      }
      get_player_vicinity_copy_json: { Args: never; Returns: Json }
      get_player_vicinity_page_context: {
        Args: { p_hero_id: string }
        Returns: Json
      }
      get_public_game_report_by_token: {
        Args: { p_public_token: string }
        Returns: {
          combat_section_json: Json
          created_at: string
          effect_section_json: Json
          encounter_section_json: Json
          item_references_json: Json
          participants_json: Json
          public_token: string
          related_reports_json: Json
          report_type_description: string
          report_type_key: string
          report_type_label: string
          reward_section_json: Json
          source_entity_type: Database["public"]["Enums"]["game_report_source_entity_type"]
          source_label: string
          spy_section_json: Json
          summary: string
          title: string
          trial_section_json: Json
        }[]
      }
      get_public_report_detail: {
        Args: { p_public_token: string }
        Returns: Json
      }
      get_pvp_prestige_delta_matrix_entry: {
        Args: {
          p_actor_role: string
          p_band_key: string
          p_combat_outcome: Database["public"]["Enums"]["combat_outcome"]
        }
        Returns: {
          actor_role: string
          admin_description: string
          band_key: string
          band_label: string
          combat_outcome: Database["public"]["Enums"]["combat_outcome"]
          description: string
          label: string
          message_direction: string
          message_kind: string
          metadata_json: Json
          player_message: string
          points_delta: number
        }[]
      }
      get_pvp_target_candidates: {
        Args: {
          p_attacker_hero_id: string
          p_district_code?: string
          p_limit?: number
          p_offset?: number
          p_search?: string
        }
        Returns: {
          attack_block_reason: string
          attack_max_target_level: number
          attack_min_target_level: number
          attack_travel_time_seconds: number
          attacker_has_blocking_activity: boolean
          can_attack: boolean
          can_spy: boolean
          distance_score: number
          protection_expires_at: string
          spy_block_reason: string
          spy_travel_time_seconds: number
          target_address: string
          target_address_number: number
          target_display_name: string
          target_district_code: string
          target_estate_id: string
          target_estate_rank: number
          target_hero_id: string
          target_level: number
          under_protection: boolean
        }[]
      }
      get_pvp_visible_address_target_overlay: {
        Args: {
          p_attacker_hero_id: string
          p_district_code: string
          p_from_address_number: number
          p_to_address_number: number
        }
        Returns: {
          attack_block_reason: string
          attack_max_target_level: number
          attack_min_target_level: number
          attack_travel_time_seconds: number
          attacker_has_blocking_activity: boolean
          can_attack: boolean
          can_spy: boolean
          distance_score: number
          protection_expires_at: string
          spy_block_reason: string
          spy_travel_time_seconds: number
          target_address: string
          target_address_number: number
          target_display_name: string
          target_district_code: string
          target_estate_id: string
          target_estate_rank: number
          target_guild_display_label: string
          target_guild_id: string
          target_guild_name: string
          target_guild_tag: string
          target_hero_id: string
          target_level: number
          under_protection: boolean
        }[]
      }
      get_report_detail: {
        Args: { p_hero_id: string; p_report_id: string }
        Returns: Json
      }
      get_report_list_page: {
        Args: {
          p_hero_id: string
          p_limit?: number
          p_offset?: number
          p_report_type_key?: string
          p_unread_only?: boolean
        }
        Returns: Json
      }
      get_report_page_copy: { Args: never; Returns: Json }
      get_required_global_integer_config_value: {
        Args: { p_key: string }
        Returns: number
      }
      get_requirement_impact_preview: {
        Args: {
          p_entity_id?: string
          p_entity_type?: Database["public"]["Enums"]["requirement_entity_type"]
        }
        Returns: {
          applies_from_level: number
          context: string
          description: string
          entity_id: string
          entity_requirement_id: string
          entity_type: Database["public"]["Enums"]["requirement_entity_type"]
          explanation: string
          is_active: boolean
          required_building_key: string
          required_district_code: string
          required_resource_type: string
          required_stat_key: string
          required_value_boolean: boolean
          required_value_decimal: number
          required_value_integer: number
          required_value_text: string
          requirement_admin_description: string
          requirement_category: string
          requirement_definition_key: string
          requirement_description: string
          requirement_helper_text: string
          requirement_label: string
          requirement_value_type: Database["public"]["Enums"]["requirement_value_type"]
          resolved_value_label: string
          sort_order: number
        }[]
      }
      get_reward_item_affix_chance_luck_preview: {
        Args: {
          p_affix_kind: string
          p_luck_value?: number
          p_metadata_json?: Json
        }
        Returns: {
          affix_kind: string
          base_chance: number
          final_chance: number
          formula_expression: string
          formula_key: string
          luck_influence: number
          luck_value: number
        }[]
      }
      get_scrapped_affix_item_retention_days: { Args: never; Returns: number }
      get_server_config_boolean: {
        Args: { p_config_key: string; p_fallback: boolean; p_server_id: string }
        Returns: boolean
      }
      get_server_config_integer: {
        Args: { p_config_key: string; p_fallback: number; p_server_id: string }
        Returns: number
      }
      get_server_config_numeric: {
        Args: { p_config_key: string; p_fallback: number; p_server_id: string }
        Returns: number
      }
      get_server_event_admin_definitions: {
        Args: { p_server_id: string }
        Returns: {
          active_run_count: number
          admin_notes: string
          default_duration_days: number
          definition_id: string
          effect_explanation: string
          effects_json: Json
          event_polarity: string
          helper_text: string
          is_active: boolean
          key: string
          lore_description: string
          lore_name: string
          metadata_json: Json
          player_summary: string
          sort_order: number
        }[]
      }
      get_server_event_admin_overview: {
        Args: { p_server_id: string }
        Returns: {
          active_event_json: Json
          config_json: Json
          definition_counts_json: Json
          generated_at: string
          run_counts_json: Json
          server_id: string
        }[]
      }
      get_server_event_admin_runs: {
        Args: { p_limit?: number; p_offset?: number; p_server_id: string }
        Returns: {
          actual_ended_at: string
          created_at: string
          created_by: string
          definition_id: string
          definition_key: string
          ends_at: string
          lore_name: string
          metadata_json: Json
          request_id: string
          run_id: string
          server_id: string
          source_kind: string
          starts_at: string
          status: string
          updated_at: string
        }[]
      }
      get_server_event_config: {
        Args: { p_server_id: string }
        Returns: {
          config_source: string
          cooldown_days: number
          default_duration_days: number
          future_council_activation_days_after_vote: number
          future_council_activation_rule: string
          future_council_activation_weekday: number
          future_council_proposal_count: number
          future_council_vote_duration_days: number
          server_id: string
          system_roll_chance_percent: number
          system_roll_enabled: boolean
        }[]
      }
      get_server_event_roll_status: {
        Args: { p_now?: string; p_server_id: string }
        Returns: {
          cooldown_days: number
          cooldown_ends_at: string
          default_duration_days: number
          eligible: boolean
          has_active_event: boolean
          last_event_ended_at: string
          reason: string
          server_id: string
          system_roll_chance_percent: number
          system_roll_enabled: boolean
        }[]
      }
      get_start_flow_origin_options: {
        Args: never
        Returns: {
          bonus_summary_text: string
          bonuses_json: Json
          is_active: boolean
          origin_description: string
          origin_id: string
          origin_key: string
          origin_label: string
          sort_order: number
        }[]
      }
      get_start_flow_server_availability: {
        Args: never
        Returns: {
          block_reason: string
          can_create_hero: boolean
          can_enter_game: boolean
          default_hero_id: string
          default_hero_name: string
          description: string
          district_a_capacity: number
          district_a_free: number
          district_a_occupied: number
          eligibility_json: Json
          heroes_json: Json
          is_district_a_full: boolean
          is_sandbox: boolean
          is_server_full: boolean
          is_staff_context: boolean
          is_standard: boolean
          is_visible: boolean
          membership_status: string
          next_action: string
          server_id: string
          server_key: string
          server_kind: string
          server_name: string
          server_status: string
          user_hero_count: number
        }[]
      }
      get_start_flow_server_create_eligibility: {
        Args: { p_server_id: string; p_user_id: string }
        Returns: {
          block_reason: string
          can_create_hero: boolean
          can_enter_game: boolean
          district_a_capacity: number
          district_a_free: number
          district_a_occupied: number
          eligibility_json: Json
          is_district_a_full: boolean
          is_sandbox: boolean
          is_staff_context: boolean
          is_standard: boolean
          is_visible: boolean
          membership_status: string
          next_action: string
          server_id: string
          server_key: string
          server_kind: string
          server_name: string
          server_status: string
          user_hero_count: number
        }[]
      }
      get_stat_label: {
        Args: {
          p_fallback_label?: string
          p_locale_key?: string
          p_stat_key: string
        }
        Returns: string
      }
      get_trade_create_context: {
        Args: {
          p_hero_id: string
          p_limit?: number
          p_offset?: number
          p_target_hero_id?: string
        }
        Returns: Json
      }
      get_trade_create_context_raw_v1: {
        Args: {
          p_hero_id: string
          p_limit?: number
          p_offset?: number
          p_target_hero_id?: string
        }
        Returns: Json
      }
      get_trade_item_similarity_price_stats: {
        Args: {
          p_lookback_days?: number
          p_sample_size?: number
          p_transaction_item_id: string
        }
        Returns: {
          average_price: number
          max_price: number
          median_price: number
          min_price: number
          similar_count: number
        }[]
      }
      get_trade_offers_page: {
        Args: { p_hero_id: string; p_limit?: number; p_offset?: number }
        Returns: Json
      }
      get_trade_page_context: { Args: { p_hero_id: string }; Returns: Json }
      get_trade_page_context_raw_v1: {
        Args: { p_hero_id: string }
        Returns: Json
      }
      get_trade_page_copy: { Args: never; Returns: Json }
      get_trade_transaction_item_character_points_price: {
        Args: { p_transaction_item_id: string }
        Returns: number
      }
      get_trial_auto_resolve_cap_percent: {
        Args: { p_difficulty_key: string; p_district_code: string }
        Returns: number
      }
      get_trial_combat_opponent_difficulty_adjustment: {
        Args: { p_trial_power: number }
        Returns: number
      }
      get_trial_definition_readiness: {
        Args: { p_trial_definition_id?: string }
        Returns: {
          blocking_reason_count: number
          combat_candidate_count: number
          definition_id: string
          definition_key: string
          definition_kind: string
          effect_payload_count: number
          encounter_kind: string
          is_active: boolean
          is_ready: boolean
          metadata_json: Json
          minigame_key: string
          reasons_json: Json
          reward_assignment_count: number
        }[]
      }
      get_trial_manifestation_chance: {
        Args: { p_exploration_id: string; p_trial_definition_id: string }
        Returns: number
      }
      get_trial_opportunity_chance: {
        Args: { p_exploration_id: string }
        Returns: number
      }
      get_ui_metadata_entries: {
        Args: {
          p_include_inactive?: boolean
          p_keys?: string[]
          p_namespace?: string
        }
        Returns: {
          created_at: string
          description: string | null
          helper_text: string | null
          id: string
          impact_summary: string | null
          is_active: boolean
          key: string
          label: string
          metadata_json: Json
          namespace: string
          sort_order: number
          ui_group_key: string | null
          ui_group_label: string | null
          updated_at: string
          warning_text: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "ui_metadata_entries"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_vendor_scrap_drachma_payout_percent: { Args: never; Returns: number }
      get_visible_moderation_actions: {
        Args: {
          p_server_id: string
          p_target_hero_id?: string
          p_target_user_id?: string
        }
        Returns: {
          action_type_key: string
          created_at: string
          created_by_user_id: string | null
          expires_at: string | null
          id: string
          is_staff_disqualifying: boolean
          metadata_json: Json
          operator_notes: string | null
          player_visible_note: string | null
          reason: string
          resolved_at: string | null
          resolved_by_user_id: string | null
          scope_key: string | null
          server_id: string
          source_entity_id: string | null
          source_entity_type: string | null
          source_snapshot_id: string | null
          starts_at: string
          status: Database["public"]["Enums"]["moderation_action_status"]
          status_reason: string | null
          target_hero_id: string | null
          target_user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "moderation_actions"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      grant_hero_experience: {
        Args: {
          p_experience_amount: number
          p_hero_id: string
          p_metadata_json?: Json
          p_reason: string
          p_request_id?: string
          p_source_id: string
          p_source_kind: string
        }
        Returns: {
          character_points_balance_after: number
          character_points_gross_gained: number
          experience_after: number
          experience_before: number
          experience_gained: number
          hero_id: string
          level_after: number
          level_before: number
          levels_gained: number
          progression_ledger_id: string
          reached_levels_json: Json
          server_id: string
          total_experience_earned_after: number
          total_experience_earned_before: number
        }[]
      }
      grant_level_up_reward_to_hero: {
        Args: {
          p_hero_id: string
          p_level_up_ledger_id: string
          p_metadata_json?: Json
          p_reason?: string
          p_request_id?: string
        }
        Returns: {
          assignment_id: string
          entries_json: Json
          hero_id: string
          level_up_ledger_id: string
          matched: boolean
          reached_level: number
          reward_grant_id: string
          reward_profile_id: string
        }[]
      }
      grant_pvp_xp_reward_to_hero: {
        Args: {
          p_assignment_id: string
          p_opponent_hero_id: string
          p_outcome_multiplier: number
          p_pvp_attack_result_id: string
          p_recipient_hero_id: string
          p_recipient_role: string
          p_request_id?: string
          p_reward_profile_id: string
        }
        Returns: Json
      }
      grant_reward_profile_to_hero: {
        Args: {
          p_metadata_json?: Json
          p_reason: string
          p_recipient_hero_id: string
          p_request_id?: string
          p_reward_profile_id: string
          p_source_id: string
          p_source_kind: string
        }
        Returns: {
          entries_json: Json
          recipient_hero_id: string
          reward_grant_id: string
          reward_profile_id: string
          status: string
        }[]
      }
      guild_member_has_armory_access: {
        Args: { p_guild_id: string; p_member_hero_id: string }
        Returns: boolean
      }
      has_global_role: { Args: { required_keys: string[] }; Returns: boolean }
      has_server_staff_role: {
        Args: {
          required_roles: Database["public"]["Enums"]["server_staff_role"][]
          target_server_id: string
        }
        Returns: boolean
      }
      hero_can_use_normal_gameplay: {
        Args: { p_hero_id: string }
        Returns: boolean
      }
      hero_can_use_player_trade: {
        Args: { p_hero_id: string }
        Returns: boolean
      }
      hero_has_active_auction_restriction: {
        Args: { p_hero_id: string }
        Returns: boolean
      }
      hero_has_active_moderation_action: {
        Args: { p_action_type_key: string; p_hero_id: string }
        Returns: boolean
      }
      hero_has_active_server_play_block: {
        Args: { p_hero_id: string }
        Returns: boolean
      }
      hero_has_active_trade_restriction: {
        Args: { p_hero_id: string }
        Returns: boolean
      }
      hero_has_blocking_runtime_activity: {
        Args: { p_hero_id: string }
        Returns: boolean
      }
      hero_has_free_trade_slot: {
        Args: { p_hero_id: string }
        Returns: boolean
      }
      hero_is_staff_gameplay_blocked: {
        Args: { p_hero_id: string }
        Returns: boolean
      }
      hero_is_staff_on_server: { Args: { p_hero_id: string }; Returns: boolean }
      hero_stat_label_pl: {
        Args: { p_fallback_label?: string; p_stat_key: string }
        Returns: string
      }
      insert_identity_anti_abuse_signal: {
        Args: {
          p_actor_hero_id?: string
          p_actor_user_id?: string
          p_confidence?: number
          p_description: string
          p_entity_id?: string
          p_entity_type_key?: string
          p_grouping_key?: string
          p_metadata_json?: Json
          p_reason: string
          p_score?: number
          p_server_id: string
          p_signal_type_key: string
          p_target_hero_id?: string
          p_target_user_id?: string
          p_title: string
        }
        Returns: string
      }
      insert_trade_transaction_anti_abuse_signal: {
        Args: {
          p_actor_hero_id: string
          p_confidence?: number
          p_description: string
          p_grouping_key: string
          p_metadata_json?: Json
          p_reason: string
          p_score?: number
          p_signal_type_key: string
          p_target_hero_id: string
          p_title: string
          p_transaction_id: string
        }
        Returns: string
      }
      inspect_pvp_foundation_integration_state: {
        Args: { p_server_id?: string }
        Returns: Json
      }
      internal_resolve_combat_from_trusted_snapshots: {
        Args: {
          p_defender_json: Json
          p_initiator_json: Json
          p_reason?: string
          p_request_id?: string
          p_server_id: string
          p_source_type: Database["public"]["Enums"]["combat_source_type"]
          p_timing_hits_json?: Json
        }
        Returns: {
          attacks_json: Json
          outcome: Database["public"]["Enums"]["combat_outcome"]
          participants_json: Json
          resolver_metadata_json: Json
          turns_completed: number
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      is_building_available_in_district: {
        Args: { p_building_id: string; p_district_code: string }
        Returns: boolean
      }
      is_item_generation_affix_allowed_for_base_type: {
        Args: { p_affix_id: string; p_base_type_key: string }
        Returns: boolean
      }
      item_detail_popover_current_display_text: {
        Args: { p_value: string }
        Returns: string
      }
      item_popover_copy: { Args: never; Returns: Json }
      item_popover_detail: {
        Args: {
          p_context?: string
          p_hero_id?: string
          p_item_id?: string
          p_item_reference_id?: string
          p_public_token?: string
        }
        Returns: Json
      }
      kick_guild_member: {
        Args: {
          p_actor_hero_id: string
          p_reason?: string
          p_request_id?: string
          p_target_hero_id: string
        }
        Returns: {
          actor_hero_id: string
          audit_log_id: string
          ended_at: string
          guild_id: string
          old_role_key: string
          status_key: string
          target_hero_id: string
          target_membership_id: string
        }[]
      }
      leave_guild: {
        Args: {
          p_actor_hero_id: string
          p_reason?: string
          p_request_id?: string
        }
        Returns: {
          actor_hero_id: string
          audit_log_id: string
          ended_at: string
          guild_id: string
          membership_id: string
          old_role_key: string
          status_key: string
        }[]
      }
      level_up_stat_bonus_rule_matches: {
        Args: {
          p_level_interval: number
          p_level_value: number
          p_match_kind: string
          p_max_level_value: number
          p_reached_level: number
        }
        Returns: boolean
      }
      manual_start_server_event: {
        Args: {
          p_definition_id: string
          p_duration_days?: number
          p_reason?: string
          p_request_id?: string
          p_server_id: string
          p_starts_at?: string
        }
        Returns: {
          actual_ended_at: string | null
          created_at: string
          created_by: string | null
          definition_id: string
          ends_at: string
          id: string
          metadata_json: Json
          request_id: string | null
          server_id: string
          source_kind: string
          starts_at: string
          status: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "server_event_runs"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      mark_combat_live_session_completed_if_terminal: {
        Args: {
          p_force_draw?: boolean
          p_request_id?: string
          p_session_id: string
        }
        Returns: boolean
      }
      mark_config_change_set_ready: {
        Args: { p_change_set_id: string }
        Returns: {
          applied_at: string | null
          applied_by: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          cancelled_reason: string | null
          changelog_body: string | null
          changelog_title: string | null
          changelog_visibility: Database["public"]["Enums"]["config_change_visibility"]
          created_at: string
          draft_kind: string | null
          id: string
          ready_at: string | null
          ready_by: string | null
          reason: string
          requested_by: string | null
          status: Database["public"]["Enums"]["config_change_status"]
          title: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "config_change_sets"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      mark_game_report_read: {
        Args: { p_hero_id: string; p_report_id: string }
        Returns: {
          access_role: Database["public"]["Enums"]["game_report_access_role"]
          created_at: string
          hero_id: string
          id: string
          read_at: string | null
          report_id: string
        }
        SetofOptions: {
          from: "*"
          to: "game_report_hero_access"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      mark_notification_read: {
        Args: { p_notification_id: string }
        Returns: {
          action_label: string | null
          action_url: string | null
          actor_hero_id: string | null
          actor_user_id: string | null
          body: string | null
          created_at: string
          dismissed_at: string | null
          id: string
          notification_type_key: string
          read_at: string | null
          recipient_hero_id: string | null
          recipient_kind: Database["public"]["Enums"]["notification_recipient_kind"]
          recipient_user_id: string
          server_id: string | null
          severity: Database["public"]["Enums"]["notification_severity"]
          source_entity_id: string | null
          source_entity_type: string | null
          title: string
        }
        SetofOptions: {
          from: "*"
          to: "notifications"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      mark_report_read: {
        Args: { p_hero_id: string; p_report_id: string }
        Returns: Json
      }
      materialize_hero_resource: {
        Args: {
          p_as_of?: string
          p_hero_id: string
          p_reason?: string
          p_related_entity_id?: string
          p_related_entity_type?: string
          p_resource_type: string
        }
        Returns: {
          accrued_amount: number
          amount_after: number
          amount_before: number
          hero_id: string
          ledger_id: string
          materialized_from: string
          materialized_until: string
          per_hour: number
          resource_id: string
          resource_type: string
          server_id: string
        }[]
      }
      materialize_hero_resources: {
        Args: {
          p_as_of?: string
          p_hero_id: string
          p_reason?: string
          p_related_entity_id?: string
          p_related_entity_type?: string
        }
        Returns: {
          accrued_amount: number
          amount_after: number
          amount_before: number
          hero_id: string
          ledger_id: string
          materialized_from: string
          materialized_until: string
          per_hour: number
          resource_id: string
          resource_type: string
          server_id: string
        }[]
      }
      maybe_create_automatic_moderation_escalation: {
        Args: {
          p_action: Database["public"]["Tables"]["moderation_actions"]["Row"]
        }
        Returns: undefined
      }
      move_hero_armory_item_to_shelf: {
        Args: {
          p_hero_id: string
          p_item_id: string
          p_target_shelf_position: number
        }
        Returns: {
          armory_state_json: Json
          hero_id: string
          is_visible: boolean
          item_id: string
          item_status: Database["public"]["Enums"]["item_status"]
          operation: string
          previous_shelf_position: number
          server_id: string
          shelf_name: string
          target_shelf_position: number
          visibility_index: number
          visibility_limit: number
          visible_items_json: Json
        }[]
      }
      nominate_guild_emergency_leader_candidate: {
        Args: {
          p_actor_hero_id: string
          p_candidate_hero_id: string
          p_election_id: string
          p_reason?: string
          p_request_id?: string
        }
        Returns: {
          audit_log_id: string
          candidate_hero_id: string
          election_id: string
          guild_id: string
          max_candidates: number
          nominated_by_hero_id: string
          nomination_count: number
          nomination_id: string
        }[]
      }
      normalize_attack_plan_damage_payload: {
        Args: { p_payload: Json }
        Returns: Json
      }
      normalize_attack_plan_damage_row: { Args: { p_row: Json }; Returns: Json }
      normalize_combat_stat_rows_display_contract: {
        Args: { p_rows_json: Json }
        Returns: Json
      }
      normalize_damage_pair_jsonb: {
        Args: { p_max_key?: string; p_min_key?: string; p_pair: Json }
        Returns: Json
      }
      normalize_hero_attack_plan_dashboard_source_rows: {
        Args: { p_payload: Json }
        Returns: Json
      }
      normalize_item_detail_popover_item_detail_current_text: {
        Args: { p_item_detail: Json }
        Returns: Json
      }
      normalize_item_detail_popover_requirement_row_current_text: {
        Args: { p_requirement_row: Json }
        Returns: Json
      }
      normalize_item_detail_popover_requirement_rows_current_text: {
        Args: { p_requirement_rows: Json }
        Returns: Json
      }
      normalize_locale_key: { Args: { p_locale_key: string }; Returns: string }
      parse_estate_address_number: {
        Args: { p_address: string; p_district_code: string }
        Returns: number
      }
      parse_item_generation_affix_allowed_targets_json: {
        Args: { p_allowed_targets_json: Json }
        Returns: {
          target_key: string
          target_kind: string
        }[]
      }
      persist_combat_result_snapshot: {
        Args: {
          p_attacks_json?: Json
          p_completed_at?: string
          p_outcome?: Database["public"]["Enums"]["combat_outcome"]
          p_participants_json?: Json
          p_reason?: string
          p_request_id?: string
          p_server_id: string
          p_source_entity_id?: string
          p_source_type: Database["public"]["Enums"]["combat_source_type"]
          p_started_at?: string
          p_turns_completed?: number
        }
        Returns: {
          attacks_created: number
          audit_log_id: string
          combat_result_id: string
          outcome: Database["public"]["Enums"]["combat_outcome"]
          participant_stats_created: number
          participants_created: number
          server_id: string
          source_entity_id: string
          source_type: Database["public"]["Enums"]["combat_source_type"]
        }[]
      }
      persist_completed_combat_live_session_result: {
        Args: { p_request_id?: string; p_session_id: string }
        Returns: {
          attacks_created: number
          combat_result_id: string
          combat_session_id: string
          outcome: Database["public"]["Enums"]["combat_outcome"]
          participant_stats_created: number
          participants_created: number
          source_entity_id: string
          source_type: Database["public"]["Enums"]["combat_source_type"]
        }[]
      }
      pick_exploration_combat_live_opponent: {
        Args: { p_challenge_attempt_id: string }
        Returns: {
          candidate_id: string
          candidate_source: string
          difficulty_multiplier: number
          opponent_definition_id: string
        }[]
      }
      pick_exploration_node_exit_count: {
        Args: { p_exploration_id: string; p_node_id: string }
        Returns: number
      }
      pick_item_generation_affix_for_base_type: {
        Args: {
          p_affix_kind: string
          p_base_type_key: string
          p_max_gold_value?: number
        }
        Returns: {
          created_at: string
          description: string | null
          display_forms_json: Json
          gold_value: number
          id: string
          is_legacy: boolean
          key: string
          kind: string
          name: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "item_generation_affixes"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      pick_random_encounter_definition: {
        Args: { p_exploration_id: string }
        Returns: {
          admin_description: string | null
          created_at: string
          description: string
          encounter_kind: string
          helper_text: string | null
          id: string
          is_active: boolean
          key: string
          label: string
          max_difficulty_key: string | null
          max_district_code: string | null
          metadata_json: Json
          min_difficulty_key: string | null
          min_district_code: string | null
          minigame_key: string | null
          reward_profile_id: string | null
          sort_order: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "encounter_definitions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      pick_random_trial_definition: {
        Args: never
        Returns: {
          admin_description: string | null
          created_at: string
          description: string
          helper_text: string | null
          id: string
          is_active: boolean
          key: string
          label: string
          metadata_json: Json
          minigame_key: string
          sort_order: number
          tested_stat_key: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "trial_definitions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      pick_reward_item_quality_key: {
        Args: { p_max_quality_key?: string }
        Returns: string
      }
      pick_reward_item_quality_luck_preview: {
        Args: {
          p_luck_value?: number
          p_max_quality_key?: string
          p_metadata_json?: Json
        }
        Returns: {
          adjusted_weight: number
          base_weight: number
          formula_expression: string
          formula_key: string
          luck_influence: number
          luck_value: number
          quality_key: string
          quality_label: string
          quality_multiplier: number
          quality_sort_order: number
          roll_score: number
        }[]
      }
      place_player_auction_bid: {
        Args: {
          p_amount_character_points: number
          p_auction_listing_id: string
          p_bidder_hero_id: string
        }
        Returns: string
      }
      player_armory_allowed_slot_label_pl: {
        Args: { p_allowed_slot_keys_json: Json }
        Returns: string
      }
      player_armory_allowed_slot_labels_json: {
        Args: { p_allowed_slot_keys_json: Json }
        Returns: Json
      }
      player_armory_hand_usage_label_pl: {
        Args: { p_hand_usage_key: string }
        Returns: string
      }
      player_armory_item_lifecycle_label_pl: {
        Args: { p_status_key: string }
        Returns: string
      }
      player_armory_item_type_label_pl: {
        Args: { p_base_type_key: string }
        Returns: string
      }
      player_armory_quality_label_pl: {
        Args: { p_quality_key: string }
        Returns: string
      }
      player_armory_slot_compatibility_label_pl: {
        Args: { p_allowed_slot_keys_json: Json }
        Returns: string
      }
      player_armory_slot_label_pl: {
        Args: { p_slot_key: string }
        Returns: string
      }
      player_armory_text_pl: {
        Args: { p_field_key?: string; p_value: string }
        Returns: string
      }
      player_derived_stat_label: {
        Args: {
          p_fallback_label?: string
          p_locale_key?: string
          p_stat_key: string
        }
        Returns: string
      }
      player_estate_bonus_display_label: {
        Args: {
          p_scope_key?: string
          p_target_key: string
          p_target_label: string
        }
        Returns: string
      }
      player_estate_bonus_display_value: {
        Args: {
          p_display_mode?: string
          p_scope_key?: string
          p_target_key: string
          p_target_label?: string
          p_type_key: string
          p_value: number
        }
        Returns: string
      }
      player_estate_building_sort_order: {
        Args: {
          p_building_key: string
          p_building_name: string
          p_fallback_sort_order?: number
        }
        Returns: number
      }
      player_estate_district_label: {
        Args: { p_district_code: string }
        Returns: string
      }
      player_item_display_icon_key: {
        Args: {
          p_base_key: string
          p_base_type_key: string
          p_equipment_area: string
          p_hand_usage_key: string
          p_primary_slot_key: string
        }
        Returns: string
      }
      prestige_rank_label_pl: {
        Args: { p_rank_number: number }
        Returns: string
      }
      preview_challenge_auto_resolve_success_chance: {
        Args: {
          p_difficulty_key?: string
          p_luck_value?: number
          p_spirituality_value?: number
          p_tested_stat_key?: string
          p_tested_stat_value?: number
        }
        Returns: {
          auto_resolve_penalty: number
          cap_percent: number
          difficulty_key: string
          difficulty_label: string
          difficulty_multiplier: number
          explanation: string
          final_auto_resolve_success_chance: number
          formula_expression: string
          formula_key: string
          luck_influence: number
          luck_value: number
          manual_chance_reference: number
          raw_auto_resolve_success_chance: number
          spirituality_value: number
          tested_stat_key: string
          tested_stat_value: number
          trial_power: number
        }[]
      }
      preview_challenge_auto_resolve_success_chance_for_district: {
        Args: {
          p_difficulty_key?: string
          p_district_code?: string
          p_luck_value?: number
          p_spirituality_value?: number
          p_tested_stat_key?: string
          p_tested_stat_value?: number
        }
        Returns: {
          auto_resolve_penalty: number
          cap_percent: number
          difficulty_key: string
          difficulty_label: string
          difficulty_multiplier: number
          explanation: string
          final_auto_resolve_success_chance: number
          formula_expression: string
          formula_key: string
          luck_influence: number
          luck_value: number
          manual_chance_reference: number
          raw_auto_resolve_success_chance: number
          spirituality_value: number
          tested_stat_key: string
          tested_stat_value: number
          trial_power: number
        }[]
      }
      preview_challenge_auto_resolve_success_chance_for_district_with: {
        Args: {
          p_difficulty_key?: string
          p_district_code?: string
          p_hero_level?: number
          p_luck_value?: number
          p_spirituality_value?: number
          p_stat_cap?: number
          p_tested_stat_key?: string
          p_tested_stat_value?: number
        }
        Returns: {
          auto_resolve_penalty: number
          cap_percent: number
          difficulty_key: string
          difficulty_label: string
          difficulty_multiplier: number
          explanation: string
          final_auto_resolve_success_chance: number
          formula_expression: string
          formula_key: string
          luck_influence: number
          luck_value: number
          manual_chance_reference: number
          raw_auto_resolve_success_chance: number
          spirituality_value: number
          tested_stat_key: string
          tested_stat_value: number
          trial_power: number
        }[]
      }
      preview_combat_luck_formula_context: {
        Args: {
          p_attack_count?: number
          p_attack_index?: number
          p_attacker_cunning?: number
          p_attacker_dexterity?: number
          p_attacker_luck?: number
          p_combatant_agility?: number
          p_combatant_intelligence?: number
          p_crit_bonus_from_items?: number
          p_crit_multiplier?: number
          p_defender_agility?: number
          p_defender_defense?: number
          p_defender_luck?: number
          p_evasion_bonus_from_items?: number
          p_hit_bonus_from_items?: number
          p_rolled_damage?: number
        }
        Returns: {
          attack_count: number
          attack_index: number
          attacker_cunning: number
          attacker_dexterity: number
          attacker_luck: number
          attacker_luck_influence: number
          combatant_agility: number
          combatant_intelligence: number
          crit_bonus_from_items: number
          crit_multiplier: number
          critical_chance: number
          defender_agility: number
          defender_defense: number
          defender_luck: number
          defender_luck_influence: number
          evasion_bonus_from_items: number
          evasion_chance: number
          explanation: string
          final_damage: number
          formulas_json: Json
          hit_bonus_from_items: number
          hit_green_zone: number
          initiative_score: number
          rolled_damage: number
        }[]
      }
      preview_combat_opponent_scaling: {
        Args: {
          p_difficulty_multiplier?: number
          p_levels?: number[]
          p_opponent_definition_id: string
          p_scaling_formula_id?: string
        }
        Returns: {
          base_value: number
          difficulty_multiplier: number
          formula_context_json: Json
          formula_id: string
          formula_key: string
          formula_source: string
          hero_level: number
          opponent_definition_id: string
          opponent_key: string
          opponent_label: string
          scaled_value: number
          stat_key: string
        }[]
      }
      preview_exploration_luck_rng_chain: {
        Args: {
          p_cap_percent?: number
          p_difficulty_key?: string
          p_district_code?: string
          p_dry_step_count?: number
          p_luck_value?: number
          p_spirituality_value?: number
          p_tested_stat_value?: number
        }
        Returns: {
          absolute_encounter_probability: number
          absolute_manifested_trial_probability: number
          absolute_unmanifested_trial_opportunity_probability: number
          difficulty_key: string
          district_code: string
          dry_step_count: number
          encounter_chance_if_no_trial: number
          explanation: string
          formulas_json: Json
          luck_influence: number
          luck_value: number
          non_trial_probability: number
          nothing_probability: number
          spirituality_value: number
          tested_stat_value: number
          trial_manifestation_chance_if_opportunity: number
          trial_opportunity_chance: number
          trial_power: number
        }[]
      }
      preview_hero_loadout_preset: {
        Args: { p_hero_id: string; p_preset_number: number }
        Returns: {
          current_item_name: string
          current_owner_hero_id: string
          hero_id: string
          is_owned_by_hero: boolean
          is_runtime_usable: boolean
          item_status: Database["public"]["Enums"]["item_status"]
          preset_id: string
          preset_number: number
          preview_status: string
          saved_item_id: string
          saved_item_name_snapshot: string
          slot_key: string
          slot_label: string
          slot_sort_order: number
          status_message: string
        }[]
      }
      preview_luck_influence_and_trial_power: {
        Args: { p_luck_value?: number; p_tested_stat_value?: number }
        Returns: {
          explanation: string
          luck_influence: number
          luck_influence_expression: string
          luck_influence_formula_key: string
          luck_value: number
          tested_stat_value: number
          trial_power: number
          trial_power_expression: string
          trial_power_formula_key: string
        }[]
      }
      preview_non_trial_encounter_chance: {
        Args: {
          p_base_chance?: number
          p_difficulty_key?: string
          p_district_code?: string
          p_luck_value?: number
          p_spirituality_value?: number
        }
        Returns: {
          base_chance: number
          cap_percent: number
          difficulty_key: string
          difficulty_label: string
          difficulty_multiplier: number
          district_code: string
          district_modifier: number
          explanation: string
          final_encounter_chance: number
          formula_expression: string
          formula_key: string
          luck_influence: number
          luck_value: number
          raw_encounter_chance: number
          spirituality_value: number
        }[]
      }
      preview_reward_generated_item: {
        Args: {
          p_bucket_profile_id?: string
          p_max_quality_key?: string
          p_preview_count?: number
        }
        Returns: {
          base_id: string
          base_key: string
          base_name: string
          base_type_key: string
          base_value: number
          bucket_index: number
          bucket_profile_id: string
          bucket_profile_key: string
          bucket_profile_name: string
          budget_before_quality_multiplier: number
          drachma_value: number
          explanation: string
          generated_name: string
          prefix_affix_id: string
          prefix_gold_value: number
          prefix_key: string
          prefix_name: string
          preview_index: number
          quality_key: string
          quality_label: string
          quality_multiplier: number
          remaining_budget_after_base: number
          remaining_budget_after_prefix: number
          remaining_budget_after_suffix: number
          rolled_budget: number
          suffix_affix_id: string
          suffix_gold_value: number
          suffix_key: string
          suffix_name: string
        }[]
      }
      preview_reward_generated_item_distribution_luck: {
        Args: {
          p_bucket_profile_id?: string
          p_change_set_id?: string
          p_compare_luck_value?: number
          p_high_value_threshold?: number
          p_luck_value?: number
          p_max_quality_key?: string
          p_roll_count?: number
        }
        Returns: {
          average_delta: number
          average_delta_percent: number
          average_item_value: number
          bucket_distribution_json: Json
          change_set_id: string
          compare_average_item_value: number
          compare_bucket_distribution_json: Json
          compare_high_value_rate: number
          compare_luck_influence: number
          compare_luck_value: number
          compare_max_item_value: number
          compare_median_item_value: number
          compare_min_item_value: number
          compare_outstanding_rate: number
          compare_prefix_hit_rate: number
          compare_quality_distribution_json: Json
          compare_suffix_hit_rate: number
          explanation: string
          formula_context_json: Json
          high_value_rate: number
          high_value_threshold: number
          luck_influence: number
          luck_value: number
          max_item_value: number
          median_item_value: number
          min_item_value: number
          outstanding_rate: number
          prefix_hit_rate: number
          quality_distribution_json: Json
          roll_count: number
          suffix_hit_rate: number
          summary_json: Json
        }[]
      }
      preview_reward_generated_item_luck: {
        Args: {
          p_bucket_profile_id?: string
          p_luck_value?: number
          p_max_quality_key?: string
          p_preview_count?: number
        }
        Returns: {
          base_id: string
          base_key: string
          base_name: string
          base_type_key: string
          base_value: number
          bucket_index: number
          bucket_profile_id: string
          bucket_profile_key: string
          bucket_profile_name: string
          budget_before_quality_multiplier: number
          drachma_value: number
          explanation: string
          formula_context_json: Json
          generated_name: string
          luck_influence: number
          luck_value: number
          prefix_affix_id: string
          prefix_chance: number
          prefix_gold_value: number
          prefix_key: string
          prefix_name: string
          prefix_roll: number
          preview_index: number
          quality_adjusted_weight: number
          quality_base_weight: number
          quality_key: string
          quality_label: string
          quality_multiplier: number
          quality_roll_score: number
          remaining_budget_after_base: number
          remaining_budget_after_prefix: number
          remaining_budget_after_suffix: number
          rolled_budget: number
          suffix_affix_id: string
          suffix_chance: number
          suffix_gold_value: number
          suffix_key: string
          suffix_name: string
          suffix_roll: number
        }[]
      }
      preview_reward_generated_item_luck_with_draft: {
        Args: {
          p_bucket_profile_id?: string
          p_change_set_id?: string
          p_luck_value?: number
          p_max_quality_key?: string
          p_metadata_json?: Json
          p_preview_count?: number
        }
        Returns: {
          base_id: string
          base_key: string
          base_name: string
          base_type_key: string
          base_value: number
          bucket_index: number
          bucket_profile_id: string
          bucket_profile_key: string
          bucket_profile_name: string
          budget_before_quality_multiplier: number
          change_set_id: string
          drachma_value: number
          draft_context_json: Json
          explanation: string
          formula_context_json: Json
          generated_name: string
          luck_influence: number
          luck_value: number
          prefix_affix_id: string
          prefix_chance: number
          prefix_gold_value: number
          prefix_key: string
          prefix_name: string
          prefix_roll: number
          preview_index: number
          quality_adjusted_weight: number
          quality_base_weight: number
          quality_key: string
          quality_label: string
          quality_multiplier: number
          quality_roll_score: number
          range_roll: number
          remaining_budget_after_base: number
          remaining_budget_after_prefix: number
          remaining_budget_after_suffix: number
          rolled_budget: number
          suffix_affix_id: string
          suffix_chance: number
          suffix_gold_value: number
          suffix_key: string
          suffix_name: string
          suffix_roll: number
        }[]
      }
      preview_reward_generated_item_luck_with_draft_core: {
        Args: {
          p_bucket_profile_id?: string
          p_change_set_id?: string
          p_luck_value?: number
          p_max_quality_key?: string
          p_metadata_json?: Json
          p_preview_count?: number
        }
        Returns: {
          base_id: string
          base_key: string
          base_name: string
          base_type_key: string
          base_value: number
          bucket_index: number
          bucket_profile_id: string
          bucket_profile_key: string
          bucket_profile_name: string
          budget_before_quality_multiplier: number
          change_set_id: string
          drachma_value: number
          draft_context_json: Json
          explanation: string
          formula_context_json: Json
          generated_name: string
          luck_influence: number
          luck_value: number
          prefix_affix_id: string
          prefix_chance: number
          prefix_gold_value: number
          prefix_key: string
          prefix_name: string
          prefix_roll: number
          preview_index: number
          quality_adjusted_weight: number
          quality_base_weight: number
          quality_key: string
          quality_label: string
          quality_multiplier: number
          quality_roll_score: number
          range_roll: number
          remaining_budget_after_base: number
          remaining_budget_after_prefix: number
          remaining_budget_after_suffix: number
          rolled_budget: number
          suffix_affix_id: string
          suffix_chance: number
          suffix_gold_value: number
          suffix_key: string
          suffix_name: string
          suffix_roll: number
        }[]
      }
      preview_reward_profile: {
        Args: { p_preview_count?: number; p_reward_profile_id?: string }
        Returns: {
          amount_mode: string
          bucket_profile_id: string
          chance_percent: number
          chance_roll: number
          effect_definition_id: string
          entry_description: string
          entry_id: string
          entry_kind: string
          entry_label: string
          explanation: string
          generated_items_preview_json: Json
          is_included: boolean
          max_item_count: number
          max_quality_key: string
          min_item_count: number
          preview_amount: number
          preview_item_count: number
          preview_run_index: number
          resource_type: string
          reward_profile_description: string
          reward_profile_id: string
          reward_profile_key: string
          reward_profile_label: string
        }[]
      }
      preview_reward_profile_luck: {
        Args: {
          p_luck_value?: number
          p_preview_count?: number
          p_reward_profile_id?: string
          p_spirituality_value?: number
        }
        Returns: {
          amount_mode: string
          bucket_profile_id: string
          chance_percent: number
          chance_roll: number
          effect_definition_id: string
          entry_description: string
          entry_id: string
          entry_kind: string
          entry_label: string
          explanation: string
          formula_context_json: Json
          generated_items_preview_json: Json
          is_included: boolean
          luck_influence: number
          luck_policy_json: Json
          luck_value: number
          max_item_count: number
          max_quality_key: string
          min_item_count: number
          preview_amount: number
          preview_item_count: number
          preview_run_index: number
          resource_type: string
          reward_profile_description: string
          reward_profile_id: string
          reward_profile_key: string
          reward_profile_label: string
          spirituality_value: number
        }[]
      }
      preview_trial_manifestation_chance: {
        Args: {
          p_difficulty_key?: string
          p_district_code?: string
          p_luck_value?: number
          p_spirituality_value?: number
          p_tested_stat_value?: number
          p_trial_definition_id?: string
        }
        Returns: {
          difficulty_key: string
          difficulty_multiplier: number
          district_code: string
          district_modifier: number
          explanation: string
          final_manifestation_chance: number
          formula_expression: string
          formula_key: string
          luck_influence: number
          luck_value: number
          max_manifestation_chance_percent: number
          raw_manifestation_chance: number
          spirituality_value: number
          tested_stat_key: string
          tested_stat_value: number
          trial_definition_id: string
          trial_key: string
          trial_label: string
          trial_power: number
        }[]
      }
      preview_trial_manifestation_chance_with_stat_context: {
        Args: {
          p_difficulty_key?: string
          p_district_code?: string
          p_hero_level?: number
          p_luck_value?: number
          p_spirituality_value?: number
          p_stat_cap?: number
          p_tested_stat_value?: number
          p_trial_definition_id?: string
        }
        Returns: {
          difficulty_key: string
          difficulty_multiplier: number
          district_code: string
          district_modifier: number
          explanation: string
          final_manifestation_chance: number
          formula_expression: string
          formula_key: string
          luck_influence: number
          luck_value: number
          max_manifestation_chance_percent: number
          raw_manifestation_chance: number
          spirituality_value: number
          tested_stat_key: string
          tested_stat_value: number
          trial_definition_id: string
          trial_key: string
          trial_label: string
          trial_power: number
        }[]
      }
      preview_trial_opportunity_curve: {
        Args: {
          p_difficulty_key?: string
          p_luck_value?: number
          p_spirituality_value?: number
          p_starting_dry_step_count?: number
          p_steps_to_preview?: number
        }
        Returns: {
          base_chance: number
          difficulty_key: string
          difficulty_label: string
          difficulty_multiplier: number
          dry_step_count: number
          explanation: string
          formula_expression: string
          formula_key: string
          is_guaranteed_by_step_cap: boolean
          luck_influence: number
          luck_value: number
          per_dry_step_chance: number
          projected_step_number: number
          spirituality_value: number
          trial_opportunity_chance: number
          trial_opportunity_step_cap: number
        }[]
      }
      promote_guild_member_to_officer: {
        Args: {
          p_actor_hero_id: string
          p_reason?: string
          p_request_id?: string
          p_target_hero_id: string
        }
        Returns: {
          actor_hero_id: string
          audit_log_id: string
          guild_id: string
          new_role_key: string
          old_role_key: string
          target_hero_id: string
          target_membership_id: string
        }[]
      }
      purge_expired_anti_abuse_identity_observations: {
        Args: { p_limit?: number }
        Returns: number
      }
      record_anti_abuse_identity_observation: {
        Args: {
          p_capture_source_key?: string
          p_device_token_hash?: string
          p_hero_id?: string
          p_ip_hash?: string
          p_ip_prefix_hash?: string
          p_metadata_json?: Json
          p_observation_source_key?: string
          p_observed_at?: string
          p_retention_until?: string
          p_server_id?: string
          p_source_entity_id?: string
          p_source_entity_type?: string
          p_user_agent_hash?: string
          p_user_id: string
        }
        Returns: string
      }
      recover_scrapped_item: {
        Args: {
          p_item_id: string
          p_reason: string
          p_request_id?: string
          p_target_hero_id: string
        }
        Returns: {
          audit_log_id: string
          item_id: string
          recoverable_until: string
          scrapped_at: string
          status: Database["public"]["Enums"]["item_status"]
        }[]
      }
      refresh_anti_abuse_case_signal_stats: {
        Args: { p_case_id: string }
        Returns: undefined
      }
      refresh_combat_live_hero_participant_snapshot_from_composer: {
        Args: { p_participant_id: string; p_reason?: string }
        Returns: {
          combat_session_id: string
          display_name: string
          hero_id: string
          new_critical_chance: string
          new_defense: string
          new_health_current: number
          new_health_max: number
          new_snapshot_source: string
          new_snapshot_version: string
          old_critical_chance: string
          old_defense: string
          old_health_current: number
          old_health_max: number
          old_snapshot_source: string
          old_snapshot_version: string
          participant_id: string
        }[]
      }
      refresh_combat_live_session_hero_participant_snapshots: {
        Args: { p_reason?: string; p_request_id?: string; p_session_id: string }
        Returns: {
          clamped_participant_count: number
          combat_session_id: string
          refreshed_participant_count: number
          refreshed_participants_json: Json
        }[]
      }
      refresh_hero_resource_production_rates: {
        Args: {
          p_effective_at?: string
          p_hero_id: string
          p_reason?: string
          p_related_entity_id?: string
        }
        Returns: {
          hero_id: string
          new_per_hour: number
          old_per_hour: number
          resource_id: string
          resource_type: string
          server_id: string
          updated_at: string
        }[]
      }
      refresh_pvp_attack_result_prestige_context: {
        Args: { p_pvp_attack_result_id: string; p_reason?: string }
        Returns: {
          attacker_estate_id: string | null
          attacker_hero_id: string
          attacker_level_snapshot: number
          combat_outcome: Database["public"]["Enums"]["combat_outcome"]
          combat_result_id: string
          created_at: string
          defender_estate_id: string | null
          defender_hero_id: string
          defender_level_snapshot: number
          id: string
          level_difference: number
          loser_hero_id: string | null
          metadata_json: Json
          notification_context_json: Json
          outcome_key: string
          prestige_context_json: Json
          pvp_action_id: string
          report_context_json: Json
          resource_outcome_json: Json
          reward_context_json: Json
          server_id: string
          winner_hero_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "pvp_attack_results"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      refresh_server_membership_moderation_status: {
        Args: { p_server_id: string; p_user_id: string }
        Returns: undefined
      }
      reject_player_direct_trade_offer: {
        Args: { p_offer_id: string; p_status_reason?: string }
        Returns: string
      }
      release_auction_character_point_locks: {
        Args: { p_auction_listing_id: string; p_status_reason?: string }
        Returns: number
      }
      release_trade_offer_character_point_locks: {
        Args: { p_offer_id: string; p_status_reason?: string }
        Returns: number
      }
      relocate_hero_estate_to_empty_address: {
        Args: {
          p_address_number: number
          p_confirm_destroy_existing_estate: boolean
          p_district_code: string
          p_hero_id: string
          p_reason?: string
          p_request_id?: string
        }
        Returns: {
          address: string
          address_number: number
          audit_log_id: string
          district_code: string
          hero_id: string
          new_estate_id: string
          old_estate_id: string
          server_id: string
        }[]
      }
      remove_guild_armory_item: {
        Args: {
          p_actor_hero_id: string
          p_armory_item_id: string
          p_reason?: string
          p_request_id?: string
        }
        Returns: {
          armory_item_id: string
          audit_log_id: string
          guild_id: string
          item_id: string
          owner_hero_id: string
          status_key: string
        }[]
      }
      remove_report_from_list: {
        Args: {
          p_hero_id: string
          p_reason?: string
          p_report_id: string
          p_request_id?: string
        }
        Returns: Json
      }
      rename_hero_armory_shelf: {
        Args: {
          p_hero_id: string
          p_new_name: string
          p_shelf_position: number
        }
        Returns: {
          armory_state_json: Json
          hero_id: string
          operation: string
          server_id: string
          shelf_id: string
          shelf_name: string
          shelf_position: number
        }[]
      }
      rename_hero_loadout_preset: {
        Args: {
          p_hero_id: string
          p_name: string
          p_preset_number: number
          p_request_id?: string
        }
        Returns: {
          hero_id: string
          name: string
          preset_id: string
          preset_number: number
          request_id: string
          updated_at: string
        }[]
      }
      reorder_entity_requirements: {
        Args: {
          p_entity_id: string
          p_entity_type: Database["public"]["Enums"]["requirement_entity_type"]
          p_reason: string
          p_requirement_ids: string[]
        }
        Returns: {
          applies_from_level: number
          context: string
          created_at: string
          description: string | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["requirement_entity_type"]
          id: string
          is_active: boolean
          params_json: Json
          required_building_key: string | null
          required_district_code: string | null
          required_resource_type: string | null
          required_stat_key: string | null
          required_value_boolean: boolean | null
          required_value_decimal: number | null
          required_value_integer: number | null
          required_value_text: string | null
          requirement_definition_key: string
          sort_order: number
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "entity_requirements"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      reset_hero_exploration: {
        Args: {
          p_difficulty_key?: string
          p_exploration_date?: string
          p_hero_id: string
          p_reason?: string
          p_server_id: string
        }
        Returns: number
      }
      resolve_and_persist_combat_from_trusted_snapshots: {
        Args: {
          p_defender_json: Json
          p_initiator_json: Json
          p_reason?: string
          p_request_id?: string
          p_server_id: string
          p_source_entity_id: string
          p_source_type: Database["public"]["Enums"]["combat_source_type"]
          p_timing_hits_json?: Json
        }
        Returns: {
          attacks_created: number
          audit_log_id: string
          combat_result_id: string
          outcome: Database["public"]["Enums"]["combat_outcome"]
          participant_stats_created: number
          participants_created: number
          resolver_metadata_json: Json
          server_id: string
          source_entity_id: string
          source_type: Database["public"]["Enums"]["combat_source_type"]
          turns_completed: number
        }[]
      }
      resolve_balance_formula_target_with_draft: {
        Args: { p_change_set_id?: string; p_target_key: string }
        Returns: {
          allowed_variables: string[]
          assignment_conflict_status: string
          assignment_id: string
          change_set_id: string
          conflict_status: string
          default_test_context: Json
          draft_patch_json: Json
          effective_expression: string
          effective_formula_id: string
          effective_formula_key: string
          effective_formula_label: string
          effective_is_enabled: boolean
          formula_conflict_status: string
          formula_source: string
          live_expression: string
          live_formula_id: string
          live_formula_key: string
          live_formula_label: string
          live_is_enabled: boolean
          pending_changes_json: Json
          target_id: string
          target_key: string
          target_label: string
          target_scope_key: string
        }[]
      }
      resolve_building_bonus_preview_value: {
        Args: {
          p_building_id: string
          p_current_level: number
          p_entity_bonus_id: string
          p_rank?: number
        }
        Returns: {
          formula_expression: string
          formula_key: string
          formula_label: string
          formula_source: string
          value: number
        }[]
      }
      resolve_combat_live_attack: {
        Args: {
          p_action_json: Json
          p_is_player_action?: boolean
          p_request_id?: string
          p_session_id: string
          p_timing_input_json?: Json
        }
        Returns: {
          actor_participant_id: string
          critical: boolean
          evaded: boolean
          event_index: number
          final_damage: number
          target_health_after: number
          target_participant_id: string
          timing_hit: boolean
        }[]
      }
      resolve_combat_opponent_scaling_formula: {
        Args: {
          p_candidate_scaling_formula_id?: string
          p_opponent_definition_id: string
        }
        Returns: {
          allowed_variables: string[]
          expression: string
          formula_id: string
          formula_key: string
          formula_source: string
        }[]
      }
      resolve_entity_requirement_value_for_target_level: {
        Args: { p_requirement_id: string; p_target_level: number }
        Returns: {
          effective_required_value_decimal: number
          effective_required_value_integer: number
          effective_required_value_numeric: number
          formula_applied: boolean
          formula_target_key: string
          formula_variables_json: Json
          requirement_id: string
          static_required_value_numeric: number
          target_level: number
        }[]
      }
      resolve_game_report_combat_result_id: {
        Args: { p_report_id: string }
        Returns: string
      }
      resolve_game_report_reward_grant_id: {
        Args: { p_report_id: string }
        Returns: string
      }
      resolve_hero_attribute_formula_target_key: {
        Args: { p_formula_kind: string }
        Returns: string
      }
      resolve_hero_building_bonus_preview_value: {
        Args: {
          p_building_id: string
          p_current_level: number
          p_entity_bonus_id: string
          p_hero_id: string
          p_rank?: number
        }
        Returns: {
          formula_expression: string
          formula_key: string
          formula_label: string
          formula_source: string
          value: number
        }[]
      }
      resolve_hero_exploration_step: {
        Args: { p_step_id: string }
        Returns: {
          challenge_attempt_id: string
          current_node_id: string
          encounter_definition_id: string
          exploration_id: string
          metadata_json: Json
          outcome_kind: string
          remaining_trials: number
          status: string
          step_id: string
          to_node_id: string
          trial_definition_id: string
          trial_dry_step_count: number
        }[]
      }
      resolve_hero_pvp_role_health_bonus: {
        Args: { p_hero_id: string; p_role: string }
        Returns: {
          building_key: string
          building_level: number
          health_bonus: number
          hero_id: string
          role_key: string
          scaling_stat_key: string
          scaling_stat_value: number
          scope_key: string
          source_rows: Json
        }[]
      }
      resolve_hero_pvp_travel_time_seconds: {
        Args: {
          p_action_kind: string
          p_base_seconds: number
          p_hero_id: string
        }
        Returns: {
          action_kind: string
          base_seconds: number
          capped_reduction_percent: number
          final_seconds: number
          hero_id: string
          min_seconds: number
          multiplier: number
          reduction_percent: number
          source_rows: Json
        }[]
      }
      resolve_hero_resource_production_rates: {
        Args: { p_hero_id: string }
        Returns: {
          per_hour: number
          resource_type: string
        }[]
      }
      resolve_manual_trial_inactivity_timeout: {
        Args: { p_manual_session_id: string; p_request_id?: string }
        Returns: {
          action_log_id: string
          attempt_id: string
          backend_replay_summary_json: Json
          failure_reason_helper_text: string
          failure_reason_key: string
          failure_reason_label: string
          game_report_id: string
          hero_id: string
          manual_session_id: string
          minigame_key: string
          outcome_key: string
          performance_rating: string
          player_report_summary_json: Json
          resolution_mode_key: string
          resolved_at: string
          reward_grant_id: string
          reward_summary_json: Json
          score: number
          server_id: string
          trial_definition_id: string
          validation_reason_key: string
          validation_reason_label: string
          validation_reason_severity: string
          validation_warnings_json: Json
          verdict_id: string
        }[]
      }
      resolve_moderation_action_target_user_id: {
        Args: {
          p_action: Database["public"]["Tables"]["moderation_actions"]["Row"]
        }
        Returns: string
      }
      resolve_reward_item_luck_context: {
        Args: { p_hero_id?: string; p_metadata_json?: Json }
        Returns: {
          luck_influence: number
          luck_value: number
        }[]
      }
      resolve_trial_offer_inactivity_timeout: {
        Args: { p_attempt_id: string; p_request_id?: string }
        Returns: {
          action_log_id: string
          attempt_id: string
          backend_replay_summary_json: Json
          failure_reason_helper_text: string
          failure_reason_key: string
          failure_reason_label: string
          game_report_id: string
          hero_id: string
          manual_session_id: string
          minigame_key: string
          outcome_key: string
          performance_rating: string
          player_report_summary_json: Json
          resolution_mode_key: string
          resolved_at: string
          reward_grant_id: string
          reward_summary_json: Json
          score: number
          server_id: string
          trial_definition_id: string
          validation_reason_key: string
          validation_reason_label: string
          validation_reason_severity: string
          validation_warnings_json: Json
          verdict_id: string
        }[]
      }
      resource_type_label_pl: {
        Args: { p_resource_type: string }
        Returns: string
      }
      respond_guild_invite: {
        Args: {
          p_accept: boolean
          p_invite_id: string
          p_reason?: string
          p_request_id?: string
          p_target_hero_id: string
        }
        Returns: {
          audit_log_id: string
          guild_id: string
          invite_id: string
          member_count: number
          member_limit: number
          membership_id: string
          status_key: string
          target_hero_id: string
        }[]
      }
      respond_player_direct_trade_offer: {
        Args: {
          p_description?: string
          p_offer_id: string
          p_target_character_points?: number
          p_target_item_ids?: string[]
        }
        Returns: string
      }
      return_guild_armory_loan: {
        Args: {
          p_actor_hero_id: string
          p_loan_id: string
          p_reason?: string
          p_request_id?: string
        }
        Returns: {
          armory_item_id: string
          armory_status_key: string
          audit_log_id: string
          guild_id: string
          item_id: string
          loan_id: string
          loan_status_key: string
        }[]
      }
      review_guild_join_request: {
        Args: {
          p_accept: boolean
          p_actor_hero_id: string
          p_join_request_id: string
          p_reason?: string
          p_request_id?: string
        }
        Returns: {
          audit_log_id: string
          guild_id: string
          join_request_id: string
          member_count: number
          member_limit: number
          membership_id: string
          requester_hero_id: string
          status_key: string
        }[]
      }
      revoke_server_staff: {
        Args: { p_reason: string; p_staff_assignment_id: string }
        Returns: string
      }
      reward_level_assignment_matches: {
        Args: {
          p_level_interval: number
          p_level_value: number
          p_match_kind: string
          p_max_level_value: number
          p_reached_level: number
        }
        Returns: boolean
      }
      roll_pvp_spy_resolution: {
        Args: {
          p_request_id?: string
          p_spy_cunning: number
          p_target_intelligence: number
        }
        Returns: {
          detected: boolean
          detection_chance: number
          detection_roll: number
          outcome_key: string
          policy_json: Json
          success: boolean
          success_chance: number
          success_roll: number
        }[]
      }
      roll_server_event_for_server: {
        Args: { p_now?: string; p_request_id?: string; p_server_id: string }
        Returns: {
          eligible: boolean
          reason: string
          roll_chance_percent: number
          roll_value: number
          rolled: boolean
          run_id: string
          selected_definition_id: string
          selected_definition_key: string
          server_id: string
          started: boolean
        }[]
      }
      run_combat_live_session_to_completion: {
        Args: { p_request_id?: string; p_session_id: string }
        Returns: {
          combat_completed: boolean
          combat_session_id: string
          final_combat_result_id: string
          final_event_count: number
          loop_count: number
        }[]
      }
      run_scheduled_estate_building_tick: {
        Args: { p_limit?: number; p_request_id?: string }
        Returns: {
          backlog_after: number
          backlog_before: number
          duration_ms: number
          error_count: number
          job_run_id: string
          processed_count: number
          result_summary_json: Json
          status: string
          success_count: number
        }[]
      }
      run_scheduled_pvp_settlement_tick: {
        Args: { p_limit?: number; p_request_id?: string }
        Returns: {
          backlog_after: number
          backlog_before: number
          duration_ms: number
          error_count: number
          job_run_id: string
          processed_count: number
          result_summary_json: Json
          status: string
          success_count: number
        }[]
      }
      sanitize_player_armory_equipment_slot_json: {
        Args: { p_slot_json: Json }
        Returns: Json
      }
      sanitize_player_armory_item_detail_bonuses_json: {
        Args: { p_bonuses_json: Json; p_drachma_value?: number }
        Returns: Json
      }
      sanitize_player_armory_item_row_json: {
        Args: { p_item_json: Json }
        Returns: Json
      }
      sanitize_player_armory_jsonb_labels: {
        Args: { p_json: Json }
        Returns: Json
      }
      sanitize_player_armory_visibility_state_json: {
        Args: { p_visibility_state: Json }
        Returns: Json
      }
      sanitize_player_attribute_manifest_derived_array_json: {
        Args: { p_entries_json: Json }
        Returns: Json
      }
      sanitize_player_attribute_manifest_derived_entry_json: {
        Args: { p_entry_json: Json }
        Returns: Json
      }
      sanitize_player_attribute_manifest_json: {
        Args: { p_manifest_json: Json }
        Returns: Json
      }
      sanitize_player_estate_bonus_json: {
        Args: { p_bonus_json: Json }
        Returns: Json
      }
      sanitize_player_estate_bonus_rows_json: {
        Args: { p_bonuses_json: Json }
        Returns: Json
      }
      sanitize_player_estate_building_json: {
        Args: { p_building_json: Json }
        Returns: Json
      }
      sanitize_player_estate_buildings_json: {
        Args: { p_buildings_json: Json }
        Returns: Json
      }
      sanitize_player_estate_resource_json: {
        Args: { p_resource_json: Json }
        Returns: Json
      }
      sanitize_player_estate_resources_json: {
        Args: { p_resources_json: Json }
        Returns: Json
      }
      sanitize_player_estate_runtime_state_json: {
        Args: { p_runtime_state: Json }
        Returns: Json
      }
      sanitize_player_estate_upgrade_preview_json: {
        Args: { p_preview_json: Json }
        Returns: Json
      }
      save_current_hero_loadout_preset: {
        Args: {
          p_hero_id: string
          p_name?: string
          p_preset_number: number
          p_request_id?: string
        }
        Returns: {
          hero_id: string
          name: string
          preset_id: string
          preset_number: number
          request_id: string
          saved_slot_count: number
          slots_json: Json
        }[]
      }
      save_item_generation_affix_target_config: {
        Args: {
          p_affix_id: string
          p_allowed_targets_json: Json
          p_reason: string
          p_request_id?: string
        }
        Returns: {
          active_target_count: number
          affix_id: string
          affix_key: string
          affix_kind: string
          affix_name: string
          allowed_base_type_count: number
          allowed_base_types_json: Json
          allowed_targets_json: Json
        }[]
      }
      save_item_generation_prefix_set_config: {
        Args: {
          p_allowed_targets_json: Json
          p_description?: string
          p_helper_text?: string
          p_is_active?: boolean
          p_label?: string
          p_prefix_affix_id: string
          p_reason?: string
          p_request_id?: string
          p_set_bonus_entries_json: Json
          p_set_kind: string
        }
        Returns: {
          active_bonus_count: number
          allowed_base_types_json: Json
          allowed_targets_json: Json
          config_json: Json
          prefix_affix_id: string
          prefix_key: string
          prefix_name: string
          requirements_json: Json
          set_bonuses_json: Json
          set_id: string
          set_is_active: boolean
          set_kind: string
          set_label: string
        }[]
      }
      save_stat_allocation: {
        Args: {
          p_character_points_spent?: number
          p_hero_id: string
          p_reason?: string
          p_request_id?: string
          p_stat_values_json: Json
        }
        Returns: {
          audit_log_id: string
          character_points_after: number
          hero_id: string
          server_id: string
          stats_json: Json
        }[]
      }
      schedule_pvp_action_return_runtime_activity: {
        Args: {
          p_pvp_action_id: string
          p_reason?: string
          p_request_id?: string
          p_resolved_at?: string
          p_result_id: string
          p_result_kind: string
        }
        Returns: {
          activity_kind: string
          available_at: string | null
          created_at: string
          ended_at: string | null
          expires_at: string | null
          hero_id: string
          id: string
          metadata_json: Json
          reason: string | null
          request_id: string | null
          server_id: string
          source_entity_id: string | null
          source_entity_type: string | null
          started_at: string
          status: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "hero_runtime_activities"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      scrap_hero_item: {
        Args: {
          p_actor_hero_id: string
          p_item_id: string
          p_reason?: string
          p_recoverable_until?: string
          p_request_id?: string
        }
        Returns: {
          audit_log_id: string
          item_id: string
          recoverable_until: string
          scrapped_at: string
          status: Database["public"]["Enums"]["item_status"]
        }[]
      }
      search_anti_abuse_case_targets: {
        Args: { p_limit?: number; p_query: string; p_server_id: string }
        Returns: {
          case_id: string
          created_at: string
          last_signal_at: string
          match_kind: string
          primary_hero_id: string
          primary_hero_name: string
          primary_user_display_name: string
          primary_user_id: string
          signal_count: number
          source: Database["public"]["Enums"]["anti_abuse_case_source"]
          status: Database["public"]["Enums"]["anti_abuse_case_status"]
          summary: string
          technical_label: string
          title: string
          verdict: Database["public"]["Enums"]["anti_abuse_case_verdict"]
        }[]
      }
      search_anti_abuse_case_targets_page: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_query?: string
          p_server_id: string
        }
        Returns: {
          case_id: string
          created_at: string
          last_signal_at: string
          match_kind: string
          primary_hero_id: string
          primary_hero_name: string
          primary_user_display_name: string
          primary_user_id: string
          signal_count: number
          source: Database["public"]["Enums"]["anti_abuse_case_source"]
          status: Database["public"]["Enums"]["anti_abuse_case_status"]
          summary: string
          technical_label: string
          title: string
          total_count: number
          verdict: Database["public"]["Enums"]["anti_abuse_case_verdict"]
        }[]
      }
      search_anti_abuse_sanction_targets: {
        Args: { p_limit?: number; p_query: string; p_server_id: string }
        Returns: {
          amount_character_points: number
          case_id: string
          case_title: string
          created_at: string
          duration_days: number
          match_kind: string
          reason: string
          sanction_id: string
          sanction_type_key: string
          sanction_type_label: string
          status: Database["public"]["Enums"]["anti_abuse_sanction_status"]
          target_hero_id: string
          target_hero_name: string
          target_user_display_name: string
          target_user_id: string
          technical_label: string
        }[]
      }
      search_anti_abuse_sanction_targets_page: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_query?: string
          p_server_id: string
        }
        Returns: {
          amount_character_points: number
          case_id: string
          case_title: string
          created_at: string
          duration_days: number
          match_kind: string
          reason: string
          sanction_id: string
          sanction_type_key: string
          sanction_type_label: string
          status: Database["public"]["Enums"]["anti_abuse_sanction_status"]
          target_hero_id: string
          target_hero_name: string
          target_user_display_name: string
          target_user_id: string
          technical_label: string
          total_count: number
        }[]
      }
      search_auction_listing_targets: {
        Args: { p_limit?: number; p_query: string; p_server_id: string }
        Returns: {
          auction_mode: Database["public"]["Enums"]["player_auction_mode"]
          buy_now_character_points: number
          created_at: string
          current_bid_character_points: number
          current_highest_bidder_display_name: string
          current_highest_bidder_hero_id: string
          current_highest_bidder_hero_name: string
          current_highest_bidder_user_id: string
          ends_at: string
          item_display_name: string
          item_id: string
          listing_id: string
          match_kind: string
          seller_display_name: string
          seller_hero_id: string
          seller_hero_name: string
          seller_user_id: string
          starts_at: string
          status: Database["public"]["Enums"]["player_auction_status"]
          technical_label: string
        }[]
      }
      search_auction_listing_targets_page: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_query?: string
          p_server_id: string
        }
        Returns: {
          auction_mode: Database["public"]["Enums"]["player_auction_mode"]
          buy_now_character_points: number
          created_at: string
          current_bid_character_points: number
          current_highest_bidder_display_name: string
          current_highest_bidder_hero_id: string
          current_highest_bidder_hero_name: string
          current_highest_bidder_user_id: string
          ends_at: string
          item_display_name: string
          item_id: string
          listing_id: string
          match_kind: string
          seller_display_name: string
          seller_hero_id: string
          seller_hero_name: string
          seller_user_id: string
          starts_at: string
          status: Database["public"]["Enums"]["player_auction_status"]
          technical_label: string
          total_count: number
        }[]
      }
      search_auction_listings_page: {
        Args: {
          p_filters?: Json
          p_hero_id: string
          p_limit?: number
          p_offset?: number
          p_query?: string
        }
        Returns: Json
      }
      search_auction_listings_page_raw_v1: {
        Args: {
          p_filters?: Json
          p_hero_id: string
          p_limit?: number
          p_offset?: number
          p_query?: string
        }
        Returns: Json
      }
      search_balance_formula_target_targets: {
        Args: { p_limit?: number; p_query: string }
        Returns: {
          allowed_variables: string[]
          description: string
          formula_target_id: string
          match_kind: string
          scope_key: string
          sort_order: number
          target_key: string
          target_label: string
          technical_label: string
        }[]
      }
      search_balance_formula_target_targets_page: {
        Args: { p_limit?: number; p_offset?: number; p_query?: string }
        Returns: {
          allowed_variables: string[]
          description: string
          formula_target_id: string
          match_kind: string
          scope_key: string
          sort_order: number
          target_key: string
          target_label: string
          technical_label: string
          total_count: number
        }[]
      }
      search_balance_formula_targets: {
        Args: { p_limit?: number; p_query: string }
        Returns: {
          description: string
          expression: string
          formula_id: string
          formula_key: string
          formula_label: string
          is_enabled: boolean
          match_kind: string
          scope_key: string
          technical_label: string
        }[]
      }
      search_balance_formula_targets_page: {
        Args: { p_limit?: number; p_offset?: number; p_query?: string }
        Returns: {
          description: string
          expression: string
          formula_id: string
          formula_key: string
          formula_label: string
          is_enabled: boolean
          match_kind: string
          scope_key: string
          technical_label: string
          total_count: number
        }[]
      }
      search_bonus_template_targets: {
        Args: { p_limit?: number; p_query: string }
        Returns: {
          bonus_key: string
          bonus_label: string
          bonus_template_id: string
          description: string
          is_active: boolean
          match_kind: string
          scope_key: string
          scope_label: string
          target_key: string
          target_label: string
          technical_label: string
          type_key: string
          type_label: string
        }[]
      }
      search_bonus_template_targets_page: {
        Args: { p_limit?: number; p_offset?: number; p_query?: string }
        Returns: {
          bonus_key: string
          bonus_label: string
          bonus_template_id: string
          description: string
          is_active: boolean
          match_kind: string
          scope_key: string
          scope_label: string
          target_key: string
          target_label: string
          technical_label: string
          total_count: number
          type_key: string
          type_label: string
        }[]
      }
      search_building_targets: {
        Args: { p_limit?: number; p_query: string }
        Returns: {
          base_build_time_seconds: number
          base_cost: number
          building_id: string
          building_key: string
          building_name: string
          description: string
          district_code: string
          match_kind: string
          max_level: number
          sort_order: number
          technical_label: string
        }[]
      }
      search_building_targets_page: {
        Args: { p_limit?: number; p_offset?: number; p_query?: string }
        Returns: {
          base_build_time_seconds: number
          base_cost: number
          building_id: string
          building_key: string
          building_name: string
          description: string
          district_code: string
          match_kind: string
          max_level: number
          sort_order: number
          technical_label: string
          total_count: number
        }[]
      }
      search_config_definition_targets: {
        Args: { p_limit?: number; p_query: string }
        Returns: {
          config_definition_id: string
          config_key: string
          description: string
          governance_scope: Database["public"]["Enums"]["config_governance_scope"]
          is_active: boolean
          label: string
          managed_entity_key: string
          managed_entity_type: Database["public"]["Enums"]["config_managed_entity_type"]
          match_kind: string
          preview_kind: string
          technical_label: string
          ui_group_label: string
          value_type: Database["public"]["Enums"]["config_value_type"]
        }[]
      }
      search_config_definition_targets_page: {
        Args: { p_limit?: number; p_offset?: number; p_query?: string }
        Returns: {
          config_definition_id: string
          config_key: string
          description: string
          governance_scope: Database["public"]["Enums"]["config_governance_scope"]
          is_active: boolean
          label: string
          managed_entity_key: string
          managed_entity_type: Database["public"]["Enums"]["config_managed_entity_type"]
          match_kind: string
          preview_kind: string
          technical_label: string
          total_count: number
          ui_group_label: string
          value_type: Database["public"]["Enums"]["config_value_type"]
        }[]
      }
      search_guilds_for_hero: {
        Args: {
          p_hero_id: string
          p_limit?: number
          p_offset?: number
          p_query?: string
        }
        Returns: {
          can_request_to_join: boolean
          current_invite_status_key: string
          current_join_request_status_key: string
          guild_id: string
          member_count: number
          member_limit: number
          name: string
          server_id: string
          status_key: string
          tag: string
          total_count: number
        }[]
      }
      search_item_generation_entity_targets: {
        Args: {
          p_entity_type: Database["public"]["Enums"]["config_managed_entity_type"]
          p_limit?: number
          p_query: string
        }
        Returns: {
          description: string
          entity_id: string
          entity_key: string
          entity_label: string
          entity_type: Database["public"]["Enums"]["config_managed_entity_type"]
          is_active: boolean
          match_kind: string
          numeric_value: number
          subtype: string
          technical_label: string
        }[]
      }
      search_item_generation_entity_targets_page: {
        Args: {
          p_entity_type: Database["public"]["Enums"]["config_managed_entity_type"]
          p_limit?: number
          p_offset?: number
          p_query?: string
        }
        Returns: {
          description: string
          entity_id: string
          entity_key: string
          entity_label: string
          entity_type: Database["public"]["Enums"]["config_managed_entity_type"]
          is_active: boolean
          match_kind: string
          numeric_value: number
          subtype: string
          technical_label: string
          total_count: number
        }[]
      }
      search_moderation_hero_targets: {
        Args: { p_limit?: number; p_query: string; p_server_id: string }
        Returns: {
          email: string
          has_visible_moderation_history: boolean
          hero_id: string
          hero_name: string
          match_kind: string
          technical_label: string
          user_display_name: string
          user_id: string
        }[]
      }
      search_moderation_hero_targets_page: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_query?: string
          p_server_id: string
        }
        Returns: {
          email: string
          has_visible_moderation_history: boolean
          hero_id: string
          hero_name: string
          match_kind: string
          technical_label: string
          total_count: number
          user_display_name: string
          user_id: string
        }[]
      }
      search_moderation_item_targets: {
        Args: { p_limit?: number; p_query: string; p_server_id: string }
        Returns: {
          item_display_name: string
          item_id: string
          item_status: Database["public"]["Enums"]["item_status"]
          item_value: number
          match_kind: string
          owner_display_name: string
          owner_hero_id: string
          owner_hero_name: string
          owner_user_id: string
          related_auction_listing_id: string
          related_trade_offer_id: string
          technical_label: string
        }[]
      }
      search_moderation_item_targets_page: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_query?: string
          p_server_id: string
        }
        Returns: {
          item_display_name: string
          item_id: string
          item_status: Database["public"]["Enums"]["item_status"]
          item_value: number
          match_kind: string
          owner_display_name: string
          owner_hero_id: string
          owner_hero_name: string
          owner_user_id: string
          related_auction_listing_id: string
          related_trade_offer_id: string
          technical_label: string
          total_count: number
        }[]
      }
      search_moderation_user_targets: {
        Args: { p_limit?: number; p_query: string; p_server_id: string }
        Returns: {
          display_name: string
          email: string
          has_visible_moderation_history: boolean
          match_kind: string
          primary_hero_id: string
          primary_hero_name: string
          technical_label: string
          user_id: string
        }[]
      }
      search_moderation_user_targets_page: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_query?: string
          p_server_id: string
        }
        Returns: {
          display_name: string
          email: string
          has_visible_moderation_history: boolean
          match_kind: string
          primary_hero_id: string
          primary_hero_name: string
          technical_label: string
          total_count: number
          user_id: string
        }[]
      }
      search_recoverable_scrapped_items_page: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_query?: string
          p_server_id: string
        }
        Returns: {
          generation_base_id: string
          generation_quality_key: string
          item_display_name: string
          item_id: string
          item_value: number
          match_kind: string
          owner_display_name: string
          owner_hero_id: string
          owner_hero_name: string
          owner_user_id: string
          prefix_affix_id: string
          recoverable_until: string
          scrapped_at: string
          suffix_affix_id: string
          technical_label: string
          total_count: number
        }[]
      }
      search_requirement_definition_targets: {
        Args: { p_limit?: number; p_query: string }
        Returns: {
          admin_description: string
          category: string
          description: string
          helper_text: string
          is_active: boolean
          match_kind: string
          requirement_definition_id: string
          requirement_key: string
          requirement_label: string
          sort_order: number
          technical_label: string
          value_type: Database["public"]["Enums"]["requirement_value_type"]
        }[]
      }
      search_requirement_definition_targets_page: {
        Args: { p_limit?: number; p_offset?: number; p_query?: string }
        Returns: {
          admin_description: string
          category: string
          description: string
          helper_text: string
          is_active: boolean
          match_kind: string
          requirement_definition_id: string
          requirement_key: string
          requirement_label: string
          sort_order: number
          technical_label: string
          total_count: number
          value_type: Database["public"]["Enums"]["requirement_value_type"]
        }[]
      }
      search_server_staff_candidates: {
        Args: { p_limit?: number; p_query: string; p_server_id: string }
        Returns: {
          display_name: string
          eligibility_reason: string
          email: string
          existing_staff_assignment_id: string
          existing_staff_role: Database["public"]["Enums"]["server_staff_role"]
          global_role_key: string
          has_hero_on_server: boolean
          has_staff_disqualifying_history: boolean
          is_eligible_for_server_staff: boolean
          is_existing_staff_on_server: boolean
          user_id: string
        }[]
      }
      search_server_staff_candidates_page: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_query?: string
          p_server_id: string
        }
        Returns: {
          display_name: string
          eligibility_reason: string
          email: string
          existing_staff_assignment_id: string
          existing_staff_role: Database["public"]["Enums"]["server_staff_role"]
          global_role_key: string
          has_hero_on_server: boolean
          has_staff_disqualifying_history: boolean
          is_eligible_for_server_staff: boolean
          is_existing_staff_on_server: boolean
          match_kind: string
          technical_label: string
          total_count: number
          user_id: string
        }[]
      }
      search_trade_offer_targets: {
        Args: { p_limit?: number; p_query: string; p_server_id: string }
        Returns: {
          completed_at: string
          created_at: string
          creator_character_points: number
          creator_display_name: string
          creator_hero_id: string
          creator_hero_name: string
          creator_user_id: string
          expires_at: string
          match_kind: string
          offer_id: string
          status: Database["public"]["Enums"]["player_trade_offer_status"]
          target_character_points: number
          target_display_name: string
          target_hero_id: string
          target_hero_name: string
          target_user_id: string
          technical_label: string
        }[]
      }
      search_trade_offer_targets_page: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_query?: string
          p_server_id: string
        }
        Returns: {
          completed_at: string
          created_at: string
          creator_character_points: number
          creator_display_name: string
          creator_hero_id: string
          creator_hero_name: string
          creator_user_id: string
          expires_at: string
          match_kind: string
          offer_id: string
          status: Database["public"]["Enums"]["player_trade_offer_status"]
          target_character_points: number
          target_display_name: string
          target_hero_id: string
          target_hero_name: string
          target_user_id: string
          technical_label: string
          total_count: number
        }[]
      }
      search_trade_targets_page: {
        Args: {
          p_hero_id: string
          p_limit?: number
          p_offset?: number
          p_query?: string
        }
        Returns: Json
      }
      search_trade_transaction_targets: {
        Args: { p_limit?: number; p_query: string; p_server_id: string }
        Returns: {
          auction_listing_id: string
          completed_at: string
          created_at: string
          creator_character_points: number
          creator_display_name: string
          creator_hero_id: string
          creator_hero_name: string
          creator_user_id: string
          description: string
          match_kind: string
          offer_id: string
          reason: string
          status: Database["public"]["Enums"]["player_trade_transaction_status"]
          target_character_points: number
          target_display_name: string
          target_hero_id: string
          target_hero_name: string
          target_user_id: string
          technical_label: string
          transaction_id: string
          transaction_type: Database["public"]["Enums"]["player_trade_transaction_type"]
        }[]
      }
      search_trade_transaction_targets_page: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_query?: string
          p_server_id: string
        }
        Returns: {
          auction_listing_id: string
          completed_at: string
          created_at: string
          creator_character_points: number
          creator_display_name: string
          creator_hero_id: string
          creator_hero_name: string
          creator_user_id: string
          description: string
          match_kind: string
          offer_id: string
          reason: string
          status: Database["public"]["Enums"]["player_trade_transaction_status"]
          target_character_points: number
          target_display_name: string
          target_hero_id: string
          target_hero_name: string
          target_user_id: string
          technical_label: string
          total_count: number
          transaction_id: string
          transaction_type: Database["public"]["Enums"]["player_trade_transaction_type"]
        }[]
      }
      select_account_entry_active_hero_context: {
        Args: { p_hero_id: string; p_server_id: string }
        Returns: {
          access_json: Json
          active_hero_json: Json
          address: string
          address_label: string
          address_number: number
          created_at: string
          district_code: string
          estate_id: string
          hero_context_json: Json
          hero_id: string
          hero_level: number
          hero_name: string
          route_next_action: string
          server_context_json: Json
          server_id: string
          server_key: string
          server_name: string
        }[]
      }
      server_config_value_source_for_scope: {
        Args: {
          p_governance_scope: Database["public"]["Enums"]["config_governance_scope"]
        }
        Returns: Database["public"]["Enums"]["server_config_value_source"]
      }
      set_anti_abuse_case_decision: {
        Args: {
          p_case_id: string
          p_no_sanction_reason?: string
          p_operator_notes?: string
          p_sanction_required?: boolean
          p_status: Database["public"]["Enums"]["anti_abuse_case_status"]
          p_status_reason?: string
          p_verdict?: Database["public"]["Enums"]["anti_abuse_case_verdict"]
          p_verdict_reason?: string
        }
        Returns: {
          assigned_to_user_id: string | null
          cancelled_at: string | null
          created_at: string
          grouping_key: string | null
          id: string
          last_signal_at: string | null
          no_sanction_reason: string | null
          opened_by_user_id: string | null
          operator_notes: string | null
          possible_recidivism: boolean
          primary_hero_id: string | null
          primary_user_id: string | null
          resolved_at: string | null
          resolved_by_user_id: string | null
          sanction_required: boolean | null
          server_id: string
          signal_count: number
          source: Database["public"]["Enums"]["anti_abuse_case_source"]
          status: Database["public"]["Enums"]["anti_abuse_case_status"]
          status_reason: string | null
          summary: string | null
          title: string
          updated_at: string
          verdict: Database["public"]["Enums"]["anti_abuse_case_verdict"] | null
          verdict_reason: string | null
        }
        SetofOptions: {
          from: "*"
          to: "anti_abuse_cases"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      set_anti_abuse_sanction_status: {
        Args: {
          p_sanction_id: string
          p_status: Database["public"]["Enums"]["anti_abuse_sanction_status"]
          p_status_reason?: string
        }
        Returns: {
          amount_character_points: number | null
          applied_at: string | null
          cancelled_at: string | null
          case_id: string
          completed_at: string | null
          created_at: string
          destination_hero_id: string | null
          duration_days: number | null
          ends_at: string | null
          failed_at: string | null
          forgiven_at: string | null
          id: string
          imposed_by_user_id: string | null
          operator_notes: string | null
          reason: string
          sanction_type_key: string
          source_hero_id: string | null
          starts_at: string | null
          status: Database["public"]["Enums"]["anti_abuse_sanction_status"]
          status_reason: string | null
          target_hero_id: string | null
          target_user_id: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "anti_abuse_sanctions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      set_character_point_penalty_status: {
        Args: {
          p_penalty_id: string
          p_status: Database["public"]["Enums"]["anti_abuse_sanction_status"]
          p_status_reason?: string
        }
        Returns: {
          applied_at: string | null
          cancelled_at: string | null
          case_id: string
          completed_at: string | null
          created_at: string
          created_by_user_id: string | null
          failed_at: string | null
          forgiven_at: string | null
          hero_id: string
          id: string
          operator_notes: string | null
          paid_amount: number
          reason: string
          remaining_amount: number
          sanction_id: string
          server_id: string
          status: Database["public"]["Enums"]["anti_abuse_sanction_status"]
          status_reason: string | null
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "character_point_penalties"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      set_guild_armory_member_access: {
        Args: {
          p_actor_hero_id: string
          p_member_hero_id: string
          p_reason: string
          p_request_id?: string
          p_status_key: string
        }
        Returns: {
          access_lock_id: string
          audit_log_id: string
          guild_id: string
          member_hero_id: string
          status_key: string
        }[]
      }
      set_moderation_action_status: {
        Args: {
          p_action_id: string
          p_status: Database["public"]["Enums"]["moderation_action_status"]
          p_status_reason: string
        }
        Returns: {
          action_type_key: string
          created_at: string
          created_by_user_id: string | null
          expires_at: string | null
          id: string
          is_staff_disqualifying: boolean
          metadata_json: Json
          operator_notes: string | null
          player_visible_note: string | null
          reason: string
          resolved_at: string | null
          resolved_by_user_id: string | null
          scope_key: string | null
          server_id: string
          source_entity_id: string | null
          source_entity_type: string | null
          source_snapshot_id: string | null
          starts_at: string
          status: Database["public"]["Enums"]["moderation_action_status"]
          status_reason: string | null
          target_hero_id: string | null
          target_user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "moderation_actions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      set_next_hero_exploration_outcome_override: {
        Args: {
          p_difficulty_key: string
          p_encounter_definition_id?: string
          p_expires_in_minutes?: number
          p_force_manifestation_status?: string
          p_forced_outcome_kind: string
          p_hero_id: string
          p_reason: string
          p_server_id: string
          p_trial_definition_id?: string
        }
        Returns: {
          difficulty_key: string
          encounter_definition_id: string
          expires_at: string
          force_manifestation_status: string
          forced_outcome_kind: string
          hero_id: string
          override_id: string
          server_id: string
          trial_definition_id: string
        }[]
      }
      set_player_abuse_report_decision: {
        Args: {
          p_admin_notes?: string
          p_case_id?: string
          p_player_notes?: string
          p_report_id: string
          p_status: Database["public"]["Enums"]["player_abuse_report_status"]
          p_status_reason?: string
        }
        Returns: {
          accused_hero_id: string | null
          accused_user_id: string | null
          admin_notes: string | null
          case_id: string | null
          created_at: string
          description: string
          id: string
          player_notes: string | null
          related_item_id: string | null
          related_trade_id: string | null
          related_trade_reference: string | null
          report_type_key: string
          reporting_hero_id: string | null
          reporting_user_id: string
          resolved_at: string | null
          server_id: string
          status: Database["public"]["Enums"]["player_abuse_report_status"]
          status_reason: string | null
          title: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "player_abuse_reports"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      set_player_relationship_declaration_decision: {
        Args: {
          p_admin_notes?: string
          p_declaration_id: string
          p_player_notes?: string
          p_status: Database["public"]["Enums"]["player_relationship_declaration_status"]
          p_status_reason: string
        }
        Returns: {
          admin_notes: string | null
          amount_character_points: number | null
          completed_at: string | null
          created_at: string
          created_by_hero_id: string | null
          created_by_user_id: string
          declaration_type_key: string
          description: string
          expires_at: string | null
          id: string
          player_notes: string | null
          reviewed_at: string | null
          reviewed_by_user_id: string | null
          revoked_at: string | null
          server_id: string
          starts_at: string | null
          status: Database["public"]["Enums"]["player_relationship_declaration_status"]
          status_reason: string | null
          submitted_at: string | null
          title: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "player_relationship_declarations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      set_server_event_definition_active: {
        Args: {
          p_definition_id: string
          p_is_active: boolean
          p_reason: string
          p_request_id?: string
          p_server_id: string
        }
        Returns: {
          admin_notes: string | null
          created_at: string
          default_duration_days: number | null
          effect_explanation: string
          event_polarity: string
          helper_text: string | null
          id: string
          is_active: boolean
          key: string
          lore_description: string
          lore_name: string
          metadata_json: Json
          player_summary: string
          sort_order: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "server_event_definitions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      set_server_event_effect_active: {
        Args: {
          p_effect_id: string
          p_is_active: boolean
          p_reason: string
          p_request_id?: string
          p_server_id: string
        }
        Returns: {
          admin_description: string | null
          created_at: string
          definition_id: string
          id: string
          is_active: boolean
          metadata_json: Json
          numeric_value: number
          operation: string
          player_description: string
          player_label: string
          sort_order: number
          target_family: string
          target_key: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "server_event_effects"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      set_server_staff_permission_scopes: {
        Args: {
          p_reason: string
          p_scope_keys: string[]
          p_staff_assignment_id: string
        }
        Returns: {
          created_at: string
          granted_by_user_id: string | null
          id: string
          scope_key: string
          staff_assignment_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "server_staff_assignment_scopes"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      settle_due_estate_building_jobs_batch: {
        Args: { p_as_of?: string; p_limit?: number; p_request_id?: string }
        Returns: {
          completed_count: number
          error_message: string
          error_sqlstate: string
          estate_id: string
          hero_id: string
          server_id: string
          settled: boolean
          settled_as_of: string
        }[]
      }
      settle_due_pvp_actions_batch: {
        Args: {
          p_as_of?: string
          p_limit?: number
          p_request_id?: string
          p_server_id?: string
        }
        Returns: {
          action_kind: string
          attacker_hero_id: string
          combat_result_id: string
          due_at: string
          error_message: string
          error_sqlstate: string
          outcome_key: string
          pvp_action_id: string
          pvp_attack_result_id: string
          pvp_spy_result_id: string
          runtime_activity_id: string
          server_id: string
          settled: boolean
          settled_as_of: string
          settlement_status: string
          target_hero_id: string
        }[]
      }
      settle_due_pvp_actions_for_hero: {
        Args: { p_as_of?: string; p_hero_id: string }
        Returns: {
          action_kind: string
          combat_result_id: string
          outcome_key: string
          pvp_action_id: string
          pvp_attack_result_id: string
          settled_as_of: string
          status: string
        }[]
      }
      settle_due_pvp_actions_for_hero_internal: {
        Args: { p_as_of?: string; p_hero_id: string; p_request_id?: string }
        Returns: {
          action_kind: string
          combat_result_id: string
          outcome_key: string
          pvp_action_id: string
          pvp_attack_result_id: string
          settled_as_of: string
          status: string
        }[]
      }
      settle_due_pvp_attack_action: {
        Args: {
          p_as_of?: string
          p_pvp_action_id: string
          p_request_id?: string
        }
        Returns: {
          combat_result_id: string
          outcome_key: string
          pvp_action_id: string
          pvp_attack_result_id: string
          runtime_activity_id: string
          settled_as_of: string
          status: string
        }[]
      }
      settle_due_pvp_spy_action: {
        Args: {
          p_as_of?: string
          p_pvp_action_id: string
          p_request_id?: string
        }
        Returns: {
          pvp_action_id: string
          pvp_spy_result_id: string
          runtime_activity_id: string
          settled_as_of: string
          status: string
        }[]
      }
      settle_estate_runtime: {
        Args: { p_as_of?: string; p_estate_id: string }
        Returns: {
          completed_count: number
          estate_id: string
          hero_id: string
          server_id: string
          settled_as_of: string
        }[]
      }
      settle_hero_estate_runtime: {
        Args: { p_as_of?: string; p_hero_id: string }
        Returns: {
          completed_count: number
          estate_id: string
          hero_id: string
          server_id: string
          settled_as_of: string
        }[]
      }
      settle_hero_exploration_runtime: {
        Args: { p_as_of?: string; p_hero_id: string }
        Returns: {
          archived_explorations: number
          current_exploration_date: string
          hero_id: string
          released_runtime_activities: number
          server_id: string
          settled_as_of: string
        }[]
      }
      settle_hero_runtime_state: {
        Args: { p_as_of?: string; p_hero_id: string }
        Returns: {
          completed_count: number
          estate_id: string
          hero_id: string
          server_id: string
          settled_as_of: string
        }[]
      }
      settle_stale_combat_live_sessions: {
        Args: {
          p_limit?: number
          p_request_id?: string
          p_stale_after?: string
        }
        Returns: {
          combat_session_id: string
          note: string
          owner_user_id: string
          resolved: boolean
          result_id: string
          source_entity_id: string
          source_entity_type: string
          source_type: Database["public"]["Enums"]["combat_source_type"]
        }[]
      }
      simulate_trial_opportunity_runs: {
        Args: {
          p_difficulty_key?: string
          p_include_roll_history?: boolean
          p_luck_value?: number
          p_max_steps_per_run?: number
          p_run_count?: number
          p_spirituality_value?: number
          p_starting_dry_step_count?: number
        }
        Returns: {
          base_chance: number
          difficulty_key: string
          difficulty_label: string
          dry_step_count_before_final_roll: number
          explanation: string
          final_dry_step_count: number
          final_trial_opportunity_chance: number
          final_trial_opportunity_roll: number
          formula_expression: string
          formula_key: string
          luck_influence: number
          luck_value: number
          max_steps_per_run: number
          per_dry_step_chance: number
          roll_history_json: Json
          run_index: number
          spirituality_value: number
          starting_dry_step_count: number
          steps_taken: number
          trial_found: boolean
          trial_opportunity_step_cap: number
          trial_step_number: number
        }[]
      }
      skip_hero_exploration_step_timer: {
        Args: { p_reason: string; p_server_id: string; p_step_id: string }
        Returns: {
          challenge_attempt_id: string
          current_node_id: string
          encounter_definition_id: string
          exploration_id: string
          metadata_json: Json
          outcome_kind: string
          remaining_trials: number
          status: string
          step_id: string
          to_node_id: string
          trial_definition_id: string
          trial_dry_step_count: number
        }[]
      }
      stable_unit_interval_from_text: {
        Args: { p_seed: string }
        Returns: number
      }
      staff_transfer_item_ownership: {
        Args: {
          p_item_id: string
          p_reason: string
          p_request_id?: string
          p_target_hero_id: string
        }
        Returns: {
          audit_log_id: string
          equipment_rows_cleared: number
          item_id: string
          item_status: Database["public"]["Enums"]["item_status"]
          new_hero_id: string
          old_hero_id: string
        }[]
      }
      start_combat_live_round: {
        Args: { p_request_id?: string; p_session_id: string }
        Returns: {
          awaiting_player_action: boolean
          combat_session_id: string
          current_actor_participant_id: string
          current_timing_manifest_json: Json
          event_count: number
        }[]
      }
      start_estate_building_upgrade: {
        Args: {
          p_building_id: string
          p_hero_id: string
          p_reason?: string
          p_request_id?: string
        }
        Returns: {
          audit_log_id: string
          build_time_seconds: number
          building_id: string
          completes_at: string
          drachma_balance_after: number
          drachma_cost: number
          estate_id: string
          job_id: string
          materials_balance_after: number
          materials_cost: number
          started_at: string
          status: Database["public"]["Enums"]["estate_building_job_status"]
          target_level: number
          workforce_balance_after: number
          workforce_cost: number
        }[]
      }
      start_flow_ensure_audit_dictionary: {
        Args: never
        Returns: {
          action_type_key: string
          entity_type_key: string
        }[]
      }
      start_flow_resolve_character_point_reason: {
        Args: never
        Returns: Database["public"]["Enums"]["character_point_ledger_reason"]
      }
      start_flow_try_write_audit: {
        Args: {
          p_actor_hero_id: string
          p_actor_user_id: string
          p_estate_id: string
          p_hero_name: string
          p_metadata_json?: Json
          p_origin_id: string
          p_reason: string
          p_request_id: string
          p_server_id: string
          p_starting_character_points: number
        }
        Returns: string
      }
      start_guild_emergency_election: {
        Args: {
          p_actor_hero_id: string
          p_reason?: string
          p_request_id?: string
        }
        Returns: {
          audit_log_id: string
          election_id: string
          guild_id: string
          inactive_leader_hero_id: string
          nomination_ends_at: string
          status_key: string
          voting_ends_at: string
        }[]
      }
      start_guild_emergency_election_voting: {
        Args: {
          p_actor_hero_id: string
          p_election_id: string
          p_reason?: string
          p_request_id?: string
        }
        Returns: {
          audit_log_id: string
          election_id: string
          guild_id: string
          nomination_count: number
          status_key: string
          voting_ends_at: string
          voting_starts_at: string
        }[]
      }
      start_hero_estate_movement_lock: {
        Args: {
          p_duration_seconds: number
          p_estate_id: string
          p_hero_id: string
          p_lock_kind: string
          p_metadata_json?: Json
          p_reason?: string
          p_source_entity_id?: string
          p_source_entity_type?: string
        }
        Returns: {
          created_at: string
          created_by_hero_id: string | null
          ended_at: string | null
          estate_id: string | null
          expires_at: string
          hero_id: string
          id: string
          lock_kind: string
          metadata_json: Json
          reason: string | null
          server_id: string
          source_entity_id: string | null
          source_entity_type: string | null
          starts_at: string
          status: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "estate_movement_locks"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      start_hero_exploration_initial_step_if_needed: {
        Args: { p_exploration_id: string; p_request_id?: string }
        Returns: {
          direction_key: string
          edge_id: string
          exploration_id: string
          metadata_json: Json
          reason: string
          resolves_at: string
          started_at: string
          step_id: string
          step_started: boolean
          step_status: string
        }[]
      }
      start_hero_exploration_step: {
        Args: {
          p_edge_id?: string
          p_exploration_id: string
          p_step_kind?: string
        }
        Returns: {
          direction_key: string
          edge_id: string
          exploration_id: string
          from_node_id: string
          outcome_kind: string
          resolves_at: string
          started_at: string
          status: string
          step_id: string
          step_kind: string
          to_node_id: string
        }[]
      }
      start_hero_runtime_activity: {
        Args: {
          p_activity_kind: string
          p_available_at?: string
          p_expires_at?: string
          p_hero_id: string
          p_metadata_json?: Json
          p_reason?: string
          p_request_id?: string
          p_source_entity_id?: string
          p_source_entity_type?: string
        }
        Returns: {
          activity_kind: string
          available_at: string | null
          created_at: string
          ended_at: string | null
          expires_at: string | null
          hero_id: string
          id: string
          metadata_json: Json
          reason: string | null
          request_id: string | null
          server_id: string
          source_entity_id: string | null
          source_entity_type: string | null
          started_at: string
          status: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "hero_runtime_activities"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      start_manual_combat_session: {
        Args: {
          p_request_id?: string
          p_source_entity_id: string
          p_source_entity_type: string
        }
        Returns: {
          awaiting_player_action: boolean
          combat_session_id: string
          current_action_index: number
          current_actor_participant_id: string
          current_round_number: number
          current_timing_manifest_json: Json
          event_count: number
          events_json: Json
          final_combat_result_id: string
          participants_json: Json
          round_order_json: Json
          server_id: string
          source_entity_id: string
          source_entity_type: string
          source_type: Database["public"]["Enums"]["combat_source_type"]
          status_key: string
          status_label: string
          updated_at: string
        }[]
      }
      start_manual_trial_runtime_session: {
        Args: { p_attempt_id: string; p_request_id?: string }
        Returns: {
          accessibility_policy_json: Json
          attempt_id: string
          hero_id: string
          inactivity_policy_json: Json
          manifest_expires_at: string
          manifest_hash: string
          manifest_id: string
          manifest_status_key: string
          manifest_version: number
          manual_session_id: string
          minigame_config_json: Json
          minigame_key: string
          player_manifest_json: Json
          report_policy_json: Json
          server_id: string
          session_expires_at: string
          session_status_key: string
          started_at: string
          timing_policy_json: Json
          trial_definition_id: string
        }[]
      }
      start_or_get_hero_exploration: {
        Args: { p_difficulty_key: string; p_hero_id: string }
        Returns: {
          current_node_id: string
          difficulty_key: string
          exploration_date: string
          exploration_id: string
          hero_id: string
          remaining_trials: number
          server_id: string
          status: string
          trial_dry_step_count: number
        }[]
      }
      start_or_get_hero_exploration_and_start_initial_step: {
        Args: {
          p_difficulty_key: string
          p_hero_id: string
          p_request_id?: string
        }
        Returns: Json
      }
      start_pvp_action: {
        Args: {
          p_action_kind: string
          p_attacker_hero_id: string
          p_reason?: string
          p_request_id?: string
          p_target_hero_id: string
        }
        Returns: {
          action_kind: string
          arrives_at: string
          attack_travel_time_seconds: number
          attacker_estate_id: string
          attacker_hero_id: string
          distance_score: number
          manual_deadline_at: string
          manual_fight_window_seconds: number
          pvp_action_id: string
          runtime_activity_id: string
          server_id: string
          spy_travel_time_seconds: number
          started_at: string
          status: string
          target_estate_id: string
          target_hero_id: string
          target_protection_id: string
          target_protection_seconds: number
          travel_time_seconds: number
        }[]
      }
      submit_combat_player_action: {
        Args: {
          p_request_id?: string
          p_session_id: string
          p_timing_input_json: Json
        }
        Returns: {
          awaiting_player_action: boolean
          combat_session_id: string
          current_action_index: number
          current_actor_participant_id: string
          current_round_number: number
          current_timing_manifest_json: Json
          event_count: number
          events_json: Json
          final_combat_result_id: string
          participants_json: Json
          round_order_json: Json
          server_id: string
          source_entity_id: string
          source_entity_type: string
          source_type: Database["public"]["Enums"]["combat_source_type"]
          status_key: string
          status_label: string
          updated_at: string
        }[]
      }
      submit_manual_trial_action_log: {
        Args: {
          p_action_log_json: Json
          p_attempt_id: string
          p_client_environment_summary_json?: Json
          p_client_observed_summary_json?: Json
          p_client_timing_summary_json?: Json
          p_manifest_hash: string
          p_manifest_id: string
          p_manifest_version: number
          p_manual_session_id: string
          p_request_id: string
        }
        Returns: {
          action_log_id: string
          attempt_id: string
          backend_replay_summary_json: Json
          failure_reason_helper_text: string
          failure_reason_key: string
          failure_reason_label: string
          game_report_id: string
          hero_id: string
          manual_session_id: string
          minigame_key: string
          outcome_key: string
          performance_rating: string
          player_report_summary_json: Json
          resolution_mode_key: string
          resolved_at: string
          reward_grant_id: string
          reward_summary_json: Json
          score: number
          server_id: string
          trial_definition_id: string
          validation_reason_key: string
          validation_reason_label: string
          validation_reason_severity: string
          validation_warnings_json: Json
          verdict_id: string
        }[]
      }
      sync_hero_health_state: {
        Args: { p_hero_id: string; p_reason?: string }
        Returns: {
          current_health: number
          hero_id: string
          max_health: number
          metadata_json: Json
          reset_policy_key: string
          server_id: string
          synced_at: string
        }[]
      }
      sync_server_membership_from_moderation: {
        Args: { p_server_id: string; p_user_id: string }
        Returns: undefined
      }
      test_grant_reward_profile_to_hero: {
        Args: {
          p_hero_id: string
          p_reason: string
          p_reward_profile_id: string
          p_server_id: string
        }
        Returns: {
          entries_json: Json
          recipient_hero_id: string
          reward_grant_id: string
          reward_profile_id: string
          status: string
        }[]
      }
      trade_item_value_bucket: {
        Args: { p_drachma_value: number }
        Returns: number
      }
      transfer_guild_leadership: {
        Args: {
          p_actor_hero_id: string
          p_reason?: string
          p_request_id?: string
          p_target_hero_id: string
        }
        Returns: {
          audit_log_id: string
          guild_id: string
          new_leader_hero_id: string
          new_leader_membership_id: string
          new_leader_new_role_key: string
          new_leader_old_role_key: string
          old_leader_hero_id: string
          old_leader_membership_id: string
          old_leader_new_role_key: string
        }[]
      }
      try_write_anti_abuse_case_audit: {
        Args: {
          p_action_type_key: string
          p_case_id: string
          p_entity_id: string
          p_entity_type_key: string
          p_metadata_json?: Json
          p_new_value_json?: Json
          p_old_value_json?: Json
          p_reason?: string
        }
        Returns: string
      }
      try_write_config_change_set_audit: {
        Args: {
          p_action_type_key: string
          p_change_set_id: string
          p_metadata_json?: Json
          p_new_value_json?: Json
          p_old_value_json?: Json
          p_reason?: string
        }
        Returns: string
      }
      unequip_hero_item: {
        Args: {
          p_hero_id: string
          p_item_id?: string
          p_request_id?: string
          p_slot_key?: string
        }
        Returns: {
          action_key: string
          final_equipment_json: Json
          hero_id: string
          item_id: string
          journal_json: Json
          message: string
          request_id: string
          slot_key: string
          success: boolean
        }[]
      }
      unlock_auction_item: {
        Args: { p_auction_listing_id: string }
        Returns: number
      }
      unlock_trade_offer_items: {
        Args: { p_offer_id: string }
        Returns: number
      }
      unwatch_auction_listing: {
        Args: { p_auction_listing_id: string; p_hero_id: string }
        Returns: string
      }
      update_entity_requirement: {
        Args: {
          p_applies_from_level?: number
          p_description?: string
          p_is_active?: boolean
          p_reason?: string
          p_required_building_key?: string
          p_required_district_code?: string
          p_required_resource_type?: string
          p_required_stat_key?: string
          p_required_value_boolean?: boolean
          p_required_value_decimal?: number
          p_required_value_integer?: number
          p_required_value_text?: string
          p_requirement_definition_key: string
          p_requirement_id: string
          p_requirement_scope_key?: string
          p_sort_order?: number
        }
        Returns: {
          applies_from_level: number
          context: string
          created_at: string
          description: string | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["requirement_entity_type"]
          id: string
          is_active: boolean
          params_json: Json
          required_building_key: string | null
          required_district_code: string | null
          required_resource_type: string | null
          required_stat_key: string | null
          required_value_boolean: boolean | null
          required_value_decimal: number | null
          required_value_integer: number | null
          required_value_text: string | null
          requirement_definition_key: string
          sort_order: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "entity_requirements"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_item_requirement_aggregation_settings: {
        Args: {
          p_additional_requirement_fraction: number
          p_is_active: boolean
          p_metadata_json?: Json
          p_min_required_value: number
          p_reason: string
          p_request_id?: string
          p_rounding_mode: string
        }
        Returns: {
          additional_requirement_fraction: number
          audit_log_id: string
          created_at: string
          id: boolean
          is_active: boolean
          min_required_value: number
          new_value_json: Json
          old_value_json: Json
          reason: string
          request_id: string
          rounding_mode: string
          updated_at: string
          updated_by: string
        }[]
      }
      update_server_event_config: {
        Args: {
          p_cooldown_days?: number
          p_default_duration_days?: number
          p_future_council_activation_days_after_vote?: number
          p_future_council_activation_rule?: string
          p_future_council_activation_weekday?: number
          p_future_council_proposal_count?: number
          p_future_council_vote_duration_days?: number
          p_metadata_json?: Json
          p_reason?: string
          p_request_id?: string
          p_server_id: string
          p_system_roll_chance_percent?: number
          p_system_roll_enabled?: boolean
        }
        Returns: {
          cooldown_days: number
          created_at: string
          default_duration_days: number
          future_council_activation_days_after_vote: number
          future_council_activation_rule: string
          future_council_activation_weekday: number | null
          future_council_proposal_count: number
          future_council_vote_duration_days: number
          metadata_json: Json
          server_id: string
          system_roll_chance_percent: number
          system_roll_enabled: boolean
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "server_event_config"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      upsert_combat_opponent_attack_source: {
        Args: {
          p_admin_description?: string
          p_attack_count?: number
          p_attack_source_id?: string
          p_critical_chance?: number
          p_critical_damage?: number
          p_description?: string
          p_helper_text?: string
          p_is_active?: boolean
          p_key?: string
          p_label?: string
          p_max_damage?: number
          p_max_opponent_level?: number
          p_min_damage?: number
          p_min_opponent_level?: number
          p_opponent_definition_id?: string
          p_reason?: string
          p_request_id?: string
          p_sort_order?: number
        }
        Returns: {
          admin_description: string | null
          attack_count: number
          created_at: string
          critical_chance: number
          critical_damage: number
          description: string | null
          helper_text: string | null
          id: string
          is_active: boolean
          key: string
          label: string
          max_damage: number
          max_opponent_level: number | null
          min_damage: number
          min_opponent_level: number | null
          opponent_definition_id: string
          sort_order: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "combat_opponent_attack_sources"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      upsert_combat_opponent_definition: {
        Args: {
          p_admin_description?: string
          p_default_scaling_formula_id?: string
          p_description?: string
          p_equipment_mode?: Database["public"]["Enums"]["combat_opponent_equipment_mode"]
          p_family_key?: string
          p_helper_text?: string
          p_is_active?: boolean
          p_key?: string
          p_label?: string
          p_opponent_definition_id?: string
          p_reason?: string
          p_request_id?: string
          p_sort_order?: number
        }
        Returns: {
          admin_description: string | null
          created_at: string
          default_scaling_formula_id: string | null
          description: string | null
          equipment_mode: Database["public"]["Enums"]["combat_opponent_equipment_mode"]
          family_key: string
          helper_text: string | null
          id: string
          is_active: boolean
          key: string
          label: string
          sort_order: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "combat_opponent_definitions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      upsert_combat_opponent_equipment_entry: {
        Args: {
          p_entry_mode?: Database["public"]["Enums"]["combat_opponent_equipment_mode"]
          p_equipment_entry_id?: string
          p_generated_bucket_profile_id?: string
          p_generated_max_quality_key?: string
          p_is_active?: boolean
          p_manual_base_id?: string
          p_manual_prefix_affix_id?: string
          p_manual_quality_key?: string
          p_manual_suffix_affix_id?: string
          p_max_opponent_level?: number
          p_min_opponent_level?: number
          p_opponent_definition_id?: string
          p_reason?: string
          p_request_id?: string
          p_slot_key?: string
          p_sort_order?: number
        }
        Returns: {
          created_at: string
          entry_mode: Database["public"]["Enums"]["combat_opponent_equipment_mode"]
          generated_bucket_profile_id: string | null
          generated_max_quality_key: string | null
          id: string
          is_active: boolean
          manual_base_id: string | null
          manual_prefix_affix_id: string | null
          manual_quality_key: string | null
          manual_suffix_affix_id: string | null
          max_opponent_level: number | null
          min_opponent_level: number | null
          opponent_definition_id: string
          slot_key: string
          sort_order: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "combat_opponent_equipment_entries"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      upsert_combat_opponent_family: {
        Args: {
          p_admin_description?: string
          p_description?: string
          p_helper_text?: string
          p_is_active?: boolean
          p_key: string
          p_label: string
          p_reason?: string
          p_request_id?: string
          p_sort_order?: number
        }
        Returns: {
          admin_description: string | null
          created_at: string
          description: string | null
          helper_text: string | null
          is_active: boolean
          key: string
          label: string
          sort_order: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "combat_opponent_families"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      upsert_combat_opponent_stat_value: {
        Args: {
          p_base_value?: number
          p_opponent_definition_id?: string
          p_reason?: string
          p_request_id?: string
          p_sort_order?: number
          p_stat_key?: string
          p_stat_value_id?: string
        }
        Returns: {
          base_value: number
          created_at: string
          id: string
          opponent_definition_id: string
          sort_order: number
          stat_key: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "combat_opponent_stat_values"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      upsert_config_entity_field_change: {
        Args: {
          p_change_set_id: string
          p_entity_id: string
          p_entity_type: Database["public"]["Enums"]["config_managed_entity_type"]
          p_field_path: string
          p_metadata_json?: Json
          p_new_value_json: Json
          p_reason?: string
          p_request_id?: string
        }
        Returns: {
          change_set_id: string
          conflict_status: string
          created_new: boolean
          entity_id: string
          entity_type: Database["public"]["Enums"]["config_managed_entity_type"]
          entry_id: string
          field_path: string
          live_value_json: Json
          new_value_json: Json
          old_value_json: Json
          replaced_entry_id: string
        }[]
      }
      upsert_encounter_combat_candidate: {
        Args: {
          p_candidate_id?: string
          p_candidate_kind?: Database["public"]["Enums"]["combat_candidate_kind"]
          p_difficulty_multiplier?: number
          p_encounter_definition_id?: string
          p_family_key?: string
          p_is_active?: boolean
          p_max_hero_level?: number
          p_min_hero_level?: number
          p_opponent_definition_id?: string
          p_reason?: string
          p_request_id?: string
          p_scaling_formula_id?: string
          p_sort_order?: number
          p_weight?: number
        }
        Returns: {
          candidate_kind: Database["public"]["Enums"]["combat_candidate_kind"]
          created_at: string
          difficulty_multiplier: number
          encounter_definition_id: string
          family_key: string | null
          id: string
          is_active: boolean
          max_hero_level: number | null
          min_hero_level: number | null
          opponent_definition_id: string | null
          scaling_formula_id: string | null
          sort_order: number
          updated_at: string
          weight: number
        }
        SetofOptions: {
          from: "*"
          to: "encounter_combat_candidates"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      upsert_encounter_definition: {
        Args: {
          p_admin_description?: string
          p_description?: string
          p_encounter_definition_id?: string
          p_encounter_kind?: string
          p_helper_text?: string
          p_is_active?: boolean
          p_key?: string
          p_label?: string
          p_max_difficulty_key?: string
          p_max_district_code?: string
          p_metadata_json?: Json
          p_min_difficulty_key?: string
          p_min_district_code?: string
          p_minigame_key?: string
          p_reason?: string
          p_request_id?: string
          p_reward_profile_id?: string
          p_sort_order?: number
        }
        Returns: {
          admin_description: string | null
          created_at: string
          description: string
          encounter_kind: string
          helper_text: string | null
          id: string
          is_active: boolean
          key: string
          label: string
          max_difficulty_key: string | null
          max_district_code: string | null
          metadata_json: Json
          min_difficulty_key: string | null
          min_district_code: string | null
          minigame_key: string | null
          reward_profile_id: string | null
          sort_order: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "encounter_definitions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      upsert_encounter_description_variant: {
        Args: {
          p_description?: string
          p_encounter_definition_id?: string
          p_helper_text?: string
          p_is_active?: boolean
          p_label?: string
          p_metadata_json?: Json
          p_reason?: string
          p_request_id?: string
          p_sort_order?: number
          p_variant_id?: string
        }
        Returns: {
          created_at: string
          description: string
          encounter_definition_id: string
          helper_text: string | null
          id: string
          is_active: boolean
          label: string | null
          metadata_json: Json
          sort_order: number
        }
        SetofOptions: {
          from: "*"
          to: "encounter_description_variants"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      upsert_encounter_effect_payload: {
        Args: {
          p_admin_description?: string
          p_chance_percent?: number
          p_description?: string
          p_effect_definition_id?: string
          p_encounter_definition_id?: string
          p_helper_text?: string
          p_is_active?: boolean
          p_metadata_json?: Json
          p_payload_id?: string
          p_reason?: string
          p_request_id?: string
          p_sort_order?: number
        }
        Returns: {
          admin_description: string | null
          chance_percent: number
          created_at: string
          description: string | null
          effect_definition_id: string
          encounter_definition_id: string
          helper_text: string | null
          id: string
          is_active: boolean
          metadata_json: Json
          sort_order: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "encounter_effect_payloads"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      upsert_encounter_resource_payload: {
        Args: {
          p_admin_description?: string
          p_amount_mode?: string
          p_chance_percent?: number
          p_description?: string
          p_encounter_definition_id?: string
          p_formula_id?: string
          p_helper_text?: string
          p_is_active?: boolean
          p_max_amount?: number
          p_metadata_json?: Json
          p_min_amount?: number
          p_payload_id?: string
          p_reason?: string
          p_request_id?: string
          p_resource_type?: string
          p_sort_order?: number
        }
        Returns: {
          admin_description: string | null
          amount_mode: string
          chance_percent: number
          created_at: string
          description: string | null
          encounter_definition_id: string
          formula_id: string | null
          helper_text: string | null
          id: string
          is_active: boolean
          max_amount: number | null
          metadata_json: Json
          min_amount: number | null
          resource_type: string
          sort_order: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "encounter_resource_payloads"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      upsert_exploration_effect_definition: {
        Args: {
          p_admin_description?: string
          p_bonus_template_id?: string
          p_default_duration_steps?: number
          p_default_value?: number
          p_description?: string
          p_effect_definition_id?: string
          p_effect_kind?: string
          p_helper_text?: string
          p_is_active?: boolean
          p_key?: string
          p_label?: string
          p_metadata_json?: Json
          p_reason?: string
          p_request_id?: string
          p_sort_order?: number
        }
        Returns: {
          admin_description: string | null
          bonus_template_id: string | null
          created_at: string
          default_duration_steps: number | null
          default_value: number | null
          description: string
          effect_kind: string
          helper_text: string | null
          id: string
          is_active: boolean
          key: string
          label: string
          metadata_json: Json
          sort_order: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "exploration_effect_definitions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      upsert_level_up_stat_bonus_rule: {
        Args: {
          p_admin_description?: string
          p_description?: string
          p_fixed_amount?: number
          p_fixed_stat_key?: string
          p_helper_text?: string
          p_is_active?: boolean
          p_key?: string
          p_label?: string
          p_level_interval?: number
          p_level_match_kind?: string
          p_level_value?: number
          p_max_level_value?: number
          p_max_total_amount?: number
          p_metadata_json?: Json
          p_min_total_amount?: number
          p_reason?: string
          p_request_id?: string
          p_rule_id?: string
          p_rule_kind?: string
          p_sort_order?: number
        }
        Returns: {
          admin_description: string | null
          created_at: string
          created_by: string | null
          description: string
          fixed_amount: number | null
          fixed_stat_key: string | null
          helper_text: string | null
          id: string
          is_active: boolean
          key: string
          label: string
          level_interval: number | null
          level_match_kind: string
          level_value: number | null
          max_level_value: number | null
          max_total_amount: number | null
          metadata_json: Json
          min_total_amount: number | null
          rule_kind: string
          sort_order: number
          updated_at: string
          updated_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "level_up_stat_bonus_rules"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      upsert_level_up_stat_bonus_rule_stat: {
        Args: {
          p_admin_description?: string
          p_helper_text?: string
          p_is_active?: boolean
          p_max_points_per_level?: number
          p_metadata_json?: Json
          p_reason?: string
          p_request_id?: string
          p_rule_id?: string
          p_rule_stat_id?: string
          p_sort_order?: number
          p_stat_key?: string
          p_weight?: number
        }
        Returns: {
          admin_description: string | null
          created_at: string
          created_by: string | null
          helper_text: string | null
          id: string
          is_active: boolean
          max_points_per_level: number | null
          metadata_json: Json
          rule_id: string
          sort_order: number
          stat_key: string
          updated_at: string
          updated_by: string | null
          weight: number
        }
        SetofOptions: {
          from: "*"
          to: "level_up_stat_bonus_rule_stats"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      upsert_resource_type: {
        Args: {
          p_admin_description?: string
          p_description?: string
          p_helper_text?: string
          p_is_active?: boolean
          p_key?: string
          p_label?: string
          p_metadata_json?: Json
          p_reason?: string
          p_request_id?: string
          p_sort_order?: number
        }
        Returns: {
          admin_description: string | null
          created_at: string
          description: string
          helper_text: string | null
          is_active: boolean
          key: string
          label: string
          metadata_json: Json
          sort_order: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "resource_types"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      upsert_reward_outcome_kind: {
        Args: {
          p_admin_description?: string
          p_description?: string
          p_helper_text?: string
          p_is_active?: boolean
          p_key?: string
          p_label?: string
          p_metadata_json?: Json
          p_reason?: string
          p_request_id?: string
          p_sort_order?: number
          p_source_kind?: string
        }
        Returns: {
          admin_description: string | null
          created_at: string
          description: string
          helper_text: string | null
          is_active: boolean
          key: string
          label: string
          metadata_json: Json
          sort_order: number
          source_kind: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "reward_outcome_kinds"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      upsert_reward_profile: {
        Args: {
          p_admin_description?: string
          p_category?: string
          p_description?: string
          p_helper_text?: string
          p_is_active?: boolean
          p_key?: string
          p_label?: string
          p_metadata_json?: Json
          p_reason?: string
          p_request_id?: string
          p_reward_profile_id?: string
          p_sort_order?: number
        }
        Returns: {
          admin_description: string | null
          category: string
          created_at: string
          description: string
          helper_text: string | null
          id: string
          is_active: boolean
          key: string
          label: string
          metadata_json: Json
          sort_order: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "reward_profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      upsert_reward_profile_assignment: {
        Args: {
          p_assignment_id?: string
          p_description?: string
          p_difficulty_key?: string
          p_difficulty_match_kind?: string
          p_district_code?: string
          p_district_match_kind?: string
          p_encounter_definition_id?: string
          p_helper_text?: string
          p_is_active?: boolean
          p_level_interval?: number
          p_level_match_kind?: string
          p_level_value?: number
          p_max_difficulty_key?: string
          p_max_district_code?: string
          p_max_level_value?: number
          p_metadata_json?: Json
          p_outcome_kind?: string
          p_reason?: string
          p_request_id?: string
          p_reward_profile_id?: string
          p_sort_order?: number
          p_source_kind?: string
          p_trial_definition_id?: string
        }
        Returns: {
          created_at: string
          description: string | null
          difficulty_key: string | null
          difficulty_match_kind: string
          district_code: string | null
          district_match_kind: string
          encounter_definition_id: string | null
          helper_text: string | null
          id: string
          is_active: boolean
          level_interval: number | null
          level_match_kind: string
          level_value: number | null
          max_difficulty_key: string | null
          max_district_code: string | null
          max_level_value: number | null
          metadata_json: Json
          outcome_kind: string
          reward_profile_id: string
          sort_order: number
          source_kind: string
          trial_definition_id: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "reward_profile_assignments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      upsert_reward_profile_entry: {
        Args: {
          p_admin_description?: string
          p_amount_mode?: string
          p_bucket_profile_id?: string
          p_chance_percent?: number
          p_description?: string
          p_effect_definition_id?: string
          p_entry_id?: string
          p_entry_kind?: string
          p_formula_id?: string
          p_helper_text?: string
          p_is_active?: boolean
          p_label?: string
          p_max_amount?: number
          p_max_item_count?: number
          p_max_quality_key?: string
          p_metadata_json?: Json
          p_min_amount?: number
          p_min_item_count?: number
          p_reason?: string
          p_request_id?: string
          p_resource_type?: string
          p_reward_profile_id?: string
          p_sort_order?: number
          p_transfer_recipient_role?: string
          p_transfer_source_role?: string
        }
        Returns: {
          admin_description: string | null
          amount_mode: string
          bucket_profile_id: string | null
          chance_percent: number
          created_at: string
          description: string
          effect_definition_id: string | null
          entry_kind: string
          formula_id: string | null
          helper_text: string | null
          id: string
          is_active: boolean
          label: string
          max_amount: number | null
          max_item_count: number | null
          max_quality_key: string | null
          metadata_json: Json
          min_amount: number | null
          min_item_count: number | null
          resource_type: string | null
          reward_profile_id: string
          sort_order: number
          transfer_recipient_role: string | null
          transfer_source_role: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "reward_profile_entries"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      upsert_server_event_definition: {
        Args: {
          p_admin_notes?: string
          p_default_duration_days?: number
          p_definition_id?: string
          p_effect_explanation?: string
          p_event_polarity?: string
          p_helper_text?: string
          p_is_active?: boolean
          p_key?: string
          p_lore_description?: string
          p_lore_name?: string
          p_metadata_json?: Json
          p_player_summary?: string
          p_reason?: string
          p_request_id?: string
          p_server_id: string
          p_sort_order?: number
        }
        Returns: {
          admin_notes: string | null
          created_at: string
          default_duration_days: number | null
          effect_explanation: string
          event_polarity: string
          helper_text: string | null
          id: string
          is_active: boolean
          key: string
          lore_description: string
          lore_name: string
          metadata_json: Json
          player_summary: string
          sort_order: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "server_event_definitions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      upsert_server_event_effect: {
        Args: {
          p_admin_description?: string
          p_definition_id?: string
          p_effect_id?: string
          p_is_active?: boolean
          p_metadata_json?: Json
          p_numeric_value?: number
          p_operation?: string
          p_player_description?: string
          p_player_label?: string
          p_reason?: string
          p_request_id?: string
          p_server_id: string
          p_sort_order?: number
          p_target_family?: string
          p_target_key?: string
        }
        Returns: {
          admin_description: string | null
          created_at: string
          definition_id: string
          id: string
          is_active: boolean
          metadata_json: Json
          numeric_value: number
          operation: string
          player_description: string
          player_label: string
          sort_order: number
          target_family: string
          target_key: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "server_event_effects"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      upsert_trial_combat_candidate: {
        Args: {
          p_candidate_id?: string
          p_candidate_kind?: Database["public"]["Enums"]["combat_candidate_kind"]
          p_difficulty_multiplier?: number
          p_family_key?: string
          p_is_active?: boolean
          p_max_hero_level?: number
          p_min_hero_level?: number
          p_opponent_definition_id?: string
          p_reason?: string
          p_request_id?: string
          p_scaling_formula_id?: string
          p_sort_order?: number
          p_trial_definition_id?: string
          p_weight?: number
        }
        Returns: {
          candidate_kind: Database["public"]["Enums"]["combat_candidate_kind"]
          created_at: string
          difficulty_multiplier: number
          family_key: string | null
          id: string
          is_active: boolean
          max_hero_level: number | null
          min_hero_level: number | null
          opponent_definition_id: string | null
          scaling_formula_id: string | null
          sort_order: number
          trial_definition_id: string
          updated_at: string
          weight: number
        }
        SetofOptions: {
          from: "*"
          to: "trial_combat_candidates"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      upsert_trial_definition: {
        Args: {
          p_admin_description?: string
          p_description?: string
          p_helper_text?: string
          p_is_active?: boolean
          p_key?: string
          p_label?: string
          p_metadata_json?: Json
          p_minigame_key?: string
          p_reason?: string
          p_request_id?: string
          p_sort_order?: number
          p_tested_stat_key?: string
          p_trial_definition_id?: string
        }
        Returns: {
          admin_description: string | null
          created_at: string
          description: string
          helper_text: string | null
          id: string
          is_active: boolean
          key: string
          label: string
          metadata_json: Json
          minigame_key: string
          sort_order: number
          tested_stat_key: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "trial_definitions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      user_has_global_role: {
        Args: { required_keys: string[]; target_user_id: string }
        Returns: boolean
      }
      user_has_hero_on_server: {
        Args: { p_server_id: string; p_user_id: string }
        Returns: boolean
      }
      user_has_staff_disqualifying_history: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      user_has_staff_disqualifying_punishment: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      validate_config_change_set_entries_for_apply: {
        Args: { p_change_set_id: string }
        Returns: number
      }
      validate_config_change_set_entries_for_d5: {
        Args: { p_change_set_id: string }
        Returns: number
      }
      validate_config_draft_entity_field_value: {
        Args: {
          p_entity_type: Database["public"]["Enums"]["config_managed_entity_type"]
          p_field_path: string
          p_new_value_json: Json
        }
        Returns: Json
      }
      validate_entity_requirement_payload: {
        Args: {
          p_required_building_key?: string
          p_required_district_code?: string
          p_required_resource_type?: string
          p_required_stat_key?: string
          p_required_value_boolean?: boolean
          p_required_value_decimal?: number
          p_required_value_integer?: number
          p_required_value_text?: string
          p_requirement_definition_key: string
        }
        Returns: undefined
      }
      vendor_scrap_hero_item: {
        Args: {
          p_actor_hero_id: string
          p_item_id: string
          p_reason?: string
          p_request_id?: string
        }
        Returns: {
          balance_after: number
          drachma_amount: number
          item_audit_log_id: string
          item_id: string
          item_status: Database["public"]["Enums"]["item_status"]
          recoverable_until: string
          resource_type: string
          scrapped_at: string
          vendor_audit_log_id: string
        }[]
      }
      vote_guild_emergency_election: {
        Args: {
          p_candidate_hero_id: string
          p_election_id: string
          p_reason?: string
          p_request_id?: string
          p_voter_hero_id: string
        }
        Returns: {
          audit_log_id: string
          candidate_hero_id: string
          election_id: string
          guild_id: string
          vote_id: string
          voter_hero_id: string
        }[]
      }
      watch_auction_listing: {
        Args: { p_auction_listing_id: string; p_hero_id: string }
        Returns: string
      }
      withdraw_guild_armory_item: {
        Args: {
          p_actor_hero_id: string
          p_armory_item_id: string
          p_reason?: string
          p_request_id?: string
        }
        Returns: {
          armory_item_id: string
          audit_log_id: string
          guild_id: string
          item_id: string
          owner_hero_id: string
          status_key: string
        }[]
      }
      write_audit_log: {
        Args: {
          p_action_type_key: string
          p_actor_hero_id?: string
          p_entity_id?: string
          p_entity_type_key: string
          p_metadata_json?: Json
          p_new_value_json?: Json
          p_old_value_json?: Json
          p_reason?: string
          p_request_id?: string
          p_server_id?: string
          p_severity?: Database["public"]["Enums"]["audit_severity"]
          p_target_hero_id?: string
          p_target_user_id?: string
        }
        Returns: string
      }
    }
    Enums: {
      anti_abuse_case_source: "system_signal" | "player_report" | "manual"
      anti_abuse_case_status:
        | "open"
        | "in_review"
        | "waiting_for_player"
        | "resolved"
        | "cancelled"
      anti_abuse_case_verdict:
        | "no_abuse"
        | "insufficient_evidence"
        | "abuse_confirmed"
        | "resolved_by_voluntary_return"
      anti_abuse_sanction_status:
        | "pending"
        | "applied"
        | "completed"
        | "cancelled"
        | "forgiven"
        | "failed"
      audit_severity: "debug" | "info" | "notice" | "warning" | "critical"
      bonus_type: "flat" | "percent" | "per_4_levels"
      character_point_ledger_reason:
        | "migration_hero_derived_hp"
        | "experience_gain"
        | "stat_upgrade"
        | "direct_trade_spent"
        | "direct_trade_received"
        | "auction_purchase_spent"
        | "auction_sale_received"
        | "anti_abuse_penalty"
        | "penalty_payment"
        | "refund"
        | "admin_adjustment"
        | "system_correction"
      character_point_lock_reason:
        | "direct_trade"
        | "auction_bid"
        | "auction_buy_now"
      character_point_lock_status:
        | "active"
        | "consumed"
        | "released"
        | "expired"
        | "failed"
      combat_attack_source_kind:
        | "natural"
        | "unarmed"
        | "player_item"
        | "opponent_manual"
        | "opponent_generated"
      combat_candidate_kind: "opponent" | "family"
      combat_opponent_equipment_mode: "none" | "manual" | "generated"
      combat_outcome: "initiator_victory" | "defender_victory" | "draw"
      combat_participant_kind: "hero" | "opponent"
      combat_side: "initiator" | "defender"
      combat_source_type:
        | "encounter"
        | "trial"
        | "pvp"
        | "sandbox"
        | "admin_test"
      config_change_kind:
        | "scope_change"
        | "global_value_change"
        | "server_value_change"
        | "definition_change"
        | "activation_change"
        | "entity_field_change"
      config_change_status: "draft" | "ready" | "applied" | "cancelled"
      config_change_visibility: "none" | "internal" | "public"
      config_governance_scope:
        | "product_global"
        | "global_balance"
        | "server_launch"
        | "live_server"
        | "test_override"
      config_managed_entity_type:
        | "scalar_config"
        | "json_config"
        | "balance_formula"
        | "balance_formula_assignment"
        | "entity_formula_assignment"
        | "bonus_template"
        | "building_definition"
        | "item_generation_base"
        | "item_generation_affix"
        | "item_generation_quality"
        | "item_generation_bucket_profile"
        | "server_setting"
        | "requirement_definition"
        | "entity_requirement"
        | "building_district_level_cap"
        | "bonus_type"
        | "bonus_scope"
        | "bonus_target_category"
        | "bonus_target"
        | "entity_bonus"
        | "derived_stat_definition"
        | "trial_definition"
        | "encounter_definition"
        | "reward_profile"
        | "reward_profile_assignment"
        | "reward_profile_entry"
      config_value_status: "draft" | "active" | "archived"
      config_value_type:
        | "integer"
        | "decimal"
        | "boolean"
        | "string"
        | "json"
        | "formula_ref"
        | "enum_ref"
        | "entity_ref"
      estate_building_job_status:
        | "active"
        | "completed"
        | "cancelled"
        | "failed"
      game_report_access_role: "owner" | "participant" | "viewer"
      game_report_item_source_kind: "reward_drop"
      game_report_source_entity_type:
        | "combat_result"
        | "trial_result"
        | "encounter_result"
        | "pvp_result"
        | "siege_result"
      game_server_kind: "sandbox" | "standard"
      game_server_status:
        | "draft"
        | "testing"
        | "scheduled"
        | "live"
        | "archived"
      item_status: "active" | "scrapped" | "locked_trade" | "locked_auction"
      moderation_action_status:
        | "active"
        | "expired"
        | "cancelled"
        | "overturned"
        | "escalated"
      notification_recipient_kind: "user" | "hero" | "staff"
      notification_severity: "info" | "notice" | "warning" | "critical"
      player_abuse_report_status:
        | "submitted"
        | "linked_to_case"
        | "dismissed"
        | "resolved"
      player_auction_bid_status:
        | "active"
        | "outbid"
        | "winning"
        | "cancelled"
        | "refunded"
        | "failed"
      player_auction_mode: "bidding" | "buy_now" | "bidding_with_buy_now"
      player_auction_status:
        | "draft"
        | "active"
        | "completed"
        | "cancelled"
        | "expired"
        | "failed"
      player_relationship_declaration_status:
        | "draft"
        | "submitted"
        | "approved"
        | "rejected"
        | "revoked"
        | "expired"
        | "completed"
      player_trade_offer_status:
        | "pending_target"
        | "pending_creator"
        | "completed"
        | "rejected"
        | "cancelled"
        | "expired"
        | "failed"
      player_trade_side: "creator" | "target"
      player_trade_transaction_status: "completed" | "reversed" | "failed"
      player_trade_transaction_type: "direct_trade" | "auction_sale"
      requirement_entity_type:
        | "building_definition"
        | "item_generation_base"
        | "item_generation_affix"
        | "item"
        | "trial_definition"
        | "trade_feature"
        | "auction_feature"
      requirement_value_type:
        | "integer"
        | "decimal"
        | "boolean"
        | "string"
        | "stat_key"
        | "building_key"
        | "resource_type"
        | "district_code"
        | "enum_ref"
      server_config_value_source:
        | "manual_server_launch"
        | "global_snapshot"
        | "live_override"
        | "test_override"
        | "migration"
      server_membership_status: "active" | "suspended" | "banned"
      server_staff_role: "owner" | "operator" | "moderator" | "tester"
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
    Enums: {
      anti_abuse_case_source: ["system_signal", "player_report", "manual"],
      anti_abuse_case_status: [
        "open",
        "in_review",
        "waiting_for_player",
        "resolved",
        "cancelled",
      ],
      anti_abuse_case_verdict: [
        "no_abuse",
        "insufficient_evidence",
        "abuse_confirmed",
        "resolved_by_voluntary_return",
      ],
      anti_abuse_sanction_status: [
        "pending",
        "applied",
        "completed",
        "cancelled",
        "forgiven",
        "failed",
      ],
      audit_severity: ["debug", "info", "notice", "warning", "critical"],
      bonus_type: ["flat", "percent", "per_4_levels"],
      character_point_ledger_reason: [
        "migration_hero_derived_hp",
        "experience_gain",
        "stat_upgrade",
        "direct_trade_spent",
        "direct_trade_received",
        "auction_purchase_spent",
        "auction_sale_received",
        "anti_abuse_penalty",
        "penalty_payment",
        "refund",
        "admin_adjustment",
        "system_correction",
      ],
      character_point_lock_reason: [
        "direct_trade",
        "auction_bid",
        "auction_buy_now",
      ],
      character_point_lock_status: [
        "active",
        "consumed",
        "released",
        "expired",
        "failed",
      ],
      combat_attack_source_kind: [
        "natural",
        "unarmed",
        "player_item",
        "opponent_manual",
        "opponent_generated",
      ],
      combat_candidate_kind: ["opponent", "family"],
      combat_opponent_equipment_mode: ["none", "manual", "generated"],
      combat_outcome: ["initiator_victory", "defender_victory", "draw"],
      combat_participant_kind: ["hero", "opponent"],
      combat_side: ["initiator", "defender"],
      combat_source_type: [
        "encounter",
        "trial",
        "pvp",
        "sandbox",
        "admin_test",
      ],
      config_change_kind: [
        "scope_change",
        "global_value_change",
        "server_value_change",
        "definition_change",
        "activation_change",
        "entity_field_change",
      ],
      config_change_status: ["draft", "ready", "applied", "cancelled"],
      config_change_visibility: ["none", "internal", "public"],
      config_governance_scope: [
        "product_global",
        "global_balance",
        "server_launch",
        "live_server",
        "test_override",
      ],
      config_managed_entity_type: [
        "scalar_config",
        "json_config",
        "balance_formula",
        "balance_formula_assignment",
        "entity_formula_assignment",
        "bonus_template",
        "building_definition",
        "item_generation_base",
        "item_generation_affix",
        "item_generation_quality",
        "item_generation_bucket_profile",
        "server_setting",
        "requirement_definition",
        "entity_requirement",
        "building_district_level_cap",
        "bonus_type",
        "bonus_scope",
        "bonus_target_category",
        "bonus_target",
        "entity_bonus",
        "derived_stat_definition",
        "trial_definition",
        "encounter_definition",
        "reward_profile",
        "reward_profile_assignment",
        "reward_profile_entry",
      ],
      config_value_status: ["draft", "active", "archived"],
      config_value_type: [
        "integer",
        "decimal",
        "boolean",
        "string",
        "json",
        "formula_ref",
        "enum_ref",
        "entity_ref",
      ],
      estate_building_job_status: [
        "active",
        "completed",
        "cancelled",
        "failed",
      ],
      game_report_access_role: ["owner", "participant", "viewer"],
      game_report_item_source_kind: ["reward_drop"],
      game_report_source_entity_type: [
        "combat_result",
        "trial_result",
        "encounter_result",
        "pvp_result",
        "siege_result",
      ],
      game_server_kind: ["sandbox", "standard"],
      game_server_status: ["draft", "testing", "scheduled", "live", "archived"],
      item_status: ["active", "scrapped", "locked_trade", "locked_auction"],
      moderation_action_status: [
        "active",
        "expired",
        "cancelled",
        "overturned",
        "escalated",
      ],
      notification_recipient_kind: ["user", "hero", "staff"],
      notification_severity: ["info", "notice", "warning", "critical"],
      player_abuse_report_status: [
        "submitted",
        "linked_to_case",
        "dismissed",
        "resolved",
      ],
      player_auction_bid_status: [
        "active",
        "outbid",
        "winning",
        "cancelled",
        "refunded",
        "failed",
      ],
      player_auction_mode: ["bidding", "buy_now", "bidding_with_buy_now"],
      player_auction_status: [
        "draft",
        "active",
        "completed",
        "cancelled",
        "expired",
        "failed",
      ],
      player_relationship_declaration_status: [
        "draft",
        "submitted",
        "approved",
        "rejected",
        "revoked",
        "expired",
        "completed",
      ],
      player_trade_offer_status: [
        "pending_target",
        "pending_creator",
        "completed",
        "rejected",
        "cancelled",
        "expired",
        "failed",
      ],
      player_trade_side: ["creator", "target"],
      player_trade_transaction_status: ["completed", "reversed", "failed"],
      player_trade_transaction_type: ["direct_trade", "auction_sale"],
      requirement_entity_type: [
        "building_definition",
        "item_generation_base",
        "item_generation_affix",
        "item",
        "trial_definition",
        "trade_feature",
        "auction_feature",
      ],
      requirement_value_type: [
        "integer",
        "decimal",
        "boolean",
        "string",
        "stat_key",
        "building_key",
        "resource_type",
        "district_code",
        "enum_ref",
      ],
      server_config_value_source: [
        "manual_server_launch",
        "global_snapshot",
        "live_override",
        "test_override",
        "migration",
      ],
      server_membership_status: ["active", "suspended", "banned"],
      server_staff_role: ["owner", "operator", "moderator", "tester"],
    },
  },
} as const
