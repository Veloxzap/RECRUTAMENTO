-- Nova tabela de Vagas
CREATE TABLE vacancies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  period text CHECK (period IN ('Plantão Noturno', 'Plantão Diurno', 'Diarista')) NOT NULL,
  status text CHECK (status IN ('Confirmado', 'Outros')) DEFAULT 'Confirmado',
  status_reason text,
  created_at timestamp DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE vacancies ENABLE ROW LEVEL SECURITY;

-- Política para usuários autenticados
CREATE POLICY "Allow all for authenticated" ON vacancies FOR ALL TO authenticated USING (true);
