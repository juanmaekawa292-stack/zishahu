"use client";

import { useEffect, useState, useRef } from "react";
import { Loader2 } from "lucide-react";

interface PayPalButtonProps {
  amount: number;
  currency?: string;
  onSuccess: (details: any) => void;
  onError?: (error: any) => void;
  onValidate?: () => boolean;
  disabled?: boolean;
  /** Optional: called before PayPal order creation to create a pending order in our system.
   *  Should return the local order ID. */
  onBeforeCreateOrder?: () => Promise<string>;
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
  onValidate,
  onBeforeCreateOrder,
  disabled = false,
}: PayPalButtonProps) {
   const [loaded, setLoaded] = useState(false);
   const [error, setError] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [isSandbox, setIsSandbox] = useState(true);
 const buttonContainerRef = useRef<HTMLDivElement>(null);
 const buttonsRenderedRef = useRef(false);
const onSuccessRef = useRef(onSuccess);
const localOrderIdRef = useRef<string | null>(null);
const onErrorRef = useRef(onError);
const onValidateRef = useRef(onValidate);
const onBeforeCreateOrderRef = useRef(onBeforeCreateOrder);
const amountRef = useRef(amount);
const currencyRef = useRef(currency);

 // Keep refs in sync so PayPal SDK closures always use the latest callbacks
 useEffect(() => { onSuccessRef.current = onSuccess; }, [onSuccess]);
 useEffect(() => { onErrorRef.current = onError; }, [onError]);
useEffect(() => { onValidateRef.current = onValidate; }, [onValidate]);
useEffect(() => { onBeforeCreateOrderRef.current = onBeforeCreateOrder; }, [onBeforeCreateOrder]);
useEffect(() => { amountRef.current = amount; }, [amount]);
useEffect(() => { currencyRef.current = currency; }, [currency]);

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
         onClick: (data: any) => {
           if (onValidateRef.current && !onValidateRef.current()) {
             return false;
           }
         },
        createOrder: async () => {
          // Step 1: Create pending order in our system (if callback provided)
          if (onBeforeCreateOrderRef.current) {
            try {
              const localId = await onBeforeCreateOrderRef.current();
              localOrderIdRef.current = localId;
            } catch (err) {
              console.error("Failed to create pending order:", err);
               throw err;
             }
           }
           // Step 2: Create PayPal order
           const res = await fetch("/api/payment/paypal/create-order", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({
               amount: amountRef.current, currency: currencyRef.current,
               invoice_id: localOrderIdRef.current || undefined,
             }),
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

           // Step 3: Update local order from "pending" to "paid"
           const localOrderId = localOrderIdRef.current;
           if (localOrderId) {
             await fetch("/api/checkout?id=" + localOrderId, {
               method: "PATCH",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({
                 status: "paid",
                 paypalOrderId: data.orderID,
               }),
             }).catch(e => console.error("Failed to update order status:", e));
           }
           onSuccessRef.current({ ...captureData, localOrderId });
         },
        onError: (err: any) => {
          console.error("PayPal button error:", err);
          if (onErrorRef.current) {
            onErrorRef.current(err);
          }
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
