-- Locais de Atuação
CREATE TABLE work_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  city text,
  state text,
  notes text,
  created_at timestamp DEFAULT now()
);

-- Locais de Teste Prático
CREATE TABLE test_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  city text,
  state text,
  capacity integer,
  responsible text,
  notes text,
  created_at timestamp DEFAULT now()
);

-- Vagas
CREATE TABLE job_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  status text CHECK (status IN ('disponível','preenchida')) DEFAULT 'disponível',
  created_at timestamp DEFAULT now()
);

-- Candidatos
CREATE TABLE candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact text NOT NULL,
  job_position text NOT NULL,
  work_location_id uuid REFERENCES work_locations(id),
  test_location_id uuid REFERENCES test_locations(id),
  test_date date,
  current_status text CHECK (current_status IN
    ('Em Análise','Aprovado','Reprovado','Em Espera','Contratado')) DEFAULT 'Em Análise',
  test_result text CHECK (test_result IN
    ('Aprovado','Reprovado','Aguardando')) DEFAULT 'Aguardando',
  should_hire boolean DEFAULT false,
  notes text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE work_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

-- Políticas Simples (Permitir tudo para usuários autenticados)
CREATE POLICY "Allow all for authenticated" ON work_locations FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated" ON test_locations FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated" ON job_positions FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated" ON candidates FOR ALL TO authenticated USING (true);

-- Dados iniciais de exemplo (opcional)
INSERT INTO job_positions (title, status) VALUES 
('Operador de Máquinas', 'disponível'),
('Motorista Categoria D', 'disponível'),
('Ajudante Geral', 'disponível');
