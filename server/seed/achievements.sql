-- Seed the achievement catalog. Condition types match the switch in
-- internal/service/achievement_service.go#CheckAndUnlock; anything
-- exotic here just silently never unlocks.

INSERT INTO achievements (name, description, icon, condition_type, condition_value)
VALUES
  ('初次触键',   '完成第一次演奏',               '🎹', 'total_songs',  1),
  ('曲库新手',   '累计完成 5 首不同的曲目',       '🎵', 'total_songs',  5),
  ('百曲斩',     '累计完成 100 首不同的曲目',     '👑', 'total_songs',  100),
  ('坚持不懈',   '连续练习 7 天',                 '🔥', 'streak_days',  7),
  ('专注月',     '连续练习 30 天',                '📅', 'streak_days',  30),
  ('连击大师',   '单曲最大连击达到 50',           '⚡', 'max_combo',    50),
  ('连击神',     '单曲最大连击达到 100',          '💫', 'max_combo',    100),
  ('完美主义',   '零失误完成一首曲目',            '💎', 'perfect_song', 1)
ON CONFLICT DO NOTHING;

SELECT id, name, condition_type, condition_value FROM achievements ORDER BY id;
