'use client'

import { useRef } from 'react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export default function PDFExport({ contentRef, fileName }) {
  const exportToPDF = async () => {
    if (!contentRef.current) return

    const canvas = await html2canvas(contentRef.current)
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`${fileName}.pdf`)
  }

  return (
    <button 
      onClick={exportToPDF}
      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
    >
      Export as PDF
    </button>
  )
}