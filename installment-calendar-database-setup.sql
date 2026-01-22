-- Vytvoření tabulky pro splátkové kalendáře
CREATE TABLE IF NOT EXISTS installment_calendars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Vazba na projekt
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Informace o klientovi
  client_name TEXT NOT NULL, -- Jméno klienta
  client_email TEXT, -- Email klienta (volitelné)
  client_phone TEXT, -- Telefon klienta (volitelné)
  
  -- Splátkové údaje
  total_amount NUMERIC(10, 2) NOT NULL, -- Celková částka
  monthly_amount NUMERIC(10, 2) NOT NULL, -- Měsíční splátka
  months_count INTEGER NOT NULL, -- Počet měsíců
  start_date DATE NOT NULL, -- Datum začátku splácení
  
  -- Metadata
  notes TEXT, -- Poznámky
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Vytvoření tabulky pro jednotlivé splátky
CREATE TABLE IF NOT EXISTS installment_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Vazba na splátkový kalendář
  calendar_id UUID NOT NULL REFERENCES installment_calendars(id) ON DELETE CASCADE,
  
  -- Informace o splátce
  month_number INTEGER NOT NULL, -- Číslo měsíce (1, 2, 3, ...)
  due_date DATE NOT NULL, -- Datum splatnosti
  amount NUMERIC(10, 2) NOT NULL, -- Částka splátky
  is_paid BOOLEAN DEFAULT FALSE, -- Zda byla splátka zaplacena
  paid_date DATE, -- Datum zaplacení (volitelné)
  
  -- Metadata
  notes TEXT -- Poznámky k splátce
);

-- Vytvoření indexů pro rychlejší vyhledávání
CREATE INDEX IF NOT EXISTS idx_installment_calendars_project_id ON installment_calendars(project_id);
CREATE INDEX IF NOT EXISTS idx_installment_calendars_is_deleted ON installment_calendars(is_deleted);
CREATE INDEX IF NOT EXISTS idx_installment_payments_calendar_id ON installment_payments(calendar_id);
CREATE INDEX IF NOT EXISTS idx_installment_payments_is_paid ON installment_payments(is_paid);
CREATE INDEX IF NOT EXISTS idx_installment_payments_due_date ON installment_payments(due_date);

-- Trigger pro automatickou aktualizaci updated_at
CREATE OR REPLACE FUNCTION update_installment_calendars_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_installment_calendars_updated_at ON installment_calendars;
CREATE TRIGGER update_installment_calendars_updated_at BEFORE UPDATE ON installment_calendars
    FOR EACH ROW EXECUTE FUNCTION update_installment_calendars_updated_at_column();

CREATE OR REPLACE FUNCTION update_installment_payments_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_installment_payments_updated_at ON installment_payments;
CREATE TRIGGER update_installment_payments_updated_at BEFORE UPDATE ON installment_payments
    FOR EACH ROW EXECUTE FUNCTION update_installment_payments_updated_at_column();

-- Povolení RLS (Row Level Security)
ALTER TABLE installment_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE installment_payments ENABLE ROW LEVEL SECURITY;

-- Politiky pro splátkové kalendáře - povolení pro všechny (admin panel má vlastní autentizaci přes cookies)
CREATE POLICY "Allow insert for installment_calendars" ON installment_calendars
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read for installment_calendars" ON installment_calendars
  FOR SELECT USING (true);

CREATE POLICY "Allow update for installment_calendars" ON installment_calendars
  FOR UPDATE USING (true);

CREATE POLICY "Allow delete for installment_calendars" ON installment_calendars
  FOR DELETE USING (true);

-- Politiky pro splátky
CREATE POLICY "Allow insert for installment_payments" ON installment_payments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read for installment_payments" ON installment_payments
  FOR SELECT USING (true);

CREATE POLICY "Allow update for installment_payments" ON installment_payments
  FOR UPDATE USING (true);

CREATE POLICY "Allow delete for installment_payments" ON installment_payments
  FOR DELETE USING (true);
