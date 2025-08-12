-- Este script ya fue ejecutado y sus datos están en 02-insert-sample-data.sql y 01-create-tables.sql
-- No es necesario ejecutarlo de nuevo si ya se hizo.
-- Se mantiene aquí para referencia de lo que se añadió.

-- Actualizar datos para incluir Satélite Norte como destino
UPDATE public.viajes SET destino = 'Satélite Norte' WHERE destino = 'Montero' AND id = '660e8400-e29b-41d4-a716-446655440002';

-- Insertar más viajes con Satélite Norte
INSERT INTO public.viajes (id, conductor_id, pasajero_id, origen, destino, fecha_viaje, precio, estado, distancia_km, duracion_minutos, metodo_pago) VALUES
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 'Warnes', 'Satélite Norte', '2024-01-16 09:00:00+00', 20.00, 'completado', 25.0, 35, 'QR'),
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', 'Satélite Norte', 'Warnes', '2024-01-16 14:30:00+00', 20.00, 'completado', 25.0, 35, 'Tigo Money'),
('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440006', 'Montero', 'Satélite Norte', '2024-01-16 16:00:00+00', 15.00, 'completado', 12.0, 20, 'Billetera');

-- Insertar calificaciones para los nuevos viajes
INSERT INTO public.calificaciones (viaje_id, pasajero_id, conductor_id, rating_general, rating_puntualidad, rating_vehiculo, rating_conduccion, rating_amabilidad, comentario, recomendaria) VALUES
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 5, 5, 4, 5, 5, 'Excelente viaje a Satélite Norte, muy cómodo y puntual.', true),
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', 4, 4, 4, 4, 5, 'Buen conductor, llegamos bien a Warnes desde Satélite Norte.', true);

-- Insertar pagos correspondientes
INSERT INTO public.pagos (viaje_id, pasajero_id, conductor_id, monto, metodo, estado, comision) VALUES
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 20.00, 'QR', 'completado', 2.00),
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', 20.00, 'Tigo Money', 'completado', 2.00),
('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', 15.00, 'Billetera', 'completado', 1.50);

-- Agregar nueva parada: Satélite Norte
INSERT INTO public.rutas (origen, destino, precio_base, duracion_estimada, distancia_km, activa) VALUES
('Warnes', 'Satélite Norte', 20.00, 35, 28, true),
('Satélite Norte', 'Warnes', 20.00, 35, 28, true),
('Montero', 'Satélite Norte', 15.00, 20, 15, true),
('Satélite Norte', 'Montero', 15.00, 20, 15, true),
('Satélite Norte', '27 de Noviembre', 18.00, 30, 22, true),
('27 de Noviembre', 'Satélite Norte', 18.00, 30, 22, true),
('Terminal Warnes', 'Satélite Norte', 10.00, 30, 25.0, true),
('Satélite Norte', 'Terminal Warnes', 10.00, 30, 25.0, true),
('27 de Noviembre', 'Satélite Norte', 7.00, 20, 15.0, true),
('Satélite Norte', '27 de Noviembre', 7.00, 20, 15.0, true)
ON CONFLICT (origen, destino) DO UPDATE SET
  precio_base = EXCLUDED.precio_base,
  duracion_estimada = EXCLUDED.duracion_estimada,
  distancia_km = EXCLUDED.distancia_km,
  activa = EXCLUDED.activa;

-- Actualizar ubicaciones conocidas
INSERT INTO public.ubicaciones (id, nombre, latitud, longitud, tipo, activa) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Satélite Norte', -17.6000, -63.0500, 'parada', true),
('Terminal Satélite Norte', -17.7480, -63.1520, 'terminal', true)
ON CONFLICT (id) DO NOTHING;
