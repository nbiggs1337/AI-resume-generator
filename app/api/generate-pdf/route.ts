import { type NextRequest, NextResponse } from "next/server"

console.log("[v0] PDF API route loaded")

export async function POST(request: NextRequest) {
  console.log("[v0] PDF API POST method called")

  try {
    console.log("[v0] Processing request...")
    const body = await request.json()
    console.log("[v0] Request body:", body)

    console.log("[v0] Returning success response")
    return NextResponse.json(
      {
        message: "API route is working",
        receivedData: body,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] API Error:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "Unknown error")
    return NextResponse.json(
      {
        error: "API failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  console.log("[v0] PDF API GET method called")
  return NextResponse.json({ message: "PDF API route is accessible" }, { status: 200 })
}
