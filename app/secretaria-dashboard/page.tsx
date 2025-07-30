"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Car,
  Users,
  MessageCircle,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  Send,
  BarChart3,
  DollarSign,
  CreditCard,
  Banknote,
  XCircle,
  Star,
  Award,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import MapaTiempoReal from "@/components/mapa-tiempo-real"

export default function SecretariaDashboard() {
  const [selectedTab, setSelectedTab] = useState("solicitudes")
  const [transaccionesHoy, setTransaccionesHoy] = useState([
    {
      id: 1,
      conductor: "Carlos Mendoza",
      pasajero: "Ana López",
      monto: 15,
      metodo: "QR",
      estado: "completado",
      hora: "14:30",
      comision: 1.5,
    },
    {
      id: 2,
      conductor: "María González",
      pasajero: "Roberto Silva",
      monto: 15,
      metodo: "Tigo Money",
      estado: "completado",
      hora: "15:00",
      comision: 1.5,
    },
    {
      id: 3,
      conductor: "Pedro Rojas",
      pasajero: "Carmen Ruiz",
      monto: 15,
      metodo: "Billetera",
      estado: "pendiente",
      hora: "15:30",
      comision: 1.5,
    },
  ])

  const [solicitudesRetiro, setSolicitudesRetiro] = useState([
    {
      id: 1,
      conductor: "Carlos Mendoza",
      monto: 180,
      metodo: "Tigo Money",
      telefono: "70123456",
      fecha: "2024-01-15",
      estado: "pendiente",
    },
    {
      id: 2,
      conductor: "María González",
      monto: 210,
      metodo: "Banco Unión",
      cuenta: "****1234",
      fecha: "2024-01-15",
      estado: "procesando",
    },
  ])

  const solicitudesEspeciales = [
    {
      id: 1,
      pasajero: "María Rodríguez",
      telefono: "70555666",
      destino: "Santa Cruz",
      fecha: "2024-01-20",
      hora: "08:00",
      pasajeros: 3,
      comentarios: "Viaje familiar, necesitamos salir temprano",
    },
    {
      id: 2,
      pasajero: "José Pérez",
      telefono: "70777888",
      destino: "Cochabamba",
      fecha: "2024-01-22",
      hora: "14:00",
      pasajeros: 1,
      comentarios: "Viaje de trabajo urgente",
    },
  ]

  const conductoresActivos = [
    {
      id: 1,
      nombre: "Carlos Mendoza",
      vehiculo: "Toyota Hiace - ABC123",
      estado: "disponible",
      ubicacion: "Warnes",
      telefono: "70123456",
      pasajeros: 8,
      capacidad: 12,
    },
    {
      id: 2,
      nombre: "María González",
      vehiculo: "Nissan Urvan - XYZ789",
      estado: "en_viaje",
      ubicacion: "En ruta a Montero",
      telefono: "70987654",
      pasajeros: 10,
      capacidad: 12,
    },
    {
      id: 3,
      nombre: "Pedro Rojas",
      vehiculo: "Ford Transit - DEF456",
      estado: "disponible",
      ubicacion: "Montero",
      telefono: "70456789",
      pasajeros: 5,
      capacidad: 12,
    },
  ]

  const estadisticasHoy = {
    totalViajes: 24,
    totalPasajeros: 186,
    ingresos: 2790,
    conductoresActivos: 8,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-purple-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Secretaría - Control Central</h1>
            <p className="text-purple-100">Sindicato 27 de Noviembre</p>
          </div>
          <Avatar>
            <AvatarImage src="/placeholder-user.jpg" />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="p-4">
        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Car className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold">{estadisticasHoy.totalViajes}</p>
              <p className="text-sm text-gray-600">Viajes Hoy</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold">{estadisticasHoy.totalPasajeros}</p>
              <p className="text-sm text-gray-600">Pasajeros</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold">Bs. {estadisticasHoy.ingresos}</p>
              <p className="text-sm text-gray-600">Ingresos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <p className="text-2xl font-bold">{estadisticasHoy.conductoresActivos}</p>
              <p className="text-sm text-gray-600">Conductores</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="solicitudes">Solicitudes</TabsTrigger>
            <TabsTrigger value="conductores">Conductores</TabsTrigger>
            <TabsTrigger value="pagos">Pagos</TabsTrigger>
            <TabsTrigger value="calificaciones">Calificaciones</TabsTrigger>
            <TabsTrigger value="mensajes">Mensajes</TabsTrigger>
            <TabsTrigger value="reportes">Reportes</TabsTrigger>
          </TabsList>

          <TabsContent value="solicitudes" className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Solicitudes de Viajes Especiales</h3>
              {solicitudesEspeciales.map((solicitud) => (
                <Card key={solicitud.id} className="border-l-4 border-l-orange-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{solicitud.pasajero}</h4>
                        <p className="text-sm text-gray-600">Destino: {solicitud.destino}</p>
                      </div>
                      <Badge variant="outline">{solicitud.pasajeros} pasajero(s)</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {solicitud.fecha} - {solicitud.hora}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {solicitud.telefono}
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm">
                        <strong>Comentarios:</strong> {solicitud.comentarios}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Asignar Conductor
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="w-4 h-4 mr-1" />
                        Llamar
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Mensaje
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Formulario para Nueva Solicitud */}
            <Card>
              <CardHeader>
                <CardTitle>Registrar Nueva Solicitud</CardTitle>
                <CardDescription>Para solicitudes telefónicas o presenciales</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre del Pasajero</Label>
                    <Input placeholder="Nombre completo" />
                  </div>
                  <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <Input placeholder="+591 70000000" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Destino</Label>
                    <Input placeholder="Ciudad de destino" />
                  </div>
                  <div className="space-y-2">
                    <Label>Número de Pasajeros</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 pasajero</SelectItem>
                        <SelectItem value="2">2 pasajeros</SelectItem>
                        <SelectItem value="3">3 pasajeros</SelectItem>
                        <SelectItem value="4">4+ pasajeros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fecha</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Hora</Label>
                    <Input type="time" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Comentarios</Label>
                  <Textarea placeholder="Detalles adicionales del viaje..." />
                </div>
                <Button className="w-full">Registrar Solicitud</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conductores" className="space-y-4">
            {/* Mapa de Control Central */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Control Central - Todos los Vehículos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MapaTiempoReal
                  vehiculos={conductoresActivos.map((conductor) => ({
                    id: conductor.id.toString(),
                    conductor: conductor.nombre,
                    vehiculo: conductor.vehiculo,
                    placa: conductor.vehiculo.split(" - ")[1] || "ABC123",
                    lat: -17.7833 + conductor.id * 0.005,
                    lng: -63.1821 + conductor.id * 0.005,
                    estado: conductor.estado === "disponible" ? "disponible" : "en_viaje",
                    pasajeros: conductor.pasajeros,
                    capacidad: conductor.capacidad,
                    telefono: conductor.telefono,
                  }))}
                  centroMapa={{ lat: -17.7833, lng: -63.1821 }}
                  zoom={12}
                  onVehiculoClick={(vehiculo) => {
                    // Aquí se puede implementar lógica adicional
                    console.log("Vehículo seleccionado:", vehiculo)
                  }}
                />
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Estado Detallado de Conductores</h3>
              {conductoresActivos.map((conductor) => (
                <Card key={conductor.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src="/placeholder-user.jpg" />
                          <AvatarFallback>
                            {conductor.nombre
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{conductor.nombre}</h4>
                          <p className="text-sm text-gray-600">{conductor.vehiculo}</p>
                        </div>
                      </div>
                      <Badge variant={conductor.estado === "disponible" ? "default" : "secondary"}>
                        {conductor.estado === "disponible" ? "Disponible" : "En Viaje"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {conductor.ubicacion}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {conductor.pasajeros}/{conductor.capacidad}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        <Phone className="w-4 h-4 mr-1" />
                        Llamar
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Mensaje
                      </Button>
                      <Button size="sm" variant="outline">
                        <MapPin className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pagos" className="space-y-4">
            {/* Resumen Financiero */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold text-green-600">Bs. 2,790</p>
                  <p className="text-sm text-gray-600">Ingresos Hoy</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <CreditCard className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold text-blue-600">Bs. 279</p>
                  <p className="text-sm text-gray-600">Comisiones</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-2xl font-bold text-purple-600">186</p>
                  <p className="text-sm text-gray-600">Transacciones</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                  <p className="text-2xl font-bold text-orange-600">3</p>
                  <p className="text-sm text-gray-600">Pendientes</p>
                </CardContent>
              </Card>
            </div>

            {/* Transacciones Recientes */}
            <Card>
              <CardHeader>
                <CardTitle>Transacciones Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transaccionesHoy.map((transaccion) => (
                    <div key={transaccion.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium">{transaccion.pasajero}</p>
                          <Badge variant={transaccion.estado === "completado" ? "default" : "secondary"}>
                            {transaccion.estado === "completado" ? "Completado" : "Pendiente"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Conductor: {transaccion.conductor} • {transaccion.metodo} • {transaccion.hora}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold">Bs. {transaccion.monto}</p>
                        <p className="text-xs text-gray-500">Comisión: Bs. {transaccion.comision}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Solicitudes de Retiro */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="w-5 h-5" />
                  Solicitudes de Retiro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {solicitudesRetiro.map((solicitud) => (
                    <div key={solicitud.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{solicitud.conductor}</h4>
                          <p className="text-sm text-gray-600">
                            {solicitud.metodo} • {solicitud.telefono || solicitud.cuenta}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">Bs. {solicitud.monto}</p>
                          <Badge
                            variant={
                              solicitud.estado === "completado"
                                ? "default"
                                : solicitud.estado === "procesando"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {solicitud.estado === "completado"
                              ? "Completado"
                              : solicitud.estado === "procesando"
                                ? "Procesando"
                                : "Pendiente"}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span>Solicitado: {solicitud.fecha}</span>
                      </div>

                      {solicitud.estado === "pendiente" && (
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Aprobar
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                            <XCircle className="w-4 h-4 mr-1" />
                            Rechazar
                          </Button>
                          <Button size="sm" variant="outline">
                            <Phone className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Configuración de Pagos */}
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Pagos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tarifa Base</Label>
                    <Input defaultValue="15" type="number" />
                  </div>
                  <div className="space-y-2">
                    <Label>Comisión (%)</Label>
                    <Input defaultValue="10" type="number" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Métodos de Pago Activos</Label>
                  <div className="space-y-2">
                    {[
                      { id: "qr", nombre: "Código QR", activo: true },
                      { id: "tigo", nombre: "Tigo Money", activo: true },
                      { id: "union", nombre: "Banco Unión", activo: true },
                      { id: "billetera", nombre: "Billetera Digital", activo: true },
                      { id: "efectivo", nombre: "Efectivo", activo: true },
                    ].map((metodo) => (
                      <div key={metodo.id} className="flex items-center justify-between p-2 border rounded">
                        <span>{metodo.nombre}</span>
                        <Switch checked={metodo.activo} />
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="w-full">Guardar Configuración</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calificaciones" className="space-y-4">
            {/* Resumen de Calificaciones del Sindicato */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                  <p className="text-2xl font-bold text-yellow-600">4.7</p>
                  <p className="text-sm text-gray-600">Promedio General</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Award className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold text-green-600">6</p>
                  <p className="text-sm text-gray-600">Conductores 5★</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold text-blue-600">342</p>
                  <p className="text-sm text-gray-600">Comentarios</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-2xl font-bold text-purple-600">98%</p>
                  <p className="text-sm text-gray-600">Satisfacción</p>
                </CardContent>
              </Card>
            </div>

            {/* Ranking de Conductores */}
            <Card>
              <CardHeader>
                <CardTitle>Ranking de Conductores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { nombre: "Carlos Mendoza", rating: 4.9, viajes: 127, posicion: 1 },
                    { nombre: "María González", rating: 4.8, viajes: 98, posicion: 2 },
                    { nombre: "Pedro Rojas", rating: 4.7, viajes: 156, posicion: 3 },
                    { nombre: "Ana Morales", rating: 4.6, viajes: 89, posicion: 4 },
                  ].map((conductor) => (
                    <div key={conductor.nombre} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          conductor.posicion === 1
                            ? "bg-yellow-500"
                            : conductor.posicion === 2
                              ? "bg-gray-400"
                              : conductor.posicion === 3
                                ? "bg-orange-600"
                                : "bg-gray-300"
                        }`}
                      >
                        {conductor.posicion}
                      </div>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src="/placeholder-user.jpg" />
                        <AvatarFallback>
                          {conductor.nombre
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{conductor.nombre}</p>
                        <p className="text-sm text-gray-600">{conductor.viajes} viajes</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold">{conductor.rating}</span>
                      </div>
                      <Button size="sm" variant="outline">
                        Ver Perfil
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Comentarios Recientes que Requieren Atención */}
            <Card>
              <CardHeader>
                <CardTitle>Comentarios que Requieren Atención</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      pasajero: "Juan Pérez",
                      conductor: "Luis Vargas",
                      rating: 2,
                      comentario: "El vehículo tenía problemas mecánicos",
                      fecha: "2024-01-15",
                    },
                    {
                      pasajero: "Carmen Ruiz",
                      conductor: "Pedro Rojas",
                      rating: 3,
                      comentario: "Llegó 15 minutos tarde",
                      fecha: "2024-01-14",
                    },
                  ].map((comentario, index) => (
                    <div key={index} className="p-3 border-l-4 border-l-red-500 bg-red-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold">
                          {comentario.pasajero} → {comentario.conductor}
                        </p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < comentario.rating ? "fill-red-400 text-red-400" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{comentario.comentario}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">{comentario.fecha}</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Contactar Conductor
                          </Button>
                          <Button size="sm" variant="outline">
                            Marcar como Revisado
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mensajes" className="space-y-4">
            {/* Enviar Mensaje Grupal */}
            <Card>
              <CardHeader>
                <CardTitle>Enviar Mensaje a Conductores</CardTitle>
                <CardDescription>Envía mensajes a todos los conductores o a uno específico</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Destinatario</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar destinatario" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los conductores</SelectItem>
                      <SelectItem value="carlos">Carlos Mendoza</SelectItem>
                      <SelectItem value="maria">María González</SelectItem>
                      <SelectItem value="pedro">Pedro Rojas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Mensaje</Label>
                  <Textarea placeholder="Escribe tu mensaje aquí..." className="min-h-[100px]" />
                </div>
                <Button className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Mensaje
                </Button>
              </CardContent>
            </Card>

            {/* Mensajes Predefinidos */}
            <Card>
              <CardHeader>
                <CardTitle>Mensajes Rápidos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  "Hay alta demanda en la ruta Warnes-Montero"
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  "Recordatorio: Reunión de conductores el viernes"
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  "Solicitud especial de viaje disponible"
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  "Favor confirmar disponibilidad para mañana"
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reportes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reportes del Día</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600">24</p>
                    <p className="text-sm text-gray-600">Viajes Completados</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">186</p>
                    <p className="text-sm text-gray-600">Pasajeros Transportados</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Rutas más Utilizadas</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>Warnes → Montero</span>
                      <Badge>14 viajes</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>Montero → Warnes</span>
                      <Badge>10 viajes</Badge>
                    </div>
                  </div>
                </div>

                <Button className="w-full">Generar Reporte Completo</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
