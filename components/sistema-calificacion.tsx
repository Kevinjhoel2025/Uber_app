"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Star, ThumbsUp, ThumbsDown, MessageCircle, Award, Shield, Clock } from "lucide-react"
import {
  crearCalificacion,
  obtenerCalificacionesConductor,
  obtenerEstadisticasConductor,
  obtenerBadgesConductor,
  crearRespuestaCalificacion,
} from "@/lib/database"
import type { Calificacion, EstadisticasConductor, ConductorBadge } from "@/lib/supabase"

interface CalificacionProps {
  conductorId: string
  conductorNombre: string
  conductorFoto?: string
  viajeId: string
  usuarioId: string
  onCalificar?: (calificacion: any) => void
  mostrarHistorial?: boolean
}

interface CalificacionData {
  rating: number
  comentario: string
  aspectos: {
    puntualidad: number
    vehiculo: number
    conduccion: number
    amabilidad: number
  }
  recomendaria: boolean
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
  const [cargando, setCargando] = useState(false)

  // Estados para el historial
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([])
  const [estadisticas, setEstadisticas] = useState<EstadisticasConductor | null>(null)
  const [badges, setBadges] = useState<ConductorBadge[]>([])
  const [cargandoHistorial, setCargandoHistorial] = useState(false)

  // Cargar datos del historial si es necesario
  useEffect(() => {
    if (mostrarHistorial) {
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
    if (rating === 0) return

    setCargando(true)
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
      } else {
        alert("Error al enviar la calificación. Inténtalo de nuevo.")
      }
    } catch (error) {
      console.error("Error enviando calificación:", error)
      alert("Error al enviar la calificación. Inténtalo de nuevo.")
    } finally {
      setCargando(false)
    }
  }

  const handleResponderCalificacion = async (calificacionId: string, respuesta: string) => {
    try {
      const resultado = await crearRespuestaCalificacion(calificacionId, conductorId, respuesta)
      if (resultado) {
        // Recargar calificaciones para mostrar la nueva respuesta
        cargarHistorial()
      }
    } catch (error) {
      console.error("Error enviando respuesta:", error)
    }
  }

  const renderStars = (
    currentRating: number,
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
            className={`${sizeClasses[size]} cursor-pointer transition-colors ${
              star <= (hoverRating || currentRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
            onClick={() => onStarClick?.(star)}
            onMouseEnter={() => onStarHover?.(star)}
            onMouseLeave={() => onStarHover?.(0)}
          />
        ))}
      </div>
    )
  }

  const getBadgeColor = (rating: number) => {
    if (rating >= 4.8) return "bg-green-500"
    if (rating >= 4.5) return "bg-blue-500"
    if (rating >= 4.0) return "bg-yellow-500"
    return "bg-gray-500"
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
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
            {estadisticas && (
              <>
                {/* Promedio General */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-4xl font-bold">{estadisticas.rating_promedio}</span>
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
                            width: `${(estadisticas.distribucion_ratings[stars.toString() as keyof typeof estadisticas.distribucion_ratings] / estadisticas.total_calificaciones) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-8">
                        {
                          estadisticas.distribucion_ratings[
                            stars.toString() as keyof typeof estadisticas.distribucion_ratings
                          ]
                        }
                      </span>
                    </div>
                  ))}
                </div>

