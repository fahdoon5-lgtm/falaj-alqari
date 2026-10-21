-- جدول مقايضات الحصص (تجميع الحصص)
-- يتيح للمستفيدين الاتفاق على تجميع حصصهم الصغيرة عبر عدة دورات
-- للحصول على حصة أكبر في دورة واحدة

CREATE TABLE IF NOT EXISTS share_agreements (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- الطرف أ: صاحب التجميع (يحصل على الحصة المجمعة في دورة الصرف)
  holder_a_id        TEXT        NOT NULL,
  user_a_id          UUID        REFERENCES app_users(id) ON DELETE SET NULL,
  -- الطرف ب: الطرف المقابل (يستفيد من حصص التجميع، أو NULL)
  holder_b_id        TEXT,
  user_b_id          UUID        REFERENCES app_users(id) ON DELETE SET NULL,
  -- الآد والترتيب المعني
  aad_id             TEXT        NOT NULL,
  share_order        INTEGER     NOT NULL,
  athars_per_cycle   NUMERIC     NOT NULL,
  -- إعدادات التجميع
  accumulation_cycles INTEGER    NOT NULL DEFAULT 3 CHECK (accumulation_cycles >= 2 AND accumulation_cycles <= 12),
  is_recurring       BOOLEAN     NOT NULL DEFAULT true,
  start_cycle_number INTEGER,    -- رقم الدورة التي بدأ فيها الاتفاق (يُحدد عند الاعتماد)
  -- الحالة
  status             TEXT        NOT NULL DEFAULT 'pending_b'
                     CHECK (status IN ('pending_b','pending_admin','active','completed','cancelled')),
  -- التواريخ والموافقات
  approved_by_a_at   TIMESTAMPTZ,
  approved_by_b_at   TIMESTAMPTZ,
  approved_by_admin_at TIMESTAMPTZ,
  admin_notes        TEXT,
  requested_by       TEXT,       -- اسم الشخص الذي طلب الاتفاق
  notes              TEXT,       -- ملاحظات حرة
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- فهارس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_agreements_holder_a  ON share_agreements(holder_a_id);
CREATE INDEX IF NOT EXISTS idx_agreements_holder_b  ON share_agreements(holder_b_id);
CREATE INDEX IF NOT EXISTS idx_agreements_aad       ON share_agreements(aad_id);
CREATE INDEX IF NOT EXISTS idx_agreements_status    ON share_agreements(status);
CREATE INDEX IF NOT EXISTS idx_agreements_user_a    ON share_agreements(user_a_id);
CREATE INDEX IF NOT EXISTS idx_agreements_user_b    ON share_agreements(user_b_id);

-- تحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_agreements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_agreements_updated_at
  BEFORE UPDATE ON share_agreements
  FOR EACH ROW EXECUTE FUNCTION update_agreements_updated_at();

-- صلاحيات القراءة والكتابة
ALTER TABLE share_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_agreements" ON share_agreements
  FOR SELECT USING (true);

CREATE POLICY "authenticated_write_agreements" ON share_agreements
  FOR ALL USING (true);
