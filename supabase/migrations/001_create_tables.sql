-- ============================================
-- English Learning Assistant - Database Schema
-- ============================================

-- 1. Profiles: User settings
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  timezone TEXT DEFAULT 'Asia/Shanghai',
  daily_new_words INTEGER DEFAULT 10,
  session_length_minutes INTEGER DEFAULT 20,
  travel_weight REAL DEFAULT 0.5,
  notification_hour INTEGER DEFAULT 9,
  streak_freeze_remaining INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own profile"
  ON profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 2. Vocabulary: Master corpus
CREATE TABLE vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL,
  pronunciation TEXT,
  definition TEXT NOT NULL,
  definition_zh TEXT,
  category TEXT NOT NULL CHECK (category IN ('travel', 'software')),
  subcategory TEXT NOT NULL,
  difficulty_tier INTEGER DEFAULT 1 CHECK (difficulty_tier BETWEEN 1 AND 3),
  example_sentences JSONB NOT NULL DEFAULT '[]',
  contextual_dialogue JSONB,
  tags TEXT[] DEFAULT '{}',
  is_phrase BOOLEAN DEFAULT FALSE,
  source TEXT DEFAULT 'seed' CHECK (source IN ('seed', 'llm_generated')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_vocabulary_category ON vocabulary(category);
CREATE INDEX idx_vocabulary_subcategory ON vocabulary(subcategory);
CREATE INDEX idx_vocabulary_difficulty ON vocabulary(difficulty_tier);

ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vocabulary is readable by authenticated users"
  ON vocabulary FOR SELECT
  TO authenticated
  USING (true);

-- 3. Sessions: Learning session records
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  plan JSONB NOT NULL DEFAULT '{}',
  current_index INTEGER DEFAULT 0,
  total_items INTEGER NOT NULL DEFAULT 0,
  completed_items INTEGER DEFAULT 0,
  new_words_learned INTEGER DEFAULT 0,
  words_reviewed INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sessions_user_date ON sessions(user_id, session_date);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own sessions"
  ON sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. User Cards: SRS card state per user-vocabulary pair
CREATE TABLE user_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vocabulary_id UUID NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,
  due TIMESTAMPTZ NOT NULL DEFAULT now(),
  stability REAL NOT NULL DEFAULT 0,
  difficulty REAL NOT NULL DEFAULT 0,
  elapsed_days INTEGER NOT NULL DEFAULT 0,
  scheduled_days INTEGER NOT NULL DEFAULT 0,
  reps INTEGER NOT NULL DEFAULT 0,
  lapses INTEGER NOT NULL DEFAULT 0,
  state INTEGER NOT NULL DEFAULT 0, -- 0=New, 1=Learning, 2=Review, 3=Relearning
  last_review TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, vocabulary_id)
);

CREATE INDEX idx_user_cards_due ON user_cards(user_id, due);
CREATE INDEX idx_user_cards_state ON user_cards(user_id, state);

ALTER TABLE user_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own cards"
  ON user_cards FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Review Logs: Immutable review history
CREATE TABLE review_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES user_cards(id) ON DELETE CASCADE,
  vocabulary_id UUID NOT NULL REFERENCES vocabulary(id),
  session_id UUID REFERENCES sessions(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 4),
  state_before INTEGER NOT NULL,
  state_after INTEGER NOT NULL,
  stability_before REAL,
  stability_after REAL,
  elapsed_days INTEGER,
  scheduled_days INTEGER,
  review_duration_ms INTEGER,
  reviewed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_review_logs_session ON review_logs(session_id);
CREATE INDEX idx_review_logs_user_date ON review_logs(user_id, reviewed_at);

ALTER TABLE review_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own review logs"
  ON review_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. Daily Check-ins: Streak tracking
CREATE TABLE daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL,
  session_id UUID REFERENCES sessions(id),
  words_learned INTEGER DEFAULT 0,
  words_reviewed INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  streak_count INTEGER NOT NULL DEFAULT 0,
  used_freeze BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, checkin_date)
);

CREATE INDEX idx_checkins_user_date ON daily_checkins(user_id, checkin_date DESC);

ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own checkins"
  ON daily_checkins FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Database Functions
-- ============================================

-- Get mastery distribution for a user
CREATE OR REPLACE FUNCTION get_mastery_distribution(p_user_id UUID)
RETURNS TABLE(mastery_level TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE
      WHEN uc.state = 0 THEN 'new'
      WHEN uc.state = 1 THEN 'learning'
      WHEN uc.state = 2 AND uc.stability > 30 THEN 'mastered'
      WHEN uc.state = 2 THEN 'familiar'
      WHEN uc.state = 3 THEN 'relearning'
    END AS mastery_level,
    COUNT(*) AS count
  FROM user_cards uc
  WHERE uc.user_id = p_user_id
  GROUP BY mastery_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get category progress for a user
CREATE OR REPLACE FUNCTION get_category_progress(p_user_id UUID)
RETURNS TABLE(category TEXT, total BIGINT, mastered BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.category,
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE uc.state = 2 AND uc.stability > 30) AS mastered
  FROM user_cards uc
  JOIN vocabulary v ON uc.vocabulary_id = v.id
  WHERE uc.user_id = p_user_id
  GROUP BY v.category;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get current streak for a user
CREATE OR REPLACE FUNCTION get_current_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  streak INTEGER := 0;
  check_date DATE := CURRENT_DATE;
  found BOOLEAN;
BEGIN
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM daily_checkins
      WHERE user_id = p_user_id AND checkin_date = check_date
    ) INTO found;

    IF found THEN
      streak := streak + 1;
      check_date := check_date - INTERVAL '1 day';
    ELSE
      EXIT;
    END IF;
  END LOOP;
  RETURN streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
