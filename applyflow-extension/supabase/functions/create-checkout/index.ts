import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type"
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: cors })
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: request.headers.get("Authorization") ?? "" } } }
  )
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user
  if (!user?.email) {
    return Response.json({ error: "Sign in required." }, { status: 401, headers: cors })
  }

  const secret = Deno.env.get("STRIPE_SECRET_KEY")
  const price = Deno.env.get("STRIPE_PRICE_ID")
  if (!secret || !price) {
    return Response.json({ error: "Checkout is not configured." }, { status: 500, headers: cors })
  }

  const form = new URLSearchParams({
    mode: "subscription",
    "line_items[0][price]": price,
    "line_items[0][quantity]": "1",
    customer_email: user.email,
    "metadata[user_id]": user.id,
    success_url: "https://applyflow.local/upgraded",
    cancel_url: "https://applyflow.local/cancelled"
  })

  const stripe = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: form
  })
  const session = await stripe.json()
  if (typeof session.url !== "string") {
    return Response.json({ error: "Checkout could not be created." }, { status: 502, headers: cors })
  }

  return Response.json({ url: session.url }, { headers: cors })
})
