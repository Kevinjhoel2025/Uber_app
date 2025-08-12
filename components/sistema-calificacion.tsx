"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Star, ThumbsUp, Award, Shield, Clock, Loader2 } from "lucide-react"
import {
  crearCalificacion,
  obtenerCalificacionesConductor,
  obtenerEstadisticasConductor,
  obtenerBadgesConductor,
  crearRespuestaCalificacion,
} from "@/lib/database"
import type { Calificacion, EstadisticasConductor, ConductorBadge } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"

interface CalificacionProps {
  conductorId: string
  conductorNombre: string
  conductorFoto?: string
  viajeId: string // Solo relevante si mostrarHistorial es false
  usuarioId: string // Solo relevante si mostrarHistorial es false
  onCalificar?: (calificacion: any) => void
  mostrarHistorial?: boolean
}

export default function SistemaCalificacion({
  conductorId,
  conductorNombre,
  conductorFoto,
  viajeId,
  usuarioId,
  onCalificar,
  mostrarHistorial = false,
}: CalificacionProps) {
  const { usuario: currentUser, loading: authLoading } = useAuth()

  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comentario, setComentario] = useState("")
  const [aspectos, setAspectos] = useState({
    puntualidad: 0,
    vehiculo: 0,
    conduccion: 0,
    amabilidad: 0,
  })
  const [recomendaria, setRecomendaria] = useState<boolean | null>(null)
  const [enviado, setEnviado] = useState(false)
  const [cargandoEnvio, setCargandoEnvio] = useState(false)

  // Estados para el historial
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([])
  const [estadisticas, setEstadisticas] = useState<EstadisticasConductor | null>(null)
  const [badges, setBadges] = useState<ConductorBadge[]>([])
  const [cargandoHistorial, setCargandoHistorial] = useState(false)

  // Estado para la respuesta del conductor
  const [respuestaConductor, setRespuestaConductor] = useState<{ [key: string]: string }>({})
  const [enviandoRespuesta, setEnviandoRespuesta] = useState<{ [key: string]: boolean }>({})

  // Cargar datos del historial si es necesario
  useEffect(() => {
    if (mostrarHistorial && conductorId) {
      cargarHistorial()
    }
  }, [mostrarHistorial, conductorId])

  const cargarHistorial = async () => {
    setCargandoHistorial(true)
    try {
      const [calificacionesData, estadisticasData, badgesData] = await Promise.all([
        obtenerCalificacionesConductor(conductorId),
        obtenerEstadisticasConductor(conductorId),
        obtenerBadgesConductor(conductorId),
      ])

      setCalificaciones(calificacionesData)
      setEstadisticas(estadisticasData)
      setBadges(badgesData)
    } catch (error) {
      console.error("Error cargando historial:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar el historial de calificaciones.",
        variant: "destructive",
      })
    } finally {
      setCargandoHistorial(false)
    }
  }

  const handleRatingClick = (value: number) => {
    setRating(value)
  }

  const handleAspectoChange = (aspecto: keyof typeof aspectos, valor: number) => {
    setAspectos((prev) => ({ ...prev, [aspecto]: valor }))
  }

  const handleEnviarCalificacion = async () => {
    if (rating === 0) {
      toast({
        title: "Calificación requerida",
        description: "Por favor, selecciona una calificación general.",
        variant: "destructive",
      })
      return
    }
    if (!usuarioId || !viajeId || !conductorId) {
      toast({
        title: "Error de datos",
        description: "Faltan datos esenciales para enviar la calificación.",
        variant: "destructive",
      })
      return
    }

    setCargandoEnvio(true)
    try {
      const calificacionData = {
        viaje_id: viajeId,
        pasajero_id: usuarioId,
        conductor_id: conductorId,
        rating_general: rating,
        rating_puntualidad: aspectos.puntualidad || null,
        rating_vehiculo: aspectos.vehiculo || null,
        rating_conduccion: aspectos.conduccion || null,
        rating_amabilidad: aspectos.amabilidad || null,
        comentario: comentario || null,
        recomendaria: recomendaria,
      }

      const resultado = await crearCalificacion(calificacionData)

      if (resultado) {
        setEnviado(true)
        onCalificar?.(resultado)
        toast({
          title: "¡Gracias por tu calificación!",
          description: "Tu opinión ha sido registrada exitosamente.",
        })
      } else {
        toast({
          title: "Error al enviar",
          description: "No se pudo enviar la calificación. Inténtalo de nuevo.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error enviando calificación:", error)
      toast({
        title: "Error inesperado",
        description: "Ocurrió un error al enviar la calificación.",
        variant: "destructive",
      })
    } finally {
      setCargandoEnvio(false)
    }
  }

  const handleResponderCalificacion = async (calificacionId: string) => {
    if (!currentUser || currentUser.tipo_usuario !== "conductor") {
      toast({
        title: "Acceso denegado",
        description: "Solo los conductores pueden responder calificaciones.",
        variant: "destructive",
      })
      return
    }
    const respuesta = respuestaConductor[calificacionId]?.trim()
    if (!respuesta) {
      toast({ title: "Mensaje vacío", description: "La respuesta no puede estar vacía.", variant: "destructive" })
      return
    }

    setEnviandoRespuesta((prev) => ({ ...prev, [calificacionId]: true }))
    try {
      const resultado = await crearRespuestaCalificacion(calificacionId, currentUser.id, respuesta)
      if (resultado) {
        toast({ title: "Respuesta enviada", description: "Tu respuesta ha sido publicada." })
        setRespuestaConductor((prev) => {
          const newState = { ...prev }
          delete newState[calificacionId]
          return newState
        })
        cargarHistorial() // Recargar calificaciones para mostrar la nueva respuesta
      } else {
        toast({ title: "Error", description: "No se pudo enviar la respuesta.", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error enviando respuesta:", error)
      toast({
        title: "Error inesperado",
        description: "Ocurrió un error al enviar la respuesta.",
        variant: "destructive",
      })
    } finally {
      setEnviandoRespuesta((prev) => ({ ...prev, [calificacionId]: false }))
    }
  }

  const renderStars = (
    currentRating: number | undefined,
    onStarClick?: (value: number) => void,
    onStarHover?: (value: number) => void,
    size: "sm" | "md" | "lg" = "md",
  ) => {
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-6 h-6",
      lg: "w-8 h-8",
    }

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${onStarClick ? "cursor-pointer" : ""} transition-colors ${
              star <= (hoverRating || currentRating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
            onClick={() => onStarClick?.(star)}
            onMouseEnter={() => onStarHover?.(star)}
            onMouseLeave={() => onStarHover?.(0)}
          />
        ))}
      </div>
    )
  }

  const getBadgeColor = (rating: number | undefined) => {
    if (!rating) return "bg-gray-500"
    if (rating >= 4.8) return "bg-green-500"
    if (rating >= 4.5) return "bg-blue-500"
    if (rating >= 4.0) return "bg-yellow-500"
    return "bg-gray-500"
  }

  if (authLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando autenticación...</p>
        </CardContent>
      </Card>
    )
  }

  if (enviado) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <ThumbsUp className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-green-800 mb-2">¡Gracias por tu calificación!</h3>
          <p className="text-green-700 mb-4">Tu opinión nos ayuda a mejorar el servicio</p>
          <Button onClick={() => setEnviado(false)} variant="outline" className="bg-transparent">
            Calificar Otro Viaje
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (mostrarHistorial) {
    if (cargandoHistorial) {
      return (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Cargando información del conductor...</p>
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Estadísticas Generales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Reputación de {conductorNombre}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {estadisticas && estadisticas.total_calificaciones > 0 ? (
              <>
                {/* Promedio General */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-4xl font-bold">{estadisticas.rating_promedio?.toFixed(1)}</span>
                    {renderStars(estadisticas.rating_promedio, undefined, undefined, "lg")}
                  </div>
                  <p className="text-gray-600">Basado en {estadisticas.total_calificaciones} calificaciones</p>
                  <Badge className={`${getBadgeColor(estadisticas.rating_promedio)} text-white mt-2`}>
                    Conductor Destacado
                  </Badge>
                </div>

                {/* Distribución de Calificaciones */}
                <div className="space-y-2">
                  <h4 className="font-semibold">Distribución de Calificaciones</h4>
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <div key={stars} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-12">
                        <span className="text-sm">{stars}</span>
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{
                            width: `${(estadisticas.distribucion_ratings[stars.toString() as keyof typeof estadisticas.distribucion_ratings] / estadisticas.total_calificaciones) * 100 || 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-8">
                        {estadisticas.distribucion_ratings[
                          stars.toString() as keyof typeof estadisticas.distribucion_ratings
                        ] || 0}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Aspectos Específicos */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: "rating_puntualidad", label: "Puntualidad", icon: Clock },
                    { key: "rating_vehiculo", label: "Vehículo", icon: Shield },
                    { key: "rating_conduccion", label: "Conducción", icon: Award },
                    { key: "rating_amabilidad", label: "Amabilidad", icon: ThumbsUp },
                  ].map(({ key, label, icon: Icon }) => {
                    const value = estadisticas[key as keyof EstadisticasConductor] as number
                    return (
                      <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">{label}</p>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <Icon className="w-4 h-4 text-gray-500" />
                          <span className="font-bold">{value?.toFixed(1) || "N/A"}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Recomendaciones */}
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <ThumbsUp className="w-5 h-5 text-blue-600" />
                    <span className="text-2xl font-bold text-blue-600">{estadisticas.recomendaciones_porcentaje}%</span>
                  </div>
                  <p className="text-blue-700">de los pasajeros recomiendan a este conductor</p>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No hay suficientes datos para mostrar estadísticas detalladas.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Badges del Conductor */}
        {badges.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Badges de Reconocimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {badges.map((conductorBadge) => (
                  <div key={conductorBadge.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-2xl">
                      {conductorBadge.badge?.icono}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{conductorBadge.badge?.nombre}</h4>
                      <p className="text-sm text-gray-600">{conductorBadge.badge?.descripcion}</p>
                    </div>
                    <Badge variant="outline">Obtenido</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comentarios Recientes */}
        <Card>
          <CardHeader>
            <CardTitle>Comentarios Recientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {calificaciones.length > 0 ? (
              calificaciones.map((calificacion) => (
                <div key={calificacion.id} className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage
                      src={calificacion.pasajero?.foto || ""}
                      alt={calificacion.pasajero?.nombre || "Pasajero"}
                    />
                    <AvatarFallback>{calificacion.pasajero?.nombre?.charAt(0) || "P"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{calificacion.pasajero?.nombre}</p>
                    <p className="text-sm text-gray-600">{calificacion.comentario}</p>
                    {calificacion.respuesta && (
                      <div className="mt-2">
                        <p className="font-semibold">Respuesta del conductor:</p>
                        <p className="text-sm text-gray-600">{calificacion.respuesta}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No hay comentarios recientes para mostrar.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Calificación General */}
      <div className="flex items-center gap-4">
        <div className="text-center">
          <h4 className="font-semibold">Calificación General</h4>
          {renderStars(rating, handleRatingClick, setHoverRating)}
        </div>
      </div>

      {/* Aspectos Específicos */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { key: "puntualidad", label: "Puntualidad", icon: Clock },
          { key: "vehiculo", label: "Vehículo", icon: Shield },
          { key: "conduccion", label: "Conducción", icon: Award },
          { key: "amabilidad", label: "Amabilidad", icon: ThumbsUp },
        ].map(({ key, label, icon: Icon }) => (
          <div key={key} className="flex items-center gap-4">
            <Icon className="w-6 h-6 text-gray-500" />
            <div className="flex-1">
              <h4 className="font-semibold">{label}</h4>
              {renderStars(aspectos[key as keyof typeof aspectos], undefined, undefined, "sm")}
            </div>
          </div>
        ))}
      </div>

      {/* Comentario */}
      <div className="space-y-2">
        <h4 className="font-semibold">Comentario</h4>
        <Textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="Escribe tu comentario aquí..."
          className="resize-none"
        />
      </div>

      {/* Recomendaría */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <ThumbsUp className="w-6 h-6 text-gray-500" />
          <span className="font-semibold">Recomendaría</span>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setRecomendaria(true)}
            variant={recomendaria === true ? "default" : "outline"}
            className="bg-transparent"
          >
            Sí
          </Button>
          <Button
            onClick={() => setRecomendaria(false)}
            variant={recomendaria === false ? "default" : "outline"}
            className="bg-transparent"
          >
            No
          </Button>
        </div>
      </div>

      {/* Botón de Envío */}
      <Button onClick={handleEnviarCalificacion} disabled={cargandoEnvio} className="w-full">
        {cargandoEnvio ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Enviar Calificación"}
      </Button>
    </div>
  )
}
