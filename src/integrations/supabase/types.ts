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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          created_at: string | null
          customer_id: string | null
          duration_minutes: number | null
          external_id: string | null
          id: string
          notes: string | null
          price: number | null
          service_type: string | null
          source: Database["public"]["Enums"]["appointment_source"] | null
          starts_at: string
          status: Database["public"]["Enums"]["appointment_status"] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          duration_minutes?: number | null
          external_id?: string | null
          id?: string
          notes?: string | null
          price?: number | null
          service_type?: string | null
          source?: Database["public"]["Enums"]["appointment_source"] | null
          starts_at: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          duration_minutes?: number | null
          external_id?: string | null
          id?: string
          notes?: string | null
          price?: number | null
          service_type?: string | null
          source?: Database["public"]["Enums"]["appointment_source"] | null
          starts_at?: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      business_settings: {
        Row: {
          capacity: number | null
          created_at: string | null
          id: string
          idle_cost: number | null
          max_overbook_per_slot: number | null
          max_wait_time_minutes: number | null
          overtime_cost: number | null
          revenue_per_appointment: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string | null
          id?: string
          idle_cost?: number | null
          max_overbook_per_slot?: number | null
          max_wait_time_minutes?: number | null
          overtime_cost?: number | null
          revenue_per_appointment?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          capacity?: number | null
          created_at?: string | null
          id?: string
          idle_cost?: number | null
          max_overbook_per_slot?: number | null
          max_wait_time_minutes?: number | null
          overtime_cost?: number | null
          revenue_per_appointment?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          consent_sms: boolean | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          consent_sms?: boolean | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          consent_sms?: boolean | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      model_params: {
        Row: {
          baseline_show_prob: number | null
          beta_coefficients: Json | null
          id: string
          sigma_u: number | null
          sigma_v: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          baseline_show_prob?: number | null
          beta_coefficients?: Json | null
          id?: string
          sigma_u?: number | null
          sigma_v?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          baseline_show_prob?: number | null
          beta_coefficients?: Json | null
          id?: string
          sigma_u?: number | null
          sigma_v?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          business_name: string | null
          created_at: string | null
          email: string
          id: string
          phone: string | null
          timezone: string | null
          twilio_number: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          business_name?: string | null
          created_at?: string | null
          email: string
          id?: string
          phone?: string | null
          timezone?: string | null
          twilio_number?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          business_name?: string | null
          created_at?: string | null
          email?: string
          id?: string
          phone?: string | null
          timezone?: string | null
          twilio_number?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          appointment_id: string
          cost_cents: number | null
          created_at: string | null
          delivered: boolean | null
          id: string
          link_clicked: boolean | null
          message_text: string | null
          sent_at: string | null
          variant: Database["public"]["Enums"]["reminder_variant"]
        }
        Insert: {
          appointment_id: string
          cost_cents?: number | null
          created_at?: string | null
          delivered?: boolean | null
          id?: string
          link_clicked?: boolean | null
          message_text?: string | null
          sent_at?: string | null
          variant: Database["public"]["Enums"]["reminder_variant"]
        }
        Update: {
          appointment_id?: string
          cost_cents?: number | null
          created_at?: string | null
          delivered?: boolean | null
          id?: string
          link_clicked?: boolean | null
          message_text?: string | null
          sent_at?: string | null
          variant?: Database["public"]["Enums"]["reminder_variant"]
        }
        Relationships: [
          {
            foreignKeyName: "reminders_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      slot_features: {
        Row: {
          base_price: number | null
          created_at: string | null
          day_of_week: number | null
          hour_of_day: number | null
          id: string
          is_holiday: boolean | null
          is_school_break: boolean | null
          lead_hours: number | null
          slot_start: string
          traffic_index: number | null
          user_id: string
          weather_precip: number | null
          weather_temp: number | null
        }
        Insert: {
          base_price?: number | null
          created_at?: string | null
          day_of_week?: number | null
          hour_of_day?: number | null
          id?: string
          is_holiday?: boolean | null
          is_school_break?: boolean | null
          lead_hours?: number | null
          slot_start: string
          traffic_index?: number | null
          user_id: string
          weather_precip?: number | null
          weather_temp?: number | null
        }
        Update: {
          base_price?: number | null
          created_at?: string | null
          day_of_week?: number | null
          hour_of_day?: number | null
          id?: string
          is_holiday?: boolean | null
          is_school_break?: boolean | null
          lead_hours?: number | null
          slot_start?: string
          traffic_index?: number | null
          user_id?: string
          weather_precip?: number | null
          weather_temp?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      appointment_source: "google" | "calendly" | "manual"
      appointment_status: "booked" | "showed" | "no_show" | "cancel"
      reminder_variant: "T-24" | "T-6" | "T-2"
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
      appointment_source: ["google", "calendly", "manual"],
      appointment_status: ["booked", "showed", "no_show", "cancel"],
      reminder_variant: ["T-24", "T-6", "T-2"],
    },
  },
} as const
