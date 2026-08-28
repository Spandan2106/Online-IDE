import { jsPDF } from 'jspdf';
import { SupportedLanguage, ExecutionResult, TerminalLogEntry } from '../types';

export interface PdfExportOptions {
  title?: string;
  filename?: string;
  language: SupportedLanguage;
  code: string;
  result: ExecutionResult;
  theme?: 'light' | 'dark' | 'monochrome';
  orientation?: 'portrait' | 'landscape';
  includeCode?: boolean;
  includeTerminal?: boolean;
  customNotes?: string;
}

export function generateAndDownloadPdf(options: PdfExportOptions): string {
  const {
    title = `Code & Interactive Terminal Report - ${options.language.toUpperCase()}`,
    filename = `terminal_report_${options.language}_${Date.now()}.pdf`,
    language,
    code,
    result,
    theme = 'light',
    orientation = 'portrait',
    includeCode = true,
    includeTerminal = true,
    customNotes = '',
  } = options;

  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  let currentY = margin;

  // Colors based on theme
  const isDark = theme === 'dark';
  const isMono = theme === 'monochrome';

  const brandColor = isMono ? [40, 40, 40] : isDark ? [14, 165, 233] : [2, 132, 199];
  const primaryTextColor = isDark ? [240, 240, 240] : [30, 41, 59];
  const secondaryTextColor = isDark ? [148, 163, 184] : [100, 116, 139];
  const cardBg = isDark ? [30, 41, 59] : [248, 250, 252];
  const cardBorder = isDark ? [51, 65, 85] : [226, 232, 240];
  const codeBg = isDark ? [15, 23, 42] : [241, 245, 249];

  // Helper to add background on dark mode
  if (isDark) {
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
  }

  // Helper to check page break
  function ensureSpace(neededHeight: number) {
    if (currentY + neededHeight > pageHeight - margin - 10) {
      doc.addPage();
      if (isDark) {
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
      }
      currentY = margin;
    }
  }

  // 1. Header Banner
  doc.setFillColor(brandColor[0], brandColor[1], brandColor[2]);
  doc.roundedRect(margin, currentY, contentWidth, 20, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13.5);
  doc.text(title.slice(0, 50), margin + 6, currentY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const dateStr = new Date().toLocaleString();
  doc.text(`SyntaxHub IDE • Interactive Terminal Report • ${dateStr}`, margin + 6, currentY + 15);

  const langBadge = language.toUpperCase();
  const badgeWidth = doc.getTextWidth(langBadge) + 8;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(pageWidth - margin - badgeWidth - 6, currentY + 5, badgeWidth, 9, 1.5, 1.5, 'F');
  doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(langBadge, pageWidth - margin - badgeWidth - 2, currentY + 11);

  currentY += 25;

  // 2. Metadata / Execution Summary Cards
  const colWidth = (contentWidth - 6) / 3;
  const metaHeight = 14;

  const statusLabel =
    result.status === 'success'
      ? 'SUCCESS'
      : result.status === 'compile_error'
      ? 'COMPILE ERROR'
      : result.status === 'runtime_error'
      ? 'RUNTIME ERROR'
      : result.status === 'system_error'
      ? 'SYSTEM ERROR'
      : 'COMPLETED';

  const statusColor =
    result.status === 'success'
      ? [22, 163, 74]
      : result.status === 'compile_error' || result.status === 'runtime_error'
      ? [220, 38, 38]
      : [100, 116, 139];

  // Card 1: Language & Compiler
  doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.roundedRect(margin, currentY, colWidth, metaHeight, 1.5, 1.5, 'FD');
  doc.setTextColor(secondaryTextColor[0], secondaryTextColor[1], secondaryTextColor[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('LANGUAGE & RUNTIME', margin + 4, currentY + 5);
  doc.setTextColor(primaryTextColor[0], primaryTextColor[1], primaryTextColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  const compName = language === 'c' ? 'GCC 12' : language === 'cpp' ? 'G++ 12' : language === 'java' ? 'Java 17 LTS' : 'Python 3.10';
  doc.text(`${language.toUpperCase()} (${compName})`, margin + 4, currentY + 11);

  // Card 2: Status
  doc.roundedRect(margin + colWidth + 3, currentY, colWidth, metaHeight, 1.5, 1.5, 'FD');
  doc.setTextColor(secondaryTextColor[0], secondaryTextColor[1], secondaryTextColor[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('EXECUTION STATUS', margin + colWidth + 7, currentY + 5);
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(statusLabel, margin + colWidth + 7, currentY + 11);

  // Card 3: Execution Time
  doc.roundedRect(margin + (colWidth + 3) * 2, currentY, colWidth, metaHeight, 1.5, 1.5, 'FD');
  doc.setTextColor(secondaryTextColor[0], secondaryTextColor[1], secondaryTextColor[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('EXECUTION TIME', margin + (colWidth + 3) * 2 + 4, currentY + 5);
  doc.setTextColor(primaryTextColor[0], primaryTextColor[1], primaryTextColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  const timeStr = `${result.executionTimeMs ?? 0} ms${result.compilationTimeMs ? ` (build: ${result.compilationTimeMs}ms)` : ''}`;
  doc.text(timeStr, margin + (colWidth + 3) * 2 + 4, currentY + 11);

  currentY += metaHeight + 6;

  // Custom Notes if present
  if (customNotes.trim()) {
    ensureSpace(16);
    doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
    doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
    doc.roundedRect(margin, currentY, contentWidth, 12, 1.5, 1.5, 'FD');
    doc.setTextColor(secondaryTextColor[0], secondaryTextColor[1], secondaryTextColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('NOTES:', margin + 4, currentY + 5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(primaryTextColor[0], primaryTextColor[1], primaryTextColor[2]);
    doc.text(customNotes.slice(0, 120), margin + 20, currentY + 5);
    currentY += 16;
  }

  // 3. Source Code Section
  if (includeCode && code) {
    ensureSpace(25);
    doc.setTextColor(primaryTextColor[0], primaryTextColor[1], primaryTextColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text(`1. Source Code (${language.toUpperCase()})`, margin, currentY);
    currentY += 4;

    const lines = code.split('\n');
    doc.setFont('courier', 'normal');
    doc.setFontSize(8);

    const lineHeight = 3.6;
    const padding = 4;

    let lineIndex = 0;
    while (lineIndex < lines.length) {
      const remainingPageSpace = pageHeight - margin - 15 - currentY;
      const linesForThisPage = Math.max(3, Math.floor((remainingPageSpace - padding * 2) / lineHeight));
      const chunk = lines.slice(lineIndex, lineIndex + linesForThisPage);
      const chunkHeight = chunk.length * lineHeight + padding * 2;

      doc.setFillColor(codeBg[0], codeBg[1], codeBg[2]);
      doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
      doc.roundedRect(margin, currentY, contentWidth, chunkHeight, 1.5, 1.5, 'FD');

      let textY = currentY + padding + 2.5;
      for (let i = 0; i < chunk.length; i++) {
        const lineNum = String(lineIndex + i + 1).padStart(3, ' ');
        doc.setTextColor(secondaryTextColor[0], secondaryTextColor[1], secondaryTextColor[2]);
        doc.text(`${lineNum} | `, margin + 3, textY);

        doc.setTextColor(primaryTextColor[0], primaryTextColor[1], primaryTextColor[2]);
        const cleanLine = chunk[i].replace(/\t/g, '  ');
        doc.text(cleanLine.slice(0, 95), margin + 14, textY);
        textY += lineHeight;
      }

      lineIndex += linesForThisPage;
      currentY += chunkHeight + 5;

      if (lineIndex < lines.length) {
        doc.addPage();
        if (isDark) {
          doc.setFillColor(15, 23, 42);
          doc.rect(0, 0, pageWidth, pageHeight, 'F');
        }
        currentY = margin;
      }
    }
  }

  // 4. Interactive Terminal Session Output
  if (includeTerminal) {
    ensureSpace(25);
    doc.setTextColor(primaryTextColor[0], primaryTextColor[1], primaryTextColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text('2. Interactive Terminal Session (Inputs & Outputs)', margin, currentY);
    currentY += 4;

    // Compile transcript lines from history or stdout/stderr
    let transcriptLines: Array<{ text: string; isInput: boolean; isError: boolean; isSystem: boolean }> = [];

    if (result.history && result.history.length > 0) {
      for (const log of result.history) {
        const split = log.text.split('\n');
        for (let j = 0; j < split.length; j++) {
          const l = split[j];
          if (l || j < split.length - 1) {
            transcriptLines.push({
              text: l,
              isInput: log.type === 'stdin',
              isError: log.type === 'stderr',
              isSystem: log.type === 'system',
            });
          }
        }
      }
    } else {
      if (result.stdout) {
        for (const l of result.stdout.split('\n')) {
          transcriptLines.push({ text: l, isInput: false, isError: false, isSystem: false });
        }
      }
      if (result.stderr) {
        for (const l of result.stderr.split('\n')) {
          transcriptLines.push({ text: l, isInput: false, isError: true, isSystem: false });
        }
      }
    }

    if (transcriptLines.length === 0) {
      transcriptLines.push({ text: '(Terminal was idle / no output recorded)', isInput: false, isError: false, isSystem: true });
    }

    doc.setFont('courier', 'normal');
    doc.setFontSize(8);

    let lineIndex = 0;
    while (lineIndex < transcriptLines.length) {
      const remainingSpace = pageHeight - margin - 15 - currentY;
      const linesForThisPage = Math.max(3, Math.floor((remainingSpace - 8) / 3.8));
      const chunk = transcriptLines.slice(lineIndex, lineIndex + linesForThisPage);
      const chunkHeight = chunk.length * 3.8 + 6;

      doc.setFillColor(isDark ? 10 : 248, isDark ? 15 : 250, isDark ? 25 : 252);
      doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
      doc.roundedRect(margin, currentY, contentWidth, chunkHeight, 1.5, 1.5, 'FD');

      let textY = currentY + 4.5;
      for (const item of chunk) {
        if (item.isInput) {
          doc.setTextColor(217, 119, 6); // Amber for user input
          doc.text(`> ${item.text.slice(0, 92)}`, margin + 4, textY);
        } else if (item.isError) {
          doc.setTextColor(220, 38, 38); // Red for error
          doc.text(item.text.slice(0, 95), margin + 4, textY);
        } else if (item.isSystem) {
          doc.setTextColor(secondaryTextColor[0], secondaryTextColor[1], secondaryTextColor[2]);
          doc.text(item.text.slice(0, 95), margin + 4, textY);
        } else {
          doc.setTextColor(primaryTextColor[0], primaryTextColor[1], primaryTextColor[2]);
          doc.text(item.text.slice(0, 95), margin + 4, textY);
        }
        textY += 3.8;
      }

      lineIndex += linesForThisPage;
      currentY += chunkHeight + 5;

      if (lineIndex < transcriptLines.length) {
        doc.addPage();
        if (isDark) {
          doc.setFillColor(15, 23, 42);
          doc.rect(0, 0, pageWidth, pageHeight, 'F');
        }
        currentY = margin;
      }
    }
  }

  // Page Numbers and Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(secondaryTextColor[0], secondaryTextColor[1], secondaryTextColor[2]);
    doc.text('SyntaxHub Online IDE • C, C++, Java & Python Live Terminal', margin, pageHeight - 6);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 18, pageHeight - 6);
  }

  const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  doc.save(cleanFilename);

  return cleanFilename;
}
