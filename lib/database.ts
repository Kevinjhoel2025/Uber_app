import { supabase } from "./supabase"
import type {
  Usuario,
  Conductor,
  Viaje,
  Calificacion,
  RespuestaCalificacion,
  ConductorBadge,
  ConductorLogro,
  EstadisticasConductor,
  Comprobante,
  SolicitudEspecial,
  Retiro,
  Ruta,
  Ubicacion,
  Pago,
  Mensaje,
} from "./supabase"

// Funciones para Usuarios
export const obtenerUsuario = async (id: string): Promise<Usuario | null> => {
  const { data, error } = await supabase.from("usuarios").select("*").eq("id", id).single()

  if (error) {
    console.error("Error obteniendo usuario:", error)
    return null
  }

  return data
}

export const crearUsuario = async (
  usuario: Omit<Usuario, "id" | "created_at" | "updated_at" | "fecha_registro" | "activo">,
): Promise<Usuario | null> => {
  const { data, error } = await supabase.from("usuarios").insert(usuario).select().single()

  if (error) {
    console.error("Error creando usuario:", error)
    return null
  }

  return data
}

export const actualizarUsuario = async (id: string, datos: Partial<Usuario>): Promise<Usuario | null> => {
  const { data, error } = await supabase.from("usuarios").update(datos).eq("id", id).select().single()

  if (error) {
    console.error("Error actualizando usuario:", error)
    return null
  }

  return data
}

// Funciones para Conductores
export const obtenerConductor = async (id: string): Promise<Conductor | null> => {
  const { data, error } = await supabase
    .from("conductores")
    .select(
      `
      *,
      usuario:usuarios(*)
    `,
    )
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error obteniendo conductor:", error)
    return null
  }

  return data
}

export const obtenerConductoresActivos = async (): Promise<Conductor[]> => {
  const { data, error } = await supabase
    .from("conductores")
    .select(
      `
      *,
      usuario:usuarios(*)
    `,
    )
    .eq("estado", "disponible")
    .order("ultima_ubicacion", { ascending: false })

  if (error) {
    console.error("Error obteniendo conductores activos:", error)
    return []
  }

  return data || []
}

export const actualizarUbicacionConductor = async (conductorId: string, lat: number, lng: number): Promise<boolean> => {
  const { error } = await supabase
    .from("conductores")
    .update({
      ubicacion_lat: lat,
      ubicacion_lng: lng,
      ultima_ubicacion: new Date().toISOString(),
    })
    .eq("id", conductorId)

  if (error) {
    console.error("Error actualizando ubicación:", error)
    return false
  }

  return true
}

export const actualizarEstadoConductor = async (
  conductorId: string,
  estado: "disponible" | "en_viaje" | "fuera_servicio",
): Promise<boolean> => {
  const { error } = await supabase.from("conductores").update({ estado }).eq("id", conductorId)

  if (error) {
    console.error("Error actualizando estado conductor:", error)
    return false
  }

  return true
}

// Funciones para Rutas
export const obtenerRutas = async (): Promise<Ruta[]> => {
  const { data, error } = await supabase
    .from("rutas")
    .select("*")
    .eq("activa", true)
    .order("origen", { ascending: true })

  if (error) {
    console.error("Error obteniendo rutas:", error)
    return []
  }

  return data || []
}

export const obtenerPrecioRuta = async (origen: string, destino: string): Promise<number | null> => {
  const { data, error } = await supabase
    .from("rutas")
    .select("precio_base")
    .eq("origen", origen)
    .eq("destino", destino)
    .eq("activa", true)
    .single()

  if (error) {
    console.error("Error obteniendo precio de ruta:", error)
    return null
  }

  return data?.precio_base || null
}

// Funciones para Ubicaciones
export const obtenerUbicaciones = async (): Promise<Ubicacion[]> => {
  const { data, error } = await supabase
    .from("ubicaciones")
    .select("*")
    .eq("activa", true)
    .order("nombre", { ascending: true })

  if (error) {
    console.error("Error obteniendo ubicaciones:", error)
    return []
  }

  return data || []
}

