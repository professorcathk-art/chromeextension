declare module "mammoth/mammoth.browser.js" {
  const mammoth: {
    extractRawText: (input: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }>
  }
  export default mammoth
}

declare module "unpdf/dist/pdfjs.mjs" {
  type PdfTextItem = { str?: string }

  type PdfPage = {
    getTextContent: () => Promise<{ items: PdfTextItem[] }>
  }

  type PdfDocument = {
    numPages: number
    getPage: (pageNumber: number) => Promise<PdfPage>
  }

  export function getDocument(source: { data: Uint8Array; useSystemFonts?: boolean }): {
    promise: Promise<PdfDocument>
  }
}
