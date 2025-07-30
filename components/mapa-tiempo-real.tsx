"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Navigation, Clock, Car, Users } from "lucide-react"

interface Vehiculo {
  id: string
  conductor: string
  vehiculo: string
  placa: string
  lat: number
  lng: number
  estado: "disponible" | "en_viaje" | "fuera_servicio"
  pasajeros: number
  capacidad: number
  destino?: string
  tiempoEstimado?: number
  telefono: string
}

interface MapaTiempoRealProps {
  vehiculos: Vehiculo[]
  centroMapa?: { lat: number; lng: number }
  zoom?: number
  mostrarRutas?: boolean
  vehiculoSeleccionado?: string
  onVehiculoClick?: (vehiculo: Vehiculo) => void
}

export default function MapaTiempoReal({
  vehiculos,
  centroMapa = { lat: -17.7833, lng: -63.1821 }, // Santa Cruz, Bolivia
  zoom = 12,
  mostrarRutas = false,
  vehiculoSeleccionado,
  onVehiculoClick,
}: MapaTiempoRealProps) {
  const [vehiculosActualizados, setVehiculosActualizados] = useState(vehiculos)
  const [mapaListo, setMapaListo] = useState(false)

  // Simular actualizaciones de ubicación en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setVehiculosActualizados((prev) =>
        prev.map((vehiculo) => {
          if (vehiculo.estado === "en_viaje") {
            // Simular movimiento del vehículo
            const deltaLat = (Math.random() - 0.5) * 0.001
            const deltaLng = (Math.random() - 0.5) * 0.001
            return {
              ...vehiculo,
              lat: vehiculo.lat + deltaLat,
              lng: vehiculo.lng + deltaLng,
              tiempoEstimado: vehiculo.tiempoEstimado ? Math.max(0, vehiculo.tiempoEstimado - 1) : undefined,
            }
          }
          return vehiculo
        }),
      )
    }, 5000) // Actualizar cada 5 segundos

    return () => clearInterval(interval)
  }, [])

  // Simular carga del mapa de Google
  useEffect(() => {
    const timer = setTimeout(() => {
      setMapaListo(true)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case "disponible":
        return "bg-green-500"
      case "en_viaje":
        return "bg-blue-500"
      case "fuera_servicio":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  if (!mapaListo) {
    return (
      <Card className="h-96">
        <CardContent className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando Google Maps...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Mapa Principal */}
      <Card>
        <CardContent className="p-0">
          <div className="relative h-96 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg overflow-hidden">
            {/* Simulación del mapa de Google Maps */}
            <div className="absolute inset-0 bg-gray-200">
              {/* Calles simuladas */}
              <div className="absolute top-20 left-0 w-full h-1 bg-gray-400"></div>
              <div className="absolute top-40 left-0 w-full h-1 bg-gray-400"></div>
              <div className="absolute top-60 left-0 w-full h-1 bg-gray-400"></div>
              <div className="absolute top-0 left-20 w-1 h-full bg-gray-400"></div>
              <div className="absolute top-0 left-40 w-1 h-full bg-gray-400"></div>
              <div className="absolute top-0 left-60 w-1 h-full bg-gray-400"></div>

              {/* Marcadores de vehículos */}
              {vehiculosActualizados.map((vehiculo, index) => (
                <div
                  key={vehiculo.id}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${
                    vehiculoSeleccionado === vehiculo.id ? "scale-125 z-20" : "z-10"
                  }`}
                  style={{
                    left: `${20 + index * 15}%`,
                    top: `${30 + index * 10}%`,
                  }}
                  onClick={() => onVehiculoClick?.(vehiculo)}
                >
                  <div
                    className={`w-8 h-8 ${obtenerColorEstado(vehiculo.estado)} rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white`}
                  >
                    <Car className="w-4 h-4" />
                  </div>
                  {vehiculoSeleccionado === vehiculo.id && (
                    <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-2 min-w-48">
                      <div className="text-sm">
                        <p className="font-semibold">{vehiculo.conductor}</p>
                        <p className="text-gray-600">{vehiculo.placa}</p>
                        <p className="text-xs text-gray-500">
                          {vehiculo.pasajeros}/{vehiculo.capacidad} pasajeros
                        </p>
                        {vehiculo.tiempoEstimado && (
                          <p className="text-xs text-blue-600">Llega en {vehiculo.tiempoEstimado} min</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Rutas simuladas */}
              {mostrarRutas && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <path
                    d="M 80 120 Q 200 100 320 180"
                    stroke="#3B82F6"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="5,5"
                    className="animate-pulse"
                  />
                </svg>
              )}
            </div>

            {/* Controles del mapa */}
            <div className="absolute top-4 right-4 space-y-2">
              <Button size="sm" variant="outline" className="bg-white">
                <Navigation className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" className="bg-white">
                +
              </Button>
              <Button size="sm" variant="outline" className="bg-white">
                -
              </Button>
            </div>

            {/* Leyenda */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-lg">
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Disponible</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>En viaje</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span>Fuera de servicio</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de vehículos */}
      <div className="grid gap-3">
        {vehiculosActualizados.map((vehiculo) => (
          <Card
            key={vehiculo.id}
            className={`cursor-pointer transition-colors ${
              vehiculoSeleccionado === vehiculo.id ? "border-blue-500 bg-blue-50" : ""
            }`}
            onClick={() => onVehiculoClick?.(vehiculo)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 ${obtenerColorEstado(vehiculo.estado)} rounded-full`}></div>
                  <Avatar className="w-10 h-10">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback>
                      {vehiculo.conductor
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{vehiculo.conductor}</p>
                    <p className="text-xs text-gray-600">{vehiculo.placa}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {vehiculo.tiempoEstimado && (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {vehiculo.tiempoEstimado} min
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    <Users className="w-3 h-3 mr-1" />
                    {vehiculo.pasajeros}/{vehiculo.capacidad}
                  </Badge>
                </div>
              </div>

              {vehiculo.destino && (
                <div className="mt-2 text-xs text-gray-600">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  Destino: {vehiculo.destino}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
