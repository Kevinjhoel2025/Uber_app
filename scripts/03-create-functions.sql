-- Función para calcular el rating promedio de un conductor
CREATE OR REPLACE FUNCTION calcular_rating_promedio(conductor_uuid UUID)
RETURNS DECIMAL(3,2) AS $$
DECLARE
  promedio DECIMAL(3,2);
BEGIN
  SELECT ROUND(AVG(rating_general::DECIMAL), 2)
  INTO promedio
  FROM public.calificaciones
  WHERE conductor_id = conductor_uuid AND verificado = TRUE;
  
  RETURN COALESCE(promedio, 0);
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas de un conductor
CREATE OR REPLACE FUNCTION obtener_estadisticas_conductor(conductor_uuid UUID)
RETURNS JSON AS $$
DECLARE
  resultado JSON;
  total_calificaciones_count BIGINT;
BEGIN
  SELECT COUNT(*)
  INTO total_calificaciones_count
  FROM public.calificaciones
  WHERE conductor_id = conductor_uuid AND verificado = TRUE;

  SELECT json_build_object(
      'total_viajes', (SELECT COUNT(*) FROM public.viajes WHERE conductor_id = conductor_uuid AND estado = 'completado'),
      'rating_promedio', calcular_rating_promedio(conductor_uuid),
      'total_calificaciones', total_calificaciones_count,
      'rating_puntualidad', ROUND(AVG(c.rating_puntualidad::DECIMAL), 2),
      'rating_vehiculo', ROUND(AVG(c.rating_vehiculo::DECIMAL), 2),
      'rating_conduccion', ROUND(AVG(c.rating_conduccion::DECIMAL), 2),
      'rating_amabilidad', ROUND(AVG(c.rating_amabilidad::DECIMAL), 2),
      'recomendaciones_porcentaje', ROUND((COUNT(CASE WHEN c.recomendaria = true THEN 1 END)::DECIMAL / NULLIF(COUNT(c.id), 0)) * 100, 0),
      'distribucion_ratings', (
          SELECT json_build_object(
              '5', COUNT(CASE WHEN rating_general = 5 THEN 1 END),
              '4', COUNT(CASE WHEN rating_general = 4 THEN 1 END),
              '3', COUNT(CASE WHEN rating_general = 3 THEN 1 END),
              '2', COUNT(CASE WHEN rating_general = 2 THEN 1 END),
              '1', COUNT(CASE WHEN rating_general = 1 THEN 1 END)
          )
          FROM public.calificaciones
          WHERE conductor_id = conductor_uuid AND verificado = TRUE
      )
  )
  INTO resultado
  FROM public.calificaciones c
  WHERE c.conductor_id = conductor_uuid AND c.verificado = TRUE;
  
  RETURN COALESCE(resultado, '{}'::json); -- Retorna un objeto JSON vacío si no hay calificaciones
END;
$$ LANGUAGE plpgsql;

-- Función para verificar y otorgar badges automáticamente
CREATE OR REPLACE FUNCTION verificar_badges_conductor(conductor_uuid UUID)
RETURNS VOID AS $$
DECLARE
  badge_record RECORD;
  estadisticas JSON;
  viajes_completados INTEGER;
  rating_promedio DECIMAL(3,2);
BEGIN
  -- Obtener estadísticas del conductor
  SELECT * INTO estadisticas FROM obtener_estadisticas_conductor(conductor_uuid);
  
  -- Obtener número de viajes completados
  SELECT COUNT(*) INTO viajes_completados
  FROM public.viajes
  WHERE conductor_id = conductor_uuid AND estado = 'completado';
  
  -- Obtener rating promedio
  SELECT calcular_rating_promedio(conductor_uuid) INTO rating_promedio;
  
  -- Verificar cada badge
  FOR badge_record IN SELECT * FROM public.badges WHERE activo = true LOOP
      -- Verificar si ya tiene el badge
      IF NOT EXISTS (
          SELECT 1 FROM public.conductor_badges 
          WHERE conductor_id = conductor_uuid AND badge_id = badge_record.id
      ) THEN
          -- Verificar criterios según el tipo de badge
          CASE 
              WHEN badge_record.criterio->>'tipo' = 'viajes_completados' THEN
                  IF viajes_completados >= (badge_record.criterio->>'minimo')::INTEGER THEN
                      INSERT INTO public.conductor_badges (conductor_id, badge_id)
                      VALUES (conductor_uuid, badge_record.id);
                  END IF;
                  
              WHEN badge_record.criterio->>'tipo' = 'rating_general' THEN
                  IF rating_promedio >= (badge_record.criterio->>'minimo')::DECIMAL THEN
                      INSERT INTO public.conductor_badges (conductor_id, badge_id)
                      VALUES (conductor_uuid, badge_record.id);
                  END IF;
                  
              WHEN badge_record.criterio->>'tipo' = 'rating_vehiculo' THEN
                  IF (estadisticas->>'rating_vehiculo')::DECIMAL >= (badge_record.criterio->>'minimo')::DECIMAL THEN
                      INSERT INTO public.conductor_badges (conductor_id, badge_id)
                      VALUES (conductor_uuid, badge_record.id);
                  END IF;
                  
              WHEN badge_record.criterio->>'tipo' = 'rating_amabilidad' THEN
                  IF (estadisticas->>'rating_amabilidad')::DECIMAL >= (badge_record.criterio->>'minimo')::DECIMAL THEN
                      INSERT INTO public.conductor_badges (conductor_id, badge_id)
                      VALUES (conductor_uuid, badge_record.id);
                  END IF;
          END CASE;
      END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Función para verificar y otorgar logros automáticamente
