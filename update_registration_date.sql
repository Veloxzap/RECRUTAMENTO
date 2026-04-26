-- Adiciona a coluna de data de registro
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS registration_date DATE DEFAULT CURRENT_DATE;

-- Atualiza os registros existentes para 25/04/2026
UPDATE candidates SET registration_date = '2026-04-25' WHERE registration_date IS NULL OR registration_date = CURRENT_DATE;

-- Comentário: A partir de agora, novos registros usarão automaticamente a data do dia da criação.