                {/* Aspectos Específicos */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: "rating_puntualidad", label: "Puntualidad" },
                    { key: "rating_vehiculo", label: "Vehículo" },
                    { key: "rating_conduccion", label: "Conducción" },
                    { key: "rating_amabilidad", label: "Amabilidad" },
                  ].map(({ key, label }) => (
                    <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">{label}</p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <span className="font-bold">{estadisticas[key as keyof EstadisticasConductor] as number}</span>
                        {renderStars(
                          estadisticas[key as keyof EstadisticasConductor] as number,
                          undefined,
                          undefined,
                          "sm",
                        )}
                      </div>
                    </div>
                  ))}
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
            {calificaciones.map((calificacion) => (
              <div key={calificacion.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={calificacion.pasajero?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>
                        {calificacion.pasajero?.nombre
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{calificacion.pasajero?.nombre}</p>
                        {calificacion.verificado && <Shield className="w-4 h-4 text-green-500" />}
                      </div>
                      <div className="flex items-center gap-2">
                        {renderStars(calificacion.rating_general, undefined, undefined, "sm")}
                        <span className="text-sm text-gray-500">
                          {new Date(calificacion.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {calificacion.comentario && <p className="text-gray-700 mb-3">{calificacion.comentario}</p>}

                {/* Aspectos Específicos */}
                {(calificacion.rating_puntualidad ||
                  calificacion.rating_vehiculo ||
                  calificacion.rating_conduccion ||
                  calificacion.rating_amabilidad) && (
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {[
                      { key: "rating_puntualidad", label: "Puntualidad" },
                      { key: "rating_vehiculo", label: "Vehículo" },
                      { key: "rating_conduccion", label: "Conducción" },
                      { key: "rating_amabilidad", label: "Amabilidad" },
                    ].map(({ key, label }) => {
                      const valor = calificacion[key as keyof Calificacion] as number
                      return valor ? (
                        <div key={key} className="text-center">
                          <p className="text-xs text-gray-500">{label}</p>
                          <div className="flex justify-center">{renderStars(valor, undefined, undefined, "sm")}</div>
                        </div>
                      ) : null
                    })}
                  </div>
                )}

                {/* Respuesta del Conductor */}
                {calificacion.respuesta && (
                  <div className="bg-blue-50 p-3 rounded-lg mt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-800">Respuesta del conductor:</span>
                    </div>
                    <p className="text-sm text-blue-700">{calificacion.respuesta}</p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5" />
          Calificar tu Viaje
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Información del Conductor */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <Avatar className="w-16 h-16">
            <AvatarImage src={conductorFoto || "/placeholder.svg"} />
            <AvatarFallback>
              {conductorNombre
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">{conductorNombre}</h3>
            <p className="text-gray-600">¿Cómo fue tu experiencia?</p>
          </div>
        </div>

        {/* Calificación General */}
        <div className="text-center">
          <p className="font-semibold mb-3">Calificación General</p>
          {renderStars(rating, handleRatingClick, setHoverRating, "lg")}
          <p className="text-sm text-gray-600 mt-2">
            {rating === 0 && "Selecciona una calificación"}
            {rating === 1 && "Muy malo"}
            {rating === 2 && "Malo"}
            {rating === 3 && "Regular"}
            {rating === 4 && "Bueno"}
            {rating === 5 && "Excelente"}
          </p>
        </div>

        {/* Aspectos Específicos */}
        <div className="space-y-4">
          <h4 className="font-semibold">Califica aspectos específicos:</h4>
          {[
            { key: "puntualidad", label: "Puntualidad", icon: Clock },
            { key: "vehiculo", label: "Estado del Vehículo", icon: Shield },
            { key: "conduccion", label: "Conducción", icon: Award },
            { key: "amabilidad", label: "Amabilidad", icon: ThumbsUp },
          ].map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{label}</span>
              </div>
              {renderStars(aspectos[key as keyof typeof aspectos], (value) =>
                handleAspectoChange(key as keyof typeof aspectos, value),
              )}
            </div>
          ))}
        </div>

        {/* Recomendación */}
        <div className="space-y-3">
          <p className="font-semibold">¿Recomendarías este conductor?</p>
          <div className="flex gap-3">
            <Button
              variant={recomendaria === true ? "default" : "outline"}
              onClick={() => setRecomendaria(true)}
              className="flex-1"
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              Sí
            </Button>
            <Button
              variant={recomendaria === false ? "default" : "outline"}
              onClick={() => setRecomendaria(false)}
              className="flex-1"
            >
              <ThumbsDown className="w-4 h-4 mr-2" />
              No
            </Button>
          </div>
        </div>

        {/* Comentario */}
        <div className="space-y-2">
          <label className="font-semibold">Comentario (opcional)</label>
          <Textarea
            placeholder="Comparte tu experiencia con otros pasajeros..."
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        {/* Botón Enviar */}
        <Button onClick={handleEnviarCalificacion} disabled={rating === 0 || cargando} className="w-full" size="lg">
          {cargando ? "Enviando..." : "Enviar Calificación"}
        </Button>
      </CardContent>
    </Card>
  )
}
