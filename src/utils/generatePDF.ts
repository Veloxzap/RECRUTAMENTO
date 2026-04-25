import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import type { Candidate } from '../types'

export const generateCandidatesPDF = (candidates: Candidate[], filters: any) => {
  const doc = new jsPDF('l', 'mm', 'a4')
  const dateStr = format(new Date(), 'dd-MM-yyyy')
  const primaryColor: [number, number, number] = [30, 58, 95] // #1E3A5F

  // Header background
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.rect(0, 0, 297, 25, 'F')

  // Header Title
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('Relatório de Candidatos', 15, 16)

  // Subtitle
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 240, 16)

  // Filters info
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.setFontSize(9)
  doc.text(`Filtros ativos: Status: ${filters.status || 'Todos'} | Resultado: ${filters.result || 'Todos'} | Função: ${filters.job || 'Todas'}`, 15, 32)

  const tableData = candidates.map((c, index) => [
    index + 1,
    c.name,
    c.contact,
    c.job_position,
    c.work_location?.name || '-',
    c.test_date ? format(new Date(c.test_date), 'dd/MM/yyyy') : '-',
    c.current_status,
    c.test_result,
    c.should_hire ? 'v' : 'x'
  ])

  autoTable(doc, {
    startY: 38,
    head: [['#', 'Nome', 'Contato', 'Função', 'Atuação', 'Data Teste', 'Situação', 'Resultado', 'Contratar']],
    body: tableData,
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'left'
    },
    styles: {
      fontSize: 8,
      cellPadding: 3
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] // #F8FAFC
    },
    columnStyles: {
      8: { halign: 'center', fontStyle: 'bold' } // Contratar column
    },
    didParseCell: (data) => {
      // Color coding for Agendamento (Situação)
      if (data.section === 'body' && data.column.index === 6) {
        const val = data.cell.raw as string
        if (val === 'Sim') data.cell.styles.textColor = [124, 58, 237] // Purple
        if (val === 'Não') data.cell.styles.textColor = [100, 116, 139] // Slate
      }
      
      // Color coding for Resultado
      if (data.section === 'body' && data.column.index === 7) {
        const val = data.cell.raw as string
        if (val === 'Aprovado') data.cell.styles.textColor = [16, 185, 129] // Emerald
        if (val === 'Reprovado') data.cell.styles.textColor = [239, 68, 68] // Red
        if (val === 'Aguardando') data.cell.styles.textColor = [245, 158, 11] // Amber
      }
      
      // Color coding for Contratar
      if (data.section === 'body' && data.column.index === 8) {
        const val = data.cell.raw as string
        if (val === 'v') {
          data.cell.text = ['✓']
          data.cell.styles.textColor = [16, 185, 129]
        } else {
          data.cell.text = ['✗']
          data.cell.styles.textColor = [239, 68, 68]
        }
      }
    },
    didDrawPage: () => {
      // Footer
      const str = `Página ${doc.getNumberOfPages()}`
      doc.setFontSize(8)
      doc.setTextColor(150)
      doc.setDrawColor(200)
      doc.line(15, 285, 282, 285)
      doc.text('Recrutamento HM - Documento Confidencial', 15, 200) // This needs adjustment for A4 landscape
      // Let's use internal page height
      const pageHeight = doc.internal.pageSize.height
      doc.text('Recrutamento HM - Documento Confidencial', 15, pageHeight - 10)
      doc.text(str, 270, pageHeight - 10)
    }
  })

  // Summary box on last page
  const finalY = (doc as any).lastAutoTable.finalY + 10
  if (finalY < 180) {
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.setFillColor(250, 250, 250)
    doc.roundedRect(15, finalY, 100, 30, 3, 3, 'FD')
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.setFont('helvetica', 'bold')
    doc.text('Resumo do Relatório', 20, finalY + 7)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text(`Total de Candidatos: ${candidates.length}`, 20, finalY + 15)
    doc.text(`Aprovados: ${candidates.filter(c => c.test_result === 'Aprovado').length}`, 20, finalY + 20)
    doc.text(`Contratar: ${candidates.filter(c => c.should_hire).length}`, 20, finalY + 25)
  }

  doc.save(`relatorio-candidatos-${dateStr}.pdf`)
}
