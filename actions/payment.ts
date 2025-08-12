'use server'

import {
  crearPago,
  actualizarEstadoPago,
  crearComprobante,
  obtenerComprobantePorPagoId,
  obtenerUsuario,
  obtenerConductor,
  obtenerPrecioRuta,
} from '@/lib/database'
import type { Pago, Comprobante } from '@/lib/supabase'

interface InitiatePaymentResult {
  success: boolean
  message: string
  pago?: Pago
  qrData?: {
    banco: string
    cuenta: string
    titular: string
    monto: number
    concepto: string
    referencia: string
    qrImageUrl?: string // Simulated QR image URL
  }
}

/**
 * Simula la iniciación de un pago con una pasarela externa y crea un registro de pago en la DB.
 * En un entorno real, esto llamaría a la API de la pasarela de pago para crear un intento de pago.
 */
export async function initiateQrPayment(
  pasajeroId: string,
  conductorId: string,
  origen: string,
  destino: string,
  asientos: number,
  viajeId: string | null,
): Promise<InitiatePaymentResult> {
  try {
    const fetchedPrecio = await obtenerPrecioRuta(origen, destino)
    if (fetchedPrecio === null) {
      return { success: false, message: 'No se pudo obtener el precio de la ruta.' }
    }
    const totalPagar = fetchedPrecio * asientos

    // Simulate generating QR data from a payment gateway
    const qrData = {
      banco: 'Banco Unión',
      cuenta: '1234567890',
      titular: 'Sindicato 27 de Noviembre',
      monto: totalPagar,
      concepto: `Viaje ${origen} - ${destino}`,
      referencia: `REF-${Date.now()}`,
      qrImageUrl: `/placeholder.svg?height=200&width=200&query=QR Code for ${totalPagar} Bs`, // Simulated QR image
    }

    // Create initial payment record in DB
    const nuevoPago = await crearPago({
      viaje_id: viajeId,
      pasajero_id: pasajeroId,
      conductor_id: conductorId,
      monto: totalPagar,
      metodo_pago: 'QR',
      referencia_externa: qrData.referencia,
      estado: 'pendiente',
    })

    if (!nuevoPago) {
      return { success: false, message: 'No se pudo iniciar el proceso de pago en la base de datos.' }
    }

    return {
      success: true,
      message: 'Pago iniciado exitosamente. Esperando confirmación.',
      pago: nuevoPago,
      qrData: qrData,
    }
  } catch (error) {
    console.error('Error en initiateQrPayment:', error)
    return { success: false, message: 'Error interno al iniciar el pago.' }
  }
}

interface ConfirmPaymentResult {
  success: boolean
  message: string
  comprobante?: Comprobante
  pago?: Pago
}

/**
 * Simula la confirmación de un pago (como un webhook de pasarela de pago).
 * En un entorno real, esto sería activado por la pasarela de pago.
 */
export async function confirmQrPayment(pagoId: string): Promise<ConfirmPaymentResult> {
  try {
    // Simulate payment gateway processing time
    await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 1000)) // 2-3 seconds

    const exito = Math.random() > 0.1 // 90% success rate for simulation

    if (exito) {
      const pagoActualizado = await actualizarEstadoPago(pagoId, 'completado')
      if (!pagoActualizado) {
        return { success: false, message: 'No se pudo actualizar el estado del pago a completado.' }
      }

      // Fetch the updated payment to get full details for comprobante
      const pagoCompleto = await obtenerComprobantePorPagoId(pagoId) // Re-using this function, though it fetches comprobante by pago_id
      if (!pagoCompleto) {
        return { success: false, message: 'No se encontró el pago para generar el comprobante.' }
      }

      const comprobante = await crearComprobante(pagoId, JSON.stringify({
        banco: 'Banco Unión',
        cuenta: '1234567890',
        titular: 'Sindicato 27 de Noviembre',
        monto: pagoCompleto.monto,
        concepto: `Viaje`,
        referencia: pagoCompleto.referencia_externa,
      }))

      if (!comprobante) {
        // If payment completed but comprobante failed to generate
        return { success: false, message: 'Pago completado, pero no se pudo generar el comprobante.' }
      }

      return {
        success: true,
        message: 'Pago confirmado y comprobante generado exitosamente.',
        comprobante: comprobante,
        pago: pagoActualizado,
      }
    } else {
      await actualizarEstadoPago(pagoId, 'fallido')
      return { success: false, message: 'El pago fue rechazado por la pasarela de pago simulada.' }
    }
  } catch (error) {
    console.error('Error en confirmQrPayment:', error)
    return { success: false, message: 'Error interno al confirmar el pago.' }
  }
}
