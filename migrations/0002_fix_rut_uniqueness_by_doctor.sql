-- 1. Eliminar la restricción única actual del RUT
DROP INDEX IF EXISTS patients_rut_key;

-- 2. Crear un índice único compuesto (RUT + ID_DOCTOR)
CREATE UNIQUE INDEX patients_rut_doctor_unique 
ON patients(rut, id_doctor) 
WHERE isactive = true;

-- 3. Opcional: Mantener un índice no único para búsquedas por RUT
CREATE INDEX idx_patients_rut_search 
ON patients(rut) 
WHERE isactive = true;