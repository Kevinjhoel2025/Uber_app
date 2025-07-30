"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Car, MapPin, Clock, Star, Phone, MessageCircle, User, Calendar, Navigation, CheckCircle } from "lucide-react"
import MapaTiempoReal from "@/components/mapa-tiempo-real"
import { crearSolicitudEspecial, obtenerViajesUsuario, actualizarUsuario } from "@/lib/database"
import { useAuth } from "@/hooks/use-auth"

export default function UsuarioDashboard() {
  const [selectedTab, setSelectedTab] = useState("reservar")
  const [selectedRoute, setSelectedRoute] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [saldoBilletera, setSaldoBilletera] = useState(45.5)
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState("billetera")
  const [viajes, setViajes] = useState([])
  const [cargandoViajes, setCargandoViajes] = useState(false)
  const [solicitudEspecial, setSolicitudEspecial] = useState({
    destino: "",
    fecha: "",
    hora: "",
    pasajeros: "1",
    comentarios: "",
  })

  const { usuario } = useAuth()

  // Rutas disponibles actualizadas con Satélite Norte
  const rutasDisponibles = [
    { origen: "Warnes", destino: "Montero", precio: 15, duracion: "25 min" },
    { origen: "Warnes", destino: "Satélite Norte", precio: 20, duracion: "35 min" },
    { origen: "Montero", destino: "Warnes", precio: 15, duracion: "25 min" },
    { origen: "Montero", destino: "Satélite Norte", precio: 15, duracion: "20 min" },
    { origen: "Satélite Norte", destino: "Warnes", precio: 20, duracion: "35 min" },
    { origen: "Satélite Norte", destino: "Montero", precio: 15, duracion: "20 min" },
  ]

  const autosDisponibles = [
    {
      id: 1,
      conductor: "Carlos Mendoza",
      vehiculo: "Toyota Hiace - ABC123",
      asientosDisponibles: 3,
      horaSalida: "14:30",
      rating: 4.8,
      telefono: "70123456",
      ruta: "Warnes → Satélite Norte",
      precio: 20,
    },
    {
      id: 2,
      conductor: "María González",
      vehiculo: "Nissan Urvan - XYZ789",
      asientosDisponibles: 5,
      horaSalida: "15:00",
      rating: 4.9,
      telefono: "70987654",
      ruta: "Montero → Satélite Norte",
      precio: 15,
    },
    {
      id: 3,
      conductor: "Pedro Rojas",
      vehiculo: "Ford Transit - DEF456",
      asientosDisponibles: 2,
      horaSalida: "15:30",
      rating: 4.7,
      telefono: "70456789",
      ruta: "Satélite Norte → Warnes",
      precio: 20,
    },
  ]

  const historialViajes = [
    {
      id: 1,
      fecha: "2024-01-16",
      ruta: "Warnes → Satélite Norte",
      conductor: "Carlos Mendoza",
      rating: 5,
      precio: 20,
    },
    {
      id: 2,
      fecha: "2024-01-15",
      ruta: "Warnes → Montero",
      conductor: "Carlos Mendoza",
      rating: 5,
      precio: 15,
    },
    {
      id: 3,
      fecha: "2024-01-10",
      ruta: "Montero → Warnes",
      conductor: "María González",
      rating: 4,
      precio: 15,
    },
  ]

  const metodosDisponibles = [
    { id: "billetera", nombre: "Mi Billetera", icono: "💳", saldo: saldoBilletera },
    { id: "tigo", nombre: "Tigo Money", icono: "📱", disponible: true },
    { id: "union", nombre: "Banco Unión", icono: "🏦", disponible: true },
    { id: "qr", nombre: "Pago con QR", icono: "📷", disponible: true },
    { id: "efectivo", nombre: "Efectivo", icono: "💵", disponible: true },
  ]

  useEffect(() => {
    if (usuario && selectedTab === "viajes") {
      cargarViajes()
    }
  }, [usuario, selectedTab])

  const cargarViajes = async () => {
    if (!usuario) return

    setCargandoViajes(true)
    try {
      const viajesData = await obtenerViajesUsuario(usuario.id)
      setViajes(viajesData)
    } catch (error) {
      console.error("Error cargando viajes:", error)
    } finally {
      setCargandoViajes(false)
    }
  }

  const handleReservarViaje = (autoId: number) => {
    const auto = autosDisponibles.find((a) => a.id === autoId)
    if (auto) {
      window.location.href = `/pago-qr?auto=${autoId}&ruta=${encodeURIComponent(auto.ruta)}&precio=${auto.precio}`
    }
  }

  const handleLlamarConductor = (telefono: string) => {
    window.open(`tel:${telefono}`, "_self")
  }

  const handleEnviarMensaje = (conductorId: number) => {
    // Implementar chat o WhatsApp
    alert(`Enviando mensaje al conductor ${conductorId}`)
  }

  const handleSolicitudEspecial = async () => {
    if (!usuario || !solicitudEspecial.destino || !solicitudEspecial.fecha || !solicitudEspecial.hora) {
      alert("Por favor completa todos los campos obligatorios")
      return
    }

    try {
      const fechaViaje = new Date(`${solicitudEspecial.fecha}T${solicitudEspecial.hora}:00`)

      const nuevaSolicitud = await crearSolicitudEspecial({
        pasajero_id: usuario.id,
        destino: solicitudEspecial.destino,
        fecha_viaje: fechaViaje.toISOString(),
        pasajeros: Number.parseInt(solicitudEspecial.pasajeros),
        comentarios: solicitudEspecial.comentarios,
      })

      if (nuevaSolicitud) {
        alert("Solicitud enviada exitosamente. La secretaría se pondrá en contacto contigo.")
        setSolicitudEspecial({
          destino: "",
          fecha: "",
          hora: "",
          pasajeros: "1",
          comentarios: "",
        })
      } else {
        alert("Error al enviar la solicitud. Inténtalo de nuevo.")
      }
    } catch (error) {
      console.error("Error enviando solicitud:", error)
      alert("Error al enviar la solicitud. Inténtalo de nuevo.")
    }
  }

  const handleRecargarSaldo = (monto: number) => {
    setSaldoBilletera((prev) => prev + monto)
    alert(`Saldo recargado: Bs. ${monto}`)
  }

  const handleActualizarPerfil = async (datos: any) => {
    if (!usuario) return

    try {
      const usuarioActualizado = await actualizarUsuario(usuario.id, datos)
      if (usuarioActualizado) {
        alert("Perfil actualizado exitosamente")
      } else {
        alert("Error al actualizar el perfil")
      }
    } catch (error) {
      console.error("Error actualizando perfil:", error)
      alert("Error al actualizar el perfil")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">¡Hola, {usuario?.nombre || "Usuario"}!</h1>
            <p className="text-blue-100">Sindicato 27 de Noviembre</p>
          </div>
          <Avatar>
            <AvatarImage src={usuario?.avatar_url || "/placeholder-user.jpg"} />
            <AvatarFallback>{usuario?.nombre?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="p-4">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="reservar">Reservar</TabsTrigger>
            <TabsTrigger value="pagos">Pagos</TabsTrigger>
            <TabsTrigger value="viajes">Mis Viajes</TabsTrigger>
            <TabsTrigger value="historial">Historial</TabsTrigger>
            <TabsTrigger value="perfil">Perfil</TabsTrigger>
          </TabsList>

          <TabsContent value="reservar" className="space-y-4">
            {/* Formulario de Reserva */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Reservar Asiento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Origen</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="warnes">Warnes</SelectItem>
                        <SelectItem value="montero">Montero</SelectItem>
                        <SelectItem value="satelite-norte">Satélite Norte</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Destino</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="montero">Montero</SelectItem>
                        <SelectItem value="warnes">Warnes</SelectItem>
                        <SelectItem value="satelite-norte">Satélite Norte</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Hora Preferida</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar hora" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="14:30">14:30</SelectItem>
                      <SelectItem value="15:00">15:00</SelectItem>
                      <SelectItem value="15:30">15:30</SelectItem>
                      <SelectItem value="16:00">16:00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Rutas Disponibles */}
            <Card>
              <CardHeader>
                <CardTitle>Rutas Disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {rutasDisponibles.map((ruta, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          {ruta.origen} → {ruta.destino}
                        </p>
                        <p className="text-sm text-gray-600">{ruta.duracion}</p>
                      </div>
                      <Badge variant="outline">Bs. {ruta.precio}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Autos Disponibles */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Autos Disponibles</h3>
              {autosDisponibles.map((auto) => (
                <Card key={auto.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Car className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{auto.conductor}</h4>
                          <p className="text-sm text-gray-600">{auto.vehiculo}</p>
                          <p className="text-sm text-blue-600">{auto.ruta}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{auto.rating}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {auto.horaSalida}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {auto.asientosDisponibles} asientos
                        </div>
                      </div>
                      <Badge variant="secondary">Bs. {auto.precio}</Badge>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1" onClick={() => handleReservarViaje(auto.id)}>
                        Reservar y Pagar
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleLlamarConductor(auto.telefono)}>
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleEnviarMensaje(auto.id)}>
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Mapa de Vehículos Cercanos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Vehículos Cercanos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MapaTiempoReal
                  vehiculos={autosDisponibles.map((auto, index) => ({
                    id: auto.id.toString(),
                    conductor: auto.conductor,
                    vehiculo: auto.vehiculo,
                    placa: auto.vehiculo.split(" - ")[1] || "ABC123",
                    lat: -17.7833 + index * 0.01,
                    lng: -63.1821 + index * 0.01,
                    estado: "disponible" as const,
                    pasajeros: 12 - auto.asientosDisponibles,
                    capacidad: 12,
                    telefono: auto.telefono,
                  }))}
                  centroMapa={{ lat: -17.7833, lng: -63.1821 }}
                  zoom={13}
                />
              </CardContent>
            </Card>

            {/* Solicitar Viaje Especial */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="w-5 h-5" />
                  Solicitar Viaje a Otro Destino
                </CardTitle>
                <CardDescription>Contacta con la secretaría para viajes fuera de la ruta regular</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Destino</Label>
                  <Input
                    placeholder="Ej: Santa Cruz, Cochabamba..."
                    value={solicitudEspecial.destino}
                    onChange={(e) => setSolicitudEspecial((prev) => ({ ...prev, destino: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fecha</Label>
                    <Input
                      type="date"
                      value={solicitudEspecial.fecha}
                      onChange={(e) => setSolicitudEspecial((prev) => ({ ...prev, fecha: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hora</Label>
                    <Input
                      type="time"
                      value={solicitudEspecial.hora}
                      onChange={(e) => setSolicitudEspecial((prev) => ({ ...prev, hora: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Número de Pasajeros</Label>
                  <Select
                    value={solicitudEspecial.pasajeros}
                    onValueChange={(value) => setSolicitudEspecial((prev) => ({ ...prev, pasajeros: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 pasajero</SelectItem>
                      <SelectItem value="2">2 pasajeros</SelectItem>
                      <SelectItem value="3">3 pasajeros</SelectItem>
                      <SelectItem value="4">4+ pasajeros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Comentarios</Label>
                  <Textarea
                    placeholder="Detalles adicionales del viaje..."
                    value={solicitudEspecial.comentarios}
                    onChange={(e) => setSolicitudEspecial((prev) => ({ ...prev, comentarios: e.target.value }))}
                  />
                </div>
                <Button className="w-full" onClick={handleSolicitudEspecial}>
                  Enviar Solicitud a Secretaría
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pagos" className="space-y-4">
            {/* Saldo Actual */}
            <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Saldo Disponible</p>
                    <p className="text-3xl font-bold">Bs. {saldoBilletera.toFixed(2)}</p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">💳</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Métodos de Pago */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>💳</span>
                  Métodos de Pago
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {metodosDisponibles.map((metodo) => (
                  <div
                    key={metodo.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      metodoPagoSeleccionado === metodo.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
                    }`}
                    onClick={() => setMetodoPagoSeleccionado(metodo.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{metodo.icono}</span>
                        <div>
                          <p className="font-medium">{metodo.nombre}</p>
                          {metodo.saldo && (
                            <p className="text-sm text-gray-600">Saldo: Bs. {metodo.saldo.toFixed(2)}</p>
                          )}
                        </div>
                      </div>
                      {metodoPagoSeleccionado === metodo.id && <CheckCircle className="w-5 h-5 text-blue-600" />}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recargar Saldo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>💰</span>
                  Recargar Saldo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[20, 50, 100].map((monto) => (
                    <Button
                      key={monto}
                      variant="outline"
                      className="h-12 bg-transparent"
                      onClick={() => handleRecargarSaldo(monto)}
                    >
                      Bs. {monto}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Monto personalizado" type="number" id="monto-personalizado" />
                  <Button
                    onClick={() => {
                      const input = document.getElementById("monto-personalizado") as HTMLInputElement
                      const monto = Number.parseFloat(input.value)
                      if (monto > 0) {
                        handleRecargarSaldo(monto)
                        input.value = ""
                      }
                    }}
                  >
                    Recargar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Historial de Pagos */}
            <Card>
              <CardHeader>
                <CardTitle>Últimos Pagos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { fecha: "2024-01-16", concepto: "Viaje Warnes → Satélite Norte", monto: -20, metodo: "QR" },
                    { fecha: "2024-01-15", concepto: "Viaje Warnes → Montero", monto: -15, metodo: "Billetera" },
                    { fecha: "2024-01-14", concepto: "Recarga Tigo Money", monto: +50, metodo: "Tigo Money" },
                    { fecha: "2024-01-12", concepto: "Viaje Montero → Warnes", monto: -15, metodo: "QR" },
                  ].map((pago, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{pago.concepto}</p>
                        <p className="text-sm text-gray-600">
                          {pago.fecha} • {pago.metodo}
                        </p>
                      </div>
                      <p className={`font-semibold ${pago.monto > 0 ? "text-green-600" : "text-red-600"}`}>
                        {pago.monto > 0 ? "+" : ""}Bs. {Math.abs(pago.monto)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="viajes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Viajes Activos</CardTitle>
              </CardHeader>
              <CardContent>
                {cargandoViajes ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando viajes...</p>
                  </div>
                ) : viajes.length > 0 ? (
                  <div className="space-y-3">
                    {viajes.map((viaje: any) => (
                      <div key={viaje.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">
                            {viaje.origen} → {viaje.destino}
                          </p>
                          <Badge variant={viaje.estado === "completado" ? "default" : "secondary"}>
                            {viaje.estado}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {new Date(viaje.fecha_viaje).toLocaleDateString()} - Bs. {viaje.precio}
                        </p>
                        {viaje.estado === "en_curso" && (
                          <Button
                            size="sm"
                            className="mt-2"
                            onClick={() => (window.location.href = `/seguimiento/${viaje.id}`)}
                          >
                            Ver Seguimiento
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Car className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No tienes viajes activos</p>
                    <p className="text-sm">Reserva un asiento para ver tus viajes aquí</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historial" className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Historial de Viajes</h3>
              {historialViajes.map((viaje) => (
                <Card key={viaje.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{viaje.ruta}</span>
                      </div>
                      <Badge variant="outline">Bs. {viaje.precio}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div>
                        <p>Conductor: {viaje.conductor}</p>
                        <p>Fecha: {viaje.fecha}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < viaje.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => (window.location.href = `/calificar-viaje/${viaje.id}`)}
                      >
                        <Star className="w-4 h-4 mr-1" />
                        Calificar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => (window.location.href = `/reputacion-conductor/conductor-${viaje.id}`)}
                      >
                        Ver Perfil
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="perfil" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Mi Perfil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={usuario?.avatar_url || "/placeholder-user.jpg"} />
                    <AvatarFallback>{usuario?.nombre?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{usuario?.nombre || "Usuario"}</h3>
                    <p className="text-gray-600">
                      Usuario desde{" "}
                      {usuario?.fecha_registro ? new Date(usuario.fecha_registro).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input defaultValue={usuario?.nombre || ""} id="nombre-perfil" />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input defaultValue={usuario?.telefono || ""} id="telefono-perfil" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue={usuario?.email || ""} id="email-perfil" />
                </div>

                <Button
                  className="w-full"
                  onClick={() => {
                    const nombre = (document.getElementById("nombre-perfil") as HTMLInputElement).value
                    const telefono = (document.getElementById("telefono-perfil") as HTMLInputElement).value
                    const email = (document.getElementById("email-perfil") as HTMLInputElement).value

                    handleActualizarPerfil({ nombre, telefono, email })
                  }}
                >
                  Actualizar Perfil
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
