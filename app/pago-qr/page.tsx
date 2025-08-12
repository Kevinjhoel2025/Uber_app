"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, QrCode, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react'
import { useRouter, useSearchParams } from "next/navigation"
import ComprobantePago from "@/components/comprobante-pago"
import { toast } from "@/hooks/use-toast"
import {
  obtenerUsuario,
  obtenerConductor,
} from "@/lib/database"
import { useAuth } from "@/hooks/use-auth"
import type { Pago, Comprobante, Usuario, Conductor } from "@/lib/supabase"
import { initiateQrPayment, confirmQrPayment } from '@/actions/payment' // Importar las nuevas Server Actions

export default function PagoQR() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  // Obtener parámetros de la URL
  const origen = searchParams.get("origen") || "Warnes"
  const destino = searchParams.get("destino") || "Montero"
  const conductorId = searchParams.get("conductorId") // Usar conductorId en lugar de nombre
  const asientos = Number.parseInt(searchParams.get("asientos") || "1")
  const viajeId = searchParams.get("viajeId") // ID del viaje asociado

  const [precio, setPrecio] = useState<number | null>(null)
  const [totalPagar, setTotalPagar] = useState(0)
  const [estadoPago, setEstadoPago] = useState<"cargando" | "esperando" | "procesando" | "completado" | "error">(
    "cargando",
  )
  const [tiempoRestante, setTiempoRestante] = useState(300) // 5 minutos
  const [progreso, setProgreso] = useState(0)
  const [comprobanteGenerado, setComprobanteGenerado] = useState<Comprobante | null>(null)
  const [pagoActual, setPagoActual] = useState<Pago | null>(null)
  const [conductorInfo, setConductorInfo] = useState<Conductor | null>(null)
  const [pasajeroInfo, setPasajeroInfo] = useState<Usuario | null>(null)
  const [qrDisplayData, setQrDisplayData] = useState<{
    banco: string
    cuenta: string
    titular: string
    monto: number
    concepto: string
    referencia: string
    qrImageUrl?: string
  } | null>(null)

  // Cargar datos iniciales e iniciar pago
  useEffect(() => {
    const loadAndInitiatePayment = async () => {
      if (!user?.id || !conductorId) {
        toast({
          title: "Error",
          description: "Faltan datos de usuario o conductor.",
          variant: "destructive",
        })
        router.back()
        return
      }

      const fetchedConductor = await obtenerConductor(conductorId)
      if (fetchedConductor) {
        setConductorInfo(fetchedConductor)
      } else {
        toast({
          title: "Error",
          description: "No se pudo obtener la información del conductor.",
          variant: "destructive",
        })
        router.back()
        return
      }

      const fetchedPasajero = await obtenerUsuario(user.id)
      if (fetchedPasajero) {
        setPasajeroInfo(fetchedPasajero)
      } else {
        toast({
          title: "Error",
          description: "No se pudo obtener la información del pasajero.",
          variant: "destructive",
        })
        router.back()
        return
      }

      // Call Server Action to initiate payment
      const result = await initiateQrPayment(user.id, conductorId, origen, destino, asientos, viajeId)

      if (result.success && result.pago && result.qrData) {
        setPagoActual(result.pago)
        setQrDisplayData(result.qrData)
        setPrecio(result.qrData.monto / asientos) // Calculate price per seat from total
        setTotalPagar(result.qrData.monto)
        setEstadoPago("esperando")
      } else {
        toast({
          title: "Error",
          description: result.message || "No se pudo iniciar el proceso de pago.",
          variant: "destructive",
        })
        setEstadoPago("error")
      }
    }

    loadAndInitiatePayment()
  }, [user, conductorId, origen, destino, asientos, viajeId, router])

  // Countdown timer
  useEffect(() => {
    if (estadoPago === "esperando" && tiempoRestante > 0) {
      const timer = setInterval(() => {
        setTiempoRestante((prev) => {
          const nuevo = prev - 1
          setProgreso(((300 - nuevo) / 300) * 100)
          return nuevo
        })
      }, 1000)

      return () => clearInterval(timer)
    } else if (tiempoRestante === 0 && estadoPago === "esperando") {
      setEstadoPago("error")
      if (pagoActual) {
        // Optionally update payment status to 'expired' in DB via Server Action
        // await updatePaymentStatusServerAction(pagoActual.id, "expired");
      }
      toast({
        title: "Tiempo agotado",
        description: "El tiempo para realizar el pago ha expirado",
        variant: "destructive",
      })
    }
  }, [estadoPago, tiempoRestante, pagoActual])

  const simularPago = useCallback(async () => {
    if (!pagoActual) return

    setEstadoPago("procesando")
    toast({
      title: "Procesando pago...",
      description: "Verificando la transacción con la pasarela de pago simulada",
    })

    // Call Server Action to confirm payment
    const result = await confirmQrPayment(pagoActual.id)

    if (result.success && result.pago && result.comprobante) {
      setPagoActual(result.pago)
      setComprobanteGenerado(result.comprobante)
      setEstadoPago("completado")
      toast({
        title: "¡Pago exitoso!",
        description: "Tu pago ha sido procesado correctamente y el comprobante generado.",
      })
    } else {
      setEstadoPago("error")
      toast({
        title: "Error en el pago",
        description: result.message || "No se pudo procesar el pago. Intenta nuevamente.",
        variant: "destructive",
      })
    }
  }, [pagoActual])

  const reintentar = useCallback(async () => {
    if (!pagoActual) return

    // Resetear estado y tiempo
    setTiempoRestante(300)
    setProgreso(0)
    setComprobanteGenerado(null)

    // Re-initiate payment to get a new payment ID or reset the existing one
    const result = await initiateQrPayment(user!.id, conductorId!, origen, destino, asientos, viajeId)

    if (result.success && result.pago && result.qrData) {
      setPagoActual(result.pago)
      setQrDisplayData(result.qrData)
      setPrecio(result.qrData.monto / asientos)
      setTotalPagar(result.qrData.monto)
      setEstadoPago("esperando")
      toast({
        title: "Reintentando pago",
        description: "Puedes intentar el pago nuevamente.",
      })
    } else {
      toast({
        title: "Error",
        description: result.message || "No se pudo reintentar el pago. Por favor, contacta a soporte.",
        variant: "destructive",
      })
      setEstadoPago("error")
    }
  }, [pagoActual, user, conductorId, origen, destino, asientos, viajeId])

  const formatearTiempo = (segundos: number) => {
    const minutos = Math.floor(segundos / 60)
    const segs = segundos % 60
    return `${minutos}:${segs.toString().padStart(2, "0")}`
  }

  if (estadoPago === "cargando" || !precio || !conductorInfo || !pasajeroInfo || !qrDisplayData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-green-600 animate-spin mb-4" />
          <p className="text-lg text-gray-700">Cargando detalles del pago...</p>
        </div>
      </div>
    )
  }

  if (comprobanteGenerado && pagoActual) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" onClick={() => router.push("/usuario-dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">Pago Completado</h1>
          </div>

          <ComprobantePago
            comprobante={{
              numero_comprobante: comprobanteGenerado.numero_comprobante,
              fecha: pagoActual.created_at,
              pasajero: pasajeroInfo.nombre,
              conductor: conductorInfo.usuario?.nombre || "N/A",
              origen: origen,
              destino: destino,
              monto: pagoActual.monto,
              metodo_pago: pagoActual.metodo_pago,
              estado: pagoActual.estado,
              qr_data: comprobanteGenerado.qr_data || undefined,
            }}
            onCompartir={() => {
              toast({
                title: "Comprobante compartido",
                description: "El comprobante ha sido compartido exitosamente",
              })
            }}
          />

          <div className="mt-6 space-y-3">
            <Button
              onClick={() => router.push("/usuario-dashboard")}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Volver al Dashboard
            </Button>

            {viajeId && (
              <Button onClick={() => router.push(`/seguimiento/${viajeId}`)} variant="outline" className="w-full">
                Ver Estado del Viaje
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-white hover:bg-green-700" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Pago con QR</h1>
            <p className="text-green-100 text-sm">Escanea el código para pagar</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Información del Viaje */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">Detalles del Viaje</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Ruta:</span>
              <span className="font-medium">
                {origen} → {destino}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Conductor:</span>
              <span className="font-medium">{conductorInfo.usuario?.nombre || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Asientos:</span>
              <span className="font-medium">{asientos}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Precio por asiento:</span>
              <span className="font-medium">Bs. {precio}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total a pagar:</span>
              <span className="text-green-600">Bs. {totalPagar}</span>
            </div>
          </CardContent>
        </Card>

        {/* Estado del Pago */}
        <Card className="mb-4">
          <CardContent className="p-6">
            <div className="text-center">
              {estadoPago === "esperando" && (
                <div>
                  <div className="w-48 h-48 bg-white border-2 border-gray-300 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    {qrDisplayData.qrImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={qrDisplayData.qrImageUrl || "/placeholder.svg"}
                        alt="Código QR"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-center">
                        <QrCode className="w-16 h-16 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">Código QR</p>
                        <p className="text-xs text-gray-600">{qrDisplayData.banco}</p>
                      </div>
                    )}
                  </div>
                  <Badge variant="outline" className="mb-4">
                    <Clock className="w-4 h-4 mr-1" />
                    Esperando pago
                  </Badge>
                  <p className="text-sm text-gray-600 mb-4">
                    Escanea el código QR con tu app bancaria para realizar el pago
                  </p>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Tiempo restante:</span>
                      <span className="font-mono">{formatearTiempo(tiempoRestante)}</span>
                    </div>
                    <Progress value={progreso} className="h-2" />
                  </div>
                </div>
              )}

              {estadoPago === "procesando" && (
                <div>
                  <div className="w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 text-yellow-600 animate-spin" />
                  </div>
                  <Badge className="bg-yellow-500 text-white mb-4">
                    <Clock className="w-4 h-4 mr-1" />
                    Procesando pago
                  </Badge>
                  <p className="text-sm text-gray-600">Verificando tu transacción...</p>
                </div>
              )}

              {estadoPago === "error" && (
                <div>
                  <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <XCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <Badge variant="destructive" className="mb-4">
                    <XCircle className="w-4 h-4 mr-1" />
                    Error en el pago
                  </Badge>
                  <p className="text-sm text-gray-600 mb-4">
                    {tiempoRestante === 0
                      ? "El tiempo para realizar el pago ha expirado"
                      : "No se pudo procesar el pago. Verifica tu transacción."}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Información del QR */}
        {estadoPago === "esperando" && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-base">Datos para el Pago</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Banco:</span>
                <span className="font-medium">{qrDisplayData.banco}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cuenta:</span>
                <span className="font-medium">{qrDisplayData.cuenta}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Titular:</span>
                <span className="font-medium">{qrDisplayData.titular}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monto:</span>
                <span className="font-medium">Bs. {qrDisplayData.monto}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Concepto:</span>
                <span className="font-medium">{qrDisplayData.concepto}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Referencia:</span>
                <span className="font-medium font-mono text-xs">{qrDisplayData.referencia}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botones de Acción */}
        <div className="space-y-3">
          {estadoPago === "esperando" && (
            <div>
              <Button onClick={simularPago} className="w-full bg-green-600 hover:bg-green-700">
                <QrCode className="w-4 h-4 mr-2" />
                Simular Pago Realizado
              </Button>
              <p className="text-xs text-center text-gray-500">* En producción, el pago se detectará automáticamente</p>
            </div>
          )}

          {estadoPago === "error" && (
            <div>
              <Button onClick={reintentar} className="w-full bg-green-600 hover:bg-green-700">
                <RefreshCw className="w-4 h-4 mr-2" />
                Intentar Nuevamente
              </Button>
              <Button onClick={() => router.push("/usuario-dashboard")} variant="outline" className="w-full mt-2">
                Cancelar y Volver
              </Button>
            </div>
          )}

          {estadoPago === "procesando" && (
            <Button disabled className="w-full">
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Procesando...
            </Button>
          )}
        </div>

        {/* Ayuda */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">¿Necesitas ayuda?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 space-y-2">
            <p>• Asegúrate de tener saldo suficiente en tu cuenta</p>
            <p>• Verifica que el monto sea exacto</p>
            <p>• El pago debe realizarse dentro del tiempo límite</p>
            <p>• Si tienes problemas, contacta al conductor o secretaría</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
