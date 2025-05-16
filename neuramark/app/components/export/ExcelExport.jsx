'use client'

import * as XLSX from 'xlsx'

export default function ExcelExport({ data, fileName }) {
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Progress")
    XLSX.writeFile(wb, `${fileName}.xlsx`)
  }

  return (
    <button 
      onClick={exportToExcel}
      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors ml-2"
    >
      Export as Excel
    </button>
  )
}