import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos TypeScript para las tablas
export interface Usuario {
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

export interface Conductor {
  id: string
  vehiculo: string
  placa: string
  capacidad: number
  codigo_conductor: string
  fecha_ingreso: string
  estado: "disponible" | "en_viaje" | "fuera_servicio"
  ubicacion_lat?: number
  ubicacion_lng?: number
  ultima_ubicacion?: string
  created_at: string
  updated_at: string
  usuario?: Usuario
}

export interface Viaje {
  id: string
  conductor_id: string
  pasajero_id: string
  origen: string
  destino: string
  fecha_viaje: string
  precio: number
  asientos: number
  estado: "pendiente" | "confirmado" | "en_curso" | "completado" | "cancelado"
  distancia_km?: number
  duracion_minutos?: number
  metodo_pago?: string
  created_at: string
  updated_at: string
  conductor?: Conductor
  pasajero?: Usuario
}

export interface Calificacion {
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

export interface RespuestaCalificacion {
  id: string
  calificacion_id: string
  conductor_id: string
  respuesta: string
  created_at: string
}

export interface Badge {
  id: string
  nombre: string
  descripcion?: string
  icono?: string
  criterio: any
  activo: boolean
  created_at: string
}

export interface ConductorBadge {
  id: string
  conductor_id: string
  badge_id: string
  fecha_obtenido: string
  badge?: Badge
}

export interface Logro {
  id: string
  nombre: string
  descripcion?: string
  icono?: string
  criterio: any
  puntos: number
  activo: boolean
  created_at: string
}

export interface ConductorLogro {
  id: string
  conductor_id: string
  logro_id: string
  fecha_obtenido: string
  progreso?: any
  logro?: Logro
}

export interface EstadisticasConductor {
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
