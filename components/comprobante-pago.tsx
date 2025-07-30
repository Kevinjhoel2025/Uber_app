"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, Download, Share2, Copy, QrCode, Receipt, Calendar, User, CreditCard } from "lucide-react"
import { obtenerComprobante, verificarComprobante } from "@/lib/database"
import type { Comprobante } from "@/lib/database"

interface ComprobantePagoProps {
  pagoId: string
  datosViaje: {
    conductor: string
    vehiculo: string
    ruta: string
    fecha: string
    hora: string
    precio: number
    pasajero: string
    metodo: string
  }
  onVerificar?: (comprobante: Comprobante) => void
  mostrarVerificacion?: boolean
  usuarioId?: string
}

export default function ComprobantePago({
  pagoId,
  datosViaje,
  onVerificar,
  mostrarVerificacion = false,
  usuarioId,
}: ComprobantePagoProps) {
  const [comprobante, setComprobante] = useState<Comprobante | null>(null)
  const [cargando, setCargando] = useState(true)
  const [verificando, setVerificando] = useState(false)
  const [codigoVerificacion, setCodigoVerificacion] = useState("")
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    cargarComprobante()
  }, [pagoId])

  const cargarComprobante = async () => {
    setCargando(true)
    try {
      const data = await obtenerComprobante(pagoId)
      setComprobante(data)
    } catch (error) {
      console.error("Error cargando comprobante:", error)
    } finally {
      setCargando(false)
    }
  }

  const handleVerificar = async () => {
    if (!comprobante || !usuarioId) return

    setVerificando(true)
    try {
      const exito = await verificarComprobante(comprobante.id, usuarioId)
      if (exito) {
        setComprobante({ ...comprobante, verificado: true, fecha_verificacion: new Date().toISOString() })
        onVerificar?.(comprobante)
      } else {
        alert("Error al verificar el comprobante")
      }
    } catch (error) {
      console.error("Error verificando comprobante:", error)
      alert("Error al verificar el comprobante")
    } finally {
      setVerificando(false)
    }
  }

  const copiarNumeroComprobante = () => {
    if (comprobante) {
      navigator.clipboard.writeText(comprobante.numero_comprobante)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    }
  }

  const descargarComprobante = () => {
    // Crear un elemento canvas para generar el comprobante como imagen
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx || !comprobante) return

    canvas.width = 400
    canvas.height = 600

    // Fondo blanco
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Título
    ctx.fillStyle = "#1f2937"
    ctx.font = "bold 24px Arial"
    ctx.textAlign = "center"
    ctx.fillText("COMPROBANTE DE PAGO", canvas.width / 2, 40)

    // Información del comprobante
    ctx.font = "16px Arial"
    ctx.textAlign = "left"
    let y = 80

    const info = [
      `Número: ${comprobante.numero_comprobante}`,
      `Fecha: ${new Date(comprobante.created_at).toLocaleDateString()}`,
      `Pasajero: ${datosViaje.pasajero}`,
      `Conductor: ${datosViaje.conductor}`,
      `Vehículo: ${datosViaje.vehiculo}`,
      `Ruta: ${datosViaje.ruta}`,
      `Fecha del viaje: ${datosViaje.fecha}`,
      `Hora: ${datosViaje.hora}`,
      `Método de pago: ${datosViaje.metodo}`,
      `Monto: Bs. ${datosViaje.precio}`,
      `Estado: ${comprobante.verificado ? "VERIFICADO" : "PENDIENTE"}`,
    ]

    info.forEach((line) => {
      ctx.fillText(line, 20, y)
      y += 30
    })

    // Estado de verificación
    if (comprobante.verificado) {
      ctx.fillStyle = "#10b981"
      ctx.font = "bold 18px Arial"
      ctx.textAlign = "center"
      ctx.fillText("✓ COMPROBANTE VERIFICADO", canvas.width / 2, y + 40)
    }

    // Descargar
    const link = document.createElement("a")
    link.download = `comprobante-${comprobante.numero_comprobante}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  const compartirComprobante = async () => {
    if (!comprobante) return

    const texto = `Comprobante de Pago
