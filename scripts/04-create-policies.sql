-- Habilitar RLS (Row Level Security)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conductores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.respuestas_calificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conductor_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conductor_logros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensajes ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios
CREATE POLICY "Los usuarios pueden ver su propia información" ON public.usuarios
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propia información" ON public.usuarios
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Secretaria puede ver todos los usuarios" ON public.usuarios
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'secretaria'
        )
    );

-- Políticas para conductores
CREATE POLICY "Los conductores pueden ver su propia información" ON public.conductores
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Los conductores pueden actualizar su propia información" ON public.conductores
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Todos pueden ver información básica de conductores" ON public.conductores
    FOR SELECT USING (true);

-- Políticas para viajes
CREATE POLICY "Los usuarios pueden ver sus propios viajes" ON public.viajes
    FOR SELECT USING (
        auth.uid() = pasajero_id OR 
        auth.uid() = conductor_id OR
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'secretaria'
        )
    );

CREATE POLICY "Los usuarios pueden crear viajes" ON public.viajes
    FOR INSERT WITH CHECK (auth.uid() = pasajero_id);

CREATE POLICY "Los conductores pueden actualizar sus viajes" ON public.viajes
    FOR UPDATE USING (auth.uid() = conductor_id);

-- Políticas para calificaciones
CREATE POLICY "Los usuarios pueden ver calificaciones de sus viajes" ON public.calificaciones
    FOR SELECT USING (
        auth.uid() = pasajero_id OR 
        auth.uid() = conductor_id OR
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'secretaria'
        )
    );

CREATE POLICY "Los pasajeros pueden crear calificaciones de sus viajes" ON public.calificaciones
    FOR INSERT WITH CHECK (
        auth.uid() = pasajero_id AND
        EXISTS (
            SELECT 1 FROM public.viajes 
            WHERE id = viaje_id AND pasajero_id = auth.uid() AND estado = 'completado'
        )
    );

CREATE POLICY "Todos pueden ver calificaciones públicas" ON public.calificaciones
    FOR SELECT USING (verificado = true);

-- Políticas para respuestas de calificaciones
CREATE POLICY "Los conductores pueden responder a sus calificaciones" ON public.respuestas_calificaciones
    FOR INSERT WITH CHECK (auth.uid() = conductor_id);

CREATE POLICY "Todos pueden ver respuestas de calificaciones" ON public.respuestas_calificaciones
    FOR SELECT USING (true);

-- Políticas para badges
CREATE POLICY "Todos pueden ver badges" ON public.badges
    FOR SELECT USING (activo = true);

CREATE POLICY "Todos pueden ver badges de conductores" ON public.conductor_badges
    FOR SELECT USING (true);

-- Políticas para logros
CREATE POLICY "Todos pueden ver logros" ON public.logros
    FOR SELECT USING (activo = true);

CREATE POLICY "Todos pueden ver logros de conductores" ON public.conductor_logros
    FOR SELECT USING (true);

-- Políticas para pagos
CREATE POLICY "Los usuarios pueden ver sus propios pagos" ON public.pagos
    FOR SELECT USING (
        auth.uid() = pasajero_id OR 
        auth.uid() = conductor_id OR
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'secretaria'
        )
    );

-- Políticas para mensajes
CREATE POLICY "Los usuarios pueden ver sus mensajes" ON public.mensajes
    FOR SELECT USING (
        auth.uid() = remitente_id OR 
        auth.uid() = destinatario_id OR
        destinatario_id IS NULL
    );

CREATE POLICY "Los usuarios pueden enviar mensajes" ON public.mensajes
    FOR INSERT WITH CHECK (auth.uid() = remitente_id);
