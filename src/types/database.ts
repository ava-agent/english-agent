export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface ExampleSentence {
  en: string;
  zh: string;
  context: string;
}

export interface DialogueLine {
  speaker: string;
  text: string;
}

export interface ContextualDialogue {
  scenario: string;
  lines: DialogueLine[];
}

export interface SessionPlan {
  items: SessionPlanItem[];
}

export interface SessionPlanItem {
  type: "review" | "learn" | "practice";
  vocabulary_id?: string;
  card_id?: string;
  practice_data?: PracticeData;
}

export interface PracticeData {
  type: "fill_in_blank";
  sentence: string;
  answer: string;
  options: string[];
  vocabulary_id: string;
  word: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          timezone: string;
          daily_new_words: number;
          session_length_minutes: number;
          travel_weight: number;
          notification_hour: number;
          streak_freeze_remaining: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          timezone?: string;
          daily_new_words?: number;
          session_length_minutes?: number;
          travel_weight?: number;
          notification_hour?: number;
          streak_freeze_remaining?: number;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      vocabulary: {
        Row: {
          id: string;
          word: string;
          pronunciation: string | null;
          definition: string;
          definition_zh: string | null;
          category: "travel" | "software";
          subcategory: string;
          difficulty_tier: number;
          example_sentences: ExampleSentence[];
          contextual_dialogue: ContextualDialogue | null;
          tags: string[];
          is_phrase: boolean;
          source: "seed" | "llm_generated";
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["vocabulary"]["Row"],
          "id" | "created_at"
        > & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["vocabulary"]["Insert"]>;
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          session_date: string;
          status: "in_progress" | "completed" | "abandoned";
          plan: SessionPlan;
          current_index: number;
          total_items: number;
          completed_items: number;
          new_words_learned: number;
          words_reviewed: number;
          started_at: string;
          completed_at: string | null;
          duration_seconds: number;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["sessions"]["Row"],
          "id" | "created_at" | "started_at"
        > & {
          id?: string;
          created_at?: string;
          started_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["sessions"]["Insert"]>;
      };
      user_cards: {
        Row: {
          id: string;
          user_id: string;
          vocabulary_id: string;
          due: string;
          stability: number;
          difficulty: number;
          elapsed_days: number;
          scheduled_days: number;
          reps: number;
          lapses: number;
          state: number; // 0=New, 1=Learning, 2=Review, 3=Relearning
          last_review: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["user_cards"]["Row"],
          "id" | "created_at" | "updated_at"
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_cards"]["Insert"]>;
      };
      review_logs: {
        Row: {
          id: string;
          user_id: string;
          card_id: string;
          vocabulary_id: string;
          session_id: string | null;
          rating: number;
          state_before: number;
          state_after: number;
          stability_before: number | null;
          stability_after: number | null;
          elapsed_days: number | null;
          scheduled_days: number | null;
          review_duration_ms: number | null;
          reviewed_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["review_logs"]["Row"],
          "id" | "reviewed_at"
        > & {
          id?: string;
          reviewed_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["review_logs"]["Insert"]>;
      };
      daily_checkins: {
        Row: {
          id: string;
          user_id: string;
          checkin_date: string;
          session_id: string | null;
          words_learned: number;
          words_reviewed: number;
          duration_seconds: number;
          streak_count: number;
          used_freeze: boolean;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["daily_checkins"]["Row"],
          "id" | "created_at"
        > & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["daily_checkins"]["Insert"]
        >;
      };
    };
    Functions: {
      get_mastery_distribution: {
        Args: { p_user_id: string };
        Returns: { mastery_level: string; count: number }[];
      };
      get_category_progress: {
        Args: { p_user_id: string };
        Returns: { category: string; total: number; mastered: number }[];
      };
      get_current_streak: {
        Args: { p_user_id: string };
        Returns: number;
      };
    };
  };
}
