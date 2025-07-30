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
