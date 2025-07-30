-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios (extiende auth.users de Supabase)
CREATE TABLE public.usuarios (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  telefono VARCHAR(20),
  email VARCHAR(100),
  tipo_usuario VARCHAR(20) CHECK (tipo_usuario IN ('usuario', 'conductor', 'secretaria')) NOT NULL,
  fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  activo BOOLEAN DEFAULT true,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de conductores (información adicional)
CREATE TABLE public.conductores (
  id UUID REFERENCES public.usuarios(id) PRIMARY KEY,
  vehiculo VARCHAR(100) NOT NULL,
  placa VARCHAR(20) UNIQUE NOT NULL,
  capacidad INTEGER DEFAULT 12,
  codigo_conductor VARCHAR(50) UNIQUE NOT NULL,
  fecha_ingreso DATE DEFAULT CURRENT_DATE,
  estado VARCHAR(20) CHECK (estado IN ('disponible', 'en_viaje', 'fuera_servicio')) DEFAULT 'disponible',
  ubicacion_lat DECIMAL(10, 8),
  ubicacion_lng DECIMAL(11, 8),
  ultima_ubicacion TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de viajes
CREATE TABLE public.viajes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conductor_id UUID REFERENCES public.conductores(id) NOT NULL,
  pasajero_id UUID REFERENCES public.usuarios(id) NOT NULL,
  origen VARCHAR(100) NOT NULL,
  destino VARCHAR(100) NOT NULL,
  fecha_viaje TIMESTAMP WITH TIME ZONE NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,
  asientos INTEGER DEFAULT 1,
  estado VARCHAR(20) CHECK (estado IN ('pendiente', 'confirmado', 'en_curso', 'completado', 'cancelado')) DEFAULT 'pendiente',
  distancia_km DECIMAL(8, 2),
  duracion_minutos INTEGER,
  metodo_pago VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de calificaciones
CREATE TABLE public.calificaciones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  viaje_id UUID REFERENCES public.viajes(id) NOT NULL,
  pasajero_id UUID REFERENCES public.usuarios(id) NOT NULL,
  conductor_id UUID REFERENCES public.conductores(id) NOT NULL,
  rating_general INTEGER CHECK (rating_general >= 1 AND rating_general <= 5) NOT NULL,
  rating_puntualidad INTEGER CHECK (rating_puntualidad >= 1 AND rating_puntualidad <= 5),
  rating_vehiculo INTEGER CHECK (rating_vehiculo >= 1 AND rating_vehiculo <= 5),
  rating_conduccion INTEGER CHECK (rating_conduccion >= 1 AND rating_conduccion <= 5),
  rating_amabilidad INTEGER CHECK (rating_amabilidad >= 1 AND rating_amabilidad <= 5),
  comentario TEXT,
  recomendaria BOOLEAN,
  verificado BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(viaje_id, pasajero_id)
);

-- Tabla de respuestas de conductores a calificaciones
CREATE TABLE public.respuestas_calificaciones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  calificacion_id UUID REFERENCES public.calificaciones(id) NOT NULL,
  conductor_id UUID REFERENCES public.conductores(id) NOT NULL,
  respuesta TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(calificacion_id)
);

-- Tabla de badges/insignias
CREATE TABLE public.badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  icono VARCHAR(10),
  criterio JSONB, -- Criterios para obtener el badge
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de badges obtenidos por conductores
CREATE TABLE public.conductor_badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conductor_id UUID REFERENCES public.conductores(id) NOT NULL,
  badge_id UUID REFERENCES public.badges(id) NOT NULL,
  fecha_obtenido TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conductor_id, badge_id)
);

-- Tabla de logros
CREATE TABLE public.logros (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  icono VARCHAR(50),
  criterio JSONB,
  puntos INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de logros obtenidos por conductores
CREATE TABLE public.conductor_logros (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conductor_id UUID REFERENCES public.conductores(id) NOT NULL,
  logro_id UUID REFERENCES public.logros(id) NOT NULL,
  fecha_obtenido TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progreso JSONB, -- Para logros con progreso
  UNIQUE(conductor_id, logro_id)
);

-- Tabla de pagos
CREATE TABLE public.pagos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  viaje_id UUID REFERENCES public.viajes(id) NOT NULL,
  pasajero_id UUID REFERENCES public.usuarios(id) NOT NULL,
  conductor_id UUID REFERENCES public.conductores(id) NOT NULL,
  monto DECIMAL(10, 2) NOT NULL,
  metodo VARCHAR(50) NOT NULL,
  estado VARCHAR(20) CHECK (estado IN ('pendiente', 'completado', 'fallido', 'reembolsado')) DEFAULT 'pendiente',
  referencia_externa VARCHAR(100),
  comision DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de mensajes
CREATE TABLE public.mensajes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  remitente_id UUID REFERENCES public.usuarios(id) NOT NULL,
  destinatario_id UUID REFERENCES public.usuarios(id),
  tipo VARCHAR(20) CHECK (tipo IN ('individual', 'grupal', 'broadcast')) DEFAULT 'individual',
  mensaje TEXT NOT NULL,
  leido BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_calificaciones_conductor ON public.calificaciones(conductor_id);
CREATE INDEX idx_calificaciones_viaje ON public.calificaciones(viaje_id);
CREATE INDEX idx_viajes_conductor ON public.viajes(conductor_id);
CREATE INDEX idx_viajes_pasajero ON public.viajes(pasajero_id);
CREATE INDEX idx_viajes_fecha ON public.viajes(fecha_viaje);
CREATE INDEX idx_conductores_estado ON public.conductores(estado);
CREATE INDEX idx_mensajes_destinatario ON public.mensajes(destinatario_id);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON public.usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conductores_updated_at BEFORE UPDATE ON public.conductores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_viajes_updated_at BEFORE UPDATE ON public.viajes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calificaciones_updated_at BEFORE UPDATE ON public.calificaciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pagos_updated_at BEFORE UPDATE ON public.pagos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
