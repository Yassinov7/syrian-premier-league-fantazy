-- Database Updates for Syrian Premier League Fantasy System
-- Run these SQL commands to update your database structure

-- 1. Update existing tables
ALTER TABLE user_teams ADD COLUMN IF NOT EXISTS league_id UUID REFERENCES leagues(id);
ALTER TABLE user_team_players ADD COLUMN IF NOT EXISTS is_starting_xi BOOLEAN DEFAULT true;

-- 2. Create new tables for the fantasy system

-- Leagues table
CREATE TABLE IF NOT EXISTS leagues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('public', 'private')),
    season_id UUID REFERENCES seasons(id),
    max_teams INTEGER DEFAULT 20,
    entry_fee DECIMAL(10,2) DEFAULT 0,
    prize_pool DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- League members table
CREATE TABLE IF NOT EXISTS league_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user_team_id UUID REFERENCES user_teams(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_admin BOOLEAN DEFAULT false,
    UNIQUE(league_id, user_id)
);

-- Game weeks table (replaces rounds)
CREATE TABLE IF NOT EXISTS game_weeks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    season_id UUID REFERENCES seasons(id),
    name VARCHAR(255) NOT NULL,
    round_number INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'finished')),
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(season_id, round_number)
);

-- Transfers table
CREATE TABLE IF NOT EXISTS transfers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_team_id UUID REFERENCES user_teams(id) ON DELETE CASCADE,
    player_out_id UUID REFERENCES players(id),
    player_in_id UUID REFERENCES players(id),
    gameweek_id UUID REFERENCES game_weeks(id),
    transfer_cost DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Player weekly performance table
CREATE TABLE IF NOT EXISTS player_weekly_performance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    gameweek_id UUID REFERENCES game_weeks(id),
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    clean_sheets INTEGER DEFAULT 0,
    yellow_cards INTEGER DEFAULT 0,
    red_cards INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0, -- For goalkeepers
    goals_conceded INTEGER DEFAULT 0, -- For goalkeepers and defenders
    minutes_played INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(player_id, gameweek_id)
);

-- 3. Insert default data

-- Insert default public league
INSERT INTO leagues (id, name, description, type, season_id, max_teams, entry_fee, is_active) 
VALUES (
    gen_random_uuid(),
    'الدوري العام للدوري السوري الممتاز',
    'الدوري العام الرسمي لفانتازي الدوري السوري الممتاز',
    'public',
    (SELECT id FROM seasons WHERE is_active = true LIMIT 1),
    1000,
    0,
    true
) ON CONFLICT DO NOTHING;

-- Insert default game weeks for the current season
INSERT INTO game_weeks (season_id, name, round_number, start_date, end_date, status, deadline)
SELECT 
    s.id,
    'الجولة ' || generate_series(1, 30),
    generate_series(1, 30),
    s.start_date + (generate_series(1, 30) - 1) * interval '7 days',
    s.start_date + generate_series(1, 30) * interval '7 days' - interval '1 day',
    CASE 
        WHEN generate_series(1, 30) = 1 THEN 'upcoming'
        ELSE 'upcoming'
    END,
    s.start_date + (generate_series(1, 30) - 1) * interval '7 days' - interval '2 days'
FROM seasons s
WHERE s.is_active = true
ON CONFLICT DO NOTHING;

-- 4. Create indexes for better performance
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

-- 5. Update existing data (if needed)
UPDATE user_team_players SET is_starting_xi = true WHERE is_starting_xi IS NULL;

-- 6. Add constraints
ALTER TABLE leagues ADD CONSTRAINT check_max_teams CHECK (max_teams >= 2);
ALTER TABLE leagues ADD CONSTRAINT check_entry_fee CHECK (entry_fee >= 0);
ALTER TABLE game_weeks ADD CONSTRAINT check_dates CHECK (start_date <= end_date);
ALTER TABLE player_weekly_performance ADD CONSTRAINT check_goals CHECK (goals >= 0);
ALTER TABLE player_weekly_performance ADD CONSTRAINT check_assists CHECK (assists >= 0);
ALTER TABLE player_weekly_performance ADD CONSTRAINT check_cards CHECK (yellow_cards >= 0 AND red_cards >= 0);

-- 7. Create views for common queries

-- View for league standings
CREATE OR REPLACE VIEW league_standings AS
SELECT 
    l.id as league_id,
    l.name as league_name,
    l.type as league_type,
    ut.id as team_id,
    ut.name as team_name,
    u.full_name as manager_name,
    ut.total_points,
    ROW_NUMBER() OVER (PARTITION BY l.id ORDER BY ut.total_points DESC) as position
FROM leagues l
JOIN league_members lm ON l.id = lm.league_id
JOIN user_teams ut ON lm.user_team_id = ut.id
JOIN users u ON ut.user_id = u.id
WHERE l.is_active = true
ORDER BY l.id, ut.total_points DESC;

-- View for current gameweek info
CREATE OR REPLACE VIEW current_gameweek AS
SELECT 
    gw.*,
    s.name as season_name
FROM game_weeks gw
JOIN seasons s ON gw.season_id = s.id
WHERE gw.status = 'upcoming'
ORDER BY gw.deadline ASC
LIMIT 1;

-- 8. Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

-- 9. Comments for documentation
COMMENT ON TABLE leagues IS 'Fantasy leagues - public or private';
COMMENT ON TABLE league_members IS 'Users who have joined leagues';
COMMENT ON TABLE game_weeks IS 'Game weeks for fantasy scoring';
COMMENT ON TABLE transfers IS 'Player transfers between gameweeks';
COMMENT ON TABLE player_weekly_performance IS 'Player performance stats per gameweek';
COMMENT ON COLUMN user_teams.league_id IS 'Which league this team belongs to';
COMMENT ON COLUMN user_team_players.is_starting_xi IS 'Whether player is in starting XI (gets points)';

-- 10. Sample data for testing (optional)
-- You can uncomment these lines to add sample data for testing

/*
-- Sample private league
INSERT INTO leagues (name, description, type, season_id, max_teams, entry_fee, is_active, created_by)
VALUES (
    'دوري الأصدقاء',
    'دوري خاص للأصدقاء والعائلة',
    'private',
    (SELECT id FROM seasons WHERE is_active = true LIMIT 1),
    20,
    5,
    true,
    (SELECT id FROM users LIMIT 1)
);

-- Sample player performance (you'll need to adjust player_id and gameweek_id)
INSERT INTO player_weekly_performance (player_id, gameweek_id, goals, assists, clean_sheets, points)
VALUES (
    (SELECT id FROM players LIMIT 1),
    (SELECT id FROM game_weeks LIMIT 1),
    1,
    0,
    0,
    6
);
*/
