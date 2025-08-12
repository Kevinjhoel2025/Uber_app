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
ALTER TABLE public.comprobantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitudes_especiales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rutas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ubicaciones ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios
CREATE POLICY "Usuarios: Select own profile" ON public.usuarios FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuarios: Update own profile" ON public.usuarios FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Usuarios: Secretaria can view all" ON public.usuarios FOR SELECT USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo_usuario = 'secretaria'));

-- Políticas para conductores
CREATE POLICY "Conductores: Select own profile" ON public.conductores FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Conductores: Update own profile" ON public.conductores FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Conductores: Public view basic info" ON public.conductores FOR SELECT USING (true); -- Todos pueden ver info básica
CREATE POLICY "Conductores: Secretaria can manage all" ON public.conductores FOR ALL USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo_usuario = 'secretaria'));

-- Políticas para rutas
CREATE POLICY "Rutas: Public view all" ON public.rutas FOR SELECT USING (true);
CREATE POLICY "Rutas: Secretaria can manage all" ON public.rutas FOR ALL USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo_usuario = 'secretaria'));

-- Políticas para ubicaciones
CREATE POLICY "Ubicaciones: Public view all" ON public.ubicaciones FOR SELECT USING (true);
CREATE POLICY "Ubicaciones: Secretaria can manage all" ON public.ubicaciones FOR ALL USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo_usuario = 'secretaria'));

-- Políticas para viajes
CREATE POLICY "Viajes: Select own as pasajero" ON public.viajes FOR SELECT USING (auth.uid() = pasajero_id);
CREATE POLICY "Viajes: Select own as conductor" ON public.viajes FOR SELECT USING (auth.uid() = conductor_id);
CREATE POLICY "Viajes: Insert by pasajero" ON public.viajes FOR INSERT WITH CHECK (auth.uid() = pasajero_id);
CREATE POLICY "Viajes: Update by conductor" ON public.viajes FOR UPDATE USING (auth.uid() = conductor_id);
CREATE POLICY "Viajes: Secretaria can manage all" ON public.viajes FOR ALL USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo_usuario = 'secretaria'));

-- Políticas para pagos
CREATE POLICY "Pagos: Select own as pasajero" ON public.pagos FOR SELECT USING (auth.uid() = pasajero_id);
CREATE POLICY "Pagos: Select own as conductor" ON public.pagos FOR SELECT USING (auth.uid() = conductor_id);
CREATE POLICY "Pagos: Insert by authenticated" ON public.pagos FOR INSERT WITH CHECK (auth.uid() IS NOT NULL); -- Cualquier usuario autenticado puede crear un pago
CREATE POLICY "Pagos: Secretaria can manage all" ON public.pagos FOR ALL USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo_usuario = 'secretaria'));

-- Políticas para comprobantes
CREATE POLICY "Comprobantes: Select own related" ON public.comprobantes FOR SELECT USING (EXISTS (SELECT 1 FROM public.pagos WHERE id = pago_id AND (pasajero_id = auth.uid() OR conductor_id = auth.uid())));
CREATE POLICY "Comprobantes: Insert by authenticated" ON public.comprobantes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Comprobantes: Secretaria can manage all" ON public.comprobantes FOR ALL USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo_usuario = 'secretaria'));

-- Políticas para calificaciones
CREATE POLICY "Calificaciones: Insert by pasajero" ON public.calificaciones FOR INSERT WITH CHECK (auth.uid() = pasajero_id);
CREATE POLICY "Calificaciones: Select own as pasajero" ON public.calificaciones FOR SELECT USING (auth.uid() = pasajero_id);
CREATE POLICY "Calificaciones: Select for conductor" ON public.calificaciones FOR SELECT USING (auth.uid() = conductor_id);
CREATE POLICY "Calificaciones: Public view verified" ON public.calificaciones FOR SELECT USING (verificado = true);
CREATE POLICY "Calificaciones: Secretaria can manage all" ON public.calificaciones FOR ALL USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo_usuario = 'secretaria'));

-- Políticas para respuestas_calificaciones
CREATE POLICY "RespuestasCalificaciones: Insert by conductor" ON public.respuestas_calificaciones FOR INSERT WITH CHECK (auth.uid() = conductor_id);
CREATE POLICY "RespuestasCalificaciones: Select all" ON public.respuestas_calificaciones FOR SELECT USING (true);
CREATE POLICY "RespuestasCalificaciones: Secretaria can manage all" ON public.respuestas_calificaciones FOR ALL USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo_usuario = 'secretaria'));

-- Políticas para badges
CREATE POLICY "Badges: Public view all" ON public.badges FOR SELECT USING (true);
CREATE POLICY "Badges: Secretaria can manage all" ON public.badges FOR ALL USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo_usuario = 'secretaria'));

-- Políticas para conductor_badges
CREATE POLICY "ConductorBadges: Select own" ON public.conductor_badges FOR SELECT USING (auth.uid() = conductor_id);
CREATE POLICY "ConductorBadges: Secretaria can manage all" ON public.conductor_badges FOR ALL USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo_usuario = 'secretaria'));

-- Políticas para logros
CREATE POLICY "Logros: Public view all" ON public.logros FOR SELECT USING (true);
CREATE POLICY "Logros: Secretaria can manage all" ON public.logros FOR ALL USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo_usuario = 'secretaria'));

-- Políticas para conductor_logros
CREATE POLICY "ConductorLogros: Select own" ON public.conductor_logros FOR SELECT USING (auth.uid() = conductor_id);
CREATE POLICY "ConductorLogros: Secretaria can manage all" ON public.conductor_logros FOR ALL USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo_usuario = 'secretaria'));

-- Políticas para solicitudes_especiales
CREATE POLICY "SolicitudesEspeciales: Insert by pasajero" ON public.solicitudes_especiales FOR INSERT WITH CHECK (auth.uid() = pasajero_id);
CREATE POLICY "SolicitudesEspeciales: Select own as pasajero" ON public.solicitudes_especiales FOR SELECT USING (auth.uid() = pasajero_id);
CREATE POLICY "SolicitudesEspeciales: Select assigned for conductor" ON public.solicitudes_especiales FOR SELECT USING (auth.uid() = conductor_asignado);
CREATE POLICY "SolicitudesEspeciales: Secretaria can manage all" ON public.solicitudes_especiales FOR ALL USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo_usuario = 'secretaria'));

-- Políticas para retiros
CREATE POLICY "Retiros: Insert by conductor" ON public.retiros FOR INSERT WITH CHECK (auth.uid() = conductor_id);
CREATE POLICY "Retiros: Select own as conductor" ON public.retiros FOR SELECT USING (auth.uid() = conductor_id);
CREATE POLICY "Retiros: Secretaria can manage all" ON public.retiros FOR ALL USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo_usuario = 'secretaria'));

-- Políticas para mensajes
CREATE POLICY "Mensajes: Insert by authenticated" ON public.mensajes FOR INSERT WITH CHECK (auth.uid() = remitente_id);
CREATE POLICY "Mensajes: Select own or broadcast" ON public.mensajes FOR SELECT USING (auth.uid() = remitente_id OR auth.uid() = destinatario_id OR destinatario_id IS NULL);
CREATE POLICY "Mensajes: Update read status by recipient" ON public.mensajes FOR UPDATE USING (auth.uid() = destinatario_id);
CREATE POLICY "Mensajes: Secretaria can manage all" ON public.mensajes FOR ALL USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND tipo_usuario = 'secretaria'));
