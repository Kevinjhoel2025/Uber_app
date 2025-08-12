-- Este script corrige y redefine las políticas RLS para evitar recursiones y asegurar el acceso correcto.
-- Se recomienda ejecutarlo DESPUÉS de todos los scripts de creación de tablas y funciones.

-- Desactivar todas las políticas existentes para las tablas relevantes para evitar conflictos
ALTER TABLE public.usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.conductores DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.viajes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.calificaciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.respuestas_calificaciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.conductor_badges DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.logros DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.conductor_logros DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.comprobantes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitudes_especiales DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.retiros DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rutas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ubicaciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensajes DISABLE ROW LEVEL SECURITY;

-- Eliminar todas las políticas existentes para las tablas relevantes
DROP POLICY IF EXISTS "Allow authenticated users to view their own profile" ON public.usuarios;
DROP POLICY IF EXISTS "Allow authenticated users to update their own profile" ON public.usuarios;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own profile" ON public.usuarios;

DROP POLICY IF EXISTS "Allow authenticated conductors to view their own profile" ON public.conductores;
DROP POLICY IF EXISTS "Allow authenticated conductors to update their own profile" ON public.conductores;
DROP POLICY IF EXISTS "Allow secretaries to view all conductors" ON public.conductores;
DROP POLICY IF EXISTS "Allow secretaries to insert conductors" ON public.conductores;
DROP POLICY IF EXISTS "Allow secretaries to update conductors" ON public.conductores;

DROP POLICY IF EXISTS "Allow passengers to view their own trips" ON public.viajes;
DROP POLICY IF EXISTS "Allow conductors to view their assigned trips" ON public.viajes;
DROP POLICY IF EXISTS "Allow passengers to create trips" ON public.viajes;
DROP POLICY IF EXISTS "Allow conductors to update trip status" ON public.viajes;
DROP POLICY IF EXISTS "Allow secretaries to view all trips" ON public.viajes;
DROP POLICY IF EXISTS "Allow secretaries to update any trip" ON public.viajes;

DROP POLICY IF EXISTS "Allow passengers to create ratings for their trips" ON public.calificaciones;
DROP POLICY IF EXISTS "Allow passengers to view their own ratings" ON public.calificaciones;
DROP POLICY IF EXISTS "Allow conductors to view ratings for their trips" ON public.calificaciones;
DROP POLICY IF EXISTS "Allow secretaries to view all ratings" ON public.calificaciones;

DROP POLICY IF EXISTS "Allow conductors to create responses to their ratings" ON public.respuestas_calificaciones;
DROP POLICY IF EXISTS "Allow conductors to view their responses" ON public.respuestas_calificaciones;
DROP POLICY IF EXISTS "Allow secretaries to view all responses" ON public.respuestas_calificaciones;

DROP POLICY IF EXISTS "Allow all authenticated users to view badges" ON public.badges;
DROP POLICY IF EXISTS "Allow all authenticated users to view achievements" ON public.logros;
DROP POLICY IF EXISTS "Allow conductors to view their own badges" ON public.conductor_badges;
DROP POLICY IF EXISTS "Allow conductors to view their own achievements" ON public.conductor_logros;
DROP POLICY IF EXISTS "Allow secretaries to manage badges and achievements" ON public.badges;
DROP POLICY IF EXISTS "Allow secretaries to manage achievements" ON public.logros;
DROP POLICY IF EXISTS "Allow secretaries to manage conductor badges" ON public.conductor_badges;
DROP POLICY IF EXISTS "Allow secretaries to manage conductor achievements" ON public.conductor_logros;

DROP POLICY IF EXISTS "Allow authenticated users to view their own comprobantes" ON public.comprobantes;
DROP POLICY IF EXISTS "Allow secretaries to view and verify comprobantes" ON public.comprobantes;
DROP POLICY IF EXISTS "Allow insert for comprobantes by authenticated users" ON public.comprobantes;

