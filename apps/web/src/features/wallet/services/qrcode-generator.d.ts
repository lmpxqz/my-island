declare module '*.mjs' {
  interface QrCode {
    addData(data: string, mode?: string): void
    createSvgTag(cellSize?: number, margin?: number, alt?: string, title?: string): string
    make(): void
  }

  export default function qrcode(typeNumber: number, errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H'): QrCode
}
