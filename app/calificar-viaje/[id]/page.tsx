"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import SistemaCalificacion from "@/components/sistema-calificacion"
import { obtenerViajesUsuario } from "@/lib/database"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Viaje } from "@/lib/supabase"

export default function CalificarViajePage() {
  const params = useParams()
  const router = useRouter()
  const viajeId = params.id as string
  const { usuario, loading: authLoading } = useAuth()

  const [viaje, setViaje] = useState<Viaje | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchViaje = async () => {
      if (!usuario || !viajeId) {
        setError("Usuario no autenticado o ID de viaje no proporcionado.")
        setLoading(false)
        return
      }

      try {
        const viajesDelUsuario = await obtenerViajesUsuario(usuario.id)
        const viajeEncontrado = viajesDelUsuario.find((v) => v.id === viajeId)

        if (viajeEncontrado && viajeEncontrado.estado === "completado") {
          setViaje(viajeEncontrado)
        } else if (viajeEncontrado && viajeEncontrado.estado !== "completado") {
          setError("Este viaje aún no ha sido completado y no puede ser calificado.")
        } else {
          setError("Viaje no encontrado o no autorizado para calificar.")
        }
      } catch (err) {
        console.error("Error al cargar el viaje para calificar:", err)
        setError("Error al cargar los detalles del viaje.")
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      fetchViaje()
    }
  }, [viajeId, usuario, authLoading])

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
        <p className="text-lg text-gray-700">Cargando viaje para calificar...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-6">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-800 mb-2">Error al Calificar</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <Button onClick={() => router.back()}>Volver</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!viaje || !usuario || !viaje.conductor_id) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-6">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-800 mb-2">Información Incompleta</h2>
            <p className="text-red-700 mb-4">No se pudo obtener la información necesaria para calificar el viaje.</p>
            <Button onClick={() => router.back()}>Volver</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <SistemaCalificacion
          conductorId={viaje.conductor_id}
          conductorNombre={viaje.conductor?.usuario?.nombre || "Conductor Desconocido"}
          conductorFoto={viaje.conductor?.usuario?.avatar_url || "/placeholder-user.jpg"}
          viajeId={viaje.id}
          usuarioId={usuario.id}
          onCalificar={() => {
            router.push("/usuario-dashboard") // Redirigir al dashboard después de calificar
          }}
          mostrarHistorial={false}
        />
      </div>
    </div>
  )
}
