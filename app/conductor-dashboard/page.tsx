"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Car,
  Users,
  Clock,
  Star,
  MessageCircle,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  DollarSign,
  CreditCard,
  QrCode,
  Smartphone,
  Banknote,
  Navigation,
  Award,
} from "lucide-react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import MapaTiempoReal from "@/components/mapa-tiempo-real"

export default function ConductorDashboard() {
  const [isOnline, setIsOnline] = useState(true)
  const [selectedTab, setSelectedTab] = useState("viajes")
  const [gananciasHoy, setGananciasHoy] = useState(210)
  const [pagosPendientes, setPagosPendientes] = useState([
    {
      id: 1,
      pasajero: "Ana López",
      monto: 15,
      metodo: "QR",
      estado: "completado",
      hora: "14:30",
    },
    {
      id: 2,
      pasajero: "Roberto Silva",
      monto: 15,
      metodo: "Tigo Money",
      estado: "pendiente",
      hora: "15:00",
    },
  ])

  const reservasPendientes = [
    {
      id: 1,
      pasajero: "Ana López",
      telefono: "70111222",
      origen: "Warnes",
      destino: "Montero",
      hora: "15:00",
      asientos: 2,
    },
    {
      id: 2,
      pasajero: "Roberto Silva",
      telefono: "70333444",
      origen: "Montero",
      destino: "Warnes",
      hora: "16:30",
      asientos: 1,
    },
  ]

  const viajesHoy = [
    {
      id: 1,
      hora: "14:30",
      ruta: "Warnes → Montero",
      pasajeros: 8,
      capacidad: 12,
      estado: "completado",
      ganancia: 120,
    },
    {
      id: 2,
      hora: "16:00",
      ruta: "Montero → Warnes",
      pasajeros: 6,
      capacidad: 12,
      estado: "en_curso",
      ganancia: 90,
    },
  ]

  const mensajesSecretaria = [
    {
      id: 1,
      mensaje: "Hay una solicitud especial para viaje a Santa Cruz mañana a las 8:00 AM",
      hora: "10:30",
      leido: false,
    },
    {
      id: 2,
      mensaje: "Recordatorio: Reunión de conductores el viernes a las 7:00 PM",
      hora: "09:15",
      leido: true,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Conductor: Carlos</h1>
            <p className="text-green-100">Toyota Hiace - ABC123</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch checked={isOnline} onCheckedChange={setIsOnline} className="data-[state=checked]:bg-white" />
              <span className="text-sm">{isOnline ? "En línea" : "Fuera de línea"}</span>
            </div>
            <Avatar>
              <AvatarImage src="/placeholder-user.jpg" />
              <AvatarFallback>CM</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="viajes">Viajes</TabsTrigger>
            <TabsTrigger value="reservas">Reservas</TabsTrigger>
            <TabsTrigger value="pagos">Pagos</TabsTrigger>
            <TabsTrigger value="calificaciones">Ratings</TabsTrigger>
            <TabsTrigger value="mensajes">Mensajes</TabsTrigger>
            <TabsTrigger value="perfil">Perfil</TabsTrigger>
          </TabsList>

          <TabsContent value="viajes" className="space-y-4">
            {/* Estado Actual */}
            <Card
              className={`border-l-4 ${isOnline ? "border-l-green-500 bg-green-50" : "border-l-red-500 bg-red-50"}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${isOnline ? "bg-green-100" : "bg-red-100"}`}
                    >
                      <Car className={`w-6 h-6 ${isOnline ? "text-green-600" : "text-red-600"}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{isOnline ? "Disponible para viajes" : "Fuera de servicio"}</h3>
                      <p className="text-sm text-gray-600">
                        {isOnline ? "Esperando pasajeros..." : "No estás recibiendo solicitudes"}
                      </p>
                    </div>
                  </div>
                  <Badge variant={isOnline ? "default" : "secondary"}>{isOnline ? "ACTIVO" : "INACTIVO"}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Mi Ubicación en el Mapa */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="w-5 h-5" />
                  Mi Ubicación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MapaTiempoReal
                  vehiculos={[
                    {
                      id: "mi-vehiculo",
                      conductor: "Carlos Mendoza",
                      vehiculo: "Toyota Hiace",
                      placa: "ABC123",
                      lat: -17.7833,
                      lng: -63.1821,
                      estado: isOnline ? "disponible" : "fuera_servicio",
                      pasajeros: 8,
                      capacidad: 12,
                      telefono: "70123456",
                    },
                  ]}
                  vehiculoSeleccionado="mi-vehiculo"
                  centroMapa={{ lat: -17.7833, lng: -63.1821 }}
                  zoom={15}
                />

                <div className="mt-4 flex gap-2">
                  <Button size="sm" className="flex-1">
                    <Navigation className="w-4 h-4 mr-2" />
                    Iniciar Navegación
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    <MapPin className="w-4 h-4 mr-2" />
                    Actualizar Ubicación
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Viajes de Hoy */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Viajes de Hoy</h3>
              {viajesHoy.map((viaje) => (
                <Card key={viaje.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{viaje.hora}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span>{viaje.ruta}</span>
                        </div>
                      </div>
                      <Badge variant={viaje.estado === "completado" ? "default" : "secondary"}>
                        {viaje.estado === "completado" ? "Completado" : "En Curso"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {viaje.pasajeros}/{viaje.capacidad} pasajeros
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          Bs. {viaje.ganancia}
                        </div>
                      </div>
                      {viaje.estado === "completado" ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Button size="sm">Ver Detalles</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Resumen del Día */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen del Día</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">2</p>
                    <p className="text-sm text-gray-600">Viajes</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">14</p>
                    <p className="text-sm text-gray-600">Pasajeros</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">210</p>
                    <p className="text-sm text-gray-600">Bs. Ganados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reservas" className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Reservas Pendientes</h3>
              {reservasPendientes.map((reserva) => (
                <Card key={reserva.id} className="border-l-4 border-l-orange-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{reserva.pasajero}</h4>
                        <p className="text-sm text-gray-600">
                          {reserva.origen} → {reserva.destino}
                        </p>
                      </div>
                      <Badge variant="outline">{reserva.asientos} asiento(s)</Badge>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {reserva.hora}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {reserva.telefono}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Aceptar
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        <XCircle className="w-4 h-4 mr-1" />
                        Rechazar
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pagos" className="space-y-4">
            {/* Resumen de Ganancias */}
            <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Ganancias de Hoy</p>
                    <p className="text-3xl font-bold">Bs. {gananciasHoy}</p>
                    <p className="text-green-100 text-sm">14 pasajeros transportados</p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <DollarSign className="w-8 h-8" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pagos Recientes */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Pagos Recientes</h3>
              {pagosPendientes.map((pago) => (
                <Card
                  key={pago.id}
                  className={`border-l-4 ${pago.estado === "completado" ? "border-l-green-500" : "border-l-orange-500"}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{pago.pasajero}</h4>
                        <p className="text-sm text-gray-600">Pago vía {pago.metodo}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">Bs. {pago.monto}</p>
                        <Badge variant={pago.estado === "completado" ? "default" : "secondary"}>
                          {pago.estado === "completado" ? "Recibido" : "Pendiente"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{pago.hora}</span>
                      {pago.estado === "pendiente" && (
                        <Button size="sm" variant="outline">
                          Confirmar Recibo
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Métodos de Cobro */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Mis Métodos de Cobro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 border rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <QrCode className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Código QR Personal</p>
                      <p className="text-sm text-gray-600">Para pagos directos</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Ver QR
                  </Button>
                </div>

                <div className="p-3 border rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Tigo Money</p>
                      <p className="text-sm text-gray-600">70123456</p>
                    </div>
                  </div>
                  <Badge variant="default">Activo</Badge>
                </div>

                <div className="p-3 border rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Banco Unión</p>
                      <p className="text-sm text-gray-600">**** **** **** 1234</p>
                    </div>
                  </div>
                  <Badge variant="default">Activo</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Solicitar Retiro */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="w-5 h-5" />
                  Retirar Ganancias
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Saldo disponible para retiro:</strong> Bs. {gananciasHoy}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Método de Retiro</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tigo">Tigo Money - 70123456</SelectItem>
                      <SelectItem value="union">Banco Unión - ****1234</SelectItem>
                      <SelectItem value="efectivo">Retiro en efectivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Monto a Retirar</Label>
                  <Input placeholder="Bs. 0.00" type="number" />
                </div>

                <Button className="w-full">Solicitar Retiro</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calificaciones" className="space-y-4">
            {/* Resumen de Calificaciones */}
            <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm">Tu Calificación Promedio</p>
                    <div className="flex items-center gap-2">
                      <p className="text-4xl font-bold">4.8</p>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-6 h-6 fill-white text-white" />
                        ))}
                      </div>
                    </div>
                    <p className="text-yellow-100 text-sm">Basado en 127 calificaciones</p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <Award className="w-8 h-8" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Calificaciones Recientes */}
            <Card>
              <CardHeader>
                <CardTitle>Calificaciones Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      pasajero: "Ana López",
                      rating: 5,
                      comentario: "Excelente conductor, muy puntual",
                      fecha: "2024-01-15",
                    },
                    {
                      pasajero: "Roberto Silva",
                      rating: 4,
                      comentario: "Buen viaje, solo el aire acondicionado",
                      fecha: "2024-01-12",
                    },
                    { pasajero: "María González", rating: 5, comentario: "Perfecto como siempre", fecha: "2024-01-10" },
                  ].map((calificacion, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold">{calificacion.pasajero}</p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < calificacion.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{calificacion.comentario}</p>
                      <p className="text-xs text-gray-500">{calificacion.fecha}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Ver Perfil Completo */}
            <Button className="w-full" onClick={() => (window.location.href = "/reputacion-conductor/conductor-1")}>
              <Award className="w-4 h-4 mr-2" />
              Ver Mi Perfil Completo
            </Button>
          </TabsContent>

          <TabsContent value="mensajes" className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Mensajes de Secretaría</h3>
              {mensajesSecretaria.map((mensaje) => (
                <Card key={mensaje.id} className={`${!mensaje.leido ? "border-l-4 border-l-blue-500 bg-blue-50" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Secretaría</span>
                        {!mensaje.leido && (
                          <Badge variant="default" className="text-xs">
                            Nuevo
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{mensaje.hora}</span>
                    </div>
                    <p className="text-sm">{mensaje.mensaje}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Chat con Secretaría */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Enviar Mensaje</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input placeholder="Escribe tu mensaje..." />
                <Button className="w-full">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Enviar a Secretaría
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="perfil" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Información del Conductor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback>CM</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">Carlos Mendoza</h3>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">4.8 (127 viajes)</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre</Label>
                    <Input defaultValue="Carlos Mendoza" />
                  </div>
                  <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <Input defaultValue="+591 70123456" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Vehículo</Label>
                  <Input defaultValue="Toyota Hiace" />
                </div>

                <div className="space-y-2">
                  <Label>Placa</Label>
                  <Input defaultValue="ABC123" />
                </div>

                <div className="space-y-2">
                  <Label>Capacidad</Label>
                  <Input defaultValue="12 pasajeros" />
                </div>

                <Button className="w-full">Actualizar Información</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
