# فانتازي الدوري السوري الممتاز 🏆

تطبيق فانتازي كرة القدم للدوري السوري الممتاز مبني باستخدام Next.js و Supabase.

## الميزات ✨

### للمستخدمين العاديين:
- إنشاء وإدارة فريق فانتازي
- اختيار اللاعبين من مختلف الأندية
- تتبع النقاط والتصنيف
- عرض المباريات والنتائج

### للمشرفين:
- إدارة الأندية واللاعبين
- إضافة المباريات وتحديث النتائج
- تسجيل أداء اللاعبين
- حساب النقاط تلقائياً

## التقنيات المستخدمة 🛠️

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + API)
- **Icons**: Lucide React
- **State Management**: React Context + Hooks

## التثبيت والتشغيل 🚀

### المتطلبات الأساسية:
- Node.js 18+ 
- npm أو yarn
- حساب Supabase

### خطوات التثبيت:

1. **استنساخ المشروع:**
```bash
git clone <repository-url>
cd syrian-premier-league-fantasy
```

2. **تثبيت التبعيات:**
```bash
npm install
# أو
yarn install
```

3. **إعداد Supabase:**
   - أنشئ مشروع جديد في [Supabase](https://supabase.com)
   - انسخ URL والمفتاح العام من إعدادات المشروع

4. **إعداد المتغيرات البيئية:**
```bash
cp .env.local.example .env.local
```
   - عدّل ملف `.env.local` وأضف بيانات Supabase الخاصة بك

5. **إنشاء قاعدة البيانات:**
   - استورد ملف SQL التالي إلى Supabase SQL Editor:

```sql
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

-- سياسات الأمان
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view clubs" ON clubs
  FOR SELECT USING (true);

CREATE POLICY "Only admins can insert clubs" ON clubs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

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
  '0409a3e9-431d-461e-930b-355714961190',
  'spl@splf.com',
  'المشرف الرئيسي',
  'admin'
);
```

6. **تشغيل التطبيق:**
```bash
npm run dev
# أو
yarn dev
```

7. **فتح المتصفح:**
   - انتقل إلى `http://localhost:3000`

## هيكل المشروع 📁

```
syrian-premier-league-fantasy/
├── app/                    # Next.js App Router
│   ├── dashboard/         # صفحة الداشبورد
│   ├── globals.css        # الأنماط العامة
│   ├── layout.tsx         # التخطيط الرئيسي
│   └── page.tsx           # الصفحة الرئيسية
├── components/            # المكونات
│   ├── auth/             # مكونات المصادقة
│   ├── dashboard/        # مكونات الداشبورد
│   └── providers/        # مزودي السياق
├── lib/                  # المكتبات والإعدادات
│   └── supabase.ts       # إعداد Supabase
├── public/               # الملفات العامة
└── package.json          # تبعيات المشروع
```

## كيفية الاستخدام 📖

### للمستخدمين الجدد:
1. إنشاء حساب جديد
2. إنشاء فريق فانتازي
3. اختيار 15 لاعب (حارس + 5 مدافعين + 5 وسط + 3 مهاجمين)
4. تعيين قائد ونائب قائد
5. متابعة النقاط والتصنيف

### للمشرفين:
1. تسجيل الدخول بحساب المشرف
2. إضافة الأندية واللاعبين
3. إضافة المباريات
4. تسجيل أداء اللاعبين
5. مراقبة النظام

## نظام النقاط 🎯

- **هدف**: 4 نقاط
- **تمريرة حاسمة**: 3 نقاط
- **صافي مرمى**: 2 نقاط
- **بطاقة صفراء**: -1 نقطة
- **بطاقة حمراء**: -3 نقاط
- **نظافة مرمى (للحارس والمدافعين)**: 4 نقاط

## المساهمة 🤝

نرحب بالمساهمات! يرجى:
1. عمل Fork للمشروع
2. إنشاء فرع جديد للميزة
3. عمل Commit للتغييرات
4. عمل Push للفرع
5. إنشاء Pull Request

## الترخيص 📄

هذا المشروع مرخص تحت رخصة MIT.

## الدعم 💬

للدعم والاستفسارات:
- إنشاء Issue في GitHub
- التواصل عبر البريد الإلكتروني

---

**ملاحظة**: هذا تطبيق MVP (Minimum Viable Product) ويمكن تطويره وإضافة ميزات أكثر في المستقبل. 