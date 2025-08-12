"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Users, Car, DollarSign, MessageSquare, Bell, CheckCircle, XCircle, RefreshCw, ChevronRight, Plus, Send, Star, MapPin, Receipt } from 'lucide-react'
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import {
  obtenerUsuario,
  obtenerConductoresActivos,
  obtenerTransaccionesSecretaria,
  obtenerSolicitudesEspeciales,
  obtenerRetirosPendientes,
  obtenerCalificacionesAtencion,
  enviarMensaje,
  marcarMensajeLeido,
  obtenerMensajesUsuario,
  procesarRetiro,
  asignarConductorSolicitud,
  actualizarEstadoSolicitudEspecial,
  verificarComprobante,
} from "@/lib/database"
import { Usuario, Conductor, Pago, SolicitudEspecial, Retiro, Calificacion, Mensaje } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

export default function SecretariaDashboard() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [secretaria, setSecretaria] = useState<Usuario | null>(null)
  const [conductores, setConductores] = useState<Conductor[]>([])
  const [transacciones, setTransacciones] = useState<Pago[]>([])
  const [solicitudesEspeciales, setSolicitudesEspeciales] = useState<SolicitudEspecial[]>([])
  const [retirosPendientes, setRetirosPendientes] = useState<Retiro[]>([])
  const [calificacionesAtencion, setCalificacionesAtencion] = useState<Calificacion[]>([])
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [mensajeNuevo, setMensajeNuevo] = useState("")

  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [currentSolicitud, setCurrentSolicitud] = useState<SolicitudEspecial | null>(null)
  const [selectedConductorId, setSelectedConductorId] = useState<string>("")
  const [precioEstimado, setPrecioEstimado] = useState<number | string>("")

  const [isRetiroDialogOpen, setIsRetiroDialogOpen] = useState(false)
  const [currentRetiro, setCurrentRetiro] = useState<Retiro | null>(null)
  const [retiroNotas, setRetiroNotas] = useState("")
  const [retiroEstado, setRetiroEstado] = useState<"procesando" | "completado" | "rechazado">("completado")

  useEffect(() => {
    const loadData = async () => {
      if (user?.id) {
        const fetchedSecretaria = await obtenerUsuario(user.id)
        setSecretaria(fetchedSecretaria)

        const fetchedConductores = await obtenerConductoresActivos()
        setConductores(fetchedConductores)

        const fetchedTransacciones = await obtenerTransaccionesSecretaria()
        setTransacciones(fetchedTransacciones)

        const fetchedSolicitudes = await obtenerSolicitudesEspeciales()
        setSolicitudesEspeciales(fetchedSolicitudes)

        const fetchedRetiros = await obtenerRetirosPendientes()
        setRetirosPendientes(fetchedRetiros)

        const fetchedCalificaciones = await obtenerCalificacionesAtencion()
        setCalificacionesAtencion(fetchedCalificaciones)

        const fetchedMensajes = await obtenerMensajesUsuario(user.id)
        setMensajes(fetchedMensajes)
      }
    }
    loadData()
  }, [user])

  const handleEnviarMensaje = async () => {
    if (!user?.id || !mensajeNuevo.trim()) {
      toast({
        title: "Mensaje vacío",
        description: "No puedes enviar un mensaje vacío.",
        variant: "destructive",
      })
      return
    }

    // Enviar mensaje como broadcast (para todos los usuarios/conductores)
    const success = await enviarMensaje(user.id, null, mensajeNuevo, "broadcast")

    if (success) {
      toast({
        title: "Mensaje enviado",
        description: "Tu mensaje ha sido enviado a todos los usuarios y conductores.",
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

  const openAssignDialog = (solicitud: SolicitudEspecial) => {
    setCurrentSolicitud(solicitud)
    setIsAssignDialogOpen(true)
  }

  const handleAssignConductor = async () => {
    if (!currentSolicitud || !selectedConductorId || !precioEstimado || isNaN(Number(precioEstimado))) {
      toast({
        title: "Campos incompletos",
        description: "Por favor, selecciona un conductor y un precio estimado válido.",
        variant: "destructive",
      })
      return
    }

    const success = await asignarConductorSolicitud(
      currentSolicitud.id,
      selectedConductorId,
      Number(precioEstimado),
    )

    if (success) {
      toast({
        title: "Conductor Asignado",
        description: "El conductor ha sido asignado a la solicitud especial.",
      })
      setIsAssignDialogOpen(false)
      setCurrentSolicitud(null)
      setSelectedConductorId("")
      setPrecioEstimado("")
      // Refresh solicitudes
      const fetchedSolicitudes = await obtenerSolicitudesEspeciales()
      setSolicitudesEspeciales(fetchedSolicitudes)
    } else {
      toast({
        title: "Error",
        description: "No se pudo asignar el conductor.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateSolicitudEstado = async (solicitudId: string, estado: SolicitudEspecial['estado']) => {
    const success = await actualizarEstadoSolicitudEspecial(solicitudId, estado);
    if (success) {
      toast({
        title: "Estado de Solicitud Actualizado",
        description: `La solicitud ahora está en estado: ${estado}.`,
      });
      const fetchedSolicitudes = await obtenerSolicitudesEspeciales();
      setSolicitudesEspeciales(fetchedSolicitudes);
    } else {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la solicitud.",
        variant: "destructive",
      });
    }
  };

  const openRetiroDialog = (retiro: Retiro) => {
    setCurrentRetiro(retiro)
    setIsRetiroDialogOpen(true)
  }

  const handleProcesarRetiro = async () => {
    if (!currentRetiro || !user?.id) return

    const success = await procesarRetiro(currentRetiro.id, retiroEstado, user.id, retiroNotas)

    if (success) {
      toast({
        title: "Retiro Procesado",
        description: `El retiro ha sido marcado como ${retiroEstado}.`,
      })
      setIsRetiroDialogOpen(false)
      setCurrentRetiro(null)
      setRetiroNotas("")
      setRetiroEstado("completado")
      // Refresh retiros
      const fetchedRetiros = await obtenerRetirosPendientes()
      setRetirosPendientes(fetchedRetiros)
    } else {
      toast({
        title: "Error",
        description: "No se pudo procesar el retiro.",
        variant: "destructive",
      })
    }
  }

  const handleVerificarComprobante = async (pagoId: string) => {
    if (!user?.id) return;
    const success = await verificarComprobante(pagoId, user.id);
    if (success) {
      toast({
        title: "Comprobante Verificado",
        description: "El comprobante ha sido marcado como verificado.",
      });
      // Refresh transacciones to reflect the change
      const fetchedTransacciones = await obtenerTransaccionesSecretaria();
      setTransacciones(fetchedTransacciones);
    } else {
      toast({
        title: "Error",
        description: "No se pudo verificar el comprobante.",
        variant: "destructive",
      });
    }
  };


  if (!secretaria) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-lg text-gray-600">Cargando perfil de secretaría...</p>
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
            <AvatarFallback>{secretaria.nombre?.charAt(0) || "S"}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-lg font-semibold">Hola, {secretaria.nombre || "Secretaría"}</h1>
            <p className="text-green-100 text-sm">Panel de Administración</p>
          </div>
        </div>
        <Button variant="ghost" className="text-white hover:bg-green-700" onClick={signOut}>
          Cerrar Sesión
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* Resumen General */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{conductores.length}</p>
              <p className="text-sm text-gray-600">Conductores Activos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">Bs. {transacciones.reduce((sum, t) => sum + t.monto, 0).toFixed(2)}</p>
              <p className="text-sm text-gray-600">Total Transacciones</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Car className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{solicitudesEspeciales.filter(s => s.estado === 'pendiente').length}</p>
              <p className="text-sm text-gray-600">Solicitudes Pendientes</p>
            </CardContent>
          </Card>
        </div>

        {/* Transacciones Recientes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Receipt className="w-5 h-5" /> Transacciones Recientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {transacciones.length === 0 ? (
              <p className="text-gray-500 text-center">No hay transacciones recientes.</p>
            ) : (
              transacciones.map((pago) => (
                <div
                  key={pago.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm"
                >
                  <div>
                    <p className="font-medium">
                      {pago.pasajero?.nombre} ({pago.conductor?.usuario?.nombre})
                    </p>
                    <p className="text-sm text-gray-600">
                      {pago.viaje?.origen} → {pago.viaje?.destino}
                    </p>
                    <p className="text-xs text-gray-500">
                      Bs. {pago.monto.toFixed(2)} - {pago.metodo_pago}
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
                    {pago.comprobante && !pago.comprobante.verificado && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerificarComprobante(pago.comprobante!.id)}
                      >
                        Verificar
                      </Button>
                    )}
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

        {/* Solicitudes Especiales */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="w-5 h-5" /> Solicitudes Especiales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {solicitudesEspeciales.length === 0 ? (
              <p className="text-gray-500 text-center">No hay solicitudes especiales pendientes.</p>
            ) : (
              solicitudesEspeciales.map((solicitud) => (
                <div
                  key={solicitud.id}
                  className="p-3 border rounded-lg bg-white shadow-sm space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <p className="font-medium">Pasajero: {solicitud.pasajero?.nombre}</p>
                    <Badge
                      className={
                        solicitud.estado === "pendiente"
                          ? "bg-yellow-500"
                          : solicitud.estado === "asignado"
                            ? "bg-blue-500"
                            : "bg-gray-500"
                      }
                    >
                      {solicitud.estado}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700">{solicitud.descripcion}</p>
                  {solicitud.estado === "asignado" && (
                    <p className="text-sm text-gray-600">
                      Asignado a: {solicitud.conductor?.usuario?.nombre} (Bs. {solicitud.precio_estimado?.toFixed(2)})
                    </p>
                  )}
                  <div className="flex gap-2 mt-2">
                    {solicitud.estado === "pendiente" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAssignDialog(solicitud)}
                      >
                        Asignar Conductor
                      </Button>
                    )}
                    {solicitud.estado === "asignado" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateSolicitudEstado(solicitud.id, "completado")}
                      >
                        Marcar Completada
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateSolicitudEstado(solicitud.id, "cancelado")}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Retiros Pendientes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5" /> Retiros Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {retirosPendientes.length === 0 ? (
              <p className="text-gray-500 text-center">No hay retiros pendientes.</p>
            ) : (
              retirosPendientes.map((retiro) => (
                <div
                  key={retiro.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm"
                >
                  <div>
                    <p className="font-medium">Conductor: {retiro.conductor?.usuario?.nombre}</p>
                    <p className="text-sm text-gray-600">
                      Monto: Bs. {retiro.monto.toFixed(2)} ({retiro.metodo})
                    </p>
                    <p className="text-xs text-gray-500">
                      Solicitado: {new Date(retiro.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openRetiroDialog(retiro)}>
                    Procesar
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Calificaciones que Requieren Atención */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="w-5 h-5" /> Calificaciones a Revisar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {calificacionesAtencion.length === 0 ? (
              <p className="text-gray-500 text-center">No hay calificaciones que requieran atención.</p>
            ) : (
              calificacionesAtencion.map((calificacion) => (
                <div
                  key={calificacion.id}
                  className="p-3 border rounded-lg bg-white shadow-sm space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <p className="font-medium">
                      Conductor: {calificacion.conductor?.usuario?.nombre}
                    </p>
                    <Badge className="bg-red-500 text-white">
                      Rating: {calificacion.rating_general} <Star className="w-3 h-3 ml-1" />
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700">
                    Pasajero: {calificacion.pasajero?.nombre}
                  </p>
                  <p className="text-sm text-gray-700">
                    Comentario: {calificacion.comentario}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/reputacion-conductor/${calificacion.conductor_id}`)}
                  >
                    Ver Perfil Conductor
                  </Button>
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
                placeholder="Enviar mensaje a todos los usuarios/conductores..."
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
            onClick={() => toast({ title: "Próximamente", description: "Gestión de rutas y precios." })}
          >
            <DollarSign className="w-6 h-6 mb-2" />
            Gestionar Rutas/Precios
          </Button>
          <Button
            variant="outline"
            className="flex flex-col h-auto py-4 items-center justify-center text-center"
            onClick={() => toast({ title: "Próximamente", description: "Gestión de usuarios." })}
          >
            <Users className="w-6 h-6 mb-2" />
            Gestionar Usuarios
          </Button>
          <Button
            variant="outline"
            className="flex flex-col h-auto py-4 items-center justify-center text-center"
            onClick={() => toast({ title: "Próximamente", description: "Reportes y analytics." })}
          >
            <Bell className="w-6 h-6 mb-2" />
            Reportes y Analytics
          </Button>
        </div>
      </div>

      {/* Dialogo para Asignar Conductor */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar Conductor a Solicitud Especial</DialogTitle>
            <DialogDescription>
              Solicitud de: {currentSolicitud?.pasajero?.nombre}
              <br />
              Detalle: {currentSolicitud?.descripcion}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="select-conductor">Conductor</Label>
              <Select value={selectedConductorId} onValueChange={setSelectedConductorId}>
                <SelectTrigger id="select-conductor">
                  <SelectValue placeholder="Selecciona un conductor" />
                </SelectTrigger>
                <SelectContent>
                  {conductores.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.usuario?.nombre} ({c.modelo_vehiculo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="precio-estimado">Precio Estimado (Bs.)</Label>
              <Input
                id="precio-estimado"
                type="number"
                value={precioEstimado}
                onChange={(e) => setPrecioEstimado(e.target.value)}
                placeholder="Ej. 25.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAssignConductor}>Asignar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogo para Procesar Retiro */}
      <Dialog open={isRetiroDialogOpen} onOpenChange={setIsRetiroDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Procesar Retiro</DialogTitle>
            <DialogDescription>
              Conductor: {currentRetiro?.conductor?.usuario?.nombre}
              <br />
              Monto: Bs. {currentRetiro?.monto.toFixed(2)}
              <br />
              Método: {currentRetiro?.metodo}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="retiro-estado">Estado del Retiro</Label>
              <Select value={retiroEstado} onValueChange={(value: "procesando" | "completado" | "rechazado") => setRetiroEstado(value)}>
                <SelectTrigger id="retiro-estado">
                  <SelectValue placeholder="Selecciona el estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="procesando">Procesando</SelectItem>
                  <SelectItem value="completado">Completado</SelectItem>
                  <SelectItem value="rechazado">Rechazado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="retiro-notas">Notas (Opcional)</Label>
              <Textarea
                id="retiro-notas"
                value={retiroNotas}
                onChange={(e) => setRetiroNotas(e.target.value)}
                placeholder="Añade notas sobre el procesamiento del retiro"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRetiroDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleProcesarRetiro}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