DROP POLICY IF EXISTS "Allow passengers to create their own special requests" ON public.solicitudes_especiales;
DROP POLICY IF EXISTS "Allow passengers to view their own special requests" ON public.solicitudes_especiales;
DROP POLICY IF EXISTS "Allow conductors to view assigned special requests" ON public.solicitudes_especiales;
DROP POLICY IF EXISTS "Allow secretaries to manage all special requests" ON public.solicitudes_especiales;

DROP POLICY IF EXISTS "Allow conductors to create their own withdrawal requests" ON public.retiros;
DROP POLICY IF EXISTS "Allow conductors to view their own withdrawal requests" ON public.retiros;
DROP POLICY IF EXISTS "Allow secretaries to manage all withdrawal requests" ON public.retiros;

DROP POLICY IF EXISTS "Allow all authenticated users to view routes" ON public.rutas;
DROP POLICY IF EXISTS "Allow all authenticated users to view locations" ON public.ubicaciones;
DROP POLICY IF EXISTS "Allow secretaries to manage routes" ON public.rutas;
DROP POLICY IF EXISTS "Allow secretaries to manage locations" ON public.ubicaciones;

DROP POLICY IF EXISTS "Allow authenticated users to send messages" ON public.mensajes;
DROP POLICY IF EXISTS "Allow authenticated users to view their messages" ON public.mensajes;
DROP POLICY IF EXISTS "Allow authenticated users to mark messages as read" ON public.mensajes;
DROP POLICY IF EXISTS "Allow secretaries to view all messages" ON public.mensajes;


-- Habilitar RLS y redefinir políticas
-- Tabla: usuarios
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios: Select own" ON public.usuarios FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuarios: Update own" ON public.usuarios FOR UPDATE USING (auth.uid() = id);
-- La política de INSERT para usuarios se manejará con un trigger de auth.users

-- Tabla: conductores
ALTER TABLE public.conductores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Conductores: Select own" ON public.conductores FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Conductores: Update own" ON public.conductores FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Conductores: Select all for secretaria" ON public.conductores FOR SELECT USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo_usuario = 'secretaria'));
CREATE POLICY "Conductores: Insert for secretaria" ON public.conductores FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo_usuario = 'secretaria'));
CREATE POLICY "Conductores: Update all for secretaria" ON public.conductores FOR UPDATE USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo_usuario = 'secretaria'));

-- Tabla: viajes
ALTER TABLE public.viajes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Viajes: Select own as pasajero" ON public.viajes FOR SELECT USING (auth.uid() = pasajero_id);
CREATE POLICY "Viajes: Select own as conductor" ON public.viajes FOR SELECT USING (auth.uid() = conductor_id);
CREATE POLICY "Viajes: Insert by pasajero" ON public.viajes FOR INSERT WITH CHECK (auth.uid() = pasajero_id);
CREATE POLICY "Viajes: Update by conductor" ON public.viajes FOR UPDATE USING (auth.uid() = conductor_id);
CREATE POLICY "Viajes: Select all for secretaria" ON public.viajes FOR SELECT USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo_usuario = 'secretaria'));
CREATE POLICY "Viajes: Update all for secretaria" ON public.viajes FOR UPDATE USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo_usuario = 'secretaria'));

-- Tabla: calificaciones
ALTER TABLE public.calificaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Calificaciones: Insert by pasajero" ON public.calificaciones FOR INSERT WITH CHECK (auth.uid() = pasajero_id);
CREATE POLICY "Calificaciones: Select own as pasajero" ON public.calificaciones FOR SELECT USING (auth.uid() = pasajero_id);
CREATE POLICY "Calificaciones: Select for conductor" ON public.calificaciones FOR SELECT USING (auth.uid() = conductor_id);
CREATE POLICY "Calificaciones: Select all for secretaria" ON public.calificaciones FOR SELECT USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo_usuario = 'secretaria'));

-- Tabla: respuestas_calificaciones
ALTER TABLE public.respuestas_calificaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Respuestas: Insert by conductor" ON public.respuestas_calificaciones FOR INSERT WITH CHECK (auth.uid() = conductor_id);
CREATE POLICY "Respuestas: Select for conductor" ON public.respuestas_calificaciones FOR SELECT USING (auth.uid() = conductor_id);
CREATE POLICY "Respuestas: Select all for secretaria" ON public.respuestas_calificaciones FOR SELECT USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo_usuario = 'secretaria'));

