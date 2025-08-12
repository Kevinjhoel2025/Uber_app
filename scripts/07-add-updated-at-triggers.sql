-- Función para actualizar la columna 'updated_at' automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para la columna updated_at en todas las tablas relevantes
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON public.usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conductores_updated_at BEFORE UPDATE ON public.conductores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rutas_updated_at BEFORE UPDATE ON public.rutas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ubicaciones_updated_at BEFORE UPDATE ON public.ubicaciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_viajes_updated_at BEFORE UPDATE ON public.viajes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pagos_updated_at BEFORE UPDATE ON public.pagos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comprobantes_updated_at BEFORE UPDATE ON public.comprobantes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calificaciones_updated_at BEFORE UPDATE ON public.calificaciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_respuestas_calificaciones_updated_at BEFORE UPDATE ON public.respuestas_calificaciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_badges_updated_at BEFORE UPDATE ON public.badges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conductor_badges_updated_at BEFORE UPDATE ON public.conductor_badges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_logros_updated_at BEFORE UPDATE ON public.logros FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conductor_logros_updated_at BEFORE UPDATE ON public.conductor_logros FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_solicitudes_especiales_updated_at BEFORE UPDATE ON public.solicitudes_especiales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_retiros_updated_at BEFORE UPDATE ON public.retiros FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mensajes_updated_at BEFORE UPDATE ON public.mensajes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para verificar badges y logros después de insertar una calificación
CREATE TRIGGER after_insert_calificacion
  AFTER INSERT ON public.calificaciones
  FOR EACH ROW
  EXECUTE FUNCTION trigger_verificar_badges_logros();
