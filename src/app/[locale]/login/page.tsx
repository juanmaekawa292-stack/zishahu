"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login, getCurrentUser } from "@/services/auth";
import { useTranslations } from "next-intl";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link } from "@/i18n";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const t = useTranslations("common");
  const tUser = useTranslations("user");
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
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
    const result = login(email, password);
    if (result.success) {
      router.push("/");
      router.refresh();
    } else {
      setError(result.error || "登录失败");
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="text-center mb-8">
        <span className="text-5xl">🫖</span>
        <h1 className="mt-4 text-2xl font-bold text-foreground">{tUser("loginTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">登录您的账户</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-950/30 p-3 text-xs text-red-600 dark:text-red-400 text-center">
            {error}
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">账号/邮箱</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin / your@email.com"
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
              placeholder="********"
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

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" className="accent-primary" /> 记住我
          </label>
          <button type="button" className="text-xs text-primary hover:underline">{tUser("forgotPassword")}</button>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>{loading ? "登录中..." : t("login")}</Button>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        {tUser("noAccount")}{" "}
        <Link href="/register" className="text-primary hover:underline font-medium">{tUser("registerNow")}</Link>
      </p>

      <div className="mt-8 pt-6 border-t border-border text-center">
        <Link href="/" className="text-xs text-muted-foreground hover:text-primary transition-colors">{t("backToHome")}</Link>
      </div>
    </div>
  );
}