import { NextResponse } from "next/server"
import { fillApplication } from "@/lib/data/fill-application"

export async function POST(request: Request) {
  let body: unknown = null
  try {
    body = await request.json()
  } catch {
    body = null
  }

  const result = await fillApplication(body)
  const status =
    result.status === "ok"
      ? 200
      : result.status === "signed_out"
        ? 401
        : result.status === "error"
          ? 400
          : 200

  return NextResponse.json(result, { status })
}
