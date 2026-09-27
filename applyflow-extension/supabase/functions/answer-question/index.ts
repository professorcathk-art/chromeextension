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
  const question = typeof body.question === "string" ? body.question : ""
  const apiKey = Deno.env.get("OPENAI_API_KEY")
  if (!apiKey || !question) {
    return Response.json({ answer: "" }, { status: 400, headers: cors })
  }

  const completion = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Write a job-application answer of about 100 words. Use only facts in the candidate profile. Do not invent employers, degrees, or dates."
        },
        {
          role: "user",
          content: `Question: ${question}\n\nCandidate:\n${JSON.stringify(body.resume ?? {})}`
        }
      ]
    })
  })

  const payload = await completion.json()
  const answer = payload?.choices?.[0]?.message?.content
  return Response.json(
    { answer: typeof answer === "string" ? answer.trim() : "" },
    { headers: cors }
  )
})
