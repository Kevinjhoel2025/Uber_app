import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { ArrowLeft, Car, MapPin, User, Clock, CheckCircle, XCircle, Star } from 'lucide-react'
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { obtenerViajesUsuario, obtenerViajesConductor, actualizarEstadoViaje, obtenerConductor, obtenerUsuario } from "@/lib/database"
import { useAuth } from "@/hooks/use-auth"
import { Viaje, Conductor, Usuario } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

// Fix for default icon issue with Leaflet and Webpack
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
})

interface SeguimientoViajePageProps {
  params: {
    id: string // ID del viaje
  }
}

export default function SeguimientoViajePage({ params }: SeguimientoViajePageProps) {
  const router = useRouter()
  const { user, userRole } = useAuth()
  const viajeId = params.id

  const [viaje, setViaje] = useState<Viaje | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [conductorLocation, setConductorLocation] = useState<[number, number] | null>(null)

  useEffect(() => {
    const fetchViaje = async () => {
      if (!user?.id || !viajeId) {
        setError("No se pudo cargar el viaje: ID de usuario o viaje no disponible.")
        setLoading(false)
        return
      }

      let fetchedViaje: Viaje | null = null
      if (userRole === "pasajero") {
        const viajes = await obtenerViajesUsuario(user.id)
        fetchedViaje = viajes.find(v => v.id === viajeId) || null
      } else if (userRole === "conductor") {
        const viajes = await obtenerViajesConductor(user.id)
        fetchedViaje = viajes.find(v => v.id === viajeId) || null
      } else if (userRole === "secretaria") {
        // Secretaría puede ver cualquier viaje (requiere una función obtenerViajeById en database.ts)
        // Por ahora, simulamos buscando en ambos roles si no hay una función específica
        const viajesPasajero = await obtenerViajesUsuario(user.id); // Esto no es ideal para secretaria
        fetchedViaje = viajesPasajero.find(v => v.id === viajeId) || null;
        if (!fetchedViaje) {
          const viajesConductor = await obtenerViajesConductor(user.id); // Esto tampoco es ideal
          fetchedViaje = viajesConductor.find(v => v.id === viajeId) || null;
        }
        // Idealmente, aquí llamarías a una función como `obtenerViajePorId(viajeId)`
      }

      if (fetchedViaje) {
        setViaje(fetchedViaje)
        if (fetchedViaje.conductor_id) {
          const conductorInfo = await obtenerConductor(fetchedViaje.conductor_id)
          if (conductorInfo && conductorInfo.ubicacion_lat && conductorInfo.ubicacion_lng) {
            setConductorLocation([conductorInfo.ubicacion_lat, conductorInfo.ubicacion_lng])
          }
        }
      } else {
        setError("Viaje no encontrado o no tienes permiso para verlo.")
      }
      setLoading(false)
    }

    fetchViaje()

    // Simulate real-time updates for conductor location
    const interval = setInterval(async () => {
      if (viaje?.conductor_id && (viaje.estado === "en_curso" || viaje.estado === "confirmado")) {
        const conductorInfo = await obtenerConductor(viaje.conductor_id)
        if (conductorInfo && conductorInfo.ubicacion_lat && conductorInfo.ubicacion_lng) {
          setConductorLocation([conductorInfo.ubicacion_lat, conductorInfo.ubicacion_lng])
        }
      }
    }, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [user, userRole, viajeId, viaje?.conductor_id, viaje?.estado])

  const handleUpdateEstadoViaje = async (newEstado: Viaje['estado']) => {
    if (!viaje) return;

    const success = await actualizarEstadoViaje(viaje.id, newEstado);
    if (success) {
      setViaje(prev => prev ? { ...prev, estado: newEstado } : null);
      toast({
        title: "Estado del viaje actualizado",
        description: `El viaje ahora está en estado: ${newEstado}`,
      });
      if (newEstado === "completado" && userRole === "conductor") {
        router.push(`/calificar-viaje/${viaje.id}`);
      }
    } else {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del viaje.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-lg text-gray-600">Cargando detalles del viaje...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-lg text-red-600">{error}</p>
        <Button onClick={() => router.back()} className="mt-4">Volver</Button>
      </div>
    )
  }

  if (!viaje) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-lg text-gray-600">No se encontró el viaje.</p>
        <Button onClick={() => router.back()} className="mt-4">Volver</Button>
      </div>
    )
  }

  const getEstadoColor = (estado: Viaje['estado']) => {
    switch (estado) {
      case "pendiente":
        return "bg-yellow-500"
      case "confirmado":
        return "bg-blue-500"
      case "en_curso":
        return "bg-orange-500"
      case "completado":
        return "bg-green-500"
      case "cancelado":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getEstadoIcon = (estado: Viaje['estado']) => {
    switch (estado) {
      case "pendiente":
        return <Clock className="w-4 h-4" />
      case "confirmado":
        return <CheckCircle className="w-4 h-4" />
      case "en_curso":
        return <Car className="w-4 h-4" />
      case "completado":
        return <CheckCircle className="w-4 h-4" />
      case "cancelado":
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const center: [number, number] = conductorLocation || [viaje.origen_lat, viaje.origen_lng] || [ -17.7833, -63.1833]; // Default to Santa Cruz if no location

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-white hover:bg-green-700" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Seguimiento de Viaje</h1>
            <p className="text-green-100 text-sm">ID: {viaje.id.substring(0, 8)}...</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Detalles del Viaje */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Detalles del Viaje</span>
              <Badge className={`${getEstadoColor(viaje.estado)} text-white`}>
                {getEstadoIcon(viaje.estado)}
                <span className="ml-1">{viaje.estado.toUpperCase()}</span>
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span>Pasajero: {viaje.pasajero?.nombre || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-gray-500" />
              <span>Conductor: {viaje.conductor?.usuario?.nombre || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span>Ruta: {viaje.origen} → {viaje.destino}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span>Fecha: {new Date(viaje.fecha_viaje).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-gray-500" />
              <span>Asientos: {viaje.asientos_reservados}</span>
            </div>
            <div className="flex justify-between text-base font-bold border-t pt-2 mt-2">
              <span>Monto Total:</span>
              <span className="text-green-600">Bs. {viaje.monto_total.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Mapa de Seguimiento */}
        {conductorLocation && (viaje.estado === "confirmado" || viaje.estado === "en_curso") ? (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-base">Ubicación del Conductor</CardTitle>
            </CardHeader>
            <CardContent className="h-64 w-full">
              <MapContainer center={center} zoom={13} scrollWheelZoom={false} className="h-full w-full rounded-lg">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={conductorLocation}>
                  <Popup>
                    Ubicación actual del conductor: <br /> {viaje.conductor?.usuario?.nombre || "Conductor"}
                  </Popup>
                </Marker>
                <Marker position={[viaje.origen_lat, viaje.origen_lng]}>
                  <Popup>Origen: {viaje.origen}</Popup>
                </Marker>
                <Marker position={[viaje.destino_lat, viaje.destino_lng]}>
                  <Popup>Destino: {viaje.destino}</Popup>
                </Marker>
              </MapContainer>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-4">
            <CardContent className="p-6 text-center text-gray-600">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>Mapa disponible cuando el viaje esté confirmado o en curso.</p>
            </CardContent>
          </Card>
        )}

        {/* Acciones del Viaje */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">Acciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {userRole === "conductor" && (
              <>
                {viaje.estado === "pendiente" && (
                  <Button onClick={() => handleUpdateEstadoViaje("confirmado")} className="w-full bg-green-600 hover:bg-green-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirmar Viaje
                  </Button>
                )}
                {viaje.estado === "confirmado" && (
                  <Button onClick={() => handleUpdateEstadoViaje("en_curso")} className="w-full bg-blue-600 hover:bg-blue-700">
                    <Car className="w-4 h-4 mr-2" />
                    Iniciar Viaje
                  </Button>
                )}
                {viaje.estado === "en_curso" && (
                  <Button onClick={() => handleUpdateEstadoViaje("completado")} className="w-full bg-purple-600 hover:bg-purple-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Finalizar Viaje
                  </Button>
                )}
                {(viaje.estado === "pendiente" || viaje.estado === "confirmado" || viaje.estado === "en_curso") && (
                  <Button onClick={() => handleUpdateEstadoViaje("cancelado")} variant="destructive" className="w-full">
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancelar Viaje
                  </Button>
                )}
              </>
            )}

            {userRole === "pasajero" && (
              <>
                {viaje.estado === "pendiente" && (
                  <Button onClick={() => handleUpdateEstadoViaje("cancelado")} variant="destructive" className="w-full">
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancelar Solicitud
                  </Button>
                )}
                {viaje.estado === "completado" && (
                  <Button onClick={() => router.push(`/calificar-viaje/${viaje.id}`)} className="w-full bg-yellow-500 hover:bg-yellow-600">
                    <Star className="w-4 h-4 mr-2" />
                    Calificar Viaje
                  </Button>
                )}
                {viaje.estado === "confirmado" || viaje.estado === "en_curso" ? (
                  <Button onClick={() => router.push(`/pago-qr?origen=${viaje.origen}&destino=${viaje.destino}&precio=${viaje.monto_total / viaje.asientos_reservados}&asientos=${viaje.asientos_reservados}&conductorId=${viaje.conductor_id}&viajeId=${viaje.id}`)} className="w-full bg-green-600 hover:bg-green-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Realizar Pago
                  </Button>
                ) : null}
              </>
            )}

            {userRole === "secretaria" && (
              <Button onClick={() => toast({ title: "Acción de Secretaría", description: "Implementar lógica de gestión para secretaría." })} className="w-full">
                Gestionar Viaje
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
