"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Car, MapPin, Clock, DollarSign, History, Star, MessageSquare, Bell, ChevronRight, CheckCircle, XCircle, RefreshCw, User } from 'lucide-react'
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import {
  obtenerConductor,
  actualizarEstadoConductor,
  obtenerViajesConductor,
  obtenerViajesHoyConductor,
  obtenerPagosConductor,
  obtenerMensajesUsuario,
  enviarMensaje,
  marcarMensajeLeido,
  obtenerEstadisticasConductor,
  obtenerRankingConductores,
} from "@/lib/database"
import { Conductor, Viaje, Pago, Mensaje, EstadisticasConductor } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

export default function ConductorDashboard() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [conductor, setConductor] = useState<Conductor | null>(null)
  const [isAvailable, setIsAvailable] = useState(false)
  const [viajesHoy, setViajesHoy] = useState<Viaje[]>([])
  const [viajesRecientes, setViajesRecientes] = useState<Viaje[]>([])
  const [pagosRecientes, setPagosRecientes] = useState<Pago[]>([])
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [estadisticas, setEstadisticas] = useState<EstadisticasConductor | null>(null)
  const [ranking, setRanking] = useState<any[]>([])
  const [mensajeNuevo, setMensajeNuevo] = useState("")

  useEffect(() => {
    const loadData = async () => {
      if (user?.id) {
        const fetchedConductor = await obtenerConductor(user.id)
        setConductor(fetchedConductor)
        if (fetchedConductor) {
          setIsAvailable(fetchedConductor.estado === "disponible")

          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const endOfDay = new Date(today)
          endOfDay.setHours(23, 59, 59, 999)

          const fetchedViajesHoy = await obtenerViajesHoyConductor(user.id)
          setViajesHoy(fetchedViajesHoy)

          const fetchedViajesRecientes = await obtenerViajesConductor(user.id)
          setViajesRecientes(fetchedViajesRecientes.slice(0, 5)) // Mostrar los 5 más recientes

          const fetchedPagosRecientes = await obtenerPagosConductor(user.id)
          setPagosRecientes(fetchedPagosRecientes.slice(0, 5))

          const fetchedMensajes = await obtenerMensajesUsuario(user.id)
          setMensajes(fetchedMensajes)

          const fetchedEstadisticas = await obtenerEstadisticasConductor(user.id)
          setEstadisticas(fetchedEstadisticas)

          const fetchedRanking = await obtenerRankingConductores(5)
          setRanking(fetchedRanking)
        }
      }
    }
    loadData()
  }, [user])

  const handleAvailabilityChange = async (checked: boolean) => {
    if (!user?.id) return
    const newEstado = checked ? "disponible" : "fuera_servicio"
    const success = await actualizarEstadoConductor(user.id, newEstado)
    if (success) {
      setIsAvailable(checked)
      toast({
        title: "Estado actualizado",
        description: `Tu estado ahora es: ${newEstado.replace("_", " ")}.`,
      })
    } else {
      toast({
        title: "Error",
        description: "No se pudo actualizar tu estado.",
        variant: "destructive",
      })
    }
  }

  const handleEnviarMensaje = async () => {
    if (!user?.id || !mensajeNuevo.trim()) {
      toast({
        title: "Mensaje vacío",
        description: "No puedes enviar un mensaje vacío.",
        variant: "destructive",
      })
      return
    }

    // Enviar mensaje como broadcast (para todos los usuarios/secretaría)
    const success = await enviarMensaje(user.id, null, mensajeNuevo, "broadcast")

    if (success) {
      toast({
        title: "Mensaje enviado",
        description: "Tu mensaje ha sido enviado a la secretaría.",
      })
      setMensajeNuevo("")
      // Recargar mensajes para ver el nuevo
      const fetchedMensajes = await obtenerMensajesUsuario(user.id)
      setMensajes(fetchedMensajes)
    } else {
      toast({
        title: "Error al enviar",
        description: "No se pudo enviar el mensaje.",
        variant: "destructive",
      })
    }
  }

  const handleMarcarLeido = async (mensajeId: string) => {
    const success = await marcarMensajeLeido(mensajeId)
    if (success) {
      setMensajes((prev) =>
        prev.map((msg) => (msg.id === mensajeId ? { ...msg, leido: true } : msg)),
      )
    } else {
      toast({
        title: "Error",
        description: "No se pudo marcar el mensaje como leído.",
        variant: "destructive",
      })
    }
  }

  if (!conductor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-lg text-gray-600">Cargando perfil de conductor...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-white">
            <AvatarImage src="/placeholder-user.jpg" />
            <AvatarFallback>{conductor.usuario?.nombre?.charAt(0) || "C"}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-lg font-semibold">Hola, {conductor.usuario?.nombre || "Conductor"}</h1>
            <p className="text-green-100 text-sm">Dashboard del Conductor</p>
          </div>
        </div>
        <Button variant="ghost" className="text-white hover:bg-green-700" onClick={signOut}>
          Cerrar Sesión
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* Estado de Disponibilidad */}
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Car className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold">Estado de Servicio</p>
                <p className="text-sm text-gray-600">
                  {isAvailable ? "Disponible para viajes" : "Fuera de servicio"}
                </p>
              </div>
            </div>
            <Switch checked={isAvailable} onCheckedChange={handleAvailabilityChange} />
          </CardContent>
        </Card>

        {/* Resumen del Día */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" /> Resumen de Hoy
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{viajesHoy.length}</p>
              <p className="text-sm text-gray-600">Viajes Realizados</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                Bs. {viajesHoy.reduce((sum, viaje) => sum + viaje.monto_total, 0).toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">Ganancias Hoy</p>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas de Reputación */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="w-5 h-5" /> Mi Reputación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {estadisticas ? (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Rating Promedio:</p>
                  <Badge className="bg-yellow-400 text-black">
                    <Star className="w-3 h-3 mr-1" />
                    {estadisticas.rating_promedio?.toFixed(1) || "N/A"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Total Calificaciones:</p>
                  <span className="font-medium">{estadisticas.total_calificaciones || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Recomendaciones:</p>
                  <span className="font-medium">{estadisticas.recomendaciones_porcentaje || 0}%</span>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => router.push(`/reputacion-conductor/${conductor.id}`)}
                >
                  Ver Detalles de Reputación <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            ) : (
              <p className="text-gray-500 text-center">No hay estadísticas disponibles aún.</p>
            )}
          </CardContent>
        </Card>

        {/* Viajes Recientes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="w-5 h-5" /> Viajes Recientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {viajesRecientes.length === 0 ? (
              <p className="text-gray-500 text-center">No hay viajes recientes.</p>
            ) : (
              viajesRecientes.map((viaje) => (
                <div
                  key={viaje.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm"
                >
                  <div>
                    <p className="font-medium">
                      {viaje.origen} → {viaje.destino}
                    </p>
                    <p className="text-sm text-gray-600">
                      Pasajero: {viaje.pasajero?.nombre || "N/A"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(viaje.fecha_viaje).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        viaje.estado === "completado"
                          ? "bg-green-500"
                          : viaje.estado === "cancelado"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                      }
                    >
                      {viaje.estado}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/seguimiento/${viaje.id}`)}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Pagos Recientes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5" /> Pagos Recientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pagosRecientes.length === 0 ? (
              <p className="text-gray-500 text-center">No hay pagos recientes.</p>
            ) : (
              pagosRecientes.map((pago) => (
                <div
                  key={pago.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm"
                >
                  <div>
                    <p className="font-medium">
                      {pago.viaje?.origen} → {pago.viaje?.destino}
                    </p>
                    <p className="text-sm text-gray-600">
                      Pasajero: {pago.pasajero?.nombre || "N/A"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Monto: Bs. {pago.monto.toFixed(2)} - {pago.metodo_pago}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        pago.estado === "completado"
                          ? "bg-green-500"
                          : pago.estado === "fallido"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                      }
                    >
                      {pago.estado}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/comprobante/${pago.id}`)}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Mensajes y Notificaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5" /> Mensajes y Notificaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {mensajes.length === 0 ? (
                <p className="text-gray-500 text-center">No tienes mensajes.</p>
              ) : (
                mensajes.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 border rounded-lg shadow-sm ${msg.leido ? "bg-gray-100" : "bg-blue-50"}`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">
                        {msg.remitente?.nombre || "Sistema"}
                        {msg.tipo === "broadcast" && " (Broadcast)"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(msg.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800">{msg.mensaje}</p>
                    {!msg.leido && (
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto text-blue-600"
                        onClick={() => handleMarcarLeido(msg.id)}
                      >
                        Marcar como leído
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Escribe un mensaje a secretaría..."
                value={mensajeNuevo}
                onChange={(e) => setMensajeNuevo(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleEnviarMensaje} size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Ranking de Conductores */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5" /> Ranking de Conductores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ranking.length === 0 ? (
              <p className="text-gray-500 text-center">No hay datos de ranking aún.</p>
            ) : (
              ranking.map((item, index) => (
                <div key={item.conductor_id} className="flex items-center justify-between p-2 border-b last:border-b-0">
                  <span className="font-bold text-lg text-green-700 mr-2">#{index + 1}</span>
                  <div className="flex-1">
                    <p className="font-medium">{item.nombre_conductor}</p>
                    <p className="text-sm text-gray-600">Viajes: {item.total_viajes}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="font-semibold">{item.rating_promedio?.toFixed(1)}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Enlaces Rápidos */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="flex flex-col h-auto py-4 items-center justify-center text-center"
            onClick={() => router.push("/conductor-ubicacion")}
          >
            <MapPin className="w-6 h-6 mb-2" />
            Actualizar Ubicación
          </Button>
          <Button
            variant="outline"
            className="flex flex-col h-auto py-4 items-center justify-center text-center"
            onClick={() => router.push("/mi-qr")}
          >
            <QrCode className="w-6 h-6 mb-2" />
            Mi QR
          </Button>
          <Button
            variant="outline"
            className="flex flex-col h-auto py-4 items-center justify-center text-center"
            onClick={() => router.push("/mapa-general")}
          >
            <MapPin className="w-6 h-6 mb-2" />
            Mapa General
          </Button>
          <Button
            variant="outline"
            className="flex flex-col h-auto py-4 items-center justify-center text-center"
            onClick={() => toast({ title: "Próximamente", description: "Funcionalidad de retiros." })}
          >
            <DollarSign className="w-6 h-6 mb-2" />
            Solicitar Retiro
          </Button>
        </div>
      </div>
    </div>
  )
}
