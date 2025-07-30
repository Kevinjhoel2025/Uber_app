"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Search, Filter, MapPin, Navigation, Layers } from "lucide-react"
import MapaTiempoReal from "@/components/mapa-tiempo-real"

export default function MapaGeneral() {
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [busqueda, setBusqueda] = useState("")
  const [vistaCapas, setVistaCapas] = useState("normal")

  // Todos los vehículos del sindicato
  const todosVehiculos = [
    {
      id: "1",
      conductor: "Carlos Mendoza",
      vehiculo: "Toyota Hiace",
      placa: "ABC123",
      lat: -17.7833,
      lng: -63.1821,
      estado: "disponible" as const,
      pasajeros: 8,
      capacidad: 12,
      telefono: "70123456",
    },
    {
      id: "2",
      conductor: "María González",
      vehiculo: "Nissan Urvan",
      placa: "XYZ789",
      lat: -17.79,
      lng: -63.19,
      estado: "en_viaje" as const,
      pasajeros: 10,
      capacidad: 12,
      destino: "Montero",
      tiempoEstimado: 15,
      telefono: "70987654",
    },
    {
      id: "3",
      conductor: "Pedro Rojas",
      vehiculo: "Ford Transit",
      placa: "DEF456",
      lat: -17.77,
      lng: -63.17,
      estado: "disponible" as const,
      pasajeros: 5,
      capacidad: 12,
      telefono: "70456789",
    },
    {
      id: "4",
      conductor: "Ana Morales",
      vehiculo: "Chevrolet Express",
      placa: "GHI789",
      lat: -17.795,
      lng: -63.195,
      estado: "fuera_servicio" as const,
      pasajeros: 0,
      capacidad: 15,
      telefono: "70321654",
    },
    {
      id: "5",
      conductor: "Luis Vargas",
      vehiculo: "Mercedes Sprinter",
      placa: "JKL012",
      lat: -17.76,
      lng: -63.16,
      estado: "en_viaje" as const,
      pasajeros: 12,
      capacidad: 15,
      destino: "Warnes",
      tiempoEstimado: 8,
      telefono: "70654321",
    },
  ]

  // Filtrar vehículos
  const vehiculosFiltrados = todosVehiculos.filter((vehiculo) => {
    const coincideBusqueda =
      busqueda === "" ||
      vehiculo.conductor.toLowerCase().includes(busqueda.toLowerCase()) ||
      vehiculo.placa.toLowerCase().includes(busqueda.toLowerCase())

    const coincidenEstado = filtroEstado === "todos" || vehiculo.estado === filtroEstado

    return coincideBusqueda && coincidenEstado
  })

  const estadisticas = {
    total: todosVehiculos.length,
    disponibles: todosVehiculos.filter((v) => v.estado === "disponible").length,
    enViaje: todosVehiculos.filter((v) => v.estado === "en_viaje").length,
    fueraServicio: todosVehiculos.filter((v) => v.estado === "fuera_servicio").length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-purple-600 text-white p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-purple-700"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Mapa General</h1>
            <p className="text-purple-100 text-sm">Todos los vehículos en tiempo real</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{estadisticas.total}</p>
              <p className="text-xs text-gray-600">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{estadisticas.disponibles}</p>
              <p className="text-xs text-gray-600">Disponibles</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{estadisticas.enViaje}</p>
              <p className="text-xs text-gray-600">En Viaje</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-gray-600">{estadisticas.fueraServicio}</p>
              <p className="text-xs text-gray-600">Fuera</p>
            </CardContent>
          </Card>
        </div>

        {/* Controles de Filtro */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar conductor o placa..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="disponible">Disponibles</SelectItem>
                  <SelectItem value="en_viaje">En Viaje</SelectItem>
                  <SelectItem value="fuera_servicio">Fuera de Servicio</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Mapa Principal */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Mapa en Tiempo Real
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Layers className="w-4 h-4 mr-2" />
                  Capas
                </Button>
                <Button variant="outline" size="sm">
                  <Navigation className="w-4 h-4 mr-2" />
                  Centrar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <MapaTiempoReal
              vehiculos={vehiculosFiltrados}
              centroMapa={{ lat: -17.7833, lng: -63.1821 }}
              zoom={11}
              mostrarRutas={true}
            />
          </CardContent>
        </Card>

        {/* Rutas Principales */}
        <Card>
          <CardHeader>
            <CardTitle>Rutas Principales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { nombre: "Warnes → Montero", vehiculos: 3, tiempo: "25 min", distancia: "18 km" },
                { nombre: "Montero → Warnes", vehiculos: 2, tiempo: "25 min", distancia: "18 km" },
                { nombre: "Warnes → Santa Cruz", vehiculos: 1, tiempo: "45 min", distancia: "35 km" },
              ].map((ruta, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{ruta.nombre}</p>
                    <p className="text-sm text-gray-600">
                      {ruta.distancia} • {ruta.tiempo}
                    </p>
                  </div>
                  <Badge variant="outline">{ruta.vehiculos} vehículos</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alertas y Notificaciones */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800">Alertas del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Tráfico intenso en la ruta Warnes-Montero</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Vehículo ABC123 sin actualizar ubicación por 10 min</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Todos los vehículos operando normalmente</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
