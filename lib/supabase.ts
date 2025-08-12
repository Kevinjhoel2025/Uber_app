import { createClient } from "@supabase/supabase-js"

// Asegúrate de que estas variables de entorno estén configuradas en tu .env.local
// y en Vercel para el despliegue.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Definiciones de tipos para las tablas de tu base de datos
export type Usuario = {
  id: string
  nombre: string
  telefono?: string
  email?: string
  tipo_usuario: "usuario" | "conductor" | "secretaria"
  fecha_registro: string
  activo: boolean
  avatar_url?: string
  created_at: string
  updated_at: string
}

export type Conductor = {
  id: string
  vehiculo?: string
  placa?: string
  capacidad?: number
  codigo_conductor?: string
  fecha_ingreso: string
  estado: "disponible" | "en_viaje" | "fuera_servicio"
  ubicacion_lat?: number
  ubicacion_lng?: number
  ultima_ubicacion?: string
  created_at: string
  updated_at: string
  usuario?: Usuario // Para joins
}

export type Ruta = {
  id: string
  origen: string
  destino: string
  precio_base: number
  duracion_estimada?: number
  distancia_km?: number
  activa: boolean
  created_at: string
  updated_at: string
}

export type Ubicacion = {
  id: string
  nombre: string
  latitud: number
  longitud: number
  tipo: "parada" | "terminal" | "punto_referencia"
  activa: boolean
  created_at: string
  updated_at: string
}

export type Viaje = {
  id: string
  conductor_id?: string
  pasajero_id: string
  origen: string
  destino: string
  fecha_viaje: string
  precio: number
  asientos: number
  estado: "pendiente" | "confirmado" | "en_curso" | "completado" | "cancelado"
  distancia_km?: number
  duracion_minutos?: number
  created_at: string
  updated_at: string
  conductor?: Conductor // Para joins
  pasajero?: Usuario // Para joins
}

export type Pago = {
  id: string
  viaje_id: string
  pasajero_id: string
  conductor_id: string
  monto: number
  metodo: string
  estado: "pendiente" | "completado" | "fallido" | "reembolsado"
  referencia_externa?: string
  comision?: number
  created_at: string
  updated_at: string
  viaje?: Viaje
  pasajero?: Usuario
  conductor?: Conductor
}

export type Comprobante = {
  id: string
  pago_id: string
  numero_comprobante: string
  qr_data?: string
  url_comprobante?: string
  verificado: boolean
  fecha_verificacion?: string
  verificado_por?: string
  created_at: string
  updated_at: string
  pago?: Pago // Para joins
  verificador?: Usuario // Para joins
}

export type Calificacion = {
  id: string
  viaje_id: string
  pasajero_id: string
  conductor_id: string
  rating_general: number
  rating_puntualidad?: number
  rating_vehiculo?: number
  rating_conduccion?: number
  rating_amabilidad?: number
  comentario?: string
  recomendaria?: boolean
  verificado: boolean
  created_at: string
  updated_at: string
  viaje?: Viaje
  pasajero?: Usuario
  conductor?: Conductor
  respuesta?: RespuestaCalificacion
}

export type RespuestaCalificacion = {
  id: string
  calificacion_id: string
  conductor_id: string
  respuesta: string
  created_at: string
  updated_at: string
}

export type Badge = {
  id: string
  nombre: string
  descripcion?: string
  icono?: string
  criterio?: any // JSONB
  activo: boolean
  created_at: string
  updated_at: string
}

export type ConductorBadge = {
  id: string
  conductor_id: string
  badge_id: string
  fecha_obtenido: string
  created_at: string
  updated_at: string
  badge?: Badge // Para joins
}

export type Logro = {
  id: string
  nombre: string
  descripcion?: string
  icon?: string
  criterio?: any // JSONB
  puntos: number
  activo: boolean
  created_at: string
  updated_at: string
}

export type ConductorLogro = {
  id: string
  conductor_id: string
  logro_id: string
  fecha_obtenido: string
  progreso?: any // JSONB
  created_at: string
  updated_at: string
  logro?: Logro // Para joins
}

export type SolicitudEspecial = {
  id: string
  pasajero_id: string
  destino: string
  fecha_viaje: string
  pasajeros: number
  comentarios?: string
  estado: "pendiente" | "asignado" | "confirmado" | "completado" | "cancelado"
  conductor_asignado?: string
  precio_estimado?: number
  created_at: string
  updated_at: string
  pasajero?: Usuario
  conductor?: Conductor
}

export type Retiro = {
  id: string
  conductor_id: string
  monto: number
  metodo: string
  datos_metodo: any // JSONB
  estado: "pendiente" | "procesando" | "completado" | "rechazado"
  procesado_por?: string
  fecha_procesado?: string
  notas?: string
  created_at: string
  updated_at: string
  conductor?: Conductor
  procesador?: Usuario
}

export type Mensaje = {
  id: string
  remitente_id?: string
  destinatario_id?: string
  tipo: "individual" | "grupal" | "broadcast"
  mensaje: string
  leido: boolean
  created_at: string
  updated_at: string
  remitente?: Usuario
  destinatario?: Usuario
}

export type EstadisticasConductor = {
  total_viajes: number
  rating_promedio: number
  total_calificaciones: number
  rating_puntualidad: number
  rating_vehiculo: number
  rating_conduccion: number
  rating_amabilidad: number
  recomendaciones_porcentaje: number
  distribucion_ratings: {
    "5": number
    "4": number
    "3": number
    "2": number
    "1": number
  }
}
