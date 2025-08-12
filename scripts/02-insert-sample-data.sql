-- Insertar usuarios de ejemplo (estos IDs deben coincidir con los de auth.users si los creas manualmente)
-- En un entorno real, estos se crearían automáticamente con el trigger de auth.users
INSERT INTO public.usuarios (id, nombre, telefono, email, tipo_usuario, activo) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Carlos Mendoza', '+59170123456', 'carlos.conductor@example.com', 'conductor', true),
('550e8400-e29b-41d4-a716-446655440002', 'Ana López', '+59170111222', 'ana.pasajero@example.com', 'usuario', true),
('550e8400-e29b-41d4-a716-446655440003', 'Roberto Silva', '+59170333444', 'roberto.pasajero@example.com', 'usuario', true),
('550e8400-e29b-41d4-a716-446655440004', 'María González', '+59170555666', 'maria.secretaria@example.com', 'secretaria', true)
ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    telefono = EXCLUDED.telefono,
    email = EXCLUDED.email,
    tipo_usuario = EXCLUDED.tipo_usuario,
    activo = EXCLUDED.activo;

-- Insertar conductores de ejemplo (solo si no se crean por el trigger de auth.users)
INSERT INTO public.conductores (id, vehiculo, placa, capacidad, codigo_conductor, estado, ubicacion_lat, ubicacion_lng) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Toyota Hiace', 'ABC123', 12, 'COND001', 'disponible', -17.7833, -63.1821)
ON CONFLICT (id) DO UPDATE SET
    vehiculo = EXCLUDED.vehiculo,
    placa = EXCLUDED.placa,
    capacidad = EXCLUDED.capacidad,
    codigo_conductor = EXCLUDED.codigo_conductor,
    estado = EXCLUDED.estado,
    ubicacion_lat = EXCLUDED.ubicacion_lat,
    ubicacion_lng = EXCLUDED.ubicacion_lng;

-- Insertar ubicaciones de ejemplo
INSERT INTO public.ubicaciones (nombre, latitud, longitud, tipo, activa) VALUES
('Warnes', -17.5000, -63.1500, 'terminal', true),
('Montero', -17.3333, -63.2500, 'parada', true),
('Satélite Norte', -17.6000, -63.0500, 'parada', true),
('27 de Noviembre', -17.4500, -63.1000, 'parada', true)
ON CONFLICT (nombre) DO UPDATE SET
    latitud = EXCLUDED.latitud,
    longitud = EXCLUDED.longitud,
    tipo = EXCLUDED.tipo,
    activa = EXCLUDED.activa;

-- Insertar rutas de ejemplo
INSERT INTO public.rutas (origen, destino, precio_base, duracion_estimada, distancia_km, activa) VALUES
('Warnes', 'Montero', 15.00, 25, 18.5, true),
('Montero', 'Warnes', 15.00, 25, 18.5, true),
('Warnes', 'Satélite Norte', 20.00, 35, 28.0, true),
('Satélite Norte', 'Warnes', 20.00, 35, 28.0, true),
('Montero', 'Satélite Norte', 15.00, 20, 12.0, true),
('Satélite Norte', 'Montero', 15.00, 20, 12.0, true),
('Warnes', '27 de Noviembre', 10.00, 15, 10.0, true),
('27 de Noviembre', 'Warnes', 10.00, 15, 10.0, true)
ON CONFLICT (origen, destino) DO UPDATE SET
    precio_base = EXCLUDED.precio_base,
    duracion_estimada = EXCLUDED.duracion_estimada,
    distancia_km = EXCLUDED.distancia_km,
    activa = EXCLUDED.activa;

-- Insertar viajes de ejemplo
INSERT INTO public.viajes (id, conductor_id, pasajero_id, origen, destino, fecha_viaje, precio, asientos, estado, distancia_km, duracion_minutos) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Warnes', 'Montero', '2024-01-15 14:30:00+00', 15.00, 1, 'completado', 18.5, 25),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'Montero', 'Satélite Norte', '2024-01-16 09:00:00+00', 15.00, 1, 'completado', 12.0, 20),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Satélite Norte', 'Warnes', '2024-01-16 16:00:00+00', 20.00, 1, 'en_curso', 28.0, 35)
ON CONFLICT (id) DO UPDATE SET
    conductor_id = EXCLUDED.conductor_id,
    pasajero_id = EXCLUDED.pasajero_id,
    origen = EXCLUDED.origen,
    destino = EXCLUDED.destino,
    fecha_viaje = EXCLUDED.fecha_viaje,
    precio = EXCLUDED.precio,
    asientos = EXCLUDED.asientos,
    estado = EXCLUDED.estado,
    distancia_km = EXCLUDED.distancia_km,
    duracion_minutos = EXCLUDED.duracion_minutos;

