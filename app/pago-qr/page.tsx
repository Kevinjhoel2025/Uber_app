"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, CheckCircle, Clock, QrCode, CreditCard, Smartphone } from "lucide-react"
import { crearComprobante } from "@/lib/database"
import ComprobantePago from "@/components/comprobante-pago"

export default function PagoQR() {
  const [metodoPago, setMetodoPago] = useState("qr")
  const [estadoPago, setEstadoPago] = useState("seleccionando") // seleccionando, procesando, completado, error
  const [tiempoRestante, setTiempoRestante] = useState(300) // 5 minutos
  const [pagoId, setPagoId] = useState<string | null>(null)

  // Datos del viaje
  const datosViaje = {
    conductor: "Carlos Mendoza",
    vehiculo: "Toyota Hiace - ABC123",
    ruta: "Warnes → Satélite Norte", // Actualizado con nueva parada
    hora: "15:00",
    asientos: 1,
    precio: 20, // Precio actualizado para Satélite Norte
    pasajero: "Juan Pérez",
    fecha: new Date().toLocaleDateString(),
  }

  // Countdown timer
  useEffect(() => {
    if (estadoPago === "procesando" && tiempoRestante > 0) {
      const timer = setTimeout(() => setTiempoRestante(tiempoRestante - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [estadoPago, tiempoRestante])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const procesarPago = async () => {
    setEstadoPago("procesando")

    // Simular procesamiento de pago
    setTimeout(async () => {
      try {
        // Simular creación de pago en la base de datos
        const pagoSimulado = "pago-" + Date.now()

        // Crear comprobante
        const comprobante = await crearComprobante(pagoSimulado, `QR_${Date.now()}`)

        if (comprobante) {
          setPagoId(pagoSimulado)
          setEstadoPago("completado")
        } else {
          setEstadoPago("error")
        }
      } catch (error) {
        console.error("Error procesando pago:", error)
        setEstadoPago("error")
      }
    }, 3000)
  }

  const metodosDisponibles = [
    {
      id: "qr",
      nombre: "Código QR",
      descripcion: "Escanea con tu app bancaria",
      icono: <QrCode className="w-6 h-6" />,
      color: "bg-blue-500",
    },
    {
      id: "tigo",
      nombre: "Tigo Money",
      descripcion: "Pago con Tigo Money",
      icono: <Smartphone className="w-6 h-6" />,
      color: "bg-red-500",
    },
    {
      id: "union",
      nombre: "Banco Unión",
      descripcion: "Transferencia bancaria",
      icono: <CreditCard className="w-6 h-6" />,
      color: "bg-green-500",
    },
    {
      id: "billetera",
      nombre: "Mi Billetera",
      descripcion: "Saldo: Bs. 45.50",
      icono: <CreditCard className="w-6 h-6" />,
      color: "bg-purple-500",
    },
  ]

  if (estadoPago === "completado" && pagoId) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto pt-8">
          <Card className="border-green-200 bg-green-50 mb-4">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">¡Pago Exitoso!</h2>
              <p className="text-green-700 mb-6">Tu asiento ha sido reservado</p>
            </CardContent>
          </Card>

          {/* Mostrar comprobante */}
          <ComprobantePago
            pagoId={pagoId}
            datosViaje={{
              conductor: datosViaje.conductor,
              vehiculo: datosViaje.vehiculo,
              ruta: datosViaje.ruta,
              fecha: datosViaje.fecha,
              hora: datosViaje.hora,
              precio: datosViaje.precio,
              pasajero: datosViaje.pasajero,
              metodo: metodosDisponibles.find((m) => m.id === metodoPago)?.nombre || "QR",
            }}
          />

          <div className="mt-6 space-y-3">
            <Button className="w-full" onClick={() => (window.location.href = "/usuario-dashboard")}>
              Volver al Inicio
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (estadoPago === "error") {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto pt-8">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-red-800 mb-2">Error en el Pago</h2>
              <p className="text-red-700 mb-6">Hubo un problema procesando tu pago</p>
              <div className="space-y-3">
                <Button onClick={() => setEstadoPago("seleccionando")} className="w-full">
                  Intentar de Nuevo
                </Button>
                <Button variant="outline" className="w-full bg-transparent" onClick={() => window.history.back()}>
                  Volver
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-blue-700"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Confirmar Pago</h1>
            <p className="text-blue-100 text-sm">Reserva tu asiento</p>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto">
        {/* Resumen del Viaje */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Resumen del Viaje</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Conductor:</span>
              <span className="font-medium">{datosViaje.conductor}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Vehículo:</span>
              <span className="font-medium">{datosViaje.vehiculo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ruta:</span>
              <span className="font-medium">{datosViaje.ruta}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hora:</span>
              <span className="font-medium">{datosViaje.hora}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Asientos:</span>
              <span className="font-medium">{datosViaje.asientos}</span>
            </div>
            <hr />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>Bs. {datosViaje.precio}</span>
            </div>
          </CardContent>
        </Card>

        {estadoPago === "seleccionando" && (
          <>
            {/* Métodos de Pago */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Método de Pago</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {metodosDisponibles.map((metodo) => (
                  <div
                    key={metodo.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      metodoPago === metodo.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
                    }`}
                    onClick={() => setMetodoPago(metodo.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 ${metodo.color} rounded-full flex items-center justify-center text-white`}
                      >
                        {metodo.icono}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{metodo.nombre}</p>
                        <p className="text-sm text-gray-600">{metodo.descripcion}</p>
                      </div>
                      {metodoPago === metodo.id && <CheckCircle className="w-5 h-5 text-blue-600" />}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Button onClick={procesarPago} className="w-full h-12 text-lg">
              Proceder al Pago - Bs. {datosViaje.precio}
            </Button>
          </>
        )}

        {estadoPago === "procesando" && (
          <Card>
            <CardContent className="p-8 text-center">
              {metodoPago === "qr" ? (
                <>
                  <div className="w-48 h-48 bg-white border-2 border-gray-300 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <div
                      className="w-40 h-40 bg-black"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='white'/%3E%3Cg fill='black'%3E%3Crect x='0' y='0' width='10' height='10'/%3E%3Crect x='20' y='0' width='10' height='10'/%3E%3Crect x='40' y='0' width='10' height='10'/%3E%3Crect x='60' y='0' width='10' height='10'/%3E%3Crect x='80' y='0' width='10' height='10'/%3E%3Crect x='0' y='20' width='10' height='10'/%3E%3Crect x='40' y='20' width='10' height='10'/%3E%3Crect x='80' y='20' width='10' height='10'/%3E%3Crect x='0' y='40' width='10' height='10'/%3E%3Crect x='20' y='40' width='10' height='10'/%3E%3Crect x='60' y='40' width='10' height='10'/%3E%3Crect x='80' y='40' width='10' height='10'/%3E%3Crect x='20' y='60' width='10' height='10'/%3E%3Crect x='40' y='60' width='10' height='10'/%3E%3Crect x='60' y='60' width='10' height='10'/%3E%3Crect x='0' y='80' width='10' height='10'/%3E%3Crect x='20' y='80' width='10' height='10'/%3E%3Crect x='40' y='80' width='10' height='10'/%3E%3Crect x='60' y='80' width='10' height='10'/%3E%3Crect x='80' y='80' width='10' height='10'/%3E%3C/g%3E%3C/svg%3E")`,
                        backgroundSize: "cover",
                      }}
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Escanea el Código QR</h3>
                  <p className="text-gray-600 mb-4">Usa tu app bancaria para escanear y pagar</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Procesando Pago</h3>
                  <p className="text-gray-600 mb-4">
                    Conectando con {metodosDisponibles.find((m) => m.id === metodoPago)?.nombre}
                  </p>
                </>
              )}

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-center gap-2 text-orange-700">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">Tiempo restante: {formatTime(tiempoRestante)}</span>
                </div>
              </div>

              <div className="text-sm text-gray-500">
                <p>
                  Monto: <strong>Bs. {datosViaje.precio}</strong>
                </p>
                <p>Concepto: Reserva de asiento - {datosViaje.ruta}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
