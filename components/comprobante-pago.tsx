"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Share2, CheckCircle, Clock, QrCode, Receipt, Calendar, MapPin, User, CreditCard, XCircle } from 'lucide-react'
import { toast } from "@/hooks/use-toast"
import type { Comprobante } from "@/lib/supabase" // Importar el tipo Comprobante de Supabase

interface ComprobantePagoProps {
  comprobante: {
    numero_comprobante: string
    fecha: string // Fecha del pago
    pasajero: string
    conductor: string
    origen: string
    destino: string
    monto: number
    metodo_pago: string
    estado: "pendiente" | "completado" | "fallido" | "reembolsado" // Usar los estados de Pago
    qr_data?: string // Puede ser un JSON string con datos del QR o una URL de imagen
  }
  onVerificar?: () => void
  onCompartir?: () => void
}

export default function ComprobantePago({ comprobante, onVerificar, onCompartir }: ComprobantePagoProps) {
  const [descargando, setDescargando] = useState(false)
  const comprobanteRef = useRef<HTMLDivElement>(null)

  const descargarComprobante = async () => {
    setDescargando(true)
    try {
      // Simular descarga del comprobante como imagen
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (ctx && comprobanteRef.current) {
        // Usar un tamaño más grande para mejor calidad
        canvas.width = 600
        canvas.height = 800

        // Fondo blanco
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Header verde
        ctx.fillStyle = "#16a34a" // Tailwind green-600
        ctx.fillRect(0, 0, canvas.width, 100)

        // Título
        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 30px Arial"
        ctx.textAlign = "center"
        ctx.fillText("COMPROBANTE DE PAGO", canvas.width / 2, 45)
        ctx.font = "20px Arial"
        ctx.fillText("Sindicato 27 de Noviembre", canvas.width / 2, 75)

        // Contenido
        ctx.fillStyle = "#000000"
        ctx.font = "18px Arial"
        ctx.textAlign = "left"

        let y = 150
        const lineHeight = 35
        const paddingLeft = 40

        const datos = [
          `Número: ${comprobante.numero_comprobante}`,
          `Fecha: ${new Date(comprobante.fecha).toLocaleString()}`,
          `Pasajero: ${comprobante.pasajero}`,
          `Conductor: ${comprobante.conductor}`,
          `Ruta: ${comprobante.origen} → ${comprobante.destino}`,
          `Monto: Bs. ${comprobante.monto.toFixed(2)}`, // Formatear a 2 decimales
          `Método: ${comprobante.metodo_pago}`,
          `Estado: ${comprobante.estado.toUpperCase()}`,
        ]

        datos.forEach((dato) => {
          ctx.fillText(dato, paddingLeft, y)
          y += lineHeight
        })

        // QR Code placeholder or image
        if (comprobante.qr_data) {
          try {
            const qrInfo = JSON.parse(comprobante.qr_data);
            if (qrInfo.qrImageUrl) {
              // If it's a QR image URL, load and draw it
              const img = new Image();
              img.crossOrigin = "anonymous"; // Important for CORS
              img.src = qrInfo.qrImageUrl;
              await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
              });

              const qrSize = 150;
              const qrX = (canvas.width - qrSize) / 2;
              const qrY = y + 30;
              ctx.drawImage(img, qrX, qrY, qrSize, qrSize);
              y = qrY + qrSize + 50; // Adjust 'y' after the QR
            } else {
              // If it's just QR data string, draw placeholder
              const qrSize = 150
              const qrX = (canvas.width - qrSize) / 2
              const qrY = y + 30
              ctx.strokeStyle = "#000000"
              ctx.strokeRect(qrX, qrY, qrSize, qrSize)
              ctx.font = "20px Arial"
              ctx.textAlign = "center"
              ctx.fillText("QR CODE", canvas.width / 2, qrY + qrSize / 2 + 10)
              y = qrY + qrSize + 50 // Adjust 'y' after the QR
            }
          } catch (e) {
            console.warn("Could not parse qr_data as JSON or qrImageUrl not found:", e);
            // Fallback to generic QR placeholder if parsing fails
            const qrSize = 150
            const qrX = (canvas.width - qrSize) / 2
            const qrY = y + 30
            ctx.strokeStyle = "#000000"
            ctx.strokeRect(qrX, qrY, qrSize, qrSize)
            ctx.font = "20px Arial"
            ctx.textAlign = "center"
            ctx.fillText("QR CODE", canvas.width / 2, qrY + qrSize / 2 + 10)
            y = qrY + qrSize + 50 // Adjust 'y' after the QR
          }
        } else {
          y += 50; // Espacio si no hay QR
        }

        // Footer
        ctx.font = "14px Arial"
        ctx.textAlign = "center"
        ctx.fillStyle = "#555555"
        ctx.fillText("Este comprobante es válido como prueba de pago", canvas.width / 2, y)
        ctx.fillText("Sindicato de Transporte 27 de Noviembre - Warnes", canvas.width / 2, y + 20)
        ctx.fillText("¡Gracias por viajar con nosotros!", canvas.width / 2, y + 40)


        // Descargar
        const link = document.createElement("a")
        link.download = `comprobante-${comprobante.numero_comprobante}.png`
        link.href = canvas.toDataURL("image/png") // Especificar formato PNG
        link.click()

        toast({
          title: "Comprobante descargado",
          description: "El comprobante se ha guardado en tu dispositivo",
        })
      }
    } catch (error) {
      console.error("Error al descargar comprobante:", error);
      toast({
        title: "Error al descargar",
        description: "No se pudo descargar el comprobante",
        variant: "destructive",
      })
    } finally {
      setDescargando(false)
    }
  }

  const compartirComprobante = async () => {
    try {
      const texto = `
🧾 COMPROBANTE DE PAGO
Sindicato 27 de Noviembre - Warnes

📋 Número: ${comprobante.numero_comprobante}
📅 Fecha: ${new Date(comprobante.fecha).toLocaleString()}
👤 Pasajero: ${comprobante.pasajero}
🚐 Conductor: ${comprobante.conductor}
🗺️ Ruta: ${comprobante.origen} → ${comprobante.destino}
💰 Monto: Bs. ${comprobante.monto.toFixed(2)}
💳 Método: ${comprobante.metodo_pago}
✅ Estado: ${comprobante.estado.toUpperCase()}

¡Gracias por viajar con nosotros!
      `.trim()

      if (navigator.share) {
        await navigator.share({
          title: "Comprobante de Pago",
          text: texto,
        })
      } else {
        // Fallback para navegadores que no soportan Web Share API
        await navigator.clipboard.writeText(texto)
        toast({
          title: "Copiado al portapapeles",
          description: "El comprobante se ha copiado para compartir",
        })
      }

      onCompartir?.()
    } catch (error) {
      console.error("Error al compartir comprobante:", error);
      toast({
        title: "Error al compartir",
        description: "No se pudo compartir el comprobante",
        variant: "destructive",
      })
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "completado":
        return "bg-green-500"
      case "procesando": // Usar para "pendiente" o "procesando"
      case "pendiente":
        return "bg-yellow-500"
      case "fallido": // Usar para "error" o "fallido"
      case "error":
        return "bg-red-500"
      case "reembolsado":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "completado":
        return <CheckCircle className="w-4 h-4" />
      case "procesando":
      case "pendiente":
        return <Clock className="w-4 h-4" />
      case "fallido":
      case "error":
        return <XCircle className="w-4 h-4" />
      default:
        return <Receipt className="w-4 h-4" />
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <Card ref={comprobanteRef} className="border-2 border-green-200">
        <CardHeader className="bg-green-600 text-white text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Receipt className="w-6 h-6" />
            <CardTitle className="text-lg">COMPROBANTE DE PAGO</CardTitle>
          </div>
          <p className="text-green-100 text-sm">Sindicato 27 de Noviembre - Warnes</p>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {/* Número de Comprobante */}
          <div className="text-center border-b pb-4">
            <p className="text-sm text-gray-600">Número de Comprobante</p>
            <p className="text-xl font-bold text-green-600">{comprobante.numero_comprobante}</p>
          </div>

          {/* Estado */}
          <div className="flex justify-center">
            <Badge className={`${getEstadoColor(comprobante.estado)} text-white`}>
              {getEstadoIcon(comprobante.estado)}
              <span className="ml-1">{comprobante.estado.toUpperCase()}</span>
            </Badge>
          </div>

          {/* Detalles del Viaje */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Fecha y Hora</p>
                <p className="font-medium">{new Date(comprobante.fecha).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Pasajero</p>
                <p className="font-medium">{comprobante.pasajero}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Conductor</p>
                <p className="font-medium">{comprobante.conductor}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Ruta</p>
                <p className="font-medium">
                  {comprobante.origen} → {comprobante.destino}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CreditCard className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Método de Pago</p>
                <p className="font-medium">{comprobante.metodo_pago}</p>
              </div>
            </div>
          </div>

          {/* Monto */}
          <div className="bg-green-50 p-4 rounded-lg text-center border">
            <p className="text-sm text-gray-600">Monto Pagado</p>
            <p className="text-3xl font-bold text-green-600">Bs. {comprobante.monto.toFixed(2)}</p>
          </div>

          {/* QR Code */}
          {comprobante.qr_data && (
            <div className="text-center border-t pt-4">
              {(() => {
                try {
                  const qrInfo = JSON.parse(comprobante.qr_data);
                  if (qrInfo.qrImageUrl) {
                    // eslint-disable-next-line @next/next/no-img-element
                    return <img src={qrInfo.qrImageUrl || "/placeholder.svg"} alt="Código QR" className="w-24 h-24 mx-auto object-contain" />;
                  }
                } catch (e) {
                  // Fallback if qr_data is not a valid JSON or qrImageUrl is missing
                }
                return (
                  <div className="w-24 h-24 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg mx-auto flex items-center justify-center">
                    <QrCode className="w-8 h-8 text-gray-400" />
                  </div>
                );
              })()}
              <p className="text-xs text-gray-500 mt-2">Código QR de verificación</p>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={descargarComprobante}
              disabled={descargando}
              className="flex-1 bg-transparent"
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              {descargando ? "Descargando..." : "Descargar"}
            </Button>

            <Button onClick={compartirComprobante} className="flex-1 bg-transparent" variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Compartir
            </Button>
          </div>

          {/* Botón de Verificación (solo para conductores/secretaría) */}
          {onVerificar && comprobante.estado === "pendiente" && ( // Solo verificar si está pendiente
            <Button onClick={onVerificar} className="w-full bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              Verificar Comprobante
            </Button>
          )}

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 border-t pt-4">
            <p>Este comprobante es válido como prueba de pago</p>
            <p>Sindicato de Transporte 27 de Noviembre - Warnes</p>
            <p>¡Gracias por viajar con nosotros!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
