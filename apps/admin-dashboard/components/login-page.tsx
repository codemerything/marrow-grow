"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sprout, Lock, User, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import api from "@/lib/api"
import { useAdminStore } from "@/store/AdminStore"

interface LoginPageProps {
  onLogin: (accessToken: string, adminUser: any) => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    console.log('[LoginPage] handleSubmit called. Form data:', formData);

    try {
      // Make API call to backend for authentication
      console.log('[LoginPage] Attempting API call to /api/auth/adminSignin with:', { email: formData.email, password: formData.password });
      const response = await api.post("/api/auth/adminsignin", {
        email: formData.email,
        password: formData.password,
      })
      
      console.log('[LoginPage] Full API response received:', response);
      console.log('[LoginPage] Response data:', response.data);
      
      // Check if response has the expected structure
      if (!response.data) {
        throw new Error("No data received from server");
      }

      // The response structure might be different. Let's handle multiple possible structures:
      let token, apiUser;
      
      // Case 1: { token, user }
      if (response.data.token && response.data.user) {
        token = response.data.token;
        apiUser = response.data.user;
      }
      // Case 2: { accessToken, user }
      else if (response.data.accessToken && response.data.user) {
        token = response.data.accessToken;
        apiUser = response.data.user;
      }
      // Case 3: { accessToken, player } (based on your refresh token response)
      else if (response.data.accessToken && response.data.player) {
        token = response.data.accessToken;
        apiUser = response.data.player;
      }
      // Case 4: { token, player }
      else if (response.data.token && response.data.player) {
        token = response.data.token;
        apiUser = response.data.player;
      }
      else {
        console.error('[LoginPage] Unexpected response structure:', response.data);
        throw new Error("Invalid response structure from server");
      }

      console.log('[LoginPage] Extracted token:', token);
      console.log('[LoginPage] Extracted user/player:', apiUser);

      // Validate that we have the required user data
      if (!apiUser || !apiUser.username || !apiUser.email) {
        console.error('[LoginPage] Missing required user data:', apiUser);
        throw new Error("Invalid user data received from server");
      }

      // Prepare user data for the AdminStore
      const storeUser: any = {
        username: apiUser.username,
        email: apiUser.email,
        isAdmin: apiUser.isAdmin || false, // Default to false if not provided
      };

      console.log('[LoginPage] Prepared storeUser:', storeUser);

      // Pass token and user to the parent component's onLogin handler
      console.log('[LoginPage] Calling onLogin with token and storeUser');
      onLogin(token, storeUser);
      
    } catch (err: any) {
      console.error('[LoginPage] Login API call failed:', err);
      
      // More detailed error handling
      let errorMessage = "Login failed. Please try again.";
      
      if (err.response) {
        // Server responded with error status
        errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
        console.error('[LoginPage] Server error response:', err.response.data);
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = "Network error. Please check your connection.";
        console.error('[LoginPage] Network error:', err.request);
      } else {
        // Something else happened
        errorMessage = err.message || errorMessage;
        console.error('[LoginPage] Unexpected error:', err.message);
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-4 relative">
      {mounted && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="absolute top-4 right-4"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      )}
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <Sprout className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Marrow Grow Admin</CardTitle>
          <CardDescription>Sign in to access the admin dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="text"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}