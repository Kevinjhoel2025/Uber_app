-- Tabla para comprobantes de pago
CREATE TABLE public.comprobantes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pago_id UUID REFERENCES public.pagos(id) NOT NULL,
  numero_comprobante VARCHAR(50) UNIQUE NOT NULL,
  qr_data TEXT,
  url_comprobante TEXT,
  verificado BOOLEAN DEFAULT false,
  fecha_verificacion TIMESTAMP WITH TIME ZONE,
  verificado_por UUID REFERENCES public.usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para solicitudes especiales
CREATE TABLE public.solicitudes_especiales (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pasajero_id UUID REFERENCES public.usuarios(id) NOT NULL,
  destino VARCHAR(100) NOT NULL,
  fecha_viaje TIMESTAMP WITH TIME ZONE NOT NULL,
  pasajeros INTEGER DEFAULT 1,
  comentarios TEXT,
  estado VARCHAR(20) CHECK (estado IN ('pendiente', 'asignado', 'confirmado', 'completado', 'cancelado')) DEFAULT 'pendiente',
  conductor_asignado UUID REFERENCES public.conductores(id),
  precio_estimado DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para retiros de conductores
CREATE TABLE public.retiros (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conductor_id UUID REFERENCES public.conductores(id) NOT NULL,
  monto DECIMAL(10, 2) NOT NULL,
  metodo VARCHAR(50) NOT NULL,
  datos_metodo JSONB, -- Número de cuenta, teléfono, etc.
  estado VARCHAR(20) CHECK (estado IN ('pendiente', 'procesando', 'completado', 'rechazado')) DEFAULT 'pendiente',
  procesado_por UUID REFERENCES public.usuarios(id),
  fecha_procesado TIMESTAMP WITH TIME ZONE,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_comprobantes_pago ON public.comprobantes(pago_id);
CREATE INDEX idx_solicitudes_pasajero ON public.solicitudes_especiales(pasajero_id);
CREATE INDEX idx_solicitudes_estado ON public.solicitudes_especiales(estado);
CREATE INDEX idx_retiros_conductor ON public.retiros(conductor_id);
CREATE INDEX idx_retiros_estado ON public.retiros(estado);

-- Triggers
CREATE TRIGGER update_solicitudes_especiales_updated_at BEFORE UPDATE ON public.solicitudes_especiales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_retiros_updated_at BEFORE UPDATE ON public.retiros FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS
ALTER TABLE public.comprobantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitudes_especiales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retiros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver sus comprobantes" ON public.comprobantes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.pagos p 
            WHERE p.id = pago_id AND (p.pasajero_id = auth.uid() OR p.conductor_id = auth.uid())
        ) OR
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'secretaria'
        )
    );

CREATE POLICY "Los usuarios pueden ver sus solicitudes especiales" ON public.solicitudes_especiales
    FOR SELECT USING (
        auth.uid() = pasajero_id OR
        auth.uid() = conductor_asignado OR
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'secretaria'
        )
    );

CREATE POLICY "Los usuarios pueden crear solicitudes especiales" ON public.solicitudes_especiales
    FOR INSERT WITH CHECK (auth.uid() = pasajero_id);

CREATE POLICY "Los conductores pueden ver sus retiros" ON public.retiros
    FOR SELECT USING (
        auth.uid() = conductor_id OR
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'secretaria'
        )
    );

CREATE POLICY "Los conductores pueden crear retiros" ON public.retiros
    FOR INSERT WITH CHECK (auth.uid() = conductor_id);

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

-- Insertar comprobantes de ejemplo
INSERT INTO public.comprobantes (pago_id, numero_comprobante, qr_data, verificado) VALUES
((SELECT id FROM public.pagos WHERE metodo = 'QR' LIMIT 1), generar_numero_comprobante(), 'QR_DATA_EXAMPLE_123', true);
