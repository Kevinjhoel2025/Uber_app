"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Car, Users, Shield, MapPin } from "lucide-react"

export default function LoginPage() {
  const [userType, setUserType] = useState<"usuario" | "conductor" | "secretaria">("usuario")
  const [isLogin, setIsLogin] = useState(true)

  const handleLogin = () => {
    // Simular login y redirigir al dashboard correspondiente
    window.location.href = `/${userType}-dashboard`
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

            <TabsContent value="login" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="tu@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userType">Tipo de Usuario</Label>
                <Select value={userType} onValueChange={(value: any) => setUserType(value)}>
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
              <Button onClick={handleLogin} className="w-full">
                Iniciar Sesión
              </Button>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input id="name" placeholder="Juan Pérez" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" placeholder="+591 70000000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-reg">Email</Label>
                <Input id="email-reg" type="email" placeholder="tu@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-reg">Contraseña</Label>
                <Input id="password-reg" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userType-reg">Tipo de Usuario</Label>
                <Select value={userType} onValueChange={(value: any) => setUserType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usuario">Usuario/Pasajero</SelectItem>
                    <SelectItem value="conductor">Conductor</SelectItem>
                    <SelectItem value="secretaria">Secretaría</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {userType === "conductor" && (
                <div className="space-y-2">
                  <Label htmlFor="codigo-conductor">Código de Conductor</Label>
                  <Input id="codigo-conductor" placeholder="Código proporcionado por la asociación" />
                  <p className="text-xs text-muted-foreground">Este código debe ser proporcionado por la asociación</p>
                </div>
              )}
              <Button onClick={handleLogin} className="w-full">
                Registrarse
              </Button>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-1 mb-2">
              <MapPin className="w-4 h-4" />
              <span>Ruta: Warnes ↔ Montero</span>
            </div>
            <p>Sindicato 27 de Noviembre</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
