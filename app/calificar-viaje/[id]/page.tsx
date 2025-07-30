"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Clock, Car } from "lucide-react"
import SistemaCalificacion from "@/components/sistema-calificacion"

export default function CalificarViaje() {
  const [calificacionEnviada, setCalificacionEnviada] = useState(false)

  // Datos del viaje a calificar
  const datosViaje = {
    id: "1",
    conductor: {
      id: "conductor-1",
      nombre: "Carlos Mendoza",
      foto: "/placeholder-user.jpg",
      vehiculo: "Toyota Hiace - ABC123",
      rating: 4.8,
    },
    ruta: "Warnes → Montero",
    fecha: "2024-01-15",
    hora: "15:00",
    precio: 15,
    duracion: "25 min",
    distancia: "18 km",
  }

  const handleCalificacion = (calificacionData: any) => {
    console.log("Calificación enviada:", calificacionData)
    setCalificacionEnviada(true)
    // Aquí se enviaría la calificación al backend
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
            <h1 className="text-lg font-semibold">Calificar Viaje</h1>
            <p className="text-blue-100 text-sm">Comparte tu experiencia</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Resumen del Viaje */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen del Viaje</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{datosViaje.ruta}</span>
              </div>
              <Badge variant="default">Completado</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>
                  {datosViaje.fecha} - {datosViaje.hora}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-gray-500" />
                <span>{datosViaje.conductor.vehiculo}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <p className="text-gray-600">Precio</p>
                <p className="font-semibold">Bs. {datosViaje.precio}</p>
              </div>
              <div>
                <p className="text-gray-600">Duración</p>
                <p className="font-semibold">{datosViaje.duracion}</p>
              </div>
              <div>
                <p className="text-gray-600">Distancia</p>
                <p className="font-semibold">{datosViaje.distancia}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sistema de Calificación */}
        <SistemaCalificacion
          conductorId={datosViaje.conductor.id}
          conductorNombre={datosViaje.conductor.nombre}
          conductorFoto={datosViaje.conductor.foto}
          viajeId={datosViaje.id}
          onCalificar={handleCalificacion}
        />

        {/* Información Adicional */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Tu opinión es importante</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Las calificaciones ayudan a otros pasajeros a elegir</li>
              <li>• Los conductores pueden mejorar con tu feedback</li>
              <li>• Tu identidad se mantiene privada</li>
              <li>• Solo calificaciones verificadas son publicadas</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
