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
      activities: {
        Row: {
          created_at: string | null
          description: string | null
          expert_avatar: string | null
          expert_name: string | null
          expert_title: string | null
          goals: string | null
          id: string
          image_url: string | null
          instructions: string | null
          likes_count: number | null
          points: number | null
          scheduled_date: string | null
          tags: string[] | null
          title: string
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          expert_avatar?: string | null
          expert_name?: string | null
          expert_title?: string | null
          goals?: string | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          likes_count?: number | null
          points?: number | null
          scheduled_date?: string | null
          tags?: string[] | null
          title: string
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          expert_avatar?: string | null
          expert_name?: string | null
          expert_title?: string | null
          goals?: string | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          likes_count?: number | null
          points?: number | null
          scheduled_date?: string | null
          tags?: string[] | null
          title?: string
          video_url?: string | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          content: string
          created_at: string
          id: string
          points_awarded: number
          submission_date: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          points_awarded?: number
          submission_date?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          points_awarded?: number
          submission_date?: string
          user_id?: string
        }
        Relationships: []
      }
      page_views: {
        Row: {
          created_at: string
          id: string
          page_path: string
          session_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          page_path: string
          session_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          page_path?: string
          session_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activated_at: string | null
          avatar_url: string | null
          child_age: string | null
          child_gender: string | null
          created_at: string | null
          current_streak: number | null
          full_name: string | null
          id: string
          last_activity_date: string | null
          phone_number: string | null
          pro_expires_at: string | null
          subscription_status: string
          total_activities: number | null
          total_points: number | null
          trial_ends_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          avatar_url?: string | null
          child_age?: string | null
          child_gender?: string | null
          created_at?: string | null
          current_streak?: number | null
          full_name?: string | null
          id?: string
          last_activity_date?: string | null
          phone_number?: string | null
          pro_expires_at?: string | null
          subscription_status?: string
          total_activities?: number | null
          total_points?: number | null
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          activated_at?: string | null
          avatar_url?: string | null
          child_age?: string | null
          child_gender?: string | null
          created_at?: string | null
          current_streak?: number | null
          full_name?: string | null
          id?: string
          last_activity_date?: string | null
          phone_number?: string | null
          pro_expires_at?: string | null
          subscription_status?: string
          total_activities?: number | null
          total_points?: number | null
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      saved_activities: {
        Row: {
          activity_id: string
          id: string
          saved_at: string
          user_id: string
        }
        Insert: {
          activity_id: string
          id?: string
          saved_at?: string
          user_id: string
        }
        Update: {
          activity_id?: string
          id?: string
          saved_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_activities_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_products: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          link: string | null
          name: string
          price: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          link?: string | null
          name: string
          price?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          link?: string | null
          name?: string
          price?: number | null
        }
        Relationships: []
      }
      stories_music: {
        Row: {
          content_url: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          thumbnail_url: string | null
          title: string
          type: string
        }
        Insert: {
          content_url?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          thumbnail_url?: string | null
          title: string
          type: string
        }
        Update: {
          content_url?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          thumbnail_url?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string | null
          currency: string | null
          id: string
          order_id: string
          payment_method: string
          status: string
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          order_id: string
          payment_method: string
          status?: string
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          order_id?: string
          payment_method?: string
          status?: string
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          activity_id: string
          completed_at: string | null
          id: string
          points_earned: number | null
          user_id: string
        }
        Insert: {
          activity_id: string
          completed_at?: string | null
          id?: string
          points_earned?: number | null
          user_id: string
        }
        Update: {
          activity_id?: string
          completed_at?: string | null
          id?: string
          points_earned?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          duration_seconds: number | null
          ended_at: string | null
          id: string
          last_activity_at: string
          session_id: string
          started_at: string
          user_id: string | null
        }
        Insert: {
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          last_activity_at?: string
          session_id: string
          started_at?: string
          user_id?: string | null
        }
        Update: {
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          last_activity_at?: string
          session_id?: string
          started_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activate_trial: { Args: never; Returns: Json }
      admin_extend_pro: {
        Args: { p_months: number; p_user_id: string }
        Returns: Json
      }
      admin_get_all_subscriptions: {
        Args: never
        Returns: {
          activated_at: string
          created_at: string
          email: string
          full_name: string
          phone_number: string
          pro_expires_at: string
          subscription_status: string
          trial_ends_at: string
          user_id: string
        }[]
      }
      admin_get_daily_analytics: {
        Args: { p_days?: number }
        Returns: {
          avg_duration_seconds: number
          date: string
          page_views: number
          sessions: number
          unique_users: number
        }[]
      }
      admin_get_popular_pages: {
        Args: { p_days?: number }
        Returns: {
          page_path: string
          unique_viewers: number
          view_count: number
        }[]
      }
      admin_get_realtime_stats: { Args: never; Returns: Json }
      admin_revoke_pro: { Args: { p_user_id: string }; Returns: Json }
      admin_upgrade_user_to_pro: {
        Args: { p_duration_months?: number; p_user_id: string }
        Returns: Json
      }
      check_subscription_status: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      submit_feedback: { Args: { p_content: string }; Returns: Json }
      upgrade_to_pro: {
        Args: { p_order_id: string; p_transaction_id: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "user" | "expert"
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
      app_role: ["admin", "user", "expert"],
    },
  },
} as const