Número: ${comprobante.numero_comprobante}
Ruta: ${datosViaje.ruta}
Monto: Bs. ${datosViaje.precio}
Estado: ${comprobante.verificado ? "VERIFICADO" : "PENDIENTE"}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Comprobante de Pago - TransSindicato",
          text: texto,
        })
      } catch (error) {
        console.log("Error compartiendo:", error)
      }
    } else {
      navigator.clipboard.writeText(texto)
      alert("Información del comprobante copiada al portapapeles")
    }
  }

  if (cargando) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando comprobante...</p>
        </CardContent>
      </Card>
    )
  }

  if (!comprobante) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-8 text-center">
          <Receipt className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-red-800 mb-2">Comprobante no encontrado</h3>
          <p className="text-red-700">No se pudo cargar el comprobante de este pago.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Comprobante Principal */}
      <Card className={`${comprobante.verificado ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}`}>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Receipt className="w-8 h-8 text-blue-600" />
            <CardTitle className="text-xl">Comprobante de Pago</CardTitle>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Badge variant={comprobante.verificado ? "default" : "secondary"} className="text-sm">
              {comprobante.verificado ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  VERIFICADO
                </>
              ) : (
                "PENDIENTE DE VERIFICACIÓN"
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Número de Comprobante */}
          <div className="text-center p-4 bg-white rounded-lg border">
            <p className="text-sm text-gray-600 mb-1">Número de Comprobante</p>
            <div className="flex items-center justify-center gap-2">
              <p className="text-lg font-mono font-bold">{comprobante.numero_comprobante}</p>
              <Button variant="ghost" size="sm" onClick={copiarNumeroComprobante}>
                {copiado ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Información del Viaje */}
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <User className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Pasajero</p>
                <p className="font-medium">{datosViaje.pasajero}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <User className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Conductor</p>
                <p className="font-medium">{datosViaje.conductor}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <QrCode className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Ruta</p>
                <p className="font-medium">{datosViaje.ruta}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Fecha y Hora</p>
                <p className="font-medium">
                  {datosViaje.fecha} - {datosViaje.hora}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <CreditCard className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Método de Pago</p>
                <p className="font-medium">{datosViaje.metodo}</p>
              </div>
            </div>
          </div>

          {/* Monto Total */}
          <div className="text-center p-4 bg-blue-600 text-white rounded-lg">
            <p className="text-sm opacity-90">Monto Total</p>
            <p className="text-2xl font-bold">Bs. {datosViaje.precio}</p>
          </div>

          {/* Información de Verificación */}
          {comprobante.verificado && comprobante.fecha_verificacion && (
            <div className="p-3 bg-green-100 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Comprobante Verificado</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Verificado el {new Date(comprobante.fecha_verificacion).toLocaleString()}
              </p>
            </div>
          )}

          {/* Código QR si existe */}
          {comprobante.qr_data && (
            <div className="text-center p-4 bg-white rounded-lg border">
              <p className="text-sm text-gray-600 mb-2">Código QR del Pago</p>
              <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto flex items-center justify-center">
                <QrCode className="w-16 h-16 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 mt-2">Datos: {comprobante.qr_data}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verificación Manual (solo para secretaría/conductores) */}
      {mostrarVerificacion && !comprobante.verificado && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Verificar Comprobante</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Código de Verificación (opcional)</Label>
              <Input
                placeholder="Ingrese código si es necesario"
                value={codigoVerificacion}
                onChange={(e) => setCodigoVerificacion(e.target.value)}
              />
            </div>
            <Button onClick={handleVerificar} disabled={verificando} className="w-full">
              {verificando ? "Verificando..." : "Verificar Comprobante"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Acciones */}
      <div className="grid grid-cols-3 gap-3">
        <Button variant="outline" onClick={descargarComprobante} className="bg-transparent">
          <Download className="w-4 h-4 mr-2" />
          Descargar
        </Button>
        <Button variant="outline" onClick={compartirComprobante} className="bg-transparent">
          <Share2 className="w-4 h-4 mr-2" />
          Compartir
        </Button>
        <Button variant="outline" onClick={copiarNumeroComprobante} className="bg-transparent">
          {copiado ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
          {copiado ? "¡Copiado!" : "Copiar"}
        </Button>
      </div>

      {/* Información Legal */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="p-4">
          <h4 className="font-semibold text-gray-800 mb-2">Información Legal</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Este comprobante es válido como prueba de pago</li>
            <li>• Conserve este comprobante para sus registros</li>
            <li>• En caso de reclamos, presente este comprobante</li>
            <li>• Sindicato 27 de Noviembre - Warnes</li>
            <li>• Fecha de emisión: {new Date(comprobante.created_at).toLocaleString()}</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
