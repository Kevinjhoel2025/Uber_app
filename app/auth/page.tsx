"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Car, Users, Shield } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nombre: "",
    telefono: "",
    tipo_usuario: "usuario" as "usuario" | "conductor" | "secretaria",
    codigo_conductor: "",
  })

  const { signIn, signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        const { data, error } = await signIn(formData.email, formData.password)
        if (error) {
          alert(`Error: ${error.message}`)
        } else if (data.user) {
          // Redirigir según el tipo de usuario
          const userData = data.user.user_metadata
          const tipoUsuario = userData?.tipo_usuario || "usuario"

          switch (tipoUsuario) {
            case "conductor":
              router.push("/conductor-dashboard")
              break
            case "secretaria":
              router.push("/secretaria-dashboard")
              break
            default:
              router.push("/usuario-dashboard")
          }
        }
      } else {
        const { data, error } = await signUp(formData.email, formData.password, {
          nombre: formData.nombre,
          telefono: formData.telefono,
          tipo_usuario: formData.tipo_usuario,
        })

        if (error) {
          alert(`Error: ${error.message}`)
        } else {
          alert("Registro exitoso. Revisa tu email para confirmar tu cuenta.")
        }
      }
    } catch (error) {
      console.error("Error en autenticación:", error)
      alert("Error inesperado. Inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Car className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">TransSindicato</CardTitle>
          <CardDescription>Sindicato 27 de Noviembre - Warnes</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={isLogin ? "login" : "register"} onValueChange={(v) => setIsLogin(v === "login")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit}>
              <TabsContent value="login" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input
                    id="name"
                    placeholder="Juan Pérez"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange("nombre", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    placeholder="+591 70000000"
                    value={formData.telefono}
                    onChange={(e) => handleInputChange("telefono", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-reg">Email</Label>
                  <Input
                    id="email-reg"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-reg">Contraseña</Label>
                  <Input
                    id="password-reg"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userType-reg">Tipo de Usuario</Label>
                  <Select
                    value={formData.tipo_usuario}
                    onValueChange={(value: any) => handleInputChange("tipo_usuario", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usuario">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Usuario/Pasajero
                        </div>
                      </SelectItem>
                      <SelectItem value="conductor">
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4" />
                          Conductor
                        </div>
                      </SelectItem>
                      <SelectItem value="secretaria">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Secretaría
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.tipo_usuario === "conductor" && (
                  <div className="space-y-2">
                    <Label htmlFor="codigo-conductor">Código de Conductor</Label>
                    <Input
                      id="codigo-conductor"
                      placeholder="Código proporcionado por la asociación"
                      value={formData.codigo_conductor}
                      onChange={(e) => handleInputChange("codigo_conductor", e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Este código debe ser proporcionado por la asociación
                    </p>
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Registrando..." : "Registrarse"}
                </Button>
              </TabsContent>
            </form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
