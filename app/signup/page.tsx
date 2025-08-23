"use client";

import type React from "react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import OAuthButtons from "@/components/auth/oauth-buttons";
import { signIn } from "next-auth/react";
import { colors } from "@/lib/colors";
import Image from "next/image";

export default function SignUpPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [accepted, setAccepted] = useState(false);

  function validate(): string | null {
    if (!name.trim()) return "Please enter your name.";
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      return "Please enter a valid email.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (password !== confirm) return "Passwords do not match.";
    if (!accepted) return "Please accept the Terms to continue.";
    return null;
  }

  async function handleEmailSignUp(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) {
      toast({
        title: "Check your details",
        description: err,
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      // Use Credentials provider as a demo email/password sign-up flow.
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      if (result?.error) {
        toast({
          title: "Sign up failed",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account created",
          description: "Welcome to KidsBookCreator!",
        });
        window.location.href = "/dashboard";
      }
    } catch {
      toast({
        title: "Sign up failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-accent3 to-white">
      <div className="container mx-auto max-w-6xl px-4 py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="hidden md:block">
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="/illustrations/father-child-reading.jpg"
                alt="Father and child reading together under a magical starry sky"
                fill
                className="object-cover"
                priority
              />
            </div>
            <p className="mt-6 text-sm text-gray-600">
              Create with your kids, illustrate with AI, and publish beautiful
              storybooks.
            </p>
          </div>

          <Card className="border-accent1 shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Create your account</CardTitle>
              <CardDescription>
                Join free. You can upgrade anytime.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OAuthButtons className="mb-6" />

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">
                    Or continue with email
                  </span>
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleEmailSignUp}>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Alex Writer"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="placeholder:text-gray-400"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="placeholder:text-gray-400"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="At least 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="placeholder:text-gray-400"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm">Confirm password</Label>
                      <Input
                        id="confirm"
                        type="password"
                        placeholder="Re-enter password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        className="placeholder:text-gray-400"
                        required
                      />
                    </div>
                  </div>
                  <label className="flex items-start gap-3 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded border-gray-300"
                      checked={accepted}
                      onChange={(e) => setAccepted(e.target.checked)}
                      aria-label="Accept Terms and Privacy Policy"
                    />
                    <span>
                      I agree to the{" "}
                      <a
                        className="underline hover:text-primary"
                        href="/terms"
                      >
                        Terms
                      </a>{" "}
                      and{" "}
                      <a
                        className="underline hover:text-primary"
                        href="/privacy"
                      >
                        Privacy Policy
                      </a>
                      .
                    </span>
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11"
                  style={{ backgroundColor: colors.main }}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating your account...
                    </span>
                  ) : (
                    "Create account"
                  )}
                </Button>

                <p className="text-sm text-gray-600 text-center">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-medium hover:underline"
                    style={{ color: colors.main }}
                  >
                    Log in
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
