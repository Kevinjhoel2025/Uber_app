"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import SistemaCalificacion from "@/components/sistema-calificacion"
import { obtenerConductor } from "@/lib/database"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import type { Conductor } from "@/lib/supabase"

export default function ReputacionConductorPage() {
  const params = useParams()
  const router = useRouter()
  const conductorId = params.id as string // El ID del conductor viene de la URL
  const { loading: authLoading } = useAuth() // Solo para saber si la autenticación ha cargado

  const [conductor, setConductor] = useState<Conductor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchConductorData = async () => {
      if (!conductorId) {
        setError("ID de conductor no proporcionado.")
        setLoading(false)
        return
      }

      try {
        const conductorData = await obtenerConductor(conductorId)
        if (conductorData) {
          setConductor(conductorData)
        } else {
          setError("Conductor no encontrado.")
        }
      } catch (err) {
        console.error("Error al cargar los datos del conductor:", err)
        setError("Error al cargar el perfil del conductor.")
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      // Asegurarse de que la autenticación ha cargado antes de intentar obtener datos
      fetchConductorData()
    }
  }, [conductorId, authLoading])

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
        <p className="text-lg text-gray-700">Cargando perfil del conductor...</p>
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
            <Button onClick={() => router.back()}>Volver</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!conductor) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-6">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-800 mb-2">Conductor no encontrado</h2>
            <p className="text-red-700 mb-4">No se pudo cargar la información del conductor.</p>
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
          conductorId={conductor.id}
          conductorNombre={conductor.usuario?.nombre || "Conductor Desconocido"}
          conductorFoto={conductor.usuario?.avatar_url || "/placeholder-user.jpg"}
          viajeId="" // No se necesita para mostrar historial
          usuarioId="" // No se necesita para mostrar historial
          mostrarHistorial={true}
        />
      </div>
    </div>
  )
}
