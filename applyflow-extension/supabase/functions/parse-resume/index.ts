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
  if (!userData.user) {
    return Response.json({ error: "Sign in required." }, { status: 401, headers: cors })
  }

  const body = await request.json()
  const text = typeof body.text === "string" ? body.text.slice(0, 12000) : ""
  const apiKey = Deno.env.get("OPENAI_API_KEY")
  if (!apiKey || !text) {
    return Response.json({ error: "Resume text is required." }, { status: 400, headers: cors })
  }

  const completion = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "The text may have broken line breaks from a PDF or Word file. Reconstruct it into JSON with personal_info, work_experience, education, skills, and preferences. Repair spacing and hyphenation. Leave unknown fields empty. Do not invent facts."
        },
        { role: "user", content: text }
      ]
    })
  })

  const payload = await completion.json()
  const content = payload?.choices?.[0]?.message?.content
  if (typeof content !== "string") {
    return Response.json({ error: "The resume could not be read." }, { status: 502, headers: cors })
  }

  try {
    return Response.json({ resume: JSON.parse(content) }, { headers: cors })
  } catch {
    return Response.json({ error: "The resume could not be read." }, { status: 502, headers: cors })
  }
})