CREATE OR REPLACE FUNCTION verificar_logros_conductor(conductor_uuid UUID)
RETURNS VOID AS $$
DECLARE
  logro_record RECORD;
  viajes_completados INTEGER;
  rating_promedio DECIMAL(3,2);
BEGIN
  -- Obtener número de viajes completados
  SELECT COUNT(*) INTO viajes_completados
  FROM public.viajes
  WHERE conductor_id = conductor_uuid AND estado = 'completado';
  
  -- Obtener rating promedio
  SELECT calcular_rating_promedio(conductor_uuid) INTO rating_promedio;
  
  -- Verificar cada logro
  FOR logro_record IN SELECT * FROM public.logros WHERE activo = true LOOP
      -- Verificar si ya tiene el logro
      IF NOT EXISTS (
          SELECT 1 FROM public.conductor_logros 
          WHERE conductor_id = conductor_uuid AND logro_id = logro_record.id
      ) THEN
          -- Verificar criterios según el tipo de logro
          CASE 
              WHEN logro_record.criterio->>'tipo' = 'viajes_completados' THEN
                  IF viajes_completados >= (logro_record.criterio->>'objetivo')::INTEGER THEN
                      INSERT INTO public.conductor_logros (conductor_id, logro_id)
                      VALUES (conductor_uuid, logro_record.id);
                  END IF;
                  
              WHEN logro_record.criterio->>'tipo' = 'rating_promedio' THEN
                  IF rating_promedio >= (logro_record.criterio->>'objetivo')::DECIMAL THEN
                      INSERT INTO public.conductor_logros (conductor_id, logro_id)
                      VALUES (conductor_uuid, logro_record.id);
                  END IF;
          END CASE;
      END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger para verificar badges y logros después de insertar una calificación
CREATE OR REPLACE FUNCTION trigger_verificar_badges_logros()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar badges y logros para el conductor calificado
  PERFORM verificar_badges_conductor(NEW.conductor_id);
  PERFORM verificar_logros_conductor(NEW.conductor_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener el ranking de conductores
CREATE OR REPLACE FUNCTION obtener_ranking_conductores(limite INTEGER DEFAULT 10)
RETURNS TABLE (
  conductor_id UUID,
  nombre VARCHAR(100),
  vehiculo VARCHAR(100),
  rating_promedio DECIMAL(3,2),
  total_viajes BIGINT,
  total_calificaciones BIGINT,
  posicion INTEGER,
  avatar_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
      c.id,
      u.nombre,
      c.vehiculo,
      calcular_rating_promedio(c.id) as rating_promedio,
      (SELECT COUNT(*) FROM public.viajes WHERE conductor_id = c.id AND estado = 'completado') as total_viajes,
      (SELECT COUNT(*) FROM public.calificaciones WHERE conductor_id = c.id AND verificado = TRUE) as total_calificaciones,
      ROW_NUMBER() OVER (ORDER BY calcular_rating_promedio(c.id) DESC, (SELECT COUNT(*) FROM public.viajes WHERE conductor_id = c.id AND estado = 'completado') DESC)::INTEGER as posicion,
      u.avatar_url
  FROM public.conductores c
  JOIN public.usuarios u ON c.id = u.id
  WHERE u.activo = true
  GROUP BY c.id, u.nombre, c.vehiculo, u.avatar_url
  HAVING (SELECT COUNT(*) FROM public.calificaciones WHERE conductor_id = c.id AND verificado = TRUE) > 0
  ORDER BY rating_promedio DESC, total_viajes DESC
  LIMIT limite;
END;
$$ LANGUAGE plpgsql;

-- Función para generar número de comprobante
CREATE OR REPLACE FUNCTION generar_numero_comprobante()
RETURNS TEXT AS $$
DECLARE
  numero TEXT;
  existe BOOLEAN;
BEGIN
  LOOP
      numero := 'COMP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
      
      SELECT EXISTS(SELECT 1 FROM public.comprobantes WHERE numero_comprobante = numero) INTO existe;
      
      IF NOT existe THEN
          EXIT;
      END IF;
  END LOOP;
  
  RETURN numero;
END;
$$ LANGUAGE plpgsql;
