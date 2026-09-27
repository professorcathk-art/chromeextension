import { NextResponse } from "next/server"
import { loadUserDetails } from "@/lib/data/fill-application"

export async function GET() {
  const result = await loadUserDetails()
  const status =
    result.status === "error" ? 500 : result.status === "signed_out" ? 401 : 200

  return NextResponse.json(result, { status })
}
