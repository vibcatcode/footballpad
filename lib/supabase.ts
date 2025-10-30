import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 타입 정의
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          full_name: string | null
          avatar_url: string | null
          role: 'admin' | 'manager' | 'user'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'manager' | 'user'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'manager' | 'user'
          created_at?: string
          updated_at?: string
        }
      }
      leagues: {
        Row: {
          id: string
          name: string
          description: string | null
          season: string
          status: 'draft' | 'active' | 'completed' | 'cancelled'
          max_teams: number
          current_teams: number
          start_date: string | null
          end_date: string | null
          created_by: string | null
          is_public: boolean
          visibility: 'public' | 'private' | 'unlisted'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          season: string
          status?: 'draft' | 'active' | 'completed' | 'cancelled'
          max_teams?: number
          current_teams?: number
          start_date?: string | null
          end_date?: string | null
          created_by?: string | null
          is_public?: boolean
          visibility?: 'public' | 'private' | 'unlisted'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          season?: string
          status?: 'draft' | 'active' | 'completed' | 'cancelled'
          max_teams?: number
          current_teams?: number
          start_date?: string | null
          end_date?: string | null
          created_by?: string | null
          is_public?: boolean
          visibility?: 'public' | 'private' | 'unlisted'
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          short_name: string | null
          description: string | null
          logo_url: string | null
          founded_year: number | null
          location: string | null
          website_url: string | null
          primary_color: string | null
          secondary_color: string | null
          created_by: string | null
          is_public: boolean
          visibility: 'public' | 'private' | 'unlisted'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          short_name?: string | null
          description?: string | null
          logo_url?: string | null
          founded_year?: number | null
          location?: string | null
          website_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          created_by?: string | null
          is_public?: boolean
          visibility?: 'public' | 'private' | 'unlisted'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          short_name?: string | null
          description?: string | null
          logo_url?: string | null
          founded_year?: number | null
          location?: string | null
          website_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          created_by?: string | null
          is_public?: boolean
          visibility?: 'public' | 'private' | 'unlisted'
          created_at?: string
          updated_at?: string
        }
      }
      players: {
        Row: {
          id: string
          team_id: string
          first_name: string
          last_name: string
          jersey_number: number | null
          position: 'GK' | 'CB' | 'LB' | 'RB' | 'CDM' | 'CM' | 'CAM' | 'LW' | 'RW' | 'ST'
          birth_date: string | null
          nationality: string | null
          height: number | null
          weight: number | null
          preferred_foot: 'left' | 'right' | 'both' | null
          status: 'active' | 'injured' | 'suspended' | 'inactive'
          is_public: boolean
          visibility: 'public' | 'private' | 'unlisted'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          first_name: string
          last_name: string
          jersey_number?: number | null
          position: 'GK' | 'CB' | 'LB' | 'RB' | 'CDM' | 'CM' | 'CAM' | 'LW' | 'RW' | 'ST'
          birth_date?: string | null
          nationality?: string | null
          height?: number | null
          weight?: number | null
          preferred_foot?: 'left' | 'right' | 'both' | null
          status?: 'active' | 'injured' | 'suspended' | 'inactive'
          is_public?: boolean
          visibility?: 'public' | 'private' | 'unlisted'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          first_name?: string
          last_name?: string
          jersey_number?: number | null
          position?: 'GK' | 'CB' | 'LB' | 'RB' | 'CDM' | 'CM' | 'CAM' | 'LW' | 'RW' | 'ST'
          birth_date?: string | null
          nationality?: string | null
          height?: number | null
          weight?: number | null
          preferred_foot?: 'left' | 'right' | 'both' | null
          status?: 'active' | 'injured' | 'suspended' | 'inactive'
          is_public?: boolean
          visibility?: 'public' | 'private' | 'unlisted'
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
