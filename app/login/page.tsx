"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import OAuthButtons from "@/components/auth/oauth-buttons"
import { signIn } from "next-auth/react"

export default function LoginPage() {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      toast({ title: "Missing info", description: "Enter your email and password.", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      const result = await signIn("credentials", { redirect: false, email, password })
      if (result?.error) {
        toast({ title: "Login failed", description: result.error, variant: "destructive" })
      } else {
        toast({ title: "Welcome back", description: "You are now signed in." })
        window.location.href = "/dashboard"
      }
    } catch {
      toast({ title: "Login failed", description: "Please try again.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto max-w-6xl px-4 py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="hidden md:block">
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-lg">
              <Image src="/illustrations/signup-hero.png" alt="Storybook login" fill className="object-cover" />
            </div>
          </div>
          <Card className="border-purple-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Log in</CardTitle>
              <CardDescription>Welcome back to KidsBookCreator</CardDescription>
            </CardHeader>
            <CardContent>
              <OAuthButtons className="mb-6" />

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or continue with email</span>
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full h-11 bg-purple-600 hover:bg-purple-700" disabled={loading}>
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    "Sign in"
                  )}
                </Button>
                <p className="text-sm text-gray-600 text-center">
                  New here?{" "}
                  <Link href="/signup" className="text-purple-700 font-medium hover:underline">
                    Create an account
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
