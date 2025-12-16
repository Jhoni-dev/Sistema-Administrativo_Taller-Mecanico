import ExcelJS from "exceljs";

interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
  numFmt?: string;
  alignment?: "left" | "center" | "right";
  isDate?: boolean;
  dateFormat?: "short" | "long" | "datetime" | "time";
}

interface StatBox {
  title: string;
  value: string | number;
  description?: string;
  bgColor?: string;
  textColor?: string;
}

interface ChartData {
  categories: string[];
  values: number[];
  title?: string;
  type?: "bar" | "column" | "line" | "pie" | "doughnut";
  position?: {
    row: number;
    col: number;
  };
  size?: {
    width: number;
    height: number;
  };
}

interface ExcelExporterOptions {
  data: any[];
  columns: ExcelColumn[];
  fileName: string;
  sheetName?: string;
  title?: string;
  subtitle?: string;
  headerStyle?: {
    bgColor?: string;
    textColor?: string;
    fontSize?: number;
    bold?: boolean;
  };
  rowStyle?: {
    alternateColors?: boolean;
    evenRowColor?: string;
    oddRowColor?: string;
  };
  rowHeight?: number;
  headerHeight?: number;
  statistics?: StatBox[];
  charts?: ChartData[];
  includeStatistics?: boolean;
  includeCharts?: boolean;
  pagination?: {
    enabled: boolean;
    rowsPerPage?: number;
    createIndex?: boolean;
  };
  autoFilter?: boolean;
  freezeHeader?: boolean;
}

class ExcelExporter {
  private workbook: ExcelJS.Workbook;
  private worksheet: ExcelJS.Worksheet;
  private options: ExcelExporterOptions;

  constructor(options: ExcelExporterOptions) {
    this.options = {
      sheetName: "Hoja1",
      headerStyle: {
        bgColor: "FF4B5563",
        textColor: "FFFFFFFF",
        fontSize: 12,
        bold: true,
      },
      rowStyle: {
        alternateColors: true,
        evenRowColor: "FFFFFFFF",
        oddRowColor: "FFF3F4F6",
      },
      rowHeight: 20,
      headerHeight: 25,
      includeStatistics: false,
      includeCharts: false,
      statistics: [],
      charts: [],
      autoFilter: true,
      freezeHeader: true,
      pagination: {
        enabled: false,
        rowsPerPage: 1000,
        createIndex: true,
      },
      ...options,
    };

    this.workbook = new ExcelJS.Workbook();
    this.worksheet = this.workbook.addWorksheet(
      this.options.sheetName || "Hoja1"
    );
  }

  private setupColumns(): void {
    this.worksheet.columns = this.options.columns.map((col) => ({
      header: col.header,
      key: col.key,
      width: col.width || 15,
    }));
  }

  private formatDate(
    value: any,
    format?: "short" | "long" | "datetime" | "time"
  ): string {
    if (!value) return "";

    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return value;

      const options: Intl.DateTimeFormatOptions = {};

      switch (format) {
        case "short":
          return date.toLocaleDateString("es-ES");

        case "long":
          options.day = "2-digit";
          options.month = "long";
          options.year = "numeric";
          return date.toLocaleDateString("es-ES", options);

        case "datetime":
          return (
            date.toLocaleDateString("es-ES") +
            " " +
            date.toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
            })
          );

