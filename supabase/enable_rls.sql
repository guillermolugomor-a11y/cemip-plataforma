-- Script para habilitar Row Level Security (RLS) y solucionar vulnerabilidades
-- Ejecuta este script en el SQL Editor de tu proyecto Supabase.

-- 1. Habilitar RLS en todas las tablas públicas que no lo tienen
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialists ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cajas ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cortes ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_notes ENABLE ROW LEVEL SECURITY;

-- 2. Crear políticas de seguridad base
-- Esto asegura que SOLO los usuarios autenticados (que han iniciado sesión) puedan ver y modificar la información.
-- Elimina el acceso público a datos sensibles y soluciona "rls_disabled_in_public" y "sensitive_columns_exposed".

-- Patients
CREATE POLICY "Authenticated users can access patients" ON patients FOR ALL TO authenticated USING (true);

-- Specialists
CREATE POLICY "Authenticated users can access specialists" ON specialists FOR ALL TO authenticated USING (true);

-- Appointments
CREATE POLICY "Authenticated users can access appointments" ON appointments FOR ALL TO authenticated USING (true);

-- Cajas
CREATE POLICY "Authenticated users can access cajas" ON cajas FOR ALL TO authenticated USING (true);

-- Transactions
CREATE POLICY "Authenticated users can access transactions" ON transactions FOR ALL TO authenticated USING (true);

-- Cortes
CREATE POLICY "Authenticated users can access cortes" ON cortes FOR ALL TO authenticated USING (true);

-- Evaluations
CREATE POLICY "Authenticated users can access evaluations" ON evaluations FOR ALL TO authenticated USING (true);

-- Goals
CREATE POLICY "Authenticated users can access goals" ON goals FOR ALL TO authenticated USING (true);

-- Clinical Logs
CREATE POLICY "Authenticated users can access clinical_logs" ON clinical_logs FOR ALL TO authenticated USING (true);

-- Timeline Notes
CREATE POLICY "Authenticated users can access timeline_notes" ON timeline_notes FOR ALL TO authenticated USING (true);

-- Nota: Si posteriormente necesitas restringir acciones por roles (ej. solo 'admin' puede borrar pagos),
-- puedes actualizar estas políticas usando la tabla 'profiles'. Por ahora, esto bloquea el acceso público anónimo.
