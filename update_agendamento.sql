-- Atualizar as opções do campo current_status (Agendamento)
ALTER TABLE candidates DROP CONSTRAINT IF EXISTS candidates_current_status_check;
ALTER TABLE candidates ADD CONSTRAINT candidates_current_status_check CHECK (current_status IN ('Sim', 'Não'));

-- Definir o padrão como 'Não' para registros futuros
ALTER TABLE candidates ALTER COLUMN current_status SET DEFAULT 'Não';

-- Converter registros existentes (opcional, para evitar erros)
UPDATE candidates SET current_status = 'Não' WHERE current_status NOT IN ('Sim', 'Não');
