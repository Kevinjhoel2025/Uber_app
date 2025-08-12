"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Loader2, CheckCircle, XCircle } from "lucide-react"
import MapaTiempoReal from "@/components/mapa-tiempo-real"
import { useAuth } from "@/hooks/use-auth"
import { actualizarUbicacionConductor, obtenerConductor } from "@/lib/database"
import { toast } from "@/hooks/use-toast"

export default function ConductorUbicacionPage() {
  const { usuario, loading: authLoading } = useAuth()
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [loadingLocation, setLoadingLocation] = useState(true)
  const [updatingLocation, setUpdatingLocation] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && (!usuario || usuario.tipo_usuario !== "conductor")) {
      setError("Acceso denegado. Solo conductores pueden acceder a esta página.")
      setLoadingLocation(false)
      return
    }

    if (usuario && usuario.tipo_usuario === "conductor") {
      // Intentar obtener la última ubicación guardada del conductor
      const fetchLastLocation = async () => {
        try {
          const conductorData = await obtenerConductor(usuario.id)
          if (conductorData?.ubicacion_lat && conductorData?.ubicacion_lng) {
            setCurrentLocation({ lat: conductorData.ubicacion_lat, lng: conductorData.ubicacion_lng })
          }
        } catch (err) {
          console.error("Error fetching last location:", err)
        } finally {
          setLoadingLocation(false)
        }
      }
      fetchLastLocation()
    }
  }, [usuario, authLoading])

  const obtenerUbicacionActual = () => {
    setLoadingLocation(true)
    setError(null)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setCurrentLocation({ lat: latitude, lng: longitude })
          setLoadingLocation(false)
          toast({
            title: "Ubicación obtenida",
            description: "Tu ubicación actual ha sido detectada.",
          })
        },
        (geoError) => {
          console.error("Error al obtener la ubicación:", geoError)
          setError("No se pudo obtener la ubicación. Asegúrate de permitir el acceso a la ubicación.")
          setLoadingLocation(false)
          toast({
            title: "Error de ubicación",
            description: "No se pudo obtener tu ubicación. Revisa los permisos.",
            variant: "destructive",
          })
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      )
    } else {
      setError("Tu navegador no soporta geolocalización.")
      setLoadingLocation(false)
      toast({
        title: "Error de navegador",
        description: "Tu navegador no soporta la geolocalización.",
        variant: "destructive",
      })
    }
  }

  const handleActualizarUbicacion = async () => {
    if (!usuario || usuario.tipo_usuario !== "conductor" || !currentLocation) return

    setUpdatingLocation(true)
    try {
      const success = await actualizarUbicacionConductor(usuario.id, currentLocation.lat, currentLocation.lng)
      if (success) {
        toast({
          title: "Ubicación actualizada",
          description: "Tu ubicación ha sido guardada en la base de datos.",
        })
      } else {
        toast({
          title: "Error al actualizar",
          description: "No se pudo guardar tu ubicación.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error updating location:", err)
      toast({
        title: "Error inesperado",
        description: "Ocurrió un error al actualizar la ubicación.",
        variant: "destructive",
      })
    } finally {
      setUpdatingLocation(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
        <p className="text-lg text-gray-700">Cargando autenticación...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-6">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-800 mb-2">Error de Acceso</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <Button onClick={() => window.history.back()}>Volver</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Mi Ubicación</h1>
            <p className="text-green-100">Actualiza tu posición en el mapa</p>
          </div>
          {/* Podrías añadir un botón de perfil o ajustes aquí */}
        </div>
      </div>

      <div className="p-4">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Ubicación Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingLocation ? (
              <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p className="ml-2 text-gray-600">Obteniendo ubicación...</p>
              </div>
            ) : currentLocation ? (
              <>
                <MapaTiempoReal
                  vehiculos={[
                    {
                      id: usuario?.id || "mock-id",
                      conductor: usuario?.nombre || "Conductor",
                      vehiculo: "Tu Vehículo",
                      placa: "N/A",
                      lat: currentLocation.lat,
                      lng: currentLocation.lng,
                      estado: "disponible", // Asumimos disponible para mostrar
                      pasajeros: 0,
                      capacidad: 0,
                      telefono: usuario?.telefono || "N/A",
                    },
                  ]}
                  centroMapa={currentLocation}
                  zoom={15}
                />
                <p className="text-sm text-gray-600 mt-3 text-center">
                  Lat: {currentLocation.lat.toFixed(6)}, Lng: {currentLocation.lng.toFixed(6)}
                </p>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No se ha detectado tu ubicación.</p>
                <p className="text-sm">Haz clic en "Obtener Ubicación" para empezar.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-3">
          <Button onClick={obtenerUbicacionActual} disabled={loadingLocation}>
            {loadingLocation ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Obteniendo...
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4 mr-2" />
                Obtener Ubicación Actual
              </>
            )}
          </Button>
          <Button
            onClick={handleActualizarUbicacion}
            disabled={!currentLocation || updatingLocation}
            variant="outline"
            className="bg-transparent"
          >
            {updatingLocation ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Actualizando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Guardar Ubicación
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