-- Insertar pagos de ejemplo
INSERT INTO public.pagos (id, viaje_id, pasajero_id, conductor_id, monto, metodo, estado, comision) VALUES
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 15.00, 'Efectivo', 'completado', 1.50),
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 15.00, 'QR', 'pendiente', 1.50)
ON CONFLICT (id) DO UPDATE SET
    viaje_id = EXCLUDED.viaje_id,
    pasajero_id = EXCLUDED.pasajero_id,
    conductor_id = EXCLUDED.conductor_id,
    monto = EXCLUDED.monto,
    metodo = EXCLUDED.metodo,
    estado = EXCLUDED.estado,
    comision = EXCLUDED.comision;

-- Insertar comprobantes de ejemplo
INSERT INTO public.comprobantes (id, pago_id, numero_comprobante, qr_data, verificado) VALUES
('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002', 'COMP-20240116-0001', 'QR_DATA_EXAMPLE_123', false)
ON CONFLICT (id) DO UPDATE SET
    pago_id = EXCLUDED.pago_id,
    numero_comprobante = EXCLUDED.numero_comprobante,
    qr_data = EXCLUDED.qr_data,
    verificado = EXCLUDED.verificado;

-- Insertar calificaciones de ejemplo
INSERT INTO public.calificaciones (id, viaje_id, pasajero_id, conductor_id, rating_general, rating_puntualidad, rating_vehiculo, rating_conduccion, rating_amabilidad, comentario, recomendaria) VALUES
('990e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 5, 5, 5, 5, 5, 'Excelente conductor, muy puntual y amable. El vehículo estaba limpio y cómodo.', true),
('990e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 4, 5, 3, 4, 4, 'Buen viaje, llegó a tiempo. Solo el aire acondicionado no funcionaba muy bien.', true)
ON CONFLICT (id) DO UPDATE SET
    viaje_id = EXCLUDED.viaje_id,
    pasajero_id = EXCLUDED.pasajero_id,
    conductor_id = EXCLUDED.conductor_id,
    rating_general = EXCLUDED.rating_general,
    rating_puntualidad = EXCLUDED.rating_puntualidad,
    rating_vehiculo = EXCLUDED.rating_vehiculo,
    rating_conduccion = EXCLUDED.rating_conduccion,
    rating_amabilidad = EXCLUDED.rating_amabilidad,
    comentario = EXCLUDED.comentario,
    recomendaria = EXCLUDED.recomendaria;

-- Insertar respuestas de conductores
INSERT INTO public.respuestas_calificaciones (id, calificacion_id, conductor_id, respuesta) VALUES
('a10e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '¡Muchas gracias Ana! Siempre trato de brindar el mejor servicio.')
ON CONFLICT (id) DO UPDATE SET
    calificacion_id = EXCLUDED.calificacion_id,
    conductor_id = EXCLUDED.conductor_id,
    respuesta = EXCLUDED.respuesta;

-- Insertar badges predefinidos
INSERT INTO public.badges (id, nombre, descripcion, icono, criterio) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', 'Súper Puntual', '95% de puntualidad en los viajes', '⏰', '{"tipo": "puntualidad", "minimo": 95}'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', 'Vehículo Impecable', 'Calificación promedio de vehículo > 4.5', '✨', '{"tipo": "rating_vehiculo", "minimo": 4.5}'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b03', 'Conductor Amigable', 'Calificación promedio de amabilidad > 4.7', '😊', '{"tipo": "rating_amabilidad", "minimo": 4.7}'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b04', 'Conductor Seguro', 'Cero accidentes registrados', '🛡️', '{"tipo": "accidentes", "maximo": 0}'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', 'Veterano', 'Más de 1000 viajes completados', '🏆', '{"tipo": "viajes_completados", "minimo": 1000}'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b06', 'Estrella Dorada', 'Calificación general > 4.8', '⭐', '{"tipo": "rating_general", "minimo": 4.8}')
ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    icono = EXCLUDED.icono,
    criterio = EXCLUDED.criterio;

-- Insertar logros predefinidos
INSERT INTO public.logros (id, nombre, descripcion, icono, criterio, puntos) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01', 'Primer Viaje', 'Completa tu primer viaje como conductor', 'trophy', '{"tipo": "viajes_completados", "objetivo": 1}', 10),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c02', '100 Viajes', 'Completa 100 viajes exitosos', 'trophy', '{"tipo": "viajes_completados", "objetivo": 100}', 100),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c03', '500 Viajes', 'Completa 500 viajes exitosos', 'medal', '{"tipo": "viajes_completados", "objetivo": 500}', 250),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c04', '1000 Viajes', 'Completa 1000 viajes exitosos', 'award', '{"tipo": "viajes_completados", "objetivo": 1000}', 500),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c05', 'Calificación 4.8+', 'Mantén una calificación promedio de 4.8 o superior', 'star', '{"tipo": "rating_promedio", "objetivo": 4.8}', 200),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c06', 'Mes Perfecto', 'Completa un mes con calificación 5.0', 'star', '{"tipo": "mes_perfecto", "objetivo": 5.0}', 300),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c07', 'Maratonista', 'Completa 2000 viajes', 'medal', '{"tipo": "viajes_completados", "objetivo": 2000}', 1000)
ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    icono = EXCLUDED.icono,
    criterio = EXCLUDED.criterio,
    puntos = EXCLUDED.puntos;
