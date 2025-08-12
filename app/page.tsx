"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Car } from "lucide-react"

export default function HomePage() {
  const { usuario, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (usuario) {
        // Redirigir según el tipo de usuario
        switch (usuario.tipo_usuario) {
          case "conductor":
            router.push("/conductor-dashboard")
            break
          case "secretaria":
            router.push("/secretaria-dashboard")
            break
          default:
            router.push("/usuario-dashboard")
        }
      } else {
        // Si no hay usuario logueado, redirigir a la página de autenticación
        router.push("/auth")
      }
    }
  }, [usuario, loading, router])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <Car className="w-24 h-24 animate-pulse mb-4" />
        <h1 className="text-3xl font-bold">Cargando TransSindicato...</h1>
        <p className="text-lg mt-2">Preparando tu experiencia de viaje</p>
      </div>
    )
  }

  // Esto no debería renderizarse si la redirección funciona correctamente
  return null
}