        case "time":
          return date.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          });

        default:
          return date.toLocaleDateString("es-ES");
      }
    } catch (error) {
      return value;
    }
  }

  private addDocumentTitle(): number {
    let currentRow = 1;

    if (this.options.title) {
      const titleCell = this.worksheet.getCell(currentRow, 1);
      titleCell.value = this.options.title;
      titleCell.font = {
        bold: true,
        size: 18,
        color: { argb: "FF1F2937" },
      };
      titleCell.alignment = {
        vertical: "middle",
        horizontal: "left",
      };
      this.worksheet.getRow(currentRow).height = 30;

      const numCols = Math.max(this.options.columns.length, 8);
      this.worksheet.mergeCells(currentRow, 1, currentRow, numCols);

      currentRow += 1;
    }

    if (this.options.subtitle) {
      const subtitleCell = this.worksheet.getCell(currentRow, 1);
      subtitleCell.value = this.options.subtitle;
      subtitleCell.font = {
        size: 12,
        color: { argb: "FF6B7280" },
      };
      subtitleCell.alignment = {
        vertical: "middle",
        horizontal: "left",
      };
      this.worksheet.getRow(currentRow).height = 20;

      const numCols = Math.max(this.options.columns.length, 8);
      this.worksheet.mergeCells(currentRow, 1, currentRow, numCols);

      currentRow += 2;
    } else if (this.options.title) {
      currentRow += 1;
    }

    return currentRow;
  }

  private addStatistics(startRow: number): number {
    if (
      !this.options.includeStatistics ||
      !this.options.statistics ||
      this.options.statistics.length === 0
    ) {
      return startRow;
    }

    let currentRow = startRow;
    const statsPerRow = 5;
    const stats = this.options.statistics;
    const boxWidth = 2;
    const boxHeight = 3;

    for (let i = 0; i < stats.length; i += statsPerRow) {
      const rowStats = stats.slice(i, i + statsPerRow);

      rowStats.forEach((stat, index) => {
        const startCol = 1 + index * (boxWidth + 1);
        const endCol = startCol + boxWidth - 1;
        const startRowBox = currentRow;
        const endRowBox = currentRow + boxHeight - 1;

        for (let row = startRowBox; row <= endRowBox; row++) {
          for (let col = startCol; col <= endCol; col++) {
            const cell = this.worksheet.getCell(row, col);
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: stat.bgColor || "FFF9FAFB" },
            };
            cell.border = {
              top: { style: "thin", color: { argb: "FFE5E7EB" } },
              left: { style: "thin", color: { argb: "FFE5E7EB" } },
              bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
              right: { style: "thin", color: { argb: "FFE5E7EB" } },
            };
          }
        }

        this.worksheet.mergeCells(startRowBox, startCol, startRowBox, endCol);
        const titleCell = this.worksheet.getCell(startRowBox, startCol);
        titleCell.value = stat.title;
        titleCell.font = {
          bold: false,
          size: 9,
          color: { argb: stat.textColor || "FF6B7280" },
        };
        titleCell.alignment = {
          vertical: "middle",
          horizontal: "center",
        };

        this.worksheet.mergeCells(
          startRowBox + 1,
          startCol,
          startRowBox + 1,
          endCol
        );
        const valueCell = this.worksheet.getCell(startRowBox + 1, startCol);
        valueCell.value = stat.value;
        valueCell.font = {
          bold: true,
          size: 20,
          color: { argb: stat.textColor || "FF1F2937" },
        };
        valueCell.alignment = {
          vertical: "middle",
          horizontal: "center",
        };

        if (stat.description) {
          this.worksheet.mergeCells(
            startRowBox + 2,
            startCol,
            startRowBox + 2,
            endCol
          );
          const descCell = this.worksheet.getCell(startRowBox + 2, startCol);
          descCell.value = stat.description;
          descCell.font = {
            size: 8,
            color: { argb: "FF9CA3AF" },
          };
          descCell.alignment = {
            vertical: "middle",
            horizontal: "center",
          };
        }

        this.worksheet.getRow(startRowBox + 1).height = 30;
        this.worksheet.getRow(startRowBox).height = 18;
        this.worksheet.getRow(startRowBox + 2).height = 18;
      });

      currentRow += boxHeight + 1;
    }

    return currentRow + 1;
  }

  private addCharts(startRow: number): void {
    if (
      !this.options.includeCharts ||
      !this.options.charts ||
      this.options.charts.length === 0
    ) {
      return;
    }

    this.options.charts.forEach((chartData, index) => {
      const chartRow = startRow + index * 15;

      const titleCell = this.worksheet.getCell(chartRow, 1);
      titleCell.value = chartData.title || `Gráfico ${index + 1}`;
      titleCell.font = {
        bold: true,
        size: 14,
        color: { argb: "FF1F2937" },
      };
      titleCell.alignment = {
        vertical: "middle",
        horizontal: "left",
      };

      const dataStartRow = chartRow + 2;

      const headerCell1 = this.worksheet.getCell(dataStartRow, 1);
      headerCell1.value = "Categoría";
      headerCell1.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4B5563" },
      };
      headerCell1.font = { bold: true, size: 11, color: { argb: "FFFFFFFF" } };
      headerCell1.alignment = { vertical: "middle", horizontal: "center" };

      const headerCell2 = this.worksheet.getCell(dataStartRow, 2);
      headerCell2.value = "Valor";
      headerCell2.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4B5563" },
      };
      headerCell2.font = { bold: true, size: 11, color: { argb: "FFFFFFFF" } };
      headerCell2.alignment = { vertical: "middle", horizontal: "center" };

      const headerCell3 = this.worksheet.getCell(dataStartRow, 3);
      headerCell3.value = "Porcentaje";
      headerCell3.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4B5563" },
      };
      headerCell3.font = { bold: true, size: 11, color: { argb: "FFFFFFFF" } };
      headerCell3.alignment = { vertical: "middle", horizontal: "center" };

      const headerCell4 = this.worksheet.getCell(dataStartRow, 4);
      headerCell4.value = "Barra Visual";
      headerCell4.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4B5563" },
      };
      headerCell4.font = { bold: true, size: 11, color: { argb: "FFFFFFFF" } };
      headerCell4.alignment = { vertical: "middle", horizontal: "center" };

      const total = chartData.values.reduce((sum, val) => sum + val, 0);

      chartData.categories.forEach((category, i) => {
        const row = dataStartRow + 1 + i;
        const value = chartData.values[i];
        const percentage = ((value / total) * 100).toFixed(1) + "%";

        const catCell = this.worksheet.getCell(row, 1);
        catCell.value = category;
        catCell.alignment = { vertical: "middle", horizontal: "left" };
        catCell.border = {
          top: { style: "thin", color: { argb: "FFD1D5DB" } },
          left: { style: "thin", color: { argb: "FFD1D5DB" } },
          bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
          right: { style: "thin", color: { argb: "FFD1D5DB" } },
        };

        const valCell = this.worksheet.getCell(row, 2);
        valCell.value = value;
        valCell.alignment = { vertical: "middle", horizontal: "right" };
        valCell.numFmt = "#,##0";
        valCell.font = { bold: true };
        valCell.border = {
          top: { style: "thin", color: { argb: "FFD1D5DB" } },
          left: { style: "thin", color: { argb: "FFD1D5DB" } },
          bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
          right: { style: "thin", color: { argb: "FFD1D5DB" } },
        };

        const pctCell = this.worksheet.getCell(row, 3);
        pctCell.value = percentage;
        pctCell.alignment = { vertical: "middle", horizontal: "center" };
        pctCell.border = {
          top: { style: "thin", color: { argb: "FFD1D5DB" } },
          left: { style: "thin", color: { argb: "FFD1D5DB" } },
          bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
          right: { style: "thin", color: { argb: "FFD1D5DB" } },
        };

        const barCell = this.worksheet.getCell(row, 4);
        const barWidth = Math.round((value / total) * 20);
        barCell.value = "█".repeat(barWidth);
        barCell.font = {
          color: { argb: this.getColorForIndex(i) },
          size: 11,
        };
        barCell.alignment = { vertical: "middle", horizontal: "left" };
        barCell.border = {
          top: { style: "thin", color: { argb: "FFD1D5DB" } },
          left: { style: "thin", color: { argb: "FFD1D5DB" } },
          bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
          right: { style: "thin", color: { argb: "FFD1D5DB" } },
        };
      });

      this.worksheet.getColumn(1).width = 25;
      this.worksheet.getColumn(2).width = 15;
      this.worksheet.getColumn(3).width = 15;
      this.worksheet.getColumn(4).width = 30;
    });
  }

  private getColorForIndex(index: number): string {
    const colors = [
      "FF2563EB",
      "FFF59E0B",
      "FF10B981",
      "FFEF4444",
      "FF8B5CF6",
      "FFEC4899",
      "FF06B6D4",
      "FFF97316",
    ];
    return colors[index % colors.length];
  }

  private applyAutoFilter(headerRow: number): void {
    if (!this.options.autoFilter) return;

    const lastCol = this.options.columns.length;
    const lastRow = headerRow + this.options.data.length;

    this.worksheet.autoFilter = {
      from: { row: headerRow, column: 1 },
      to: { row: lastRow, column: lastCol },
    };
  }

  private freezeHeaderRow(headerRow: number): void {
    if (!this.options.freezeHeader) return;

    this.worksheet.views = [
      {
        state: "frozen",
        xSplit: 0,
        ySplit: headerRow,
        topLeftCell: `A${headerRow + 1}`,
        activeCell: `A${headerRow + 1}`,
      },
    ];
  }

  private createIndexSheet(
    pages: { name: string; startRow: number; endRow: number }[]
  ): void {
    if (!this.options.pagination?.createIndex || pages.length <= 1) return;

    // Crear la hoja de índice
    const indexSheet = this.workbook.addWorksheet("📑 Índice");

    const titleCell = indexSheet.getCell(1, 1);
    titleCell.value = "📑 ÍNDICE DE PÁGINAS";
    titleCell.font = { bold: true, size: 16, color: { argb: "FF1F2937" } };
    titleCell.alignment = { vertical: "middle", horizontal: "left" };
    indexSheet.getRow(1).height = 30;
    indexSheet.mergeCells(1, 1, 1, 4);

    const subtitleCell = indexSheet.getCell(2, 1);
    subtitleCell.value = `Total de registros: ${this.options.data.length} | Páginas: ${pages.length}`;
    subtitleCell.font = { size: 11, color: { argb: "FF6B7280" } };
    subtitleCell.alignment = { vertical: "middle", horizontal: "left" };
    indexSheet.getRow(2).height = 20;
    indexSheet.mergeCells(2, 1, 2, 4);

    const headerRow = 4;
    const headers = ["Página", "Nombre", "Filas", "Ir a"];
    headers.forEach((header, index) => {
      const cell = indexSheet.getCell(headerRow, index + 1);
      cell.value = header;
      cell.font = { bold: true, size: 11, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF374151" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
    indexSheet.getRow(headerRow).height = 25;

    pages.forEach((page, index) => {
      const row = headerRow + 1 + index;

      const pageCell = indexSheet.getCell(row, 1);
      pageCell.value = index + 1;
      pageCell.alignment = { vertical: "middle", horizontal: "center" };
      pageCell.border = {
        top: { style: "thin", color: { argb: "FFD1D5DB" } },
        left: { style: "thin", color: { argb: "FFD1D5DB" } },
        bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
        right: { style: "thin", color: { argb: "FFD1D5DB" } },
      };

      const nameCell = indexSheet.getCell(row, 2);
      nameCell.value = page.name;
      nameCell.alignment = { vertical: "middle", horizontal: "left" };
      nameCell.border = {
        top: { style: "thin", color: { argb: "FFD1D5DB" } },
        left: { style: "thin", color: { argb: "FFD1D5DB" } },
        bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
        right: { style: "thin", color: { argb: "FFD1D5DB" } },
      };

      const rowsCell = indexSheet.getCell(row, 3);
      const rowCount = page.endRow - page.startRow + 1;
      rowsCell.value = `${rowCount} registros`;
      rowsCell.alignment = { vertical: "middle", horizontal: "center" };
      rowsCell.border = {
        top: { style: "thin", color: { argb: "FFD1D5DB" } },
        left: { style: "thin", color: { argb: "FFD1D5DB" } },
        bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
        right: { style: "thin", color: { argb: "FFD1D5DB" } },
      };

      const linkCell = indexSheet.getCell(row, 4);
      linkCell.value = {
        text: "Ir a página →",
        hyperlink: `#'${page.name}'!A1`,
      };
      linkCell.font = { color: { argb: "FF2563EB" }, underline: true };
      linkCell.alignment = { vertical: "middle", horizontal: "center" };
      linkCell.border = {
        top: { style: "thin", color: { argb: "FFD1D5DB" } },
        left: { style: "thin", color: { argb: "FFD1D5DB" } },
        bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
        right: { style: "thin", color: { argb: "FFD1D5DB" } },
      };

      if (index % 2 === 1) {
        [pageCell, nameCell, rowsCell, linkCell].forEach((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF9FAFB" },
          };
        });
      }
    });

    indexSheet.getColumn(1).width = 10;
    indexSheet.getColumn(2).width = 30;
    indexSheet.getColumn(3).width = 20;
    indexSheet.getColumn(4).width = 20;

    // Mover la hoja índice al principio
    // El método correcto en ExcelJS es remover todas las hojas y volver a agregarlas en el orden correcto
    const allWorksheets = this.workbook.worksheets.slice();
    
    // Remover todas las hojas del workbook
    allWorksheets.forEach(ws => {
      this.workbook.removeWorksheet(ws.id);
    });
    
    // Primero agregar la hoja índice
    const newIndexSheet = this.workbook.addWorksheet(indexSheet.name);
    this.copyWorksheetContent(indexSheet, newIndexSheet);
    
    // Luego agregar el resto de hojas
    allWorksheets.forEach(ws => {
      if (ws.name !== indexSheet.name) {
        const newSheet = this.workbook.addWorksheet(ws.name);
        this.copyWorksheetContent(ws, newSheet);
      }
    });
  }

  private copyWorksheetContent(source: ExcelJS.Worksheet, target: ExcelJS.Worksheet): void {
    // Copiar columnas
    if (source.columns && source.columns.length > 0) {
      target.columns = source.columns.map((col: any) => ({
        header: col.header,
        key: col.key,
        width: col.width,
      }));
    }

    // Copiar filas y celdas
    source.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      const targetRow = target.getRow(rowNumber);
      targetRow.height = row.height;

      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const targetCell = targetRow.getCell(colNumber);
        
        // Copiar valor
        targetCell.value = cell.value;
        
        // Copiar estilo
        if (cell.style) {
          targetCell.style = {
            ...cell.style,
            // Asegurar que los objetos anidados también se copien
            font: cell.font ? { ...cell.font } : undefined,
            fill: cell.fill ? { ...cell.fill } : undefined,
            border: cell.border ? { ...cell.border } : undefined,
            alignment: cell.alignment ? { ...cell.alignment } : undefined,
            numFmt: cell.numFmt,
          };
        }
      });
    });

    // Copiar merge cells
    if (source.model && source.model.merges) {
      source.model.merges.forEach((merge: string) => {
        target.mergeCells(merge);
      });
    }

    // Copiar autofilter
    if (source.autoFilter) {
      target.autoFilter = source.autoFilter;
    }

    // Copiar views (freeze panes, etc)
    if (source.views) {
      target.views = source.views;
    }
  }

  private styleHeader(startRow: number = 1): void {
    const headerRow = this.worksheet.getRow(startRow);
    headerRow.height = this.options.headerHeight ?? 25;

    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: this.options.headerStyle?.bgColor || "FF4B5563" },
      };
      cell.font = {
        color: { argb: this.options.headerStyle?.textColor || "FFFFFFFF" },
        bold: this.options.headerStyle?.bold ?? true,
        size: this.options.headerStyle?.fontSize || 12,
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        indent: 1,
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  }

  private addDataRows(startRow: number = 1): void {
    const headerRow = this.worksheet.getRow(startRow);
    this.options.columns.forEach((col, index) => {
      headerRow.getCell(index + 1).value = col.header;
    });

    this.options.data.forEach((item, index) => {
      const rowData: any = {};
      this.options.columns.forEach((col) => {
        let value = item[col.key] ?? "";

        if (col.isDate && value) {
          value = this.formatDate(value, col.dateFormat);
        }

        rowData[col.key] = value;
      });

      const row = this.worksheet.addRow(rowData);
      row.height = this.options.rowHeight ?? 20;

      let fillColor = "FFFFFFFF";
      if (this.options.rowStyle?.alternateColors) {
        fillColor =
          index % 2 === 0
            ? this.options.rowStyle.evenRowColor || "FFFFFFFF"
            : this.options.rowStyle.oddRowColor || "FFF3F4F6";
      }

      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const column = this.options.columns[colNumber - 1];

        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: fillColor },
        };

        cell.border = {
          top: { style: "thin", color: { argb: "FFD1D5DB" } },
          left: { style: "thin", color: { argb: "FFD1D5DB" } },
          bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
          right: { style: "thin", color: { argb: "FFD1D5DB" } },
        };

        const alignment: any = {
          vertical: "middle",
          indent: 1,
        };

        if (column?.alignment) {
          alignment.horizontal = column.alignment;
        }

        cell.alignment = alignment;

        if (column?.numFmt) {
          cell.numFmt = column.numFmt;
        }
      });
    });
  }

  async export(): Promise<void> {
    try {
      const isPaginated =
        this.options.pagination?.enabled &&
        this.options.data.length >
          (this.options.pagination?.rowsPerPage || 1000);

      if (isPaginated) {
        await this.exportPaginated();
      } else {
        await this.exportSingle();
      }
    } catch (error) {
      console.error("Error al exportar Excel:", error);
      throw error;
    }
  }

  private async exportSingle(): Promise<void> {
    this.setupColumns();

    let currentRow = this.addDocumentTitle();

    const tableStartRow = this.addStatistics(currentRow);

    this.addDataRows(tableStartRow);

    this.styleHeader(tableStartRow);

    this.applyAutoFilter(tableStartRow);

    this.freezeHeaderRow(tableStartRow);

    const chartStartRow = tableStartRow + this.options.data.length + 3;

    this.addCharts(chartStartRow);

    await this.downloadFile();
  }

  private async exportPaginated(): Promise<void> {
    const rowsPerPage = this.options.pagination?.rowsPerPage || 1000;
    const totalPages = Math.ceil(this.options.data.length / rowsPerPage);
    const pages: { name: string; startRow: number; endRow: number }[] = [];

    const originalSheet = this.worksheet;
    this.workbook.removeWorksheet(originalSheet.id);

    for (let pageNum = 0; pageNum < totalPages; pageNum++) {
      const start = pageNum * rowsPerPage;
      const end = Math.min(start + rowsPerPage, this.options.data.length);
      const pageData = this.options.data.slice(start, end);

      // Crear nombre de hoja sin caracteres prohibidos
      const baseName = this.options.sheetName || "Datos";
      const sheetName =
        totalPages > 1
          ? `${baseName} - Pág ${pageNum + 1} de ${totalPages}`
          : baseName;

      this.worksheet = this.workbook.addWorksheet(sheetName);

      this.setupColumns();

      let currentRow = 1;
      if (pageNum === 0) {
        currentRow = this.addDocumentTitle();

        if (this.options.includeStatistics) {
          currentRow = this.addStatistics(currentRow);
        }
      } else {
        const titleCell = this.worksheet.getCell(1, 1);
        titleCell.value = `${this.options.title || "Datos"} - Página ${pageNum + 1} de ${totalPages}`;
        titleCell.font = {
          bold: true,
          size: 12,
          color: { argb: "FF1F2937" },
        };
        this.worksheet.getRow(1).height = 25;
        currentRow = 3;
      }

      const originalData = this.options.data;
      this.options.data = pageData;

      const tableStartRow = currentRow;
      this.addDataRows(tableStartRow);

      this.styleHeader(tableStartRow);

      this.applyAutoFilter(tableStartRow);

      this.freezeHeaderRow(tableStartRow);

      this.options.data = originalData;

      pages.push({
        name: sheetName,
        startRow: start + 1,
        endRow: end,
      });

      if (pageNum === totalPages - 1 && this.options.includeCharts) {
        const chartStartRow = tableStartRow + pageData.length + 3;
        this.addCharts(chartStartRow);
      }
    }

    // Crear hoja de índice
    if (this.options.pagination?.createIndex && pages.length > 1) {
      this.createIndexSheet(pages);
    }

    await this.downloadFile();
  }

  private async downloadFile(): Promise<void> {
    const fecha = new Date().toISOString().split("T")[0];
    const fileName = this.options.fileName.replace("{date}", fecha);
    const buffer = await this.workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}

export const useExcelExport = () => {
  const exportToExcel = async (options: ExcelExporterOptions) => {
    const exporter = new ExcelExporter(options);
    await exporter.export();
  };

  return { exportToExcel };
};

export const exportToExcel = async (options: ExcelExporterOptions) => {
  const exporter = new ExcelExporter(options);
  await exporter.export();
};

export default ExcelExporter;