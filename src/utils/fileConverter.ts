import jsPDF from 'jspdf'

export interface ConversionResult {
  success: boolean
  pdfFile?: File
  error?: string
}

export class FileConverter {
  
  /**
   * Convert any file type to PDF
   */
  static async convertToPdf(file: File): Promise<ConversionResult> {
    try {
      const fileType = this.getFileType(file)
      
      switch (fileType) {
        case 'image':
          return await this.convertImageToPdf(file)
        case 'text':
          return await this.convertTextToPdf(file)
        case 'pdf':
          return { success: true, pdfFile: file } // Already PDF
        default:
          return await this.convertGenericToPdf(file)
      }
    } catch (error) {
      return {
        success: false,
        error: `Erreur lors de la conversion: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      }
    }
  }

  /**
   * Convert multiple files to PDFs
   */
  static async convertMultipleFiles(files: File[]): Promise<ConversionResult[]> {
    const results: ConversionResult[] = []
    
    for (const file of files) {
      const result = await this.convertToPdf(file)
      results.push(result)
    }
    
    return results
  }

  /**
   * Determine file type based on extension
   */
  private static getFileType(file: File): string {
    const extension = file.name.toLowerCase().split('.').pop() || ''
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
      return 'image'
    }
    if (['txt', 'csv'].includes(extension)) {
      return 'text'
    }
    if (extension === 'pdf') {
      return 'pdf'
    }
    return 'generic'
  }

  /**
   * Convert image files to PDF
   */
  private static async convertImageToPdf(file: File): Promise<ConversionResult> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const img = new Image()
          img.onload = () => {
            const pdf = new jsPDF()
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')!
            
            // Calculate dimensions to fit page while maintaining aspect ratio
            const pageWidth = pdf.internal.pageSize.getWidth()
            const pageHeight = pdf.internal.pageSize.getHeight()
            const margin = 10
            
            const maxWidth = pageWidth - (margin * 2)
            const maxHeight = pageHeight - (margin * 2)
            
            let { width, height } = img
            const aspectRatio = width / height
            
            // Scale image to fit page while maintaining aspect ratio
            if (width > maxWidth) {
              width = maxWidth
              height = width / aspectRatio
            }
            if (height > maxHeight) {
              height = maxHeight
              width = height * aspectRatio
            }
            
            // Use maximum resolution for highest quality
            const maxDimension = Math.max(img.width, img.height)
            const scale = maxDimension < 2000 ? 3 : maxDimension < 1500 ? 2.5 : 2
            
            canvas.width = img.width * scale
            canvas.height = img.height * scale
            
            // Maximum quality settings
            ctx.imageSmoothingEnabled = true
            ctx.imageSmoothingQuality = 'high'
            ctx.filter = 'none'
            
            // Draw image at maximum resolution
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            
            // Use PNG for lossless quality, fallback to max quality JPEG
            let imgData
            try {
              imgData = canvas.toDataURL('image/png')
              // If PNG is too large, use maximum quality JPEG
              if (imgData.length > 10000000) { // 10MB limit
                imgData = canvas.toDataURL('image/jpeg', 1.0)
              }
            } catch {
              imgData = canvas.toDataURL('image/jpeg', 1.0)
            }
            
            const format = imgData.startsWith('data:image/png') ? 'PNG' : 'JPEG'
            pdf.addImage(imgData, format, margin, margin, width, height)
            
            const pdfBlob = pdf.output('blob')
            const pdfFile = new File([pdfBlob], `${file.name.split('.')[0]}.pdf`, {
              type: 'application/pdf'
            })
            
            resolve({ success: true, pdfFile })
          }
          
          img.onerror = () => {
            resolve({ success: false, error: 'Erreur lors du chargement de l\'image' })
          }
          
          img.src = e.target?.result as string
        } catch (error) {
          resolve({ success: false, error: 'Erreur lors de la conversion de l\'image' })
        }
      }
      
      reader.onerror = () => {
        resolve({ success: false, error: 'Erreur lors de la lecture du fichier' })
      }
      
      reader.readAsDataURL(file)
    })
  }

  /**
   * Convert text files to PDF
   */
  private static async convertTextToPdf(file: File): Promise<ConversionResult> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string
          const pdf = new jsPDF()
          
          const pageWidth = pdf.internal.pageSize.getWidth()
          const margin = 20
          const maxWidth = pageWidth - (margin * 2)
          
          // Split text into lines that fit the page width
          const lines = pdf.splitTextToSize(text, maxWidth)
          
          pdf.setFontSize(12)
          pdf.text(lines, margin, margin)
          
          const pdfBlob = pdf.output('blob')
          const pdfFile = new File([pdfBlob], `${file.name.split('.')[0]}.pdf`, {
            type: 'application/pdf'
          })
          
          resolve({ success: true, pdfFile })
        } catch (error) {
          resolve({ success: false, error: 'Erreur lors de la conversion du texte' })
        }
      }
      
      reader.onerror = () => {
        resolve({ success: false, error: 'Erreur lors de la lecture du fichier texte' })
      }
      
      reader.readAsText(file)
    })
  }

  /**
   * Convert generic files to PDF (creates a PDF with file info)
   */
  private static async convertGenericToPdf(file: File): Promise<ConversionResult> {
    try {
      const pdf = new jsPDF()
      const margin = 20
      
      pdf.setFontSize(16)
      pdf.text('Document converti', margin, margin)
      
      pdf.setFontSize(12)
      pdf.text(`Nom du fichier: ${file.name}`, margin, margin + 20)
      pdf.text(`Taille: ${this.formatFileSize(file.size)}`, margin, margin + 35)
      pdf.text(`Type: ${file.type || 'Non spécifié'}`, margin, margin + 50)
      pdf.text(`Date de conversion: ${new Date().toLocaleString('fr-FR')}`, margin, margin + 65)
      
      pdf.setFontSize(10)
      pdf.text('Note: Ce fichier a été automatiquement converti en PDF.', margin, margin + 90)
      pdf.text('Le contenu original n\'a pas pu être préservé pour ce type de fichier.', margin, margin + 105)
      
      const pdfBlob = pdf.output('blob')
      const pdfFile = new File([pdfBlob], `${file.name.split('.')[0]}.pdf`, {
        type: 'application/pdf'
      })
      
      return { success: true, pdfFile }
    } catch (error) {
      return { success: false, error: 'Erreur lors de la conversion générique' }
    }
  }

  /**
   * Format file size for display
   */
  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}