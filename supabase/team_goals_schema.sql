-- ==============================================================================
-- MÓDULO: METAS DEL EQUIPO (TEAM GOALS) - CEMIP
-- Descripción: Esquema relacional para la gestión de iniciativas institucionales.
-- ==============================================================================

-- 1. Tabla Principal: Metas del Equipo
CREATE TABLE public.team_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    indicator TEXT,
    responsible TEXT, -- Opcional: Puede cambiarse a UUID referenciando a auth.users si se desea relación estricta
    target_date DATE,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'achieved')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    category TEXT DEFAULT 'Administración',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_team_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_team_goals
BEFORE UPDATE ON public.team_goals
FOR EACH ROW
EXECUTE FUNCTION update_team_goals_updated_at();

-- 2. Tabla de Subtareas (Checklists)
CREATE TABLE public.team_goal_subtasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES public.team_goals(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de Bitácora / Comentarios
CREATE TABLE public.team_goal_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES public.team_goals(id) ON DELETE CASCADE,
    author TEXT NOT NULL, -- Nombre del autor (o UUID del profile)
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabla de Archivos Adjuntos (Metadatos)
-- Nota: El archivo real se guardará en un Supabase Storage Bucket llamado 'team_attachments'
CREATE TABLE public.team_goal_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES public.team_goals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    size INTEGER NOT NULL, -- en bytes
    type TEXT NOT NULL, -- mime type (ej. image/png, application/pdf)
    storage_path TEXT NOT NULL, -- Ruta dentro del bucket de Supabase
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- POLÍTICAS DE SEGURIDAD RLS (Row Level Security)
-- ==============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.team_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_goal_subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_goal_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_goal_attachments ENABLE ROW LEVEL SECURITY;

-- Políticas para Metas (Todos los usuarios autenticados pueden ver y crear)
CREATE POLICY "Permitir lectura de metas a usuarios autenticados" 
ON public.team_goals FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir creación de metas a usuarios autenticados" 
ON public.team_goals FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir actualización de metas a usuarios autenticados" 
ON public.team_goals FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir eliminar metas a usuarios autenticados" 
ON public.team_goals FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para Subtareas
CREATE POLICY "Permitir acceso total a subtareas" 
ON public.team_goal_subtasks FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para Comentarios
CREATE POLICY "Permitir acceso total a comentarios" 
ON public.team_goal_comments FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para Archivos Adjuntos
CREATE POLICY "Permitir acceso total a archivos adjuntos" 
ON public.team_goal_attachments FOR ALL USING (auth.role() = 'authenticated');

-- ==============================================================================
-- INSTRUCCIONES ADICIONALES PARA STORAGE
-- ==============================================================================
-- Ve a tu panel de Supabase > Storage y crea un nuevo Bucket llamado:
-- 'team_attachments'
-- Asegúrate de hacerlo "Público" o configurar sus propias políticas de RLS.
