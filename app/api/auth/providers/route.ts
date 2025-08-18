import { NextResponse } from "next/server"

export async function GET() {
  const google = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)

  // Email via Credentials is available in this demo unless you remove the Credentials provider
  const email = true

  return NextResponse.json({
    google,
    email,
  })
}
