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
    created_at: string
}

export interface UserTeamPlayer {
    id: string
    user_team_id: string
    player_id: string
    is_captain: boolean
    is_vice_captain: boolean
    created_at: string
}

export interface User {
    id: string
    email: string
    full_name: string
    role: 'user' | 'admin'
    created_at: string
} 