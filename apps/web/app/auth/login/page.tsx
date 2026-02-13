"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Mail, Loader2, CheckCircle, AlertCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type AuthState = "idle" | "loading" | "success" | "error";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [email, setEmail] = React.useState("");
  const [state, setState] = React.useState<AuthState>("idle");
  const [errorMessage, setErrorMessage] = React.useState("");
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setState("loading");
    setErrorMessage("");

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    });

    if (error) {
      setState("error");
      setErrorMessage(error.message);
    } else {
      setState("success");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Narrative Terminal</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to access your trading dashboard
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
          {state === "success" ? (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 mb-4">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Check your email
              </h2>
              <p className="text-sm text-muted-foreground">
                We sent a magic link to <span className="font-medium text-foreground">{email}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-4">
                Click the link in the email to sign in. The link expires in 1 hour.
              </p>
              <button
                onClick={() => {
                  setState("idle");
                  setEmail("");
                }}
                className="mt-6 text-sm text-primary hover:underline"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    disabled={state === "loading"}
                    required
                  />
                </div>
              </div>

              {state === "error" && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">{errorMessage}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={state === "loading" || !email.trim()}
                className={cn(
                  "w-full py-2.5 px-4 rounded-lg font-medium text-white transition-all",
                  "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "flex items-center justify-center gap-2"
                )}
              >
                {state === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending magic link...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Continue with Email
                  </>
                )}
              </button>

              <p className="text-xs text-center text-muted-foreground">
                We'll send you a magic link to sign in - no password needed.
              </p>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-xs text-center text-muted-foreground mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
