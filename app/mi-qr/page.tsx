"use client";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QrCode, Copy, Share2, Download } from 'lucide-react'
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { useEffect, useState } from "react"
import { obtenerConductor } from "@/lib/database"
import { Conductor } from "@/lib/supabase"

export default function MiQRPage() {
  const { user } = useAuth()
  const [conductor, setConductor] = useState<Conductor | null>(null)
  const [qrData, setQrData] = useState<string>("")

  useEffect(() => {
    const loadConductorData = async () => {
      if (user?.id) {
        const conductorInfo = await obtenerConductor(user.id)
        setConductor(conductorInfo)
        if (conductorInfo?.codigo_conductor) {
          // Generar un QR más completo para el conductor
          const data = JSON.stringify({
            type: "conductor_qr",
            conductorId: conductorInfo.id,
            codigo: conductorInfo.codigo_conductor,
            nombre: conductorInfo.usuario?.nombre || "Conductor",
            vehiculo: conductorInfo.modelo_vehiculo,
            placa: conductorInfo.placa_vehiculo,
            // Puedes añadir más datos relevantes aquí
          })
          setQrData(data)
        }
      }
    }
    loadConductorData()
  }, [user])

  const handleCopy = () => {
    navigator.clipboard.writeText(qrData)
    toast({
      title: "Copiado",
      description: "El código QR ha sido copiado al portapapeles.",
    })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Mi Código QR de Conductor",
          text: "Escanea mi QR para iniciar un viaje o calificarme:",
          url: qrData, // En un entorno real, esto sería una URL a una página que muestre el QR
        })
        toast({
          title: "Compartido",
          description: "El código QR ha sido compartido exitosamente.",
        })
      } catch (error) {
        console.error("Error al compartir:", error)
        toast({
          title: "Error",
          description: "No se pudo compartir el código QR.",
          variant: "destructive",
        })
      }
    } else {
      handleCopy() // Fallback a copiar si no hay Web Share API
    }
  }

  const handleDownload = () => {
    // Simular la descarga de una imagen QR
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (ctx) {
      canvas.width = 300
      canvas.height = 350

      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = "#000000"
      ctx.font = "bold 18px Arial"
      ctx.textAlign = "center"
      ctx.fillText("CÓDIGO QR CONDUCTOR", canvas.width / 2, 30)

      // Placeholder para el QR
      ctx.strokeStyle = "#000000"
      ctx.strokeRect(50, 60, 200, 200)
      ctx.font = "16px Arial"
      ctx.fillText("QR CODE HERE", canvas.width / 2, 160)

      ctx.font = "14px Arial"
      ctx.fillText(`Código: ${conductor?.codigo_conductor || 'N/A'}`, canvas.width / 2, 290);
      ctx.fillText(`Conductor: ${conductor?.usuario?.nombre || 'N/A'}`, canvas.width / 2, 310);

      const link = document.createElement("a")
      link.download = `qr-conductor-${conductor?.codigo_conductor || 'generico'}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()

      toast({
        title: "Descargado",
        description: "La imagen del código QR ha sido descargada.",
      })
    }
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-lg text-gray-600">Cargando información del usuario...</p>
      </div>
    )
  }

  if (!conductor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-lg text-gray-600">No se encontró información de conductor para este usuario.</p>
        <p className="text-sm text-gray-500">Asegúrate de que tu cuenta esté configurada como conductor.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-green-600">Mi Código QR</CardTitle>
          <p className="text-sm text-gray-500">Para que los pasajeros inicien viajes o te califiquen</p>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div className="relative w-48 h-48 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center p-2">
            {/* En una implementación real, aquí iría un componente de QR Code */}
            <QrCode className="w-32 h-32 text-gray-400" />
            <div className="absolute bottom-2 text-xs text-gray-500">
              {conductor.codigo_conductor || "Cargando..."}
            </div>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">{conductor.usuario?.nombre}</p>
            <p className="text-sm text-gray-600">{conductor.modelo_vehiculo} ({conductor.placa_vehiculo})</p>
          </div>
          <div className="flex gap-2 w-full">
            <Button variant="outline" className="flex-1" onClick={handleCopy}>
              <Copy className="w-4 h-4 mr-2" />
              Copiar
            </Button>
            <Button variant="outline" className="flex-1" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Compartir
            </Button>
          </div>
          <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Descargar QR
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
