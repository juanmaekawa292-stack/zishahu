"use client";

import { useState } from "react";
import { Settings, Save, Store, Globe, Mail, MessageSquare, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AdminSettingsPage() {
  var [saved, setSaved] = useState(false);
  var [saving, setSaving] = useState(false);
  var [store, setStore] = useState<Record<string, string>>({
    name: "紫砂雅集 ZishaYaji",
    email: "zishapro@163.com",
    whatsapp: "",
    telegram: "",
    wechat: "",
    messenger: "",
    signal: "",
    line: "",
    address: "Yixing, Jiangsu, China",
    currency: "USD",
    locale: "zh-CN",
  });

  var handleSave = async function() {
    setSaving(true);
    await new Promise(function(r) { setTimeout(r, 500); });
    setSaved(true);
    setTimeout(function() { setSaved(false); }, 2000);
    setSaving(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">店铺设置</h1>
        <p className="text-sm text-muted-foreground mt-1">管理店铺信息和联系方式</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Store Info */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4"><Store className="h-5 w-5 text-primary" /><h2 className="text-sm font-medium text-foreground">店铺信息</h2></div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">店铺名称</label>
              <input type="text" value={store.name} onChange={function(e) { setStore({...store, name: e.target.value}); }}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">客服邮箱</label>
              <input type="email" value={store.email} onChange={function(e) { setStore({...store, email: e.target.value}); }}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">发货地址</label>
              <input type="text" value={store.address} onChange={function(e) { setStore({...store, address: e.target.value}); }}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" />
            </div>
          </div>
        </div>

        {/* Chat Tools */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4"><MessageSquare className="h-5 w-5 text-primary" /><h2 className="text-sm font-medium text-foreground">聊天工具</h2><span className="text-xs text-muted-foreground ml-2">（注册后填写账号，前台自动显示）</span></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: "whatsapp", label: "WhatsApp", icon: "💬", placeholder: "+1 415 555 1234" },
              { key: "telegram", label: "Telegram", icon: "✈️", placeholder: "@username" },
              { key: "wechat", label: "WeChat", icon: "💚", placeholder: "WeChat ID" },
              { key: "messenger", label: "Messenger", icon: "🔵", placeholder: "username" },
              { key: "signal", label: "Signal", icon: "🟢", placeholder: "+1 415 555 1234" },
              { key: "line", label: "Line", icon: "🟣", placeholder: "Line ID" },
            ].map(function(t) {
              return (
                <div key={t.key}>
                  <label className="block text-xs font-medium text-foreground mb-1">{t.icon} {t.label}</label>
                  <input type="text" value={store[t.key]} onChange={function(e) { setStore({...store, [t.key]: e.target.value}); }}
                    placeholder={t.placeholder}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Save */}
        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
          {saving ? "保存中..." : saved ? "✅ 已保存" : "保存设置"}
        </Button>
      </div>
    </div>
  );
}