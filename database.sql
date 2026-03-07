-- Δομή βάσης δεδομένων για το σύστημα Pokemon TCG Player Management (PostgreSQL)

-- Δημιουργία τύπων ENUM στην PostgreSQL
DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('checkin', 'points_add', 'points_sub', 'credits_add', 'credits_sub');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE age_category_type AS ENUM ('Junior', 'Senior', 'Master');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

--
-- Πίνακας για τους διαχειριστές
--
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Προεπιλεγμένος χρήστης διαχειριστή 
-- Χρήστης: admin | Κωδικός: admin123!
INSERT INTO admin_users (username, password_hash) VALUES
('admin', '$2y$10$aP5I5A2K1rQp.6j.t.4KLeW42G6Kz.Qd.V57.0/d8k/qE7xQ.4D2K')
ON CONFLICT (username) DO NOTHING;

--
-- Πίνακας για τις ρυθμίσεις
--
CREATE TABLE IF NOT EXISTS settings (
  setting_key VARCHAR(50) PRIMARY KEY,
  setting_value VARCHAR(255) NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Αρχικές ρυθμίσεις
INSERT INTO settings (setting_key, setting_value, description) VALUES
('default_participation_points', '10', 'Προεπιλεγμένοι πόντοι για συμμετοχή σε τουρνουά (Check-in)'),
('default_entry_fee', '5.00', 'Προεπιλεγμένο κόστος συμμετοχής για τουρνουά (€)')
ON CONFLICT (setting_key) DO NOTHING;

--
-- Πίνακας Παικτών (Players)
--
CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  birth_date DATE NOT NULL,
  age_category age_category_type NOT NULL,
  total_points INT DEFAULT 0,
  wallet_balance DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--
-- Πίνακας Συναλλαγών
--
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  player_id INT NOT NULL,
  type transaction_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_player FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);
