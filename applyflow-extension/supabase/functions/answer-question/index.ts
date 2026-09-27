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
            "Write a job-application answer of about 100 words. Tailor it to the job description. Use only facts in the candidate profile and resume text. Do not invent employers, degrees, dates, or metrics. If a fact is missing, leave it out."
        },
        {
          role: "user",
          content: `Question: ${question}\n\nJob description:\n${typeof body.jobDescription === "string" ? body.jobDescription.slice(0, 8000) : ""}\n\nCandidate:\n${JSON.stringify(body.resume ?? {})}\n\nResume text:\n${typeof body.resumeText === "string" ? body.resumeText.slice(0, 12000) : ""}`
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
