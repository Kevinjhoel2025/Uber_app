"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, MapPin, Navigation, Wifi, WifiOff, Clock } from "lucide-react"

export default function ConductorUbicacion() {
  const [gpsActivo, setGpsActivo] = useState(true)
  const [compartirUbicacion, setCompartirUbicacion] = useState(true)
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date())
  const [coordenadas, setCoordenadas] = useState({
    lat: -17.7833,
    lng: -63.1821,
  })

  // Simular actualizaciones de GPS
  useEffect(() => {
    if (gpsActivo) {
      const interval = setInterval(() => {
        setCoordenadas((prev) => ({
          lat: prev.lat + (Math.random() - 0.5) * 0.001,
          lng: prev.lng + (Math.random() - 0.5) * 0.001,
        }))
        setUltimaActualizacion(new Date())
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [gpsActivo])

  const formatearTiempo = (fecha: Date) => {
    return fecha.toLocaleTimeString("es-BO", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-green-700"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Mi Ubicación GPS</h1>
            <p className="text-green-100 text-sm">Control de seguimiento</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Estado del GPS */}
        <Card className={`border-l-4 ${gpsActivo ? "border-l-green-500 bg-green-50" : "border-l-red-500 bg-red-50"}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${gpsActivo ? "bg-green-100" : "bg-red-100"}`}
                >
                  {gpsActivo ? (
                    <Wifi className="w-6 h-6 text-green-600" />
                  ) : (
                    <WifiOff className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{gpsActivo ? "GPS Activo" : "GPS Desactivado"}</h3>
                  <p className="text-sm text-gray-600">
                    {gpsActivo ? "Ubicación compartida en tiempo real" : "No se está compartiendo ubicación"}
                  </p>
                </div>
              </div>
              <Badge variant={gpsActivo ? "default" : "secondary"}>{gpsActivo ? "CONECTADO" : "DESCONECTADO"}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Controles de GPS */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Ubicación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Activar GPS</p>
                <p className="text-sm text-gray-600">Permite el seguimiento de tu vehículo</p>
              </div>
              <Switch checked={gpsActivo} onCheckedChange={setGpsActivo} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Compartir Ubicación</p>
                <p className="text-sm text-gray-600">Visible para pasajeros y secretaría</p>
              </div>
              <Switch checked={compartirUbicacion} onCheckedChange={setCompartirUbicacion} />
            </div>
          </CardContent>
        </Card>

        {/* Información de Ubicación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Ubicación Actual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Latitud</p>
                <p className="font-mono text-sm">{coordenadas.lat.toFixed(6)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Longitud</p>
                <p className="font-mono text-sm">{coordenadas.lng.toFixed(6)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Última actualización: {formatearTiempo(ultimaActualizacion)}</span>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1">
                <Navigation className="w-4 h-4 mr-2" />
                Actualizar Ubicación
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                <MapPin className="w-4 h-4 mr-2" />
                Ver en Mapa
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas de Ubicación */}
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas de Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">45.2</p>
                <p className="text-sm text-gray-600">km recorridos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">6.5</p>
                <p className="text-sm text-gray-600">horas activo</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">14</p>
                <p className="text-sm text-gray-600">pasajeros</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Historial de Ubicaciones */}
        <Card>
          <CardHeader>
            <CardTitle>Historial Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { hora: "15:30", ubicacion: "Terminal Warnes", accion: "Recogida de pasajeros" },
                { hora: "15:15", ubicacion: "Av. Principal", accion: "En ruta" },
                { hora: "15:00", ubicacion: "Plaza Montero", accion: "Llegada al destino" },
                { hora: "14:45", ubicacion: "Carretera Warnes-Montero", accion: "En viaje" },
              ].map((registro, index) => (
                <div key={index} className="flex items-center gap-3 p-2 border rounded">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{registro.ubicacion}</p>
                    <p className="text-xs text-gray-600">{registro.accion}</p>
                  </div>
                  <span className="text-xs text-gray-500">{registro.hora}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Configuración Avanzada */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración Avanzada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="font-medium">Frecuencia de Actualización</p>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" className="bg-transparent">
                  5 seg
                </Button>
                <Button size="sm">10 seg</Button>
                <Button variant="outline" size="sm" className="bg-transparent">
                  30 seg
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-medium">Precisión GPS</p>
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm">Alta</Button>
                <Button variant="outline" size="sm" className="bg-transparent">
                  Estándar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información Importante */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Información Importante</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• El GPS debe estar activo para recibir solicitudes de viaje</li>
              <li>• La ubicación se actualiza automáticamente cada 10 segundos</li>
              <li>• Los pasajeros pueden ver tu ubicación en tiempo real</li>
              <li>• Desactivar el GPS te pondrá fuera de servicio</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
