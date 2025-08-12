import { Loader2, MapPin } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <MapPin className="w-16 h-16 text-blue-600 animate-bounce mb-4" />
      <h1 className="text-2xl font-bold text-gray-800">Cargando Mapa General...</h1>
      <p className="text-gray-600 mt-2">Obteniendo la ubicación de los vehículos</p>
      <Loader2 className="w-8 h-8 animate-spin text-blue-500 mt-6" />
    </div>
  )
}
