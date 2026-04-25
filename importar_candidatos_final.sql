-- Script de Importação com Locais Específicos
DO $$ 
DECLARE 
    work_id uuid := (SELECT id FROM work_locations WHERE name ILIKE '%HOSPITAL DA MULHER%' LIMIT 1);
    test_id uuid := (SELECT id FROM test_locations WHERE name ILIKE '%HOSPITAL TRAUMA%' LIMIT 1);
BEGIN
    -- Garantir que os locais existem para evitar erro de FK
    IF work_id IS NULL THEN 
        INSERT INTO work_locations (name) VALUES ('HOSPITAL DA MULHER') RETURNING id INTO work_id;
    END IF;
    IF test_id IS NULL THEN 
        INSERT INTO test_locations (name) VALUES ('HOSPITAL TRAUMA') RETURNING id INTO test_id;
    END IF;

    INSERT INTO candidates (name, contact, job_position, work_location_id, test_location_id, test_date, current_status, test_result, should_hire, notes) VALUES
    ('VANESSA LOPES DE ALMEIDA', '(83) 99682-0551 / 98772-5541', 'COPEIRO(A)', work_id, test_id, '2026-04-27', 'Sim', 'Aguardando', false, NULL),
    ('IARA SOARES MONTEIRO', '(83) 99343-5028', 'COZINHEIRO(A)', work_id, test_id, '2026-04-27', 'Sim', 'Aguardando', false, NULL),
    ('CARLOS ANTÔNIO DA SILVA NASCIMENTO JUNIOR', '(83) 99669-8787 / 99912-9719', 'COZINHEIRO(A)', work_id, test_id, '2026-04-27', 'Sim', 'Aguardando', false, NULL),
    ('EDILSON BARBOA DA CONCEIÇÃO', '(83) 98615-8713 / 99830-0545', 'COZINHEIRO(A)', work_id, test_id, '2026-04-27', 'Sim', 'Aguardando', false, NULL),
    ('IZANIA VIEIRA DA SILVA', '(83) 98144-5675 / 98782-4552', 'AUX. ESTOQUE', work_id, test_id, '2026-04-27', 'Sim', 'Aguardando', false, NULL),
    ('ADEIZE SOUSA DA SILVA', '(83) 99343-0031 / 99392-3889', 'COPEIRO(A)', work_id, test_id, '2026-04-27', 'Sim', 'Aguardando', false, NULL),
    ('RAQUEL DE FARIAS SANTIAGO VASCONCELOS', '(83) 98178-2077', 'LACTARISTA', work_id, test_id, '2026-04-27', 'Sim', 'Aguardando', false, NULL),
    ('PRISCILA FERREIRA Alves', '(83) 98146-4485', 'COPEIRO(A)', work_id, test_id, '2026-04-27', 'Sim', 'Aguardando', false, NULL),
    ('THIAGO MATIAS DA SILVA', '(21) 97873-7840', 'ASG', work_id, test_id, '2026-04-28', 'Sim', 'Aguardando', false, NULL),
    ('ANDREIA PEIXOTO DA SILVA', '(83) 98788-7143', 'COZINHEIRO(A)', work_id, test_id, '2026-04-28', 'Sim', 'Aguardando', false, NULL),
    ('ANA LUIZA DA SILVA', '(83) 98618-3306', 'COZINHEIRO(A)', work_id, test_id, '2026-04-28', 'Sim', 'Aguardando', false, NULL),
    ('MONE LEIDIANE LUZIA DE HOLANDA', '(83) 99882-7705', 'COZINHEIRO(A)', work_id, test_id, '2026-04-28', 'Sim', 'Aguardando', false, NULL),
    ('ROSSANA DA ROCHA BENÍCIO', '(83) 98618-8740 / 98210-7040', 'COPEIRO(A)', work_id, test_id, '2026-04-28', 'Sim', 'Aguardando', false, NULL),
    ('ROSIVANIA DE SOUZA LAURENTINO', '(83) 99819-5017', 'COPEIRO(A)', work_id, test_id, '2026-04-28', 'Sim', 'Aguardando', false, NULL),
    ('INGRID TAIANE BEZERRA SILVESTRE', '(83) 98882-3819', 'LACTARISTA', work_id, test_id, '2026-04-28', 'Sim', 'Aguardando', false, NULL),
    ('GIVANILDO LIMA DA SILVA', '(83) 98210-5939', 'COZINHEIRO(A)', work_id, test_id, '2026-04-29', 'Sim', 'Aguardando', false, NULL),
    ('CRISTIANE LOPES FERNANDES', '(83) 99671-9327', 'COZINHEIRO(A)', work_id, test_id, '2026-04-29', 'Não', 'Aguardando', false, 'AGENDADO CONTATO EM 27/04'),
    ('VALERIA', '(83) 99605-7354', 'LACTARISTA', work_id, test_id, '2026-04-29', 'Não', 'Aguardando', false, 'AG. RETORNO WHATSAPP'),
    ('MARIA DA LUZ VIRGINIO DA SILVA', '(83) 98800-1087', 'COPEIRO(A)', work_id, test_id, '2026-04-29', 'Não', 'Aguardando', false, 'AG. RETORNO WHATSAPP');
END $$;
