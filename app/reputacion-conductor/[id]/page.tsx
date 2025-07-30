"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Award, Trophy, Medal, Star, TrendingUp, Calendar } from "lucide-react"
import SistemaCalificacion from "@/components/sistema-calificacion"

export default function ReputacionConductor() {
  const [selectedTab, setSelectedTab] = useState("resumen")

  // Datos del conductor
  const conductor = {
    id: "conductor-1",
    nombre: "Carlos Mendoza",
    foto: "/placeholder-user.jpg",
    vehiculo: "Toyota Hiace - ABC123",
    fechaIngreso: "2023-06-15",
    viajesCompletados: 1247,
    rating: 4.8,
    badges: [
      { id: "puntual", nombre: "Súper Puntual", icono: "⏰", descripcion: "95% de puntualidad" },
      { id: "limpio", nombre: "Vehículo Impecable", icono: "✨", descripcion: "Vehículo siempre limpio" },
      { id: "amable", nombre: "Conductor Amigable", icono: "😊", descripcion: "Excelente trato" },
      { id: "seguro", nombre: "Conductor Seguro", icono: "🛡️", descripcion: "Cero accidentes" },
      { id: "veterano", nombre: "Veterano", icono: "🏆", descripcion: "Más de 1000 viajes" },
    ],
    estadisticasMensuales: [
      { mes: "Ene", viajes: 98, rating: 4.7, ingresos: 1470 },
      { mes: "Feb", viajes: 105, rating: 4.8, ingresos: 1575 },
      { mes: "Mar", viajes: 112, rating: 4.9, ingresos: 1680 },
      { mes: "Abr", viajes: 108, rating: 4.8, ingresos: 1620 },
      { mes: "May", viajes: 115, rating: 4.8, ingresos: 1725 },
      { mes: "Jun", viajes: 120, rating: 4.9, ingresos: 1800 },
    ],
    logros: [
      { id: "1", titulo: "100 Viajes Completados", fecha: "2023-08-15", icono: Trophy },
      { id: "2", titulo: "Calificación 4.8+", fecha: "2023-10-20", icono: Star },
      { id: "3", titulo: "500 Viajes Completados", fecha: "2023-12-10", icono: Medal },
      { id: "4", titulo: "1000 Viajes Completados", fecha: "2024-01-05", icono: Award },
    ],
  }

  const getBadgeColor = (rating: number) => {
    if (rating >= 4.8) return "bg-green-500"
    if (rating >= 4.5) return "bg-blue-500"
    if (rating >= 4.0) return "bg-yellow-500"
    return "bg-gray-500"
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
            <h1 className="text-lg font-semibold">Reputación del Conductor</h1>
            <p className="text-green-100 text-sm">Perfil completo y estadísticas</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="resumen">Resumen</TabsTrigger>
            <TabsTrigger value="calificaciones">Calificaciones</TabsTrigger>
            <TabsTrigger value="logros">Logros</TabsTrigger>
            <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
          </TabsList>

          <TabsContent value="resumen" className="space-y-4">
            {/* Perfil del Conductor */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={conductor.foto || "/placeholder.svg"} />
                    <AvatarFallback>CM</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">{conductor.nombre}</h2>
                    <p className="text-gray-600">{conductor.vehiculo}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="text-xl font-bold">{conductor.rating}</span>
                      </div>
                      <Badge className={`${getBadgeColor(conductor.rating)} text-white`}>Conductor Destacado</Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{conductor.viajesCompletados}</p>
                    <p className="text-sm text-gray-600">Viajes Completados</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{conductor.badges.length}</p>
                    <p className="text-sm text-gray-600">Badges Obtenidos</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {Math.floor(
                        (Date.now() - new Date(conductor.fechaIngreso).getTime()) / (1000 * 60 * 60 * 24 * 30),
                      )}
                    </p>
                    <p className="text-sm text-gray-600">Meses de Servicio</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Badges del Conductor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Badges de Reconocimiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {conductor.badges.map((badge) => (
                    <div key={badge.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-2xl">
                        {badge.icono}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{badge.nombre}</h4>
                        <p className="text-sm text-gray-600">{badge.descripcion}</p>
                      </div>
                      <Badge variant="outline">Obtenido</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calificaciones" className="space-y-4">
            <SistemaCalificacion
              conductorId={conductor.id}
              conductorNombre={conductor.nombre}
              conductorFoto={conductor.foto}
              viajeId=""
              mostrarHistorial={true}
            />
          </TabsContent>

          <TabsContent value="logros" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Logros Desbloqueados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {conductor.logros.map((logro) => (
                    <div
                      key={logro.id}
                      className="flex items-center gap-4 p-4 border rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50"
                    >
                      <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                        <logro.icono className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{logro.titulo}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>Desbloqueado el {logro.fecha}</span>
                        </div>
                      </div>
                      <Badge className="bg-yellow-500 text-white">Completado</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Próximos Logros */}
            <Card>
              <CardHeader>
                <CardTitle>Próximos Logros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 p-3 border rounded-lg opacity-60">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">Calificación Perfecta</h4>
                      <p className="text-sm text-gray-600">Mantén 5.0 estrellas por 50 viajes</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: "75%" }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">37/50 viajes completados</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 border rounded-lg opacity-60">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <Medal className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">Maratonista</h4>
                      <p className="text-sm text-gray-600">Completa 2000 viajes</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: "62%" }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">1247/2000 viajes completados</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="estadisticas" className="space-y-4">
            {/* Tendencia Mensual */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Rendimiento Mensual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {conductor.estadisticasMensuales.map((mes) => (
                    <div key={mes.mes} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="font-bold text-blue-600">{mes.mes}</span>
                        </div>
                        <div>
                          <p className="font-semibold">{mes.viajes} viajes</p>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{mes.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">Bs. {mes.ingresos}</p>
                        <p className="text-sm text-gray-600">Ingresos</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Métricas Clave */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas Clave</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">98%</p>
                    <p className="text-sm text-gray-600">Tasa de Aceptación</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600">95%</p>
                    <p className="text-sm text-gray-600">Puntualidad</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-3xl font-bold text-purple-600">0</p>
                    <p className="text-sm text-gray-600">Cancelaciones</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-3xl font-bold text-orange-600">97%</p>
                    <p className="text-sm text-gray-600">Recomendaciones</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
