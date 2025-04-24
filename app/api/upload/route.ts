import { NextRequest, NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string

    if (!file) {
      return NextResponse.json(
        { error: "No file received." },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename
    const uniqueId = uuidv4()
    const extension = file.name.split(".").pop()
    const filename = `${type}-${uniqueId}.${extension}`

    // Save file to uploads directory
    const path = join(process.cwd(), "public/uploads", filename)
    await writeFile(path, buffer)

    // Return the URL
    const url = `/uploads/${filename}`

    return NextResponse.json({ url })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: "Error uploading file" },
      { status: 500 }
    )
  }
}