-- Este script ya fue ejecutado y sus datos están en 01-create-tables.sql y 02-insert-sample-data.sql
-- No es necesario ejecutarlo de nuevo si ya se hizo.
-- Se mantiene aquí para referencia de lo que se añadió.

-- Crear tabla de solicitudes especiales
CREATE TABLE IF NOT EXISTS public.solicitudes_especiales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pasajero_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    destino TEXT NOT NULL,
    fecha_viaje TIMESTAMPTZ NOT NULL,
    pasajeros INTEGER NOT NULL DEFAULT 1,
    comentarios TEXT,
    estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'asignado', 'confirmado', 'completado', 'cancelado')),
    conductor_asignado UUID REFERENCES public.conductores(id),
    precio_estimado DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear tabla de retiros
CREATE TABLE IF NOT EXISTS public.retiros (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conductor_id UUID REFERENCES public.conductores(id) ON DELETE CASCADE,
    monto DECIMAL(10,2) NOT NULL,
    metodo TEXT NOT NULL,
    datos_metodo JSONB,
    estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'procesando', 'completado', 'rechazado')),
    procesado_por UUID REFERENCES public.usuarios(id),
    fecha_procesado TIMESTAMPTZ,
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear tabla de rutas
CREATE TABLE IF NOT EXISTS public.rutas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    origen TEXT NOT NULL,
    destino TEXT NOT NULL,
    precio_base DECIMAL(10,2) NOT NULL,
    duracion_estimada INTEGER, -- en minutos
    distancia_km DECIMAL(8,2),
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(origen, destino)
);

-- Crear tabla de ubicaciones
CREATE TABLE IF NOT EXISTS public.ubicaciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT UNIQUE NOT NULL,
    latitud DECIMAL(10,8) NOT NULL,
    longitud DECIMAL(11,8) NOT NULL,
    tipo TEXT DEFAULT 'parada' CHECK (tipo IN ('parada', 'terminal', 'punto_referencia')),
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_solicitudes_pasajero ON public.solicitudes_especiales(pasajero_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON public.solicitudes_especiales(estado);
CREATE INDEX IF NOT EXISTS idx_retiros_conductor ON public.retiros(conductor_id);
CREATE INDEX IF NOT EXISTS idx_retiros_estado ON public.retiros(estado);
CREATE INDEX IF NOT EXISTS idx_rutas_origen_destino ON public.rutas(origen, destino);

-- Habilitar RLS
ALTER TABLE public.solicitudes_especiales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rutas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ubicaciones ENABLE ROW LEVEL SECURITY;

-- Políticas para solicitudes especiales
CREATE POLICY "Los usuarios pueden ver sus solicitudes" ON public.solicitudes_especiales
    FOR SELECT USING (
        pasajero_id = auth.uid() OR
        conductor_asignado = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'secretaria'
        )
    );

CREATE POLICY "Los usuarios pueden crear solicitudes" ON public.solicitudes_especiales
    FOR INSERT WITH CHECK (pasajero_id = auth.uid());

-- Políticas para retiros
CREATE POLICY "Los conductores pueden ver sus retiros" ON public.retiros
    FOR SELECT USING (
        conductor_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'secretaria'
        )
    );

CREATE POLICY "Los conductores pueden crear retiros" ON public.retiros
    FOR INSERT WITH CHECK (conductor_id = auth.uid());

-- Políticas para rutas (públicas)
CREATE POLICY "Todos pueden ver rutas activas" ON public.rutas
    FOR SELECT USING (activa = true);

-- Políticas para ubicaciones (públicas)
CREATE POLICY "Todos pueden ver ubicaciones activas" ON public.ubicaciones
    FOR SELECT USING (activa = true);
