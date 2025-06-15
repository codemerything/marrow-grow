// components/auth/AuthModal.tsx
"use client";

import type React from "react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"; //
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; //
import { Input } from "@/components/ui/input"; //
import { Label } from "@/components/ui/label"; //
import { Button } from "@/components/ui/button"; //
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; //
import { useGameStore } from "@/stores/useGameStore"; // Make sure path is correct

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// This interface should match the JSON response structure from your backend
// when a user successfully signs in or signs up.
interface AuthBackendResponse {
  player: { // Based on your PlayerSchema
    _id?: string; // Or $id from AppWrite, or however your backend sends it
    username: string; //
    email: string; //
    seedLives: number; // This is 'lives' for the frontend
    lastSpinDate?: string; //
    // ... any other relevant fields your backend sends for the user
  };
  accessToken: string; // The JWT access token
  message?: string;
  // refreshToken is often handled by an httpOnly cookie, so may not be in JSON response
}

// Frontend User type (already in your gameStore.ts)
interface User {
  username: string;
  email: string;
  lives: number;
  lastSpinDate?: string;
  // id?: string;
}


export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false); //
  const [error, setError] = useState<string | null>(null);
  const loginUserAction = useGameStore((state) => state.actions.loginUser);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault(); //
    setIsLoading(true); //
    setError(null);

    const formData = new FormData(e.target as HTMLFormElement); //
    const email = formData.get("email") as string; //
    const password = formData.get("password") as string;

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signin`, { // Adjust endpoint if needed
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const responseData: AuthBackendResponse = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to sign in"); // Assuming backend sends { message: "..." } on error
      }

      // Map backend 'player' object to frontend 'User' type
      const userDataForStore: User = {
        username: responseData.player.username, //
        email: responseData.player.email, //
        lives: responseData.player.seedLives, // Map seedLives to lives
        lastSpinDate: responseData.player.lastSpinDate, //
        // id: responseData.player._id, // if you use an id
      };

      loginUserAction(userDataForStore, responseData.accessToken);
      onClose(); //

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false); //
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault(); //
    setIsLoading(true); //
    setError(null);

    const formData = new FormData(e.target as HTMLFormElement); //
    const email = formData.get("email") as string; //
    const username = formData.get("username") as string; //
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, { // Adjust endpoint if needed
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const responseData: AuthBackendResponse = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to sign up");
      }

      const userDataForStore: User = {
        username: responseData.player.username, //
        email: responseData.player.email, //
        lives: responseData.player.seedLives, // Map seedLives to lives
        lastSpinDate: responseData.player.lastSpinDate, //
        // id: responseData.player._id,
      };

      loginUserAction(userDataForStore, responseData.accessToken);
      onClose(); //

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false); //
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}> {/* */}
      <DialogContent className="sm:max-w-md bg-gray-900 border-purple-500 border-2 max-h-[80vh] overflow-y-auto"> {/* */}
        <DialogHeader> {/* */}
          <DialogTitle className="text-center text-2xl font-bold text-purple-300">Welcome to Marrow Grow</DialogTitle> {/* */}
        </DialogHeader>

        {error && (
          <div className="mb-4 p-3 bg-red-500/30 text-red-300 border border-red-500 rounded-md text-sm">
            {error}
          </div>
        )}

        <Tabs defaultValue="signin" className="w-full"> {/* */}
          <TabsList className="grid w-full grid-cols-2 bg-gray-800"> {/* */}
            <TabsTrigger value="signin" className="data-[state=active]:bg-purple-600"> {/* */}
              Sign In
            </TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-purple-600"> {/* */}
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin"> {/* */}
            <Card className="bg-gray-800 border-gray-700"> {/* */}
              <CardHeader> {/* */}
                <CardTitle className="text-purple-300">Sign In</CardTitle> {/* */}
                <CardDescription className="text-gray-400">Enter your credentials to access your grow</CardDescription> {/* */}
              </CardHeader>
              <CardContent> {/* */}
                <form onSubmit={handleSignIn} className="space-y-4"> {/* */}
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-gray-300"> {/* */}
                      Email
                    </Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="grower@marrowgrow.com"
                      required
                      className="bg-gray-700 border-gray-600 text-white"
                    /> {/* */}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-gray-300"> {/* */}
                      Password
                    </Label>
                    <Input
                      id="signin-password"
                      name="password"
                      type="password"
                      required
                      className="bg-gray-700 border-gray-600 text-white"
                    /> {/* */}
                  </div>
                  <Button type="submit" disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-700"> {/* */}
                    {isLoading ? "Signing In..." : "Sign In"} {/* */}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup"> {/* */}
            <Card className="bg-gray-800 border-gray-700"> {/* */}
              <CardHeader> {/* */}
                <CardTitle className="text-purple-300">Create Account</CardTitle> {/* */}
                <CardDescription className="text-gray-400">Join the spooky growing community</CardDescription> {/* */}
              </CardHeader>
              <CardContent> {/* */}
                <form onSubmit={handleSignUp} className="space-y-4"> {/* */}
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-gray-300"> {/* */}
                      Grower Name
                    </Label>
                    <Input
                      id="signup-name"
                      name="username"
                      type="text"
                      placeholder="SpookyGrower420"
                      required
                      className="bg-gray-700 border-gray-600 text-white"
                    /> {/* */}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-gray-300"> {/* */}
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="grower@marrowgrow.com"
                      required
                      className="bg-gray-700 border-gray-600 text-white"
                    /> {/* */}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-gray-300"> {/* */}
                      Password
                    </Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      required
                      className="bg-gray-700 border-gray-600 text-white"
                    /> {/* */}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm" className="text-gray-300"> {/* */}
                      Confirm Password
                    </Label>
                    <Input
                      id="signup-confirm"
                      name="confirmPassword"
                      type="password"
                      required
                      className="bg-gray-700 border-gray-600 text-white"
                    /> {/* */}
                  </div>
                  <Button type="submit" disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-700"> {/* */}
                    {isLoading ? "Creating Account..." : "Create Account"} {/* */}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}