// Funciones para Viajes
export const crearViaje = async (
  viaje: Omit<Viaje, "id" | "created_at" | "updated_at" | "estado">,
): Promise<Viaje | null> => {
  const { data, error } = await supabase
    .from("viajes")
    .insert({ ...viaje, estado: "pendiente" })
    .select(
      `
      *,
      conductor:conductores(*),
      pasajero:usuarios(*)
    `,
    )
    .single()

  if (error) {
    console.error("Error creando viaje:", error)
    return null
  }

  return data
}

export const obtenerViajesUsuario = async (usuarioId: string): Promise<Viaje[]> => {
  const { data, error } = await supabase
    .from("viajes")
    .select(
      `
      *,
      conductor:conductores(
        *,
        usuario:usuarios(*)
      )
    `,
    )
    .eq("pasajero_id", usuarioId)
    .order("fecha_viaje", { ascending: false })

  if (error) {
    console.error("Error obteniendo viajes del usuario:", error)
    return []
  }

  return data || []
}

export const obtenerViajesConductor = async (conductorId: string): Promise<Viaje[]> => {
  const { data, error } = await supabase
    .from("viajes")
    .select(
      `
      *,
      pasajero:usuarios(*)
    `,
    )
    .eq("conductor_id", conductorId)
    .order("fecha_viaje", { ascending: false })

  if (error) {
    console.error("Error obteniendo viajes del conductor:", error)
    return []
  }

  return data || []
}

export const obtenerViajesHoyConductor = async (conductorId: string): Promise<Viaje[]> => {
  const today = new Date().toISOString().split("T")[0] // YYYY-MM-DD
  const { data, error } = await supabase
    .from("viajes")
    .select(
      `
      *,
      pasajero:usuarios(*)
    `,
    )
    .eq("conductor_id", conductorId)
    .gte("fecha_viaje", `${today}T00:00:00.000Z`)
    .lte("fecha_viaje", `${today}T23:59:59.999Z`)
    .order("fecha_viaje", { ascending: false })

  if (error) {
    console.error("Error obteniendo viajes de hoy del conductor:", error)
    return []
  }
  return data || []
}

export const actualizarEstadoViaje = async (
  viajeId: string,
  estado: "pendiente" | "confirmado" | "en_curso" | "completado" | "cancelado",
): Promise<boolean> => {
  const { error } = await supabase.from("viajes").update({ estado }).eq("id", viajeId)

  if (error) {
    console.error("Error actualizando estado del viaje:", error)
    return false
  }

  return true
}

// Funciones para Pagos
export const crearPago = async (
  pago: Omit<Pago, "id" | "created_at" | "updated_at" | "estado">,
): Promise<Pago | null> => {
  const { data, error } = await supabase
    .from("pagos")
    .insert({ ...pago, estado: "pendiente" })
    .select(
      `
      *,
      viaje:viajes(*),
      pasajero:usuarios(*),
      conductor:conductores(*)
    `,
    )
    .single()

  if (error) {
    console.error("Error creando pago:", error)
    return null
  }

  return data
}

export const obtenerPagosUsuario = async (usuarioId: string): Promise<Pago[]> => {
  const { data, error } = await supabase
    .from("pagos")
    .select(
      `
      *,
      viaje:viajes(origen, destino),
      conductor:conductores(usuario(nombre))
    `,
    )
    .eq("pasajero_id", usuarioId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error obteniendo pagos del usuario:", error)
    return []
  }
  return data || []
}

export const obtenerPagosConductor = async (conductorId: string): Promise<Pago[]> => {
  const { data, error } = await supabase
    .from("pagos")
    .select(
      `
      *,
      viaje:viajes(origen, destino),
      pasajero:usuarios(nombre)
    `,
    )
    .eq("conductor_id", conductorId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error obteniendo pagos del conductor:", error)
    return []
  }
  return data || []
}

