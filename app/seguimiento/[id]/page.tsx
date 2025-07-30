"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Phone, MessageCircle, MapPin, Clock, Star, Navigation, Share2 } from "lucide-react"
import MapaTiempoReal from "@/components/mapa-tiempo-real"

export default function SeguimientoViaje() {
  const [tiempoEstimado, setTiempoEstimado] = useState(12)
  const [distancia, setDistancia] = useState(8.5)

  // Datos del viaje actual
  const viajeActual = {
    id: "1",
    conductor: "Carlos Mendoza",
    vehiculo: "Toyota Hiace",
    placa: "ABC123",
    telefono: "70123456",
    rating: 4.8,
    origen: "Warnes - Terminal",
    destino: "Montero - Plaza Principal",
    precio: 15,
    asientos: 2,
    estado: "en_camino", // confirmado, en_camino, llegando, completado
  }

  // Vehículo en el mapa
  const vehiculos = [
    {
      id: "1",
      conductor: "Carlos Mendoza",
      vehiculo: "Toyota Hiace",
      placa: "ABC123",
      lat: -17.7833,
      lng: -63.1821,
      estado: "en_viaje" as const,
      pasajeros: 8,
      capacidad: 12,
      destino: "Montero",
      tiempoEstimado: tiempoEstimado,
      telefono: "70123456",
    },
  ]

  // Actualizar tiempo estimado
  useEffect(() => {
    const interval = setInterval(() => {
      setTiempoEstimado((prev) => Math.max(0, prev - 1))
      setDistancia((prev) => Math.max(0, prev - 0.1))
    }, 10000) // Cada 10 segundos

    return () => clearInterval(interval)
  }, [])

  const obtenerEstadoTexto = (estado: string) => {
    switch (estado) {
      case "confirmado":
        return "Viaje Confirmado"
      case "en_camino":
        return "En Camino"
      case "llegando":
        return "Llegando"
      case "completado":
        return "Completado"
      default:
        return "Desconocido"
    }
  }

  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case "confirmado":
        return "bg-blue-500"
      case "en_camino":
        return "bg-green-500"
      case "llegando":
        return "bg-orange-500"
      case "completado":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-blue-700"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Seguimiento en Vivo</h1>
            <p className="text-blue-100 text-sm">Tu viaje está en progreso</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Estado del Viaje */}
        <Card className="border-l-4 border-l-green-500 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 ${obtenerColorEstado(viajeActual.estado)} rounded-full animate-pulse`}></div>
                <div>
                  <h3 className="font-semibold">{obtenerEstadoTexto(viajeActual.estado)}</h3>
                  <p className="text-sm text-gray-600">Tiempo estimado: {tiempoEstimado} minutos</p>
                </div>
              </div>
              <Badge variant="default">En Vivo</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Información del Conductor */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback>CM</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">{viajeActual.conductor}</h4>
                  <p className="text-sm text-gray-600">
                    {viajeActual.vehiculo} - {viajeActual.placa}
                  </p>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{viajeActual.rating}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Origen</p>
                <p className="font-medium">{viajeActual.origen}</p>
              </div>
              <div>
                <p className="text-gray-600">Destino</p>
                <p className="font-medium">{viajeActual.destino}</p>
              </div>
              <div>
                <p className="text-gray-600">Distancia</p>
                <p className="font-medium">{distancia.toFixed(1)} km</p>
              </div>
              <div>
                <p className="text-gray-600">Precio</p>
                <p className="font-medium">Bs. {viajeActual.precio}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mapa en Tiempo Real */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="w-5 h-5" />
              Ubicación en Tiempo Real
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <MapaTiempoReal
              vehiculos={vehiculos}
              mostrarRutas={true}
              vehiculoSeleccionado="1"
              centroMapa={{ lat: -17.7833, lng: -63.1821 }}
              zoom={14}
            />
          </CardContent>
        </Card>

        {/* Progreso del Viaje */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Progreso del Viaje</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              {[
                { estado: "confirmado", texto: "Viaje confirmado", tiempo: "14:45", completado: true },
                { estado: "en_camino", texto: "Conductor en camino", tiempo: "14:50", completado: true },
                { estado: "recogida", texto: "Pasajero recogido", tiempo: "15:05", completado: true },
                { estado: "en_ruta", texto: "En ruta al destino", tiempo: "15:10", completado: true },
                { estado: "llegada", texto: "Llegada al destino", tiempo: "15:22", completado: false },
              ].map((paso, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      paso.completado ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    {paso.completado && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${paso.completado ? "text-gray-900" : "text-gray-500"}`}>{paso.texto}</p>
                    <p className="text-xs text-gray-500">{paso.tiempo}</p>
                  </div>
                  {paso.completado && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Información Adicional */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <p className="text-sm text-gray-600">Tiempo Estimado</p>
                <p className="font-bold text-blue-600">{tiempoEstimado} min</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <MapPin className="w-6 h-6 mx-auto mb-2 text-green-600" />
                <p className="text-sm text-gray-600">Distancia</p>
                <p className="font-bold text-green-600">{distancia.toFixed(1)} km</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acciones */}
        <div className="space-y-3">
          <Button variant="outline" className="w-full bg-transparent">
            <Share2 className="w-4 h-4 mr-2" />
            Compartir Ubicación
          </Button>

          <Button variant="outline" className="w-full bg-transparent">
            <MessageCircle className="w-4 h-4 mr-2" />
            Reportar Problema
          </Button>
        </div>

        {/* Información de Emergencia */}
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <h4 className="font-semibold text-red-800 mb-2">Información de Emergencia</h4>
            <p className="text-sm text-red-700 mb-3">
              En caso de emergencia, contacta inmediatamente a las autoridades o al sindicato.
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1 bg-transparent border-red-300 text-red-700">
                Policía: 110
              </Button>
              <Button size="sm" variant="outline" className="flex-1 bg-transparent border-red-300 text-red-700">
                Sindicato: 123
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
