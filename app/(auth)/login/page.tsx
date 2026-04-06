"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Greška pri prijavi");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-brand-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image src="/logo.png" alt="eTPŠkola" width={180} height={44} className="h-12 w-auto brightness-0" priority />
          </div>
          <p className="text-sm text-slate-500">Sistem za upravljanje učenicima</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="password" className="text-sm text-slate-600">
              Lozinka
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Unesite lozinku..."
              className="mt-1 border-brand-200 focus:border-brand-600"
              required
            />
          </div>
          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white"
          >
            {loading ? "Prijava..." : "Prijavi se"}
          </Button>
        </form>
      </div>
    </div>
  );
}
