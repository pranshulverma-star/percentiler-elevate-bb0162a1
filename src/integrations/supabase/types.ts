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
      battle_players: {
        Row: {
          answers_json: Json | null
          correct: number
          display_name: string
          finished_at: string | null
          id: string
          joined_at: string
          room_id: string
          score_pct: number
          time_used_seconds: number
          user_id: string
        }
        Insert: {
          answers_json?: Json | null
          correct?: number
          display_name?: string
          finished_at?: string | null
          id?: string
          joined_at?: string
          room_id: string
          score_pct?: number
          time_used_seconds?: number
          user_id: string
        }
        Update: {
          answers_json?: Json | null
          correct?: number
          display_name?: string
          finished_at?: string | null
          id?: string
          joined_at?: string
          room_id?: string
          score_pct?: number
          time_used_seconds?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "battle_players_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "battle_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_rooms: {
        Row: {
          chapter_slug: string
          code: string
          created_at: string
          host_user_id: string
          id: string
          max_players: number
          questions_json: Json
          section_id: string
          started_at: string | null
          status: string
        }
        Insert: {
          chapter_slug: string
          code: string
          created_at?: string
          host_user_id: string
          id?: string
          max_players?: number
          questions_json: Json
          section_id: string
          started_at?: string | null
          status?: string
        }
        Update: {
          chapter_slug?: string
          code?: string
          created_at?: string
          host_user_id?: string
          id?: string
          max_players?: number
          questions_json?: Json
          section_id?: string
          started_at?: string | null
          status?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          category: string | null
          content_html: string | null
          content_markdown: string | null
          created_at: string | null
          featured_image: string | null
          id: string
          meta_description: string | null
          published_at: string | null
          slug: string
          title: string
        }
        Insert: {
          category?: string | null
          content_html?: string | null
          content_markdown?: string | null
          created_at?: string | null
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          published_at?: string | null
          slug: string
          title: string
        }
        Update: {
          category?: string | null
          content_html?: string | null
          content_markdown?: string | null
          created_at?: string | null
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          published_at?: string | null
          slug?: string
          title?: string
        }
        Relationships: []
      }
      buddy_activity_log: {
        Row: {
          activity_date: string
          bonus_earned: boolean
          created_at: string
          id: string
          nudge_sent: boolean
          pair_id: string
          planner_completed: boolean
          quiz_attempted: boolean
          streak_count: number
          user_id: string
        }
        Insert: {
          activity_date?: string
          bonus_earned?: boolean
          created_at?: string
          id?: string
          nudge_sent?: boolean
          pair_id: string
          planner_completed?: boolean
          quiz_attempted?: boolean
          streak_count?: number
          user_id: string
        }
        Update: {
          activity_date?: string
          bonus_earned?: boolean
          created_at?: string
          id?: string
          nudge_sent?: boolean
          pair_id?: string
          planner_completed?: boolean
          quiz_attempted?: boolean
          streak_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "buddy_activity_log_pair_id_fkey"
            columns: ["pair_id"]
            isOneToOne: false
            referencedRelation: "buddy_pairs"
            referencedColumns: ["id"]
          },
        ]
      }
      buddy_invites: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          invite_code: string
          inviter_id: string
          inviter_name: string | null
          status: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          invite_code: string
          inviter_id: string
          inviter_name?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          invite_code?: string
          inviter_id?: string
          inviter_name?: string | null
          status?: string
        }
        Relationships: []
      }
      buddy_pairs: {
        Row: {
          created_at: string
          dissolved_at: string | null
          id: string
          invite_id: string | null
          status: string
          student_a_id: string
          student_a_name: string | null
          student_b_id: string
          student_b_name: string | null
        }
        Insert: {
          created_at?: string
          dissolved_at?: string | null
          id?: string
          invite_id?: string | null
          status?: string
          student_a_id: string
          student_a_name?: string | null
          student_b_id: string
          student_b_name?: string | null
        }
        Update: {
          created_at?: string
          dissolved_at?: string | null
          id?: string
          invite_id?: string | null
          status?: string
          student_a_id?: string
          student_a_name?: string | null
          student_b_id?: string
          student_b_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "buddy_pairs_invite_id_fkey"
            columns: ["invite_id"]
            isOneToOne: false
            referencedRelation: "buddy_invites"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_state: {
        Row: {
          call_booked_at: string | null
          converted_at: string | null
          course_pitch_sent: boolean | null
          created_at: string | null
          free_call_sent: boolean | null
          graphy_enrolled_free: boolean | null
          graphy_enrolled_paid: boolean | null
          last_messaged_at: string | null
          lead_source: string | null
          mentorship_active: boolean | null
          money_constraint: boolean | null
          money_constraint_sent: boolean | null
          name: string | null
          next_offer_friday: string | null
          offer_sent_friday: boolean | null
          offer_sent_saturday: boolean | null
          phone_number: string
          ppc_sequence_node: number | null
          sequence_entry_msg: number | null
          updated_at: string | null
          webinar_nudge_sent: boolean | null
          workflow_status: string | null
        }
        Insert: {
          call_booked_at?: string | null
          converted_at?: string | null
          course_pitch_sent?: boolean | null
          created_at?: string | null
          free_call_sent?: boolean | null
          graphy_enrolled_free?: boolean | null
          graphy_enrolled_paid?: boolean | null
          last_messaged_at?: string | null
          lead_source?: string | null
          mentorship_active?: boolean | null
          money_constraint?: boolean | null
          money_constraint_sent?: boolean | null
          name?: string | null
          next_offer_friday?: string | null
          offer_sent_friday?: boolean | null
          offer_sent_saturday?: boolean | null
          phone_number: string
          ppc_sequence_node?: number | null
          sequence_entry_msg?: number | null
          updated_at?: string | null
          webinar_nudge_sent?: boolean | null
          workflow_status?: string | null
        }
        Update: {
          call_booked_at?: string | null
          converted_at?: string | null
          course_pitch_sent?: boolean | null
          created_at?: string | null
          free_call_sent?: boolean | null
          graphy_enrolled_free?: boolean | null
          graphy_enrolled_paid?: boolean | null
          last_messaged_at?: string | null
          lead_source?: string | null
          mentorship_active?: boolean | null
          money_constraint?: boolean | null
          money_constraint_sent?: boolean | null
          name?: string | null
          next_offer_friday?: string | null
          offer_sent_friday?: boolean | null
          offer_sent_saturday?: boolean | null
          phone_number?: string
          ppc_sequence_node?: number | null
          sequence_entry_msg?: number | null
          updated_at?: string | null
          webinar_nudge_sent?: boolean | null
          workflow_status?: string | null
        }
        Relationships: []
      }
      daily_sprint_goals: {
        Row: {
          activity_type: string
          completed: boolean
          completed_at: string | null
          created_at: string
          description: string
          id: string
          position: number
          sprint_date: string
          subject: string
          user_id: string
        }
        Insert: {
          activity_type: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description: string
          id?: string
          position?: number
          sprint_date?: string
          subject: string
          user_id: string
        }
        Update: {
          activity_type?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description?: string
          id?: string
          position?: number
          sprint_date?: string
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_streaks: {
        Row: {
          activity_date: string
          activity_type: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          activity_date?: string
          activity_type: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          activity_date?: string
          activity_type?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      flashcard_progress: {
        Row: {
          card_id: string
          category: string
          id: string
          knew: boolean
          practiced_at: string
          user_id: string
        }
        Insert: {
          card_id: string
          category: string
          id?: string
          knew: boolean
          practiced_at?: string
          user_id: string
        }
        Update: {
          card_id?: string
          category?: string
          id?: string
          knew?: boolean
          practiced_at?: string
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          current_status: string | null
          email: string | null
          id: string
          name: string | null
          phone_number: string | null
          prep_level: string | null
          source: string | null
          target_percentile: number | null
          target_year: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          current_status?: string | null
          email?: string | null
          id?: string
          name?: string | null
          phone_number?: string | null
          prep_level?: string | null
          source?: string | null
          target_percentile?: number | null
          target_year?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          current_status?: string | null
          email?: string | null
          id?: string
          name?: string | null
          phone_number?: string | null
          prep_level?: string | null
          source?: string | null
          target_percentile?: number | null
          target_year?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          body: string
          created_at: string | null
          id: string
          is_read: boolean | null
          nudge_type: string | null
          title: string
          type: string
          user_id: string | null
          variant_index: number | null
        }
        Insert: {
          action_url?: string | null
          body: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          nudge_type?: string | null
          title: string
          type?: string
          user_id?: string | null
          variant_index?: number | null
        }
        Update: {
          action_url?: string | null
          body?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          nudge_type?: string | null
          title?: string
          type?: string
          user_id?: string | null
          variant_index?: number | null
        }
        Relationships: []
      }
      planner_activity: {
        Row: {
          completed: boolean
          created_at: string
          date: string
          id: string
          phone_number: string
          subject: string
          time_spent_minutes: number | null
        }
        Insert: {
          completed?: boolean
          created_at?: string
          date: string
          id?: string
          phone_number: string
          subject: string
          time_spent_minutes?: number | null
        }
        Update: {
          completed?: boolean
          created_at?: string
          date?: string
          id?: string
          phone_number?: string
          subject?: string
          time_spent_minutes?: number | null
        }
        Relationships: []
      }
      planner_entries: {
        Row: {
          completion_status: Json | null
          date: string
          id: string
          is_mock_day: boolean | null
          lrdi_sets: number | null
          lrdi_topic: string | null
          phone_number: string
          qa_questions: number | null
          qa_topic: string | null
          updated_at: string | null
          varc_questions: number | null
          varc_topic: string | null
          weekly_test: boolean | null
        }
        Insert: {
          completion_status?: Json | null
          date: string
          id?: string
          is_mock_day?: boolean | null
          lrdi_sets?: number | null
          lrdi_topic?: string | null
          phone_number: string
          qa_questions?: number | null
          qa_topic?: string | null
          updated_at?: string | null
          varc_questions?: number | null
          varc_topic?: string | null
          weekly_test?: boolean | null
        }
        Update: {
          completion_status?: Json | null
          date?: string
          id?: string
          is_mock_day?: boolean | null
          lrdi_sets?: number | null
          lrdi_topic?: string | null
          phone_number?: string
          qa_questions?: number | null
          qa_topic?: string | null
          updated_at?: string | null
          varc_questions?: number | null
          varc_topic?: string | null
          weekly_test?: boolean | null
        }
        Relationships: []
      }
      planner_heat_score: {
        Row: {
          consistency_score: number
          crash_mode: boolean
          days_since_join: number
          heat_score: number
          lead_category: string
          mock_attempts: number
          phone_number: string
          total_active_days: number
          updated_at: string
        }
        Insert: {
          consistency_score?: number
          crash_mode?: boolean
          days_since_join?: number
          heat_score?: number
          lead_category?: string
          mock_attempts?: number
          phone_number: string
          total_active_days?: number
          updated_at?: string
        }
        Update: {
          consistency_score?: number
          crash_mode?: boolean
          days_since_join?: number
          heat_score?: number
          lead_category?: string
          mock_attempts?: number
          phone_number?: string
          total_active_days?: number
          updated_at?: string
        }
        Relationships: []
      }
      planner_stats: {
        Row: {
          crash_mode: boolean | null
          current_phase: string | null
          last_generated_index: number | null
          phone_number: string
          start_date: string
          target_year: number
          updated_at: string | null
        }
        Insert: {
          crash_mode?: boolean | null
          current_phase?: string | null
          last_generated_index?: number | null
          phone_number: string
          start_date?: string
          target_year: number
          updated_at?: string | null
        }
        Update: {
          crash_mode?: boolean | null
          current_phase?: string | null
          last_generated_index?: number | null
          phone_number?: string
          start_date?: string
          target_year?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      practice_lab_attempts: {
        Row: {
          answers_json: Json | null
          chapter_slug: string
          correct: number
          created_at: string
          id: string
          incorrect: number
          score_pct: number
          section_id: string
          time_used_seconds: number
          total_questions: number
          unanswered: number
          user_id: string
        }
        Insert: {
          answers_json?: Json | null
          chapter_slug: string
          correct?: number
          created_at?: string
          id?: string
          incorrect?: number
          score_pct?: number
          section_id: string
          time_used_seconds?: number
          total_questions: number
          unanswered?: number
          user_id: string
        }
        Update: {
          answers_json?: Json | null
          chapter_slug?: string
          correct?: number
          created_at?: string
          id?: string
          incorrect?: number
          score_pct?: number
          section_id?: string
          time_used_seconds?: number
          total_questions?: number
          unanswered?: number
          user_id?: string
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
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          name: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          name?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          created_at: string | null
          id: string
          token: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          token: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          token?: string
          user_id?: string | null
        }
        Relationships: []
      }
      question_bookmarks: {
        Row: {
          chapter_slug: string
          correct_answer: string | null
          created_at: string
          id: string
          options: Json | null
          question_id: string
          question_text: string
          question_type: string | null
          section_id: string
          user_id: string
        }
        Insert: {
          chapter_slug: string
          correct_answer?: string | null
          created_at?: string
          id?: string
          options?: Json | null
          question_id: string
          question_text: string
          question_type?: string | null
          section_id: string
          user_id: string
        }
        Update: {
          chapter_slug?: string
          correct_answer?: string | null
          created_at?: string
          id?: string
          options?: Json | null
          question_id?: string
          question_text?: string
          question_type?: string | null
          section_id?: string
          user_id?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          count: number
          key: string
          reset_at: string
        }
        Insert: {
          count?: number
          key: string
          reset_at: string
        }
        Update: {
          count?: number
          key?: string
          reset_at?: string
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
      cleanup_rate_limits: { Args: never; Returns: undefined }
      extract_date_from_timestamptz: { Args: { ts: string }; Returns: string }
      is_buddy_pair_member: {
        Args: { _pair_id: string; _user_id: string }
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
