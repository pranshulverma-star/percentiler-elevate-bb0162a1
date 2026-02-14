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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      leads: {
        Row: {
          created_at: string
          id: string
          name: string | null
          phone_number: string
          prep_level: string | null
          source: string | null
          target_year: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
          phone_number: string
          prep_level?: string | null
          source?: string | null
          target_year?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          phone_number?: string
          prep_level?: string | null
          source?: string | null
          target_year?: string | null
        }
        Relationships: []
      }
      profile_percentile_planner: {
        Row: {
          certifications: number | null
          competition_level: string | null
          created_at: string
          gap_years: number | null
          grad_score: number | null
          grad_stream: string | null
          id: string
          internships: number | null
          phone_number: string
          profile_score: number | null
          target_top10: number | null
          target_top20: number | null
          target_top30: number | null
          tenth_score: number | null
          twelfth_score: number | null
          workex_months: number | null
        }
        Insert: {
          certifications?: number | null
          competition_level?: string | null
          created_at?: string
          gap_years?: number | null
          grad_score?: number | null
          grad_stream?: string | null
          id?: string
          internships?: number | null
          phone_number: string
          profile_score?: number | null
          target_top10?: number | null
          target_top20?: number | null
          target_top30?: number | null
          tenth_score?: number | null
          twelfth_score?: number | null
          workex_months?: number | null
        }
        Update: {
          certifications?: number | null
          competition_level?: string | null
          created_at?: string
          gap_years?: number | null
          grad_score?: number | null
          grad_stream?: string | null
          id?: string
          internships?: number | null
          phone_number?: string
          profile_score?: number | null
          target_top10?: number | null
          target_top20?: number | null
          target_top30?: number | null
          tenth_score?: number | null
          twelfth_score?: number | null
          workex_months?: number | null
        }
        Relationships: []
      }
      readiness_quiz: {
        Row: {
          attempted_before: string
          created_at: string
          hours_per_day: string
          id: string
          mock_percentile: string
          phone: string
          recommendation: string | null
          target_percentile: string
        }
        Insert: {
          attempted_before: string
          created_at?: string
          hours_per_day: string
          id?: string
          mock_percentile: string
          phone: string
          recommendation?: string | null
          target_percentile: string
        }
        Update: {
          attempted_before?: string
          created_at?: string
          hours_per_day?: string
          id?: string
          mock_percentile?: string
          phone?: string
          recommendation?: string | null
          target_percentile?: string
        }
        Relationships: []
      }
      study_plan_days: {
        Row: {
          completed_at: string | null
          created_at: string | null
          day_number: number
          id: string
          is_completed: boolean | null
          lrdi_tasks_json: Json | null
          phone_number: string
          qa_tasks_json: Json | null
          varc_tasks_json: Json | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          day_number: number
          id?: string
          is_completed?: boolean | null
          lrdi_tasks_json?: Json | null
          phone_number: string
          qa_tasks_json?: Json | null
          varc_tasks_json?: Json | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          day_number?: number
          id?: string
          is_completed?: boolean | null
          lrdi_tasks_json?: Json | null
          phone_number?: string
          qa_tasks_json?: Json | null
          varc_tasks_json?: Json | null
        }
        Relationships: []
      }
      webinar_engagement: {
        Row: {
          completed: boolean | null
          id: string
          phone_number: string
          updated_at: string | null
          watch_percentage: number | null
        }
        Insert: {
          completed?: boolean | null
          id?: string
          phone_number: string
          updated_at?: string | null
          watch_percentage?: number | null
        }
        Update: {
          completed?: boolean | null
          id?: string
          phone_number?: string
          updated_at?: string | null
          watch_percentage?: number | null
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
