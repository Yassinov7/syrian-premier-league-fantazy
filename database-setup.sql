-- إعداد قاعدة بيانات فانتازي الدوري السوري الممتاز
-- قم بتشغيل هذا الملف في Supabase SQL Editor

-- إنشاء جدول المستخدمين
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول الأندية
CREATE TABLE clubs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  city TEXT NOT NULL,
  founded_year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول اللاعبين
CREATE TABLE players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT NOT NULL CHECK (position IN ('GK', 'DEF', 'MID', 'FWD')),
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  price INTEGER NOT NULL CHECK (price >= 1 AND price <= 15),
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول المباريات
CREATE TABLE matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  home_club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  away_club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  home_score INTEGER,
  away_score INTEGER,
  match_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'finished')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seasons and Rounds
CREATE TABLE seasons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE rounds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  name TEXT,
  deadline_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'locked', 'finished')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (season_id, round_number)
);

-- Link matches to rounds (nullable to support legacy data)
ALTER TABLE matches
  ADD COLUMN IF NOT EXISTS round_id UUID REFERENCES rounds(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_matches_round_id ON matches(round_id);
CREATE INDEX IF NOT EXISTS idx_rounds_season_id ON rounds(season_id);

-- إنشاء جدول أداء اللاعبين
CREATE TABLE player_performances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  yellow_cards INTEGER DEFAULT 0,
  red_cards INTEGER DEFAULT 0,
  clean_sheet BOOLEAN DEFAULT FALSE,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول فرق المستخدمين
CREATE TABLE user_teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول لاعبين فرق المستخدمين
CREATE TABLE user_team_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_team_id UUID REFERENCES user_teams(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  is_captain BOOLEAN DEFAULT FALSE,
  is_vice_captain BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_performances ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_team_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view players" ON players
  FOR SELECT USING (true);

CREATE POLICY "Only admins can insert players" ON players
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can view matches" ON matches
  FOR SELECT USING (true);

CREATE POLICY "Only admins can insert matches" ON matches
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can view player performances" ON player_performances
  FOR SELECT USING (true);

CREATE POLICY "Only admins can insert player performances" ON player_performances
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Seasons/Rounds Policies
CREATE POLICY "Anyone can view seasons" ON seasons
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage seasons" ON seasons
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Anyone can view rounds" ON rounds
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage rounds" ON rounds
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can view their own teams" ON user_teams
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own teams" ON user_teams
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their team players" ON user_team_players
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_teams WHERE id = user_team_players.user_team_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert players to their teams" ON user_team_players
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_teams WHERE id = user_team_players.user_team_id AND user_id = auth.uid()
    )
  );

-- إنشاء مستخدم مشرف افتراضي (يجب تغيير كلمة المرور)
INSERT INTO users (id, email, full_name, role)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'admin@fantasy.com',
  'المشرف الرئيسي',
  'admin'
);

-- Trigger Function لإنشاء المستخدمين تلقائياً
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'مستخدم جديد'),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إنشاء Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- سياسات إضافية لصفحة اختيار الفريق
-- تحديث فرق المستخدمين
CREATE POLICY "Users can update their own teams" ON user_teams
  FOR UPDATE USING (auth.uid() = user_id);

-- حذف فرق المستخدمين
CREATE POLICY "Users can delete their own teams" ON user_teams
  FOR DELETE USING (auth.uid() = user_id);

-- تحديث لاعبين فرق المستخدمين
CREATE POLICY "Users can update their team players" ON user_team_players
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_teams WHERE id = user_team_players.user_team_id AND user_id = auth.uid()
    )
  );

-- حذف لاعبين فرق المستخدمين
CREATE POLICY "Users can delete their team players" ON user_team_players
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_teams WHERE id = user_team_players.user_team_id AND user_id = auth.uid()
    )
  );

-- سياسة لقراءة معلومات النوادي (مطلوبة للتصفية)
CREATE POLICY "Anyone can view clubs" ON clubs
  FOR SELECT USING (true);

-- سياسة لقراءة معلومات الموسم (مطلوبة لعرض الموسم الحالي)
CREATE POLICY "Anyone can view seasons" ON seasons
  FOR SELECT USING (true);

-- سياسة لقراءة معلومات الجولات (مطلوبة لعرض الجولة الحالية)
CREATE POLICY "Anyone can view rounds" ON rounds
  FOR SELECT USING (true);