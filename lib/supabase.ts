import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface Club {
    id: string
    name: string
    logo_url?: string
    city: string
    founded_year: number
    created_at: string
}

export interface Player {
    id: string
    name: string
    position: 'GK' | 'DEF' | 'MID' | 'FWD'
    club_id: string
    price: number
    total_points: number
    current_week_points?: number // Points for current gameweek
    isStartingXI?: boolean // Whether player is in starting XI (for UI state)
    created_at: string
}

export interface Match {
    id: string
    home_club_id: string
    away_club_id: string
    home_score?: number
    away_score?: number
    match_date: string
    status: 'scheduled' | 'live' | 'finished'
    round_id?: string
    created_at: string
}

export interface PlayerPerformance {
    id: string
    player_id: string
    match_id: string
    goals: number
    assists: number
    yellow_cards: number
    red_cards: number
    clean_sheet: boolean
    points: number
    created_at: string
}

export interface UserTeam {
    id: string
    user_id: string
    name: string
    total_points: number
    league_id?: string // Which league this team belongs to
    created_at: string
}

export interface League {
    id: string
    name: string
    description?: string
    type: 'public' | 'private' // Public league or private league
    season_id: string
    max_teams?: number
    entry_fee?: number
    prize_pool?: number
    is_active: boolean
    created_by?: string // User who created the private league
    created_at: string
}

export interface LeagueMember {
    id: string
    league_id: string
    user_id: string
    user_team_id: string
    joined_at: string
    is_admin?: boolean // For private league admins
}

export interface GameWeek {
    id: string
    season_id: string
    name: string
    round_number: number
    start_date: string
    end_date: string
    status: 'upcoming' | 'live' | 'finished'
    deadline: string // Transfer deadline
    created_at: string
}

export interface Transfer {
    id: string
    user_team_id: string
    player_out_id: string
    player_in_id: string
    gameweek_id: string
    transfer_cost: number
    created_at: string
}

export interface User {
    id: string
    email: string
    full_name: string
    role: 'user' | 'admin'
    created_at: string
} 