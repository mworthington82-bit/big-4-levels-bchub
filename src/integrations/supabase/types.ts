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
      evidence_comments: {
        Row: {
          comment: string
          created_at: string
          department: string
          evidence_id: string
          full_name: string
          id: string
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          department: string
          evidence_id: string
          full_name: string
          id?: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          department?: string
          evidence_id?: string
          full_name?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidence_comments_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "leader_evidence"
            referencedColumns: ["id"]
          },
        ]
      }
      immersive_sessions: {
        Row: {
          created_at: string
          department: string
          email: string
          evidence_type: Database["public"]["Enums"]["evidence_type"]
          file_url: string | null
          full_name: string
          how_enhanced: string
          id: string
          immersive_activity: string
          impact_reflection: string
          learner_context: string
          lesson_plan_url: string | null
          photos_urls: string[] | null
          session_number: number
          title: string
          user_id: string
          video_link: string | null
        }
        Insert: {
          created_at?: string
          department: string
          email: string
          evidence_type: Database["public"]["Enums"]["evidence_type"]
          file_url?: string | null
          full_name: string
          how_enhanced: string
          id?: string
          immersive_activity: string
          impact_reflection: string
          learner_context: string
          lesson_plan_url?: string | null
          photos_urls?: string[] | null
          session_number: number
          title: string
          user_id: string
          video_link?: string | null
        }
        Update: {
          created_at?: string
          department?: string
          email?: string
          evidence_type?: Database["public"]["Enums"]["evidence_type"]
          file_url?: string | null
          full_name?: string
          how_enhanced?: string
          id?: string
          immersive_activity?: string
          impact_reflection?: string
          learner_context?: string
          lesson_plan_url?: string | null
          photos_urls?: string[] | null
          session_number?: number
          title?: string
          user_id?: string
          video_link?: string | null
        }
        Relationships: []
      }
      inclusion_ideas: {
        Row: {
          ai_feedback_full: string | null
          ai_feedback_rating: string | null
          ai_feedback_strengths: string | null
          ai_feedback_stretch: string | null
          created_at: string
          department: string
          id: string
          idea_text: string
          inclusion_rating: string | null
          level: string
          show_name: boolean
          staff_name: string | null
          tool_name: string
        }
        Insert: {
          ai_feedback_full?: string | null
          ai_feedback_rating?: string | null
          ai_feedback_strengths?: string | null
          ai_feedback_stretch?: string | null
          created_at?: string
          department: string
          id?: string
          idea_text: string
          inclusion_rating?: string | null
          level: string
          show_name?: boolean
          staff_name?: string | null
          tool_name: string
        }
        Update: {
          ai_feedback_full?: string | null
          ai_feedback_rating?: string | null
          ai_feedback_strengths?: string | null
          ai_feedback_stretch?: string | null
          created_at?: string
          department?: string
          id?: string
          idea_text?: string
          inclusion_rating?: string | null
          level?: string
          show_name?: boolean
          staff_name?: string | null
          tool_name?: string
        }
        Relationships: []
      }
      inclusion_responses: {
        Row: {
          avg_rating: number
          checklist_data: Json
          created_at: string
          department: string
          full_name: string
          id: string
          ratings_data: Json
          session_id: string
          total_checked: number
          updated_at: string
        }
        Insert: {
          avg_rating?: number
          checklist_data?: Json
          created_at?: string
          department?: string
          full_name?: string
          id?: string
          ratings_data?: Json
          session_id: string
          total_checked?: number
          updated_at?: string
        }
        Update: {
          avg_rating?: number
          checklist_data?: Json
          created_at?: string
          department?: string
          full_name?: string
          id?: string
          ratings_data?: Json
          session_id?: string
          total_checked?: number
          updated_at?: string
        }
        Relationships: []
      }
      inclusion_stories: {
        Row: {
          created_at: string
          department: string
          full_name: string
          id: string
          story: string
          tool_name: string
        }
        Insert: {
          created_at?: string
          department: string
          full_name: string
          id?: string
          story: string
          tool_name: string
        }
        Update: {
          created_at?: string
          department?: string
          full_name?: string
          id?: string
          story?: string
          tool_name?: string
        }
        Relationships: []
      }
      leader_evidence: {
        Row: {
          case_study_how: string | null
          case_study_what: string | null
          case_study_why: string | null
          created_at: string
          department: string
          description: string | null
          email: string
          evidence_type: Database["public"]["Enums"]["evidence_type"]
          file_url: string | null
          full_name: string
          id: string
          impact_reflection: string
          title: string
          tool: Database["public"]["Enums"]["leader_tool"]
          updated_at: string
          user_id: string
          video_link: string | null
        }
        Insert: {
          case_study_how?: string | null
          case_study_what?: string | null
          case_study_why?: string | null
          created_at?: string
          department: string
          description?: string | null
          email: string
          evidence_type: Database["public"]["Enums"]["evidence_type"]
          file_url?: string | null
          full_name: string
          id?: string
          impact_reflection: string
          title: string
          tool: Database["public"]["Enums"]["leader_tool"]
          updated_at?: string
          user_id: string
          video_link?: string | null
        }
        Update: {
          case_study_how?: string | null
          case_study_what?: string | null
          case_study_why?: string | null
          created_at?: string
          department?: string
          description?: string | null
          email?: string
          evidence_type?: Database["public"]["Enums"]["evidence_type"]
          file_url?: string | null
          full_name?: string
          id?: string
          impact_reflection?: string
          title?: string
          tool?: Database["public"]["Enums"]["leader_tool"]
          updated_at?: string
          user_id?: string
          video_link?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          evidence_id: string | null
          from_user_name: string
          id: string
          is_read: boolean
          message: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          evidence_id?: string | null
          from_user_name: string
          id?: string
          is_read?: boolean
          message: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          evidence_id?: string | null
          from_user_name?: string
          id?: string
          is_read?: boolean
          message?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "leader_evidence"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          department: string
          email: string
          full_name: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department: string
          email: string
          full_name: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department?: string
          email?: string
          full_name?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reflections: {
        Row: {
          created_at: string
          department: string
          id: string
          level: string
          other_department: string | null
          reflection_text: string
          tool_name: string
        }
        Insert: {
          created_at?: string
          department: string
          id?: string
          level: string
          other_department?: string | null
          reflection_text: string
          tool_name: string
        }
        Update: {
          created_at?: string
          department?: string
          id?: string
          level?: string
          other_department?: string | null
          reflection_text?: string
          tool_name?: string
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
      evidence_type: "video_link" | "file_upload" | "case_study"
      leader_tool:
        | "teams"
        | "forms"
        | "canva"
        | "edpuzzle"
        | "copilot"
        | "immersive"
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
      evidence_type: ["video_link", "file_upload", "case_study"],
      leader_tool: [
        "teams",
        "forms",
        "canva",
        "edpuzzle",
        "copilot",
        "immersive",
      ],
    },
  },
} as const
