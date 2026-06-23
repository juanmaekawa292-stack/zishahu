"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/services/auth"
import { CreditCard, Save, Eye, EyeOff, Check, AlertCircle, Globe } from "lucide-react"
import { Button } from "@/components/ui/Button"

export default function PaymentSettingsPage() {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)

  // LianLian state
  const [lianlianSaving, setLianlianSaving] = useState(false)
  const [lianlianSaved, setLianlianSaved] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [error, setError] = useState("")
  const [lianlianConfig, setLianlianConfig] = useState({ oid_partner: "", private_key: "" })

  // PayPal state
  const [paypalSaving, setPaypalSaving] = useState(false)
  const [paypalSaved, setPaypalSaved] = useState(false)
  const [showPaypalSecret, setShowPaypalSecret] = useState(false)
  const [paypalError, setPaypalError] = useState("")
  const [paypalConfig, setPaypalConfig] = useState({ paypal_client_id: "", paypal_secret: "", paypal_mode: "sandbox" })

  useEffect(() => {
    async function init() {
      const user = await getCurrentUser()
      if (!user) {
        router.replace("/login")
        return
      }
      await loadConfig()
      setAuthorized(true)
    }
    init()
  }, [])

  async function loadConfig() {
    try {
      const res = await fetch("/api/payment/settings")
      const data = await res.json()
      if (data.success) {
        setLianlianConfig({
          oid_partner: data.oid_partner || "",
          private_key: data.private_key || "",
        })
        setPaypalConfig({
          paypal_client_id: data.paypal_client_id || "",
          paypal_secret: data.paypal_secret || "",
          paypal_mode: data.paypal_mode || "sandbox",
        })
      }
    } catch (e) {}
  }

  async function saveLianlian() {
    setLianlianSaving(true)
    setLianlianSaved(false)
    setError("")
    try {
      const res = await fetch("/api/payment/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...lianlianConfig, ...paypalConfig }),
      })
      const data = await res.json()
      if (data.success) {
        setLianlianSaved(true)
        setTimeout(() => setLianlianSaved(false), 3000)
      } else {
        setError(data.error || "保存失败")
      }
    } catch (e) {
      setError("保存失败: " + String(e))
    } finally {
      setLianlianSaving(false)
    }
  }

  async function savePaypal() {
    setPaypalSaving(true)
    setPaypalSaved(false)
    setPaypalError("")
    try {
      const res = await fetch("/api/payment/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...lianlianConfig, ...paypalConfig }),
      })
      const data = await res.json()
      if (data.success) {
        setPaypalSaved(true)
        setTimeout(() => setPaypalSaved(false), 3000)
      } else {
        setPaypalError(data.error || "保存失败")
      }
    } catch (e) {
      setPaypalError("保存失败: " + String(e))
    } finally {
      setPaypalSaving(false)
    }
  }

  if (!authorized) {
    return <div className="flex items-center justify-center min-h-[80vh]"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>
  }

  return (
    <div className="w-full">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2.5"><CreditCard className="h-6 w-6 text-primary" /></div>
        <div><h1 className="text-2xl font-bold text-foreground">支付设置</h1><p className="text-sm text-muted-foreground">配置网站收款方式</p></div>
      </div>

      <div className="space-y-8">

        {/* === PayPal Section === */}
        <div className="rounded-lg border border-blue-200 bg-card">
          <div className="flex items-center gap-2 rounded-t-lg bg-blue-50 px-6 py-3 border-b border-blue-200">
            <Globe className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-semibold text-blue-800">PayPal 收款</h2>
            <span className="ml-2 rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">推荐</span>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">PayPal Client ID <span className="text-red-500">*</span></label>
              <p className="text-xs text-muted-foreground mb-2">从 PayPal Developer Dashboard 获取</p>
              <input type="text" value={paypalConfig.paypal_client_id}
                onChange={e => setPaypalConfig({...paypalConfig, paypal_client_id: e.target.value})}
                placeholder="AaBbCcDdEeFfGg..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">PayPal Secret <span className="text-red-500">*</span></label>
              <p className="text-xs text-muted-foreground mb-2">从 PayPal Developer Dashboard 获取</p>
              <div className="relative">
                <input type={showPaypalSecret ? "text" : "password"}
                  value={paypalConfig.paypal_secret}
                  onChange={e => setPaypalConfig({...paypalConfig, paypal_secret: e.target.value})}
                  placeholder="EN...xxxxxxxxxx"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button onClick={() => setShowPaypalSecret(!showPaypalSecret)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground">
                  {showPaypalSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">环境模式</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="paypal_mode" value="sandbox"
                    checked={paypalConfig.paypal_mode === "sandbox"}
                    onChange={e => setPaypalConfig({...paypalConfig, paypal_mode: e.target.value})}
                    className="h-4 w-4 text-blue-600 border-gray-300" />
                  <span className="text-sm text-foreground">沙盒模式（测试）</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="paypal_mode" value="live"
                    checked={paypalConfig.paypal_mode === "live"}
                    onChange={e => setPaypalConfig({...paypalConfig, paypal_mode: e.target.value})}
                    className="h-4 w-4 text-blue-600 border-gray-300" />
                  <span className="text-sm text-foreground">正式模式</span>
                </label>
              </div>
            </div>
            <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3">
              <p className="text-xs text-blue-700">
                <strong>如何获取：</strong><br />
                1. 登录 <a href="https://developer.paypal.com/dashboard/" target="_blank" rel="noreferrer" className="underline">developer.paypal.com</a><br />
                2. 创建或选择一个 App（REST API apps）<br />
                3. 复制 Client ID 和 Secret 填入上方<br />
                4. 先用沙盒模式测试，通过后切换为正式模式<br />
                5. 正式环境需要到 <a href="https://www.paypal.com/business" target="_blank" rel="noreferrer" className="underline">paypal.com/business</a> 开通商户功能
              </p>
            </div>
            {paypalError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{paypalError}</div>
            )}
            <Button onClick={savePaypal} disabled={paypalSaving || !paypalConfig.paypal_client_id || !paypalConfig.paypal_secret}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              {paypalSaving ? "保存中..." : paypalSaved ? (
                <span className="flex items-center gap-2"><Check className="h-4 w-4" /> 已保存</span>
              ) : "保存 PayPal 配置"}
            </Button>
          </div>
        </div>

        {/* === LianLian Section === */}
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 rounded-t-lg bg-muted/30 px-6 py-3 border-b border-border">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-base font-semibold text-foreground">连连支付</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">连连商户号 <span className="text-red-500">*</span></label>
              <p className="text-xs text-muted-foreground mb-2">连连支付审核通过后邮件中提供的商户号</p>
              <input type="text" value={lianlianConfig.oid_partner}
                onChange={e => setLianlianConfig({...lianlianConfig, oid_partner: e.target.value})}
                placeholder="请输入连连商户号"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">商户RSA私钥 <span className="text-red-500">*</span></label>
              <p className="text-xs text-muted-foreground mb-2">连连支付商户后台生成的RSA私钥</p>
              <div className="relative">
                <textarea value={lianlianConfig.private_key}
                  onChange={e => setLianlianConfig({...lianlianConfig, private_key: e.target.value})}
                  placeholder="-----BEGIN RSA PRIVATE KEY-----"
                  rows={6}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                <button onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-2 p-1 text-muted-foreground hover:text-foreground">
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs text-amber-800">登录连连支付商户平台 → 账户管理 → API管理 获取商户号和私钥</p>
            </div>
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}
            <Button onClick={saveLianlian} disabled={lianlianSaving || !lianlianConfig.oid_partner || !lianlianConfig.private_key}
              className="w-full">
              {lianlianSaving ? "保存中..." : lianlianSaved ? (
                <span className="flex items-center gap-2"><Check className="h-4 w-4" /> 已保存</span>
              ) : "保存连连配置"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}