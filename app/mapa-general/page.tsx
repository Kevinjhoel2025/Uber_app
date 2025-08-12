"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Car, Phone, MessageCircle, Loader2, XCircle } from "lucide-react"
import MapaTiempoReal from "@/components/mapa-tiempo-real"
import { obtenerConductoresActivos } from "@/lib/database"
import type { Conductor } from "@/lib/supabase"

export default function MapaGeneralPage() {
  const [conductores, setConductores] = useState<Conductor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchConductores = async () => {
      try {
        const activeConductors = await obtenerConductoresActivos()
        setConductores(activeConductors)
      } catch (err) {
        console.error("Error fetching active conductors:", err)
        setError("No se pudieron cargar los conductores activos.")
      } finally {
        setLoading(false)
      }
    }
    fetchConductores()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
        <p className="text-lg text-gray-700">Cargando mapa general...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-6">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Reintentar</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleVehiculoClick = (vehiculo: Conductor) => {
    // Aquí puedes implementar una acción al hacer clic en un vehículo,
    // por ejemplo, mostrar más detalles o iniciar una llamada/mensaje.
    console.log("Vehículo clickeado:", vehiculo)
    // alert(`Conductor: ${vehiculo.conductor}\nEstado: ${vehiculo.estado}`);
  }

  const mappedVehiculos = conductores
    .filter((c) => c.ubicacion_lat && c.ubicacion_lng) // Solo mostrar si tienen ubicación
    .map((c) => ({
      id: c.id,
      conductor: c.usuario?.nombre || "N/A",
      vehiculo: c.vehiculo || "N/A",
      placa: c.placa || "N/A",
      lat: c.ubicacion_lat!,
      lng: c.ubicacion_lng!,
      estado: c.estado,
      pasajeros: 0, // No tenemos esta info aquí, se podría añadir si es relevante
      capacidad: c.capacidad || 12,
      telefono: c.usuario?.telefono || "N/A",
    }))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Mapa General de Vehículos</h1>
            <p className="text-blue-100">Sindicato 27 de Noviembre</p>
          </div>
          {/* Podrías añadir un botón de perfil o ajustes aquí */}
        </div>
      </div>

      <div className="p-4">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Vehículos en Tiempo Real
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mappedVehiculos.length > 0 ? (
              <MapaTiempoReal
                vehiculos={mappedVehiculos}
                centroMapa={{ lat: -17.7833, lng: -63.1821 }} // Centro en Santa Cruz
                zoom={12}
                onVehiculoClick={handleVehiculoClick}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Car className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay vehículos activos en este momento.</p>
                <p className="text-sm">Intenta más tarde o contacta a la secretaría.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5" />
              Conductores Activos ({conductores.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {conductores.map((conductor) => (
                <div key={conductor.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                        conductor.estado === "disponible" ? "bg-green-500" : "bg-yellow-500"
                      }`}
                    >
                      <Car className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">{conductor.usuario?.nombre}</p>
                      <p className="text-sm text-gray-600">
                        {conductor.vehiculo} - {conductor.placa}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`tel:${conductor.usuario?.telefono}`, "_self")}
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
