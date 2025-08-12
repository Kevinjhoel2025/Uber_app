-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios (extiende auth.users de Supabase)
CREATE TABLE public.usuarios (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
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
    id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE PRIMARY KEY,
    vehiculo VARCHAR(100),
    placa VARCHAR(20) UNIQUE,
    capacidad INTEGER DEFAULT 12,
    codigo_conductor VARCHAR(50) UNIQUE,
    fecha_ingreso DATE DEFAULT CURRENT_DATE,
    estado VARCHAR(20) CHECK (estado IN ('disponible', 'en_viaje', 'fuera_servicio')) DEFAULT 'disponible',
    ubicacion_lat DECIMAL(10, 8),
    ubicacion_lng DECIMAL(11, 8),
    ultima_ubicacion TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de rutas
CREATE TABLE public.rutas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    origen VARCHAR(100) NOT NULL,
    destino VARCHAR(100) NOT NULL,
    precio_base DECIMAL(10, 2) NOT NULL,
    duracion_estimada INTEGER, -- en minutos
    distancia_km DECIMAL(8, 2),
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(origen, destino)
);

-- Tabla de ubicaciones
CREATE TABLE public.ubicaciones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    latitud DECIMAL(10, 8) NOT NULL,
    longitud DECIMAL(11, 8) NOT NULL,
    tipo VARCHAR(20) CHECK (tipo IN ('parada', 'terminal', 'punto_referencia')) DEFAULT 'parada',
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de viajes
CREATE TABLE public.viajes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conductor_id UUID REFERENCES public.conductores(id) ON DELETE SET NULL,
    pasajero_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
    origen VARCHAR(100) NOT NULL,
    destino VARCHAR(100) NOT NULL,
    fecha_viaje TIMESTAMP WITH TIME ZONE NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    asientos INTEGER DEFAULT 1,
    estado VARCHAR(20) CHECK (estado IN ('pendiente', 'confirmado', 'en_curso', 'completado', 'cancelado')) DEFAULT 'pendiente',
    distancia_km DECIMAL(8, 2),
    duracion_minutos INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de pagos
CREATE TABLE public.pagos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    viaje_id UUID REFERENCES public.viajes(id) ON DELETE CASCADE NOT NULL,
    pasajero_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
    conductor_id UUID REFERENCES public.conductores(id) ON DELETE CASCADE NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    metodo VARCHAR(50) NOT NULL,
    estado VARCHAR(20) CHECK (estado IN ('pendiente', 'completado', 'fallido', 'reembolsado')) DEFAULT 'pendiente',
    referencia_externa VARCHAR(100),
    comision DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de comprobantes de pago
CREATE TABLE public.comprobantes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    pago_id UUID REFERENCES public.pagos(id) ON DELETE CASCADE NOT NULL,
    numero_comprobante VARCHAR(50) UNIQUE NOT NULL,
    qr_data TEXT,
    url_comprobante TEXT,
    verificado BOOLEAN DEFAULT false,
    fecha_verificacion TIMESTAMP WITH TIME ZONE,
    verificado_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de calificaciones
CREATE TABLE public.calificaciones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    viaje_id UUID REFERENCES public.viajes(id) ON DELETE CASCADE NOT NULL,
    pasajero_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
    conductor_id UUID REFERENCES public.conductores(id) ON DELETE CASCADE NOT NULL,
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
    calificacion_id UUID REFERENCES public.calificaciones(id) ON DELETE CASCADE NOT NULL,
    conductor_id UUID REFERENCES public.conductores(id) ON DELETE CASCADE NOT NULL,
    respuesta TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de badges obtenidos por conductores
CREATE TABLE public.conductor_badges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conductor_id UUID REFERENCES public.conductores(id) ON DELETE CASCADE NOT NULL,
    badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
    fecha_obtenido TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de logros obtenidos por conductores
CREATE TABLE public.conductor_logros (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conductor_id UUID REFERENCES public.conductores(id) ON DELETE CASCADE NOT NULL,
    logro_id UUID REFERENCES public.logros(id) ON DELETE CASCADE NOT NULL,
    fecha_obtenido TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progreso JSONB, -- Para logros con progreso
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(conductor_id, logro_id)
);

-- Tabla de solicitudes especiales
CREATE TABLE public.solicitudes_especiales (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    pasajero_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
    destino VARCHAR(100) NOT NULL,
    fecha_viaje TIMESTAMP WITH TIME ZONE NOT NULL,
    pasajeros INTEGER DEFAULT 1,
    comentarios TEXT,
    estado VARCHAR(20) CHECK (estado IN ('pendiente', 'asignado', 'confirmado', 'completado', 'cancelado')) DEFAULT 'pendiente',
    conductor_asignado UUID REFERENCES public.conductores(id) ON DELETE SET NULL,
    precio_estimado DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de retiros de conductores
CREATE TABLE public.retiros (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conductor_id UUID REFERENCES public.conductores(id) ON DELETE CASCADE NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    metodo VARCHAR(50) NOT NULL,
    datos_metodo JSONB, -- Número de cuenta, teléfono, etc.
    estado VARCHAR(20) CHECK (estado IN ('pendiente', 'procesando', 'completado', 'rechazado')) DEFAULT 'pendiente',
    procesado_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    fecha_procesado TIMESTAMP WITH TIME ZONE,
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de mensajes
CREATE TABLE public.mensajes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    remitente_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    destinatario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    tipo VARCHAR(20) CHECK (tipo IN ('individual', 'grupal', 'broadcast')) DEFAULT 'individual',
    mensaje TEXT NOT NULL,
    leido BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
