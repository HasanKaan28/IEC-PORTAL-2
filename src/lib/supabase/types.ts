import { UserRole } from "@/lib/rbac/permissions";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ApplicationStatus = "pending" | "approved" | "rejected";
export type ProjectStatus = "concept" | "in_progress" | "completed";
export type TaskStatus = "todo" | "in_progress" | "in_review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type PostStatus = "draft" | "published";
export type RequestStatus = "pending" | "approved" | "rejected";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url: string | null;
          department: string | null;
          class_year: string | null;
          bio: string | null;
          linkedin_url: string | null;
          github_url: string | null;
          phone: string | null;
          hide_phone: boolean;
          hide_email: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          avatar_url?: string | null;
          department?: string | null;
          class_year?: string | null;
          bio?: string | null;
          linkedin_url?: string | null;
          github_url?: string | null;
          phone?: string | null;
          hide_phone?: boolean;
          hide_email?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: UserRole;
          assigned_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: UserRole;
          assigned_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_roles"]["Insert"]>;
      };
      consent_logs: {
        Row: {
          id: string;
          user_id: string;
          document_type: string;
          document_version: string;
          consented_at: string;
          ip_address: string | null;
          user_agent: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          document_type: string;
          document_version: string;
          consented_at?: string;
          ip_address?: string | null;
          user_agent?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["consent_logs"]["Insert"]>;
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          target_type: string;
          target_id: string | null;
          details: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          target_type: string;
          target_id?: string | null;
          details?: Json | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Insert"]>;
      };
      applications: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string | null;
          department: string;
          class_year: string;
          statement: string;
          status: ApplicationStatus;
          reviewer_id: string | null;
          reviewer_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email: string;
          phone?: string | null;
          department: string;
          class_year: string;
          statement: string;
          status?: ApplicationStatus;
          reviewer_id?: string | null;
          reviewer_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["applications"]["Insert"]>;
      };
      projects: {
        Row: {
          id: string;
          slug: string;
          title_tr: string;
          title_en: string;
          tagline_tr: string;
          tagline_en: string;
          category_tr: string;
          category_en: string;
          problem_tr: string | null;
          problem_en: string | null;
          solution_tr: string | null;
          solution_en: string | null;
          specs: Json | null;
          accent_color: string;
          difficulty: number;
          budget: string | null;
          status: ProjectStatus;
          is_flagship: boolean;
          is_featured: boolean;
          cover_image: string | null;
          github_url: string | null;
          demo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title_tr: string;
          title_en: string;
          tagline_tr: string;
          tagline_en: string;
          category_tr: string;
          category_en: string;
          problem_tr?: string | null;
          problem_en?: string | null;
          solution_tr?: string | null;
          solution_en?: string | null;
          specs?: Json | null;
          accent_color?: string;
          difficulty?: number;
          budget?: string | null;
          status?: ProjectStatus;
          is_flagship?: boolean;
          is_featured?: boolean;
          cover_image?: string | null;
          github_url?: string | null;
          demo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["projects"]["Insert"]>;
      };
      project_members: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          role: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          role?: string;
          joined_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["project_members"]["Insert"]>;
      };
      project_join_requests: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          message: string | null;
          status: RequestStatus;
          reviewer_id: string | null;
          reviewer_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          message?: string | null;
          status?: RequestStatus;
          reviewer_id?: string | null;
          reviewer_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["project_join_requests"]["Insert"]>;
      };
      tasks: {
        Row: {
          id: string;
          project_id: string | null;
          title: string;
          description: string | null;
          status: TaskStatus;
          priority: TaskPriority;
          due_date: string | null;
          assignee_id: string | null;
          creator_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          title: string;
          description?: string | null;
          status?: TaskStatus;
          priority?: TaskPriority;
          due_date?: string | null;
          assignee_id?: string | null;
          creator_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tasks"]["Insert"]>;
      };
      task_comments: {
        Row: {
          id: string;
          task_id: string;
          user_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          user_id: string;
          content: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["task_comments"]["Insert"]>;
      };
      task_attachments: {
        Row: {
          id: string;
          task_id: string;
          file_name: string;
          file_url: string;
          file_size: number;
          file_type: string | null;
          uploader_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          file_name: string;
          file_url: string;
          file_size: number;
          file_type?: string | null;
          uploader_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["task_attachments"]["Insert"]>;
      };
      blog_posts: {
        Row: {
          id: string;
          slug: string;
          title: string;
          excerpt: string | null;
          content: string;
          cover_image: string | null;
          author_id: string;
          status: PostStatus;
          reading_time_min: number;
          tags: string[];
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          excerpt?: string | null;
          content: string;
          cover_image?: string | null;
          author_id: string;
          status?: PostStatus;
          reading_time_min?: number;
          tags?: string[];
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["blog_posts"]["Insert"]>;
      };
      blog_likes: {
        Row: {
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          post_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["blog_likes"]["Insert"]>;
      };
      blog_comments: {
        Row: {
          id: string;
          post_id: string;
          parent_id: string | null;
          user_id: string;
          content: string;
          is_flagged: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          parent_id?: string | null;
          user_id: string;
          content: string;
          is_flagged?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["blog_comments"]["Insert"]>;
      };
      hackathons: {
        Row: {
          id: string;
          title: string;
          description: string;
          location_country: string;
          start_date: string;
          end_date: string;
          application_url: string;
          tags: string[];
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          location_country: string;
          start_date: string;
          end_date: string;
          application_url: string;
          tags?: string[];
          created_by: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["hackathons"]["Insert"]>;
      };
      hackathon_teams: {
        Row: {
          id: string;
          hackathon_id: string;
          name: string;
          description: string | null;
          is_open: boolean;
          looking_for: string[];
          leader_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          hackathon_id: string;
          name: string;
          description?: string | null;
          is_open?: boolean;
          looking_for?: string[];
          leader_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["hackathon_teams"]["Insert"]>;
      };
      hackathon_team_members: {
        Row: {
          id: string;
          team_id: string;
          user_id: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          user_id: string;
          joined_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["hackathon_team_members"]["Insert"]>;
      };
      hackathon_join_requests: {
        Row: {
          id: string;
          team_id: string;
          user_id: string;
          message: string | null;
          status: RequestStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          user_id: string;
          message?: string | null;
          status?: RequestStatus;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["hackathon_join_requests"]["Insert"]>;
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string;
          venue: string;
          date_time: string;
          qr_signing_secret: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          venue: string;
          date_time: string;
          qr_signing_secret: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["events"]["Insert"]>;
      };
      event_attendances: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          checked_in_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          checked_in_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["event_attendances"]["Insert"]>;
      };
      certificates: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          certificate_code: string;
          pdf_url: string;
          issued_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          certificate_code: string;
          pdf_url: string;
          issued_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["certificates"]["Insert"]>;
      };
      direct_messages: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["direct_messages"]["Insert"]>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          link: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          link?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _user_id: string;
          _role: UserRole;
        };
        Returns: boolean;
      };
      is_admin: {
        Args: {
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      user_role_enum: UserRole;
      application_status_enum: ApplicationStatus;
      project_status_enum: ProjectStatus;
      task_status_enum: TaskStatus;
      task_priority_enum: TaskPriority;
      post_status_enum: PostStatus;
      request_status_enum: RequestStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
