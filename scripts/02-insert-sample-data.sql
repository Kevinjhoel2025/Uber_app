-- Insertar badges predefinidos
INSERT INTO public.badges (nombre, descripcion, icono, criterio) VALUES
('Súper Puntual', '95% de puntualidad en los viajes', '⏰', '{"tipo": "puntualidad", "minimo": 95}'),
('Vehículo Impecable', 'Calificación promedio de vehículo > 4.5', '✨', '{"tipo": "rating_vehiculo", "minimo": 4.5}'),
('Conductor Amigable', 'Calificación promedio de amabilidad > 4.7', '😊', '{"tipo": "rating_amabilidad", "minimo": 4.7}'),
('Conductor Seguro', 'Cero accidentes registrados', '🛡️', '{"tipo": "accidentes", "maximo": 0}'),
('Veterano', 'Más de 1000 viajes completados', '🏆', '{"tipo": "viajes_completados", "minimo": 1000}'),
('Estrella Dorada', 'Calificación general > 4.8', '⭐', '{"tipo": "rating_general", "minimo": 4.8}');

-- Insertar logros predefinidos
INSERT INTO public.logros (nombre, descripcion, icono, criterio, puntos) VALUES
('Primer Viaje', 'Completa tu primer viaje como conductor', 'trophy', '{"tipo": "viajes_completados", "objetivo": 1}', 10),
('100 Viajes', 'Completa 100 viajes exitosos', 'trophy', '{"tipo": "viajes_completados", "objetivo": 100}', 100),
('500 Viajes', 'Completa 500 viajes exitosos', 'medal', '{"tipo": "viajes_completados", "objetivo": 500}', 250),
('1000 Viajes', 'Completa 1000 viajes exitosos', 'award', '{"tipo": "viajes_completados", "objetivo": 1000}', 500),
('Calificación 4.8+', 'Mantén una calificación promedio de 4.8 o superior', 'star', '{"tipo": "rating_promedio", "objetivo": 4.8}', 200),
('Mes Perfecto', 'Completa un mes con calificación 5.0', 'star', '{"tipo": "mes_perfecto", "objetivo": 5.0}', 300),
('Maratonista', 'Completa 2000 viajes', 'medal', '{"tipo": "viajes_completados", "objetivo": 2000}', 1000);

-- Insertar datos de ejemplo (usuarios)
-- Nota: En producción, estos usuarios se crearían a través del sistema de autenticación
INSERT INTO public.usuarios (id, nombre, telefono, email, tipo_usuario) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Carlos Mendoza', '+591 70123456', 'carlos@sindicato.com', 'conductor'),
('550e8400-e29b-41d4-a716-446655440002', 'María González', '+591 70987654', 'maria@sindicato.com', 'conductor'),
('550e8400-e29b-41d4-a716-446655440003', 'Pedro Rojas', '+591 70456789', 'pedro@sindicato.com', 'conductor'),
('550e8400-e29b-41d4-a716-446655440004', 'Ana López', '+591 70111222', 'ana@email.com', 'usuario'),
('550e8400-e29b-41d4-a716-446655440005', 'Roberto Silva', '+591 70333444', 'roberto@email.com', 'usuario'),
('550e8400-e29b-41d4-a716-446655440006', 'Carmen Ruiz', '+591 70555666', 'carmen@email.com', 'usuario'),
('550e8400-e29b-41d4-a716-446655440007', 'Secretaria Central', '+591 70000000', 'secretaria@sindicato.com', 'secretaria');

-- Insertar conductores
INSERT INTO public.conductores (id, vehiculo, placa, capacidad, codigo_conductor, ubicacion_lat, ubicacion_lng) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Toyota Hiace', 'ABC123', 12, 'COND001', -17.7833, -63.1821),
('550e8400-e29b-41d4-a716-446655440002', 'Nissan Urvan', 'XYZ789', 12, 'COND002', -17.79, -63.19),
('550e8400-e29b-41d4-a716-446655440003', 'Ford Transit', 'DEF456', 12, 'COND003', -17.77, -63.17);

-- Insertar viajes de ejemplo
INSERT INTO public.viajes (id, conductor_id, pasajero_id, origen, destino, fecha_viaje, precio, estado, distancia_km, duracion_minutos) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', 'Warnes', 'Montero', '2024-01-15 14:30:00+00', 15.00, 'completado', 18.5, 25),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', 'Montero', 'Warnes', '2024-01-15 15:00:00+00', 15.00, 'completado', 18.5, 25),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440006', 'Warnes', 'Montero', '2024-01-14 16:00:00+00', 15.00, 'completado', 18.5, 25);

-- Insertar calificaciones de ejemplo
INSERT INTO public.calificaciones (viaje_id, pasajero_id, conductor_id, rating_general, rating_puntualidad, rating_vehiculo, rating_conduccion, rating_amabilidad, comentario, recomendaria) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 5, 5, 5, 5, 5, 'Excelente conductor, muy puntual y amable. El vehículo estaba limpio y cómodo.', true),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 4, 5, 3, 4, 4, 'Buen viaje, llegó a tiempo. Solo el aire acondicionado no funcionaba muy bien.', true),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', 5, 5, 5, 5, 5, 'Perfecto como siempre. Carlos es muy profesional y su vehículo impecable.', true);

-- Insertar respuestas de conductores
INSERT INTO public.respuestas_calificaciones (calificacion_id, conductor_id, respuesta) VALUES
((SELECT id FROM public.calificaciones WHERE comentario LIKE '%Excelente conductor%'), '550e8400-e29b-41d4-a716-446655440001', '¡Muchas gracias Ana! Siempre trato de brindar el mejor servicio.'),
((SELECT id FROM public.calificaciones WHERE comentario LIKE '%aire acondicionado%'), '550e8400-e29b-41d4-a716-446655440002', 'Gracias Roberto, ya revisé el aire acondicionado.');
