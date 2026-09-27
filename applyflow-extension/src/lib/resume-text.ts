import mammoth from "mammoth/mammoth.browser.js"
import { getDocument } from "unpdf/dist/pdfjs.mjs"

import { cleanResumeText, resumeFromText } from "./resume-format"

const maxBytes = 8_000_000

export { cleanResumeText, normalizeResume, resumeFromText } from "./resume-format"

function fileName(file: File) {
  return file.name.toLowerCase()
}

export async function readResumeFile(file: File): Promise<string> {
  if (file.size > maxBytes) {
    throw new Error("That file is too large. Use a resume under 8 MB.")
  }

  const name = fileName(file)
  if (name.endsWith(".doc") && !name.endsWith(".docx")) {
    throw new Error("Save the Word file as .docx or PDF, then upload it again.")
  }

  const bytes = await file.arrayBuffer()
  if (file.type === "application/pdf" || name.endsWith(".pdf")) {
    return readPdf(bytes)
  }
  if (name.endsWith(".docx") || file.type.includes("wordprocessingml")) {
    return readDocx(bytes)
  }
  if (name.endsWith(".txt") || file.type.startsWith("text/") || file.type === "") {
    return cleanResumeText(new TextDecoder().decode(bytes))
  }

  throw new Error("Upload a PDF, Word (.docx), or text resume.")
}

async function readPdf(bytes: ArrayBuffer) {
  try {
    const pdf = await getDocument({ data: new Uint8Array(bytes), useSystemFonts: true }).promise
    const pages: string[] = []
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber)
      const content = await page.getTextContent()
      pages.push(content.items.map((item) => ("str" in item ? item.str : "")).join(" "))
    }
    const text = cleanResumeText(pages.join("\n"))
    if (!text) {
      throw new Error("No text was found in that PDF.")
    }
    return text
  } catch (error) {
    if (error instanceof Error && error.message === "No text was found in that PDF.") {
      throw error
    }
    throw new Error("That PDF could not be read. Export it again, or upload a .docx file.")
  }
}

async function readDocx(bytes: ArrayBuffer) {
  try {
    const result = await mammoth.extractRawText({ arrayBuffer: bytes })
    const text = cleanResumeText(result.value)
    if (!text) {
      throw new Error("No text was found in that Word file.")
    }
    return text
  } catch (error) {
    if (error instanceof Error && error.message === "No text was found in that Word file.") {
      throw error
    }
    throw new Error("That Word file could not be read. Save it as .docx and try again.")
  }
}
