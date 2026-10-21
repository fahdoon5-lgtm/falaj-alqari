-- جدول إعدادات دورة الفلج
-- صف واحد فقط (id = 1) يحتوي على الآد الحالي ووقت بدايته

CREATE TABLE IF NOT EXISTS cycle_settings (
  id            INTEGER PRIMARY KEY DEFAULT 1,
  current_aad_id TEXT    NOT NULL,
  aad_started_at TIMESTAMPTZ NOT NULL,
  updated_by    TEXT,
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- السماح لأي مستخدم بالقراءة (الشفافية)
ALTER TABLE cycle_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_cycle" ON cycle_settings
  FOR SELECT USING (true);

-- السماح لأي مستخدم مُسجَّل بالكتابة (الأدمن فقط يصل للصفحة في الواجهة)
CREATE POLICY "authenticated_write_cycle" ON cycle_settings
  FOR ALL USING (true);
