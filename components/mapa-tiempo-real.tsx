"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"
import type { google } from "google-maps"

interface Vehiculo {
  id: string
  conductor: string
  vehiculo: string
  placa: string
  lat: number
  lng: number
  estado: "disponible" | "en_viaje" | "fuera_servicio"
  pasajeros: number
  capacidad: number
  telefono: string
}

interface MapaTiempoRealProps {
  vehiculos: Vehiculo[]
  centroMapa?: { lat: number; lng: number }
  zoom?: number
  onVehiculoClick?: (vehiculo: Vehiculo) => void
}

const MapaTiempoReal: React.FC<MapaTiempoRealProps> = ({
  vehiculos,
  centroMapa = { lat: -17.7833, lng: -63.1821 }, // Santa Cruz de la Sierra, Bolivia
  zoom = 12,
  onVehiculoClick,
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const markersRef = useRef<{ [key: string]: google.maps.Marker }>({})
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (window.google && window.google.maps) {
        setLoading(false)
        return
      }

      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=geometry,places`
      script.async = true
      script.defer = true
      script.onload = () => setLoading(false)
      script.onerror = () => {
        setError("Error al cargar Google Maps. Verifica tu clave API.")
        setLoading(false)
      }
      document.head.appendChild(script)
    }

    loadGoogleMapsScript()
  }, [])

  useEffect(() => {
    if (loading || error || !mapRef.current || !window.google) return

    if (!map) {
      const newMap = new window.google.maps.Map(mapRef.current, {
        center: centroMapa,
        zoom: zoom,
        mapId: "YOUR_MAP_ID", // Puedes usar un Map ID de Google Cloud para estilos personalizados
        disableDefaultUI: true, // Deshabilita controles por defecto
      })
      setMap(newMap)
      infoWindowRef.current = new window.google.maps.InfoWindow()
    } else {
      map.setCenter(centroMapa)
      map.setZoom(zoom)
    }
  }, [map, loading, error, centroMapa, zoom])

  useEffect(() => {
    if (!map || !window.google) return

    const currentMarkers = markersRef.current
    const newMarkers: { [key: string]: google.maps.Marker } = {}

    vehiculos.forEach((vehiculo) => {
      const position = { lat: vehiculo.lat, lng: vehiculo.lng }

      if (currentMarkers[vehiculo.id]) {
        // Update existing marker position
        currentMarkers[vehiculo.id].setPosition(position)
        newMarkers[vehiculo.id] = currentMarkers[vehiculo.id]
      } else {
        // Create new marker
        const marker = new window.google.maps.Marker({
          position: position,
          map: map,
          title: `${vehiculo.conductor} - ${vehiculo.vehiculo}`,
          icon: {
            url: vehiculo.estado === "disponible" ? "/car-green.png" : "/car-red.png", // Custom icons
            scaledSize: new window.google.maps.Size(32, 32),
          },
        })

        marker.addListener("click", () => {
          if (infoWindowRef.current) {
            infoWindowRef.current.close()
            infoWindowRef.current.setContent(`
              <div style="padding: 10px; font-family: sans-serif;">
                <h3 style="margin-top: 0; font-size: 16px; font-weight: bold;">${vehiculo.conductor}</h3>
                <p style="margin-bottom: 5px; font-size: 14px;">${vehiculo.vehiculo} (${vehiculo.placa})</p>
                <p style="margin-bottom: 5px; font-size: 12px; color: ${vehiculo.estado === "disponible" ? "green" : "red"};">Estado: ${vehiculo.estado === "disponible" ? "Disponible" : "En Viaje"}</p>
                <p style="margin-bottom: 5px; font-size: 12px;">Pasajeros: ${vehiculo.pasajeros}/${vehiculo.capacidad}</p>
                <p style="margin-bottom: 0; font-size: 12px;">Teléfono: ${vehiculo.telefono}</p>
              </div>
            `)
            infoWindowRef.current.open(map, marker)
          }
          onVehiculoClick?.(vehiculo)
        })
        newMarkers[vehiculo.id] = marker
      }
    })

    // Remove markers that are no longer in the vehiculos array
    for (const id in currentMarkers) {
      if (!newMarkers[id]) {
        currentMarkers[id].setMap(null)
      }
    }

    markersRef.current = newMarkers
  }, [map, vehiculos, onVehiculoClick])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="ml-2 text-gray-600">Cargando mapa...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
        <p>{error}</p>
      </div>
    )
  }

  return <div ref={mapRef} className="w-full h-96 rounded-lg" aria-label="Mapa de vehículos en tiempo real" />
}

export default MapaTiempoReal
