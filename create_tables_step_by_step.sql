-- Step 1: Create leagues table
CREATE TABLE IF NOT EXISTS leagues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('public', 'private')),
    season_id UUID,
    max_teams INTEGER DEFAULT 20,
    entry_fee DECIMAL(10,2) DEFAULT 0,
    prize_pool DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create league_members table
CREATE TABLE IF NOT EXISTS league_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
    user_id UUID,
    user_team_id UUID,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_admin BOOLEAN DEFAULT false,
    UNIQUE(league_id, user_id)
);

-- Step 3: Create game_weeks table
CREATE TABLE IF NOT EXISTS game_weeks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    season_id UUID,
    name VARCHAR(255) NOT NULL,
    round_number INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'finished')),
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create transfers table
CREATE TABLE IF NOT EXISTS transfers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_team_id UUID,
    player_out_id UUID,
    player_in_id UUID,
    gameweek_id UUID,
    transfer_cost DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Create player_weekly_performance table
CREATE TABLE IF NOT EXISTS player_weekly_performance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id UUID,
    gameweek_id UUID,
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    clean_sheets INTEGER DEFAULT 0,
    yellow_cards INTEGER DEFAULT 0,
    red_cards INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    goals_conceded INTEGER DEFAULT 0,
    minutes_played INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(player_id, gameweek_id)
);

-- Step 6: Add columns to existing tables
ALTER TABLE user_teams ADD COLUMN IF NOT EXISTS league_id UUID;
ALTER TABLE user_team_players ADD COLUMN IF NOT EXISTS is_starting_xi BOOLEAN DEFAULT true;

-- Step 7: Insert default public league (adjust season_id as needed)
INSERT INTO leagues (name, description, type, season_id, max_teams, entry_fee, is_active) 
VALUES (
    'الدوري العام للدوري السوري الممتاز',
    'الدوري العام الرسمي لفانتازي الدوري السوري الممتاز',
    'public',
    (SELECT id FROM seasons WHERE is_active = true LIMIT 1),
    1000,
    0,
    true
) ON CONFLICT DO NOTHING;

-- Step 8: Create indexes
CREATE INDEX IF NOT EXISTS idx_leagues_type ON leagues(type);
CREATE INDEX IF NOT EXISTS idx_leagues_active ON leagues(is_active);
CREATE INDEX IF NOT EXISTS idx_league_members_league ON league_members(league_id);
CREATE INDEX IF NOT EXISTS idx_league_members_user ON league_members(user_id);
CREATE INDEX IF NOT EXISTS idx_game_weeks_season ON game_weeks(season_id);
CREATE INDEX IF NOT EXISTS idx_game_weeks_status ON game_weeks(status);
CREATE INDEX IF NOT EXISTS idx_transfers_team ON transfers(user_team_id);
CREATE INDEX IF NOT EXISTS idx_transfers_gameweek ON transfers(gameweek_id);
CREATE INDEX IF NOT EXISTS idx_player_performance_player ON player_weekly_performance(player_id);
CREATE INDEX IF NOT EXISTS idx_player_performance_gameweek ON player_weekly_performance(gameweek_id);

-- Step 9: Update existing data
UPDATE user_team_players SET is_starting_xi = true WHERE is_starting_xi IS NULL;

-- Step 10: Add constraints
ALTER TABLE leagues ADD CONSTRAINT IF NOT EXISTS check_max_teams CHECK (max_teams >= 2);
ALTER TABLE leagues ADD CONSTRAINT IF NOT EXISTS check_entry_fee CHECK (entry_fee >= 0);
ALTER TABLE game_weeks ADD CONSTRAINT IF NOT EXISTS check_dates CHECK (start_date <= end_date);
ALTER TABLE player_weekly_performance ADD CONSTRAINT IF NOT EXISTS check_goals CHECK (goals >= 0);
ALTER TABLE player_weekly_performance ADD CONSTRAINT IF NOT EXISTS check_assists CHECK (assists >= 0);
ALTER TABLE player_weekly_performance ADD CONSTRAINT IF NOT EXISTS check_cards CHECK (yellow_cards >= 0 AND red_cards >= 0);
