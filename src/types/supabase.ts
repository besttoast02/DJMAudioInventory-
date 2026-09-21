export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      asset_attachments: {
        Row: {
          asset_id: string
          attachment_type: string
          file_path: string
          id: string
          notes: string | null
          uploaded_at: string | null
        }
        Insert: {
          asset_id: string
          attachment_type: string
          file_path: string
          id?: string
          notes?: string | null
          uploaded_at?: string | null
        }
        Update: {
          asset_id?: string
          attachment_type?: string
          file_path?: string
          id?: string
          notes?: string | null
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_attachments_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_attachments_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_asset_current_value"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "asset_attachments_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_asset_remaining_life"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "asset_attachments_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_asset_usage_totals"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "asset_attachments_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_assets_maintenance_due"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "asset_attachments_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_inventory_availability"
            referencedColumns: ["asset_id"]
          },
        ]
      }
      asset_financial_profiles: {
        Row: {
          accounting_depreciation_method: string | null
          asset_id: string
          default_repair_threshold_cents: number | null
          expected_lifetime_events: number | null
          expected_lifetime_operating_hours: number | null
          expected_lifetime_transport_cycles: number | null
          original_cost_basis_cents: number
          replacement_cost_estimate_cents: number | null
          residual_value_cents: number | null
          useful_life_months: number | null
        }
        Insert: {
          accounting_depreciation_method?: string | null
          asset_id: string
          default_repair_threshold_cents?: number | null
          expected_lifetime_events?: number | null
          expected_lifetime_operating_hours?: number | null
          expected_lifetime_transport_cycles?: number | null
          original_cost_basis_cents: number
          replacement_cost_estimate_cents?: number | null
          residual_value_cents?: number | null
          useful_life_months?: number | null
        }
        Update: {
          accounting_depreciation_method?: string | null
          asset_id?: string
          default_repair_threshold_cents?: number | null
          expected_lifetime_events?: number | null
          expected_lifetime_operating_hours?: number | null
          expected_lifetime_transport_cycles?: number | null
          original_cost_basis_cents?: number
          replacement_cost_estimate_cents?: number | null
          residual_value_cents?: number | null
          useful_life_months?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_financial_profiles_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: true
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_financial_profiles_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: true
            referencedRelation: "v_asset_current_value"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "asset_financial_profiles_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: true
            referencedRelation: "v_asset_remaining_life"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "asset_financial_profiles_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: true
            referencedRelation: "v_asset_usage_totals"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "asset_financial_profiles_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: true
            referencedRelation: "v_assets_maintenance_due"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "asset_financial_profiles_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: true
            referencedRelation: "v_inventory_availability"
            referencedColumns: ["asset_id"]
          },
        ]
      }
      asset_identifiers: {
        Row: {
          asset_id: string
          assigned_at: string | null
          id: string
          identifier_type: string
          identifier_value: string
        }
        Insert: {
          asset_id: string
          assigned_at?: string | null
          id?: string
          identifier_type: string
          identifier_value: string
        }
        Update: {
          asset_id?: string
          assigned_at?: string | null
          id?: string
          identifier_type?: string
          identifier_value?: string
        }
        Relationships: [
          {
            foreignKeyName: "asset_identifiers_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_identifiers_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_asset_current_value"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "asset_identifiers_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_asset_remaining_life"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "asset_identifiers_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_asset_usage_totals"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "asset_identifiers_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_assets_maintenance_due"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "asset_identifiers_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_inventory_availability"
            referencedColumns: ["asset_id"]
          },
        ]
      }
      asset_location_history: {
        Row: {
          asset_id: string
          id: string
          moved_at: string | null
          moved_by: string | null
          new_location_id: string | null
          previous_location_id: string | null
        }
        Insert: {
          asset_id: string
          id?: string
          moved_at?: string | null
          moved_by?: string | null
          new_location_id?: string | null
          previous_location_id?: string | null
        }
        Update: {
          asset_id?: string
          id?: string
          moved_at?: string | null
          moved_by?: string | null
          new_location_id?: string | null
          previous_location_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_location_history_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_location_history_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_asset_current_value"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "asset_location_history_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_asset_remaining_life"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "asset_location_history_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_asset_usage_totals"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "asset_location_history_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_assets_maintenance_due"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "asset_location_history_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_inventory_availability"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "asset_location_history_new_location_id_fkey"
            columns: ["new_location_id"]
            isOneToOne: false
            referencedRelation: "storage_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_location_history_previous_location_id_fkey"
            columns: ["previous_location_id"]
            isOneToOne: false
            referencedRelation: "storage_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_reservations: {
        Row: {
          asset_id: string
          created_at: string | null
          event_id: string
          id: string
          inventory_pool_reservation_id: string | null
          possession_end: string
          possession_start: string
          status: string
        }
        Insert: {
          asset_id: string
          created_at?: string | null
          event_id: string
          id?: string
          inventory_pool_reservation_id?: string | null
          possession_end: string
          possession_start: string
          status?: string
        }
        Update: {
          asset_id?: string
          created_at?: string | null
          event_id?: string
          id?: string
          inventory_pool_reservation_id?: string | null
          possession_end?: string
          possession_start?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "asset_reservations_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_reservations_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_asset_current_value"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "asset_reservations_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_asset_remaining_life"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "asset_reservations_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_asset_usage_totals"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "asset_reservations_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_assets_maintenance_due"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "asset_reservations_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_inventory_availability"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "asset_reservations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_reservations_inventory_pool_reservation_id_fkey"
            columns: ["inventory_pool_reservation_id"]
            isOneToOne: false
            referencedRelation: "inventory_pool_reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_status_history: {
        Row: {
          asset_id: string
          changed_at: string | null
          changed_by: string | null
          id: string
          new_status: string
          previous_status: string | null
          reason: string | null
        }
        Insert: {
          asset_id: string
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_status: string
          previous_status?: string | null
          reason?: string | null
        }
        Update: {
          asset_id?: string
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_status?: string
          previous_status?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_status_history_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_status_history_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_asset_current_value"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "asset_status_history_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_asset_remaining_life"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "asset_status_history_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_asset_usage_totals"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "asset_status_history_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_assets_maintenance_due"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "asset_status_history_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_inventory_availability"
            referencedColumns: ["asset_id"]
          },
        ]
      }
      asset_usage_sessions: {
        Row: {
          asset_id: string
          checked_out_at: string
          condition_after: string | null
          condition_before: string | null
          damage_reported: boolean | null
          deployment_environment: string | null
          event_id: string | null
          id: string
          notes: string | null
          operating_hours: number | null
          operator_id: string | null
          returned_at: string | null
          transport_cycles: number | null
          use_count: number | null
          weather_exposure: string | null
        }
        Insert: {
          asset_id: string
          checked_out_at: string
          condition_after?: string | null
          condition_before?: string | null
          damage_reported?: boolean | null
          deployment_environment?: string | null
          event_id?: string | null
          id?: string
          notes?: string | null
          operating_hours?: number | null
          operator_id?: string | null
          returned_at?: string | null
          transport_cycles?: number | null
          use_count?: number | null
          weather_exposure?: string | null
        }
        Update: {
          asset_id?: string
          checked_out_at?: string
          condition_after?: string | null
          condition_before?: string | null
          damage_reported?: boolean | null
          deployment_environment?: string | null
          event_id?: string | null
          id?: string
          notes?: string | null
          operating_hours?: number | null
          operator_id?: string | null
          returned_at?: string | null
          transport_cycles?: number | null
          use_count?: number | null
          weather_exposure?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_usage_sessions_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_usage_sessions_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_asset_current_value"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "asset_usage_sessions_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_asset_remaining_life"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "asset_usage_sessions_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_asset_usage_totals"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "asset_usage_sessions_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_assets_maintenance_due"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "asset_usage_sessions_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_inventory_availability"
            referencedColumns: ["asset_id"]
          },
        ]
      }
      assets: {
        Row: {
          asset_tag: string | null
          condition_grade: string
          created_at: string | null
          current_location_id: string | null
          id: string
          in_service_date: string | null
          inventory_status: string
          is_rentable: boolean | null
          is_sellable: boolean | null
          notes: string | null
          organization_id: string
          ownership_type: string
          product_model_id: string
          purchase_date: string | null
          purchase_price_cents: number | null
          purchase_vendor_id: string | null
          retired_at: string | null
          retirement_reason: string | null
          sale_asking_price_cents: number | null
          serial_number: string | null
          updated_at: string | null
          warranty_expiration_date: string | null
        }
        Insert: {
          asset_tag?: string | null
          condition_grade?: string
          created_at?: string | null
          current_location_id?: string | null
          id?: string
          in_service_date?: string | null
          inventory_status?: string
          is_rentable?: boolean | null
          is_sellable?: boolean | null
          notes?: string | null
          organization_id: string
          ownership_type?: string
          product_model_id: string
          purchase_date?: string | null
          purchase_price_cents?: number | null
          purchase_vendor_id?: string | null
          retired_at?: string | null
          retirement_reason?: string | null
          sale_asking_price_cents?: number | null
          serial_number?: string | null
          updated_at?: string | null
          warranty_expiration_date?: string | null
        }
        Update: {
          asset_tag?: string | null
          condition_grade?: string
          created_at?: string | null
          current_location_id?: string | null
          id?: string
          in_service_date?: string | null
          inventory_status?: string
          is_rentable?: boolean | null
          is_sellable?: boolean | null
          notes?: string | null
          organization_id?: string
          ownership_type?: string
          product_model_id?: string
          purchase_date?: string | null
          purchase_price_cents?: number | null
          purchase_vendor_id?: string | null
          retired_at?: string | null
          retirement_reason?: string | null
          sale_asking_price_cents?: number | null
          serial_number?: string | null
          updated_at?: string | null
          warranty_expiration_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_current_location_id_fkey"
            columns: ["current_location_id"]
            isOneToOne: false
            referencedRelation: "storage_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_product_model_id_fkey"
            columns: ["product_model_id"]
            isOneToOne: false
            referencedRelation: "product_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_purchase_vendor_id_fkey"
            columns: ["purchase_vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_items: {
        Row: {
          created_at: string | null
          customer_description: string | null
          description: string | null
          id: string
          internal_description: string | null
          is_active: boolean | null
          item_kind: string
          name: string
          organization_id: string
          revenue_category: string | null
          tax_category: string | null
          updated_at: string | null
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          created_at?: string | null
          customer_description?: string | null
          description?: string | null
          id?: string
          internal_description?: string | null
          is_active?: boolean | null
          item_kind: string
          name: string
          organization_id: string
          revenue_category?: string | null
          tax_category?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          created_at?: string | null
          customer_description?: string | null
          description?: string | null
          id?: string
          internal_description?: string | null
          is_active?: boolean | null
          item_kind?: string
          name?: string
          organization_id?: string
          revenue_category?: string | null
          tax_category?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "catalog_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_contacts: {
        Row: {
          client_id: string
          email: string | null
          first_name: string
          id: string
          is_primary: boolean | null
          last_name: string
          notes: string | null
          phone: string | null
        }
        Insert: {
          client_id: string
          email?: string | null
          first_name: string
          id?: string
          is_primary?: boolean | null
          last_name: string
          notes?: string | null
          phone?: string | null
        }
        Update: {
          client_id?: string
          email?: string | null
          first_name?: string
          id?: string
          is_primary?: boolean | null
          last_name?: string
          notes?: string | null
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_contacts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          billing_address: string | null
          client_type: string | null
          created_at: string | null
          id: string
          name: string
          organization_id: string
          tax_id: string | null
          updated_at: string | null
        }
        Insert: {
          billing_address?: string | null
          client_type?: string | null
          created_at?: string | null
          id?: string
          name: string
          organization_id: string
          tax_id?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_address?: string | null
          client_type?: string | null
          created_at?: string | null
          id?: string
          name?: string
          organization_id?: string
          tax_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      condition_inspections: {
        Row: {
          asset_id: string
          condition_grade: string
          id: string
          inspected_at: string | null
          inspector_id: string | null
          notes: string | null
          passed_inspection: boolean
        }
        Insert: {
          asset_id: string
          condition_grade: string
          id?: string
          inspected_at?: string | null
          inspector_id?: string | null
          notes?: string | null
          passed_inspection: boolean
        }
        Update: {
          asset_id?: string
          condition_grade?: string
          id?: string
          inspected_at?: string | null
          inspector_id?: string | null
          notes?: string | null
          passed_inspection?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "condition_inspections_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "condition_inspections_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_asset_current_value"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "condition_inspections_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_asset_remaining_life"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "condition_inspections_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_asset_usage_totals"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "condition_inspections_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_assets_maintenance_due"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "condition_inspections_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_inventory_availability"
            referencedColumns: ["asset_id"]
          },
        ]
      }
      coverage_profiles: {
        Row: {
          application_type: string | null
          audience_depth_ft: number | null
          audience_width_ft: number | null
          confidence_level: string | null
          deployment_method: string | null
          estimated_max_crowd: number | null
          estimated_min_crowd: number | null
          id: string
          indoor_outdoor: string | null
          max_throw_distance_ft: number | null
          notes: string | null
          organization_id: string
          placement_height_ft: number | null
          product_model_id: string | null
          source_type: string | null
          system_configuration_id: string | null
          target_spl_db: number | null
        }
        Insert: {
          application_type?: string | null
          audience_depth_ft?: number | null
          audience_width_ft?: number | null
          confidence_level?: string | null
          deployment_method?: string | null
          estimated_max_crowd?: number | null
          estimated_min_crowd?: number | null
          id?: string
          indoor_outdoor?: string | null
          max_throw_distance_ft?: number | null
          notes?: string | null
          organization_id: string
          placement_height_ft?: number | null
          product_model_id?: string | null
          source_type?: string | null
          system_configuration_id?: string | null
          target_spl_db?: number | null
        }
        Update: {
          application_type?: string | null
          audience_depth_ft?: number | null
          audience_width_ft?: number | null
          confidence_level?: string | null
          deployment_method?: string | null
          estimated_max_crowd?: number | null
          estimated_min_crowd?: number | null
          id?: string
          indoor_outdoor?: string | null
          max_throw_distance_ft?: number | null
          notes?: string | null
          organization_id?: string
          placement_height_ft?: number | null
          product_model_id?: string | null
          source_type?: string | null
          system_configuration_id?: string | null
          target_spl_db?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "coverage_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coverage_profiles_product_model_id_fkey"
            columns: ["product_model_id"]
            isOneToOne: false
            referencedRelation: "product_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coverage_profiles_system_configuration_id_fkey"
            columns: ["system_configuration_id"]
            isOneToOne: false
            referencedRelation: "system_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      crew_assignments: {
        Row: {
          call_time: string
          created_at: string | null
          end_time: string | null
          event_id: string
          id: string
          role: string
          status: string
          user_id: string
        }
        Insert: {
          call_time: string
          created_at?: string | null
          end_time?: string | null
          event_id: string
          id?: string
          role: string
          status?: string
          user_id: string
        }
        Update: {
          call_time?: string
          created_at?: string | null
          end_time?: string | null
          event_id?: string
          id?: string
          role?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crew_assignments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      damage_incidents: {
        Row: {
          asset_id: string
          description: string | null
          id: string
          repair_estimate_cents: number | null
          reported_at: string | null
          reporter_id: string | null
          resolved_at: string | null
          severity: string | null
          usage_session_id: string | null
          was_customer_billed: boolean | null
        }
        Insert: {
          asset_id: string
          description?: string | null
          id?: string
          repair_estimate_cents?: number | null
          reported_at?: string | null
          reporter_id?: string | null
          resolved_at?: string | null
          severity?: string | null
          usage_session_id?: string | null
          was_customer_billed?: boolean | null
        }
        Update: {
          asset_id?: string
          description?: string | null
          id?: string
          repair_estimate_cents?: number | null
          reported_at?: string | null
          reporter_id?: string | null
          resolved_at?: string | null
          severity?: string | null
          usage_session_id?: string | null
          was_customer_billed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "damage_incidents_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "damage_incidents_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_asset_current_value"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "damage_incidents_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_asset_remaining_life"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "damage_incidents_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_asset_usage_totals"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "damage_incidents_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_assets_maintenance_due"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "damage_incidents_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_inventory_availability"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "damage_incidents_usage_session_id_fkey"
            columns: ["usage_session_id"]
            isOneToOne: false
            referencedRelation: "asset_usage_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      deployment_modes: {
        Row: {
          description: string | null
          id: string
          name: string
          organization_id: string
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
          organization_id: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deployment_modes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_categories: {
        Row: {
          category_code: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          parent_category_id: string | null
          updated_at: string | null
        }
        Insert: {
          category_code?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          parent_category_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category_code?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          parent_category_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_categories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "equipment_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      estimate_lines: {
        Row: {
          description: string | null
          discount_cents: number | null
          duration_quantity: number | null
          duration_type: string | null
          estimate_version_id: string
          id: string
          internal_cost_estimate_cents: number | null
          item_name: string
          line_total_cents: number
          quantity: number
          rate_cents: number
          sort_order: number | null
          source_catalog_item_id: string | null
          source_package_version_id: string | null
          tax_treatment: string | null
          unit_price_cents: number
        }
        Insert: {
          description?: string | null
          discount_cents?: number | null
          duration_quantity?: number | null
          duration_type?: string | null
          estimate_version_id: string
          id?: string
          internal_cost_estimate_cents?: number | null
          item_name: string
          line_total_cents: number
          quantity?: number
          rate_cents: number
          sort_order?: number | null
          source_catalog_item_id?: string | null
          source_package_version_id?: string | null
          tax_treatment?: string | null
          unit_price_cents: number
        }
        Update: {
          description?: string | null
          discount_cents?: number | null
          duration_quantity?: number | null
          duration_type?: string | null
          estimate_version_id?: string
          id?: string
          internal_cost_estimate_cents?: number | null
          item_name?: string
          line_total_cents?: number
          quantity?: number
          rate_cents?: number
          sort_order?: number | null
          source_catalog_item_id?: string | null
          source_package_version_id?: string | null
          tax_treatment?: string | null
          unit_price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "estimate_lines_estimate_version_id_fkey"
            columns: ["estimate_version_id"]
            isOneToOne: false
            referencedRelation: "estimate_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimate_lines_source_catalog_item_id_fkey"
            columns: ["source_catalog_item_id"]
            isOneToOne: false
            referencedRelation: "catalog_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimate_lines_source_package_version_id_fkey"
            columns: ["source_package_version_id"]
            isOneToOne: false
            referencedRelation: "package_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      estimate_versions: {
        Row: {
          created_at: string | null
          created_by: string | null
          estimate_id: string
          id: string
          status: string
          total_cents: number
          valid_until: string | null
          version_number: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          estimate_id: string
          id?: string
          status?: string
          total_cents?: number
          valid_until?: string | null
          version_number: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          estimate_id?: string
          id?: string
          status?: string
          total_cents?: number
          valid_until?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "estimate_versions_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      estimates: {
        Row: {
          client_id: string
          created_at: string | null
          event_request_id: string | null
          id: string
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          event_request_id?: string | null
          id?: string
          organization_id: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          event_request_id?: string | null
          id?: string
          organization_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estimates_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_event_request_id_fkey"
            columns: ["event_request_id"]
            isOneToOne: false
            referencedRelation: "event_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      event_request_status_history: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          id: string
          new_status: string
          previous_status: string | null
          request_id: string
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_status: string
          previous_status?: string | null
          request_id: string
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_status?: string
          previous_status?: string | null
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_request_status_history_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "event_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      event_requests: {
        Row: {
          client_id: string | null
          created_at: string | null
          event_type: string | null
          guest_count: number | null
          id: string
          notes: string | null
          organization_id: string
          request_source: string | null
          status: string
          target_date: string | null
          updated_at: string | null
          venue_id: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          event_type?: string | null
          guest_count?: number | null
          id?: string
          notes?: string | null
          organization_id: string
          request_source?: string | null
          status?: string
          target_date?: string | null
          updated_at?: string | null
          venue_id?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          event_type?: string | null
          guest_count?: number | null
          id?: string
          notes?: string | null
          organization_id?: string
          request_source?: string | null
          status?: string
          target_date?: string | null
          updated_at?: string | null
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_requests_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      event_segments: {
        Row: {
          end_time: string
          event_id: string
          id: string
          notes: string | null
          segment_type: string
          start_time: string
        }
        Insert: {
          end_time: string
          event_id: string
          id?: string
          notes?: string | null
          segment_type: string
          start_time: string
        }
        Update: {
          end_time?: string
          event_id?: string
          id?: string
          notes?: string | null
          segment_type?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_segments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_status_history: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          event_id: string
          id: string
          new_status: string
          previous_status: string | null
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          event_id: string
          id?: string
          new_status: string
          previous_status?: string | null
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          event_id?: string
          id?: string
          new_status?: string
          previous_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_status_history_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          client_id: string
          created_at: string | null
          estimate_version_id: string | null
          event_end: string | null
          event_start: string | null
          id: string
          name: string
          organization_id: string
          status: string
          updated_at: string | null
          venue_id: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          estimate_version_id?: string | null
          event_end?: string | null
          event_start?: string | null
          id?: string
          name: string
          organization_id: string
          status?: string
          updated_at?: string | null
          venue_id?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          estimate_version_id?: string | null
          event_end?: string | null
          event_start?: string | null
          id?: string
          name?: string
          organization_id?: string
          status?: string
          updated_at?: string | null
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_estimate_version_id_fkey"
            columns: ["estimate_version_id"]
            isOneToOne: false
            referencedRelation: "estimate_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_pool_reservations: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          possession_end: string
          possession_start: string
          quantity: number
          rental_product_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          possession_end: string
          possession_start: string
          quantity: number
          rental_product_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          possession_end?: string
          possession_start?: string
          quantity?: number
          rental_product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_pool_reservations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_pool_reservations_rental_product_id_fkey"
            columns: ["rental_product_id"]
            isOneToOne: false
            referencedRelation: "catalog_items"
            referencedColumns: ["id"]
          },
        ]
      }
      labor_services: {
        Row: {
          catalog_item_id: string
          default_preparation_minutes: number | null
          default_setup_strike_minutes: number | null
          equipment_included: string | null
          minimum_hours: number | null
          overtime_multiplier: number | null
          overtime_threshold_hours: number | null
          role: string
          travel_policy: string | null
        }
        Insert: {
          catalog_item_id: string
          default_preparation_minutes?: number | null
          default_setup_strike_minutes?: number | null
          equipment_included?: string | null
          minimum_hours?: number | null
          overtime_multiplier?: number | null
          overtime_threshold_hours?: number | null
          role: string
          travel_policy?: string | null
        }
        Update: {
          catalog_item_id?: string
          default_preparation_minutes?: number | null
          default_setup_strike_minutes?: number | null
          equipment_included?: string | null
          minimum_hours?: number | null
          overtime_multiplier?: number | null
          overtime_threshold_hours?: number | null
          role?: string
          travel_policy?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "labor_services_catalog_item_id_fkey"
            columns: ["catalog_item_id"]
            isOneToOne: true
            referencedRelation: "catalog_items"
            referencedColumns: ["id"]
          },
        ]
      }
      lighting_fixture_specs: {
        Row: {
          beam_angle_deg: number | null
          dmx_channel_modes: string | null
          dmx_connector_type: string | null
          fixture_type: string | null
          included_safety_hardware: string | null
          ip_rating: string | null
          light_source_type: string | null
          lumens: number | null
          outdoor_use_limitations: string | null
          pan_range_deg: number | null
          power_connector_type: string | null
          power_consumption_watts: number | null
          product_model_id: string
          rigging_points: string | null
          tilt_range_deg: number | null
          weight_lbs: number | null
        }
        Insert: {
          beam_angle_deg?: number | null
          dmx_channel_modes?: string | null
          dmx_connector_type?: string | null
          fixture_type?: string | null
          included_safety_hardware?: string | null
          ip_rating?: string | null
          light_source_type?: string | null
          lumens?: number | null
          outdoor_use_limitations?: string | null
          pan_range_deg?: number | null
          power_connector_type?: string | null
          power_consumption_watts?: number | null
          product_model_id: string
          rigging_points?: string | null
          tilt_range_deg?: number | null
          weight_lbs?: number | null
        }
        Update: {
          beam_angle_deg?: number | null
          dmx_channel_modes?: string | null
          dmx_connector_type?: string | null
          fixture_type?: string | null
          included_safety_hardware?: string | null
          ip_rating?: string | null
          light_source_type?: string | null
          lumens?: number | null
          outdoor_use_limitations?: string | null
          pan_range_deg?: number | null
          power_connector_type?: string | null
          power_consumption_watts?: number | null
          product_model_id?: string
          rigging_points?: string | null
          tilt_range_deg?: number | null
          weight_lbs?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lighting_fixture_specs_product_model_id_fkey"
            columns: ["product_model_id"]
            isOneToOne: true
            referencedRelation: "product_models"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_logs: {
        Row: {
          asset_id: string
          condition_after: string | null
          condition_before: string | null
          created_at: string | null
          documentation_path: string | null
          external_cost_cents: number | null
          id: string
          internal_cost_cents: number | null
          labor_hours: number | null
          maintenance_plan_id: string | null
          parts_used: string | null
          passed_inspection: boolean | null
          return_to_service_date: string | null
          service_date: string
          service_type: string
          technician_id: string | null
          work_performed: string
        }
        Insert: {
          asset_id: string
          condition_after?: string | null
          condition_before?: string | null
          created_at?: string | null
          documentation_path?: string | null
          external_cost_cents?: number | null
          id?: string
          internal_cost_cents?: number | null
          labor_hours?: number | null
          maintenance_plan_id?: string | null
          parts_used?: string | null
          passed_inspection?: boolean | null
          return_to_service_date?: string | null
          service_date: string
          service_type: string
          technician_id?: string | null
          work_performed: string
        }
        Update: {
          asset_id?: string
          condition_after?: string | null
          condition_before?: string | null
          created_at?: string | null
          documentation_path?: string | null
          external_cost_cents?: number | null
          id?: string
          internal_cost_cents?: number | null
          labor_hours?: number | null
          maintenance_plan_id?: string | null
          parts_used?: string | null
          passed_inspection?: boolean | null
          return_to_service_date?: string | null
          service_date?: string
          service_type?: string
          technician_id?: string | null
          work_performed?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_logs_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_logs_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_asset_current_value"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "maintenance_logs_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_asset_remaining_life"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "maintenance_logs_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_asset_usage_totals"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "maintenance_logs_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_assets_maintenance_due"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "maintenance_logs_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_inventory_availability"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "maintenance_logs_maintenance_plan_id_fkey"
            columns: ["maintenance_plan_id"]
            isOneToOne: false
            referencedRelation: "maintenance_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_logs_maintenance_plan_id_fkey"
            columns: ["maintenance_plan_id"]
            isOneToOne: false
            referencedRelation: "v_assets_maintenance_due"
            referencedColumns: ["maintenance_plan_id"]
          },
        ]
      }
      maintenance_plan_tasks: {
        Row: {
          id: string
          is_required: boolean | null
          maintenance_plan_id: string
          sort_order: number | null
          task_description: string
        }
        Insert: {
          id?: string
          is_required?: boolean | null
          maintenance_plan_id: string
          sort_order?: number | null
          task_description: string
        }
        Update: {
          id?: string
          is_required?: boolean | null
          maintenance_plan_id?: string
          sort_order?: number | null
          task_description?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_plan_tasks_maintenance_plan_id_fkey"
            columns: ["maintenance_plan_id"]
            isOneToOne: false
            referencedRelation: "maintenance_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_plan_tasks_maintenance_plan_id_fkey"
            columns: ["maintenance_plan_id"]
            isOneToOne: false
            referencedRelation: "v_assets_maintenance_due"
            referencedColumns: ["maintenance_plan_id"]
          },
        ]
      }
      maintenance_plans: {
        Row: {
          created_at: string | null
          id: string
          interval_value: number
          name: string
          organization_id: string
          target_id: string
          target_type: string
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          interval_value: number
          name: string
          organization_id: string
          target_id: string
          target_type: string
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          interval_value?: number
          name?: string
          organization_id?: string
          target_id?: string
          target_type?: string
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_plans_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      managed_services: {
        Row: {
          catalog_item_id: string
          deliverables: string | null
          service_type: string
        }
        Insert: {
          catalog_item_id: string
          deliverables?: string | null
          service_type: string
        }
        Update: {
          catalog_item_id?: string
          deliverables?: string | null
          service_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "managed_services_catalog_item_id_fkey"
            columns: ["catalog_item_id"]
            isOneToOne: true
            referencedRelation: "catalog_items"
            referencedColumns: ["id"]
          },
        ]
      }
      manufacturers: {
        Row: {
          created_at: string | null
          id: string
          name: string
          notes: string | null
          organization_id: string
          support_contact: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          notes?: string | null
          organization_id: string
          support_contact?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          organization_id?: string
          support_contact?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "manufacturers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      mixing_console_specs: {
        Row: {
          digital_stage_box_capacity: number | null
          expansion_card_type: string | null
          input_count: number | null
          local_preamps: number | null
          mixer_class: string | null
          network_protocols: string | null
          output_count: number | null
          power_consumption_watts: number | null
          product_model_id: string
          rack_size_u: number | null
          recording_capability: string | null
          sample_rates: string | null
          supported_software: string | null
          usb_interface_channels: string | null
        }
        Insert: {
          digital_stage_box_capacity?: number | null
          expansion_card_type?: string | null
          input_count?: number | null
          local_preamps?: number | null
          mixer_class?: string | null
          network_protocols?: string | null
          output_count?: number | null
          power_consumption_watts?: number | null
          product_model_id: string
          rack_size_u?: number | null
          recording_capability?: string | null
          sample_rates?: string | null
          supported_software?: string | null
          usb_interface_channels?: string | null
        }
        Update: {
          digital_stage_box_capacity?: number | null
          expansion_card_type?: string | null
          input_count?: number | null
          local_preamps?: number | null
          mixer_class?: string | null
          network_protocols?: string | null
          output_count?: number | null
          power_consumption_watts?: number | null
          product_model_id?: string
          rack_size_u?: number | null
          recording_capability?: string | null
          sample_rates?: string | null
          supported_software?: string | null
          usb_interface_channels?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mixing_console_specs_product_model_id_fkey"
            columns: ["product_model_id"]
            isOneToOne: true
            referencedRelation: "product_models"
            referencedColumns: ["id"]
          },
        ]
      }
      model_deployment_modes: {
        Row: {
          deployment_mode_id: string
          instructions: string | null
          is_manufacturer_approved: boolean | null
          maximum_units: number | null
          minimum_safety_requirements: string | null
          product_model_id: string
          required_accessory_model_id: string | null
          source_document_path: string | null
        }
        Insert: {
          deployment_mode_id: string
          instructions?: string | null
          is_manufacturer_approved?: boolean | null
          maximum_units?: number | null
          minimum_safety_requirements?: string | null
          product_model_id: string
          required_accessory_model_id?: string | null
          source_document_path?: string | null
        }
        Update: {
          deployment_mode_id?: string
          instructions?: string | null
          is_manufacturer_approved?: boolean | null
          maximum_units?: number | null
          minimum_safety_requirements?: string | null
          product_model_id?: string
          required_accessory_model_id?: string | null
          source_document_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "model_deployment_modes_deployment_mode_id_fkey"
            columns: ["deployment_mode_id"]
            isOneToOne: false
            referencedRelation: "deployment_modes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_deployment_modes_product_model_id_fkey"
            columns: ["product_model_id"]
            isOneToOne: false
            referencedRelation: "product_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_deployment_modes_required_accessory_model_id_fkey"
            columns: ["required_accessory_model_id"]
            isOneToOne: false
            referencedRelation: "product_models"
            referencedColumns: ["id"]
          },
        ]
      }
      model_environment_profiles: {
        Row: {
          direct_sun_rating: string | null
          evidence_type: string | null
          humidity_limit: string | null
          internal_performance_rating: string | null
          ip_rating: string | null
          manufacturer_outdoor_approved: boolean | null
          maximum_operating_temp_f: number | null
          minimum_operating_temp_f: number | null
          notes: string | null
          product_model_id: string
          rain_exposure_policy: string | null
          requires_weather_cover: boolean | null
          source_document_path: string | null
          wind_limit: string | null
        }
        Insert: {
          direct_sun_rating?: string | null
          evidence_type?: string | null
          humidity_limit?: string | null
          internal_performance_rating?: string | null
          ip_rating?: string | null
          manufacturer_outdoor_approved?: boolean | null
          maximum_operating_temp_f?: number | null
          minimum_operating_temp_f?: number | null
          notes?: string | null
          product_model_id: string
          rain_exposure_policy?: string | null
          requires_weather_cover?: boolean | null
          source_document_path?: string | null
          wind_limit?: string | null
        }
        Update: {
          direct_sun_rating?: string | null
          evidence_type?: string | null
          humidity_limit?: string | null
          internal_performance_rating?: string | null
          ip_rating?: string | null
          manufacturer_outdoor_approved?: boolean | null
          maximum_operating_temp_f?: number | null
          minimum_operating_temp_f?: number | null
          notes?: string | null
          product_model_id?: string
          rain_exposure_policy?: string | null
          requires_weather_cover?: boolean | null
          source_document_path?: string | null
          wind_limit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "model_environment_profiles_product_model_id_fkey"
            columns: ["product_model_id"]
            isOneToOne: true
            referencedRelation: "product_models"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          billing_address: string | null
          brand_logo_url: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          billing_address?: string | null
          brand_logo_url?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          billing_address?: string | null
          brand_logo_url?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      outbox_events: {
        Row: {
          aggregate_id: string
          aggregate_type: string
          attempt_count: number | null
          available_after: string | null
          created_at: string | null
          event_type: string
          failure_reason: string | null
          id: string
          payload: Json
          processed_at: string | null
        }
        Insert: {
          aggregate_id: string
          aggregate_type: string
          attempt_count?: number | null
          available_after?: string | null
          created_at?: string | null
          event_type: string
          failure_reason?: string | null
          id?: string
          payload: Json
          processed_at?: string | null
        }
        Update: {
          aggregate_id?: string
          aggregate_type?: string
          attempt_count?: number | null
          available_after?: string | null
          created_at?: string | null
          event_type?: string
          failure_reason?: string | null
          id?: string
          payload?: Json
          processed_at?: string | null
        }
        Relationships: []
      }
      package_components: {
        Row: {
          catalog_item_id: string
          default_price_behavior: string | null
          id: string
          included_hours: number | null
          included_quantity: number | null
          internal_estimated_cost_cents: number | null
          is_customer_visible: boolean | null
          is_required: boolean | null
          package_version_id: string
          quantity: number
          sort_order: number | null
        }
        Insert: {
          catalog_item_id: string
          default_price_behavior?: string | null
          id?: string
          included_hours?: number | null
          included_quantity?: number | null
          internal_estimated_cost_cents?: number | null
          is_customer_visible?: boolean | null
          is_required?: boolean | null
          package_version_id: string
          quantity?: number
          sort_order?: number | null
        }
        Update: {
          catalog_item_id?: string
          default_price_behavior?: string | null
          id?: string
          included_hours?: number | null
          included_quantity?: number | null
          internal_estimated_cost_cents?: number | null
          is_customer_visible?: boolean | null
          is_required?: boolean | null
          package_version_id?: string
          quantity?: number
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "package_components_catalog_item_id_fkey"
            columns: ["catalog_item_id"]
            isOneToOne: false
            referencedRelation: "catalog_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_components_package_version_id_fkey"
            columns: ["package_version_id"]
            isOneToOne: false
            referencedRelation: "package_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      package_rules: {
        Row: {
          description: string | null
          id: string
          package_version_id: string
          rule_type: string
        }
        Insert: {
          description?: string | null
          id?: string
          package_version_id: string
          rule_type: string
        }
        Update: {
          description?: string | null
          id?: string
          package_version_id?: string
          rule_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_rules_package_version_id_fkey"
            columns: ["package_version_id"]
            isOneToOne: false
            referencedRelation: "package_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      package_versions: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          package_id: string
          valid_from: string | null
          valid_to: string | null
          version_number: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          package_id: string
          valid_from?: string | null
          valid_to?: string | null
          version_number: number
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          package_id?: string
          valid_from?: string | null
          valid_to?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "package_versions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          organization_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "packages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      product_models: {
        Row: {
          additional_specs: Json | null
          archived_at: string | null
          category_id: string
          created_at: string | null
          description: string | null
          discontinued_at: string | null
          display_name: string | null
          id: string
          manual_storage_path: string | null
          manufacturer_id: string
          manufacturer_url: string | null
          model_name: string
          model_number: string | null
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          additional_specs?: Json | null
          archived_at?: string | null
          category_id: string
          created_at?: string | null
          description?: string | null
          discontinued_at?: string | null
          display_name?: string | null
          id?: string
          manual_storage_path?: string | null
          manufacturer_id: string
          manufacturer_url?: string | null
          model_name: string
          model_number?: string | null
          organization_id: string
          updated_at?: string | null
        }
        Update: {
          additional_specs?: Json | null
          archived_at?: string | null
          category_id?: string
          created_at?: string | null
          description?: string | null
          discontinued_at?: string | null
          display_name?: string | null
          id?: string
          manual_storage_path?: string | null
          manufacturer_id?: string
          manufacturer_url?: string | null
          model_name?: string
          model_number?: string | null
          organization_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_models_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "equipment_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_models_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_models_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_card_prices: {
        Row: {
          catalog_item_id: string
          created_at: string | null
          day_of_week_rule: string | null
          duration_quantity: number | null
          duration_type: string
          id: string
          included_hours: number | null
          location_id: string | null
          maximum_quantity: number | null
          minimum_charge_cents: number | null
          minimum_quantity: number | null
          overtime_rate_cents: number | null
          price_cents: number
          rate_card_id: string
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          catalog_item_id: string
          created_at?: string | null
          day_of_week_rule?: string | null
          duration_quantity?: number | null
          duration_type: string
          id?: string
          included_hours?: number | null
          location_id?: string | null
          maximum_quantity?: number | null
          minimum_charge_cents?: number | null
          minimum_quantity?: number | null
          overtime_rate_cents?: number | null
          price_cents: number
          rate_card_id: string
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          catalog_item_id?: string
          created_at?: string | null
          day_of_week_rule?: string | null
          duration_quantity?: number | null
          duration_type?: string
          id?: string
          included_hours?: number | null
          location_id?: string | null
          maximum_quantity?: number | null
          minimum_charge_cents?: number | null
          minimum_quantity?: number | null
          overtime_rate_cents?: number | null
          price_cents?: number
          rate_card_id?: string
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rate_card_prices_catalog_item_id_fkey"
            columns: ["catalog_item_id"]
            isOneToOne: false
            referencedRelation: "catalog_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rate_card_prices_rate_card_id_fkey"
            columns: ["rate_card_id"]
            isOneToOne: false
            referencedRelation: "rate_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_cards: {
        Row: {
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rate_cards_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_products: {
        Row: {
          catalog_item_id: string
          customer_selectable: boolean | null
          default_setup_minutes: number | null
          default_strike_minutes: number | null
          fulfillment_quantity: number | null
          product_model_id: string | null
          requires_operator: boolean | null
          substitution_group_id: string | null
          system_configuration_id: string | null
        }
        Insert: {
          catalog_item_id: string
          customer_selectable?: boolean | null
          default_setup_minutes?: number | null
          default_strike_minutes?: number | null
          fulfillment_quantity?: number | null
          product_model_id?: string | null
          requires_operator?: boolean | null
          substitution_group_id?: string | null
          system_configuration_id?: string | null
        }
        Update: {
          catalog_item_id?: string
          customer_selectable?: boolean | null
          default_setup_minutes?: number | null
          default_strike_minutes?: number | null
          fulfillment_quantity?: number | null
          product_model_id?: string | null
          requires_operator?: boolean | null
          substitution_group_id?: string | null
          system_configuration_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rental_products_catalog_item_id_fkey"
            columns: ["catalog_item_id"]
            isOneToOne: true
            referencedRelation: "catalog_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_products_product_model_id_fkey"
            columns: ["product_model_id"]
            isOneToOne: false
            referencedRelation: "product_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_products_system_configuration_id_fkey"
            columns: ["system_configuration_id"]
            isOneToOne: false
            referencedRelation: "system_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      speaker_specs: {
        Row: {
          amplifier_power_watts: number | null
          cabinet_type: string | null
          continuous_rms_power_watts: number | null
          crossover_info: string | null
          dimensions_in: string | null
          freq_response_high_hz: number | null
          freq_response_low_hz: number | null
          freq_response_tolerance: string | null
          horizontal_dispersion_deg: number | null
          input_connections: string | null
          is_powered: boolean | null
          maximum_spl_db: number | null
          output_connections: string | null
          peak_power_watts: number | null
          product_model_id: string
          program_power_watts: number | null
          sensitivity: string | null
          vertical_dispersion_deg: number | null
          weight_lbs: number | null
        }
        Insert: {
          amplifier_power_watts?: number | null
          cabinet_type?: string | null
          continuous_rms_power_watts?: number | null
          crossover_info?: string | null
          dimensions_in?: string | null
          freq_response_high_hz?: number | null
          freq_response_low_hz?: number | null
          freq_response_tolerance?: string | null
          horizontal_dispersion_deg?: number | null
          input_connections?: string | null
          is_powered?: boolean | null
          maximum_spl_db?: number | null
          output_connections?: string | null
          peak_power_watts?: number | null
          product_model_id: string
          program_power_watts?: number | null
          sensitivity?: string | null
          vertical_dispersion_deg?: number | null
          weight_lbs?: number | null
        }
        Update: {
          amplifier_power_watts?: number | null
          cabinet_type?: string | null
          continuous_rms_power_watts?: number | null
          crossover_info?: string | null
          dimensions_in?: string | null
          freq_response_high_hz?: number | null
          freq_response_low_hz?: number | null
          freq_response_tolerance?: string | null
          horizontal_dispersion_deg?: number | null
          input_connections?: string | null
          is_powered?: boolean | null
          maximum_spl_db?: number | null
          output_connections?: string | null
          peak_power_watts?: number | null
          product_model_id?: string
          program_power_watts?: number | null
          sensitivity?: string | null
          vertical_dispersion_deg?: number | null
          weight_lbs?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "speaker_specs_product_model_id_fkey"
            columns: ["product_model_id"]
            isOneToOne: true
            referencedRelation: "product_models"
            referencedColumns: ["id"]
          },
        ]
      }
      storage_locations: {
        Row: {
          address: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          organization_id: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "storage_locations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      system_configuration_components: {
        Row: {
          id: string
          is_required: boolean | null
          notes: string | null
          parent_component_id: string | null
          position_or_role: string | null
          product_model_id: string
          quantity: number
          system_configuration_id: string
        }
        Insert: {
          id?: string
          is_required?: boolean | null
          notes?: string | null
          parent_component_id?: string | null
          position_or_role?: string | null
          product_model_id: string
          quantity?: number
          system_configuration_id: string
        }
        Update: {
          id?: string
          is_required?: boolean | null
          notes?: string | null
          parent_component_id?: string | null
          position_or_role?: string | null
          product_model_id?: string
          quantity?: number
          system_configuration_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_configuration_components_parent_component_id_fkey"
            columns: ["parent_component_id"]
            isOneToOne: false
            referencedRelation: "system_configuration_components"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "system_configuration_components_product_model_id_fkey"
            columns: ["product_model_id"]
            isOneToOne: false
            referencedRelation: "product_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "system_configuration_components_system_configuration_id_fkey"
            columns: ["system_configuration_id"]
            isOneToOne: false
            referencedRelation: "system_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      system_configurations: {
        Row: {
          created_at: string | null
          deployment_instructions: string | null
          id: string
          indoor_outdoor_suitability: string | null
          intended_use: string | null
          max_recommended_audience_range: string | null
          name: string
          organization_id: string
          safety_notes: string | null
          setup_notes: string | null
          updated_at: string | null
          verification_status: string | null
        }
        Insert: {
          created_at?: string | null
          deployment_instructions?: string | null
          id?: string
          indoor_outdoor_suitability?: string | null
          intended_use?: string | null
          max_recommended_audience_range?: string | null
          name: string
          organization_id: string
          safety_notes?: string | null
          setup_notes?: string | null
          updated_at?: string | null
          verification_status?: string | null
        }
        Update: {
          created_at?: string | null
          deployment_instructions?: string | null
          id?: string
          indoor_outdoor_suitability?: string | null
          intended_use?: string | null
          max_recommended_audience_range?: string | null
          name?: string
          organization_id?: string
          safety_notes?: string | null
          setup_notes?: string | null
          updated_at?: string | null
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_configurations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      valuation_snapshots: {
        Row: {
          assessor_id: string | null
          asset_id: string
          book_value_cents: number | null
          id: string
          market_value_cents: number | null
          notes: string | null
          operational_value_cents: number | null
          snapshot_date: string
        }
        Insert: {
          assessor_id?: string | null
          asset_id: string
          book_value_cents?: number | null
          id?: string
          market_value_cents?: number | null
          notes?: string | null
          operational_value_cents?: number | null
          snapshot_date?: string
        }
        Update: {
          assessor_id?: string | null
          asset_id?: string
          book_value_cents?: number | null
          id?: string
          market_value_cents?: number | null
          notes?: string | null
          operational_value_cents?: number | null
          snapshot_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "valuation_snapshots_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "valuation_snapshots_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_asset_current_value"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "valuation_snapshots_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_asset_remaining_life"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "valuation_snapshots_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_asset_usage_totals"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "valuation_snapshots_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_assets_maintenance_due"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "valuation_snapshots_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_inventory_availability"
            referencedColumns: ["asset_id"]
          },
        ]
      }
      vendors: {
        Row: {
          contact_name: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          organization_id: string
          phone: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          contact_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          organization_id: string
          phone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          contact_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          organization_id?: string
          phone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      venue_contacts: {
        Row: {
          email: string | null
          id: string
          is_primary: boolean | null
          name: string
          phone: string | null
          role: string | null
          venue_id: string
        }
        Insert: {
          email?: string | null
          id?: string
          is_primary?: boolean | null
          name: string
          phone?: string | null
          role?: string | null
          venue_id: string
        }
        Update: {
          email?: string | null
          id?: string
          is_primary?: boolean | null
          name?: string
          phone?: string | null
          role?: string | null
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_contacts_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          address: string
          created_at: string | null
          id: string
          loading_dock_info: string | null
          name: string
          notes: string | null
          organization_id: string
          parking_instructions: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          id?: string
          loading_dock_info?: string | null
          name: string
          notes?: string | null
          organization_id: string
          parking_instructions?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          id?: string
          loading_dock_info?: string | null
          name?: string
          notes?: string | null
          organization_id?: string
          parking_instructions?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "venues_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_receipts: {
        Row: {
          attempt_count: number | null
          external_event_id: string
          id: string
          last_error: string | null
          payload_hash: string
          processing_status: string
          provider: string
          received_at: string | null
        }
        Insert: {
          attempt_count?: number | null
          external_event_id: string
          id?: string
          last_error?: string | null
          payload_hash: string
          processing_status: string
          provider: string
          received_at?: string | null
        }
        Update: {
          attempt_count?: number | null
          external_event_id?: string
          id?: string
          last_error?: string | null
          payload_hash?: string
          processing_status?: string
          provider?: string
          received_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      v_asset_current_value: {
        Row: {
          asset_id: string | null
          book_value_cents: number | null
          in_service_date: string | null
          original_cost_basis_cents: number | null
          residual_value_cents: number | null
          useful_life_months: number | null
        }
        Relationships: []
      }
      v_asset_remaining_life: {
        Row: {
          asset_id: string | null
          asset_tag: string | null
          expected_lifetime_events: number | null
          expected_lifetime_operating_hours: number | null
          expected_lifetime_transport_cycles: number | null
          model_name: string | null
          operational_life_percentage: number | null
          remaining_events: number | null
          remaining_operating_hours: number | null
          remaining_transport_cycles: number | null
          total_events: number | null
          total_operating_hours: number | null
          total_transport_cycles: number | null
        }
        Relationships: []
      }
      v_asset_usage_totals: {
        Row: {
          asset_id: string | null
          total_events: number | null
          total_operating_hours: number | null
          total_transport_cycles: number | null
        }
        Relationships: []
      }
      v_assets_maintenance_due: {
        Row: {
          asset_id: string | null
          asset_tag: string | null
          interval_value: number | null
          inventory_status: string | null
          maintenance_plan_id: string | null
          maintenance_plan_name: string | null
          trigger_type: string | null
        }
        Relationships: []
      }
      v_inventory_availability: {
        Row: {
          asset_id: string | null
          inventory_status: string | null
          is_rentable: boolean | null
          organization_id: string | null
          product_model_id: string | null
        }
        Insert: {
          asset_id?: string | null
          inventory_status?: string | null
          is_rentable?: boolean | null
          organization_id?: string | null
          product_model_id?: string | null
        }
        Update: {
          asset_id?: string | null
          inventory_status?: string | null
          is_rentable?: boolean | null
          organization_id?: string | null
          product_model_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_product_model_id_fkey"
            columns: ["product_model_id"]
            isOneToOne: false
            referencedRelation: "product_models"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

