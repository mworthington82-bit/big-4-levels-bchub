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
      activity_ideas: {
        Row: {
          activity_text: string
          blooms_level: string | null
          created_at: string
          department: string
          how_to_run: string | null
          id: string
          inclusion_rating: string
          inclusion_strengths: Json
          inclusion_tips: Json
          lead_stage: string | null
          lead_stages: string[]
          lead_was_suggested: boolean | null
          learners: string | null
          ofsted_impact: string | null
          ofsted_implementation: string | null
          ofsted_intent: string | null
          primary_tool: string
          secondary_tool: string | null
          setup_steps: Json
          show_name: boolean
          staff_name: string | null
          subject: string | null
          why_this_tool: string | null
        }
        Insert: {
          activity_text: string
          blooms_level?: string | null
          created_at?: string
          department: string
          how_to_run?: string | null
          id?: string
          inclusion_rating: string
          inclusion_strengths?: Json
          inclusion_tips?: Json
          lead_stage?: string | null
          lead_stages?: string[]
          lead_was_suggested?: boolean | null
          learners?: string | null
          ofsted_impact?: string | null
          ofsted_implementation?: string | null
          ofsted_intent?: string | null
          primary_tool: string
          secondary_tool?: string | null
          setup_steps?: Json
          show_name?: boolean
          staff_name?: string | null
          subject?: string | null
          why_this_tool?: string | null
        }
        Update: {
          activity_text?: string
          blooms_level?: string | null
          created_at?: string
          department?: string
          how_to_run?: string | null
          id?: string
          inclusion_rating?: string
          inclusion_strengths?: Json
          inclusion_tips?: Json
          lead_stage?: string | null
          lead_stages?: string[]
          lead_was_suggested?: boolean | null
          learners?: string | null
          ofsted_impact?: string | null
          ofsted_implementation?: string | null
          ofsted_intent?: string | null
          primary_tool?: string
          secondary_tool?: string | null
          setup_steps?: Json
          show_name?: boolean
          staff_name?: string | null
          subject?: string | null
          why_this_tool?: string | null
        }
        Relationships: []
      }
      bookmarks: {
        Row: {
          bookmarked_at: string
          id: string
          resource_id: string
          staff_email: string
        }
        Insert: {
          bookmarked_at?: string
          id?: string
          resource_id: string
          staff_email: string
        }
        Update: {
          bookmarked_at?: string
          id?: string
          resource_id?: string
          staff_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      csv_upload_log: {
        Row: {
          id: string
          records_added: number | null
          records_processed: number | null
          records_updated: number | null
          uploaded_at: string
          uploaded_by: string | null
          warnings: string[] | null
        }
        Insert: {
          id?: string
          records_added?: number | null
          records_processed?: number | null
          records_updated?: number | null
          uploaded_at?: string
          uploaded_by?: string | null
          warnings?: string[] | null
        }
        Update: {
          id?: string
          records_added?: number | null
          records_processed?: number | null
          records_updated?: number | null
          uploaded_at?: string
          uploaded_by?: string | null
          warnings?: string[] | null
        }
        Relationships: []
      }
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
          {
            foreignKeyName: "evidence_comments_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "leader_evidence_public"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_likes: {
        Row: {
          id: string
          liked_at: string
          post_id: string
          staff_email: string
        }
        Insert: {
          id?: string
          liked_at?: string
          post_id: string
          staff_email: string
        }
        Update: {
          id?: string
          liked_at?: string
          post_id?: string
          staff_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidence_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "evidence_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_posts: {
        Row: {
          created_at: string
          department: string | null
          id: string
          inclusion_focus: string | null
          is_published: boolean
          learner_impact: string
          staff_email: string
          staff_name: string | null
          title: string
          tool: string
          updated_at: string
          what_i_did: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          id?: string
          inclusion_focus?: string | null
          is_published?: boolean
          learner_impact: string
          staff_email: string
          staff_name?: string | null
          title: string
          tool: string
          updated_at?: string
          what_i_did: string
        }
        Update: {
          created_at?: string
          department?: string | null
          id?: string
          inclusion_focus?: string | null
          is_published?: boolean
          learner_impact?: string
          staff_email?: string
          staff_name?: string | null
          title?: string
          tool?: string
          updated_at?: string
          what_i_did?: string
        }
        Relationships: []
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
      mentor_signups: {
        Row: {
          created_at: string
          department: string | null
          id: string
          is_active: boolean
          mentor_bio: string | null
          staff_email: string
          staff_name: string | null
          tools_offered: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          id?: string
          is_active?: boolean
          mentor_bio?: string | null
          staff_email: string
          staff_name?: string | null
          tools_offered?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          id?: string
          is_active?: boolean
          mentor_bio?: string | null
          staff_email?: string
          staff_name?: string | null
          tools_offered?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      module_completions: {
        Row: {
          completed_at: string
          completed_via: string
          created_at: string
          id: string
          module_id: string
          quiz_passed: boolean
          staff_email: string
        }
        Insert: {
          completed_at?: string
          completed_via?: string
          created_at?: string
          id?: string
          module_id: string
          quiz_passed?: boolean
          staff_email: string
        }
        Update: {
          completed_at?: string
          completed_via?: string
          created_at?: string
          id?: string
          module_id?: string
          quiz_passed?: boolean
          staff_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_completions_staff_email_fkey"
            columns: ["staff_email"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["email"]
          },
        ]
      }
      module_steps: {
        Row: {
          created_at: string
          id: string
          inclusion_note: string | null
          module_id: string
          step_content: string | null
          step_number: number
          step_title: string
          step_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          inclusion_note?: string | null
          module_id: string
          step_content?: string | null
          step_number: number
          step_title: string
          step_type: string
        }
        Update: {
          created_at?: string
          id?: string
          inclusion_note?: string | null
          module_id?: string
          step_content?: string | null
          step_number?: number
          step_title?: string
          step_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_steps_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["module_id"]
          },
        ]
      }
      modules: {
        Row: {
          created_at: string
          estimated_minutes: number
          is_published: boolean
          level: string
          module_id: string
          module_subtitle: string | null
          module_title: string
          tool_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          estimated_minutes?: number
          is_published?: boolean
          level: string
          module_id: string
          module_subtitle?: string | null
          module_title: string
          tool_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          estimated_minutes?: number
          is_published?: boolean
          level?: string
          module_id?: string
          module_subtitle?: string | null
          module_title?: string
          tool_name?: string
          updated_at?: string
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
          {
            foreignKeyName: "notifications_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "leader_evidence_public"
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
      quiz_questions: {
        Row: {
          correct_option: string
          created_at: string
          explanation: string | null
          id: string
          module_id: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question_order: number
          question_text: string
        }
        Insert: {
          correct_option: string
          created_at?: string
          explanation?: string | null
          id?: string
          module_id: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question_order: number
          question_text: string
        }
        Update: {
          correct_option?: string
          created_at?: string
          explanation?: string | null
          id?: string
          module_id?: string
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          question_order?: number
          question_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["module_id"]
          },
        ]
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
      resources: {
        Row: {
          created_at: string
          description: string | null
          file_path: string | null
          id: string
          is_published: boolean
          lead_stage: string
          level: string
          resource_type: string
          title: string
          tool: string
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_path?: string | null
          id?: string
          is_published?: boolean
          lead_stage: string
          level: string
          resource_type: string
          title: string
          tool: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          file_path?: string | null
          id?: string
          is_published?: boolean
          lead_stage?: string
          level?: string
          resource_type?: string
          title?: string
          tool?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      staff_profiles: {
        Row: {
          assigned_level: string | null
          canva_explorer_evidenced: boolean
          canva_practitioner_evidenced: boolean
          canva_score: number | null
          copilot_explorer_evidenced: boolean
          copilot_practitioner_evidenced: boolean
          copilot_score: number | null
          created_at: string
          data_uploaded_at: string | null
          department: string | null
          edpuzzle_explorer_evidenced: boolean
          edpuzzle_practitioner_evidenced: boolean
          edpuzzle_score: number | null
          email: string
          explorer_complete: boolean
          explorer_evidenced_count: number
          forms_explorer_evidenced: boolean
          forms_practitioner_evidenced: boolean
          forms_score: number | null
          leader_unlocked: boolean
          module_popups_shown: string[]
          name: string | null
          onboarding_shown: boolean
          practitioner_complete: boolean
          practitioner_evidenced_count: number
          practitioner_unlocked: boolean
          teams_explorer_evidenced: boolean
          teams_practitioner_evidenced: boolean
          teams_score: number | null
          updated_at: string
          user_id: string | null
          weighted_score: number | null
          xr_score: number | null
        }
        Insert: {
          assigned_level?: string | null
          canva_explorer_evidenced?: boolean
          canva_practitioner_evidenced?: boolean
          canva_score?: number | null
          copilot_explorer_evidenced?: boolean
          copilot_practitioner_evidenced?: boolean
          copilot_score?: number | null
          created_at?: string
          data_uploaded_at?: string | null
          department?: string | null
          edpuzzle_explorer_evidenced?: boolean
          edpuzzle_practitioner_evidenced?: boolean
          edpuzzle_score?: number | null
          email: string
          explorer_complete?: boolean
          explorer_evidenced_count?: number
          forms_explorer_evidenced?: boolean
          forms_practitioner_evidenced?: boolean
          forms_score?: number | null
          leader_unlocked?: boolean
          module_popups_shown?: string[]
          name?: string | null
          onboarding_shown?: boolean
          practitioner_complete?: boolean
          practitioner_evidenced_count?: number
          practitioner_unlocked?: boolean
          teams_explorer_evidenced?: boolean
          teams_practitioner_evidenced?: boolean
          teams_score?: number | null
          updated_at?: string
          user_id?: string | null
          weighted_score?: number | null
          xr_score?: number | null
        }
        Update: {
          assigned_level?: string | null
          canva_explorer_evidenced?: boolean
          canva_practitioner_evidenced?: boolean
          canva_score?: number | null
          copilot_explorer_evidenced?: boolean
          copilot_practitioner_evidenced?: boolean
          copilot_score?: number | null
          created_at?: string
          data_uploaded_at?: string | null
          department?: string | null
          edpuzzle_explorer_evidenced?: boolean
          edpuzzle_practitioner_evidenced?: boolean
          edpuzzle_score?: number | null
          email?: string
          explorer_complete?: boolean
          explorer_evidenced_count?: number
          forms_explorer_evidenced?: boolean
          forms_practitioner_evidenced?: boolean
          forms_score?: number | null
          leader_unlocked?: boolean
          module_popups_shown?: string[]
          name?: string | null
          onboarding_shown?: boolean
          practitioner_complete?: boolean
          practitioner_evidenced_count?: number
          practitioner_unlocked?: boolean
          teams_explorer_evidenced?: boolean
          teams_practitioner_evidenced?: boolean
          teams_score?: number | null
          updated_at?: string
          user_id?: string | null
          weighted_score?: number | null
          xr_score?: number | null
        }
        Relationships: []
      }
      training_bookings: {
        Row: {
          booking_url: string
          created_at: string
          created_by: string | null
          id: string
          level: string
          name: string
          tool: string
        }
        Insert: {
          booking_url: string
          created_at?: string
          created_by?: string | null
          id?: string
          level: string
          name: string
          tool: string
        }
        Update: {
          booking_url?: string
          created_at?: string
          created_by?: string | null
          id?: string
          level?: string
          name?: string
          tool?: string
        }
        Relationships: []
      }
      training_sessions: {
        Row: {
          bypass_password: string
          created_at: string
          id: string
          is_active: boolean
          module_id: string
          session_date: string | null
          session_title: string
          updated_at: string
        }
        Insert: {
          bypass_password: string
          created_at?: string
          id?: string
          is_active?: boolean
          module_id: string
          session_date?: string | null
          session_title: string
          updated_at?: string
        }
        Update: {
          bypass_password?: string
          created_at?: string
          id?: string
          is_active?: boolean
          module_id?: string
          session_date?: string | null
          session_title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_sessions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["module_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          email: string
          role: string
        }
        Insert: {
          email: string
          role: string
        }
        Update: {
          email?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_email_fkey"
            columns: ["email"]
            isOneToOne: true
            referencedRelation: "staff_profiles"
            referencedColumns: ["email"]
          },
        ]
      }
    }
    Views: {
      immersive_sessions_public: {
        Row: {
          created_at: string | null
          department: string | null
          evidence_type: Database["public"]["Enums"]["evidence_type"] | null
          file_url: string | null
          full_name: string | null
          how_enhanced: string | null
          id: string | null
          immersive_activity: string | null
          impact_reflection: string | null
          learner_context: string | null
          lesson_plan_url: string | null
          photos_urls: string[] | null
          session_number: number | null
          title: string | null
          user_id: string | null
          video_link: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          evidence_type?: Database["public"]["Enums"]["evidence_type"] | null
          file_url?: string | null
          full_name?: string | null
          how_enhanced?: string | null
          id?: string | null
          immersive_activity?: string | null
          impact_reflection?: string | null
          learner_context?: string | null
          lesson_plan_url?: string | null
          photos_urls?: string[] | null
          session_number?: number | null
          title?: string | null
          user_id?: string | null
          video_link?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          evidence_type?: Database["public"]["Enums"]["evidence_type"] | null
          file_url?: string | null
          full_name?: string | null
          how_enhanced?: string | null
          id?: string | null
          immersive_activity?: string | null
          impact_reflection?: string | null
          learner_context?: string | null
          lesson_plan_url?: string | null
          photos_urls?: string[] | null
          session_number?: number | null
          title?: string | null
          user_id?: string | null
          video_link?: string | null
        }
        Relationships: []
      }
      leader_evidence_public: {
        Row: {
          case_study_how: string | null
          case_study_what: string | null
          case_study_why: string | null
          created_at: string | null
          department: string | null
          description: string | null
          evidence_type: Database["public"]["Enums"]["evidence_type"] | null
          file_url: string | null
          full_name: string | null
          id: string | null
          impact_reflection: string | null
          title: string | null
          tool: Database["public"]["Enums"]["leader_tool"] | null
          updated_at: string | null
          user_id: string | null
          video_link: string | null
        }
        Insert: {
          case_study_how?: string | null
          case_study_what?: string | null
          case_study_why?: string | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          evidence_type?: Database["public"]["Enums"]["evidence_type"] | null
          file_url?: string | null
          full_name?: string | null
          id?: string | null
          impact_reflection?: string | null
          title?: string | null
          tool?: Database["public"]["Enums"]["leader_tool"] | null
          updated_at?: string | null
          user_id?: string | null
          video_link?: string | null
        }
        Update: {
          case_study_how?: string | null
          case_study_what?: string | null
          case_study_why?: string | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          evidence_type?: Database["public"]["Enums"]["evidence_type"] | null
          file_url?: string | null
          full_name?: string | null
          id?: string | null
          impact_reflection?: string | null
          title?: string | null
          tool?: Database["public"]["Enums"]["leader_tool"] | null
          updated_at?: string | null
          user_id?: string | null
          video_link?: string | null
        }
        Relationships: []
      }
      profiles_public: {
        Row: {
          department: string | null
          full_name: string | null
          user_id: string | null
        }
        Insert: {
          department?: string | null
          full_name?: string | null
          user_id?: string | null
        }
        Update: {
          department?: string | null
          full_name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      training_sessions_safe: {
        Row: {
          created_at: string | null
          id: string | null
          is_active: boolean | null
          module_id: string | null
          session_date: string | null
          session_title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          module_id?: string | null
          session_date?: string | null
          session_title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          module_id?: string | null
          session_date?: string | null
          session_title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_sessions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["module_id"]
          },
        ]
      }
    }
    Functions: {
      admin_list_training_sessions: {
        Args: never
        Returns: {
          bypass_password: string
          created_at: string
          id: string
          is_active: boolean
          module_id: string
          session_date: string
          session_title: string
          updated_at: string
        }[]
      }
      admin_mark_module_complete: {
        Args: { _emails: string[]; _module_id: string }
        Returns: Json
      }
      admin_upsert_staff: {
        Args: { payload: Json }
        Returns: {
          added: number
          updated: number
        }[]
      }
      apply_data_retention: { Args: never; Returns: undefined }
      is_admin: { Args: never; Returns: boolean }
      is_leader: { Args: never; Returns: boolean }
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
