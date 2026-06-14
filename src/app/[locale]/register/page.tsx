"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { register, getCurrentUser } from "@/services/auth";
import { useTranslations } from "next-intl";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { Link } from "@/i18n";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const t = useTranslations("common");
  const tUser = useTranslations("user");
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getCurrentUser()) router.push("/");
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = register(name, email, password);
    if (result.success) {
      router.push("/");
      router.refresh();
    } else {
      setError(result.error || "注册失败");
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="text-center mb-8">
        <span className="text-5xl">🍵</span>
        <h1 className="mt-4 text-2xl font-bold text-foreground">{tUser("registerTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">开启您的紫砂之旅</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-950/30 p-3 text-xs text-red-600 dark:text-red-400 text-center">
            {error}
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">{tUser("name")}</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">{tUser("email")}</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">{tUser("password")}</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-input bg-background pl-9 pr-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>{loading ? "注册中..." : t("register")}</Button>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        {tUser("hasAccount")}{" "}
        <Link href="/login" className="text-primary hover:underline font-medium">{tUser("loginNow")}</Link>
      </p>

      <div className="mt-8 pt-6 border-t border-border text-center">
        <Link href="/" className="text-xs text-muted-foreground hover:text-primary transition-colors">{t("backToHome")}</Link>
      </div>
    </div>
  );
}