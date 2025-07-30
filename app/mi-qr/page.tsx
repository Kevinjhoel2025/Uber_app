"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Download, Share2, Copy, CheckCircle } from "lucide-react"

export default function MiQR() {
  const [monto, setMonto] = useState("")
  const [concepto, setConcepto] = useState("Pago de viaje")
  const [copiado, setCopiado] = useState(false)

  const datosQR = {
    nombre: "Carlos Mendoza",
    telefono: "70123456",
    vehiculo: "Toyota Hiace - ABC123",
    sindicato: "27 de Noviembre - Warnes",
  }

  const copiarDatos = () => {
    const texto = `Pago a: ${datosQR.nombre}\nTeléfono: ${datosQR.telefono}\nVehículo: ${datosQR.vehiculo}\nSindicato: ${datosQR.sindicato}`
    navigator.clipboard.writeText(texto)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-green-700"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Mi Código QR</h1>
            <p className="text-green-100 text-sm">Para recibir pagos</p>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto">
        {/* Código QR */}
        <Card className="mb-6">
          <CardContent className="p-8 text-center">
            <div className="w-64 h-64 bg-white border-2 border-gray-300 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <div
                className="w-56 h-56 bg-black"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' fill='white'/%3E%3Cg fill='black'%3E%3Crect x='0' y='0' width='8' height='8'/%3E%3Crect x='16' y='0' width='8' height='8'/%3E%3Crect x='32' y='0' width='8' height='8'/%3E%3Crect x='48' y='0' width='8' height='8'/%3E%3Crect x='64' y='0' width='8' height='8'/%3E%3Crect x='80' y='0' width='8' height='8'/%3E%3Crect x='96' y='0' width='8' height='8'/%3E%3Crect x='112' y='0' width='8' height='8'/%3E%3Crect x='0' y='16' width='8' height='8'/%3E%3Crect x='32' y='16' width='8' height='8'/%3E%3Crect x='64' y='16' width='8' height='8'/%3E%3Crect x='96' y='16' width='8' height='8'/%3E%3Crect x='0' y='32' width='8' height='8'/%3E%3Crect x='16' y='32' width='8' height='8'/%3E%3Crect x='48' y='32' width='8' height='8'/%3E%3Crect x='80' y='32' width='8' height='8'/%3E%3Crect x='112' y='32' width='8' height='8'/%3E%3Crect x='16' y='48' width='8' height='8'/%3E%3Crect x='32' y='48' width='8' height='8'/%3E%3Crect x='48' y='48' width='8' height='8'/%3E%3Crect x='64' y='48' width='8' height='8'/%3E%3Crect x='96' y='48' width='8' height='8'/%3E%3Crect x='0' y='64' width='8' height='8'/%3E%3Crect x='16' y='64' width='8' height='8'/%3E%3Crect x='32' y='64' width='8' height='8'/%3E%3Crect x='48' y='64' width='8' height='8'/%3E%3Crect x='64' y='64' width='8' height='8'/%3E%3Crect x='80' y='64' width='8' height='8'/%3E%3Crect x='96' y='64' width='8' height='8'/%3E%3Crect x='112' y='64' width='8' height='8'/%3E%3Crect x='0' y='80' width='8' height='8'/%3E%3Crect x='32' y='80' width='8' height='8'/%3E%3Crect x='64' y='80' width='8' height='8'/%3E%3Crect x='96' y='80' width='8' height='8'/%3E%3Crect x='16' y='96' width='8' height='8'/%3E%3Crect x='32' y='96' width='8' height='8'/%3E%3Crect x='48' y='96' width='8' height='8'/%3E%3Crect x='80' y='96' width='8' height='8'/%3E%3Crect x='112' y='96' width='8' height='8'/%3E%3Crect x='0' y='112' width='8' height='8'/%3E%3Crect x='16' y='112' width='8' height='8'/%3E%3Crect x='32' y='112' width='8' height='8'/%3E%3Crect x='48' y='112' width='8' height='8'/%3E%3Crect x='64' y='112' width='8' height='8'/%3E%3Crect x='80' y='112' width='8' height='8'/%3E%3Crect x='96' y='112' width='8' height='8'/%3E%3Crect x='112' y='112' width='8' height='8'/%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundSize: "cover",
                }}
              />
            </div>

            <h3 className="text-xl font-bold mb-2">{datosQR.nombre}</h3>
            <p className="text-gray-600 mb-1">{datosQR.vehiculo}</p>
            <p className="text-sm text-gray-500">{datosQR.sindicato}</p>
          </CardContent>
        </Card>

        {/* Información del Conductor */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Información de Pago</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Conductor:</span>
              <span className="font-medium">{datosQR.nombre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Teléfono:</span>
              <span className="font-medium">{datosQR.telefono}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Vehículo:</span>
              <span className="font-medium">{datosQR.vehiculo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Sindicato:</span>
              <span className="font-medium">{datosQR.sindicato}</span>
            </div>
          </CardContent>
        </Card>

        {/* Personalizar Pago */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Personalizar Pago</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Monto (Opcional)</Label>
              <Input placeholder="Bs. 15.00" type="number" value={monto} onChange={(e) => setMonto(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Concepto</Label>
              <Input placeholder="Pago de viaje" value={concepto} onChange={(e) => setConcepto(e.target.value)} />
            </div>
            <Button className="w-full">Generar QR Personalizado</Button>
          </CardContent>
        </Card>

        {/* Acciones */}
        <div className="space-y-3">
          <Button variant="outline" className="w-full bg-transparent" onClick={copiarDatos}>
            {copiado ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                ¡Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copiar Información
              </>
            )}
          </Button>

          <Button variant="outline" className="w-full bg-transparent">
            <Share2 className="w-4 h-4 mr-2" />
            Compartir QR
          </Button>

          <Button variant="outline" className="w-full bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            Descargar QR
          </Button>
        </div>

        {/* Instrucciones */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">¿Cómo usar tu QR?</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Los pasajeros pueden escanear tu QR con cualquier app bancaria</li>
              <li>• El pago se procesa automáticamente</li>
              <li>• Recibirás una notificación cuando se complete el pago</li>
              <li>• Puedes personalizar el monto y concepto según necesites</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