export const obtenerTransaccionesSecretaria = async (): Promise<Pago[]> => {
  const { data, error } = await supabase
    .from("pagos")
    .select(
      `
      *,
      viaje:viajes(origen, destino),
      pasajero:usuarios(nombre),
      conductor:conductores(usuario(nombre))
    `,
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error obteniendo transacciones de secretaría:", error)
    return []
  }
  return data || []
}

export const actualizarEstadoPago = async (
  pagoId: string,
  estado: "pendiente" | "completado" | "fallido" | "reembolsado",
): Promise<Pago | null> => {
  const { data, error } = await supabase.from("pagos").update({ estado }).eq("id", pagoId).select().single()
  if (error) {
    console.error("Error actualizando estado de pago:", error)
    return null
  }
  return data
}

// Funciones para Comprobantes
export const crearComprobante = async (pagoId: string, qrData?: string): Promise<Comprobante | null> => {
  const { data: numeroData, error: numeroError } = await supabase.rpc("generar_numero_comprobante")

  if (numeroError) {
    console.error("Error generando número de comprobante:", numeroError)
    return null
  }

  const { data, error } = await supabase
    .from("comprobantes")
    .insert({
      pago_id: pagoId,
      numero_comprobante: numeroData,
      qr_data: qrData,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creando comprobante:", error)
    return null
  }

  return data
}

export const verificarComprobante = async (comprobanteId: string, verificadoPor: string): Promise<boolean> => {
  const { error } = await supabase
    .from("comprobantes")
    .update({
      verificado: true,
      fecha_verificacion: new Date().toISOString(),
      verificado_por: verificadoPor,
    })
    .eq("id", comprobanteId)

  if (error) {
    console.error("Error verificando comprobante:", error)
    return false
  }

  return true
}

export const obtenerComprobantePorPagoId = async (pagoId: string): Promise<Comprobante | null> => {
  const { data, error } = await supabase.from("comprobantes").select("*").eq("pago_id", pagoId).single()

  if (error) {
    console.error("Error obteniendo comprobante:", error)
    return null
  }

  return data
}

// Funciones para Calificaciones
export const crearCalificacion = async (
  calificacion: Omit<Calificacion, "id" | "created_at" | "updated_at" | "verificado">,
): Promise<Calificacion | null> => {
  const { data, error } = await supabase
    .from("calificaciones")
    .insert({ ...calificacion, verificado: true })
    .select(
      `
      *,
      viaje:viajes(*),
      pasajero:usuarios(*),
      conductor:conductores(
        *,
        usuario:usuarios(*)
      )
    `,
    )
    .single()

  if (error) {
    console.error("Error creando calificación:", error)
    return null
  }

  return data
}

export const obtenerCalificacionesConductor = async (conductorId: string): Promise<Calificacion[]> => {
  const { data, error } = await supabase
    .from("calificaciones")
    .select(
      `
      *,
      pasajero:usuarios(*),
      respuesta:respuestas_calificaciones(*)
    `,
    )
    .eq("conductor_id", conductorId)
    .eq("verificado", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error obteniendo calificaciones del conductor:", error)
    return []
  }

  return data || []
}

export const obtenerEstadisticasConductor = async (conductorId: string): Promise<EstadisticasConductor | null> => {
  const { data, error } = await supabase.rpc("obtener_estadisticas_conductor", { conductor_uuid: conductorId })

  if (error) {
    console.error("Error obteniendo estadísticas del conductor:", error)
    return null
  }

  // RPC devuelve un array de un solo objeto, o un objeto vacío si no hay datos
  return data && data.length > 0 ? data[0] : null
}

export const crearRespuestaCalificacion = async (
  calificacionId: string,
  conductorId: string,
  respuesta: string,
): Promise<RespuestaCalificacion | null> => {
  const { data, error } = await supabase
    .from("respuestas_calificaciones")
    .insert({
      calificacion_id: calificacionId,
      conductor_id: conductorId,
      respuesta,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creando respuesta:", error)
    return null
  }

  return data
}

// Funciones para Badges y Logros
export const obtenerBadgesConductor = async (conductorId: string): Promise<ConductorBadge[]> => {
  const { data, error } = await supabase
    .from("conductor_badges")
    .select(
      `
      *,
      badge:badges(*)
    `,
    )
    .eq("conductor_id", conductorId)
    .order("fecha_obtenido", { ascending: false })

  if (error) {
    console.error("Error obteniendo badges del conductor:", error)
    return []
  }

  return data || []
}

export const obtenerLogrosConductor = async (conductorId: string): Promise<ConductorLogro[]> => {
  const { data, error } = await supabase
    .from("conductor_logros")
    .select(
      `
      *,
      logro:logros(*)
    `,
    )
    .eq("conductor_id", conductorId)
    .order("fecha_obtenido", { ascending: false })

  if (error) {
    console.error("Error obteniendo logros del conductor:", error)
    return []
  }

  return data || []
}

export const obtenerRankingConductores = async (limite = 10) => {
  const { data, error } = await supabase.rpc("obtener_ranking_conductores", { limite })

  if (error) {
    console.error("Error obteniendo ranking de conductores:", error)
    return []
  }

  return data || []
}

// Funciones para Solicitudes Especiales
export const crearSolicitudEspecial = async (
  solicitud: Omit<SolicitudEspecial, "id" | "created_at" | "updated_at" | "estado">,
): Promise<SolicitudEspecial | null> => {
  const { data, error } = await supabase
    .from("solicitudes_especiales")
    .insert({ ...solicitud, estado: "pendiente" })
    .select(
      `
      *,
      pasajero:usuarios(*)
    `,
    )
    .single()

  if (error) {
    console.error("Error creando solicitud especial:", error)
    return null
  }

  return data
}

export const obtenerSolicitudesEspeciales = async (): Promise<SolicitudEspecial[]> => {
  const { data, error } = await supabase
    .from("solicitudes_especiales")
    .select(
      `
      *,
      pasajero:usuarios(*),
      conductor:conductores(
        *,
        usuario:usuarios(*)
      )
    `,
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error obteniendo solicitudes especiales:", error)
    return []
  }

  return data || []
}

export const asignarConductorSolicitud = async (
  solicitudId: string,
  conductorId: string,
  precioEstimado: number,
): Promise<boolean> => {
  const { error } = await supabase
    .from("solicitudes_especiales")
    .update({
      conductor_asignado: conductorId,
      precio_estimado: precioEstimado,
      estado: "asignado",
    })
    .eq("id", solicitudId)

  if (error) {
    console.error("Error asignando conductor a solicitud:", error)
    return false
  }

  return true
}

export const actualizarEstadoSolicitudEspecial = async (
  solicitudId: string,
  estado: "pendiente" | "asignado" | "confirmado" | "completado" | "cancelado",
): Promise<boolean> => {
  const { error } = await supabase.from("solicitudes_especiales").update({ estado }).eq("id", solicitudId)
  if (error) {
    console.error("Error actualizando estado de solicitud especial:", error)
    return false
  }
  return true
}

// Funciones para Retiros
export const crearRetiro = async (
  conductorId: string,
  monto: number,
  metodo: string,
  datosMetodo: any,
): Promise<Retiro | null> => {
  const { data, error } = await supabase
    .from("retiros")
    .insert({
      conductor_id: conductorId,
      monto,
      metodo,
      datos_metodo: datosMetodo,
    })
    .select(
      `
      *,
      conductor:conductores(
        *,
        usuario:usuarios(*)
      )
    `,
    )
    .single()

  if (error) {
    console.error("Error creando retiro:", error)
    return null
  }

  return data
}

export const obtenerRetirosConductor = async (conductorId: string): Promise<Retiro[]> => {
  const { data, error } = await supabase
    .from("retiros")
    .select("*")
    .eq("conductor_id", conductorId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error obteniendo retiros del conductor:", error)
    return []
  }

  return data || []
}

export const obtenerRetirosPendientes = async (): Promise<Retiro[]> => {
  const { data, error } = await supabase
    .from("retiros")
    .select(
      `
      *,
      conductor:conductores(
        *,
        usuario:usuarios(*)
      )
    `,
    )
    .eq("estado", "pendiente")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error obteniendo retiros pendientes:", error)
    return []
  }

  return data || []
}

export const procesarRetiro = async (
  retiroId: string,
  estado: "procesando" | "completado" | "rechazado",
  procesadoPor: string,
  notas?: string,
): Promise<boolean> => {
  const { error } = await supabase
    .from("retiros")
    .update({
      estado,
      procesado_por: procesadoPor,
      fecha_procesado: new Date().toISOString(),
      notas,
    })
    .eq("id", retiroId)

  if (error) {
    console.error("Error procesando retiro:", error)
    return false
  }

  return true
}

// Función para verificar si un usuario puede calificar un viaje
export const puedeCalificarViaje = async (viajeId: string, usuarioId: string): Promise<boolean> => {
  // Verificar que el viaje existe, está completado y el usuario fue pasajero
  const { data: viaje, error: viajeError } = await supabase
    .from("viajes")
    .select("*")
    .eq("id", viajeId)
    .eq("pasajero_id", usuarioId)
    .eq("estado", "completado")
    .single()

  if (viajeError || !viaje) {
    return false
  }

  // Verificar que no haya calificado ya
  const { data: calificacion, error: calificacionError } = await supabase
    .from("calificaciones")
    .select("id")
    .eq("viaje_id", viajeId)
    .eq("pasajero_id", usuarioId)
    .single()

  // Si hay error (no existe calificación), puede calificar
  return calificacionError !== null
}

// Función para obtener calificaciones que requieren atención (rating bajo)
export const obtenerCalificacionesAtencion = async (): Promise<Calificacion[]> => {
  const { data, error } = await supabase
    .from("calificaciones")
    .select(
      `
      *,
      pasajero:usuarios(*),
      conductor:conductores(
        *,
        usuario:usuarios(*)
      )
    `,
    )
    .lte("rating_general", 3)
    .eq("verificado", true)
    .order("created_at", { ascending: false })
    .limit(10)

  if (error) {
    console.error("Error obteniendo calificaciones de atención:", error)
    return []
  }

  return data || []
}

// Funciones para Mensajes
export const enviarMensaje = async (
  remitenteId: string,
  destinatarioId: string | null,
  mensaje: string,
  tipo: "individual" | "grupal" | "broadcast" = "individual",
): Promise<boolean> => {
  const { error } = await supabase.from("mensajes").insert({
    remitente_id: remitenteId,
    destinatario_id: destinatarioId,
    mensaje,
    tipo,
  })

  if (error) {
    console.error("Error enviando mensaje:", error)
    return false
  }

  return true
}

export const obtenerMensajesUsuario = async (usuarioId: string): Promise<Mensaje[]> => {
  const { data, error } = await supabase
    .from("mensajes")
    .select(
      `
      *,
      remitente:usuarios!remitente_id(*),
      destinatario:usuarios!destinatario_id(*)
    `,
    )
    .or(`destinatario_id.eq.${usuarioId},destinatario_id.is.null`) // Mensajes para el usuario o broadcast
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error obteniendo mensajes:", error)
    return []
  }

  return data || []
}

export const marcarMensajeLeido = async (mensajeId: string): Promise<boolean> => {
  const { error } = await supabase.from("mensajes").update({ leido: true }).eq("id", mensajeId)

  if (error) {
    console.error("Error marcando mensaje como leído:", error)
    return false
  }

  return true
}
