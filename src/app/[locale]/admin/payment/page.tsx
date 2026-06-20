"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/services/auth"
import { CreditCard, Save, Eye, EyeOff, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/Button"

export default function PaymentSettingsPage() {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [error, setError] = useState("")
  const [config, setConfig] = useState({ oid_partner: "", private_key: "" })

  
  async function loadConfig() {
    try {
      const res = await fetch("/api/payment/settings")
      const data = await res.json()
      if (data.success) {
        setConfig({ oid_partner: data.oid_partner || "", private_key: data.private_key || "" })
      }
    } catch (e) {}
  }

  async function saveConfig() {
    setSaving(true)
    setSaved(false)
    setError("")
    try {
      const res = await fetch("/api/payment/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })
      const data = await res.json()
      if (data.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        setError(data.error || "保存失败")
      }
    } catch (e) {
      setError("保存失败: " + String(e))
    } finally {
      setSaving(false)
    }
  }

  if (!authorized) {
    return <div className="flex items-center justify-center min-h-[80vh]"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>
  }

  return (
    <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2.5"><CreditCard className="h-6 w-6 text-primary" /></div>
        <div><h1 className="text-2xl font-bold text-foreground">支付设置</h1><p className="text-sm text-muted-foreground">配置连连支付商户信息</p></div>
      </div>
      <div className="space-y-6">
        <div className="rounded-lg border border-border bg-card p-6">
          <label className="block text-sm font-medium text-foreground mb-1">连连商户号 <span className="text-red-500">*</span></label>
          <p className="text-xs text-muted-foreground mb-3">连连支付审核通过后邮件中提供的商户号</p>
          <input type="text" value={config.oid_partner} onChange={e => setConfig({...config, oid_partner: e.target.value})}
            placeholder="请输入连连商户号"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <label className="block text-sm font-medium text-foreground mb-1">商户RSA私钥 <span className="text-red-500">*</span></label>
          <p className="text-xs text-muted-foreground mb-3">连连支付商户后台生成的RSA私钥</p>
          <div className="relative">
            <textarea value={config.private_key} onChange={e => setConfig({...config, private_key: e.target.value})}
              placeholder="-----BEGIN RSA PRIVATE KEY-----"
              rows={6}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
            <button onClick={() => setShowKey(!showKey)} className="absolute right-2 top-2 p-1 text-muted-foreground hover:text-foreground">
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">登录连连支付商户平台 → 账户管理 → API管理 获取商户号和私钥</p>
        </div>
        {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <Button onClick={saveConfig} disabled={saving || !config.oid_partner || !config.private_key} className="w-full">
          {saving ? "保存中..." : saved ? "已保存" : "保存配置"}
        </Button>
      </div>
    </div>
  )
}