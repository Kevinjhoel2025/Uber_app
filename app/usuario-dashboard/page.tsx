"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Car, MapPin, Clock, DollarSign, History, MessageSquare, Bell, QrCode, Star, ChevronRight, Plus, Send, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import {
  obtenerUsuario,
  obtenerRutas,
  obtenerUbicaciones,
  crearViaje,
  obtenerViajesUsuario,
  obtenerPagosUsuario,
  obtenerMensajesUsuario,
  enviarMensaje,
  marcarMensajeLeido,
  crearSolicitudEspecial,
  obtenerConductoresActivos,
} from "@/lib/database"
import { Usuario, Ruta, Ubicacion, Viaje, Pago, Mensaje, Conductor } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

export default function UsuarioDashboard() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [rutas, setRutas] = useState<Ruta[]>([])
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([])
  const [viajes, setViajes] = useState<Viaje[]>([])
  const [pagos, setPagos] = useState<Pago[]>([])
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [conductoresActivos, setConductoresActivos] = useState<Conductor[]>([])

  const [origen, setOrigen] = useState("")
  const [destino, setDestino] = useState("")
  const [asientos, setAsientos] = useState(1)
  const [fechaViaje, setFechaViaje] = useState("")
  const [horaViaje, setHoraViaje] = useState("")
  const [montoEstimado, setMontoEstimado] = useState<number | null>(null)
  const [conductorSeleccionado, setConductorSeleccionado] = useState<string | null>(null)

  const [mensajeNuevo, setMensajeNuevo] = useState("")
  const [solicitudEspecialDetalle, setSolicitudEspecialDetalle] = useState("")

  useEffect(() => {
    const loadData = async () => {
      if (user?.id) {
        const fetchedUsuario = await obtenerUsuario(user.id)
        setUsuario(fetchedUsuario)

        const fetchedRutas = await obtenerRutas()
        setRutas(fetchedRutas)

        const fetchedUbicaciones = await obtenerUbicaciones()
        setUbicaciones(fetchedUbicaciones)

        const fetchedViajes = await obtenerViajesUsuario(user.id)
        setViajes(fetchedViajes)

        const fetchedPagos = await obtenerPagosUsuario(user.id)
        setPagos(fetchedPagos)

        const fetchedMensajes = await obtenerMensajesUsuario(user.id)
        setMensajes(fetchedMensajes)

        const fetchedConductores = await obtenerConductoresActivos()
        setConductoresActivos(fetchedConductores)
      }
    }
    loadData()
  }, [user])

  useEffect(() => {
    if (origen && destino) {
      const rutaSeleccionada = rutas.find((r) => r.origen === origen && r.destino === destino)
      if (rutaSeleccionada) {
        setMontoEstimado(rutaSeleccionada.precio_base * asientos)
      } else {
        setMontoEstimado(null)
      }
    } else {
      setMontoEstimado(null)
    }
  }, [origen, destino, asientos, rutas])

  const handleSolicitarViaje = async () => {
    if (!user?.id || !origen || !destino || !fechaViaje || !horaViaje || !montoEstimado || !conductorSeleccionado) {
      toast({
        title: "Campos incompletos",
        description: "Por favor, completa todos los campos para solicitar el viaje.",
        variant: "destructive",
      })
      return
    }

    const origenUbicacion = ubicaciones.find((u) => u.nombre === origen)
    const destinoUbicacion = ubicaciones.find((u) => u.nombre === destino)

    if (!origenUbicacion || !destinoUbicacion) {
      toast({
        title: "Error de ubicación",
        description: "No se encontraron coordenadas para el origen o destino seleccionados.",
        variant: "destructive",
      })
      return
    }

    const fechaHoraViaje = new Date(`${fechaViaje}T${horaViaje}:00`)

    const nuevoViaje = await crearViaje({
      pasajero_id: user.id,
      conductor_id: conductorSeleccionado,
      origen: origen,
      destino: destino,
      origen_lat: origenUbicacion.latitud,
      origen_lng: origenUbicacion.longitud,
      destino_lat: destinoUbicacion.latitud,
      destino_lng: destinoUbicacion.longitud,
      fecha_viaje: fechaHoraViaje.toISOString(),
      asientos_reservados: asientos,
      monto_total: montoEstimado,
      // estado: "pendiente" (se establece por defecto en la función crearViaje)
    })

    if (nuevoViaje) {
      toast({
        title: "Viaje solicitado",
        description: "Tu viaje ha sido solicitado exitosamente.",
      })
      setViajes((prev) => [nuevoViaje, ...prev])
      // Reset form
      setOrigen("")
      setDestino("")
      setAsientos(1)
      setFechaViaje("")
      setHoraViaje("")
      setMontoEstimado(null)
      setConductorSeleccionado(null)
    } else {
      toast({
        title: "Error al solicitar",
        description: "No se pudo solicitar el viaje. Intenta nuevamente.",
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

  const handleSolicitarEspecial = async () => {
    if (!user?.id || !solicitudEspecialDetalle.trim()) {
      toast({
        title: "Detalle vacío",
        description: "Por favor, describe tu solicitud especial.",
        variant: "destructive",
      })
      return
    }

    const nuevaSolicitud = await crearSolicitudEspecial({
      pasajero_id: user.id,
      descripcion: solicitudEspecialDetalle,
      // estado: "pendiente" (se establece por defecto)
    })

    if (nuevaSolicitud) {
      toast({
        title: "Solicitud enviada",
        description: "Tu solicitud especial ha sido enviada a la secretaría.",
      })
      setSolicitudEspecialDetalle("")
    } else {
      toast({
        title: "Error al enviar",
        description: "No se pudo enviar la solicitud especial.",
        variant: "destructive",
      })
    }
  }

  if (!usuario) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-lg text-gray-600">Cargando perfil de usuario...</p>
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
            <AvatarFallback>{usuario.nombre?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-lg font-semibold">Hola, {usuario.nombre || "Usuario"}</h1>
            <p className="text-green-100 text-sm">Bienvenido a tu dashboard</p>
          </div>
        </div>
        <Button variant="ghost" className="text-white hover:bg-green-700" onClick={signOut}>
          Cerrar Sesión
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* Sección de Solicitud de Viaje */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Car className="w-5 h-5" /> Solicitar un Viaje
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="origen" className="block text-sm font-medium text-gray-700 mb-1">
                Origen
              </label>
              <Select value={origen} onValueChange={setOrigen}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona el origen" />
                </SelectTrigger>
                <SelectContent>
                  {ubicaciones.map((loc) => (
                    <SelectItem key={loc.id} value={loc.nombre}>
                      {loc.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="destino" className="block text-sm font-medium text-gray-700 mb-1">
                Destino
              </label>
              <Select value={destino} onValueChange={setDestino}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona el destino" />
                </SelectTrigger>
                <SelectContent>
                  {ubicaciones.map((loc) => (
                    <SelectItem key={loc.id} value={loc.nombre}>
                      {loc.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="asientos" className="block text-sm font-medium text-gray-700 mb-1">
                Número de Asientos
              </label>
              <Input
                id="asientos"
                type="number"
                min="1"
                value={asientos}
                onChange={(e) => setAsientos(parseInt(e.target.value) || 1)}
              />
            </div>
            <div>
              <label htmlFor="fechaViaje" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha del Viaje
              </label>
              <Input
                id="fechaViaje"
                type="date"
                value={fechaViaje}
                onChange={(e) => setFechaViaje(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="horaViaje" className="block text-sm font-medium text-gray-700 mb-1">
                Hora del Viaje
              </label>
              <Input
                id="horaViaje"
                type="time"
                value={horaViaje}
                onChange={(e) => setHoraViaje(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="conductor" className="block text-sm font-medium text-gray-700 mb-1">
                Conductor Preferido (Opcional)
              </label>
              <Select value={conductorSeleccionado || ""} onValueChange={setConductorSeleccionado}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Cualquier conductor disponible" />
                </SelectTrigger>
                <SelectContent>
                  {conductoresActivos.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.usuario?.nombre} ({c.modelo_vehiculo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {montoEstimado !== null && (
              <div className="text-lg font-bold text-right">
                Monto Estimado: <span className="text-green-600">Bs. {montoEstimado.toFixed(2)}</span>
              </div>
            )}
            <Button onClick={handleSolicitarViaje} className="w-full bg-green-600 hover:bg-green-700">
              Solicitar Viaje
            </Button>
          </CardContent>
        </Card>

        {/* Sección de Mis Viajes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="w-5 h-5" /> Mis Viajes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {viajes.length === 0 ? (
              <p className="text-gray-500 text-center">No tienes viajes registrados.</p>
            ) : (
              viajes.map((viaje) => (
                <div
                  key={viaje.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm"
                >
                  <div>
                    <p className="font-medium">
                      {viaje.origen} → {viaje.destino}
                    </p>
                    <p className="text-sm text-gray-600">
                      Conductor: {viaje.conductor?.usuario?.nombre || "N/A"}
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

        {/* Sección de Mis Pagos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5" /> Mis Pagos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pagos.length === 0 ? (
              <p className="text-gray-500 text-center">No tienes pagos registrados.</p>
            ) : (
              pagos.map((pago) => (
                <div
                  key={pago.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm"
                >
                  <div>
                    <p className="font-medium">
                      {pago.viaje?.origen} → {pago.viaje?.destino}
                    </p>
                    <p className="text-sm text-gray-600">
                      Conductor: {pago.conductor?.usuario?.nombre || "N/A"}
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
                    {pago.estado === "completado" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/comprobante/${pago.id}`)} // Asumiendo una ruta para ver comprobante
                      >
                        <QrCode className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Sección de Mensajes y Notificaciones */}
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

        {/* Sección de Solicitudes Especiales */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="w-5 h-5" /> Solicitud Especial
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Describe tu solicitud especial (ej. viaje a una ubicación no listada, necesidad de vehículo específico, etc.)"
              value={solicitudEspecialDetalle}
              onChange={(e) => setSolicitudEspecialDetalle(e.target.value)}
              rows={4}
            />
            <Button onClick={handleSolicitarEspecial} className="w-full bg-purple-600 hover:bg-purple-700">
              Enviar Solicitud Especial
            </Button>
          </CardContent>
        </Card>

        {/* Enlaces Rápidos */}
        <div className="grid grid-cols-2 gap-4">
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
            onClick={() => router.push("/mi-qr")}
          >
            <QrCode className="w-6 h-6 mb-2" />
            Mi QR
          </Button>
          <Button
            variant="outline"
            className="flex flex-col h-auto py-4 items-center justify-center text-center"
            onClick={() => router.push("/reputacion-conductor/some-conductor-id")}
          >
            <Star className="w-6 h-6 mb-2" />
            Ver Reputación Conductor
          </Button>
          <Button
            variant="outline"
            className="flex flex-col h-auto py-4 items-center justify-center text-center"
            onClick={() => toast({ title: "Próximamente", description: "Funcionalidad de notificaciones." })}
          >
            <Bell className="w-6 h-6 mb-2" />
            Notificaciones
          </Button>
        </div>
      </div>
    </div>
  )
}
