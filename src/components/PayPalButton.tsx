 "use client";
 
 import { useEffect, useState, useRef } from "react";
 import { Loader2 } from "lucide-react";
 
 interface PayPalButtonProps {
   amount: number;
   currency?: string;
   onSuccess: (details: any) => void;
   onError?: (error: any) => void;
   disabled?: boolean;
 }
 
 declare global {
   interface Window {
     paypal?: any;
   }
 }
 
 export default function PayPalButton({
   amount,
   currency = "USD",
   onSuccess,
   onError,
   disabled = false,
 }: PayPalButtonProps) {
   const [loaded, setLoaded] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [clientId, setClientId] = useState<string | null>(null);
   const [isSandbox, setIsSandbox] = useState(true);
   const buttonContainerRef = useRef<HTMLDivElement>(null);
   const buttonsRenderedRef = useRef(false);
 
   // Fetch PayPal settings
   useEffect(() => {
     fetch("/api/payment/settings")
       .then((res) => res.json())
       .then((data) => {
         if (data.paypal_client_id) {
           setClientId(data.paypal_client_id);
           setIsSandbox(data.paypal_mode !== "live");
         } else {
           setError("PayPal not configured");
         }
       })
       .catch(() => setError("Failed to load payment settings"));
   }, []);
 
   // Load PayPal SDK and render buttons
   useEffect(() => {
     if (!clientId || disabled || buttonsRenderedRef.current) return;
 
     const scriptId = "paypal-sdk";
     if (document.getElementById(scriptId)) {
       // SDK already loaded, try rendering
       if (window.paypal && buttonContainerRef.current) {
         renderButtons();
       }
       return;
     }
 
     const script = document.createElement("script");
     script.id = scriptId;
     const sdkUrl = isSandbox
       ? `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}`
       : `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}`;
     script.src = sdkUrl;
     script.async = true;
     script.onload = () => {
       setLoaded(true);
       setTimeout(() => renderButtons(), 100);
     };
     script.onerror = () => setError("Failed to load PayPal SDK");
     document.body.appendChild(script);
 
     return () => {
       // Cleanup not needed, SDK stays loaded
     };
   }, [clientId, disabled, currency, isSandbox]);
 
   function renderButtons() {
     if (!window.paypal || !buttonContainerRef.current || buttonsRenderedRef.current) return;
 
     buttonsRenderedRef.current = true;
 
     window.paypal
       .Buttons({
         style: {
           layout: "vertical",
           color: "blue",
           shape: "rect",
           label: "paypal",
         },
         createOrder: async () => {
           const res = await fetch("/api/payment/paypal/create-order", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ amount, currency }),
           });
           const data = await res.json();
           if (!res.ok) throw new Error(data.error || "Failed to create order");
           return data.id;
         },
         onApprove: async (data: any) => {
           const res = await fetch("/api/payment/paypal/capture-order", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ orderId: data.orderID }),
           });
           const captureData = await res.json();
           if (!res.ok) throw new Error(captureData.error || "Failed to capture order");
           onSuccess(captureData);
         },
         onError: (err: any) => {
           console.error("PayPal button error:", err);
           if (onError) onError(err);
         },
       })
       .render(buttonContainerRef.current)
       .catch((err: any) => {
         console.error("PayPal render error:", err);
         setError("Failed to render PayPal button");
         buttonsRenderedRef.current = false;
       });
   }
 
   if (error) {
     return (
       <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
         {error === "PayPal not configured"
           ? "PayPal is being configured. Please set up PayPal in admin settings."
           : error}
       </div>
     );
   }
 
   return (
     <div className="min-h-[80px]">
       {!loaded && !error && (
         <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
           <Loader2 className="h-4 w-4 animate-spin" />
           Loading PayPal...
         </div>
       )}
       <div ref={buttonContainerRef} className={loaded ? "" : "hidden"} />
     </div>
   );
 }