-- Tablas: badges, logros, conductor_badges, conductor_logros
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Badges: Select all" ON public.badges FOR SELECT USING (true);
ALTER TABLE public.logros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Logros: Select all" ON public.logros FOR SELECT USING (true);

ALTER TABLE public.conductor_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ConductorBadges: Select own" ON public.conductor_badges FOR SELECT USING (auth.uid() = conductor_id);
CREATE POLICY "ConductorBadges: Manage by secretaria" ON public.conductor_badges FOR ALL USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo_usuario = 'secretaria'));

ALTER TABLE public.conductor_logros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ConductorLogros: Select own" ON public.conductor_logros FOR SELECT USING (auth.uid() = conductor_id);
CREATE POLICY "ConductorLogros: Manage by secretaria" ON public.conductor_logros FOR ALL USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo_usuario = 'secretaria'));

-- Tabla: comprobantes
ALTER TABLE public.comprobantes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comprobantes: Insert by authenticated" ON public.comprobantes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Comprobantes: Select own related" ON public.comprobantes FOR SELECT USING (EXISTS (SELECT 1 FROM public.viajes WHERE id::text = comprobantes.pago_id AND pasajero_id = auth.uid()));
CREATE POLICY "Comprobantes: Manage by secretaria" ON public.comprobantes FOR ALL USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo_usuario = 'secretaria'));

-- Tabla: solicitudes_especiales
ALTER TABLE public.solicitudes_especiales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Solicitudes: Insert by pasajero" ON public.solicitudes_especiales FOR INSERT WITH CHECK (auth.uid() = pasajero_id);
CREATE POLICY "Solicitudes: Select own as pasajero" ON public.solicitudes_especiales FOR SELECT USING (auth.uid() = pasajero_id);
CREATE POLICY "Solicitudes: Select assigned for conductor" ON public.solicitudes_especiales FOR SELECT USING (auth.uid() = conductor_asignado);
CREATE POLICY "Solicitudes: Manage by secretaria" ON public.solicitudes_especiales FOR ALL USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo_usuario = 'secretaria'));

-- Tabla: retiros
ALTER TABLE public.retiros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Retiros: Insert by conductor" ON public.retiros FOR INSERT WITH CHECK (auth.uid() = conductor_id);
CREATE POLICY "Retiros: Select own as conductor" ON public.retiros FOR SELECT USING (auth.uid() = conductor_id);
CREATE POLICY "Retiros: Manage by secretaria" ON public.retiros FOR ALL USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo_usuario = 'secretaria'));

-- Tablas: rutas, ubicaciones
ALTER TABLE public.rutas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Rutas: Select all" ON public.rutas FOR SELECT USING (true);
CREATE POLICY "Rutas: Manage by secretaria" ON public.rutas FOR ALL USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo_usuario = 'secretaria'));

ALTER TABLE public.ubicaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ubicaciones: Select all" ON public.ubicaciones FOR SELECT USING (true);
CREATE POLICY "Ubicaciones: Manage by secretaria" ON public.ubicaciones FOR ALL USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo_usuario = 'secretaria'));

-- Tabla: mensajes
ALTER TABLE public.mensajes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Mensajes: Insert by authenticated" ON public.mensajes FOR INSERT WITH CHECK (auth.uid() = remitente_id);
CREATE POLICY "Mensajes: Select own or broadcast" ON public.mensajes FOR SELECT USING (auth.uid() = remitente_id OR auth.uid() = destinatario_id OR destinatario_id IS NULL);
CREATE POLICY "Mensajes: Update read status by recipient" ON public.mensajes FOR UPDATE USING (auth.uid() = destinatario_id);
CREATE POLICY "Mensajes: Select all for secretaria" ON public.mensajes FOR SELECT USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo_usuario = 'secretaria'));
